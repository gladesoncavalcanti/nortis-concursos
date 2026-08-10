import { supabase } from '@/lib/supabase';

export async function getMySimulations() {
  const { data, error } = await supabase.from('simulations').select(`id,title,description,time_limit_minutes,sort_order,
    simulation_questions(sort_order,questions(id,statement,question_options(id,label,option_text,sort_order)))`).order('sort_order');
  if (error) return { data: [], error: 'Não foi possível carregar os simulados agora.' };
  return { data: data ?? [], error: null };
}

export async function startSimulation(id) {
  const { data, error } = await supabase.rpc('start_simulation', { p_simulation_id: id });
  return error ? { data: null, error: 'Não foi possível iniciar o simulado.' } : { data, error: null };
}
export async function answerSimulationQuestion(sessionId, questionId, optionId) {
  const { error } = await supabase.rpc('answer_simulation_question', { p_session_id: sessionId, p_question_id: questionId, p_option_id: optionId });
  return error ? 'Não foi possível salvar uma resposta.' : null;
}
export async function finishSimulation(sessionId) {
  const { data, error } = await supabase.rpc('finish_simulation', { p_session_id: sessionId });
  return error ? { data: null, error: 'Não foi possível concluir o simulado.' } : { data: data?.[0], error: null };
}
