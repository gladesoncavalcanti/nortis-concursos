import { supabase } from '@/lib/supabase';
import { summarizeSimulationReview } from '@/api/simulationReviewModel.js';

export async function getSimulationHub() {
  const [simulationResult, sessionResult, answerResult] = await Promise.all([
    supabase.from('simulations').select(`id,slug,target_specialty_id,title,description,time_limit_minutes,sort_order,
      simulation_questions(sort_order,questions(id,statement,question_options(id,label,option_text,sort_order)))`).order('sort_order'),
    supabase.from('simulation_sessions').select('id,simulation_id,status,started_at,completed_at,correct_count,question_count').order('started_at', { ascending: false }),
    supabase.from('simulation_answers').select('session_id,question_id,selected_option_id,answered_at'),
  ]);
  if (simulationResult.error || sessionResult.error || answerResult.error) {
    return { data: null, error: 'Não foi possível carregar os simulados agora.' };
  }
  const simulations = (simulationResult.data ?? []).map((simulation) => ({
    ...simulation,
    simulation_questions: [...(simulation.simulation_questions ?? [])]
      .sort((left, right) => left.sort_order - right.sort_order)
      .map((link) => ({
        ...link,
        questions: link.questions ? {
          ...link.questions,
          question_options: [...(link.questions.question_options ?? [])]
            .sort((left, right) => left.sort_order - right.sort_order),
        } : null,
      })),
  }));
  return {
    data: { simulations, sessions: sessionResult.data ?? [], answers: answerResult.data ?? [] },
    error: null,
  };
}

export async function startSimulation(id) {
  const { data: sessionId, error } = await supabase.rpc('start_simulation', { p_simulation_id: id });
  if (error || !sessionId) return { data: null, error: 'Não foi possível iniciar o simulado.' };
  const { data, error: sessionError } = await supabase
    .from('simulation_sessions')
    .select('id,simulation_id,status,started_at,completed_at,correct_count,question_count')
    .eq('id', sessionId)
    .single();
  return sessionError ? { data: null, error: 'Não foi possível recuperar a sessão do simulado.' } : { data, error: null };
}

export async function answerSimulationQuestion(sessionId, questionId, optionId) {
  const { error } = await supabase.rpc('answer_simulation_question', {
    p_session_id: sessionId,
    p_question_id: questionId,
    p_option_id: optionId,
  });
  return error ? 'Não foi possível salvar esta resposta.' : null;
}

export async function finishSimulation(sessionId) {
  const { data, error } = await supabase.rpc('finish_simulation', { p_session_id: sessionId });
  return error ? { data: null, error: 'Não foi possível concluir o simulado.' } : { data: data?.[0], error: null };
}

export async function getMySimulationReview(sessionId) {
  const { data, error } = await supabase.rpc('get_my_simulation_review', {
    p_session_id: sessionId,
  });
  if (error) {
    return { data: null, error: 'Não foi possível carregar a revisão deste simulado.' };
  }
  const rows = data ?? [];
  return {
    data: {
      rows,
      summary: summarizeSimulationReview(rows),
    },
    error: null,
  };
}
