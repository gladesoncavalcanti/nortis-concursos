import { formatCurrency } from './EcommerceApi.js';

const DEFAULT_CURRENCY_CODE = 'BRL';
const DEFAULT_CURRENCY_SYMBOL = 'R$';

/**
 * Monta um objeto de moeda no mesmo formato usado por
 * `variant.currency_info` no shape da Hostinger.
 * @param {string|null|undefined} currencyCode
 * @returns {{ code: string, symbol: string, template: null }}
 */
function buildCurrencyInfo(currencyCode) {
  return {
    code: currencyCode || DEFAULT_CURRENCY_CODE,
    symbol: DEFAULT_CURRENCY_SYMBOL,
    template: null,
  };
}

/**
 * Adaptador puro: converte 1 linha de `public.products` (Supabase) para
 * o mesmo shape que `EcommerceApi.getProducts()` / `getProduct()` já
 * entregam hoje para ProductCard/ProductDetailPage/useCart.
 *
 * Função pura — sem I/O, sem mutar `row`, sem efeitos colaterais.
 * NÃO é importada por ProductsList.jsx, ProductDetailPage.jsx,
 * useCart.jsx, ShoppingCart.jsx ou EcommerceApi.js. Não está conectada
 * a nenhuma tela real ainda.
 *
 * Como `public.products` ainda não tem o conceito de variantes, este
 * adaptador sintetiza EXATAMENTE 1 variante por produto, a partir dos
 * campos planos da própria linha.
 *
 * `pdf_path` é deliberadamente OMITIDO do objeto retornado — download
 * protegido é uma fase futura, e não faz sentido expor esse caminho de
 * Storage antes de existir a camada que o protege.
 *
 * @param {object|null} row - linha crua de public.products
 * @returns {object|null}
 */
export function adaptSupabaseProduct(row) {
  if (!row) return null;

  const currencyInfo = buildCurrencyInfo(row.currency);

  const priceInCents = row.price_cents ?? 0;
  const salePriceInCents = row.sale_price_cents ?? null;

  const variant = {
    id: row.id,
    title: row.title,
    image_url: row.cover_image_url ?? null,
    sku: null,
    price_in_cents: priceInCents,
    sale_price_in_cents: salePriceInCents,
    currency: currencyInfo.code,
    currency_info: currencyInfo,
    price_formatted: formatCurrency(priceInCents, currencyInfo),
    sale_price_formatted:
      salePriceInCents !== null ? formatCurrency(salePriceInCents, currencyInfo) : null,
    manage_inventory: row.manage_inventory ?? false,
    weight: null,
    options: [],
    inventory_quantity: row.inventory_quantity ?? null,
  };

  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? null,
    ribbon_text: row.ribbon_text ?? null,
    description: row.description ?? '',
    image: row.cover_image_url ?? null,
    price_in_cents: priceInCents,
    currency: currencyInfo.code,
    purchasable: Boolean(row.active),
    order: null,
    site_product_selection: null,
    images: [],
    options: [],
    variants: [variant],
    collections: [],
    additional_info: [],
    type: { value: '' },
    custom_fields: [],
    related_products: [],
    updated_at: row.updated_at ?? null,
  };
}

/**
 * Aplica `adaptSupabaseProduct` a uma lista de linhas.
 * @param {object[]|null|undefined} rows
 * @returns {object[]}
 */
export function adaptSupabaseProductList(rows) {
  return (rows ?? []).map(adaptSupabaseProduct);
}
