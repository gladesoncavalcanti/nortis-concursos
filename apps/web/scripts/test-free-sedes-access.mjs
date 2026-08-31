import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const read = (url) => readFileSync(fileURLToPath(url), 'utf8');

const migration = read(new URL(
  '../../../supabase/migrations/20260830090000_create_claim_free_sedes_access.sql',
  import.meta.url
));
const enrollmentsApi = read(new URL('../src/api/enrollments.js', import.meta.url));
const cta = read(new URL('../src/components/FreeSedesAccessCta.jsx', import.meta.url));
const materiais = read(new URL('../src/pages/MateriaisGratuitosPage.jsx', import.meta.url));
const sprint = read(new URL('../src/pages/SprintDiscursivaPage.jsx', import.meta.url));
const account = read(new URL('../src/pages/MyAccountPage.jsx', import.meta.url));
const migrationWithoutComments = migration
  .split('\n')
  .filter((line) => !line.trimStart().startsWith('--'))
  .join('\n');
const stripJsComments = (source) =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('//'))
    .join('\n');
const enrollmentsApiWithoutComments = stripJsComments(enrollmentsApi);

// Migration: função protegida, idempotente e restrita ao produto oficial.
assert.match(migration, /create or replace function public\.claim_free_sedes_df_access\(\)/);
assert.match(migration, /security definer/);
assert.match(migration, /set search_path = public/);
assert.match(migration, /v_user_id uuid := auth\.uid\(\)/);
assert.match(migration, /authentication_required/);
assert.match(migration, /product\.slug = 'nexo-social-sedes-df-2026'/);
assert.match(migration, /product\.active = true/);
assert.match(migration, /insert into public\.enrollments/);
assert.match(migration, /order_id,\s*\n\s*status,\s*\n\s*expires_at/);
assert.match(migration, /null,\s*\n\s*'active',\s*\n\s*null/);
assert.match(migration, /if v_existing\.status = 'revoked' then/);
assert.match(migration, /raise exception 'access_revoked'/);
assert.match(migration, /set status = 'active',\s*\n\s*expires_at = null/);
assert.match(migration, /revoke all on function public\.claim_free_sedes_df_access\(\) from public;/);
assert.match(migration, /revoke all on function public\.claim_free_sedes_df_access\(\) from anon;/);
assert.match(migration, /grant execute on function public\.claim_free_sedes_df_access\(\) to authenticated;/);
assert.doesNotMatch(migrationWithoutComments, /\b(insert into|update|delete from|drop table|alter table)\s+public\.orders?\b/i);
assert.doesNotMatch(migrationWithoutComments, /\b(insert into|update|delete from|drop table|alter table)\s+public\.order_items\b/i);
assert.doesNotMatch(migrationWithoutComments, /\basaas\b/i);
assert.doesNotMatch(migrationWithoutComments, /\bdrop\b|\btruncate\b|\bdelete\b/i);

// Frontend: não cria matrícula diretamente; chama RPC.
assert.match(enrollmentsApi, /export async function claimFreeSedesAccess\(\)/);
assert.match(enrollmentsApi, /supabase\.rpc\('claim_free_sedes_df_access'\)/);
assert.doesNotMatch(enrollmentsApiWithoutComments, /from\('orders'\)|from\('order_items'\)|asaas/i);
assert.doesNotMatch(enrollmentsApiWithoutComments, /from\('enrollments'\)\.insert/);

// CTA: anônimo vai para cadastro; autenticado chama a RPC.
assert.match(cta, /useAuth\(\)/);
assert.match(cta, /navigate\('\/signup'\)/);
assert.match(cta, /claimFreeSedesAccess\(\)/);
assert.match(cta, /navigate\('\/minha-conta'\)/);

// Páginas expõem o fluxo gratuito e preservam a separação da Sprint paga.
assert.match(materiais, /FreeSedesAccessCta/);
assert.match(materiais, /edital verticalizado, questões autorais,\s*\n\s*simulados, flashcards, plano de estudos e treino discursivo inicial/);
assert.match(materiais, /sem compra online nesta liberação/);
assert.match(sprint, /FreeSedesAccessCta/);
assert.match(sprint, /A Sprint Discursiva com correção humana permanece em lista de interesse/);
assert.match(account, /FreeSedesAccessCta/);
assert.match(account, /onClaimed=\{reloadEnrollments\}/);

console.log('Acesso gratuito SEDES-DF: verificações estáticas aprovadas.');
