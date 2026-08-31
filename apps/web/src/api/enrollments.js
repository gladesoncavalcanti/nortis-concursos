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
      `id, status, granted_at, expires_at, product_id,
       products(
         title, slug, cover_image_url,
         product_modules(
           sort_order,
           learning_modules(id, slug, title, description, module_type, route_path, sort_order)
         )
       )`
    )
    .eq('user_id', user.id)
    .order('granted_at', { ascending: false });

  if (error) {
    return { data: [], error: 'Não foi possível carregar seus materiais agora.' };
  }

  const enrollments = (data ?? []).map((enrollment) => {
    const moduleLinks = enrollment.products?.product_modules ?? [];
    const modules = moduleLinks
      .map((link) => ({ ...link.learning_modules, productSortOrder: link.sort_order }))
      .filter((module) => module.id)
      .sort(
        (a, b) =>
          a.productSortOrder - b.productSortOrder || a.sort_order - b.sort_order || a.title.localeCompare(b.title)
      );

    return { ...enrollment, modules };
  });

  return { data: enrollments, error: null };
}

/**
 * Libera acesso gratuito ao produto SEDES-DF 2026 por meio de RPC
 * protegida no banco. O frontend não cria matrícula diretamente e não
 * toca em orders/checkout/pagamentos/Asaas.
 */
export async function claimFreeSedesAccess() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: 'Entre ou crie sua conta para liberar o acesso gratuito.' };
  }

  const { data, error } = await supabase.rpc('claim_free_sedes_df_access');

  if (error) {
    if (error.message?.includes('access_revoked')) {
      return {
        data: null,
        error: 'Este acesso não pode ser reativado automaticamente. Fale com a Nortis para regularizar.',
      };
    }

    if (error.message?.includes('free_product_not_available')) {
      return { data: null, error: 'O acesso gratuito ainda não está disponível para este produto.' };
    }

    return { data: null, error: 'Não foi possível liberar o acesso gratuito agora.' };
  }

  return { data: data?.[0] ?? null, error: null };
}
