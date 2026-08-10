-- =========================================================
-- CENTRAL NORTIS — fundação genérica do edital verticalizado
--
-- A árvore aceita cargo, especialidade, disciplina e tópico em qualquer
-- profundidade necessária. O acesso continua derivado exclusivamente de
-- uma matrícula ativa e válida; esta migration não concede matrícula.
-- =========================================================

create table public.syllabus_nodes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  parent_id uuid,
  node_type text not null
    check (node_type in ('position', 'specialty', 'subject', 'topic')),
  slug text not null,
  title text not null,
  description text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, id),
  foreign key (product_id, parent_id)
    references public.syllabus_nodes(product_id, id)
    on delete cascade,
  check (parent_id is null or parent_id <> id)
);

create unique index syllabus_nodes_product_parent_slug_unique
  on public.syllabus_nodes(product_id, coalesce(parent_id, '00000000-0000-0000-0000-000000000000'::uuid), slug);

create index syllabus_nodes_product_parent_sort_idx
  on public.syllabus_nodes(product_id, parent_id, sort_order);

alter table public.syllabus_nodes enable row level security;

create policy "syllabus_nodes_enrolled_read" on public.syllabus_nodes
  for select
  to authenticated
  using (
    active
    and exists (
      select 1
      from public.enrollments e
      where e.product_id = syllabus_nodes.product_id
        and e.user_id = (select auth.uid())
        and e.status = 'active'
        and (e.expires_at is null or e.expires_at > now())
    )
  );

revoke all on table public.syllabus_nodes from anon;
grant select on table public.syllabus_nodes to authenticated;

insert into public.learning_modules (
  slug,
  title,
  description,
  module_type,
  route_path,
  sort_order
)
values (
  'edital-verticalizado',
  'Edital verticalizado',
  'Navegue pelo conteúdo organizado por cargo, especialidade, disciplina e tópico.',
  'edital',
  '/minha-conta/edital',
  20
)
on conflict (slug) do update
set title = excluded.title,
    description = excluded.description,
    module_type = excluded.module_type,
    route_path = excluded.route_path,
    sort_order = excluded.sort_order;

insert into public.product_modules (product_id, module_id, sort_order)
select p.id, m.id, 20
from public.products p
join public.learning_modules m on m.slug = 'edital-verticalizado'
where p.active = true
on conflict (product_id, module_id) do nothing;

-- Os nós do edital serão inseridos somente após validação do conteúdo
-- oficial. Esta fundação não inventa disciplinas, tópicos ou regras.
