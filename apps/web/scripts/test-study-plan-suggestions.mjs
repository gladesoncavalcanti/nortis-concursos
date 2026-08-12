import assert from 'node:assert/strict';
import { buildSuggestedStudyItems } from '../src/api/studyPlanSuggestions.js';

const items = buildSuggestedStudyItems({
  profile: { daily_minutes: 120, primary_difficulty: 'legislacao' },
  progress: { answered: 10, review: [{}] },
  startDate: new Date('2026-08-10T12:00:00Z'),
});
assert.equal(items.length, 5);
assert.equal(items[0].title, 'Revisar questões com erro');
assert.equal(items[0].duration_minutes, 60);
assert.equal(items[1].title, 'Revisar legislação prioritária');
assert.equal(items[0].scheduled_date, '2026-08-10');
assert.equal(items[4].title, 'Realizar simulado e analisar o resultado');

const beginner = buildSuggestedStudyItems({
  profile: { daily_minutes: 30, primary_difficulty: 'organizacao' },
  progress: { answered: 0, review: [] },
  startDate: new Date('2026-08-10T12:00:00Z'),
});
assert.equal(beginner.length, 3);
assert.equal(beginner[0].title, 'Revisar conteúdo prioritário');

const assessed = buildSuggestedStudyItems({
  profile: { daily_minutes: 45, primary_difficulty: 'organizacao' },
  progress: { answered: 0, review: [] },
  objectiveWeakSubjects: ['Rede SUAS'],
  selfReportedWeakSubjects: ['Rede SUAS', 'PAIF'],
  startDate: new Date('2026-08-10T12:00:00Z'),
});
assert.equal(assessed[0].title, 'Reforçar por desempenho: Rede SUAS');
assert.equal(assessed[1].title, 'Revisar por autoavaliação: PAIF');
assert.equal(assessed.filter((item) => item.title.includes('Rede SUAS')).length, 1);

const calibrated = buildSuggestedStudyItems({
  profile: { daily_minutes: 120, primary_difficulty: 'legislacao' },
  progress: { answered: 10, review: [{}] },
  objectiveWeakSubjects: ['SUAS'],
  weeklyBudgetMinutes: 75,
  startDate: new Date('2026-08-10T12:00:00Z'),
});
assert.equal(calibrated.length, 3);
assert.equal(calibrated.reduce((total, item) => total + item.duration_minutes, 0), 75);
assert.equal(calibrated.every((item) => item.duration_minutes >= 15), true);

const narrowBudget = buildSuggestedStudyItems({
  profile: { daily_minutes: 120 },
  progress: { answered: 0, review: [] },
  weeklyBudgetMinutes: 20,
  startDate: new Date('2026-08-10T12:00:00Z'),
});
assert.equal(narrowBudget.length, 1);
assert.equal(narrowBudget[0].duration_minutes, 20);

const noBudget = buildSuggestedStudyItems({
  profile: { daily_minutes: 120 },
  progress: { answered: 0, review: [] },
  weeklyBudgetMinutes: 10,
});
assert.deepEqual(noBudget, []);

const endOfWeek = buildSuggestedStudyItems({
  profile: { daily_minutes: 120 },
  progress: { answered: 10, review: [{}] },
  weeklyBudgetMinutes: 150,
  startDate: new Date('2026-08-15T12:00:00Z'),
  endDate: '2026-08-16',
});
assert.equal(endOfWeek.length, 5);
assert.equal(endOfWeek.every((item) => item.scheduled_date <= '2026-08-16'), true);
assert.equal(endOfWeek.at(-1).scheduled_date, '2026-08-16');

console.log('Study plan suggestions: sinais separados, orçamento e limite semanal aprovados.');
