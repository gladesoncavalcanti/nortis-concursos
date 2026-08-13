// Valida, de forma estática (mesmo padrão dos demais testes de
// migration do projeto), a fundação de schema do fluxo discursivo:
// tabelas, RLS, policies e constraints — sem conexão com banco real.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const migrationPath = fileURLToPath(new URL(
  '../../../supabase/migrations/20260812060000_create_essay_themes_and_submissions.sql',
  import.meta.url
));
const migration = readFileSync(migrationPath, 'utf8');

// 1) migration contém as tabelas esperadas
assert.match(migration, /create table public\.essay_themes/);
assert.match(migration, /create table public\.essay_submissions/);

// 2) RLS está habilitada nas duas tabelas
assert.match(migration, /alter table public\.essay_themes enable row level security/);
assert.match(migration, /alter table public\.essay_submissions enable row level security/);

// 3) políticas não permitem acesso indiscriminado — sem policy "true"
// solta, sempre com auth.uid() e/ou active como condição
assert.match(migration, /essay_themes_enrolled_read[\s\S]{0,400}active[\s\S]{0,400}auth\.uid\(\)/);
assert.match(migration, /essay_submissions_self_read[\s\S]{0,200}user_id = \(select auth\.uid\(\)\)/);
assert.doesNotMatch(migration, /using \(\s*true\s*\)/i);
assert.doesNotMatch(migration, /with check \(\s*true\s*\)/i);

// permissões mínimas: sem delete em nenhuma das duas tabelas, sem
// grant amplo a anon
assert.match(migration, /revoke all on public\.essay_themes from anon, authenticated/);
assert.match(migration, /revoke all on public\.essay_submissions from anon, authenticated/);
assert.match(migration, /grant select on public\.essay_themes to authenticated/);
assert.match(migration, /grant select, insert, update on public\.essay_submissions to authenticated/);
assert.doesNotMatch(migration, /grant[^;]*to anon/i);
assert.doesNotMatch(migration, /grant[^;]*delete[^;]*essay_submissions/i);

// 4) relacionamento submission -> user
assert.match(migration, /user_id uuid not null references auth\.users\(id\) on delete cascade/);

// 5) relacionamento submission -> theme
assert.match(migration, /theme_id uuid not null references public\.essay_themes\(id\)/);

// 6) estados permitidos — neutros, sem transformar correção humana em
// requisito estrutural
assert.match(
  migration,
  /status in \('draft', 'submitted', 'processing', 'corrected', 'failed'\)/
);
// nenhum estado codifica "correção humana" como valor estrutural
assert.doesNotMatch(migration, /'human[a-z_]*'/i);

// 7) submissão vazia rejeitada na camada de banco (constraint dedicada)
assert.match(migration, /essay_submissions_non_empty_when_active/);
assert.match(migration, /status = 'draft' or char_length\(btrim\(essay_text\)\) > 0/);

// 8) tema obrigatório (not null, sem default) na criação da submissão
assert.doesNotMatch(migration, /theme_id uuid references/); // não pode ser nullable

// impossibilidade de editar submissão fora de "draft": a policy de
// update só permite quando status já era 'draft' antes da alteração
assert.match(
  migration,
  /essay_submissions_draft_owner_update[\s\S]{0,300}user_id = \(select auth\.uid\(\)\)\s*\n\s*and status = 'draft'/
);

// nenhum tema pedagógico inserido nesta migration (schema-only)
assert.doesNotMatch(migration, /insert into public\.essay_themes/i);
assert.doesNotMatch(migration, /insert into public\.essay_submissions/i);

// não toca em nenhuma área protegida: nenhum "create table"/"alter
// table"/"insert into" além das duas tabelas novas desta migration
const structuralStatements = migration.match(/\b(create table|alter table|insert into)\s+public\.\w+/gi) ?? [];
assert.ok(structuralStatements.length > 0, 'migration deveria conter comandos estruturais.');
assert.ok(
  structuralStatements.every((statement) => /public\.(essay_themes|essay_submissions)\b/i.test(statement)),
  `migration toca tabela fora do escopo: ${structuralStatements.join(', ')}`
);
assert.doesNotMatch(migration, /\b(drop|truncate)\b/i);

console.log('Fundação discursiva — schema: 18 verificações aprovadas.');
