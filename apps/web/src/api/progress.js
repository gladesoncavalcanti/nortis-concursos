import { supabase } from '@/lib/supabase';
import { summarizeProgress } from '@/api/progressSummary.js';

export async function getMyProgress() {
  const [
    { data: attempts, error: attemptsError },
    { data: sessions, error: sessionsError },
    { data: flashcardReviews, error: flashcardsError },
  ] = await Promise.all([
    supabase.from('question_attempts').select('id,question_id,is_correct,answered_at,questions(statement,syllabus_nodes(title))').order('answered_at', { ascending: false }),
    supabase.from('simulation_sessions').select('id,status,correct_count,question_count,started_at,completed_at,simulations(title)').order('started_at', { ascending: false }),
    supabase.from('flashcard_progress').select('flashcard_id,last_reviewed_at').not('last_reviewed_at', 'is', null),
  ]);
  if (attemptsError || sessionsError || flashcardsError) return { data: null, error: 'Não foi possível carregar seu progresso agora.' };
  return { data: summarizeProgress(attempts ?? [], sessions ?? [], flashcardReviews ?? []), error: null };
}
