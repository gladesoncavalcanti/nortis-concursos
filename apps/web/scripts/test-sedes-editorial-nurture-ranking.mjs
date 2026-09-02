import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const migration = readFileSync(
  'supabase/migrations/20260902070000_create_sedes_editorial_nurture_ranking.sql',
  'utf8'
);
const libraryPage = readFileSync('apps/web/src/pages/MaterialsLibraryPage.jsx', 'utf8');
const onboardingPage = readFileSync('apps/web/src/pages/StudentOnboardingPage.jsx', 'utf8');
const progressPage = readFileSync('apps/web/src/pages/ProgressPage.jsx', 'utf8');

assert.match(migration, /create table if not exists public\.lead_nurture_preferences/);
assert.match(migration, /create table if not exists public\.lead_nurture_events/);
assert.match(migration, /create table if not exists public\.student_ranking_preferences/);
assert.match(migration, /upsert_my_lead_nurture_preferences/);
assert.match(migration, /upsert_my_ranking_preference/);
assert.match(migration, /get_student_opt_in_leaderboard/);
assert.match(migration, /create or replace function public\.get_admin_lead_nurture_queue\(\)/);
assert.match(migration, /email_opt_in_total/);
assert.match(migration, /nurture_events/);
assert.match(migration, /enabled = true/);
assert.match(migration, /< 3 then\s+return;/);
assert.doesNotMatch(migration, /sendgrid|twilio|resend|smtp|whatsapp_business|fetch\(/i);
assert.doesNotMatch(migration, /create-asaas|asaas|checkout|payment|pagamento|public\.orders|public\.order_items/i);

const extraQuestionSlugs = migration.match(/pratica-agente-social-(?:prontuario-suas|beneficio-eventual-acompanhamento|creas-violacao-direitos|abordagem-nao-higienista|crise-saude-mental-rede)/g) ?? [];
assert.equal(new Set(extraQuestionSlugs).size, 5);

const optionsBlock = migration.match(
  /with option_seed\(question_slug, label, option_text, sort_order\) as \(values[\s\S]+?insert into public\.question_options/
)?.[0] ?? '';
const optionRows = optionsBlock.match(/\('pratica-agente-social-(?:prontuario-suas|beneficio-eventual-acompanhamento|creas-violacao-direitos|abordagem-nao-higienista|crise-saude-mental-rede)','[A-D]'/g) ?? [];
assert.equal(optionRows.length, 20, 'cada nova questão deve ter 4 alternativas');

assert.match(migration, /simulado-revisao-agente-social-10-questoes/);
assert.match(migration, /v_simulation_question_count <> 10/);
assert.match(migration, /v_theme_count <> 3/);

assert.match(libraryPage, /SEDES_LEARNING_ASSETS/);
assert.match(libraryPage, /Mapas, resumos e trilhas por especialidade/);
assert.match(onboardingPage, /LeadNurtureOptInPanel/);
assert.match(progressPage, /StudentRankingPanel/);

console.log('SEDES editorial, nutrição opt-in e ranking: verificações estáticas aprovadas.');
