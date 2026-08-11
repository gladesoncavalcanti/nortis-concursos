import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const migrationPath = fileURLToPath(new URL(
  '../../../supabase/migrations/20260811155147_seed_practice_questions_and_simulations_edas_batch_3.sql',
  import.meta.url
));
const sql = readFileSync(migrationPath, 'utf8');
const edasSubjectSeedPart2 = readFileSync(fileURLToPath(new URL(
  '../../../supabase/migrations/20260810140059_seed_specialty_subjects.sql',
  import.meta.url
)), 'utf8');
const edasSubjectSeedPart3 = readFileSync(fileURLToPath(new URL(
  '../../../supabase/migrations/20260810140110_seed_specialty_subjects.sql',
  import.meta.url
)), 'utf8');
const officialSubjectSeed = `${edasSubjectSeedPart2}\n${edasSubjectSeedPart3}`;
const engineSql = readFileSync(fileURLToPath(new URL(
  '../../../supabase/migrations/20260811124715_seed_practice_questions_and_simulation_pilot.sql',
  import.meta.url
)), 'utf8');
const resumeSql = readFileSync(fileURLToPath(new URL(
  '../../../supabase/migrations/20260811105713_improve_simulation_session_resume.sql',
  import.meta.url
)), 'utf8');

const specialties = {
  'estatistica-406': {
    simulation: 'simulado-piloto-estatistica',
    questions: [
      ['1-estatistica-descritiva-e-analise-exploratoria-de-dados', 'pratica-estatistica-boxplot-valor-atipico'],
      ['2-probabilidade-e-inferencia-estatistica', 'pratica-estatistica-qui-quadrado-independencia'],
      ['3-modelagem-estatistica-e-analise-multivariada', 'pratica-estatistica-componentes-principais'],
      ['4-gestao-e-exploracao-de-bancos-de-dados', 'pratica-estatistica-left-join'],
    ],
  },
  'nutricao-407': {
    simulation: 'simulado-piloto-nutricao',
    questions: [
      ['1-seguranca-alimentar-e-nutricional-san-e-politicas-publicas', 'pratica-nutricao-conceito-san'],
      ['2-nutricao-em-saude-publica-e-epidemiologia', 'pratica-nutricao-vigilancia-alimentar'],
      ['3-gestao-de-unidades-de-alimentacao-e-nutricao-uan', 'pratica-nutricao-prevencao-contaminacao-cruzada'],
      ['4-educacao-alimentar-e-nutricional-ean-e-programas-institucionais', 'pratica-nutricao-cae-controle-social'],
      ['5-fundamentos-de-nutricao-e-dietoterapia-basica', 'pratica-nutricao-orientacao-hipertensao'],
    ],
  },
  'pedagogia-408': {
    simulation: 'simulado-piloto-pedagogia',
    questions: [
      ['1-fundamentos-da-educacao-e-pedagogia-social', 'pratica-pedagogia-espaco-nao-escolar'],
      ['2-direito-educacional', 'pratica-pedagogia-direito-educacao'],
      ['3-o-pedagogo-no-suas', 'pratica-pedagogia-planejamento-suas'],
      ['4-intervencao-pedagogica-nas-situacoes-de-vulnerabilidade-e-violencia', 'pratica-pedagogia-comunicacao-maus-tratos'],
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
const optionRows = [...optionBlock.matchAll(/\('pratica-(?:estatistica|nutricao|pedagogia)-[^']+','[A-D]','[^']+',\d+\)/g)];
assert.equal(optionRows.length, 52);
for (const questionSlug of questionSlugs) {
  const optionsForQuestion = optionRows.filter(([row]) => row.includes(`('${questionSlug}'`));
  assert.equal(optionsForQuestion.length, 4, questionSlug);
  assert.deepEqual(optionsForQuestion.map(([row]) => row.match(/,'([A-D])',/)?.[1]), ['A', 'B', 'C', 'D']);
}

const solutionBlock = sql.match(/with solution_seed[\s\S]+?insert into public\.question_solutions/i)?.[0] ?? '';
const solutionRows = [...solutionBlock.matchAll(/\('pratica-(?:estatistica|nutricao|pedagogia)-[^']+','[A-D]'\)/g)];
assert.equal(solutionRows.length, 13);
for (const questionSlug of questionSlugs) {
  assert.equal(solutionRows.filter(([row]) => row.includes(`('${questionSlug}'`)).length, 1);
}

assert.match(sql, /diagnostic_eligible[\s\S]+false/i);
assert.match(sql, /authorship[\s\S]+'Nortis Concursos'/i);
assert.equal((sql.match(/Questão autoral Nortis\./g) ?? []).length, 13);
assert.equal((sql.match(/atualizado pelos Editais nº 2 e nº 3/g) ?? []).length, 13);
assert.match(sql, /seed\.explanation, 'Nortis Concursos', seed\.source_reference,\s+false, seed\.sort_order, true/i);

assert.match(sql, /simulado-piloto-estatistica/);
assert.match(sql, /Quatro questões autorais da Nortis/);
assert.match(sql, /simulado-piloto-nutricao/);
assert.match(sql, /Cinco questões autorais da Nortis/);
assert.match(sql, /simulado-piloto-pedagogia/);
assert.equal((sql.match(/Quatro questões autorais da Nortis/g) ?? []).length, 2);
assert.equal((sql.match(/sem equivalência com nota oficial/g) ?? []).length, 3);
assert.equal((sql.match(/\r?\n\s+10,\r?\n\s+40[678]10/g) ?? []).length, 3);

const simulationQuestionBlock = sql.match(/with simulation_question_seed[\s\S]+?insert into public\.simulation_questions/i)?.[0] ?? '';
const simulationQuestionRows = [...simulationQuestionBlock.matchAll(/\('simulado-piloto-(?:estatistica|nutricao|pedagogia)','pratica-[^']+',\d+\)/g)];
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

// O lote somente semeia conteúdo. As verificações abaixo preservam explícitas
// as proteções do motor compartilhado, sem duplicar ou alterar sua implementação.
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

console.log('Questões práticas e simulados EDAS lote 3: 193 verificações aprovadas.');
