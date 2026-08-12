import assert from 'node:assert/strict';
import { buildStudyCapacity } from '../src/api/studyCapacity.js';
import { buildStudyTimeHistory } from '../src/api/studyTimeHistory.js';

const now = new Date(2026, 7, 12, 12, 0, 0);
const history = buildStudyTimeHistory({
  now,
  items: [],
  sessions: [
    { started_at: '2026-07-29T13:00:00Z', ended_at: '2026-07-29T14:00:00Z', duration_seconds: 3600 },
    { started_at: '2026-08-05T13:00:00Z', ended_at: '2026-08-05T14:30:00Z', duration_seconds: 5400 },
    { started_at: '2026-08-12T13:00:00Z', ended_at: '2026-08-12T18:00:00Z', duration_seconds: 18000 },
    { started_at: '2026-08-12T19:00:00Z', ended_at: null, duration_seconds: null },
  ],
});
const capacity = buildStudyCapacity({
  profile: { daily_minutes: 120 },
  history,
  items: [
    { scheduled_date: '2026-08-11', duration_minutes: 15, item_source: 'manual' },
    { product_id: 'product-a', scheduled_date: '2026-08-12', duration_minutes: 90, item_source: 'suggested' },
    { product_id: 'product-b', scheduled_date: '2026-08-13', duration_minutes: 30, item_source: 'suggested' },
    { scheduled_date: '2026-08-18', duration_minutes: 300, item_source: 'manual' },
  ],
  replaceSuggestedProductId: 'product-a',
});

assert.equal(capacity.source, 'history');
assert.equal(capacity.sampleWeeks, 2);
assert.equal(capacity.observedWeeklyMinutes, 75);
assert.equal(capacity.profileWeeklyMinutes, 600);
assert.equal(capacity.weeklyTargetMinutes, 75);
assert.equal(capacity.manualMinutes, 15);
assert.equal(capacity.preservedSuggestedMinutes, 30);
assert.equal(capacity.committedMinutes, 45);
assert.equal(capacity.remainingMinutes, 30);
assert.equal(capacity.weekStart, '2026-08-10');
assert.equal(capacity.weekEnd, '2026-08-16');

const limitedByProfile = buildStudyCapacity({
  profile: { daily_minutes: 30 },
  history: {
    weeks: [
      { start: '2026-07-27', end: '2026-08-02', trackedMinutes: 300 },
      { start: '2026-08-03', end: '2026-08-09', trackedMinutes: 360 },
      { start: '2026-08-10', end: '2026-08-16', trackedMinutes: 0 },
    ],
  },
});
assert.equal(limitedByProfile.observedWeeklyMinutes, 330);
assert.equal(limitedByProfile.weeklyTargetMinutes, 150);

const fallback = buildStudyCapacity({
  profile: { daily_minutes: 60 },
  history: {
    weeks: [
      { start: '2026-08-03', end: '2026-08-09', trackedMinutes: 45 },
      { start: '2026-08-10', end: '2026-08-16', trackedMinutes: 500 },
    ],
  },
});
assert.equal(fallback.source, 'profile');
assert.equal(fallback.sampleWeeks, 1);
assert.equal(fallback.weeklyTargetMinutes, 300);
assert.equal(fallback.observedWeeklyMinutes, null);

const filledByManual = buildStudyCapacity({
  profile: { daily_minutes: 30 },
  history: fallback.source === 'profile' ? {
    weeks: [
      { start: '2026-08-03', end: '2026-08-09', trackedMinutes: 0 },
      { start: '2026-08-10', end: '2026-08-16', trackedMinutes: 0 },
    ],
  } : null,
  items: [{ scheduled_date: '2026-08-10', duration_minutes: 180, item_source: 'manual' }],
});
assert.equal(filledByManual.remainingMinutes, 0);

console.log('Capacidade semanal: histórico, perfil, múltiplos produtos e tarefas manuais aprovados.');
