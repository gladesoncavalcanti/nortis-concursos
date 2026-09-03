import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  buildSavedSimulationAnswers,
  buildSimulationReportCard,
  findOpenSimulationSession,
  formatSimulationTime,
  getSimulationRemainingSeconds,
} from '../src/api/simulationSessionModel.js';

const sessions = [
  { id: 'old', simulation_id: 'sim-1', status: 'in_progress', started_at: '2026-08-11T10:00:00Z' },
  { id: 'new', simulation_id: 'sim-1', status: 'in_progress', started_at: '2026-08-11T11:00:00Z' },
  { id: 'done', simulation_id: 'sim-1', status: 'completed', started_at: '2026-08-11T12:00:00Z' },
  { id: 'other', simulation_id: 'sim-2', status: 'in_progress', started_at: '2026-08-11T13:00:00Z' },
];
assert.equal(findOpenSimulationSession(sessions, 'sim-1').id, 'new');
assert.equal(findOpenSimulationSession(sessions, 'missing'), null);

const saved = buildSavedSimulationAnswers([
  { session_id: 'new', question_id: 'q1', selected_option_id: 'a' },
  { session_id: 'other', question_id: 'q2', selected_option_id: 'b' },
], 'new');
assert.deepEqual(saved, { q1: 'a' });

const now = new Date('2026-08-11T11:30:00Z');
assert.equal(getSimulationRemainingSeconds('2026-08-11T11:00:00Z', 60, now), 1800);
assert.equal(getSimulationRemainingSeconds('2026-08-11T10:00:00Z', 60, now), 0);
assert.equal(getSimulationRemainingSeconds('invalid', 60, now), 0);
assert.equal(getSimulationRemainingSeconds('2026-08-11T11:00:00Z', null, now), null);
assert.equal(formatSimulationTime(1800), '30:00');
assert.equal(formatSimulationTime(65), '01:05');
assert.equal(formatSimulationTime(0), '00:00');
assert.equal(formatSimulationTime(null), 'Sem limite de tempo');

const report = buildSimulationReportCard([
  { id: 'a', simulation_id: 'sim-1', status: 'completed', completed_at: '2026-08-11T10:00:00Z', correct_count: 6, question_count: 10 },
  { id: 'b', simulation_id: 'sim-1', status: 'completed', completed_at: '2026-08-12T10:00:00Z', correct_count: 8, question_count: 10 },
  { id: 'c', simulation_id: 'sim-2', status: 'completed', completed_at: '2026-08-12T10:00:00Z', correct_count: 1, question_count: 10 },
], 'sim-1');
assert.equal(report.attempts, 2);
assert.equal(report.latest.id, 'b');
assert.equal(report.accuracy, 80);
assert.equal(report.previousAccuracy, 60);
assert.equal(report.delta, 20);
assert.equal(report.status, 'stable');

const migrationPath = fileURLToPath(new URL('../../../supabase/migrations/20260811105713_improve_simulation_session_resume.sql', import.meta.url));
const sql = readFileSync(migrationPath, 'utf8');
assert.match(sql, /simulation_answers_self_read/i);
assert.match(sql, /session\.user_id = \(select auth\.uid\(\)\)/i);
assert.match(sql, /session\.status = 'in_progress'/i);
assert.match(sql, /order by session\.started_at desc/i);
assert.match(sql, /if v_session_id is null then[\s\S]*insert into public\.simulation_sessions/i);
assert.match(sql, /make_interval\(mins => simulation\.time_limit_minutes\)/i);
assert.match(sql, /enrollment\.status = 'active'/i);
assert.match(sql, /enrollment\.expires_at is null or enrollment\.expires_at > now\(\)/i);
assert.match(sql, /on conflict\(session_id, question_id\) do update/i);
assert.match(sql, /set search_path = ''/i);
assert.match(sql, /revoke all on function public\.start_simulation/i);
assert.match(sql, /grant execute on function public\.finish_simulation\(uuid\) to authenticated/i);

console.log('Retomada de simulado: 23 verificações aprovadas.');
