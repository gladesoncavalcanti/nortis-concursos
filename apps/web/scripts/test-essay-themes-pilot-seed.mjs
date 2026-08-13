// Valida, de forma estática (mesmo padrão dos demais testes de migration
// do projeto), o seed piloto de temas de treino de redação para
// SEDES-DF 2026 — sem conexão com banco real (a prova de idempotência
// real, transacional e revertida, foi feita separadamente via
// supabase/tests/seed_essay_themes_pilot_dry_run.sql).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const migrationPath = fileURLToPath(new URL(
  '../../../supabase/migrations/20260813140000_seed_essay_themes_sedes_df_pilot.sql',
  import.meta.url
));
const migration = readFileSync(migrationPath, 'utf8');

const EXPECTED_SLUGS = [
  'suas-e-pnas-principios-e-organizacao-territorial',
  'protecao-social-basica-e-especial',
  'intersetorialidade-na-protecao-social',
  'territorializacao-e-diagnostico-socioassistencial',
  'beneficios-e-programas-socioassistenciais-do-df',
  'resposta-estatal-as-violacoes-de-direitos',
];

// 1) exatamente os seis temas esperados
// 2) nenhum duplicado — cada slug aparece exatamente uma vez no arquivo
EXPECTED_SLUGS.forEach((slug) => {
  const occurrences = migration.split(`'${slug}'`).length - 1;
  assert.equal(occurrences, 1, `slug ${slug} deveria aparecer exatamente 1 vez (achou ${occurrences})`);
});

// 3) idempotência — upsert por slug com índice único parcial (mesmo
// padrão de simulations/questions), nunca um insert "cego"
assert.match(migration, /create unique index if not exists essay_themes_slug_uidx/);
assert.match(migration, /on conflict \(slug\) where slug is not null do update set/);

// 4) produto resolvido por slug, nunca por UUID hardcoded
assert.match(migration, /product\.slug = 'nexo-social-sedes-df-2026'/);
assert.doesNotMatch(
  migration,
  /product_id\s*[,)]\s*[\s\S]{0,80}'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'/i,
  'migration não deve conter um UUID de produto hardcoded'
);

// 5) nenhuma alteração na tabela products
assert.doesNotMatch(migration, /update\s+public\.products/i);
assert.doesNotMatch(migration, /alter table\s+public\.products/i);

// 6) nenhum tema chamado "oficial" — nem no título/comando, nem
// afirmando previsão de incidência. Checagem restrita ao bloco de
// dados (CTE theme_seed), não aos comentários explicativos do
// cabeçalho — o próprio cabeçalho contém essas frases como NEGAÇÃO
// ("NÃO são temas oficiais...", "nenhuma previsão de incidência..."),
// o que faria uma checagem no arquivo inteiro dar falso positivo.
const dataBlockMatch = migration.match(/with theme_seed[\s\S]*?\)\ninsert into public\.essay_themes/);
assert.ok(dataBlockMatch, 'bloco de dados theme_seed não encontrado');
const dataBlock = dataBlockMatch[0];
assert.doesNotMatch(dataBlock, /tema oficial/i);
assert.doesNotMatch(dataBlock, /previs[aã]o de incid[eê]ncia/i);
assert.match(migration, /não é publicação oficial do Instituto Quadrix nem da SEDES-DF/);

// 7) source_reference presente para os seis temas (mesma fonte editorial)
const sourceReferenceOccurrences = migration.split('Nortis Concursos — Redação Quadrix SEDES-DF 2026').length - 1;
assert.equal(sourceReferenceOccurrences, EXPECTED_SLUGS.length, 'cada tema deve ter source_reference');

// 8) active = false por padrão (estratégia escolhida: ativação é uma
// etapa separada e controlada, só depois do PR #80 estar em produção)
assert.match(migration, /\n\s*false, seed\.sort_order/);
assert.match(migration, /product\.id, null, seed\.slug, seed\.title, seed\.prompt_text, seed\.source_reference,/);

// 9) sort_order determinístico (10..60, um valor distinto por tema)
[10, 20, 30, 40, 50, 60].forEach((value) => {
  assert.match(migration, new RegExp(`,\\s*${value}\\s*\\)`));
});

// 10) nenhuma policy/RLS tocada — sem "create policy"/"drop policy"/
// "enable row level security" nesta migration (a RLS já existe desde a
// migration estrutural e não deve ser recriada aqui)
assert.doesNotMatch(migration, /create policy/i);
assert.doesNotMatch(migration, /drop policy/i);
assert.doesNotMatch(migration, /row level security/i);

// 11) migration limitada a essay_themes — nenhum "create table"/"alter
// table"/"insert into" fora de essay_themes ou products (products só é
// lido via join, nunca alterado — já garantido pelo teste 5 acima)
const structuralStatements = migration.match(/\b(create table|alter table|insert into)\s+public\.\w+/gi) ?? [];
assert.ok(structuralStatements.length > 0, 'migration deveria conter comandos estruturais.');
assert.ok(
  structuralStatements.every((statement) => /public\.essay_themes\b/i.test(statement)),
  `migration toca tabela fora do escopo: ${structuralStatements.join(', ')}`
);

// 12) nenhum dado de Asaas/checkout/Sprint Discursiva tocado
assert.doesNotMatch(migration, /asaas/i);
assert.doesNotMatch(migration, /checkout/i);
assert.doesNotMatch(migration, /sprint_discursiva|sprint-discursiva/i);
assert.doesNotMatch(migration, /discursive_interest_leads/i);
assert.doesNotMatch(migration, /\bdrop\b|\btruncate\b/i);

console.log(`Piloto de temas de treino (seed) — 12 verificações aprovadas, ${EXPECTED_SLUGS.length} temas.`);
