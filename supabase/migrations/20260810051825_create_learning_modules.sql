-- =========================================================
-- CENTRAL NORTIS — módulos de aprendizagem por produto contratado
--
-- `enrollments` continua sendo a fonte de verdade do acesso.
-- Esta migration apenas descreve os módulos de aprendizagem e quais
-- produtos os incluem, sem tocar em checkout, pagamentos ou downloads.
-- =========================================================

create table public.learning_modules (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  module_type text not null
    check (module_type in ('material', 'edital', 'questions', 'simulations', 'discursive', 'review')),
  route_path text check (route_path is null or route_path like '/%'),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_modules (
  product_id uuid not null references public.products(id) on delete cascade,
  module_id uuid not null references public.learning_modules(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (product_id, module_id)
);

create index idx_product_modules_module on public.product_modules(module_id);

alter table public.learning_modules enable row level security;
alter table public.product_modules enable row level security;

-- Um aluno só enxerga vínculos dos produtos aos quais possui acesso
-- ativo e ainda não expirado.
create policy "product_modules_enrolled_read" on public.product_modules
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.enrollments e
      where e.product_id = product_modules.product_id
        and e.user_id = (select auth.uid())
        and e.status = 'active'
        and (e.expires_at is null or e.expires_at > now())
    )
  );

-- A mesma fronteira protege o catálogo de módulos. Não basta conhecer
-- o slug: é necessário possuir uma matrícula válida em algum produto
-- que inclua o módulo.
create policy "learning_modules_enrolled_read" on public.learning_modules
  for select
  to authenticated
  using (
    active
    and exists (
      select 1
      from public.product_modules pm
      join public.enrollments e on e.product_id = pm.product_id
      where pm.module_id = learning_modules.id
        and e.user_id = (select auth.uid())
        and e.status = 'active'
        and (e.expires_at is null or e.expires_at > now())
    )
  );

revoke all on table public.learning_modules from anon;
revoke all on table public.product_modules from anon;
grant select on table public.learning_modules to authenticated;
grant select on table public.product_modules to authenticated;

-- Primeiro registro real da arquitetura genérica. Todos os produtos
-- ativos existentes hoje são apostilas e recebem o módulo de material.
insert into public.learning_modules (
  slug,
  title,
  description,
  module_type,
  sort_order
)
values (
  'apostila-digital',
  'Apostila digital',
  'Acesse o material liberado para este produto.',
  'material',
  10
)
on conflict (slug) do nothing;

insert into public.product_modules (product_id, module_id, sort_order)
select p.id, m.id, 10
from public.products p
join public.learning_modules m on m.slug = 'apostila-digital'
where p.active = true
on conflict (product_id, module_id) do nothing;
