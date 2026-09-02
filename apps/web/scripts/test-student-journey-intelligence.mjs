import assert from 'node:assert/strict';
import {
  buildGuidedSedesJourney,
  buildMaterialsLibrary,
  buildSmartReviewQueue,
  buildStudentJourneyState,
  buildSubjectPerformance,
} from '../src/api/studentJourneyModel.js';

const progress = {
  answered: 4,
  completedSimulations: 1,
  review: [
    {
      question_id: 'q1',
      attempt_context: 'diagnostic',
      answered_at: '2026-09-01T10:00:00.000Z',
      questions: {
        statement: 'Diagnóstico incorreto',
        syllabus_nodes: { title: 'SUAS' },
      },
    },
    {
      question_id: 'q2',
      attempt_context: 'practice',
      answered_at: '2026-09-01T11:00:00.000Z',
      questions: {
        statement: 'Prática incorreta',
        syllabus_nodes: { title: 'Orçamento' },
      },
    },
  ],
  contentDiagnosis: [
    { title: 'SUAS', answered: 4, correct: 1, accuracy: 25 },
    { title: 'Orçamento', answered: 4, correct: 3, accuracy: 75 },
    { title: 'Ética', answered: 1, correct: 1, accuracy: 100 },
  ],
  simulationSessions: [
    {
      id: 's1',
      status: 'completed',
      correct_count: 2,
      question_count: 4,
      completed_at: '2026-09-01T12:00:00.000Z',
      simulations: { title: 'Simulado SEDES' },
    },
  ],
};

const plan = {
  items: [
    {
      title: 'Revisar SUAS',
      completed: false,
      duration_minutes: 40,
      syllabus_nodes: { title: 'SUAS' },
    },
  ],
};

const enrollments = [
  {
    id: 'enrollment-1',
    product_id: 'product-1',
    status: 'active',
    expires_at: null,
    products: {
      title: 'Nexo Social – SEDES DF 2026',
    },
    modules: [
      { id: 'm1', title: 'Apostila', module_type: 'material' },
      { id: 'm2', title: 'Questões', module_type: 'questions', route_path: '/minha-conta/questoes' },
      { id: 'm3', title: 'Plano', module_type: 'plan', route_path: '/minha-conta/plano' },
    ],
  },
];

const queue = buildSmartReviewQueue({ progress, simulations: progress.simulationSessions });
assert.equal(queue.length, 3);
assert.equal(queue[0].kind, 'practice');
assert.equal(queue[1].kind, 'diagnostic');
assert.equal(queue.some((item) => item.kind === 'simulation'), true);

const subjects = buildSubjectPerformance({ progress, planItems: plan.items });
assert.equal(subjects[0].title, 'SUAS');
assert.equal(subjects[0].status, 'weak');
assert.equal(subjects[0].plannedTasks, 1);
assert.equal(subjects.find((item) => item.title === 'Orçamento').status, 'stable');

const journey = buildGuidedSedesJourney({
  hasActiveEnrollment: true,
  profile: { target_role: 'analista', target_specialty_id: 'specialty-1' },
  progress,
  planItems: plan.items,
  essayThemes: [{ id: 'theme-1' }],
  flashcardDecks: [{ flashcards: [{ id: 'card-1' }] }],
});
assert.equal(journey.completedRequired, 5);
assert.equal(journey.requiredTotal, 6);
assert.equal(journey.nextStep.id, 'practice');

const library = buildMaterialsLibrary({ enrollments });
assert.equal(library.length, 1);
assert.equal(library[0].groups.length, 3);
assert.equal(library[0].groups.find((group) => group.id === 'practice').modules.length, 1);

const state = buildStudentJourneyState({
  enrollments,
  profile: { target_role: 'analista', target_specialty_id: 'specialty-1' },
  progress,
  plan,
  essayThemes: [{ id: 'theme-1' }],
  flashcardDecks: [{ flashcards: [{ id: 'card-1' }] }],
});
assert.equal(state.hasActiveEnrollment, true);
assert.equal(state.reviewQueue.length, 3);
assert.equal(state.subjectPerformance[0].title, 'SUAS');

console.log('test-student-journey-intelligence: ok');
