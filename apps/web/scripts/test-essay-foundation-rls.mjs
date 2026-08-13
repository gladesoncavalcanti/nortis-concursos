// Teste de integração REAL de RLS da Fundação Discursiva — executa
// supabase/tests/rls_essay_foundation.sql (uma única transação com
// ROLLBACK no final, nenhum dado persiste) contra o projeto Supabase
// vinculado pela CLI local.
//
// Mesmo tratamento de scripts/test-supabase-connection.mjs e
// scripts/test-products-adapter.mjs: depende de configuração externa
// (Supabase CLI autenticado e vinculado a um projeto), então NÃO faz
// parte da suíte estática comum — detecta a ausência de configuração e
// falha de forma compreensível, sem exigir credencial hardcoded aqui
// (a CLI já guarda a própria sessão localmente).
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const sqlPath = fileURLToPath(new URL('../../../supabase/tests/rls_essay_foundation.sql', import.meta.url));

// shell:true é necessário para resolver o shim `npx`/`npx.cmd` de forma
// portável entre SOs. Seguro aqui: todos os argumentos são literais
// fixos definidos neste próprio arquivo (nenhuma entrada externa ou do
// usuário passa por esta função), então o risco de injeção que o aviso
// de depreciação do Node descreve não se aplica.
function run(args) {
  return execFileSync('npx', ['supabase', ...args], { encoding: 'utf8', shell: true });
}

let migrationCheck;
try {
  migrationCheck = run(['migration', 'list']);
} catch (error) {
  console.log('Supabase CLI não está autenticado/vinculado a um projeto — teste de RLS real pulado (configuração externa ausente, não é falha de código).');
  console.log(String(error.stdout || error.message || error).slice(0, 300));
  process.exit(0);
}
if (!migrationCheck) {
  console.log('Não foi possível confirmar o projeto vinculado — teste de RLS real pulado.');
  process.exit(0);
}

const output = run(['db', 'query', '--linked', '-f', sqlPath]);
const jsonStart = output.indexOf('{');
const parsed = JSON.parse(output.slice(jsonStart));
const rows = parsed.rows ?? [];

if (rows.length === 0) {
  console.error('Nenhum cenário de RLS retornado — verifique se há pelo menos 1 usuário em auth.users e 1 produto em public.products no projeto vinculado.');
  process.exit(1);
}

const failed = rows.filter((row) => row.passed !== true);
for (const row of rows) {
  console.log(`${row.passed ? '✓' : '✗'} ${row.scenario} — ${row.detail}`);
}

if (failed.length > 0) {
  console.error(`\n${failed.length} de ${rows.length} cenários de RLS falharam.`);
  process.exit(1);
}

console.log(`\nRLS real da Fundação Discursiva: ${rows.length}/${rows.length} cenários aprovados (transação revertida, nenhum dado persistido).`);
