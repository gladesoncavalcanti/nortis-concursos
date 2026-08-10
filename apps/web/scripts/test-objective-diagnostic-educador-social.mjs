import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const migration = readFileSync(resolve(
  import.meta.dirname,
  '../../../supabase/migrations/20260810181227_expand_objective_diagnostic_educador_social.sql'
), 'utf8');
const engineMigration = readFileSync(resolve(
  import.meta.dirname,
  '../../../supabase/migrations/20260810145224_create_objective_diagnostic.sql'
), 'utf8');

const questionSeed = migration.match(/with diagnostic_seed[\s\S]+?on conflict \(slug\) do update set[\s\S]+?updated_at = now\(\);/)?.[0] ?? '';
const optionSeed = migration.match(/with option_seed[\s\S]+?on conflict \(question_id, label\) do update set[\s\S]+?sort_order = excluded\.sort_order;/)?.[0] ?? '';
const solutionSeed = migration.match(/with solution_seed[\s\S]+?on conflict \(question_id\) do update set[\s\S]+?correct_option_id = excluded\.correct_option_id;/)?.[0] ?? '';

const expectedQuestions = new Set([
  'diagnostico-educador-social-seguridade-social',
  'diagnostico-educador-social-scfv',
  'diagnostico-educador-social-planejamento-acoes',
  'diagnostico-educador-social-melhor-interesse-crianca',
]);
const questions = new Set(
  questionSeed.match(/diagnostico-educador-social-[a-z-]+/g) ?? []
);
const optionRows = optionSeed.match(/\('diagnostico-educador-social-[^']+','[A-D]'/g) ?? [];
const solutionRows = solutionSeed.match(/\('diagnostico-educador-social-[^']+','[A-D]'\)/g) ?? [];
const solutionQuestions = new Set(
  solutionRows.map((row) => row.match(/diagnostico-educador-social-[a-z-]+/)?.[0])
);

assert.deepEqual(questions, expectedQuestions, 'Educador Social deve ter uma questão por bloco oficial');
assert.equal(optionRows.length, 16, 'cada questão deve ter quatro alternativas');
assert.equal(solutionRows.length, 4, 'cada questão deve ter uma única solução');
assert.deepEqual(solutionQuestions, expectedQuestions, 'todas as questões devem possuir solução');
assert.equal((questionSeed.match(/Questão autoral Nortis\./g) ?? []).length, 4);

for (const subject of [
  '1-fundamentos-da-politica-social-e-dinamica-familiar',
  '2-a-pratica-socioeducativa-nos-servicos-do-suas',
  '3-metodologia-do-trabalho-social-e-abordagem',
  '4-temas-contemporaneos-e-diretrizes-internacionais',
]) {
  assert.match(questionSeed, new RegExp(`'${subject}'`));
}

assert.match(questionSeed, /'educador-social-405'/);
assert.match(questionSeed, /specialty\.slug = seed\.specialty_slug/);
assert.match(questionSeed, /subject\.parent_id = specialty\.id/);
assert.match(questionSeed, /subject\.slug = seed\.subject_slug/);
assert.match(questionSeed, /diagnostic_eligible, sort_order, active/);
assert.match(questionSeed, /on conflict \(slug\) do update set/);
assert.match(optionSeed, /on conflict \(question_id, label\) do update set/);
assert.match(solutionSeed, /on conflict \(question_id\) do update set/);

for (const officialReference of [
  /Constituição da República Federativa do Brasil de 1988, art\. 194, caput/,
  /Resolução CNAS nº 109\/2009/,
  /Orientações Técnicas sobre o PAIF, volume 2, capítulos 4\.2 a 4\.5/,
  /Decreto Federal nº 99\.710\/1990, Convenção sobre os Direitos da Criança, art\. 3º, item 1/,
]) {
  assert.match(questionSeed, officialReference);
}

assert.equal((questionSeed.match(/item 20\.2\.4\.2\.6/g) ?? []).length, 4);
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

console.log('Educador Social: 4 questões, 16 alternativas, vínculos, fontes e proteções aprovados.');
