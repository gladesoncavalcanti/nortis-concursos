import assert from 'node:assert/strict';
import { summarizeProgress } from '../src/api/progressSummary.js';

const summary = summarizeProgress([
  { question_id: 'a', is_correct: false, answered_at: '2026-08-10T10:00:00Z' },
  { question_id: 'a', is_correct: true, answered_at: '2026-08-09T10:00:00Z' },
  { question_id: 'b', is_correct: true, answered_at: '2026-08-08T10:00:00Z' },
], [{ status: 'completed', completed_at: '2026-08-10T12:00:00Z', simulations: { title: 'Simulado piloto' } }, { status: 'in_progress' }], [], new Date('2026-08-10T15:00:00Z'), [
  { title: 'Revisar SUAS', completed: true, completed_at: '2026-08-07T18:00:00Z' },
  { title: 'Pendente', completed: false, completed_at: null },
]);

assert.equal(summary.answered, 3);
assert.equal(summary.correct, 2);
assert.equal(summary.accuracy, 67);
assert.equal(summary.completedSimulations, 1);
assert.equal(summary.streak, 4);
assert.equal(summary.achievements.find((item) => item.id === 'first-step').unlocked, true);
assert.equal(summary.achievements.find((item) => item.id === 'streak-3').unlocked, true);
assert.equal(summary.contentDiagnosis[0].title, 'Conteúdo geral');
assert.equal(summary.contentDiagnosis[0].answered, 2);
assert.equal(summary.contentDiagnosis[0].evidence, 'collecting');
assert.deepEqual(summary.review.map((item) => item.question_id), ['a']);
assert.equal(summary.activity.days.length, 7);
assert.equal(summary.activity.days.at(-1).date, '2026-08-10');
assert.equal(summary.activity.days.at(-1).total, 2);
assert.equal(summary.activity.days[3].plan, 1);
assert.equal(summary.activity.recent[0].type, 'simulation');
assert.match(summary.activity.recent[0].label, /Simulado piloto/);
assert.equal(summary.activity.recent.some((item) => item.label.includes('Pendente')), false);
assert.deepEqual(summarizeProgress([], []).review, []);

const withStudyTime = summarizeProgress([], [], [], new Date(2026, 7, 12, 12), [
  { id: 'plan-a', title: 'Plano A', scheduled_date: '2026-08-12', duration_minutes: 30, completed: false },
], [
  { study_plan_item_id: 'plan-a', started_at: '2026-08-12T13:00:00Z', ended_at: '2026-08-12T13:15:00Z', duration_seconds: 900 },
]);
assert.equal(withStudyTime.studyTime.totalTrackedMinutes, 15);
assert.equal(withStudyTime.studyTime.totalPlannedMinutes, 30);

const correctedInReview = summarizeProgress([
  { question_id: 'diagnostic-a', is_correct: true, answered_at: '2026-08-10T12:00:00Z', attempt_context: 'practice' },
  { question_id: 'diagnostic-a', is_correct: false, answered_at: '2026-08-10T10:00:00Z', attempt_context: 'diagnostic' },
], []);
assert.deepEqual(correctedInReview.review, []);
assert.equal(correctedInReview.contentDiagnosis[0].accuracy, 100);

const stillPending = summarizeProgress([
  { question_id: 'diagnostic-b', is_correct: false, answered_at: '2026-08-10T12:00:00Z', attempt_context: 'practice' },
  { question_id: 'diagnostic-b', is_correct: false, answered_at: '2026-08-10T10:00:00Z', attempt_context: 'diagnostic' },
], []);
assert.deepEqual(stillPending.review.map((item) => item.question_id), ['diagnostic-b']);

console.log('Progress summary e atividade: 22 verificações aprovadas.');
