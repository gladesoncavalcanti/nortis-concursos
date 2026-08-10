import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const migration = readFileSync(resolve(
  import.meta.dirname,
  '../../../supabase/migrations/20260810190853_expand_objective_diagnostic_nutricao.sql'
), 'utf8');
const engineMigration = readFileSync(resolve(
  import.meta.dirname,
  '../../../supabase/migrations/20260810145224_create_objective_diagnostic.sql'
), 'utf8');

const questionSeed = migration.match(/with diagnostic_seed[\s\S]+?on conflict \(slug\) do update set[\s\S]+?updated_at = now\(\);/)?.[0] ?? '';
const optionSeed = migration.match(/with option_seed[\s\S]+?on conflict \(question_id, label\) do update set[\s\S]+?sort_order = excluded\.sort_order;/)?.[0] ?? '';
const solutionSeed = migration.match(/with solution_seed[\s\S]+?on conflict \(question_id\) do update set[\s\S]+?correct_option_id = excluded\.correct_option_id;/)?.[0] ?? '';

const expectedQuestions = new Set([
  'diagnostico-nutricao-sisan-dhaa',
  'diagnostico-nutricao-aleitamento-complementar',
  'diagnostico-nutricao-uan-boas-praticas',
  'diagnostico-nutricao-pnae-teste-aceitabilidade',
  'diagnostico-nutricao-hipertensao-alimentacao',
]);
const questions = new Set(
  questionSeed.match(/diagnostico-nutricao-[a-z-]+/g) ?? []
);
const optionRows = optionSeed.match(/\('diagnostico-nutricao-[^']+','[A-D]'/g) ?? [];
const solutionRows = solutionSeed.match(/\('diagnostico-nutricao-[^']+','[A-D]'\)/g) ?? [];
const solutionQuestions = new Set(
  solutionRows.map((row) => row.match(/diagnostico-nutricao-[a-z-]+/)?.[0])
);

assert.deepEqual(questions, expectedQuestions, 'Nutrição deve ter uma questão por bloco oficial');
assert.equal(optionRows.length, 20, 'cada questão deve ter quatro alternativas');
assert.equal(solutionRows.length, 5, 'cada questão deve ter uma única solução');
assert.deepEqual(solutionQuestions, expectedQuestions, 'todas as questões devem possuir solução');
assert.equal((questionSeed.match(/Questão autoral Nortis\./g) ?? []).length, 5);

for (const subject of [
  '1-seguranca-alimentar-e-nutricional-san-e-politicas-publicas',
  '2-nutricao-em-saude-publica-e-epidemiologia',
  '3-gestao-de-unidades-de-alimentacao-e-nutricao-uan',
  '4-educacao-alimentar-e-nutricional-ean-e-programas-institucionais',
  '5-fundamentos-de-nutricao-e-dietoterapia-basica',
]) {
  assert.match(questionSeed, new RegExp(`'${subject}'`));
}

assert.match(questionSeed, /'nutricao-407'/);
assert.match(questionSeed, /specialty\.slug = seed\.specialty_slug/);
assert.match(questionSeed, /subject\.parent_id = specialty\.id/);
assert.match(questionSeed, /subject\.slug = seed\.subject_slug/);
assert.match(questionSeed, /diagnostic_eligible, sort_order, active/);
assert.match(questionSeed, /on conflict \(slug\) do update set/);
assert.match(optionSeed, /on conflict \(question_id, label\) do update set/);
assert.match(solutionSeed, /on conflict \(question_id\) do update set/);

for (const officialReference of [
  /Ministério do Desenvolvimento e Assistência Social, página oficial Sisan/,
  /Ministério da Saúde, página oficial Amamentação e Guia Alimentar para Crianças Brasileiras Menores de 2 Anos/,
  /Agência Nacional de Vigilância Sanitária, Resolução RDC nº 216\/2004/,
  /Fundo Nacional de Desenvolvimento da Educação, Alimentação e Nutrição no PNAE e Manual para aplicação dos Testes de Aceitabilidade/,
  /Ministério da Saúde, página oficial Hipertensão \(pressão alta\), seção Prevenção/,
]) {
  assert.match(questionSeed, officialReference);
}

for (const solution of [
  /\('diagnostico-nutricao-sisan-dhaa','B'\)/,
  /\('diagnostico-nutricao-aleitamento-complementar','C'\)/,
  /\('diagnostico-nutricao-uan-boas-praticas','A'\)/,
  /\('diagnostico-nutricao-pnae-teste-aceitabilidade','D'\)/,
  /\('diagnostico-nutricao-hipertensao-alimentacao','B'\)/,
]) {
  assert.match(solutionSeed, solution);
}

assert.equal((questionSeed.match(/item 20\.2\.4\.2\.8/g) ?? []).length, 5);
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

console.log('Nutrição: 5 questões, 20 alternativas, vínculos, fontes e proteções aprovados.');
