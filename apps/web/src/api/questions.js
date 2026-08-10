import { supabase } from '@/lib/supabase';

export async function getMyQuestions() {
  const { data, error } = await supabase
    .from('questions')
    .select('id, statement, syllabus_node_id, sort_order, question_options(id, label, option_text, sort_order)')
    .eq('diagnostic_eligible', false)
    .order('sort_order', { ascending: true });

  if (error) return { data: [], error: 'Não foi possível carregar as questões agora.' };

  const questions = (data ?? []).map((question) => ({
    ...question,
    question_options: [...(question.question_options ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label)
    ),
  }));
  return { data: questions, error: null };
}

export async function submitQuestionAttempt(questionId, selectedOptionId) {
  const { data, error } = await supabase.rpc('submit_question_attempt', {
    p_question_id: questionId,
    p_selected_option_id: selectedOptionId,
  });
  if (error || !data?.[0]) return { data: null, error: 'Não foi possível corrigir a resposta agora.' };
  return { data: data[0], error: null };
}
