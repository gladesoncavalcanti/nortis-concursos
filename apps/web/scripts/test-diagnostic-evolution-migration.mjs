import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const migration = readFileSync(resolve(
  import.meta.dirname,
  '../../../supabase/migrations/20260811004835_create_diagnostic_evolution_cycles.sql'
), 'utf8');

assert.match(migration, /create table public\.diagnostic_cycles/);
assert.match(migration, /unique \(user_id, product_id, specialty_id, cycle_number\)/);
assert.match(migration, /where status = 'open'/);
assert.match(migration, /insert into public\.diagnostic_cycles[\s\S]+?min\(attempt\.answered_at\)[\s\S]+?max\(attempt\.answered_at\)/);
assert.match(migration, /update public\.question_attempts attempt[\s\S]+?set diagnostic_cycle_id = cycle\.id/);
assert.match(migration, /drop index if exists public\.question_attempts_one_diagnostic_per_question_idx/);
assert.match(migration, /on public\.question_attempts\(diagnostic_cycle_id, question_id\)/);
assert.match(migration, /on conflict \(diagnostic_cycle_id, question_id\)[\s\S]+?do nothing/);
assert.match(migration, /diagnostic_cycle_required/);
assert.match(migration, /create policy "diagnostic_cycles_self_read"/);
assert.match(migration, /user_id = \(select auth\.uid\(\)\)/);
assert.match(migration, /enrollment\.status = 'active'/);
assert.match(migration, /enrollment\.expires_at is null or enrollment\.expires_at > now\(\)/);
assert.match(migration, /profile\.target_specialty_id = diagnostic_cycles\.specialty_id/);
assert.match(migration, /revoke all on public\.diagnostic_cycles from public, anon, authenticated/);
assert.match(migration, /grant select on public\.diagnostic_cycles to authenticated/);
assert.doesNotMatch(migration, /grant (insert|update|delete) on public\.diagnostic_cycles/i);
assert.match(migration, /create or replace function public\.start_diagnostic_cycle\(\)/);
assert.match(migration, /create or replace function public\.get_my_diagnostic_history\(\)/);
assert.match(migration, /security definer\s+set search_path = ''/);
assert.match(migration, /if v_user_id is null then raise exception 'authentication_required'/);
assert.match(migration, /specialty_mismatch/);
assert.match(migration, /set status = 'completed', completed_at = now\(\)/);
assert.match(migration, /revoke all on function public\.start_diagnostic_cycle\(\) from public, anon/);
assert.match(migration, /grant execute on function public\.start_diagnostic_cycle\(\) to authenticated/);
assert.doesNotMatch(migration, /checkout|asaas|payment|order_items|edge function|secret/i);

const attempts = new Map();
const submit = (cycle, question, correct) => {
  const key = `${cycle}:${question}`;
  if (!attempts.has(key)) attempts.set(key, correct);
  return attempts.get(key);
};
assert.equal(submit('cycle-1', 'question-1', false), false);
assert.equal(submit('cycle-1', 'question-1', true), false, 'duplicidade no mesmo ciclo não altera a evidência');
assert.equal(submit('cycle-2', 'question-1', true), true, 'a mesma questão pode ser respondida em uma reavaliação');
assert.equal(attempts.size, 2);

const now = new Date('2026-08-11T01:00:00Z');
const canReadCycle = ({ actorId, cycle, enrollment, profile }) => Boolean(
  actorId
  && actorId === cycle.userId
  && enrollment?.userId === actorId
  && enrollment.productId === cycle.productId
  && enrollment.status === 'active'
  && (!enrollment.expiresAt || new Date(enrollment.expiresAt) > now)
  && profile?.userId === actorId
  && profile.specialtyId === cycle.specialtyId
);
const cycle = { userId: 'student-a', productId: 'product-1', specialtyId: 'specialty-1' };
const activeEnrollment = { userId: 'student-a', productId: 'product-1', status: 'active', expiresAt: null };
const profile = { userId: 'student-a', specialtyId: 'specialty-1' };
assert.equal(canReadCycle({ actorId: null, cycle, enrollment: activeEnrollment, profile }), false, 'anon é bloqueado');
assert.equal(canReadCycle({ actorId: 'student-b', cycle, enrollment: activeEnrollment, profile }), false, 'outro aluno é isolado');
assert.equal(canReadCycle({ actorId: 'student-a', cycle, enrollment: null, profile }), false, 'matrícula ausente bloqueia');
assert.equal(canReadCycle({ actorId: 'student-a', cycle, enrollment: { ...activeEnrollment, status: 'revoked' }, profile }), false, 'matrícula revogada bloqueia');
assert.equal(canReadCycle({ actorId: 'student-a', cycle, enrollment: { ...activeEnrollment, expiresAt: '2026-08-10T23:00:00Z' }, profile }), false, 'matrícula expirada bloqueia');
assert.equal(canReadCycle({ actorId: 'student-a', cycle, enrollment: activeEnrollment, profile: { ...profile, specialtyId: 'specialty-2' } }), false, 'especialidade incompatível bloqueia');
assert.equal(canReadCycle({ actorId: 'student-a', cycle, enrollment: activeEnrollment, profile }), true, 'matrícula ativa e especialidade correta liberam');

console.log('Diagnostic evolution migration: histórico, ciclos, RLS e duplicidade aprovados.');
