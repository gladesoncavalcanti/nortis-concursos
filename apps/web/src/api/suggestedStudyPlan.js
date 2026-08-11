import { supabase } from '@/lib/supabase';
import { buildSuggestedStudyItems } from '@/api/studyPlanSuggestions.js';

export async function createSuggestedStudyWeek({ productId, profile, progress, objectiveWeakSubjects, selfReportedWeakSubjects }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão não encontrada.', created: 0 };
  const suggestions = buildSuggestedStudyItems({ profile, progress, objectiveWeakSubjects, selfReportedWeakSubjects });
  if (!suggestions.length) return { error: null, created: 0 };
  const firstDate = suggestions[0].scheduled_date;
  const lastDate = suggestions.at(-1).scheduled_date;
  const { error: deleteError } = await supabase.from('study_plan_items')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .eq('item_source', 'suggested')
    .gte('scheduled_date', firstDate)
    .lte('scheduled_date', lastDate);
  if (deleteError) return { error: 'Não foi possível atualizar sua semana sugerida.', created: 0 };
  const items = suggestions.map((item) => ({
    ...item,
    user_id: user.id,
    product_id: productId,
    item_source: 'suggested',
  }));
  if (!items.length) return { error: null, created: 0 };
  const { error } = await supabase.from('study_plan_items').insert(items);
  return { error: error ? 'Não foi possível criar a semana sugerida.' : null, created: error ? 0 : items.length };
}
