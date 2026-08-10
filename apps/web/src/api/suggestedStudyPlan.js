import { supabase } from '@/lib/supabase';
import { buildSuggestedStudyItems } from '@/api/studyPlanSuggestions.js';

export async function createSuggestedStudyWeek({ productId, profile, progress, objectiveWeakSubjects, selfReportedWeakSubjects }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão não encontrada.', created: 0 };
  const suggestions = buildSuggestedStudyItems({ profile, progress, objectiveWeakSubjects, selfReportedWeakSubjects });
  const { data: existing, error: readError } = await supabase.from('study_plan_items')
    .select('title,scheduled_date').eq('product_id', productId)
    .gte('scheduled_date', suggestions[0].scheduled_date)
    .lte('scheduled_date', suggestions.at(-1).scheduled_date);
  if (readError) return { error: 'Não foi possível verificar seu plano.', created: 0 };
  const keys = new Set((existing ?? []).map((item) => `${item.scheduled_date}|${item.title}`));
  const items = suggestions.filter((item) => !keys.has(`${item.scheduled_date}|${item.title}`))
    .map((item) => ({ ...item, user_id: user.id, product_id: productId }));
  if (!items.length) return { error: null, created: 0 };
  const { error } = await supabase.from('study_plan_items').insert(items);
  return { error: error ? 'Não foi possível criar a semana sugerida.' : null, created: error ? 0 : items.length };
}
