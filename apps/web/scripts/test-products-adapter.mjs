#!/usr/bin/env node
// Teste isolado do adaptador Supabase -> formato Hostinger.
//
// NÃO conecta o adaptador a nenhuma tela real (ProductsList.jsx,
// ProductDetailPage.jsx, useCart.jsx, ShoppingCart.jsx e EcommerceApi.js
// continuam intocados). Roda só via:
//   node apps/web/scripts/test-products-adapter.mjs
// ou:
//   npm run test:adapter --prefix apps/web

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { adaptSupabaseProduct } from '../src/api/productsAdapter.js';

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

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('\nVITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ainda não preenchidos em apps/web/.env.\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function assert(condition, message) {
  if (!condition) {
    throw new Error(`FALHOU: ${message}`);
  }
  console.log(`✓ ${message}`);
}

async function main() {
  console.log('\nBuscando "Produto Teste Supabase" (slug: produto-teste-supabase)...\n');

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', 'produto-teste-supabase')
    .single();

  if (error) {
    console.error('Erro ao buscar produto de teste:', error.message);
    process.exit(1);
  }

  const adapted = adaptSupabaseProduct(data);

  console.log('Objeto adaptado (adaptSupabaseProduct):');
  console.log(JSON.stringify(adapted, null, 2));
  console.log();

  assert(adapted.id === data.id, 'id presente e igual ao da linha original');
  assert(adapted.title === 'Produto Teste Supabase', 'title correto');
  assert(typeof adapted.subtitle === 'string' && adapted.subtitle.length > 0, 'subtitle preenchido');
  assert(adapted.ribbon_text === 'TESTE', 'ribbon_text correto');
  assert(typeof adapted.description === 'string', 'description presente');
  assert(adapted.price_in_cents === 1000, 'price_in_cents correto (1000)');
  assert(adapted.currency === 'BRL', 'currency correto (BRL)');
  assert(adapted.purchasable === true, 'purchasable === true (reflete active da linha original)');

  assert(
    Array.isArray(adapted.variants) && adapted.variants.length === 1,
    'variants tem exatamente 1 item sintetizado'
  );

  const variant = adapted.variants[0];
  assert(variant.price_in_cents === 1000, 'variants[0].price_in_cents correto');
  assert(variant.sale_price_in_cents === 800, 'variants[0].sale_price_in_cents correto');
  assert(
    typeof variant.price_formatted === 'string' && variant.price_formatted.length > 0,
    'variants[0].price_formatted gerado'
  );
  assert(
    typeof variant.sale_price_formatted === 'string' && variant.sale_price_formatted.length > 0,
    'variants[0].sale_price_formatted gerado'
  );
  assert(
    variant.currency_info && variant.currency_info.code === 'BRL',
    'variants[0].currency_info presente e correto'
  );
  assert(variant.manage_inventory === true, 'variants[0].manage_inventory correto');
  assert(variant.inventory_quantity === 10, 'variants[0].inventory_quantity correto');

  // Garantia explícita pedida na tarefa: pdf_path não pode vazar no objeto adaptado.
  assert(!('pdf_path' in adapted), 'pdf_path NÃO está presente no objeto de produto adaptado');
  assert(!('pdf_path' in variant), 'pdf_path NÃO está presente na variante adaptada');

  console.log('\nTodas as validações passaram — adaptador OK.\n');
}

main().catch((err) => {
  console.error('\nErro no teste:', err.message);
  process.exit(1);
});
