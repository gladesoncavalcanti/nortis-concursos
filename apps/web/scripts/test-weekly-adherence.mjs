import assert from 'node:assert/strict';
import { buildWeeklyAdherence, filterPlanByActiveProducts } from '../src/api/weeklyAdherence.js';

const today = new Date(2026, 7, 11, 12, 0, 0);
const items = [
  { product_id: 'active', title: 'Segunda manual', scheduled_date: '2026-08-10', duration_minutes: 60, completed: true, item_source: 'manual' },
  { product_id: 'active', title: 'Hoje sugerida', scheduled_date: '2026-08-11', duration_minutes: 30, completed: false, item_source: 'suggested' },
  { product_id: 'active', title: 'Domingo sugerida', scheduled_date: '2026-08-16', duration_minutes: 40, completed: false, item_source: 'suggested' },
  { product_id: 'active', title: 'Carry-over', scheduled_date: '2026-08-09', duration_minutes: 20, completed: false, item_source: 'manual' },
  { product_id: 'active', title: 'Próxima semana', scheduled_date: '2026-08-17', duration_minutes: 90, completed: false, item_source: 'manual' },
  { product_id: 'active', title: 'Data inválida', scheduled_date: 'amanhã', duration_minutes: 480, completed: false, item_source: 'manual' },
];

const adherence = buildWeeklyAdherence({ items, today });
assert.equal(adherence.weekStart, '2026-08-10');
assert.equal(adherence.weekEnd, '2026-08-16');
assert.equal(adherence.plannedTasks, 3);
assert.equal(adherence.completedTasks, 1);
assert.equal(adherence.plannedMinutes, 130);
assert.equal(adherence.completedMinutes, 60);
assert.equal(adherence.adherencePercent, 46);
assert.equal(adherence.remainingMinutes, 70);
assert.equal(adherence.overdueTasks, 1);
assert.equal(adherence.manualTasks, 1);
assert.equal(adherence.suggestedTasks, 2);
assert.equal(adherence.guidance.status, 'attention');

const complete = buildWeeklyAdherence({
  today,
  items: [{ scheduled_date: '2026-08-11', duration_minutes: 30, completed: true, item_source: 'manual' }],
});
assert.equal(complete.adherencePercent, 100);
assert.equal(complete.guidance.status, 'complete');

const empty = buildWeeklyAdherence({ items: [], today });
assert.equal(empty.adherencePercent, 0);
assert.equal(empty.guidance.status, 'empty');

const carryOverOnly = buildWeeklyAdherence({
  today,
  items: [{ scheduled_date: '2026-08-09', duration_minutes: 20, completed: false, item_source: 'manual' }],
});
assert.equal(carryOverOnly.overdueTasks, 1);
assert.equal(carryOverOnly.remainingMinutes, 0);
assert.doesNotMatch(carryOverOnly.guidance.description, /0 minutos/);

const filtered = filterPlanByActiveProducts([
  { product_id: 'active', status: 'active', expires_at: '2026-08-12T00:00:00Z' },
  { product_id: 'permanent', status: 'active', expires_at: null },
  { product_id: 'expired', status: 'active', expires_at: '2026-08-10T00:00:00Z' },
  { product_id: 'revoked', status: 'revoked', expires_at: null },
], [
  { product_id: 'active' },
  { product_id: 'permanent' },
  { product_id: 'expired' },
  { product_id: 'revoked' },
], today);
assert.deepEqual(filtered.enrollments.map((item) => item.product_id), ['active', 'permanent']);
assert.deepEqual(filtered.items.map((item) => item.product_id), ['active', 'permanent']);

console.log('Aderência semanal: 21 verificações aprovadas.');
