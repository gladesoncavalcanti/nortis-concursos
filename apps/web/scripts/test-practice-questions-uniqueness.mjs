import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const migrationsDirectory = fileURLToPath(new URL(
  '../../../supabase/migrations/',
  import.meta.url
));

const migrationFiles = readdirSync(migrationsDirectory)
  .filter((file) => file.endsWith('.sql'))
  .sort();

const questions = new Map();

function findCteValueBlocks(sql) {
  const blocks = [];
  const header = /with\s+[a-z_][a-z0-9_]*\s*\(([^)]*)\)\s+as\s*\(\s*values/gi;
  let match;

  while ((match = header.exec(sql)) !== null) {
    let depth = 1;
    let inString = false;
    let end = header.lastIndex;

    for (; end < sql.length; end += 1) {
      const character = sql[end];
      const nextCharacter = sql[end + 1];

      if (character === "'") {
        if (inString && nextCharacter === "'") {
          end += 1;
          continue;
        }
        inString = !inString;
        continue;
      }

      if (inString) continue;
      if (character === '(') depth += 1;
      if (character === ')') depth -= 1;
      if (depth === 0) break;
    }

    assert.equal(depth, 0, 'CTE de valores sem fechamento na migration.');
    blocks.push({
      columns: match[1].split(',').map((column) => column.trim()),
      values: sql.slice(header.lastIndex, end),
    });
    header.lastIndex = end + 1;
  }

  return blocks;
}

function splitSqlRow(row) {
  const fields = [];
  let current = '';
  let inString = false;

  for (let index = 0; index < row.length; index += 1) {
    const character = row[index];
    const nextCharacter = row[index + 1];

    if (character === "'") {
      current += character;
      if (inString && nextCharacter === "'") {
        current += nextCharacter;
        index += 1;
        continue;
      }
      inString = !inString;
      continue;
    }

    if (character === ',' && !inString) {
      fields.push(current.trim());
      current = '';
      continue;
    }

    current += character;
  }

  fields.push(current.trim());
  return fields.map((field) => {
    if (field.startsWith("'") && field.endsWith("'")) {
      return field.slice(1, -1).replaceAll("''", "'");
    }
    return field;
  });
}

function parseRows(values) {
  const rows = [];
  let inString = false;
  let depth = 0;
  let start = -1;

  for (let index = 0; index < values.length; index += 1) {
    const character = values[index];
    const nextCharacter = values[index + 1];

    if (character === "'") {
      if (inString && nextCharacter === "'") {
        index += 1;
        continue;
      }
      inString = !inString;
      continue;
    }

    if (inString) continue;
    if (character === '(') {
      if (depth === 0) start = index + 1;
      depth += 1;
    } else if (character === ')') {
      depth -= 1;
      if (depth === 0 && start >= 0) rows.push(splitSqlRow(values.slice(start, index)));
    }
  }

  return rows;
}

function applyRow(row) {
  const slug = row.question_slug;
  if (!slug || (!slug.startsWith('diagnostico-') && !slug.startsWith('pratica-'))) return;

  const question = questions.get(slug) ?? { slug, options: new Map() };
  for (const field of ['specialty_slug', 'subject_slug', 'statement', 'explanation', 'source_reference']) {
    if (row[field] !== undefined) question[field] = row[field];
  }
  if (row.label && row.option_text !== undefined) question.options.set(row.label, row.option_text);
  if (row.correct_label) question.correctLabel = row.correct_label;
  questions.set(slug, question);
}

for (const migrationFile of migrationFiles) {
  const sql = readFileSync(`${migrationsDirectory}/${migrationFile}`, 'utf8').replaceAll('\r\n', '\n');
  for (const block of findCteValueBlocks(sql)) {
    for (const values of parseRows(block.values)) {
      if (values.length !== block.columns.length) continue;
      applyRow(Object.fromEntries(block.columns.map((column, index) => [column, values[index]])));
    }
  }
}

