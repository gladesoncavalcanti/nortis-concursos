import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const migrationPath = fileURLToPath(new URL(
  '../../../supabase/migrations/20260811110719_seed_practice_questions_and_simulation_pilot.sql',
  import.meta.url
));
const sql = readFileSync(migrationPath, 'utf8');

const practiceSlugs = [
  'pratica-agente-social-referencia-contrarreferencia',
  'pratica-agente-social-scfv-paif',
  'pratica-agente-social-acolhimento-provisoriedade',
  'pratica-agente-social-vinculo-autonomia',
  'pratica-agente-social-reducao-danos-rede',
];

assert.match(sql, /add column if not exists target_specialty_id uuid/i);
assert.match(sql, /simulations_product_specialty_sort_idx/i);
assert.match(sql, /profile\.target_specialty_id = simulations\.target_specialty_id/i);
assert.match(sql, /raise exception 'specialty_mismatch'/i);
assert.match(sql, /set search_path = ''/i);
assert.match(sql, /revoke all on function public\.start_simulation\(uuid\) from public, anon/i);
assert.match(sql, /grant execute on function public\.start_simulation\(uuid\) to authenticated/i);

for (const slug of practiceSlugs) {
  assert.match(sql, new RegExp(slug, 'g'));
}

const optionRows = [...sql.matchAll(/\('pratica-agente-social-[^']+','[A-D]','[^']+',\d+\)/g)];
assert.equal(optionRows.length, 20);

const solutionBlock = sql.match(/with solution_seed[\s\S]+?insert into public\.question_solutions/i)?.[0] ?? '';
for (const slug of practiceSlugs) assert.match(solutionBlock, new RegExp(slug));

assert.match(sql, /diagnostic_eligible[\s\S]+false/i);
assert.match(sql, /authorship[\s\S]+'Nortis Concursos'/i);
assert.match(sql, /Questão autoral Nortis\./g);
assert.match(sql, /simulado-piloto-agente-social/i);
assert.match(sql, /Cinco questões autorais da Nortis/i);
assert.match(sql, /sem equivalência com nota oficial/i);
assert.match(sql, /time_limit_minutes[\s\S]+10/i);
assert.match(sql, /on conflict \(slug\) where slug is not null do update/i);
assert.match(sql, /on conflict \(simulation_id, question_id\) do update/i);

const simulationSeed = sql.match(/with simulation_seed[\s\S]+?insert into public\.simulation_questions/i)?.[0] ?? '';
for (const slug of practiceSlugs) assert.match(simulationSeed, new RegExp(slug));

assert.doesNotMatch(sql, /insert into public\.(orders|order_items|payments|downloads)/i);
assert.doesNotMatch(sql, /asaas|edge function|secret/i);

console.log('Piloto de prática e simulado: 37 verificações aprovadas.');
