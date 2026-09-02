// create-asaas-checkout
//
// Cria um pedido "pending" em public.orders e um Asaas Checkout
// hospedado (Pix + Cartão), retornando a URL de checkout pra o
// frontend redirecionar o cliente.
//
// SEGURANÇA (não negociável):
// - ASAAS_API_KEY só existe como secret desta function. Nunca é
//   enviada ao frontend, nunca aparece em resposta HTTP.
// - Nenhum dado de cartão (número, CVV, validade) passa por este
//   código em momento algum — o comprador digita tudo na própria
//   página hospedada da Asaas (POST /v3/checkouts → campo `link`).
// - O preço é SEMPRE relido de public.products aqui dentro; o valor
//   que o cliente manda (se mandar) é ignorado.
//
// Aceita tanto um carrinho com vários itens quanto um único produto:
//   { items: [{ product_id, quantity }, ...] }
//   ou
//   { product_id | slug, quantity? }   (atalho pra 1 item só)
//
// Comprador pode ser:
//   - um usuário Supabase Auth real (JWT no header Authorization)
//   - um convidado (identificado por buyer.email nesse caso)
//
// O corpo da requisição precisa trazer ao menos buyer.email para
// identificar o pedido de convidado. Dados de CPF, telefone, endereço e
// pagamento são coletados/validados diretamente no checkout hospedado
// pela Asaas.
//
// Secrets necessários (configurar em Project Settings → Edge Functions
// → Secrets, ou via painel de cada function):
//   ASAAS_API_KEY
//   ASAAS_BASE_URL            (ex: https://api-sandbox.asaas.com/v3)
//   SITE_URL                  (ex: https://nortisconcursos.com.br)
//   SUPABASE_URL              (já disponível automaticamente)
//   SUPABASE_SECRET_KEYS      (já disponível automaticamente — JSON com
//                              as chaves "secret" do novo sistema de API
//                              keys do Supabase, ex.: {"default": "sb_secret_..."}.
//                              Usamos só a chave "default". Sem fallback
//                              para a antiga SUPABASE_SERVICE_ROLE_KEY:
//                              ausência/formato inválido falha fechado.)
//   SALES_ENABLED             (obrigatório para vender de verdade)
//     - somente o valor exato "true" (sem diferenciar maiúsculas/
//       minúsculas, com espaços ao redor ignorados) habilita a criação
//       de pedidos e o checkout na Asaas;
//     - ausente, vazio, "false", "1", "yes" ou qualquer outro valor
//       mantém as vendas pausadas;
//     - fail-closed intencional: enquanto a entrega privada do PDF não
//       estiver pronta, é mais seguro bloquear por padrão do que
//       vender por engano.
//   SALES_QA_MODE_ENABLED     (opcional; somente para teste controlado)
//     - quando SALES_ENABLED não estiver "true", permite criar pedido e
//       itens sem chamar a Asaas se o request trouxer o header
//       x-nortis-qa-checkout-token com o valor exato de
//       SALES_QA_CHECKOUT_TOKEN;
//     - devolve uma URL mock local da Nortis, nunca uma página real de
//       pagamento;
//     - fail-closed: sem token forte configurado, sem header correto ou
//       com SALES_QA_MODE_ENABLED diferente de "true", continua pausado.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.110.0';

const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY') ?? '';
const ASAAS_BASE_URL = Deno.env.get('ASAAS_BASE_URL') ?? 'https://api-sandbox.asaas.com/v3';
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://nortisconcursos.com.br';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';

// SUPABASE_SECRET_KEYS chega como JSON (ex.: {"default": "sb_secret_..."}),
// pois um projeto pode ter mais de uma chave "secret". Extraímos só a
// "default". Qualquer formato inesperado (variável ausente, JSON
// inválido, campo ausente ou não-string) é tratado como ausência da
// chave — fail-closed, sem fallback para a SUPABASE_SERVICE_ROLE_KEY legacy.
function readDefaultKey(envVarName: string): string {
  const raw = Deno.env.get(envVarName);
  if (!raw) return '';

  try {
    const parsed = JSON.parse(raw);
    const value = parsed?.default;

    return typeof value === 'string' && value.trim().length > 0
      ? value.trim()
      : '';
  } catch {
    return '';
  }
}

const SUPABASE_SECRET_KEY = readDefaultKey('SUPABASE_SECRET_KEYS');

