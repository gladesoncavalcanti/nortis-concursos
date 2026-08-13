create table public.study_plan_items(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  syllabus_node_id uuid references public.syllabus_nodes(id) on delete set null,
  title text not null check(char_length(title) between 2 and 160),
  scheduled_date date not null,
  duration_minutes integer not null default 30 check(duration_minutes between 5 and 480),
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index study_plan_items_user_date_idx on public.study_plan_items(user_id,scheduled_date,completed);
alter table public.study_plan_items enable row level security;
create policy "study_plan_self_read" on public.study_plan_items for select to authenticated using(user_id=(select auth.uid()));
create policy "study_plan_self_insert" on public.study_plan_items for insert to authenticated with check(
  user_id=(select auth.uid()) and exists(select 1 from public.enrollments e where e.product_id=study_plan_items.product_id
    and e.user_id=(select auth.uid()) and e.status='active' and(e.expires_at is null or e.expires_at>now()))
);
create policy "study_plan_self_update" on public.study_plan_items for update to authenticated
  using(user_id=(select auth.uid())) with check(
    user_id=(select auth.uid()) and exists(select 1 from public.enrollments e where e.product_id=study_plan_items.product_id
      and e.user_id=(select auth.uid()) and e.status='active' and(e.expires_at is null or e.expires_at>now()))
  );
create policy "study_plan_self_delete" on public.study_plan_items for delete to authenticated using(user_id=(select auth.uid()));
revoke all on public.study_plan_items from anon;
grant select,insert,update,delete on public.study_plan_items to authenticated;

alter table public.learning_modules drop constraint learning_modules_module_type_check;
alter table public.learning_modules add constraint learning_modules_module_type_check
  check(module_type in('material','edital','questions','simulations','discursive','review','flashcards','plan'));
insert into public.learning_modules(slug,title,description,module_type,route_path,sort_order)
values('plano-de-estudos','Plano de estudos','Organize tarefas, duração e conclusão dentro da sua rotina.','plan','/minha-conta/plano',70)
on conflict(slug) do update set title=excluded.title,description=excluded.description,module_type=excluded.module_type,route_path=excluded.route_path,sort_order=excluded.sort_order;
insert into public.product_modules(product_id,module_id,sort_order)
select p.id,m.id,70 from public.products p join public.learning_modules m on m.slug='plano-de-estudos'
where p.active=true on conflict(product_id,module_id) do nothing;
