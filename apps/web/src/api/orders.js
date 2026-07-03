import { supabase } from '@/lib/supabase';

/**
 * Cria um pedido + checkout Asaas (Pix + Cartão) chamando a Edge Function
 * `create-asaas-checkout`.
 *
 * Este arquivo NUNCA lida com dados de cartão — apenas envia a lista de
 * produtos/quantidades e, se o comprador não estiver logado, um e-mail de
 * contato. Cartão/CVV/validade são preenchidos exclusivamente na página
 * hospedada da Asaas, depois do redirecionamento.
 *
 * @param {object} params
 * @param {Array<{ productId: string, quantity: number }>} params.items
 * @param {string} [params.guestEmail] - obrigatório se o comprador não estiver logado
 * @param {string} [params.guestName]
 * @returns {Promise<{ checkoutUrl: string|null, orderId: string|null, error: string|null }>}
 */
export async function createAsaasCheckout({ items, guestEmail, guestName }) {
  const { data, error } = await supabase.functions.invoke('create-asaas-checkout', {
    body: {
      items: items.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
      guest_email: guestEmail,
      guest_name: guestName,
    },
  });

  if (error) {
    return { checkoutUrl: null, orderId: null, error: error.message };
  }

  if (data?.error) {
    return { checkoutUrl: null, orderId: null, error: data.error };
  }

  return { checkoutUrl: data.checkoutUrl, orderId: data.orderId, error: null };
}
