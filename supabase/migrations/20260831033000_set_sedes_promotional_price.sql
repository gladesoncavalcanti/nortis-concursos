-- Define preço promocional de lançamento para o produto SEDES-DF 2026.
--
-- Escopo:
-- - altera somente public.products.sale_price_cents do produto oficial;
-- - preserva price_cents = 6990 para exibição do preço original;
-- - não toca em checkout, pagamentos, pedidos, Asaas, Edge Functions,
--   secrets, dependências ou configurações.

update public.products
set
  sale_price_cents = 2990,
  updated_at = now()
where slug = 'nexo-social-sedes-df-2026'
  and price_cents = 6990
  and active = true;

do $$
declare
  v_product_count integer;
begin
  select count(*)
    into v_product_count
  from public.products
  where slug = 'nexo-social-sedes-df-2026'
    and price_cents = 6990
    and sale_price_cents = 2990
    and active = true;

  if v_product_count <> 1 then
    raise exception 'set_sedes_promotional_price: expected exactly one active SEDES product with price 6990 and sale price 2990, found %.', v_product_count;
  end if;
end $$;
