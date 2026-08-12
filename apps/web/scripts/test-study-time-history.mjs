import assert from 'node:assert/strict';
import { buildStudyTimeHistory } from '../src/api/studyTimeHistory.js';

const now = new Date(2026, 7, 12, 12, 0, 0);
const items = [
  { id: 'task-current', scheduled_date: '2026-08-12', duration_minutes: 60, completed: false, title: 'Revisar PAIF', syllabus_nodes: { title: 'PAIF' } },
  { id: 'task-recent', scheduled_date: '2026-08-05', duration_minutes: 90, completed: true, title: 'Estudar SUAS', syllabus_nodes: { title: 'SUAS' } },
  { id: 'task-previous', scheduled_date: '2026-07-29', duration_minutes: 60, completed: true, title: 'Revisar direitos', syllabus_nodes: null },
  { id: 'task-old', scheduled_date: '2026-06-25', duration_minutes: 30, completed: false, title: 'Tarefa antiga', syllabus_nodes: { title: 'Antigo' } },
  { id: 'task-future', scheduled_date: '2026-08-17', duration_minutes: 480, completed: false, title: 'Fora do período' },
  { id: 'task-invalid', scheduled_date: 'amanhã', duration_minutes: 480, completed: false, title: 'Data inválida' },
];
const sessions = [
  { id: 'current-a', study_plan_item_id: 'task-current', started_at: '2026-08-12T13:00:00Z', ended_at: '2026-08-12T13:30:00Z', duration_seconds: 1800 },
  { id: 'current-b', study_plan_item_id: 'task-current', started_at: '2026-08-12T14:00:00Z', ended_at: '2026-08-12T14:10:30Z', duration_seconds: 630 },
  { id: 'active', study_plan_item_id: 'task-current', started_at: '2026-08-12T15:00:00Z', ended_at: null, duration_seconds: null },
  { id: 'recent', study_plan_item_id: 'task-recent', started_at: '2026-08-05T13:00:00Z', ended_at: '2026-08-05T14:20:00Z', duration_seconds: 4800 },
  { id: 'previous', study_plan_item_id: 'task-previous', started_at: '2026-07-29T13:00:00Z', ended_at: '2026-07-29T13:30:00Z', duration_seconds: 1800 },
  { id: 'unlinked', study_plan_item_id: null, started_at: '2026-08-04T13:00:00Z', ended_at: '2026-08-04T13:10:00Z', duration_seconds: 600 },
  { id: 'outside', study_plan_item_id: 'task-old', started_at: '2026-06-15T13:00:00Z', ended_at: '2026-06-15T14:00:00Z', duration_seconds: 3600 },
  { id: 'invalid-date', study_plan_item_id: 'task-current', started_at: 'invalid', ended_at: '2026-08-12T16:00:00Z', duration_seconds: 300 },
];

const history = buildStudyTimeHistory({ sessions, items, now });
assert.equal(history.weeks.length, 8);
assert.equal(history.periodStart, '2026-06-22');
assert.equal(history.periodEnd, '2026-08-16');
assert.equal(history.completedSessions, 5);
assert.equal(history.activeSessions, 1);
assert.equal(history.totalTrackedSeconds, 9630);
assert.equal(history.totalTrackedMinutes, 160);
assert.equal(history.totalPlannedMinutes, 240);
assert.equal(history.hasData, true);

const currentWeek = history.weeks.at(-1);
assert.equal(currentWeek.start, '2026-08-10');
assert.equal(currentWeek.plannedMinutes, 60);
assert.equal(currentWeek.trackedSeconds, 2430);
assert.equal(currentWeek.trackedMinutes, 40);
assert.equal(currentWeek.executionPercent, 67);
assert.equal(currentWeek.completedTasks, 0);

const recentWeek = history.weeks.at(-2);
assert.equal(recentWeek.plannedMinutes, 90);
assert.equal(recentWeek.completedMinutes, 90);
assert.equal(recentWeek.trackedMinutes, 90);
assert.equal(history.trend.status, 'improving');
assert.equal(history.trend.deltaMinutes, 60);

assert.equal(history.days.length, 7);
assert.equal(history.days.at(-1).date, '2026-08-12');
assert.equal(history.days.at(-1).trackedSeconds, 2430);
assert.equal(history.days.at(-1).sessions, 2);

assert.equal(history.taskGroups[0].title, 'Estudar SUAS');
assert.equal(history.taskGroups.find((task) => task.id === 'task-current').trackedMinutes, 40);
assert.equal(history.taskGroups.find((task) => task.id === 'task-previous').contentTitle, 'Sem conteúdo vinculado');
assert.equal(history.taskGroups.some((task) => task.title === 'Sessão sem tarefa vinculada'), true);
assert.equal(history.contentGroups.find((content) => content.title === 'PAIF').trackedMinutes, 40);
assert.equal(history.contentGroups.find((content) => content.title === 'Sem conteúdo vinculado').sessions, 2);

const stable = buildStudyTimeHistory({
  now,
  items: [],
  sessions: [
    { started_at: '2026-07-29T13:00:00Z', ended_at: '2026-07-29T14:00:00Z', duration_seconds: 3600 },
    { started_at: '2026-08-05T13:00:00Z', ended_at: '2026-08-05T14:03:00Z', duration_seconds: 3780 },
  ],
});
assert.equal(stable.trend.status, 'stable');

const declining = buildStudyTimeHistory({
  now,
  items: [],
  sessions: [
    { started_at: '2026-07-29T13:00:00Z', ended_at: '2026-07-29T14:30:00Z', duration_seconds: 5400 },
    { started_at: '2026-08-05T13:00:00Z', ended_at: '2026-08-05T13:20:00Z', duration_seconds: 1200 },
  ],
});
assert.equal(declining.trend.status, 'reinforce');

const empty = buildStudyTimeHistory({ sessions: [], items: [], now });
assert.equal(empty.hasData, false);
assert.equal(empty.trend.status, 'collecting');
assert.equal(empty.taskGroups.length, 0);

console.log('Histórico de tempo real: 38 verificações de cálculo e agrupamento aprovadas.');
