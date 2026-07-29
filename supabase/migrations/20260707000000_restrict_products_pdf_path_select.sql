-- =========================================================
-- Nortis Concursos — Proteção de coluna: public.products.pdf_path
--
-- Contexto: a policy de RLS `products_public_read` (ver
-- 20260701120000_init_schema.sql) filtra apenas LINHAS
-- (`active = true`) — RLS do Postgres não restringe COLUNAS. Um
-- `select('*')` feito pelo cliente (anon/authenticated) contra
-- `public.products`, mesmo respeitando essa policy, ainda recebia
-- `pdf_path` (o caminho do PDF no Storage privado) na resposta.
--
-- Esta migration fecha essa lacuna no nível de privilégio de coluna
-- do Postgres, independentemente do que o frontend selecione: revoga
-- o SELECT geral sobre a tabela para PUBLIC/anon/authenticated e
-- concede SELECT apenas nas colunas públicas do catálogo.
--
-- Escopo: apenas GRANT/REVOKE de privilégios. Nenhuma policy de RLS é
-- alterada, nenhum dado é alterado. `service_role` não é incluído neste
-- REVOKE. O papel mantém seus privilégios próprios; seu atributo
-- BYPASSRLS é separado dos privilégios de tabela e coluna.
-- =========================================================

revoke select on table public.products
  from public, anon, authenticated;

grant select (
  id,
  title,
  slug,
  description,
  cover_image_url,
  price_cents,
  active,
  created_at,
  updated_at,
  subtitle,
  ribbon_text,
  sale_price_cents,
  currency,
  manage_inventory,
  inventory_quantity
)
on table public.products
to anon, authenticated;
