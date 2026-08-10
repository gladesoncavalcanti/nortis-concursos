import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const migration = readFileSync(resolve(
  import.meta.dirname,
  '../../../supabase/migrations/20260810151803_expand_objective_diagnostic_coverage.sql'
), 'utf8');

const questionSeed = migration.match(/with diagnostic_seed[\s\S]+?on conflict \(slug\) do update set[\s\S]+?updated_at = now\(\);/)?.[0] ?? '';
const optionSeed = migration.match(/with option_seed[\s\S]+?on conflict \(question_id, label\) do update set[\s\S]+?sort_order = excluded\.sort_order;/)?.[0] ?? '';
const solutionSeed = migration.match(/with solution_seed[\s\S]+?on conflict \(question_id\) do update set[\s\S]+?correct_option_id = excluded\.correct_option_id;/)?.[0] ?? '';

const caregiverQuestions = new Set(
  questionSeed.match(/diagnostico-cuidador-social-[a-z-]+/g) ?? []
);
const administrationQuestions = new Set(
  questionSeed.match(/diagnostico-administracao-[a-z-]+/g) ?? []
);
const optionRows = optionSeed.match(/\('diagnostico-(?:cuidador-social|administracao)-[^']+','[A-D]'/g) ?? [];
const solutionRows = solutionSeed.match(/\('diagnostico-(?:cuidador-social|administracao)-[^']+','[A-D]'\)/g) ?? [];

assert.equal(caregiverQuestions.size, 5, 'Cuidador Social deve ter uma questão por bloco específico');
assert.equal(administrationQuestions.size, 6, 'Administração deve ter uma questão por bloco específico');
assert.equal(optionRows.length, 44, 'cada questão deve ter quatro alternativas');
assert.equal(solutionRows.length, 11, 'cada questão deve ter uma única solução');
assert.equal((questionSeed.match(/Questão autoral Nortis\./g) ?? []).length, 11);

for (const specialty of ['cuidador-social-201', 'administracao-400']) {
  assert.match(questionSeed, new RegExp(`'${specialty}'`));
}

for (const subject of [
  '2-rede-socioassistencial-e-intersetorialidade',
  '3-rotinas-de-acolhimento-cuidado-e-trabalho-em-equipe',
  '4-protecao-social-especial-de-alta-complexidade',
  '5-populacao-em-situacao-de-rua-e-nocoes-de-abordagem-e-acolhimento-social',
  '6-nocoes-de-saude-mental-e-reducao-de-danos',
  '1-teoria-geral-e-processos-administrativos',
  '2-organizacao-sistemas-metodos-os-m-e-qualidade',
  '3-gestao-de-projetos',
  '4-administracao-financeira-e-orcamentaria-afo',
  '5-gestao-de-pessoas',
  '6-etica-e-conduta-profissional',
]) {
  assert.match(questionSeed, new RegExp(`'${subject}'`));
}

assert.match(questionSeed, /specialty\.slug = seed\.specialty_slug/);
assert.match(questionSeed, /subject\.parent_id = specialty\.id/);
assert.match(questionSeed, /subject\.slug = seed\.subject_slug/);
assert.match(questionSeed, /diagnostic_eligible, sort_order, active/);
assert.match(questionSeed, /on conflict \(slug\) do update set/);
assert.match(optionSeed, /on conflict \(question_id, label\) do update set/);
assert.match(solutionSeed, /on conflict \(question_id\) do update set/);

for (const officialReference of [
  /Edital SEDES-DF nº 1\/2026/,
  /Resolução Conjunta CNAS\/CONANDA nº 1\/2009/,
  /Decreto nº 7\.053\/2009/,
  /Rede de Atenção Psicossocial \(RAPS\)/,
  /Guia Metodológico de Gestão de Processos/,
  /Metodologia de Gerenciamento de Projetos do SISP/,
  /Lei Federal nº 4\.320\/1964/,
  /Decreto Federal nº 9\.991\/2019/,
  /Decreto Distrital nº 37\.297\/2016/,
]) {
  assert.match(questionSeed, officialReference);
}

assert.doesNotMatch(migration, /Caverna|concorrente/i);
assert.doesNotMatch(migration, /checkout|asaas|payment|order_items|edge function|secret/i);
assert.doesNotMatch(migration, /create policy|drop policy|grant |revoke |security definer/i);

console.log('Objective diagnostic coverage: 11 questões, vínculos e fontes aprovados.');
