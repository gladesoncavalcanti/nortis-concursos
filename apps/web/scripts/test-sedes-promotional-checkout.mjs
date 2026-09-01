import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const read = (url) => readFileSync(fileURLToPath(url), 'utf8');

const app = read(new URL('../src/App.jsx', import.meta.url));
const productDetail = read(new URL('../src/pages/ProductDetailPage.jsx', import.meta.url));
const productsList = read(new URL('../src/components/ProductsList.jsx', import.meta.url));
const cart = read(new URL('../src/hooks/useCart.jsx', import.meta.url));
const ordersApi = read(new URL('../src/api/orders.js', import.meta.url));
const freeAccessApi = read(new URL('../src/api/enrollments.js', import.meta.url));
const edgeFunction = read(new URL('../../../supabase/functions/create-asaas-checkout/index.ts', import.meta.url));

const stripLineComments = (source) =>
  source
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('//') && !line.trimStart().startsWith('*'))
    .join('\n');

for (const source of [
  productDetail,
  productsList,
  read(new URL('../src/pages/HomePage.jsx', import.meta.url)),
  read(new URL('../src/pages/SedesDfHubPage.jsx', import.meta.url)),
  read(new URL('../src/components/ApostilaPreview.jsx', import.meta.url)),
  read(new URL('../src/components/AuthorityBlogSection.jsx', import.meta.url)),
  read(new URL('../src/components/MobileStickyCTA.jsx', import.meta.url)),
  read(new URL('../src/components/ModularApostilaBuilder.jsx', import.meta.url)),
  read(new URL('../src/components/PreLaunchNotice.jsx', import.meta.url)),
]) {
  assert.doesNotMatch(source, /Vendas temporariamente pausadas|quando as vendas forem reabertas/);
}

assert.match(app, /<ProductDetailPage setIsCartOpen=\{setIsCartOpen\} \/>/);

assert.match(productDetail, /useCart/);
assert.match(productDetail, /addToCart\(product, selectedVariant, 1/);
assert.match(productDetail, /setIsCartOpen\?\.\(true\)/);
assert.match(productDetail, /Comprar por \{displayPrice\}/);
assert.match(productDetail, /Promoção de lançamento: de \{originalPrice \|\| displayPrice\} por \{displayPrice\}/);

assert.match(productsList, /Comprar por \{displayPrice\}/);
assert.match(productsList, /sale_price_formatted/);
assert.match(productsList, /line-through/);

assert.match(cart, /sale_price_in_cents \?\? item\.variant\.price_in_cents/);
assert.match(ordersApi, /supabase\.functions\.invoke\('create-asaas-checkout'/);

assert.match(edgeFunction, /SALES_ENABLED/);
assert.match(edgeFunction, /Deno\.env\.get\('SALES_ENABLED'\)/);
assert.match(edgeFunction, /product\.sale_price_cents \?\? product\.price_cents/g);
assert.match(edgeFunction, /totalCents/);
assert.match(edgeFunction, /price_cents: product\.sale_price_cents \?\? product\.price_cents/);
assert.match(edgeFunction, /value: \(product\.sale_price_cents \?\? product\.price_cents\) \/ 100/);
assert.doesNotMatch(edgeFunction, /body\??\.(price|amount|total|value)|requested\.(price|amount|total|value)/);

assert.match(freeAccessApi, /claim_free_sedes_df_access/);
assert.doesNotMatch(stripLineComments(freeAccessApi), /create-asaas-checkout|orders|order_items/i);

console.log('Reativação promocional SEDES: UI, carrinho e contrato de checkout aprovados sem chamada real à Asaas.');
