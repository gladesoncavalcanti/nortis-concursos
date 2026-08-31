import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const read = (url) => readFileSync(fileURLToPath(url), 'utf8');

const migration = read(new URL(
  '../../../supabase/migrations/20260831033000_set_sedes_promotional_price.sql',
  import.meta.url
));
const productsList = read(new URL('../src/components/ProductsList.jsx', import.meta.url));
const productDetail = read(new URL('../src/pages/ProductDetailPage.jsx', import.meta.url));
const cart = read(new URL('../src/hooks/useCart.jsx', import.meta.url));

const withoutComments = migration
  .split('\n')
  .filter((line) => !line.trimStart().startsWith('--'))
  .join('\n');

assert.match(migration, /update public\.products/i);
assert.match(migration, /slug = 'nexo-social-sedes-df-2026'/);
assert.match(migration, /price_cents = 6990/);
assert.match(migration, /sale_price_cents = 2990/);
assert.match(migration, /active = true/);
assert.match(migration, /v_product_count <> 1/);

assert.doesNotMatch(withoutComments, /\bpublic\.(orders?|order_items|asaas_webhook_events)\b/i);
assert.doesNotMatch(withoutComments, /\bcheckout\b|\bpayment\b|\bpagamento\b|\basaas\b/i);
assert.doesNotMatch(withoutComments, /\bdrop\b|\btruncate\b|\bdelete\b|\binsert\b/i);

assert.match(productsList, /sale_price_in_cents !== null/);
assert.match(productsList, /sale_price_formatted/);
assert.match(productsList, /line-through/);
assert.match(productDetail, /sale_price_in_cents !== null/);
assert.match(productDetail, /sale_price_formatted/);
assert.match(productDetail, /line-through/);
assert.match(cart, /sale_price_in_cents \?\? item\.variant\.price_in_cents/);

console.log('Preço promocional SEDES-DF: migration e exibição dinâmica aprovadas.');
