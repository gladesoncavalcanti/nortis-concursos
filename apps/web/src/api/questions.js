import { supabase } from '@/lib/supabase';
import { getStudyProfile } from '@/api/studyProfile.js';
import { getMySyllabus } from '@/api/syllabus.js';
import { filterSyllabusForProfile } from '@/api/specialtySelection.js';
import { getMyQuestionFavorites } from '@/api/questionFavorites.js';

export async function getMyQuestionBank() {
  const [questionResult, attemptResult, profileResult, syllabusResult, favoriteResult] = await Promise.all([
    supabase.from('questions')
      .select('id, statement, syllabus_node_id, sort_order, syllabus_nodes(id,title,node_type,parent_id), question_options(id, label, option_text, sort_order)')
      .eq('diagnostic_eligible', false)
      .order('sort_order', { ascending: true }),
    supabase.from('question_attempts')
      .select('id,question_id,is_correct,answered_at')
      .eq('attempt_context', 'practice')
      .order('answered_at', { ascending: false })
      .order('id', { ascending: false }),
    getStudyProfile(),
    getMySyllabus(),
    getMyQuestionFavorites(),
  ]);

  if (questionResult.error || attemptResult.error || profileResult.error || syllabusResult.error) {
    return { data: null, error: 'Não foi possível carregar as questões agora.' };
  }

  const questions = (questionResult.data ?? []).map((question) => ({
    ...question,
    question_options: [...(question.question_options ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label)
    ),
  }));
  const profile = profileResult.data;
  const needsSpecialty = !profile?.target_role || !profile?.target_specialty_id;
  const visibleNodes = needsSpecialty
    ? []
    : filterSyllabusForProfile(syllabusResult.data, profile.target_role, profile.target_specialty_id);

  return {
    data: {
      questions,
      attempts: attemptResult.data ?? [],
      favorites: favoriteResult.data ?? [],
      visibleNodes,
      needsSpecialty,
      favoritesUnavailable: Boolean(favoriteResult.error),
    },
    error: null,
  };
}

export async function submitQuestionAttempt(questionId, selectedOptionId) {
  const { data, error } = await supabase.rpc('submit_question_attempt', {
    p_question_id: questionId,
    p_selected_option_id: selectedOptionId,
  });
  if (error || !data?.[0]) return { data: null, error: 'Não foi possível corrigir a resposta agora.' };
  return { data: data[0], error: null };
}
