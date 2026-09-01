import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const read = (url) => readFileSync(fileURLToPath(url), 'utf8');

const edgeFunction = read(new URL(
  '../../../supabase/functions/create-asaas-checkout/index.ts',
  import.meta.url
));
const frontendOrders = read(new URL('../src/api/orders.js', import.meta.url));
const app = read(new URL('../src/App.jsx', import.meta.url));

assert.match(edgeFunction, /SALES_ENABLED/);
assert.match(edgeFunction, /SALES_QA_MODE_ENABLED/);
assert.match(edgeFunction, /SALES_QA_CHECKOUT_TOKEN/);
assert.match(edgeFunction, /x-nortis-qa-checkout-token/);

assert.match(edgeFunction, /function isAuthorizedQaCheckout\(req: Request\): boolean/);
assert.match(edgeFunction, /token\.length < 32/);
assert.match(edgeFunction, /req\.headers\.get\('x-nortis-qa-checkout-token'\) === token/);

assert.match(edgeFunction, /const isQaCheckout = !SALES_ENABLED && isAuthorizedQaCheckout\(req\)/);
assert.match(edgeFunction, /if \(!SALES_ENABLED && !isQaCheckout\)/);
assert.match(edgeFunction, /code: 'SALES_PAUSED'/);
assert.match(edgeFunction, /if \(!ASAAS_API_KEY && !isQaCheckout\)/);

assert.match(edgeFunction, /product\.sale_price_cents \?\? product\.price_cents/g);
assert.match(edgeFunction, /totalCents/);
assert.match(edgeFunction, /price_cents: product\.sale_price_cents \?\? product\.price_cents/);

const qaBlockStart = edgeFunction.indexOf('if (isQaCheckout)');
const asaasFetchStart = edgeFunction.indexOf("await fetch(`${ASAAS_BASE_URL}/checkouts`");

assert(qaBlockStart > 0, 'Bloco QA precisa existir.');
assert(asaasFetchStart > 0, 'Chamada real para Asaas precisa continuar existindo no fluxo de venda real.');
assert(
  qaBlockStart < asaasFetchStart,
  'Modo QA deve retornar antes da chamada real para a Asaas.'
);

const qaBlock = edgeFunction.slice(qaBlockStart, asaasFetchStart);

assert.match(qaBlock, /pedido\/pendente\?order_id=\$\{order\.id\}&modo=qa/);
assert.match(qaBlock, /asaas_payment_id: `qa_checkout_\$\{order\.id\}`/);
assert.match(qaBlock, /mode: 'qa'/);
assert.match(qaBlock, /totalCents/);
assert.match(qaBlock, /asaasRequestSkipped: true/);
assert.doesNotMatch(qaBlock, /ASAAS_API_KEY|ASAAS_BASE_URL|\/checkouts|access_token/);

assert.match(frontendOrders, /supabase\.functions\.invoke\('create-asaas-checkout'/);
assert.doesNotMatch(frontendOrders, /x-nortis-qa-checkout-token|SALES_QA/i);
assert.doesNotMatch(app, /x-nortis-qa-checkout-token|SALES_QA/i);

console.log('Modo QA do create-asaas-checkout: gates, preço backend e bypass seguro da Asaas aprovados.');
