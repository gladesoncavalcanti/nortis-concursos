import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const migrationPath = fileURLToPath(new URL(
  '../../../supabase/migrations/20260811142243_seed_practice_questions_and_simulations_edas_batch_1.sql',
  import.meta.url
));
const sql = readFileSync(migrationPath, 'utf8');
const adminSubjectSeed = readFileSync(fileURLToPath(new URL(
  '../../../supabase/migrations/20260810140042_seed_specialty_subjects.sql',
  import.meta.url
)), 'utf8');
const edasSubjectSeed = readFileSync(fileURLToPath(new URL(
  '../../../supabase/migrations/20260810140050_seed_specialty_subjects.sql',
  import.meta.url
)), 'utf8');
const engineSql = readFileSync(fileURLToPath(new URL(
  '../../../supabase/migrations/20260811124715_seed_practice_questions_and_simulation_pilot.sql',
  import.meta.url
)), 'utf8');

const specialties = {
  'administracao-400': {
    simulation: 'simulado-piloto-administracao',
    questions: [
      ['1-teoria-geral-e-processos-administrativos', 'pratica-administracao-analise-swot'],
      ['2-organizacao-sistemas-metodos-os-m-e-qualidade', 'pratica-administracao-redesenho-processo'],
      ['3-gestao-de-projetos', 'pratica-administracao-resposta-risco-projeto'],
      ['4-administracao-financeira-e-orcamentaria-afo', 'pratica-administracao-arrecadacao-recolhimento'],
      ['5-gestao-de-pessoas', 'pratica-administracao-pdp-lacuna-competencia'],
      ['6-etica-e-conduta-profissional', 'pratica-administracao-etica-tratamento-impessoal'],
    ],
  },
  'ciencias-contabeis-401': {
    simulation: 'simulado-piloto-ciencias-contabeis',
    questions: [
      ['1-contabilidade-geral-e-societaria', 'pratica-ciencias-contabeis-compra-equipamento-caixa'],
      ['2-administracao-financeira-e-analise-de-balancos', 'pratica-ciencias-contabeis-ciclo-financeiro'],
      ['3-contabilidade-aplicada-ao-setor-publico-casp', 'pratica-ciencias-contabeis-depreciacao-patrimonial'],
      ['4-orcamento-publico-administracao-financeira-e-orcamentaria-afo', 'pratica-ciencias-contabeis-credito-especial'],
      ['5-auditoria-contabil-e-governamental', 'pratica-ciencias-contabeis-evidencia-auditoria'],
    ],
  },
  'comunicacao-social-402': {
    simulation: 'simulado-piloto-comunicacao-social',
    questions: [
      ['1-fundamentos-e-teorias-da-comunicacao', 'pratica-comunicacao-social-feedback'],
      ['2-comunicacao-organizacional-e-relacoes-publicas', 'pratica-comunicacao-social-segmentacao-publicos'],
      ['3-jornalismo-assessoria-de-imprensa-e-gestao-de-crise', 'pratica-comunicacao-social-confirmacao-crise'],
      ['4-comunicacao-digital-e-novas-tecnologias', 'pratica-comunicacao-social-metrica-conversao'],
      ['5-etica-profissional', 'pratica-comunicacao-social-protecao-dados'],
    ],
  },
};

const allQuestions = Object.values(specialties).flatMap(({ questions }) => questions);
const questionSlugs = allQuestions.map(([, slug]) => slug);
assert.equal(questionSlugs.length, 16);
assert.equal(new Set(questionSlugs).size, 16);

for (const [specialtySlug, { simulation, questions }] of Object.entries(specialties)) {
  assert.match(sql, new RegExp(`'${specialtySlug}'`));
  assert.match(sql, new RegExp(`'${simulation}'`));
  const officialSeed = specialtySlug === 'administracao-400' ? adminSubjectSeed : edasSubjectSeed;
  assert.match(officialSeed, new RegExp(`'${specialtySlug}'`));
  for (const [subjectSlug, questionSlug] of questions) {
    assert.match(officialSeed, new RegExp(`'${specialtySlug}','${subjectSlug}'`));
    assert.match(sql, new RegExp(`'${subjectSlug}'`));
    assert.match(sql, new RegExp(`'${questionSlug}'`));
  }
}

