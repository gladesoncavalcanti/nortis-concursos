import { supabase } from '@/lib/supabase';

const THEME_FIELDS = 'id,product_id,syllabus_node_id,title,prompt_text,source_reference,sort_order,syllabus_nodes(id,title)';

/**
 * Lista os temas discursivos ativos visíveis para o aluno autenticado.
 * A RLS de essay_themes já restringe o resultado a temas ativos de
 * produtos com matrícula ativa — nenhum filtro adicional é necessário
 * aqui (mesmo padrão de getMyFlashcards).
 */
export async function getActiveEssayThemes() {
  const { data, error } = await supabase
    .from('essay_themes')
    .select(THEME_FIELDS)
    .order('sort_order');
  return { data: data ?? [], error: error ? 'Não foi possível carregar os temas agora.' : null };
}

export async function getEssayThemeById(themeId) {
  const { data, error } = await supabase
    .from('essay_themes')
    .select(THEME_FIELDS)
    .eq('id', themeId)
    .maybeSingle();
  return { data: data ?? null, error: error ? 'Não foi possível carregar o tema agora.' : null };
}
