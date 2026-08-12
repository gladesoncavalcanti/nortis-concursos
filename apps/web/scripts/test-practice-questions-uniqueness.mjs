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
  `${migrationsDirectory}/20260811171733_fix_duplicate_practice_questions.sql`,
  'utf8'
);
assert.doesNotMatch(correctionMigration, /\b(drop|delete|truncate|create|alter|grant|revoke)\b/i);
assert.doesNotMatch(correctionMigration, /orders|payments|asaas|edge function|secret/i);
assert.doesNotMatch(
  questions.get('diagnostico-comunicacao-social-crise-porta-voz').source_reference,
  /ANAC|Instrução Normativa nº 78\/2014/i
);

console.log('Integridade editorial: 68 pares diagnóstico/prática e 5 correções prioritárias aprovados.');
