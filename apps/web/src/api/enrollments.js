import { supabase } from '@/lib/supabase';

/**
 * Leitura read-only dos enrollments reais do usuário autenticado, via
 * cliente Supabase padrão do frontend (chave anon) — a policy de RLS
 * `enrollments_self` (auth.uid() = user_id) já restringe o resultado ao
 * próprio usuário; o filtro explícito abaixo é só clareza adicional.
 *
 * Não seleciona `pdf_path` (nem qualquer coluna de Storage) — essa
 * coluna nem tem GRANT de SELECT para anon/authenticated. Entrega
 * protegida (signed URL) é uma fase futura.
 *
 * @returns {Promise<{ data: Array<object>, error: string|null }>}
 */
export async function getMyEnrollments() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: [], error: 'Sessão não encontrada.' };
  }

  const { data, error } = await supabase
    .from('enrollments')
    .select(
      'id, status, granted_at, expires_at, product_id, products(title, slug, cover_image_url)'
    )
    .eq('user_id', user.id)
    .order('granted_at', { ascending: false });

  if (error) {
    return { data: [], error: 'Não foi possível carregar seus materiais agora.' };
  }

  return { data: data ?? [], error: null };
}
