import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const migrationPath = fileURLToPath(new URL(
  '../../../supabase/migrations/20260811133918_seed_practice_questions_and_simulations_tdas.sql',
  import.meta.url
));
const sql = readFileSync(migrationPath, 'utf8');
const specialtySeedPath = fileURLToPath(new URL(
  '../../../supabase/migrations/20260810140042_seed_specialty_subjects.sql',
  import.meta.url
));
const specialtySeedSql = readFileSync(specialtySeedPath, 'utf8');

const specialties = {
  'cuidador-social-201': [
    'pratica-cuidador-social-articulacao-intersetorial',
    'pratica-cuidador-social-rotina-autonomia',
    'pratica-cuidador-social-preservacao-vinculos',
    'pratica-cuidador-social-recusa-acolhimento',
    'pratica-cuidador-social-crise-saude-mental',
  ],
  'tecnico-administrativo-202': [
    'pratica-tecnico-administrativo-publicidade-impessoal',
    'pratica-tecnico-administrativo-autotutela',
    'pratica-tecnico-administrativo-protocolo-rastreavel',
    'pratica-tecnico-administrativo-planejamento-contratacao',
  ],
};

const allQuestionSlugs = Object.values(specialties).flat();
for (const [specialtySlug, questionSlugs] of Object.entries(specialties)) {
  assert.match(sql, new RegExp(`'${specialtySlug}'`));
  assert.match(specialtySeedSql, new RegExp(`'${specialtySlug}'`));
  for (const questionSlug of questionSlugs) {
    assert.match(sql, new RegExp(`'${questionSlug}'`, 'g'));
  }
}

const optionBlock = sql.match(/with option_seed[\s\S]+?insert into public\.question_options/i)?.[0] ?? '';
const optionRows = [...optionBlock.matchAll(/\('pratica-(?:cuidador-social|tecnico-administrativo)-[^']+','[A-D]','[^']+',\d+\)/g)];
assert.equal(optionRows.length, 36);

const solutionBlock = sql.match(/with solution_seed[\s\S]+?insert into public\.question_solutions/i)?.[0] ?? '';
for (const questionSlug of allQuestionSlugs) assert.match(solutionBlock, new RegExp(questionSlug));
const solutionRows = [...solutionBlock.matchAll(/\('pratica-(?:cuidador-social|tecnico-administrativo)-[^']+','[A-D]'\)/g)];
assert.equal(solutionRows.length, 9);

assert.match(sql, /diagnostic_eligible[\s\S]+false/i);
assert.match(sql, /authorship[\s\S]+'Nortis Concursos'/i);
assert.equal((sql.match(/Questão autoral Nortis\./g) ?? []).length, 9);
assert.equal((sql.match(/atualizado pelos Editais nº 2 e nº 3/g) ?? []).length, 9);

const expectedSubjects = [
  '2-rede-socioassistencial-e-intersetorialidade',
  '3-rotinas-de-acolhimento-cuidado-e-trabalho-em-equipe',
  '4-protecao-social-especial-de-alta-complexidade',
  '5-populacao-em-situacao-de-rua-e-nocoes-de-abordagem-e-acolhimento-social',
  '6-nocoes-de-saude-mental-e-reducao-de-danos',
  '1-nocoes-de-direito-constitucional',
  '2-nocoes-de-direito-administrativo-e-legislacao',
  '3-atendimento-rotinas-administrativas-e-arquivologia',
  '4-nocoes-de-recursos-materiais-patrimonio-e-compras',
];
for (const subjectSlug of expectedSubjects) assert.match(sql, new RegExp(`'${subjectSlug}'`));
for (const subjectSlug of expectedSubjects) assert.match(specialtySeedSql, new RegExp(`'${subjectSlug}'`));

assert.match(sql, /simulado-piloto-cuidador-social/);
assert.match(sql, /Simulado piloto — Cuidador Social/);
assert.match(sql, /Cinco questões autorais da Nortis/);
assert.match(sql, /simulado-piloto-tecnico-administrativo/);
assert.match(sql, /Simulado piloto — Técnico Administrativo/);
assert.match(sql, /Quatro questões autorais da Nortis/);
assert.equal((sql.match(/sem equivalência com nota oficial/g) ?? []).length, 2);
assert.match(sql, /on conflict \(slug\) where slug is not null do update/i);
assert.match(sql, /on conflict \(simulation_id, question_id\) do update/i);

const simulationQuestionBlock = sql.match(/with simulation_question_seed[\s\S]+?insert into public\.simulation_questions/i)?.[0] ?? '';
for (const questionSlug of allQuestionSlugs) assert.match(simulationQuestionBlock, new RegExp(questionSlug));
const simulationQuestionRows = [...simulationQuestionBlock.matchAll(/\('simulado-piloto-(?:cuidador-social|tecnico-administrativo)','pratica-[^']+',\d+\)/g)];
assert.equal(simulationQuestionRows.length, 9);

assert.doesNotMatch(sql, /create table|alter table|create policy|create or replace function|\bgrant\b|\brevoke\b/i);
assert.doesNotMatch(sql, /insert into public\.(orders|order_items|payments|downloads)/i);
assert.doesNotMatch(sql, /asaas|edge function|secret/i);

console.log('Questões práticas e simulados TDAS: 85 verificações aprovadas.');