// A chave secret (opaca, não é JWT) só deve viajar no header apikey.
// Sem este wrapper, o client manda Authorization: Bearer <secret key>
// por padrão — comportamento correto para a antiga service_role (um
// JWT), mas não para o novo formato de chave. Remove o Authorization
// SOMENTE quando ele for exatamente "Bearer <secret key>"; qualquer
// outro Authorization (ex.: o JWT explícito de auth.getUser(token))
// passa intocado.
function createSecretKeyFetch(secretKey: string): typeof fetch {
  const nativeFetch = globalThis.fetch;

  return async (input, init) => {
    const headers = new Headers(init?.headers);
    const authorization = headers.get('Authorization');

    if (authorization === `Bearer ${secretKey}`) {
      headers.delete('Authorization');
    }

    return nativeFetch(input, {
      ...init,
      headers,
    });
  };
}

const SALES_ENABLED =
  (Deno.env.get('SALES_ENABLED') ?? '')
    .trim()
    .toLowerCase() === 'true';
const SALES_QA_MODE_ENABLED =
  (Deno.env.get('SALES_QA_MODE_ENABLED') ?? '')
    .trim()
    .toLowerCase() === 'true';
const SALES_QA_CHECKOUT_TOKEN = Deno.env.get('SALES_QA_CHECKOUT_TOKEN') ?? '';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-nortis-qa-checkout-token',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function isAuthorizedQaCheckout(req: Request): boolean {
  const token = SALES_QA_CHECKOUT_TOKEN.trim();
  if (!SALES_QA_MODE_ENABLED || token.length < 32) {
    return false;
  }

  return req.headers.get('x-nortis-qa-checkout-token') === token;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const isQaCheckout = !SALES_ENABLED && isAuthorizedQaCheckout(req);

  if (!SALES_ENABLED && !isQaCheckout) {
    return jsonResponse(
      {
        code: 'SALES_PAUSED',
        error: 'As vendas estão temporariamente pausadas durante o pré-lançamento da Nortis.',
      },
      503
    );
  }

  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    // Mensagem genérica de propósito — nunca revela qual variável está ausente.
    return jsonResponse({ error: 'Serviço temporariamente indisponível.' }, 500);
  }

  if (!ASAAS_API_KEY && !isQaCheckout) {
    return jsonResponse({ error: 'ASAAS_API_KEY não configurada no servidor.' }, 500);
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'JSON inválido.' }, 400);
  }

  // Normaliza items: aceita { items: [...] } ou o atalho { product_id/slug, quantity }
  const requestedItems: Array<{ product_id?: string; slug?: string; quantity?: number }> =
    Array.isArray(body?.items) && body.items.length > 0
      ? body.items
      : body?.product_id || body?.slug
        ? [{ product_id: body.product_id, slug: body.slug, quantity: body.quantity ?? 1 }]
        : [];

  const { buyer } = body ?? {};

  if (requestedItems.length === 0) {
    return jsonResponse({ error: 'Informe items[] ou product_id/slug.' }, 400);
  }

  // A Nortis precisa de e-mail para identificar pedidos de convidado.
  // O Checkout hospedado da Asaas coleta os demais dados do pagador.
  const REQUIRED_BUYER_FIELDS = ['email'];
  const missingBuyerFields = REQUIRED_BUYER_FIELDS.filter((field) => !buyer?.[field]);
  if (missingBuyerFields.length > 0) {
    return jsonResponse(
      { error: `Dados do comprador incompletos: ${missingBuyerFields.join(', ')}` },
      400
    );
  }

  // Cliente de servidor (chave secret) — sem sessão própria persistida;
  // a identidade do comprador, quando logado, vem sempre do JWT explícito
  // passado a auth.getUser(token) logo abaixo, nunca de estado de sessão
  // interno do client.
  const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: createSecretKeyFetch(SUPABASE_SECRET_KEY),
    },
  });

  // 1. Identifica o comprador: usuário logado (JWT) ou convidado (e-mail
  //    de buyer.email, já validado como obrigatório acima)
  let userId: string | null = null;
  const authHeader = req.headers.get('Authorization');
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const { data: userData } = await supabase.auth.getUser(token);
    userId = userData?.user?.id ?? null;
  }

  // 2. Resolve cada item contra o Supabase de verdade — nunca confia em
  //    preço/nome vindos do cliente.
  const resolvedItems: Array<{ product: any; quantity: number }> = [];

  for (const requested of requestedItems) {
    const quantity = Math.max(1, Number(requested.quantity) || 1);
    const query = supabase.from('products').select('*').eq('active', true);

    const { data: product, error } = requested.slug
      ? await query.eq('slug', requested.slug).maybeSingle()
      : await query.eq('id', requested.product_id).maybeSingle();

    if (error || !product) {
      return jsonResponse(
        { error: `Produto não encontrado ou indisponível: ${requested.slug ?? requested.product_id}` },
        404
      );
    }

    resolvedItems.push({ product, quantity });
  }

  const totalCents = resolvedItems.reduce((sum, { product, quantity }) => {
    const unitPrice = product.sale_price_cents ?? product.price_cents;
    return sum + unitPrice * quantity;
  }, 0);

  // 3. Cria o pedido "pending"
  //    (orders não tem colunas total_items/subtotal_cents — schema atual
  //    só tem total_cents; mantido assim de propósito, sem migration extra)
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      guest_email: userId ? null : buyer.email,
      status: 'pending',
      total_cents: totalCents,
    })
    .select()
    .single();

  if (orderError || !order) {
    return jsonResponse({ error: 'Falha ao criar o pedido.', details: orderError?.message }, 500);
  }

  // order_items não tem coluna quantity — 1 linha por unidade, mesmo
  // schema já existente, sem precisar de migration extra.
  const orderItemsPayload = resolvedItems.flatMap(({ product, quantity }) =>
    Array.from({ length: quantity }, () => ({
      order_id: order.id,
      product_id: product.id,
      price_cents: product.sale_price_cents ?? product.price_cents,
    }))
  );

  const { error: itemsError } = await supabase.from('order_items').insert(orderItemsPayload);
  if (itemsError) {
    await supabase.from('orders').update({ status: 'failed' }).eq('id', order.id);
    return jsonResponse({ error: 'Falha ao registrar itens do pedido.' }, 500);
  }

  // 4. Cria o Asaas Checkout — Pix + Cartão, hospedado pela própria Asaas.
  //    Nenhum dado de cartão passa por aqui. Também não enviamos
  //    customerData: a própria página hospedada coleta CPF, telefone e
  //    endereço, evitando rejeições prematuras por formatação local de
  //    phone/postalCode.
  const asaasBody = {
    billingTypes: ['PIX', 'CREDIT_CARD'],
    chargeTypes: ['DETACHED'],
    minutesToExpire: 60,
    externalReference: order.id,
    callback: {
      successUrl: `${SITE_URL}/pedido/sucesso?order_id=${order.id}`,
      cancelUrl: `${SITE_URL}/pedido/erro?order_id=${order.id}`,
      expiredUrl: `${SITE_URL}/pedido/erro?order_id=${order.id}&motivo=expirado`,
    },
    items: resolvedItems.map(({ product, quantity }) => ({
      name: product.title,
      description: product.subtitle || product.title,
      quantity,
      value: (product.sale_price_cents ?? product.price_cents) / 100,
    })),
  };

  if (isQaCheckout) {
    const checkoutUrl = `${SITE_URL}/pedido/pendente?order_id=${order.id}&modo=qa`;

    await supabase
      .from('orders')
      .update({
        checkout_url: checkoutUrl,
        asaas_payment_id: `qa_checkout_${order.id}`,
      })
      .eq('id', order.id);

    return jsonResponse({
      checkoutUrl,
      orderId: order.id,
      mode: 'qa',
      totalCents,
      asaasRequestSkipped: true,
    });
  }

  let asaasResponse: Response;
  try {
    asaasResponse = await fetch(`${ASAAS_BASE_URL}/checkouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        access_token: ASAAS_API_KEY,
      },
      body: JSON.stringify(asaasBody),
    });
  } catch (err) {
    await supabase.from('orders').update({ status: 'failed' }).eq('id', order.id);
    return jsonResponse({ error: 'Falha de rede ao contatar a Asaas.' }, 502);
  }

  if (!asaasResponse.ok) {
    const errBody = await asaasResponse.text();
    await supabase.from('orders').update({ status: 'failed' }).eq('id', order.id);
    return jsonResponse({ error: 'Falha ao criar checkout na Asaas.', details: errBody }, 502);
  }

  const asaasData = await asaasResponse.json();
  // Campo de resposta confirmado na doc da Asaas para /v3/checkouts: `link`.
  const checkoutUrl = asaasData.link ?? asaasData.checkoutUrl ?? asaasData.invoiceUrl;

  if (!checkoutUrl) {
    await supabase.from('orders').update({ status: 'failed' }).eq('id', order.id);
    return jsonResponse({ error: 'Asaas não retornou URL de checkout.', details: asaasData }, 502);
  }

  await supabase
    .from('orders')
    .update({
      checkout_url: checkoutUrl,
      asaas_payment_id: asaasData.id ?? null, // id do checkout; o webhook atualiza pra o id do pagamento real quando chegar
    })
    .eq('id', order.id);

  return jsonResponse({ checkoutUrl, orderId: order.id });
});
