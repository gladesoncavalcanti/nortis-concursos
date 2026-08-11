import assert from 'node:assert/strict';
import { buildNextBestAction } from '../src/api/nextBestAction.js';

const today = new Date(2026, 7, 11, 12, 0, 0);
const progress = { answered: 8, completedSimulations: 1, review: [] };

const planned = buildNextBestAction({
  progress,
  today,
  planItems: [
    { title: 'Tarefa concluída', scheduled_date: '2026-08-09', duration_minutes: 30, completed: true },
    { title: 'Tarefa de hoje', scheduled_date: '2026-08-11', duration_minutes: 45, completed: false },
    { title: 'Tarefa atrasada', scheduled_date: '2026-08-10', duration_minutes: 20, completed: false },
  ],
});
assert.equal(planned.kind, 'planned');
assert.equal(planned.title, 'Tarefa atrasada');
assert.equal(planned.route, '/minha-conta/plano');
assert.match(planned.description, /1 tarefa atrasada/);

const review = buildNextBestAction({
  progress: { ...progress, review: [{ question_id: 'a' }, { question_id: 'b' }] },
  today,
  planItems: [{ title: 'Futura', scheduled_date: '2026-08-12', duration_minutes: 30, completed: false }],
});
assert.equal(review.kind, 'review');
assert.match(review.title, /2 questões pendentes/);

const diagnostic = buildNextBestAction({
  progress: { answered: 0, completedSimulations: 0, review: [] },
  today,
});
assert.equal(diagnostic.kind, 'diagnostic');
assert.equal(diagnostic.route, '/minha-conta/diagnostico');

const simulation = buildNextBestAction({
  progress: { answered: 5, completedSimulations: 0, review: [] },
  today,
});
assert.equal(simulation.kind, 'simulation');

const plan = buildNextBestAction({ progress, today, planItems: [] });
assert.equal(plan.kind, 'plan');

const practice = buildNextBestAction({
  progress,
  today,
  planItems: [
    { title: 'Data inválida', scheduled_date: 'amanhã', duration_minutes: 30, completed: false },
    { title: 'Tarefa futura', scheduled_date: '2026-08-12', duration_minutes: 30, completed: false },
  ],
});
assert.equal(practice.kind, 'practice');
assert.equal(practice.route, '/minha-conta/questoes');

console.log('Próximo melhor passo: 12 verificações aprovadas.');
