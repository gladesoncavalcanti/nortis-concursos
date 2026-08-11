import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const migrationPath = fileURLToPath(new URL(
  '../../../supabase/migrations/20260811144514_seed_practice_questions_and_simulations_edas_batch_2.sql',
  import.meta.url
));
const sql = readFileSync(migrationPath, 'utf8');
const edasSubjectSeedPart1 = readFileSync(fileURLToPath(new URL(
  '../../../supabase/migrations/20260810140050_seed_specialty_subjects.sql',
  import.meta.url
)), 'utf8');
const edasSubjectSeedPart2 = readFileSync(fileURLToPath(new URL(
  '../../../supabase/migrations/20260810140059_seed_specialty_subjects.sql',
  import.meta.url
)), 'utf8');
const officialSubjectSeed = `${edasSubjectSeedPart1}\n${edasSubjectSeedPart2}`;
const engineSql = readFileSync(fileURLToPath(new URL(
  '../../../supabase/migrations/20260811124715_seed_practice_questions_and_simulation_pilot.sql',
  import.meta.url
)), 'utf8');
const resumeSql = readFileSync(fileURLToPath(new URL(
  '../../../supabase/migrations/20260811105713_improve_simulation_session_resume.sql',
  import.meta.url
)), 'utf8');

const specialties = {
  'direito-e-legislacao-403': {
    simulation: 'simulado-piloto-direito-e-legislacao',
    questions: [
      ['1-direito-civil', 'pratica-direito-legislacao-boa-fe-contratual'],
      ['2-direito-processual-civil', 'pratica-direito-legislacao-onus-prova'],
      ['3-direito-constitucional', 'pratica-direito-legislacao-principios-administracao'],
      ['4-direito-administrativo', 'pratica-direito-legislacao-objetivos-licitacao'],
      ['5-direito-financeiro', 'pratica-direito-legislacao-credito-suplementar'],
      ['6-transparencia-e-protecao-de-dados', 'pratica-direito-legislacao-informacao-atualizada'],
    ],
  },
  'economia-404': {
    simulation: 'simulado-piloto-economia',
    questions: [
      ['1-teoria-economica-microeconomia-e-macroeconomia', 'pratica-economia-externalidade-negativa'],
      ['2-economia-do-setor-publico', 'pratica-economia-capacidade-contributiva'],
      ['3-economia-social', 'pratica-economia-pobreza-multidimensional'],
    ],
  },
  'educador-social-405': {
    simulation: 'simulado-piloto-educador-social',
    questions: [
      ['1-fundamentos-da-politica-social-e-dinamica-familiar', 'pratica-educador-social-territorializacao'],
      ['2-a-pratica-socioeducativa-nos-servicos-do-suas', 'pratica-educador-social-atribuicoes-scfv'],
      ['3-metodologia-do-trabalho-social-e-abordagem', 'pratica-educador-social-registro-acompanhamento'],
      ['4-temas-contemporaneos-e-diretrizes-internacionais', 'pratica-educador-social-acolhimento-excepcional'],
    ],
  },
};

const allQuestions = Object.values(specialties).flatMap(({ questions }) => questions);
const questionSlugs = allQuestions.map(([, slug]) => slug);
assert.equal(questionSlugs.length, 13);
assert.equal(new Set(questionSlugs).size, 13);

for (const [specialtySlug, { simulation, questions }] of Object.entries(specialties)) {
  assert.match(sql, new RegExp(`'${specialtySlug}'`));
  assert.match(sql, new RegExp(`'${simulation}'`));
  assert.match(officialSubjectSeed, new RegExp(`'${specialtySlug}'`));
  for (const [subjectSlug, questionSlug] of questions) {
    assert.match(officialSubjectSeed, new RegExp(`'${specialtySlug}','${subjectSlug}'`));
    assert.match(sql, new RegExp(`'${subjectSlug}'`));
    assert.match(sql, new RegExp(`'${questionSlug}'`));
  }
}

