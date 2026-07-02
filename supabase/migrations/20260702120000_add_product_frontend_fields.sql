-- =========================================================
-- Nortis Concursos — Campos mínimos de compatibilidade com o
-- shape hoje esperado pelo frontend (ProductCard, ProductDetailPage,
-- useCart), preparando um futuro adaptador Supabase -> formato Hostinger.
--
-- Escopo: apenas schema (ALTER TABLE) + atualização do produto de
-- teste já existente. Nenhuma página, componente ou fluxo do app é
-- alterado por esta migration. Nenhum adaptador é criado aqui.
-- =========================================================

alter table public.products
  add column if not exists subtitle text;

alter table public.products
  add column if not exists ribbon_text text;

alter table public.products
  add column if not exists sale_price_cents integer;

alter table public.products
  add column if not exists currency text not null default 'BRL';

alter table public.products
  add column if not exists manage_inventory boolean not null default false;

alter table public.products
  add column if not exists inventory_quantity integer;

-- =========================================================
-- Atualiza o "Produto Teste Supabase" já existente com valores
-- simbólicos nos novos campos, para permitir validar visualmente
-- (via /dev/supabase-products) que a migration foi aplicada
-- corretamente antes de qualquer adaptador ser escrito.
-- =========================================================
update public.products
set
  subtitle = 'Apostila de teste para validar o adaptador Supabase → Hostinger',
  ribbon_text = 'TESTE',
  sale_price_cents = 800,
  manage_inventory = true,
  inventory_quantity = 10
where slug = 'produto-teste-supabase';
