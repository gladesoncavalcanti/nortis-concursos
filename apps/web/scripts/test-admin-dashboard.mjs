import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const read = (relativePath) =>
  readFileSync(fileURLToPath(new URL(`../src/${relativePath}`, import.meta.url)), 'utf8').replace(/\r\n/g, '\n');

const migration = readFileSync(
  fileURLToPath(new URL('../../../supabase/migrations/20260831023000_create_admin_dashboard_rpc.sql', import.meta.url)),
  'utf8'
).replace(/\r\n/g, '\n');
const migrationSql = migration
  .split('\n')
  .filter((line) => !line.trimStart().startsWith('--'))
  .join('\n');

const api = read('api/adminDashboard.js');
const page = read('pages/AdminDashboardPage.jsx');
const app = read('App.jsx');
const header = read('components/Header.jsx');

assert.match(migration, /create or replace function public\.get_admin_dashboard\(\)/);
assert.match(migration, /returns jsonb/);
assert.match(migration, /security definer/);
assert.match(migration, /set search_path = ''/);
assert.match(migration, /v_user_id uuid := auth\.uid\(\)/);
assert.match(migration, /profile\.role = 'admin'/);
assert.match(migration, /admin_access_required/);
assert.match(migration, /revoke all on function public\.get_admin_dashboard\(\) from public;/);
assert.match(migration, /revoke all on function public\.get_admin_dashboard\(\) from anon;/);
assert.match(migration, /grant execute on function public\.get_admin_dashboard\(\) to authenticated;/);

for (const table of [
  'free_sample_leads',
  'discursive_interest_leads',
  'contest_interest_leads',
  'enrollments',
  'student_study_profiles',
  'question_attempts',
  'simulation_sessions',
  'study_sessions',
  'essay_submissions',
]) {
  assert.match(migration, new RegExp(`public\\.${table}`), `painel deve ler ${table}`);
}

assert.doesNotMatch(migrationSql, /grant\s+(select|insert|update|delete|all)\s+on\s+(table\s+)?public\./i);
assert.doesNotMatch(migrationSql, /create policy|drop policy|row level security/i);
assert.doesNotMatch(migrationSql, /\bupdate\s+public\.|\binsert\s+into\s+public\.|\bdelete\s+from\s+public\.|\bdrop\b|\btruncate\b/i);
assert.doesNotMatch(migrationSql, /asaas|checkout|payment|pagamento|pedido|order_items|edge function|secret/i);

assert.match(api, /supabase\.rpc\('get_admin_dashboard'\)/);
assert.doesNotMatch(api, /from\('/);
assert.match(api, /admin_access_required/);

assert.match(page, /Admin Nortis/);
assert.match(page, /contest_interests_by_slug/);
assert.match(page, /recent_discursive_interest_leads/);
assert.match(page, /recent_contest_interest_leads/);
assert.match(page, /enrollments_by_product/);
assert.match(page, /study_profiles_by_target/);
assert.match(page, /Leitura restrita a contas\s+com perfil administrativo/);

assert.match(app, /import AdminDashboardPage from '@\/pages\/AdminDashboardPage\.jsx'/);
assert.match(app, /path="\/admin" element=\{<ProtectedRoute><AdminDashboardPage \/><\/ProtectedRoute>\}/);
assert.match(header, /to="\/admin"/);
assert.match(header, /title="Painel interno"/);

console.log('Painel admin: rota, RPC protegida e escopo de leitura aprovados.');
