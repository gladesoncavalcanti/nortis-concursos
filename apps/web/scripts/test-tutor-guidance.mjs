import assert from 'node:assert/strict';
import { buildTutorGuidance } from '../src/api/tutorGuidance.js';

const today = new Date(2026, 7, 11, 12, 0, 0);
const baseProgress = {
  answered: 10,
  accuracy: 80,
  completedSimulations: 1,
  streak: 3,
  review: [{ question_id: 'a' }],
};
const plannedItems = [
  { title: 'Tarefa concluída', scheduled_date: '2026-08-10', duration_minutes: 40, completed: true, item_source: 'manual' },
  { title: 'Tarefa de hoje', scheduled_date: '2026-08-11', duration_minutes: 60, completed: false, item_source: 'suggested' },
];

const diagnostic = buildTutorGuidance({ progress: { ...baseProgress, answered: 0 }, intent: 'performance', today });
assert.equal(diagnostic.kind, 'diagnostic');
assert.equal(diagnostic.route, '/minha-conta/diagnostico');

const next = buildTutorGuidance({ progress: baseProgress, planItems: plannedItems, intent: 'next', today });
assert.equal(next.kind, 'planned');
assert.equal(next.title, 'Tarefa de hoje');
assert.equal(next.route, '/minha-conta/plano');

const review = buildTutorGuidance({ progress: baseProgress, planItems: plannedItems, intent: 'review', today });
assert.equal(review.kind, 'review');
assert.match(review.message, /1 questão pendente/);
assert.equal(review.route, '/minha-conta/progresso');

const overdueReview = buildTutorGuidance({
  progress: { ...baseProgress, review: [] },
  planItems: [{ title: 'Atrasada', scheduled_date: '2026-08-09', duration_minutes: 30, completed: false }],
  intent: 'review',
  today,
});
assert.equal(overdueReview.kind, 'replan');
assert.equal(overdueReview.route, '/minha-conta/plano');

const cleanReview = buildTutorGuidance({ progress: { ...baseProgress, review: [] }, intent: 'review', today });
assert.equal(cleanReview.kind, 'memory');
assert.equal(cleanReview.route, '/minha-conta/flashcards');

const performance = buildTutorGuidance({ progress: baseProgress, planItems: plannedItems, intent: 'performance', today });
assert.equal(performance.kind, 'performance');
assert.match(performance.title, /desempenho objetivo/);
assert.match(performance.message, /80% de acerto/);
assert.match(performance.message, /40% dos minutos/);

const emptyWeek = buildTutorGuidance({ progress: baseProgress, planItems: [], intent: 'week', today });
assert.equal(emptyWeek.kind, 'plan');
assert.equal(emptyWeek.cta, 'Montar plano semanal');

const activeWeek = buildTutorGuidance({ progress: baseProgress, planItems: plannedItems, intent: 'week', today });
assert.equal(activeWeek.kind, 'week');
assert.match(activeWeek.message, /1 de 2 tarefas/);
assert.match(activeWeek.message, /60 minutos planejados/);

const completedWeek = buildTutorGuidance({
  progress: baseProgress,
  planItems: [{ title: 'Feita', scheduled_date: '2026-08-11', duration_minutes: 30, completed: true }],
  intent: 'week',
  today,
});
assert.equal(completedWeek.kind, 'week');
assert.match(completedWeek.title, /Semana concluída/);
assert.doesNotMatch(completedWeek.message, /0 minutos/);

const defaultIntent = buildTutorGuidance({ progress: baseProgress, planItems: [], intent: 'unknown', today });
assert.ok(defaultIntent.route.startsWith('/minha-conta/'));
assert.ok(defaultIntent.cta.length > 0);

console.log('Tutor adaptativo: 26 verificações aprovadas.');
