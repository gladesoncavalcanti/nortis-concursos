import { supabase } from '@/lib/supabase';
import { getStudySessionWindowStart } from '@/api/studySessionModel.js';

const SESSION_FIELDS = 'id,product_id,study_plan_item_id,started_at,ended_at,duration_seconds';

export async function getStudySessions(now = new Date()) {
  const [{ data: recent, error: recentError }, { data: active, error: activeError }] = await Promise.all([
    supabase.from('study_sessions')
      .select(SESSION_FIELDS)
      .gte('started_at', getStudySessionWindowStart(now))
      .order('started_at', { ascending: false }),
    supabase.from('study_sessions')
      .select(SESSION_FIELDS)
      .is('ended_at', null)
      .order('started_at', { ascending: false })
      .limit(1),
  ]);

  if (recentError || activeError) {
    return { data: null, error: 'Não foi possível carregar suas sessões de estudo agora.' };
  }

  const sessionsById = new Map([...(recent ?? []), ...(active ?? [])].map((session) => [session.id, session]));
  return {
    data: {
      sessions: [...sessionsById.values()],
      activeSession: active?.[0] ?? null,
    },
    error: null,
  };
}

export async function startStudySession(studyPlanItemId) {
  const { error } = await supabase.rpc('start_study_session', {
    p_study_plan_item_id: studyPlanItemId,
  });
  return error ? 'Não foi possível iniciar esta sessão de estudo.' : null;
}

export async function finishStudySession(sessionId) {
  const { error } = await supabase.rpc('finish_study_session', {
    p_session_id: sessionId,
  });
  return error ? 'Não foi possível encerrar esta sessão de estudo.' : null;
}
