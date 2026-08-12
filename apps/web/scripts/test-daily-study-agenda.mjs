import assert from 'node:assert/strict';
import { buildDailyStudyAgenda } from '../src/api/dailyStudyAgenda.js';

const today = new Date(2026, 7, 12, 10, 0, 0);
const planItems = [
  { id: 'late', title: 'Tarefa atrasada', scheduled_date: '2026-08-11', duration_minutes: 30, completed: false },
  { id: 'today', title: 'Tarefa de hoje', scheduled_date: '2026-08-12', duration_minutes: 45, completed: false },
  { id: 'future', title: 'Tarefa futura', scheduled_date: '2026-08-13', duration_minutes: 60, completed: false },
  { id: 'done', title: 'Tarefa concluída', scheduled_date: '2026-08-10', duration_minutes: 20, completed: true },
];
const progress = { answered: 5, review: [{ id: 'error-1' }] };
const flashcardDecks = [{ flashcards: [
  { id: 'new', progress: null },
  { id: 'due', progress: { next_review_at: '2026-08-12T09:00:00.000Z' } },
  { id: 'future', progress: { next_review_at: '2026-08-13T09:00:00.000Z' } },
] }];

const agenda = buildDailyStudyAgenda({ planItems, progress, flashcardDecks, today });
assert.equal(agenda.overdueCount, 1);
assert.equal(agenda.plannedMinutes, 75);
assert.equal(agenda.reviewCount, 1);
assert.equal(agenda.flashcardCount, 2);
assert.deepEqual(agenda.items.map((item) => item.kind), ['plan', 'plan', 'review', 'flashcards']);
assert.match(agenda.items[0].description, /atrasada/);
assert.match(agenda.items[1].description, /planejada para hoje/);
assert.ok(agenda.items.every((item) => !item.title.includes('futura')));

const diagnostic = buildDailyStudyAgenda({ today, progress: { answered: 0, review: [] } });
assert.equal(diagnostic.items.length, 1);
assert.equal(diagnostic.items[0].kind, 'diagnostic');

const practice = buildDailyStudyAgenda({ today, progress: { answered: 3, review: [] } });
assert.equal(practice.items.length, 1);
assert.equal(practice.items[0].kind, 'practice');

console.log('Agenda diária inteligente: 12 verificações aprovadas.');
