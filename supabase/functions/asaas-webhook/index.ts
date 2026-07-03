// asaas-webhook
//
// Recebe eventos de pagamento da Asaas, loga o payload bruto em
// asaas_webhook_events, valida o token do webhook (se configurado),
// atualiza o pedido correspondente e libera o acesso (enrollment)
// quando o pagamento é confirmado.
//
// Cadastrar no painel da Asaas (Configurações → Webhooks):
//   URL: https://<SEU_PROJETO_REF>.supabase.co/functions/v1/asaas-webhook
//   Eventos: PAYMENT_CREATED, PAYMENT_CONFIRMED, PAYMENT_RECEIVED,
//            PAYMENT_OVERDUE, PAYMENT_REFUNDED, PAYMENT_DELETED
//   Token de autenticação (recomendado): defina um token no painel da
//   Asaas e configure o mesmo valor no secret ASAAS_WEBHOOK_TOKEN.
//
// Secrets necessários:
//   SUPABASE_URL              (já disponível automaticamente)
//   SUPABASE_SERVICE_ROLE_KEY (já disponível automaticamente)
//   ASAAS_WEBHOOK_TOKEN       (opcional, mas recomendado)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const ASAAS_WEBHOOK_TOKEN = Deno.env.get('ASAAS_WEBHOOK_TOKEN'); // opcional

const APPROVED_EVENTS = ['PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED'];
const FAILED_EVENTS = ['PAYMENT_OVERDUE', 'PAYMENT_REFUNDED', 'PAYMENT_DELETED'];
// PAYMENT_CREATED: só confirma que a cobrança foi gerada do lado da Asaas,
// não altera o status do pedido (continua 'pending').

async function grantEnrollment(
  supabase: ReturnType<typeof createClient>,
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

  if (ASAAS_WEBHOOK_TOKEN) {
    const receivedToken = req.headers.get('asaas-access-token');
    if (receivedToken !== ASAAS_WEBHOOK_TOKEN) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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

  // 2. Localiza o pedido: primeiro por externalReference (= order.id,
  //    definido em create-asaas-checkout), depois por asaas_payment_id
  //    como fallback.
  const orderIdFromReference: string | null = payment.externalReference ?? null;

  let order: any = null;
  if (orderIdFromReference) {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderIdFromReference)
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
  }
  // PAYMENT_CREATED: sem ação sobre o pedido, só fica registrado no log.

  if (loggedEvent) {
    await supabase.from('asaas_webhook_events').update({ processed: true }).eq('id', loggedEvent.id);
  }

  return new Response('ok', { status: 200 });
});
