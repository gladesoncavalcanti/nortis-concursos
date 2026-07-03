-- =========================================================
-- Nortis Concursos — Checkout de convidado (híbrido) + suporte a Asaas
--
-- Decisão: orders e enrollments passam a aceitar tanto um usuário
-- Supabase Auth real (user_id) quanto um comprador sem conta
-- (guest_email). Quando a autenticação real (Supabase Auth) estiver
-- ativa, o fluxo passa a preencher user_id normalmente; até lá, o
-- checkout funciona por e-mail de convidado.
--
-- Escopo: apenas schema. Nenhuma página/componente é alterada aqui.
-- =========================================================

-- ---------------------------------------------------------
-- ORDERS
-- ---------------------------------------------------------
alter table public.orders
  alter column user_id drop not null;

alter table public.orders
  add column if not exists guest_email text;

alter table public.orders
  add constraint orders_user_or_guest_check
  check (user_id is not null or guest_email is not null);

-- ---------------------------------------------------------
-- ENROLLMENTS — mesmo padrão híbrido, senão pedidos de convidado
-- nunca conseguem liberar acesso (user_id era NOT NULL).
-- ---------------------------------------------------------
alter table public.enrollments
  alter column user_id drop not null;

alter table public.enrollments
  add column if not exists guest_email text;

alter table public.enrollments
  add constraint enrollments_user_or_guest_check
  check (user_id is not null or guest_email is not null);

-- A UNIQUE (user_id, product_id) original não cobre o caso de
-- user_id nulo (convidado) nem impede duplicidade por guest_email.
-- Substituída por dois índices únicos parciais.
alter table public.enrollments
  drop constraint if exists enrollments_user_id_product_id_key;

create unique index if not exists enrollments_user_product_unique
  on public.enrollments (user_id, product_id)
  where user_id is not null;

create unique index if not exists enrollments_guest_product_unique
  on public.enrollments (guest_email, product_id)
  where user_id is null and guest_email is not null;

-- ---------------------------------------------------------
-- RLS: convidado não tem sessão, então não ganha nenhuma policy nova
-- de leitura própria (ninguém além do service_role deve conseguir
-- listar pedidos/enrollments de convidado pela anon key). As policies
-- existentes (orders_self, enrollments_self) continuam válidas para
-- o caso de usuário autenticado.
-- ---------------------------------------------------------
