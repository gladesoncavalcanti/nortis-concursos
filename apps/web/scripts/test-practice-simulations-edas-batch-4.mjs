import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const migrationPath = fileURLToPath(new URL(
  '../../../supabase/migrations/20260811163327_seed_practice_questions_and_simulations_edas_batch_4.sql',
  import.meta.url
));
const sql = readFileSync(migrationPath, 'utf8');
const edasSubjectSeedPart3 = readFileSync(fileURLToPath(new URL(
  '../../../supabase/migrations/20260810140110_seed_specialty_subjects.sql',
  import.meta.url
)), 'utf8');
const edasSubjectSeedPart4 = readFileSync(fileURLToPath(new URL(
  '../../../supabase/migrations/20260810140119_seed_specialty_subjects.sql',
  import.meta.url
)), 'utf8');
const officialSubjectSeed = `${edasSubjectSeedPart3}\n${edasSubjectSeedPart4}`;
const engineSql = readFileSync(fileURLToPath(new URL(
  '../../../supabase/migrations/20260811124715_seed_practice_questions_and_simulation_pilot.sql',
  import.meta.url
)), 'utf8');
const resumeSql = readFileSync(fileURLToPath(new URL(
  '../../../supabase/migrations/20260811105713_improve_simulation_session_resume.sql',
  import.meta.url
)), 'utf8');

const specialties = {
  'psicologia-409': {
    simulation: 'simulado-piloto-psicologia',
    questions: [
      ['1-fundamentos-da-psicologia-e-psicologia-social', 'pratica-psicologia-envelhecimento-contextual'],
      ['2-a-pratica-psicossocial-no-suas', 'pratica-psicologia-reducao-danos-autonomia'],
      ['3-avaliacao-e-instrumentos-tecnico-operativos', 'pratica-psicologia-visita-domiciliar'],
      ['4-etica-profissional-e-elaboracao-de-documentos', 'pratica-psicologia-declaracao-limites'],
    ],
  },
  'servico-social-410': {
    simulation: 'simulado-piloto-servico-social',
    questions: [
      ['1-fundamentos-historicos-e-teorico-metodologicos', 'pratica-servico-social-questao-social-mediacoes'],
      ['2-etica-e-legislacao-profissional', 'pratica-servico-social-autonomia-usuario'],
      ['3-dimensao-tecnico-operativa-e-pesquisa-social', 'pratica-servico-social-estudo-social-opiniao'],
      ['4-estado-politicas-sociais-planejamento-e-gestao', 'pratica-servico-social-ldo-prioridades'],
    ],
  },
  'sociologia-411': {
    simulation: 'simulado-piloto-sociologia',
    questions: [
      ['1-teoria-sociologica-e-conceitos-fundamentais', 'pratica-sociologia-acao-social-weber'],
      ['2-pensamento-social-colonialismo-e-relacoes-etnico-raciais', 'pratica-sociologia-desagregacao-indicadores-raciais'],
      ['3-sociologia-urbana-desigualdades-e-movimentos-sociais', 'pratica-sociologia-segregacao-mobilidade'],
      ['4-metodologia-de-pesquisa-social-e-avaliacao-de-politicas', 'pratica-sociologia-taxa-comparacao-territorios'],
    ],
  },
};

const allQuestions = Object.values(specialties).flatMap(({ questions }) => questions);
const questionSlugs = allQuestions.map(([, slug]) => slug);
assert.equal(questionSlugs.length, 12);
assert.equal(new Set(questionSlugs).size, 12);

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
const optionRows = [...optionBlock.matchAll(/\('pratica-(?:psicologia|servico-social|sociologia)-[^']+','[A-D]','[^']+',\d+\)/g)];
assert.equal(optionRows.length, 48);
for (const questionSlug of questionSlugs) {
  const optionsForQuestion = optionRows.filter(([row]) => row.includes(`('${questionSlug}'`));
  assert.equal(optionsForQuestion.length, 4, questionSlug);
  assert.deepEqual(optionsForQuestion.map(([row]) => row.match(/,'([A-D])',/)?.[1]), ['A', 'B', 'C', 'D']);
}

const solutionBlock = sql.match(/with solution_seed[\s\S]+?insert into public\.question_solutions/i)?.[0] ?? '';
const solutionRows = [...solutionBlock.matchAll(/\('pratica-(?:psicologia|servico-social|sociologia)-[^']+','[A-D]'\)/g)];
assert.equal(solutionRows.length, 12);
for (const questionSlug of questionSlugs) {
  assert.equal(solutionRows.filter(([row]) => row.includes(`('${questionSlug}'`)).length, 1);
}

assert.match(sql, /diagnostic_eligible[\s\S]+false/i);
assert.match(sql, /authorship[\s\S]+'Nortis Concursos'/i);
assert.equal((sql.match(/Questão autoral Nortis\./g) ?? []).length, 12);
assert.equal((sql.match(/atualizado conforme os Editais nº 2 e nº 3/g) ?? []).length, 12);
assert.match(sql, /seed\.explanation, 'Nortis Concursos', seed\.source_reference,\s+false, seed\.sort_order, true/i);

assert.match(sql, /simulado-piloto-psicologia/);
assert.match(sql, /Simulado piloto — Psicologia/);
assert.match(sql, /simulado-piloto-servico-social/);
assert.match(sql, /Simulado piloto — Serviço Social/);
assert.match(sql, /simulado-piloto-sociologia/);
assert.match(sql, /Simulado piloto — Sociologia/);
assert.equal((sql.match(/Quatro questões autorais da Nortis/g) ?? []).length, 3);
assert.equal((sql.match(/sem equivalência com nota oficial/g) ?? []).length, 3);
assert.equal((sql.match(/\r?\n\s+10,\r?\n\s+4(?:09|10|11)10/g) ?? []).length, 3);

const simulationQuestionBlock = sql.match(/with simulation_question_seed[\s\S]+?insert into public\.simulation_questions/i)?.[0] ?? '';
const simulationQuestionRows = [...simulationQuestionBlock.matchAll(/\('simulado-piloto-(?:psicologia|servico-social|sociologia)','pratica-[^']+',\d+\)/g)];
assert.equal(simulationQuestionRows.length, 12);
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

console.log('Questões práticas e simulados EDAS lote 4: verificações aprovadas.');