const specialtyPrefixes = [
  ['tecnico-administrativo', 'tecnico-administrativo-202'],
  ['direito-e-legislacao', 'direito-e-legislacao-403'],
  ['ciencias-contabeis', 'ciencias-contabeis-401'],
  ['comunicacao-social', 'comunicacao-social-402'],
  ['cuidador-social', 'cuidador-social-201'],
  ['educador-social', 'educador-social-405'],
  ['servico-social', 'servico-social-410'],
  ['agente-social', 'agente-social-200'],
  ['administracao', 'administracao-400'],
  ['estatistica', 'estatistica-406'],
  ['psicologia', 'psicologia-409'],
  ['sociologia', 'sociologia-411'],
  ['pedagogia', 'pedagogia-408'],
  ['nutricao', 'nutricao-407'],
  ['economia', 'economia-404'],
];

function inferSpecialty(question) {
  if (question.specialty_slug) return question.specialty_slug;
  const contentSlug = question.slug.replace(/^(diagnostico|pratica)-/, '');
  return specialtyPrefixes.find(([prefix]) => contentSlug.startsWith(`${prefix}-`))?.[1];
}

const stopWords = new Set([
  'a', 'ao', 'aos', 'as', 'com', 'como', 'da', 'das', 'de', 'do', 'dos', 'e', 'em',
  'entre', 'essa', 'esse', 'esta', 'este', 'foi', 'mais', 'na', 'nas', 'no', 'nos',
  'o', 'os', 'ou', 'para', 'pela', 'pelas', 'pelo', 'pelos', 'por', 'qual', 'que',
  'se', 'sem', 'ser', 'sua', 'suas', 'um', 'uma', 'seu', 'seus', 'à', 'às',
]);

