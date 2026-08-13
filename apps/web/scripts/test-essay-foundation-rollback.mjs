// Valida o script de rollback manual da fundação discursiva: precisa
// existir, ficar fora de supabase/migrations/ (para nunca ser aplicado
// automaticamente) e se restringir exclusivamente às duas tabelas
// criadas por 20260812060000_create_essay_themes_and_submissions.sql.
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const rollbackPath = fileURLToPath(new URL(
  '../../../supabase/rollbacks/20260812060000_rollback_essay_themes_and_submissions.sql',
  import.meta.url
));
assert.ok(existsSync(rollbackPath), 'Script de rollback ausente.');
const rollback = readFileSync(rollbackPath, 'utf8');

// escopo restrito às duas tabelas da fundação discursiva
assert.match(rollback, /drop table if exists public\.essay_submissions;/);
assert.match(rollback, /drop table if exists public\.essay_themes;/);
const dropStatements = rollback.match(/drop\s+\w+[^;]*;/gi) ?? [];
assert.ok(dropStatements.length > 0, 'Rollback deveria conter comandos DROP.');
assert.ok(
  dropStatements.every((statement) => /essay_themes|essay_submissions/i.test(statement)),
  `Rollback contém DROP fora do escopo: ${dropStatements.join(', ')}`
);

// ordem correta: submissions antes de themes (FK theme_id -> essay_themes)
assert.ok(
  rollback.indexOf('essay_submissions') < rollback.indexOf('essay_themes;'),
  'essay_submissions deve ser removida antes de essay_themes (dependência de FK).'
);

// nunca deve estar dentro de supabase/migrations/ (aplicação automática)
const migrationsDir = fileURLToPath(new URL('../../../supabase/migrations/', import.meta.url));
const migrationFiles = readdirSync(migrationsDir);
assert.ok(
  !migrationFiles.some((file) => file.includes('rollback_essay_themes_and_submissions')),
  'O script de rollback não pode estar em supabase/migrations/ — seria aplicado automaticamente.'
);

console.log('Fundação discursiva — rollback manual: 5 verificações aprovadas.');
