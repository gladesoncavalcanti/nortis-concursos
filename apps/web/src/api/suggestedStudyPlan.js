import { supabase } from '@/lib/supabase';
import { buildSuggestedStudyItems } from '@/api/studyPlanSuggestions.js';
import { buildStudyTimeHistory } from '@/api/studyTimeHistory.js';
import { buildStudyCapacity } from '@/api/studyCapacity.js';

export async function createSuggestedStudyWeek({
  productId,
  profile,
  progress,
  objectiveWeakSubjects,
  selfReportedWeakSubjects,
  studySessions = [],
  planItems = [],
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão não encontrada.', created: 0 };
  const history = buildStudyTimeHistory({ sessions: studySessions, items: planItems });
  const capacity = buildStudyCapacity({
    profile,
    history,
    items: planItems,
    replaceSuggestedProductId: productId,
  });
  const suggestions = buildSuggestedStudyItems({
    profile,
    progress,
    objectiveWeakSubjects,
    selfReportedWeakSubjects,
    weeklyBudgetMinutes: capacity.remainingMinutes,
    endDate: capacity.weekEnd,
  });
  const firstDate = capacity.weekStart ?? suggestions[0]?.scheduled_date;
  const lastDate = capacity.weekEnd ?? suggestions.at(-1)?.scheduled_date;
  if (!firstDate || !lastDate) return { error: null, created: 0, capacity };
  const { error: deleteError } = await supabase.from('study_plan_items')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .eq('item_source', 'suggested')
    .gte('scheduled_date', firstDate)
    .lte('scheduled_date', lastDate);
  if (deleteError) return { error: 'Não foi possível atualizar sua semana sugerida.', created: 0, capacity };
  const items = suggestions.map((item) => ({
    ...item,
    user_id: user.id,
    product_id: productId,
    item_source: 'suggested',
  }));
  if (!items.length) return { error: null, created: 0, capacity };
  const { error } = await supabase.from('study_plan_items').insert(items);
  return {
    error: error ? 'Não foi possível criar a semana sugerida.' : null,
    created: error ? 0 : items.length,
    capacity,
  };
}
