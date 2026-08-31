import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const migrationPath = fileURLToPath(new URL(
  '../../../supabase/migrations/20260831014500_activate_essay_themes_sedes_df_pilot.sql',
  import.meta.url
));
const migration = readFileSync(migrationPath, 'utf8').replace(/\r\n/g, '\n');
const sqlWithoutComments = migration
  .split('\n')
  .filter((line) => !line.trimStart().startsWith('--'))
  .join('\n');

const EXPECTED_SLUGS = [
  'suas-e-pnas',
  'protecao-social-basica-e-especial',
  'intersetorialidade',
  'territorializacao-e-diagnostico',
  'beneficios-e-programas-do-df',
  'direitos-e-violacoes',
];

assert.match(migration, /update public\.essay_themes theme/);
assert.match(migration, /set\s+active = true,\s+updated_at = now\(\)/);
assert.match(migration, /product\.slug = 'nexo-social-sedes-df-2026'/);
assert.match(migration, /product\.active = true/);
assert.match(migration, /theme\.product_id = product\.id/);
assert.match(migration, /v_active_count <> 6/);

for (const slug of EXPECTED_SLUGS) {
  const occurrences = migration.split(`'${slug}'`).length - 1;
  assert.equal(occurrences, 2, `slug ${slug} deve aparecer no CTE e na guarda`);
}

assert.doesNotMatch(migration, /create table/i);
assert.doesNotMatch(migration, /alter table/i);
assert.doesNotMatch(migration, /create policy|drop policy|row level security/i);
assert.doesNotMatch(migration, /grant |revoke /i);
assert.doesNotMatch(migration, /\bdrop\b|\btruncate\b|\bdelete\b/i);
assert.doesNotMatch(sqlWithoutComments, /checkout|pagamento|payment|order|pedido|asaas|edge functions?/i);
assert.doesNotMatch(sqlWithoutComments, /public\.products\s+set|update\s+public\.products/i);

console.log('Ativação dos temas piloto de redação: 6 slugs e escopo restrito aprovados.');
