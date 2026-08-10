import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const migration = readFileSync(resolve(
  import.meta.dirname,
  '../../../supabase/migrations/20260810153201_expand_objective_diagnostic_tecnico_administrativo.sql'
), 'utf8');
const engineMigration = readFileSync(resolve(
  import.meta.dirname,
  '../../../supabase/migrations/20260810145224_create_objective_diagnostic.sql'
), 'utf8');

const questionSeed = migration.match(/with diagnostic_seed[\s\S]+?on conflict \(slug\) do update set[\s\S]+?updated_at = now\(\);/)?.[0] ?? '';
const optionSeed = migration.match(/with option_seed[\s\S]+?on conflict \(question_id, label\) do update set[\s\S]+?sort_order = excluded\.sort_order;/)?.[0] ?? '';
const solutionSeed = migration.match(/with solution_seed[\s\S]+?on conflict \(question_id\) do update set[\s\S]+?correct_option_id = excluded\.correct_option_id;/)?.[0] ?? '';

const questions = new Set(
  questionSeed.match(/diagnostico-tecnico-administrativo-[a-z-]+/g) ?? []
);
const optionRows = optionSeed.match(/\('diagnostico-tecnico-administrativo-[^']+','[A-D]'/g) ?? [];
const solutionRows = solutionSeed.match(/\('diagnostico-tecnico-administrativo-[^']+','[A-D]'\)/g) ?? [];

assert.equal(questions.size, 4, 'Técnico Administrativo deve ter uma questão por bloco específico');
assert.equal(optionRows.length, 16, 'cada questão deve ter quatro alternativas');
assert.equal(solutionRows.length, 4, 'cada questão deve ter uma única solução');
assert.equal((questionSeed.match(/Questão autoral Nortis\./g) ?? []).length, 4);

for (const subject of [
  '1-nocoes-de-direito-constitucional',
  '2-nocoes-de-direito-administrativo-e-legislacao',
  '3-atendimento-rotinas-administrativas-e-arquivologia',
  '4-nocoes-de-recursos-materiais-patrimonio-e-compras',
]) {
  assert.match(questionSeed, new RegExp(`'${subject}'`));
}

assert.match(questionSeed, /'tecnico-administrativo-202'/);
assert.match(questionSeed, /specialty\.slug = seed\.specialty_slug/);
assert.match(questionSeed, /subject\.parent_id = specialty\.id/);
assert.match(questionSeed, /subject\.slug = seed\.subject_slug/);
assert.match(questionSeed, /diagnostic_eligible, sort_order, active/);
assert.match(questionSeed, /on conflict \(slug\) do update set/);
assert.match(optionSeed, /on conflict \(question_id, label\) do update set/);
assert.match(solutionSeed, /on conflict \(question_id\) do update set/);

for (const officialReference of [
  /Constituição Federal de 1988, art\. 37, caput e § 1º/,
  /Lei Federal nº 9\.784\/1999, art\. 53/,
  /STF, Súmula 473/,
  /Manual do Protocolo e Arquivo do SEI/,
  /Lei Federal nº 14\.133\/2021, arts\. 17 e 18/,
]) {
  assert.match(questionSeed, officialReference);
}

assert.doesNotMatch(migration, /Caverna|concorrente/i);
assert.doesNotMatch(migration, /checkout|asaas|payment|order_items|edge function|secret/i);
assert.doesNotMatch(migration, /create policy|drop policy|grant |revoke |security definer/i);

assert.match(engineMigration, /create policy "questions_enrolled_read"/);
assert.match(engineMigration, /enrollment\.status = 'active'/);
assert.match(engineMigration, /enrollment\.expires_at is null or enrollment\.expires_at > now\(\)/);
assert.match(engineMigration, /raise exception 'specialty_mismatch'/);
assert.match(engineMigration, /question_attempts_one_diagnostic_per_question_idx/);
assert.match(engineMigration, /on conflict \(user_id, question_id\)/);
assert.match(engineMigration, /revoke all on function public\.submit_diagnostic_answer\(uuid, uuid\) from public, anon/);

console.log('Técnico Administrativo: 4 questões, 16 alternativas, vínculos, fontes e proteções aprovados.');
