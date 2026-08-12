import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  formatStudySessionDuration,
  getStudySessionElapsedSeconds,
  getStudySessionWindowStart,
} from '../src/api/studySessionModel.js';

assert.equal(getStudySessionElapsedSeconds('2026-08-11T10:00:00Z', new Date('2026-08-11T10:01:05Z')), 65);
assert.equal(getStudySessionElapsedSeconds('invalid', new Date('2026-08-11T10:01:05Z')), 0);
assert.equal(getStudySessionElapsedSeconds('2026-08-11T10:02:00Z', new Date('2026-08-11T10:01:05Z')), 0);
assert.equal(formatStudySessionDuration(65), '00:01:05');
assert.equal(formatStudySessionDuration(3661), '01:01:01');
assert.equal(formatStudySessionDuration(-1), '00:00:00');

const monday = getStudySessionWindowStart(new Date(2026, 7, 11, 12, 0, 0));
assert.equal(new Date(monday).getDay(), 1);
assert.equal(new Date(monday).getHours(), 0);

const migrationPath = fileURLToPath(new URL(
  '../../../supabase/migrations/20260812013514_create_study_sessions.sql',
  import.meta.url
));
const sql = readFileSync(migrationPath, 'utf8');

assert.match(sql, /create table public\.study_sessions/i);
assert.match(sql, /where ended_at is null/i);
assert.match(sql, /ended_at is null or ended_at >= started_at/i);
assert.match(sql, /study_sessions_plan_item_idx[\s\S]*where study_plan_item_id is not null/i);
assert.match(sql, /enable row level security/i);
assert.match(sql, /user_id = \(select auth\.uid\(\)\)/i);
assert.match(sql, /enrollment\.status = 'active'/i);
assert.match(sql, /enrollment\.expires_at is null or enrollment\.expires_at > now\(\)/i);
assert.match(sql, /revoke all on public\.study_sessions from anon, authenticated/i);
assert.match(sql, /grant select on public\.study_sessions to authenticated/i);
assert.doesNotMatch(sql, /grant (insert|update|delete)[^;]*study_sessions to authenticated/i);
assert.match(sql, /create or replace function public\.start_study_session/i);
assert.match(sql, /create or replace function public\.finish_study_session/i);
assert.match(sql, /security definer[\s\S]*set search_path = ''/i);
assert.match(sql, /item\.user_id = v_user_id/i);
assert.match(sql, /session\.user_id = v_user_id/i);
assert.match(sql, /exception when unique_violation/i);
assert.match(sql, /floor\(extract\(epoch from \(now\(\) - session\.started_at\)\)\)/i);
assert.match(sql, /least\([\s\S]*28800/i);
assert.match(sql, /revoke all on function public\.start_study_session\(uuid\) from public, anon/i);
assert.match(sql, /grant execute on function public\.finish_study_session\(uuid\) to authenticated/i);

console.log('Sessões de estudo: 28 verificações de cálculo, segurança e persistência aprovadas.');
