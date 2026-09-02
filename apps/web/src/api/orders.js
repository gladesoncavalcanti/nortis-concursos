import { supabase } from '@/lib/supabase';

/**
 * Cria um pedido + checkout Asaas (Pix + Cartão) chamando a Edge Function
 * `create-asaas-checkout`.
 *
 * Este arquivo NUNCA lida com dados de cartão — apenas envia a lista de
 * produtos/quantidades e os dados mínimos para identificar o pedido.
 * CPF, telefone, endereço, cartão/CVV/validade e Pix são preenchidos
 * exclusivamente na página hospedada da Asaas, depois do redirecionamento.
 *
 * @param {object} params
 * @param {Array<{ productId: string, quantity: number }>} params.items
 * @param {object} params.buyer - dados mínimos do comprador
 * @param {string} params.buyer.name
 * @param {string} params.buyer.email
 * @returns {Promise<{ checkoutUrl: string|null, orderId: string|null, error: string|null }>}
 */
export async function createAsaasCheckout({ items, buyer }) {
  const { data, error } = await supabase.functions.invoke('create-asaas-checkout', {
    body: {
      items: items.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
      buyer,
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
