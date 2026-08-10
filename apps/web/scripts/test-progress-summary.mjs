import assert from 'node:assert/strict';
import { summarizeProgress } from '../src/api/progressSummary.js';

const summary = summarizeProgress([
  { question_id: 'a', is_correct: false },
  { question_id: 'a', is_correct: true },
  { question_id: 'b', is_correct: true },
], [{ status: 'completed' }, { status: 'in_progress' }]);

assert.equal(summary.answered, 3);
assert.equal(summary.correct, 2);
assert.equal(summary.accuracy, 67);
assert.equal(summary.completedSimulations, 1);
assert.deepEqual(summary.review.map((item) => item.question_id), ['a']);
assert.deepEqual(summarizeProgress([], []).review, []);
console.log('Progress summary: 6 verificações aprovadas.');
