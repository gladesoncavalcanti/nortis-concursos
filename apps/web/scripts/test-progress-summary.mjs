import assert from 'node:assert/strict';
import { summarizeProgress } from '../src/api/progressSummary.js';

const summary = summarizeProgress([
  { question_id: 'a', is_correct: false, answered_at: '2026-08-10T10:00:00Z' },
  { question_id: 'a', is_correct: true, answered_at: '2026-08-09T10:00:00Z' },
  { question_id: 'b', is_correct: true, answered_at: '2026-08-08T10:00:00Z' },
], [{ status: 'completed', completed_at: '2026-08-10T12:00:00Z' }, { status: 'in_progress' }], [], new Date('2026-08-10T15:00:00Z'));

assert.equal(summary.answered, 3);
assert.equal(summary.correct, 2);
assert.equal(summary.accuracy, 67);
assert.equal(summary.completedSimulations, 1);
assert.equal(summary.streak, 3);
assert.equal(summary.achievements.find((item) => item.id === 'first-step').unlocked, true);
assert.equal(summary.achievements.find((item) => item.id === 'streak-3').unlocked, true);
assert.equal(summary.contentDiagnosis[0].title, 'Conteúdo geral');
assert.equal(summary.contentDiagnosis[0].answered, 2);
assert.equal(summary.contentDiagnosis[0].evidence, 'collecting');
assert.deepEqual(summary.review.map((item) => item.question_id), ['a']);
assert.deepEqual(summarizeProgress([], []).review, []);
console.log('Progress summary: 12 verificações aprovadas.');
