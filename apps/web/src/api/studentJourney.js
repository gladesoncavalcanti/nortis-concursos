import { getMyEnrollments } from '@/api/enrollments.js';
import { getActiveEssayThemes } from '@/api/essayThemes.js';
import { getMyFlashcards } from '@/api/flashcards.js';
import { getMyProgress } from '@/api/progress.js';
import { getStudyPlan } from '@/api/studyPlan.js';
import { getStudyProfile } from '@/api/studyProfile.js';
import { buildStudentJourneyState } from '@/api/studentJourneyModel.js';

export async function getStudentJourneyState() {
  const [enrollments, profile, progress, plan, essayThemes, flashcards] = await Promise.all([
    getMyEnrollments(),
    getStudyProfile(),
    getMyProgress(),
    getStudyPlan(),
    getActiveEssayThemes(),
    getMyFlashcards(),
  ]);

  if (enrollments.error || profile.error || progress.error || plan.error || essayThemes.error || flashcards.error) {
    return {
      data: null,
      error: enrollments.error || profile.error || progress.error || plan.error ||
        essayThemes.error || flashcards.error || 'Não foi possível carregar sua jornada agora.',
    };
  }

  return {
    data: buildStudentJourneyState({
      enrollments: enrollments.data,
      profile: profile.data,
      progress: progress.data,
      plan: plan.data,
      essayThemes: essayThemes.data,
      flashcardDecks: flashcards.data,
    }),
    error: null,
  };
}
