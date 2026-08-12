import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const migration = readFileSync(resolve(
  import.meta.dirname,
  '../../../supabase/migrations/20260811002738_expand_objective_diagnostic_sociologia.sql'
), 'utf8');
const engineMigration = readFileSync(resolve(
  import.meta.dirname,
  '../../../supabase/migrations/20260810145224_create_objective_diagnostic.sql'
), 'utf8');
const studyPlanSuggestions = readFileSync(resolve(
  import.meta.dirname,
  '../src/api/studyPlanSuggestions.js'
), 'utf8');

const questionSeed = migration.match(/with diagnostic_seed[\s\S]+?on conflict \(slug\) do update set[\s\S]+?updated_at = now\(\);/)?.[0] ?? '';
const optionSeed = migration.match(/with option_seed[\s\S]+?on conflict \(question_id, label\) do update set[\s\S]+?sort_order = excluded\.sort_order;/)?.[0] ?? '';
const solutionSeed = migration.match(/with solution_seed[\s\S]+?on conflict \(question_id\) do update set[\s\S]+?correct_option_id = excluded\.correct_option_id;/)?.[0] ?? '';

const expectedQuestions = new Set([
  'diagnostico-sociologia-fato-social-durkheim',
  'diagnostico-sociologia-desigualdade-racial',
  'diagnostico-sociologia-gestao-democratica-urbana',
  'diagnostico-sociologia-indicadores-e-metodos',
]);
const questions = new Set(
  questionSeed.match(/diagnostico-sociologia-[a-z-]+/g) ?? []
);
const optionRows = optionSeed.match(/\('diagnostico-sociologia-[^']+','[A-D]'/g) ?? [];
const solutionRows = solutionSeed.match(/\('diagnostico-sociologia-[^']+','[A-D]'\)/g) ?? [];
const solutionQuestions = new Set(
  solutionRows.map((row) => row.match(/diagnostico-sociologia-[a-z-]+/)?.[0])
);

assert.deepEqual(questions, expectedQuestions, 'Sociologia deve ter uma questão por bloco oficial');
assert.equal(optionRows.length, 16, 'cada questão deve ter quatro alternativas');
assert.equal(solutionRows.length, 4, 'cada questão deve ter uma única solução');
assert.deepEqual(solutionQuestions, expectedQuestions, 'todas as questões devem possuir solução');
assert.equal((questionSeed.match(/Questão autoral Nortis\./g) ?? []).length, 4);

for (const subject of [
  '1-teoria-sociologica-e-conceitos-fundamentais',
  '2-pensamento-social-colonialismo-e-relacoes-etnico-raciais',
  '3-sociologia-urbana-desigualdades-e-movimentos-sociais',
  '4-metodologia-de-pesquisa-social-e-avaliacao-de-politicas',
]) {
  assert.match(questionSeed, new RegExp(`'${subject}'`));
}

assert.match(questionSeed, /'sociologia-411'/);
assert.match(questionSeed, /specialty\.slug = seed\.specialty_slug/);
assert.match(questionSeed, /subject\.parent_id = specialty\.id/);
assert.match(questionSeed, /subject\.slug = seed\.subject_slug/);
assert.match(questionSeed, /diagnostic_eligible, sort_order, active/);
assert.match(questionSeed, /on conflict \(slug\) do update set/);
assert.match(optionSeed, /on conflict \(question_id, label\) do update set/);
assert.match(solutionSeed, /on conflict \(question_id\) do update set/);

for (const officialReference of [
  /Universidade de São Paulo, FFLCH, Laboratório Didático USP Ensina Sociologia, texto sobre Émile Durkheim e a definição de fato social/,
  /Brasil, Lei nº 12\.288\/2010, art\. 1º, parágrafo único, inciso II/,
  /Brasil, Lei nº 10\.257\/2001, art\. 2º, inciso II/,
  /Instituto Brasileiro de Geografia e Estatística, Síntese de Indicadores Sociais: uma análise das condições de vida da população brasileira, 2025/,
]) {
  assert.match(questionSeed, officialReference);
}

for (const solution of [
  /\('diagnostico-sociologia-fato-social-durkheim','B'\)/,
  /\('diagnostico-sociologia-desigualdade-racial','C'\)/,
  /\('diagnostico-sociologia-gestao-democratica-urbana','A'\)/,
  /\('diagnostico-sociologia-indicadores-e-metodos','D'\)/,
]) {
  assert.match(solutionSeed, solution);
}

assert.equal((questionSeed.match(/item 20\.2\.4\.2\.12/g) ?? []).length, 4);
assert.doesNotMatch(migration, /Caverna|concorrente/i);
assert.doesNotMatch(migration, /checkout|asaas|payment|order_items|edge function|\bsecret\b/i);
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

assert.match(studyPlanSuggestions, /objectiveWeakSubjects\s*=\s*\[\],\s*selfReportedWeakSubjects\s*=\s*\[\]/);
assert.match(studyPlanSuggestions, /Reforçar por desempenho/);
assert.match(studyPlanSuggestions, /Revisar por autoavaliação/);
assert.match(studyPlanSuggestions, /const objectiveSet\s*=\s*new Set\(objectiveWeakSubjects\)/);

console.log('Sociologia: 4 questões, 16 alternativas, vínculos, fontes, proteções e plano semanal aprovados.');
