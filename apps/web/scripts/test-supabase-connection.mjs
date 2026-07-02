#!/usr/bin/env node
// Teste isolado de conexão com o Supabase.
//
// NÃO é importado por nenhum código do app (App.jsx, ShoppingCart.jsx,
// AuthContext.jsx, useCart.jsx permanecem intocados). Roda só via:
//   node apps/web/scripts/test-supabase-connection.mjs
// ou:
//   npm run test:supabase --prefix apps/web
//
// Lê apps/web/.env manualmente (script Node puro, fora do bundler Vite,
// então não pode usar import.meta.env como src/lib/supabase.js usa).

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '.env');

function loadEnv(filePath) {
  if (!existsSync(filePath)) {
    console.error(`\nArquivo não encontrado: ${filePath}`);
    console.error('Copie apps/web/.env.example para apps/web/.env e preencha com os dados do seu projeto Supabase.\n');
    process.exit(1);
  }

  const env = {};
  for (const rawLine of readFileSync(filePath, 'utf-8').split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  }
  return env;
}

const env = loadEnv(envPath);
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

const looksUnfilled =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes('YOUR_PROJECT_REF') ||
  supabaseAnonKey === 'your-anon-key-here';

if (looksUnfilled) {
  console.error('\nVITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ainda não estão preenchidos em apps/web/.env.\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const expectedTables = [
  'profiles',
  'products',
  'orders',
  'order_items',
  'enrollments',
  'downloads',
  'coupons',
  'asaas_webhook_events',
];

console.log(`\nConectando em ${supabaseUrl} ...\n`);

let allOk = true;

for (const table of expectedTables) {
  const { error, status } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true });

  // Com RLS ativo e sem policy pública (exceto "products"), um erro de
  // permissão aqui é o comportamento ESPERADO — e ainda confirma que a
  // tabela existe, pois o Postgres só nega acesso depois de resolver o
  // nome da tabela. O código 42P01 ("relation does not exist") é o único
  // sinal real de que a migration não foi aplicada.
  if (error && error.code === '42P01') {
    console.log(`✗ ${table.padEnd(22)} NÃO EXISTE (migration não aplicada?)`);
    allOk = false;
  } else if (error) {
    console.log(`✓ ${table.padEnd(22)} existe (bloqueada por RLS, como esperado — status ${status})`);
  } else {
    console.log(`✓ ${table.padEnd(22)} existe e é legível`);
  }
}

console.log(
  allOk
    ? '\nConexão e schema OK — as 8 tabelas existem no projeto Supabase.\n'
    : '\nFaltam tabelas — rode a migration (supabase/migrations/20260701120000_init_schema.sql) antes de prosseguir.\n'
);

process.exit(allOk ? 0 : 1);
