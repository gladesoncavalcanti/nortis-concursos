import { supabase } from '@/lib/supabase';

/**
 * Leitura read-only da tabela `products` no Supabase.
 *
 * Isolado de propósito: não é importado por ProductsList.jsx,
 * ProductDetailPage.jsx, useCart.jsx ou EcommerceApi.js. Serve apenas
 * para validar a leitura do Supabase antes de qualquer decisão de
 * substituir a fonte de dados real do catálogo.
 *
 * @returns {Promise<{ data: Array<object>, error: string|null }>}
 */
export async function getSupabaseProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: data ?? [], error: null };
}
