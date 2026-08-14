// Teste de integração REAL da regra "no máximo 1 draft aberto por
// usuário+tema" — executa supabase/tests/essay_submissions_one_draft_per_theme.sql
// (uma única transação com ROLLBACK no final, nenhum dado persiste)
// contra o projeto Supabase vinculado pela CLI local. Mesmo tratamento
// de scripts/test-essay-foundation-rls.mjs: depende de configuração
// externa (Supabase CLI autenticado e vinculado), então NÃO faz parte
// da suíte estática comum.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const sqlPath = fileURLToPath(new URL('../../../supabase/tests/essay_submissions_one_draft_per_theme.sql', import.meta.url));

// shell:true necessário para resolver o shim npx/npx.cmd de forma
// portável entre SOs. Seguro aqui: todos os argumentos são literais
// fixos definidos neste próprio arquivo.
function run(args) {
  return execFileSync('npx', ['supabase', ...args], { encoding: 'utf8', shell: true });
}

let migrationCheck;
try {
  migrationCheck = run(['migration', 'list']);
} catch (error) {
  console.log('Supabase CLI não está autenticado/vinculado a um projeto — teste real da regra de draft pulado (configuração externa ausente, não é falha de código).');
  console.log(String(error.stdout || error.message || error).slice(0, 300));
  process.exit(0);
}
if (!migrationCheck) {
  console.log('Não foi possível confirmar o projeto vinculado — teste real da regra de draft pulado.');
  process.exit(0);
}

const output = run(['db', 'query', '--linked', '-f', sqlPath]);
const jsonStart = output.indexOf('{');
const parsed = JSON.parse(output.slice(jsonStart));
const rows = parsed.rows ?? [];

if (rows.length === 0) {
  console.error('Nenhum cenário retornado — verifique se há pelo menos 1 usuário em auth.users e 1 produto em public.products no projeto vinculado.');
  process.exit(1);
}

const failed = rows.filter((row) => row.passed !== true);
for (const row of rows) {
  console.log(`${row.passed ? '✓' : '✗'} ${row.scenario} — ${row.detail}`);
}

if (failed.length > 0) {
  console.error(`\n${failed.length} de ${rows.length} cenários falharam.`);
  process.exit(1);
}

console.log(`\nRegra "1 draft por tema" (banco real): ${rows.length}/${rows.length} cenários aprovados (transação revertida, nenhum dado persistido).`);
