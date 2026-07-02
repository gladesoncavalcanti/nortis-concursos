import { supabase } from '@/lib/supabase';

/**
 * Leitura read-only de produtos ativos na tabela `products` do Supabase.
 *
 * Usada pela vitrine real (ProductsList.jsx, via /apostilas) e pelas
 * páginas dev de comparação. O filtro `active = true` é explícito aqui
 * por clareza de intenção, mesmo que a policy de RLS
 * `products_public_read` já restrinja a mesma coisa para a anon key.
 *
 * @returns {Promise<{ data: Array<object>, error: string|null }>}
 */
export async function getSupabaseProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: data ?? [], error: null };
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Busca 1 produto ativo em `public.products` por `id` (uuid) ou `slug`.
 *
 * Usada por ProductDetailPage.jsx para resolver o parâmetro de rota
 * `/product/:id` quando ele vier de um produto Supabase (a vitrine liga
 * pra lá usando o `id` do produto já adaptado). Detecta automaticamente
 * se o identificador recebido parece um UUID (coluna `id`) ou não
 * (assume `slug`), evitando erro de tipo do Postgres ao comparar uma
 * string não-UUID contra a coluna `id`.
 *
 * Retorna `data: null` (sem erro) quando não encontra — isso é o sinal
 * para quem chama decidir se cai no fallback da Hostinger.
 *
 * @param {string} idOrSlug
 * @returns {Promise<{ data: object|null, error: string|null }>}
 */
export async function getSupabaseProductByIdOrSlug(idOrSlug) {
  const column = UUID_REGEX.test(idOrSlug) ? 'id' : 'slug';

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq(column, idOrSlug)
    .eq('active', true)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data ?? null, error: null };
}
