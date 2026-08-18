// Valida, de forma estática (mesmo padrão dos demais testes de
// migration do projeto), a regra "no máximo 1 draft aberto por
// usuário+tema": migration, rollback dedicado e a forma da função
// getOrCreateEssayDraft (get-or-create com fallback de corrida) — sem
// conexão com banco real (a prova transacional real está em
// test-essay-draft-per-theme-db.mjs).
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const migrationPath = fileURLToPath(new URL(
  '../../../supabase/migrations/20260818023136_add_essay_submissions_one_draft_per_theme.sql',
  import.meta.url
));
const migration = readFileSync(migrationPath, 'utf8');

// 1) índice único parcial exato: (user_id, theme_id) where status = 'draft'
assert.match(
  migration,
  /create unique index if not exists essay_submissions_one_open_draft_per_theme_uidx\s*\n\s*on public\.essay_submissions\(user_id, theme_id\)\s*\n\s*where status = 'draft';/
);

// 2) migration isolada: só toca essay_submissions, nenhum "create
// table"/"alter table"/"insert into" fora dela, e não recria a
// migration estrutural já aplicada
const structuralStatements = migration.match(/\b(create table|alter table|insert into)\s+public\.\w+/gi) ?? [];
assert.equal(structuralStatements.length, 0, 'migration deveria conter apenas o índice, sem create table/alter table/insert into.');
assert.doesNotMatch(migration, /\bdrop\b|\btruncate\b/i);

const structuralMigrationPath = fileURLToPath(new URL(
  '../../../supabase/migrations/20260812060000_create_essay_themes_and_submissions.sql',
  import.meta.url
));
assert.ok(existsSync(structuralMigrationPath), 'migration estrutural da fundação discursiva deveria continuar existindo, intocada.');

// 3) rollback dedicado existe, fora de supabase/migrations/, restrito
// só a este índice
const rollbackPath = fileURLToPath(new URL(
  '../../../supabase/rollbacks/20260818023136_rollback_essay_submissions_one_draft_per_theme.sql',
  import.meta.url
));
assert.ok(existsSync(rollbackPath), 'Script de rollback dedicado ausente.');
const rollback = readFileSync(rollbackPath, 'utf8');
assert.match(rollback, /drop index if exists public\.essay_submissions_one_open_draft_per_theme_uidx;/);
assert.doesNotMatch(rollback, /drop table/i);

const migrationsDir = fileURLToPath(new URL('../../../supabase/migrations/', import.meta.url));
const migrationFiles = readdirSync(migrationsDir);
assert.ok(
  !migrationFiles.some((file) => file.includes('rollback_essay_submissions_one_draft_per_theme')),
  'O rollback não pode estar em supabase/migrations/ — seria aplicado automaticamente.'
);

// 4) getOrCreateEssayDraft: get-or-create com fallback de corrida
const submissionsApiPath = fileURLToPath(new URL('../src/api/essaySubmissions.js', import.meta.url));
const submissionsApi = readFileSync(submissionsApiPath, 'utf8');

assert.match(submissionsApi, /export async function getOrCreateEssayDraft\(\{\s*themeId\s*\}\)/);

// busca o draft aberto ANTES de tentar criar (caminho feliz evita
// escrita desnecessária e é o que permite "segundo pedido reutiliza")
assert.match(submissionsApi, /\.eq\('user_id', user\.id\)\s*\n\s*\.eq\('theme_id', themeId\)\s*\n\s*\.eq\('status', 'draft'\)\s*\n\s*\.maybeSingle\(\)/);

// se já existe, devolve sem criar nada novo
assert.match(submissionsApi, /if \(existing\) return \{ data: existing, error: null \};/);

// trata unique_violation (23505) como corrida perdida, buscando de
// novo em vez de propagar erro ao aluno
assert.match(submissionsApi, /insertError\.code === '23505'/);
const getOrCreateStart = submissionsApi.indexOf('export async function getOrCreateEssayDraft');
const nextExportStart = submissionsApi.indexOf('export async function', getOrCreateStart + 1);
assert.ok(getOrCreateStart !== -1 && nextExportStart !== -1, 'não foi possível isolar o corpo de getOrCreateEssayDraft para checar ausência de throw.');
const getOrCreateBody = submissionsApi.slice(getOrCreateStart, nextExportStart);
assert.doesNotMatch(
  getOrCreateBody,
  /throw /,
  'getOrCreateEssayDraft não deve lançar exceção não tratada para o chamador — sempre devolve { data, error }.'
);

// createEssayDraft original permanece intocada (outros pontos do
// código/testes já dependem dela)
assert.match(submissionsApi, /export async function createEssayDraft\(\{\s*themeId\s*\}\)/);

// 5) EssayThemesPage usa o get-or-create, não o create direto, e
// desabilita o botão antes de qualquer chamada de rede (defesa de
// clique duplo na própria UI, além da garantia de banco)
const themesPagePath = fileURLToPath(new URL('../src/pages/EssayThemesPage.jsx', import.meta.url));
const themesPage = readFileSync(themesPagePath, 'utf8');
assert.match(themesPage, /import \{ getOrCreateEssayDraft \} from '@\/api\/essaySubmissions\.js';/);
assert.match(themesPage, /getOrCreateEssayDraft\(\{ themeId \}\)/);
assert.match(themesPage, /if \(startingThemeId\) return;/);

console.log('Regra "1 draft por tema" — estático: 11 verificações aprovadas.');
