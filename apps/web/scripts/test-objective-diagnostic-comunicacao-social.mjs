import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const migration = readFileSync(resolve(
  import.meta.dirname,
  '../../../supabase/migrations/20260810170256_expand_objective_diagnostic_comunicacao_social.sql'
), 'utf8');
const engineMigration = readFileSync(resolve(
  import.meta.dirname,
  '../../../supabase/migrations/20260810145224_create_objective_diagnostic.sql'
), 'utf8');

const questionSeed = migration.match(/with diagnostic_seed[\s\S]+?on conflict \(slug\) do update set[\s\S]+?updated_at = now\(\);/)?.[0] ?? '';
const optionSeed = migration.match(/with option_seed[\s\S]+?on conflict \(question_id, label\) do update set[\s\S]+?sort_order = excluded\.sort_order;/)?.[0] ?? '';
const solutionSeed = migration.match(/with solution_seed[\s\S]+?on conflict \(question_id\) do update set[\s\S]+?correct_option_id = excluded\.correct_option_id;/)?.[0] ?? '';

const questions = new Set(
  questionSeed.match(/diagnostico-comunicacao-social-[a-z-]+/g) ?? []
);
const optionRows = optionSeed.match(/\('diagnostico-comunicacao-social-[^']+','[A-D]'/g) ?? [];
const solutionRows = solutionSeed.match(/\('diagnostico-comunicacao-social-[^']+','[A-D]'\)/g) ?? [];
const solutionQuestions = new Set(
  solutionRows.map((row) => row.match(/diagnostico-comunicacao-social-[a-z-]+/)?.[0])
);

assert.equal(questions.size, 5, 'Comunicação Social deve ter uma questão por bloco específico');
assert.equal(optionRows.length, 20, 'cada questão deve ter quatro alternativas');
assert.equal(solutionRows.length, 5, 'cada questão deve ter uma única solução');
assert.deepEqual(solutionQuestions, questions, 'todas as questões devem possuir solução');
assert.equal((questionSeed.match(/Questão autoral Nortis\./g) ?? []).length, 5);

for (const subject of [
  '1-fundamentos-e-teorias-da-comunicacao',
  '2-comunicacao-organizacional-e-relacoes-publicas',
  '3-jornalismo-assessoria-de-imprensa-e-gestao-de-crise',
  '4-comunicacao-digital-e-novas-tecnologias',
  '5-etica-profissional',
]) {
  assert.match(questionSeed, new RegExp(`'${subject}'`));
}

assert.match(questionSeed, /'comunicacao-social-402'/);
assert.match(questionSeed, /specialty\.slug = seed\.specialty_slug/);
assert.match(questionSeed, /subject\.parent_id = specialty\.id/);
assert.match(questionSeed, /subject\.slug = seed\.subject_slug/);
assert.match(questionSeed, /diagnostic_eligible, sort_order, active/);
assert.match(questionSeed, /on conflict \(slug\) do update set/);
assert.match(optionSeed, /on conflict \(question_id, label\) do update set/);
assert.match(solutionSeed, /on conflict \(question_id\) do update set/);

for (const officialReference of [
  /Portal eduCAPES, Comunicação em Foco/,
  /Escola Nacional de Administração Pública, curso Comunicação Pública/,
  /Manual de Gestão de Crises Ipea 2025, seção 5\.1/,
  /Manual de Orientação para Atuação em Mídias Sociais/,
  /Constituição da República Federativa do Brasil de 1988, art\. 37, caput e § 1º/,
]) {
  assert.match(questionSeed, officialReference);
}

assert.doesNotMatch(migration, /Caverna|concorrente/i);
assert.doesNotMatch(migration, /checkout|asaas|payment|order_items|edge function|secret/i);
assert.doesNotMatch(migration, /create policy|drop policy|grant |revoke |security definer/i);

assert.match(engineMigration, /create policy "questions_enrolled_read"/);
assert.match(engineMigration, /e\.user_id = \(select auth\.uid\(\)\)/);
assert.match(engineMigration, /enrollment\.status = 'active'/);
assert.match(engineMigration, /enrollment\.expires_at is null or enrollment\.expires_at > now\(\)/);
assert.match(engineMigration, /profile\.user_id = \(select auth\.uid\(\)\)/);
assert.match(engineMigration, /profile\.target_specialty_id = subject\.parent_id/);
assert.match(engineMigration, /create policy "question_attempts_self_read"/);
assert.match(engineMigration, /user_id = \(select auth\.uid\(\)\)/);
assert.match(engineMigration, /v_user_id uuid := auth\.uid\(\)/);
assert.match(engineMigration, /profile\.user_id = v_user_id/);
assert.match(engineMigration, /profile\.target_specialty_id = v_specialty_id/);
assert.match(engineMigration, /raise exception 'specialty_mismatch'/);
assert.match(engineMigration, /question_attempts_one_diagnostic_per_question_idx/);
assert.match(engineMigration, /on conflict \(user_id, question_id\)/);
assert.match(engineMigration, /attempt\.user_id = v_user_id/);
assert.match(engineMigration, /attempt\.user_id = \(select auth\.uid\(\)\)/);
assert.match(engineMigration, /revoke all on function public\.submit_diagnostic_answer\(uuid, uuid\) from public, anon/);

console.log('Comunicação Social: 5 questões, 20 alternativas, vínculos, fontes e proteções aprovados.');
