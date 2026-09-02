import { supabase } from '@/lib/supabase';
import { summarizeProgress } from '@/api/progressSummary.js';
import { getStudyPlan } from '@/api/studyPlan.js';
import { getMyFlashcards } from '@/api/flashcards.js';
import { buildFlashcardInsights } from '@/api/flashcardInsights.js';

export async function getMyProgress() {
  const [
    { data: attempts, error: attemptsError },
    { data: sessions, error: sessionsError },
    flashcardResult,
    studyPlanResult,
  ] = await Promise.all([
    supabase.from('question_attempts')
      .select('id,question_id,is_correct,answered_at,attempt_context,questions(id,statement,syllabus_nodes(id,title),question_options(id,label,option_text,sort_order))')
      .order('answered_at', { ascending: false })
      .order('id', { ascending: false }),
    supabase.from('simulation_sessions').select('id,status,correct_count,question_count,started_at,completed_at,simulations(title)').order('started_at', { ascending: false }),
    getMyFlashcards(),
    getStudyPlan(),
  ]);
  if (attemptsError || sessionsError || flashcardResult.error || studyPlanResult.error) return { data: null, error: 'Não foi possível carregar seu progresso agora.' };
  const flashcardReviews = flashcardResult.data
    .flatMap((deck) => deck.flashcards ?? [])
    .map((card) => card.progress ? { flashcard_id: card.id, ...card.progress } : null)
    .filter((progress) => progress?.last_reviewed_at);
  const normalizedAttempts = (attempts ?? []).map((attempt) => ({
    ...attempt,
    questions: attempt.questions ? {
      ...attempt.questions,
      question_options: [...(attempt.questions.question_options ?? [])].sort(
        (a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label)
      ),
    } : null,
  }));
  return {
    data: {
      ...summarizeProgress(
      normalizedAttempts,
      sessions ?? [],
      flashcardReviews,
      new Date(),
      studyPlanResult.data.items,
      studyPlanResult.data.sessions
      ),
      flashcardInsights: buildFlashcardInsights(flashcardResult.data),
      simulationSessions: sessions ?? [],
      planItems: studyPlanResult.data.items,
    },
    error: null,
  };
}

export async function submitReviewAttempt(questionId, selectedOptionId) {
  const { data, error } = await supabase.rpc('submit_review_attempt', {
    p_question_id: questionId,
    p_selected_option_id: selectedOptionId,
  });
  if (error || !data?.[0]) {
    return { data: null, error: 'Não foi possível registrar esta revisão agora.' };
  }
  return { data: data[0], error: null };
}
