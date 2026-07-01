-- =========================================================
-- Nortis Concursos — Migration inicial (Fase 1)
-- Cria as tabelas base para autenticação estendida, catálogo,
-- pedidos, acessos liberados e auditoria de download.
--
-- Escopo: apenas estrutura de dados. Nenhuma Edge Function,
-- nenhuma integração de checkout/pagamento é criada aqui.
-- =========================================================

-- =========================================================
-- PROFILES (extensão de auth.users)
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_self" on public.profiles
  for select using (auth.uid() = id);

-- Cria profile automaticamente ao registrar novo usuário no Supabase Auth
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- PRODUCTS (apostilas)
-- =========================================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  cover_image_url text,
  pdf_path text not null,        -- caminho no Storage privado, nunca url pública
  price_cents integer not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "products_public_read" on public.products
  for select using (active = true);

create policy "products_admin_write" on public.products
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- =========================================================
-- ORDERS (pedidos)
-- =========================================================
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'refunded', 'expired')),
  total_cents integer not null,
  coupon_code text,
  discount_cents integer not null default 0,

  -- Integração Asaas (preenchido nas próximas fases)
  asaas_customer_id text,
  asaas_payment_id text unique,
  payment_method text check (payment_method in ('PIX', 'BOLETO', 'CREDIT_CARD')),
  checkout_url text,

  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index idx_orders_user on public.orders(user_id);
create index idx_orders_asaas_payment on public.orders(asaas_payment_id);

alter table public.orders enable row level security;

create policy "orders_self" on public.orders
  for select using (auth.uid() = user_id);

create policy "orders_admin_all" on public.orders
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- =========================================================
-- ORDER ITEMS
-- =========================================================
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  price_cents integer not null   -- snapshot do preço no momento da compra
);

alter table public.order_items enable row level security;

create policy "order_items_self" on public.order_items
  for select using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

-- =========================================================
-- ENROLLMENTS (acesso liberado)
-- =========================================================
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  product_id uuid not null references public.products(id),
  order_id uuid references public.orders(id),
  status text not null default 'active' check (status in ('active', 'revoked', 'expired')),
  granted_at timestamptz not null default now(),
  expires_at timestamptz,          -- null = acesso vitalício

  unique (user_id, product_id)
);

create index idx_enrollments_user on public.enrollments(user_id);

alter table public.enrollments enable row level security;

create policy "enrollments_self" on public.enrollments
  for select using (auth.uid() = user_id);

-- =========================================================
-- DOWNLOADS (auditoria + rate limit)
-- =========================================================
create table public.downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  product_id uuid not null references public.products(id),
  ip_address text,
  user_agent text,
  downloaded_at timestamptz not null default now()
);

create index idx_downloads_user_product_date
  on public.downloads(user_id, product_id, downloaded_at);

alter table public.downloads enable row level security;

create policy "downloads_self" on public.downloads
  for select using (auth.uid() = user_id);

-- =========================================================
-- COUPONS (versão enxuta)
-- =========================================================
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value integer not null,
  max_uses integer,
  uses_count integer not null default 0,
  active boolean not null default true,
  valid_until timestamptz
);

-- Sem RLS pública de leitura nesta fase: cupons são validados
-- apenas por lógica de servidor (Edge Function), não por acesso direto do cliente.
alter table public.coupons enable row level security;

-- =========================================================
-- ASAAS WEBHOOK LOG (debug/auditoria)
-- =========================================================
create table public.asaas_webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_type text,
  payload jsonb not null,
  processed boolean not null default false,
  received_at timestamptz not null default now()
);

-- Tabela de uso interno (Edge Functions com service_role) — sem policy
-- pública, RLS habilitado sem nenhuma policy bloqueia todo acesso via anon/authenticated.
alter table public.asaas_webhook_events enable row level security;