const optionBlock = sql.match(/with option_seed[\s\S]+?insert into public\.question_options/i)?.[0] ?? '';
const optionRows = [...optionBlock.matchAll(/\('pratica-(?:direito-legislacao|economia|educador-social)-[^']+','[A-D]','[^']+',\d+\)/g)];
assert.equal(optionRows.length, 52);
for (const questionSlug of questionSlugs) {
  const optionsForQuestion = optionRows.filter(([row]) => row.includes(`('${questionSlug}'`));
  assert.equal(optionsForQuestion.length, 4, questionSlug);
  assert.deepEqual(optionsForQuestion.map(([row]) => row.match(/,'([A-D])',/)?.[1]), ['A', 'B', 'C', 'D']);
}

const solutionBlock = sql.match(/with solution_seed[\s\S]+?insert into public\.question_solutions/i)?.[0] ?? '';
const solutionRows = [...solutionBlock.matchAll(/\('pratica-(?:direito-legislacao|economia|educador-social)-[^']+','[A-D]'\)/g)];
assert.equal(solutionRows.length, 13);
for (const questionSlug of questionSlugs) {
  assert.equal(solutionRows.filter(([row]) => row.includes(`('${questionSlug}'`)).length, 1);
}

assert.match(sql, /diagnostic_eligible[\s\S]+false/i);
assert.match(sql, /authorship[\s\S]+'Nortis Concursos'/i);
assert.equal((sql.match(/Questão autoral Nortis\./g) ?? []).length, 13);
assert.equal((sql.match(/atualizado pelos Editais nº 2 e nº 3/g) ?? []).length, 13);
assert.match(sql, /seed\.explanation, 'Nortis Concursos', seed\.source_reference,\s+false, seed\.sort_order, true/i);

assert.match(sql, /simulado-piloto-direito-e-legislacao/);
assert.match(sql, /Seis questões autorais da Nortis/);
assert.match(sql, /simulado-piloto-economia/);
assert.match(sql, /Três questões autorais da Nortis/);
assert.match(sql, /simulado-piloto-educador-social/);
assert.match(sql, /Quatro questões autorais da Nortis/);
assert.equal((sql.match(/sem equivalência com nota oficial/g) ?? []).length, 3);
assert.equal((sql.match(/\r?\n\s+10,\r?\n\s+40[345]10/g) ?? []).length, 3);

const simulationQuestionBlock = sql.match(/with simulation_question_seed[\s\S]+?insert into public\.simulation_questions/i)?.[0] ?? '';
const simulationQuestionRows = [...simulationQuestionBlock.matchAll(/\('simulado-piloto-(?:direito-e-legislacao|economia|educador-social)','pratica-[^']+',\d+\)/g)];
assert.equal(simulationQuestionRows.length, 13);
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

// O lote só semeia conteúdo. Estas verificações mantêm explícitas as
// proteções do motor compartilhado sem duplicar ou alterar sua implementação.
assert.match(engineSql, /to authenticated[\s\S]+enrollment\.status = 'active'/i);
assert.match(engineSql, /enrollment\.expires_at is null or enrollment\.expires_at > now\(\)/i);
assert.match(engineSql, /profile\.target_specialty_id = simulations\.target_specialty_id/i);
assert.match(engineSql, /if v_user_id is null then raise exception 'authentication_required'/i);
assert.match(engineSql, /raise exception 'access_denied'/i);
assert.match(engineSql, /raise exception 'specialty_mismatch'/i);
assert.match(engineSql, /revoke all on function public\.start_simulation\(uuid\) from public, anon/i);
assert.match(engineSql, /grant execute on function public\.start_simulation\(uuid\) to authenticated/i);
assert.match(resumeSql, /session\.user_id = \(select auth\.uid\(\)\)/i);
assert.match(resumeSql, /session\.status = 'in_progress'/i);
assert.match(resumeSql, /order by session\.started_at desc/i);
assert.match(resumeSql, /if v_session_id is null then[\s\S]*insert into public\.simulation_sessions/i);
assert.match(resumeSql, /on conflict\(session_id, question_id\) do update/i);

console.log('Questões práticas e simulados EDAS lote 2: 193 verificações aprovadas.');
