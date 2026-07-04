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
// A Asaas exige um customerData completo pra criar o checkout — o corpo
// da requisição precisa vir com:
//   buyer: {
//     name, email, cpfCnpj, phone, postalCode, address, addressNumber,
//     province,              // obrigatórios (validados abaixo)
//     complement, city, state // opcionais, enviados se vierem
//   }
//
// Secrets necessários (configurar em Project Settings → Edge Functions
// → Secrets, ou via painel de cada function):
//   ASAAS_API_KEY
//   ASAAS_BASE_URL            (ex: https://api-sandbox.asaas.com/v3)
//   SITE_URL                  (ex: https://nortisconcursos.com.br)
//   SUPABASE_URL              (já disponível automaticamente)
//   SUPABASE_SERVICE_ROLE_KEY (já disponível automaticamente)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY') ?? '';
const ASAAS_BASE_URL = Deno.env.get('ASAAS_BASE_URL') ?? 'https://api-sandbox.asaas.com/v3';
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://nortisconcursos.com.br';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function onlyDigits(value: unknown): string {
  return String(value ?? '').replace(/\D/g, '');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  if (!ASAAS_API_KEY) {
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

  // A Asaas exige esses campos em customerData pra criar o checkout
  // (erro real já visto em produção: cpfCnpj, phone, address,
  // addressNumber, postalCode e province são obrigatórios).
  const REQUIRED_BUYER_FIELDS = [
    'name',
    'email',
    'cpfCnpj',
    'phone',
    'postalCode',
    'address',
    'addressNumber',
    'province',
  ];
  const missingBuyerFields = REQUIRED_BUYER_FIELDS.filter((field) => !buyer?.[field]);
  if (missingBuyerFields.length > 0) {
    return jsonResponse(
      { error: `Dados do comprador incompletos: ${missingBuyerFields.join(', ')}` },
      400
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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
  //    Nenhum dado de cartão passa por aqui.
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
    customerData: {
      name: buyer.name,
      email: buyer.email,
      cpfCnpj: onlyDigits(buyer.cpfCnpj),
      phone: onlyDigits(buyer.phone),
      postalCode: onlyDigits(buyer.postalCode),
      address: buyer.address,
      addressNumber: buyer.addressNumber,
      complement: buyer.complement || undefined,
      province: buyer.province,
      city: buyer.city || undefined,
      state: buyer.state || undefined,
    },
    items: resolvedItems.map(({ product, quantity }) => ({
      name: product.title,
      description: product.subtitle || product.title,
      quantity,
      value: (product.sale_price_cents ?? product.price_cents) / 100,
    })),
  };

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
