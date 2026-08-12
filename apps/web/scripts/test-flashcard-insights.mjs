import assert from 'node:assert/strict';
import { buildFlashcardInsights } from '../src/api/flashcardInsights.js';

const now = new Date('2026-08-12T12:00:00.000Z');
const decks = [{ flashcards: [
  { id: 'new', progress: null },
  { id: 'due', progress: { repetitions: 1, last_reviewed_at: '2026-08-11T10:00:00.000Z', next_review_at: '2026-08-12T10:00:00.000Z' } },
  { id: 'learning', progress: { repetitions: 2, last_reviewed_at: '2026-08-12T08:00:00.000Z', next_review_at: '2026-08-13T08:00:00.000Z' } },
  { id: 'repeated', progress: { repetitions: 4, last_reviewed_at: '2026-08-10T08:00:00.000Z', next_review_at: '2026-08-14T08:00:00.000Z' } },
] }];

const insights = buildFlashcardInsights(decks, now);
assert.equal(insights.total, 4);
assert.equal(insights.reviewed, 3);
assert.equal(insights.newCount, 1);
assert.equal(insights.dueCount, 2);
assert.equal(insights.scheduledCount, 2);
assert.equal(insights.startedCount, 2);
assert.equal(insights.repeatedCount, 1);
assert.equal(insights.nextReviewAt, '2026-08-13T08:00:00.000Z');
assert.deepEqual(buildFlashcardInsights([], now), {
  total: 0,
  reviewed: 0,
  newCount: 0,
  dueCount: 0,
  scheduledCount: 0,
  startedCount: 0,
  repeatedCount: 0,
  nextReviewAt: null,
});

console.log('Métricas de flashcards: 16 verificações aprovadas.');