function normalize(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function tokenSet(value) {
  const tokens = normalize(value)
    .split(/\s+/)
    .filter((token) => token.length > 2 && !stopWords.has(token));
  if (tokens.length < 2) return new Set(tokens);
  return new Set(tokens.slice(0, -1).map((token, index) => `${token} ${tokens[index + 1]}`));
}

function jaccard(left, right) {
  const leftTokens = tokenSet(left);
  const rightTokens = tokenSet(right);
  const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  const union = new Set([...leftTokens, ...rightTokens]).size;
  return union === 0 ? 0 : intersection / union;
}

const completeQuestions = [...questions.values()].filter((question) => (
  question.subject_slug
  && question.statement
  && question.explanation
  && question.options.size === 4
  && question.correctLabel
));
const diagnostics = completeQuestions.filter(({ slug }) => slug.startsWith('diagnostico-'));
const practices = completeQuestions.filter(({ slug }) => slug.startsWith('pratica-'));

assert.equal(diagnostics.length, 68, 'O catálogo efetivo deve conter 68 questões diagnósticas completas.');
assert.equal(practices.length, 68, 'O catálogo efetivo deve conter 68 questões práticas completas.');

const practicesByBlock = new Map(practices.map((question) => [
  `${inferSpecialty(question)}/${question.subject_slug}`,
  question,
]));

for (const diagnostic of diagnostics) {
  const blockKey = `${inferSpecialty(diagnostic)}/${diagnostic.subject_slug}`;
  const practice = practicesByBlock.get(blockKey);
  assert.ok(practice, `Questão prática ausente para o bloco ${blockKey}.`);

  const statementSimilarity = jaccard(diagnostic.statement, practice.statement);
  const correctAnswerSimilarity = jaccard(
    diagnostic.options.get(diagnostic.correctLabel),
    practice.options.get(practice.correctLabel)
  );
  assert.ok(
    statementSimilarity <= 0.45,
    `${blockKey}: enunciados diagnóstico/prática com similaridade ${statementSimilarity.toFixed(3)} (> 0,45).`
  );
  assert.ok(
    correctAnswerSimilarity <= 0.45,
    `${blockKey}: respostas diagnóstico/prática com similaridade ${correctAnswerSimilarity.toFixed(3)} (> 0,45).`
  );
}

// Lote 2: pares com duplicação semântica cross-especialidade já identificados
// na auditoria editorial. Mesmo critério do laço por bloco acima (Jaccard de
// bigramas ≤ 0,45), mas aplicado a pares que pertencem a especialidades e
// blocos oficiais diferentes.
const crossSpecialtyPairs = [
  ['diagnostico-administracao-liquidacao-despesa', 'diagnostico-ciencias-contabeis-liquidacao-despesa'],
  ['diagnostico-educador-social-seguridade-social', 'diagnostico-servico-social-seguridade-social'],
  ['diagnostico-comunicacao-social-impessoalidade', 'pratica-tecnico-administrativo-publicidade-impessoal'],
  ['diagnostico-agente-social-abordagem-rua', 'diagnostico-cuidador-social-populacao-rua'],
  ['diagnostico-tecnico-administrativo-anulacao-revogacao', 'diagnostico-direito-legislacao-autotutela-administrativa'],
  ['diagnostico-direito-legislacao-ldo', 'pratica-servico-social-ldo-prioridades'],
];

for (const [slugA, slugB] of crossSpecialtyPairs) {
  const a = questions.get(slugA);
  const b = questions.get(slugB);
  assert.ok(a, `Questão ausente no catálogo efetivo: ${slugA}.`);
  assert.ok(b, `Questão ausente no catálogo efetivo: ${slugB}.`);

  const statementSimilarity = jaccard(a.statement, b.statement);
  const correctAnswerSimilarity = jaccard(a.options.get(a.correctLabel), b.options.get(b.correctLabel));
  assert.ok(
    statementSimilarity <= 0.45,
    `${slugA} x ${slugB}: enunciados cross-especialidade com similaridade ${statementSimilarity.toFixed(3)} (> 0,45).`
  );
  assert.ok(
    correctAnswerSimilarity <= 0.45,
    `${slugA} x ${slugB}: respostas cross-especialidade com similaridade ${correctAnswerSimilarity.toFixed(3)} (> 0,45).`
  );
}

for (const question of completeQuestions) {
  const explanation = normalize(question.explanation);
  for (const otherQuestion of completeQuestions) {
    if (otherQuestion.slug === question.slug) continue;
    const otherCorrectAnswer = normalize(otherQuestion.options.get(otherQuestion.correctLabel));
    const answerTokens = otherCorrectAnswer.split(/\s+/);
    if (answerTokens.length < 6) continue;
    assert.ok(
      !explanation.includes(otherCorrectAnswer),
      `${question.slug}: a explicação contém integralmente a resposta correta de ${otherQuestion.slug}.`
    );
  }
}

const newCorrectLabels = new Map([
  ['pratica-tecnico-administrativo-protocolo-rastreavel', 'A'],
  ['pratica-tecnico-administrativo-planejamento-contratacao', 'D'],
  ['pratica-tecnico-administrativo-autotutela', 'A'],
  ['pratica-administracao-pdp-lacuna-competencia', 'D'],
  ['pratica-comunicacao-social-metrica-conversao', 'D'],
]);

for (const [slug, expectedLabel] of newCorrectLabels) {
  const question = questions.get(slug);
  assert.equal(question.correctLabel, expectedLabel, `${slug}: gabarito diferente do rebalanceamento aprovado.`);
  const correctLength = normalize(question.options.get(expectedLabel)).length;
  const longestDistractor = Math.max(...[...question.options]
    .filter(([label]) => label !== expectedLabel)
    .map(([, optionText]) => normalize(optionText).length));
  assert.ok(correctLength < longestDistractor, `${slug}: a alternativa correta não pode ser a mais longa.`);
  assert.match(question.source_reference, /Questão autoral Nortis\.$/);
  assert.match(question.source_reference, /Edital SEDES-DF nº 1\/2026/);
}

const correctionMigration = readFileSync(
  `${migrationsDirectory}/20260812012358_fix_duplicate_practice_questions.sql`,
  'utf8'
);
assert.doesNotMatch(correctionMigration, /\b(drop|delete|truncate|create|alter|grant|revoke)\b/i);
assert.doesNotMatch(correctionMigration, /orders|payments|asaas|edge function|secret/i);
assert.doesNotMatch(
  questions.get('diagnostico-comunicacao-social-crise-porta-voz').source_reference,
  /ANAC|Instrução Normativa nº 78\/2014/i
);

// Lote 2: vínculos, ausência de fraseado "meta" e fonte reforçada.
const crossSpecialtyRewrites = [
  'diagnostico-ciencias-contabeis-liquidacao-despesa',
  'diagnostico-servico-social-seguridade-social',
  'pratica-tecnico-administrativo-publicidade-impessoal',
  'diagnostico-cuidador-social-populacao-rua',
  'diagnostico-tecnico-administrativo-anulacao-revogacao',
  'pratica-servico-social-ldo-prioridades',
];
const expectedSubjectSlugs = new Map([
  ['diagnostico-ciencias-contabeis-liquidacao-despesa', '4-orcamento-publico-administracao-financeira-e-orcamentaria-afo'],
  ['diagnostico-servico-social-seguridade-social', '4-estado-politicas-sociais-planejamento-e-gestao'],
  ['pratica-tecnico-administrativo-publicidade-impessoal', '1-nocoes-de-direito-constitucional'],
  ['diagnostico-cuidador-social-populacao-rua', '5-populacao-em-situacao-de-rua-e-nocoes-de-abordagem-e-acolhimento-social'],
  ['diagnostico-tecnico-administrativo-anulacao-revogacao', '2-nocoes-de-direito-administrativo-e-legislacao'],
  ['pratica-servico-social-ldo-prioridades', '4-estado-politicas-sociais-planejamento-e-gestao'],
]);

for (const slug of crossSpecialtyRewrites) {
  const question = questions.get(slug);
  assert.ok(question, `Questão ausente após a migration do Lote 2: ${slug}.`);
  assert.equal(question.options.size, 4, `${slug}: deve continuar com exatamente 4 alternativas.`);
  assert.ok(question.correctLabel, `${slug}: deve continuar com gabarito definido.`);
  assert.equal(
    question.subject_slug,
    expectedSubjectSlugs.get(slug),
    `${slug}: bloco oficial não pode mudar em relação ao estado anterior à correção.`
  );
  assert.match(question.source_reference, /Questão autoral Nortis\.$/, `${slug}: deve continuar autoral Nortis.`);
}

for (const slug of ['diagnostico-agente-social-saude-mental', 'diagnostico-cuidador-social-saude-mental']) {
  const question = questions.get(slug);
  assert.ok(question, `Questão ausente após a migration do Lote 2: ${slug}.`);
  assert.doesNotMatch(
    question.statement,
    /adequad[ao] ao conteúdo previsto no edital|pedagogicamente adequad[ao]/i,
    `${slug}: enunciado ainda usa fraseado de "meta" em vez de perguntar pela conduta profissional.`
  );
}
assert.match(
  questions.get('diagnostico-agente-social-saude-mental').source_reference,
  /Lei Federal nº 10\.216\/2001/,
  'diagnostico-agente-social-saude-mental: fonte deve citar a Lei Federal nº 10.216/2001, não apenas o edital.'
);

const crossSpecialtyMigration = readFileSync(
  `${migrationsDirectory}/20260812043056_fix_cross_specialty_duplicate_questions.sql`,
  'utf8'
);
assert.doesNotMatch(
  crossSpecialtyMigration,
  /\b(drop|delete|truncate|create|alter|grant|revoke)\b/i,
  'Migration do Lote 2 não pode conter comandos estruturais.'
);
assert.doesNotMatch(
  crossSpecialtyMigration,
  /orders|payments|asaas|edge function|secret/i,
  'Migration do Lote 2 não pode tocar checkout, pagamentos, Asaas, Edge Functions ou secrets.'
);
assert.doesNotMatch(
  crossSpecialtyMigration,
  /insert\s+into/i,
  'Migration do Lote 2 deve ser exclusivamente UPDATE por slug (idempotente), sem INSERT.'
);

// Lote 3: qualidade editorial de alta confiança — duplicidade residual,
// vazamento mútuo, viés de comprimento, pistas absolutas, fonte oficial
// identificável em todo o catálogo e varredura geral de duplicidade
// semântica (além dos pares já nomeados nos lotes anteriores).

// 1) Duplicidade residual corrigida: pratica-cuidador-social-recusa-acolhimento
// não pode mais repetir o cenário e a resposta de
// pratica-agente-social-vinculo-autonomia.
{
  const a = questions.get('pratica-agente-social-vinculo-autonomia');
  const b = questions.get('pratica-cuidador-social-recusa-acolhimento');
  assert.ok(a && b, 'Par residual do Lote 3 ausente do catálogo efetivo.');
  const statementSimilarity = jaccard(a.statement, b.statement);
  const correctAnswerSimilarity = jaccard(a.options.get(a.correctLabel), b.options.get(b.correctLabel));
  assert.ok(statementSimilarity <= 0.45, `Duplicidade residual não corrigida (enunciado ${statementSimilarity.toFixed(3)}).`);
  assert.ok(correctAnswerSimilarity <= 0.45, `Duplicidade residual não corrigida (resposta ${correctAnswerSimilarity.toFixed(3)}).`);
  assert.equal(b.subject_slug, '5-populacao-em-situacao-de-rua-e-nocoes-de-abordagem-e-acolhimento-social', 'pratica-cuidador-social-recusa-acolhimento: bloco oficial não pode mudar.');
}

// 2) Vazamento mútuo corrigido: nenhuma explicação pode conter a definição
// completa (>=4 tokens) do crédito adicional da outra questão.
{
  const especial = questions.get('pratica-ciencias-contabeis-credito-especial');
  const suplementar = questions.get('pratica-direito-legislacao-credito-suplementar');
  assert.ok(especial && suplementar, 'Par de crédito adicional ausente do catálogo efetivo.');
  assert.doesNotMatch(
    normalize(especial.explanation),
    /reforca dotacao( orcamentaria)? existente/,
    'pratica-ciencias-contabeis-credito-especial: explicação ainda entrega a definição do crédito suplementar.'
  );
  assert.doesNotMatch(
    normalize(suplementar.explanation),
    /nao haja dotacao orcamentaria especifica/,
    'pratica-direito-legislacao-credito-suplementar: explicação ainda entrega a definição do crédito especial.'
  );
}

// 3) Gabarito preservado nas 20 questões tocadas pelo Lote 3 (nenhuma
// correção deveria alterar a letra correta).
const lote3PreservedLabels = new Map([
  ['pratica-cuidador-social-recusa-acolhimento', 'B'],
  ['pratica-ciencias-contabeis-credito-especial', 'B'],
  ['pratica-direito-legislacao-credito-suplementar', 'B'],
  ['diagnostico-economia-federalismo-fiscal-icms', 'C'],
  ['diagnostico-ciencias-contabeis-dvp-resultado-patrimonial', 'D'],
  ['diagnostico-nutricao-sisan-dhaa', 'B'],
  ['diagnostico-nutricao-aleitamento-complementar', 'C'],
  ['pratica-economia-pobreza-multidimensional', 'D'],
  ['diagnostico-ciencias-contabeis-liquidez-corrente', 'B'],
  ['diagnostico-administracao-projeto-operacao', 'C'],
  ['diagnostico-estatistica-regressao-inclinacao', 'C'],
  ['diagnostico-pedagogia-planejamento-participativo-paif', 'D'],
  ['diagnostico-agente-social-paif', 'B'],
  ['diagnostico-cuidador-social-acolhimento-provisorio', 'D'],
  ['diagnostico-comunicacao-social-metrica-objetivo', 'C'],
  ['diagnostico-educador-social-scfv', 'C'],
  ['diagnostico-pedagogia-gestao-democratica', 'B'],
  ['diagnostico-sociologia-indicadores-e-metodos', 'D'],
  ['pratica-ciencias-contabeis-evidencia-auditoria', 'A'],
  ['pratica-psicologia-envelhecimento-contextual', 'B'],
]);
for (const [slug, expectedLabel] of lote3PreservedLabels) {
  const question = questions.get(slug);
  assert.ok(question, `Questão ausente após a migration do Lote 3: ${slug}.`);
  assert.equal(question.options.size, 4, `${slug}: deve continuar com exatamente 4 alternativas.`);
  assert.equal(question.correctLabel, expectedLabel, `${slug}: gabarito não pode ter sido alterado pela correção editorial.`);
  const correctLength = normalize(question.options.get(expectedLabel)).length;
  const longestDistractor = Math.max(...[...question.options]
    .filter(([label]) => label !== expectedLabel)
    .map(([, optionText]) => normalize(optionText).length));
  assert.ok(correctLength < longestDistractor, `${slug}: a alternativa correta não pode ser desproporcionalmente maior que os distratores.`);
}

// 4) Pistas absolutas removidas dos distratores das questões corrigidas por
// esse critério (a correta nunca continha termo absoluto).
const ABSOLUTE_CLUE = /\b(sempre|nunca|jamais|toda|todas|todos|nenhum|nenhuma|exclusivamente|obrigatoriamente|unicamente|somente|apenas|automaticamente|totalmente|completamente)\b/i;
const absolutismFixed = [
  'diagnostico-cuidador-social-acolhimento-provisorio',
  'diagnostico-comunicacao-social-metrica-objetivo',
  'diagnostico-educador-social-scfv',
  'diagnostico-pedagogia-gestao-democratica',
  'diagnostico-sociologia-indicadores-e-metodos',
  'pratica-ciencias-contabeis-evidencia-auditoria',
  'pratica-economia-pobreza-multidimensional',
  'pratica-psicologia-envelhecimento-contextual',
];
for (const slug of absolutismFixed) {
  const question = questions.get(slug);
  const distractorsWithClue = [...question.options]
    .filter(([label]) => label !== question.correctLabel)
    .filter(([, optionText]) => ABSOLUTE_CLUE.test(optionText)).length;
  assert.ok(
    distractorsWithClue < 2,
    `${slug}: ainda há ${distractorsWithClue} distratores com termo absoluto, formando pista de gabarito.`
  );
}

// 5) Fonte oficial identificável em TODO o catálogo efetivo: toda questão
// deve citar pelo menos uma norma/fonte além do próprio item do edital.
for (const question of completeQuestions) {
  const withoutAuthorship = (question.source_reference || '').replace(/Quest[aã]o autoral Nortis\.?\s*$/i, '').trim();
  const externalSources = withoutAuthorship.split(';').map((part) => part.trim()).filter(Boolean).filter((part) => !/^edital/i.test(part));
  assert.ok(
    externalSources.length > 0,
    `${question.slug}: fonte não identifica norma ou referência oficial além do item do edital.`
  );
}

// 6) Varredura geral de duplicidade semântica em todo o catálogo efetivo
// (além dos pares já nomeados): nenhum par de questões, de qualquer
// especialidade ou camada, pode ter enunciado ou resposta correta com
// similaridade acima de 0,45.
for (let i = 0; i < completeQuestions.length; i += 1) {
  for (let j = i + 1; j < completeQuestions.length; j += 1) {
    const left = completeQuestions[i];
    const right = completeQuestions[j];
    const statementSimilarity = jaccard(left.statement, right.statement);
    const correctAnswerSimilarity = jaccard(left.options.get(left.correctLabel), right.options.get(right.correctLabel));
    assert.ok(
      statementSimilarity <= 0.45,
      `${left.slug} x ${right.slug}: enunciados com similaridade ${statementSimilarity.toFixed(3)} (> 0,45), duplicidade não coberta pelos pares nomeados.`
    );
    assert.ok(
      correctAnswerSimilarity <= 0.45,
      `${left.slug} x ${right.slug}: respostas com similaridade ${correctAnswerSimilarity.toFixed(3)} (> 0,45), duplicidade não coberta pelos pares nomeados.`
    );
  }
}

const qualityMigration = readFileSync(
  `${migrationsDirectory}/20260812050000_fix_question_quality_issues.sql`,
  'utf8'
);
assert.doesNotMatch(
  qualityMigration,
  /\b(drop|delete|truncate|create|alter|grant|revoke)\b/i,
  'Migration do Lote 3 não pode conter comandos estruturais.'
);
assert.doesNotMatch(
  qualityMigration,
  /orders|payments|asaas|edge function|secret/i,
  'Migration do Lote 3 não pode tocar checkout, pagamentos, Asaas, Edge Functions ou secrets.'
);
assert.doesNotMatch(
  qualityMigration,
  /insert\s+into/i,
  'Migration do Lote 3 deve ser exclusivamente UPDATE por slug (idempotente), sem INSERT.'
);

console.log('Integridade editorial: 68 pares diagnóstico/prática, 6 pares cross-especialidade, 5 correções prioritárias, Lote 2 (8 questões), Lote 3 (20 questões) e varredura geral de duplicidade aprovados.');