const optionBlock = sql.match(/with option_seed[\s\S]+?insert into public\.question_options/i)?.[0] ?? '';
const optionRows = [...optionBlock.matchAll(/\('pratica-(?:administracao|ciencias-contabeis|comunicacao-social)-[^']+','[A-D]','[^']+',\d+\)/g)];
assert.equal(optionRows.length, 64);
for (const questionSlug of questionSlugs) {
  const optionsForQuestion = optionRows.filter(([row]) => row.includes(`('${questionSlug}'`));
  assert.equal(optionsForQuestion.length, 4);
  assert.deepEqual(optionsForQuestion.map(([row]) => row.match(/,'([A-D])',/)?.[1]), ['A', 'B', 'C', 'D']);
}

const solutionBlock = sql.match(/with solution_seed[\s\S]+?insert into public\.question_solutions/i)?.[0] ?? '';
const solutionRows = [...solutionBlock.matchAll(/\('pratica-(?:administracao|ciencias-contabeis|comunicacao-social)-[^']+','[A-D]'\)/g)];
assert.equal(solutionRows.length, 16);
for (const questionSlug of questionSlugs) {
  assert.equal(solutionRows.filter(([row]) => row.includes(`('${questionSlug}'`)).length, 1);
}

assert.match(sql, /diagnostic_eligible[\s\S]+false/i);
assert.match(sql, /authorship[\s\S]+'Nortis Concursos'/i);
assert.equal((sql.match(/Questão autoral Nortis\./g) ?? []).length, 16);
assert.equal((sql.match(/atualizado pelos Editais nº 2 e nº 3/g) ?? []).length, 16);
assert.match(sql, /seed\.explanation, 'Nortis Concursos', seed\.source_reference,\s+false, seed\.sort_order, true/i);

assert.match(sql, /simulado-piloto-administracao/);
assert.match(sql, /Seis questões autorais da Nortis/);
assert.match(sql, /simulado-piloto-ciencias-contabeis/);
assert.match(sql, /simulado-piloto-comunicacao-social/);
assert.equal((sql.match(/Cinco questões autorais da Nortis/g) ?? []).length, 2);
assert.equal((sql.match(/sem equivalência com nota oficial/g) ?? []).length, 3);
assert.equal((sql.match(/\r?\n\s+10,\r?\n\s+40[012]10/g) ?? []).length, 3);

const simulationQuestionBlock = sql.match(/with simulation_question_seed[\s\S]+?insert into public\.simulation_questions/i)?.[0] ?? '';
const simulationQuestionRows = [...simulationQuestionBlock.matchAll(/\('simulado-piloto-(?:administracao|ciencias-contabeis|comunicacao-social)','pratica-[^']+',\d+\)/g)];
assert.equal(simulationQuestionRows.length, 16);
for (const [specialtySlug, { simulation, questions }] of Object.entries(specialties)) {
  const rowsForSimulation = simulationQuestionRows.filter(([row]) => row.includes(`('${simulation}'`));
  assert.equal(rowsForSimulation.length, questions.length, specialtySlug);
  for (const [, questionSlug] of questions) {
    assert.equal(rowsForSimulation.filter(([row]) => row.includes(`'${questionSlug}'`)).length, 1);
  }
}

assert.match(sql, /on conflict \(slug\) do update/i);
assert.match(sql, /on conflict \(question_id, label\) do update/i);
assert.match(sql, /on conflict \(question_id\) do update/i);
assert.match(sql, /on conflict \(slug\) where slug is not null do update/i);
assert.match(sql, /on conflict \(simulation_id, question_id\) do update/i);

assert.doesNotMatch(sql, /create table|alter table|create policy|create or replace function|\bgrant\b|\brevoke\b/i);
assert.doesNotMatch(sql, /insert into public\.(orders|order_items|payments|downloads)/i);
assert.doesNotMatch(sql, /asaas|\bedge function\b|\bsecret\b/i);

// O lote só semeia conteúdo. Estas asserções mantêm explícitas as proteções
// já existentes no motor e impedem um seed de mascarar regressões de acesso.
assert.match(engineSql, /to authenticated[\s\S]+enrollment\.status = 'active'/i);
assert.match(engineSql, /enrollment\.expires_at is null or enrollment\.expires_at > now\(\)/i);
assert.match(engineSql, /profile\.target_specialty_id = simulations\.target_specialty_id/i);
assert.match(engineSql, /if v_user_id is null then raise exception 'authentication_required'/i);
assert.match(engineSql, /raise exception 'access_denied'/i);
assert.match(engineSql, /raise exception 'specialty_mismatch'/i);
assert.match(engineSql, /revoke all on function public\.start_simulation\(uuid\) from public, anon/i);
assert.match(engineSql, /grant execute on function public\.start_simulation\(uuid\) to authenticated/i);

console.log('Questões práticas e simulados EDAS lote 1: 214 verificações aprovadas.');
