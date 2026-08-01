// asaas-webhook
//
// Recebe eventos de pagamento da Asaas, loga o payload bruto em
// asaas_webhook_events, valida o token do webhook (obrigatório),
// atualiza o pedido correspondente e libera o acesso (enrollment)
// quando o pagamento é confirmado. Em caso de estorno, revoga o
// enrollment concedido pelo pedido correspondente.
//
// Cadastrar no painel da Asaas (Configurações → Webhooks):
//   URL: https://<SEU_PROJETO_REF>.supabase.co/functions/v1/asaas-webhook
//   Eventos: PAYMENT_CREATED, PAYMENT_CONFIRMED, PAYMENT_RECEIVED,
//            PAYMENT_OVERDUE, PAYMENT_REFUNDED, PAYMENT_DELETED
//   Token de autenticação (obrigatório): defina um token no painel da
//   Asaas e configure o mesmo valor no secret ASAAS_WEBHOOK_TOKEN.
//   Sem esse secret configurado, a função recusa qualquer requisição.
//
// Secrets necessários:
//   SUPABASE_URL         (já disponível automaticamente)
//   SUPABASE_SECRET_KEYS (já disponível automaticamente — JSON com as
//                         chaves "secret" do novo sistema de API keys do
//                         Supabase, ex.: {"default": "sb_secret_..."}.
//                         Usamos só a chave "default". Sem fallback para
//                         a antiga SUPABASE_SERVICE_ROLE_KEY: ausência ou
//                         formato inválido falha fechado.)
//   ASAAS_WEBHOOK_TOKEN  (obrigatório)

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.110.0';

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
// outro Authorization passa intocado.
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

const ASAAS_WEBHOOK_TOKEN = Deno.env.get('ASAAS_WEBHOOK_TOKEN') ?? '';

const APPROVED_EVENTS = ['PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED'];
const FAILED_EVENTS = ['PAYMENT_OVERDUE', 'PAYMENT_REFUNDED', 'PAYMENT_DELETED'];
// PAYMENT_CREATED: só confirma que a cobrança foi gerada do lado da Asaas,
// não altera o status do pedido (continua 'pending').

async function grantEnrollment(
  supabase: SupabaseClient,
  order: { id: string; user_id: string | null; guest_email: string | null },
  productId: string
) {
  const matchColumn = order.user_id ? 'user_id' : 'guest_email';
  const matchValue = order.user_id ?? order.guest_email;

  if (!matchValue) return; // não deveria acontecer (constraint garante um dos dois)

  const { data: existing } = await supabase
    .from('enrollments')
    .select('id')
    .eq(matchColumn, matchValue)
    .eq('product_id', productId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('enrollments')
      .update({ status: 'active', order_id: order.id })
      .eq('id', existing.id);
  } else {
    await supabase.from('enrollments').insert({
      user_id: order.user_id,
      guest_email: order.guest_email,
      product_id: productId,
      order_id: order.id,
      status: 'active',
    });
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    console.error('Configuração do Supabase ausente ou inválida — recusando webhook.');
    return new Response('Webhook não configurado', { status: 500 });
  }

  if (!ASAAS_WEBHOOK_TOKEN) {
    console.error('ASAAS_WEBHOOK_TOKEN não configurado — recusando webhook.');
    return new Response('Webhook não configurado', { status: 500 });
  }

  const receivedToken = req.headers.get('asaas-access-token');
  if (!receivedToken || receivedToken !== ASAAS_WEBHOOK_TOKEN) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Cliente de servidor (chave secret) — chamado só por webhook
  // servidor-a-servidor da Asaas, sem sessão de usuário nenhuma.
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

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const eventType: string = payload?.event ?? 'UNKNOWN';
  const payment = payload?.payment ?? {};

  // 1. Loga o evento bruto sempre — mesmo que não seja um evento tratado.
  const { data: loggedEvent } = await supabase
    .from('asaas_webhook_events')
    .insert({ event_type: eventType, payload, processed: false })
    .select('id')
    .single();

  // 2. Localiza o pedido, em ordem:
  //    a) payment.externalReference (= orders.id, definido em
  //       create-asaas-checkout);
  //    b) payment.checkoutSession contra orders.asaas_payment_id (o
  //       checkout hospedado da Asaas só informa o checkoutSession em
  //       alguns eventos, antes de existir um payment.id definitivo);
  //    c) payment.id contra orders.asaas_payment_id, como fallback final.
  const orderIdFromReference: string | null = payment.externalReference ?? null;
  const checkoutSession: string | null = payment.checkoutSession ?? null;

  let order: any = null;
  if (orderIdFromReference) {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderIdFromReference)
      .maybeSingle();
    order = data;
  }
  if (!order && checkoutSession) {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('asaas_payment_id', checkoutSession)
      .maybeSingle();
    order = data;
  }
  if (!order && payment.id) {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('asaas_payment_id', payment.id)
      .maybeSingle();
    order = data;
  }

  if (!order) {
    // Evento sem pedido correspondente (ex.: teste disparado pelo painel
    // da Asaas). Já foi logado acima — só confirma recebimento.
    return new Response('ok (sem pedido correspondente)', { status: 200 });
  }

  // Idempotência: a Asaas pode reenviar o mesmo evento mais de uma vez.
  if (order.status === 'paid' && APPROVED_EVENTS.includes(eventType)) {
    if (loggedEvent) {
      await supabase.from('asaas_webhook_events').update({ processed: true }).eq('id', loggedEvent.id);
    }
    return new Response('ok (já processado)', { status: 200 });
  }

  if (APPROVED_EVENTS.includes(eventType)) {
    await supabase
      .from('orders')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        asaas_payment_id: payment.id ?? order.asaas_payment_id,
        payment_method: payment.billingType ?? order.payment_method,
      })
      .eq('id', order.id);

    const { data: items } = await supabase
      .from('order_items')
      .select('product_id')
      .eq('order_id', order.id);

    const uniqueProductIds = [...new Set((items ?? []).map((item: any) => item.product_id))];
    for (const productId of uniqueProductIds) {
      await grantEnrollment(supabase, order, productId as string);
    }
  } else if (FAILED_EVENTS.includes(eventType)) {
    const newStatus = eventType === 'PAYMENT_REFUNDED' ? 'refunded' : 'expired';
    await supabase.from('orders').update({ status: newStatus }).eq('id', order.id);

    if (eventType === 'PAYMENT_REFUNDED') {
      // Revoga só o enrollment concedido por ESTE pedido (escopo por
      // order_id) — não mexe em granted_at nem em enrollments de outros
      // pedidos do mesmo usuário/produto.
      const { error: revokeError } = await supabase
        .from('enrollments')
        .update({ status: 'revoked' })
        .eq('order_id', order.id);

      if (revokeError) {
        console.error('Falha ao revogar enrollments do pedido', order.id, revokeError.message);
        return new Response('erro ao revogar acesso', { status: 500 });
      }
    }
  }
  // PAYMENT_CREATED: sem ação sobre o pedido, só fica registrado no log.

  if (loggedEvent) {
    await supabase.from('asaas_webhook_events').update({ processed: true }).eq('id', loggedEvent.id);
  }

  return new Response('ok', { status: 200 });
});
