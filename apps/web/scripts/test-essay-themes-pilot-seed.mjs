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
// Normaliza CRLF->LF: um checkout fresco no Windows (ex.: git worktree
// add a partir do zero) pode trazer o arquivo com CRLF mesmo quando o
// conteúdo é idêntico — sem isso, regexes com \n literal (ex.: a
// checagem do bloco de dados abaixo) dão falso negativo dependendo de
// como o worktree foi criado. Achado real durante a simulação de
// pós-merge (Fase 3): o mesmo arquivo tinha LF neste worktree e CRLF
// no worktree criado do zero a partir do merge simulado.
const migration = readFileSync(migrationPath, 'utf8').replace(/\r\n/g, '\n');

const EXPECTED_SLUGS = [
  'suas-e-pnas',
  'protecao-social-basica-e-especial',
  'intersetorialidade',
  'territorializacao-e-diagnostico',
  'beneficios-e-programas-do-df',
  'direitos-e-violacoes',
];

// Fonte canônica (decisão humana de reconciliação literal, 2026-08-13):
// transcrição exata do PDF-fonte (Nortis_Redacao_Quadrix_SEDES_DF_2026.pdf,
// Seção 6, item 16, página 32 — confirmado por fonte dupla idêntica em
// Nortis_Redacao_SEDES_DF_2026_Direcao_Editorial_V2.pdf, página 26). Sem
// paráfrase, ampliação, modernização ou complemento próprio.
const LITERAL_PDF_CONTENT = {
  'suas-e-pnas': {
    title: 'SUAS e PNAS',
    prompt_text: 'Explique princípios, proteções, seguranças e organização territorial.',
  },
  'protecao-social-basica-e-especial': {
    title: 'Proteção social básica e especial',
    prompt_text: 'Diferencie CRAS/CREAS, PAIF/PAEFI, média/alta complexidade.',
  },
  'intersetorialidade': {
    title: 'Intersetorialidade',
    prompt_text: 'Analise a articulação entre assistência, saúde, educação, justiça e segurança.',
  },
  'territorializacao-e-diagnostico': {
    title: 'Territorialização e diagnóstico',
    prompt_text: 'Explique por que o território orienta a atuação socioassistencial.',
  },
  'beneficios-e-programas-do-df': {
    title: 'Benefícios e programas do DF',
    prompt_text: 'Relacione benefícios, segurança de renda e acompanhamento familiar.',
  },
  'direitos-e-violacoes': {
    title: 'Direitos e violações',
    prompt_text: 'Analise resposta estatal diante de violação de direitos.',
  },
};

// Bloco de dados (CTE theme_seed) isolado do resto do arquivo — usado
// para checar duplicidade real dos temas sem contar a referência
// legítima e adicional que a guarda de integridade (checagem 13) faz a
// cada slug.
const dataBlockMatch = migration.match(/with theme_seed[\s\S]*?\)\ninsert into public\.essay_themes/);
assert.ok(dataBlockMatch, 'bloco de dados theme_seed não encontrado');
const dataBlock = dataBlockMatch[0];

// 1) exatamente os seis temas esperados
// 2) nenhum duplicado — cada slug aparece exatamente uma vez no bloco de dados
EXPECTED_SLUGS.forEach((slug) => {
  const occurrences = dataBlock.split(`'${slug}'`).length - 1;
  assert.equal(occurrences, 1, `slug ${slug} deveria aparecer exatamente 1 vez no bloco de dados (achou ${occurrences})`);
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

// 13) guarda de integridade pós-insert: se o produto não existir/não
// coincidir, o upsert por join afeta 0 linhas silenciosamente (sem
// erro) — comprovado em
// supabase/tests/seed_essay_themes_pilot_missing_product.sql. A
// migration precisa detectar isso e falhar explicitamente, nunca
// "ter sucesso" sem semear os seis temas no produto certo.
assert.match(migration, /raise exception 'seed_essay_themes_pilot:/);
assert.match(migration, /v_seeded_count <> 6/);
EXPECTED_SLUGS.forEach((slug) => {
  const guardBlockMatch = migration.match(/do \$guard\$[\s\S]*?\$guard\$;/);
  assert.ok(guardBlockMatch, 'guarda de integridade não encontrada');
  assert.match(guardBlockMatch[0], new RegExp(`'${slug}'`), `guarda não verifica o slug ${slug}`);
});

// 14) reconciliação literal: title/prompt_text de cada tema batem
// EXATAMENTE (mesma acentuação/pontuação) com a transcrição do
// PDF-fonte — decisão humana de 2026-08-13, pendência documental
// encerrada. Cada valor precisa aparecer literalmente no bloco de
// dados, entre aspas simples (delimitador de string SQL), para excluir
// qualquer paráfrase residual.
Object.entries(LITERAL_PDF_CONTENT).forEach(([slug, { title, prompt_text }]) => {
  assert.ok(
    dataBlock.includes(`'${title}'`),
    `título do tema ${slug} não bate literalmente com o PDF-fonte (esperado: "${title}")`
  );
  assert.ok(
    dataBlock.includes(`'${prompt_text}'`),
    `comando do tema ${slug} não bate literalmente com o PDF-fonte (esperado: "${prompt_text}")`
  );
});
assert.match(migration, /CONFERENCIA DOCUMENTAL ENCERRADA/);
assert.match(migration, /pendencia documental do PR #81 esta ENCERRADA/);

console.log(`Piloto de temas de treino (seed) — 14 verificações aprovadas, ${EXPECTED_SLUGS.length} temas, conteúdo reconciliado literalmente com o PDF-fonte.`);
