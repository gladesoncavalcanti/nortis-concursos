import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const migration = readFileSync(resolve(
  import.meta.dirname,
  '../../../supabase/migrations/20260810171236_expand_objective_diagnostic_direito_legislacao.sql'
), 'utf8');
const engineMigration = readFileSync(resolve(
  import.meta.dirname,
  '../../../supabase/migrations/20260810145224_create_objective_diagnostic.sql'
), 'utf8');

const questionSeed = migration.match(/with diagnostic_seed[\s\S]+?on conflict \(slug\) do update set[\s\S]+?updated_at = now\(\);/)?.[0] ?? '';
const optionSeed = migration.match(/with option_seed[\s\S]+?on conflict \(question_id, label\) do update set[\s\S]+?sort_order = excluded\.sort_order;/)?.[0] ?? '';
const solutionSeed = migration.match(/with solution_seed[\s\S]+?on conflict \(question_id\) do update set[\s\S]+?correct_option_id = excluded\.correct_option_id;/)?.[0] ?? '';

const expectedQuestions = new Set([
  'diagnostico-direito-legislacao-personalidade-civil',
  'diagnostico-direito-legislacao-tutela-urgencia',
  'diagnostico-direito-legislacao-assistencia-juridica',
  'diagnostico-direito-legislacao-autotutela-administrativa',
  'diagnostico-direito-legislacao-ldo',
  'diagnostico-direito-legislacao-principio-necessidade',
]);
const questions = new Set(
  questionSeed.match(/diagnostico-direito-legislacao-[a-z-]+/g) ?? []
);
const optionRows = optionSeed.match(/\('diagnostico-direito-legislacao-[^']+','[A-D]'/g) ?? [];
const solutionRows = solutionSeed.match(/\('diagnostico-direito-legislacao-[^']+','[A-D]'\)/g) ?? [];
const solutionQuestions = new Set(
  solutionRows.map((row) => row.match(/diagnostico-direito-legislacao-[a-z-]+/)?.[0])
);

assert.deepEqual(questions, expectedQuestions, 'Direito e Legislação deve ter uma questão por bloco oficial');
assert.equal(optionRows.length, 24, 'cada questão deve ter quatro alternativas');
assert.equal(solutionRows.length, 6, 'cada questão deve ter uma única solução');
assert.deepEqual(solutionQuestions, expectedQuestions, 'todas as questões devem possuir solução');
assert.equal((questionSeed.match(/Questão autoral Nortis\./g) ?? []).length, 6);

for (const subject of [
  '1-direito-civil',
  '2-direito-processual-civil',
  '3-direito-constitucional',
  '4-direito-administrativo',
  '5-direito-financeiro',
  '6-transparencia-e-protecao-de-dados',
]) {
  assert.match(questionSeed, new RegExp(`'${subject}'`));
}

assert.match(questionSeed, /'direito-e-legislacao-403'/);
assert.match(questionSeed, /specialty\.slug = seed\.specialty_slug/);
assert.match(questionSeed, /subject\.parent_id = specialty\.id/);
assert.match(questionSeed, /subject\.slug = seed\.subject_slug/);
assert.match(questionSeed, /diagnostic_eligible, sort_order, active/);
assert.match(questionSeed, /on conflict \(slug\) do update set/);
assert.match(optionSeed, /on conflict \(question_id, label\) do update set/);
assert.match(solutionSeed, /on conflict \(question_id\) do update set/);

for (const officialReference of [
  /Código Civil \(Lei Federal nº 10\.406\/2002\), art\. 2º/,
  /Código de Processo Civil \(Lei Federal nº 13\.105\/2015\), art\. 300/,
  /Constituição da República Federativa do Brasil de 1988, art\. 5º, inciso LXXIV/,
  /Lei Federal nº 9\.784\/1999, art\. 53/,
  /Constituição da República Federativa do Brasil de 1988, art\. 165, § 2º/,
  /Lei Geral de Proteção de Dados Pessoais \(Lei Federal nº 13\.709\/2018\), art\. 6º, inciso III/,
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

console.log('Direito e Legislação: 6 questões, 24 alternativas, vínculos, fontes e proteções aprovados.');
