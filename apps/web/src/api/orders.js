import { supabase } from '@/lib/supabase';

/**
 * Cria um pedido + checkout Asaas (Pix + Cartão) chamando a Edge Function
 * `create-asaas-checkout`.
 *
 * Este arquivo NUNCA lida com dados de cartão — apenas envia a lista de
 * produtos/quantidades e os dados cadastrais do comprador, exigidos pela
 * Asaas para criar a cobrança (customerData). Cartão/CVV/validade são
 * preenchidos exclusivamente na página hospedada da Asaas, depois do
 * redirecionamento.
 *
 * @param {object} params
 * @param {Array<{ productId: string, quantity: number }>} params.items
 * @param {object} params.buyer - dados cadastrais exigidos pela Asaas
 * @param {string} params.buyer.name
 * @param {string} params.buyer.email
 * @param {string} params.buyer.cpfCnpj
 * @param {string} params.buyer.phone
 * @param {string} params.buyer.postalCode
 * @param {string} params.buyer.address
 * @param {string} params.buyer.addressNumber
 * @param {string} [params.buyer.complement]
 * @param {string} params.buyer.province - bairro
 * @param {string} [params.buyer.city]
 * @param {string} [params.buyer.state] - UF
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
