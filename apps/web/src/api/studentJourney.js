import { getMyEnrollments } from '@/api/enrollments.js';
import { getActiveEssayThemes } from '@/api/essayThemes.js';
import { getMyFlashcards } from '@/api/flashcards.js';
import { getMyProgress } from '@/api/progress.js';
import { getStudyPlan } from '@/api/studyPlan.js';
import { getStudyProfile } from '@/api/studyProfile.js';
import { getMySyllabus } from '@/api/syllabus.js';
import { buildStudentJourneyState } from '@/api/studentJourneyModel.js';

export async function getStudentJourneyState() {
  const [enrollments, profile, progress, plan, essayThemes, flashcards, syllabus] = await Promise.all([
    getMyEnrollments(),
    getStudyProfile(),
    getMyProgress(),
    getStudyPlan(),
    getActiveEssayThemes(),
    getMyFlashcards(),
    getMySyllabus(),
  ]);

  if (enrollments.error || profile.error || progress.error || plan.error || essayThemes.error || flashcards.error || syllabus.error) {
    return {
      data: null,
      error: enrollments.error || profile.error || progress.error || plan.error ||
        essayThemes.error || flashcards.error || syllabus.error || 'Não foi possível carregar sua jornada agora.',
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
      syllabus: syllabus.data,
    }),
    error: null,
  };
}
