import { supabase } from '@/lib/supabase';
import { getStudySessions } from '@/api/studySessions.js';
import { filterPlanByActiveProducts } from '@/api/weeklyAdherence.js';

export async function getStudyPlan() {
  const [
    { data: enrollments, error: enrollmentsError },
    { data: items, error: itemsError },
    sessionResult,
  ] = await Promise.all([
    supabase.from('enrollments')
      .select('product_id,status,expires_at,products(title)')
      .eq('status', 'active'),
    supabase.from('study_plan_items')
      .select('id,product_id,title,scheduled_date,duration_minutes,completed,completed_at,item_source')
      .order('scheduled_date'),
    getStudySessions(),
  ]);

  if (enrollmentsError || itemsError || sessionResult.error) {
    return { data: null, error: 'Não foi possível carregar seu plano agora.' };
  }

  const filtered = filterPlanByActiveProducts(enrollments ?? [], items ?? []);
  const activeProductIds = new Set(filtered.enrollments.map((enrollment) => enrollment.product_id));
  const sessions = sessionResult.data.sessions.filter((session) => activeProductIds.has(session.product_id));

  return {
    data: {
      ...filtered,
      sessions,
      activeSession: sessions.find((session) => session.id === sessionResult.data.activeSession?.id) ?? null,
    },
    error: null,
  };
}

export async function createStudyPlanItem({ productId, title, date, duration }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão não encontrada.' };
  const { error } = await supabase.from('study_plan_items').insert({
    user_id: user.id,
    product_id: productId,
    title: title.trim(),
    scheduled_date: date,
    duration_minutes: Number(duration),
  });
  return { error: error ? 'Não foi possível adicionar a tarefa.' : null };
}

export async function toggleStudyPlanItem(item) {
  const completed = !item.completed;
  const { error } = await supabase.from('study_plan_items').update({
    completed,
    completed_at: completed ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }).eq('id', item.id);
  return error ? 'Não foi possível atualizar a tarefa.' : null;
}

export async function deleteStudyPlanItem(id) {
  const { error } = await supabase.from('study_plan_items').delete().eq('id', id);
  return error ? 'Não foi possível excluir a tarefa.' : null;
}
