import { supabase } from '@/lib/supabase';
import { buildSyllabusTree } from '@/api/syllabusTree.js';

export async function getMySyllabus() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: [], error: 'Sessão não encontrada.' };

  const { data, error } = await supabase
    .from('syllabus_nodes')
    .select('id, product_id, parent_id, node_type, slug, title, description, sort_order')
    .order('sort_order', { ascending: true });

  if (error) {
    return { data: [], error: 'Não foi possível carregar o edital agora.' };
  }

  return { data: buildSyllabusTree(data ?? []), error: null };
}
