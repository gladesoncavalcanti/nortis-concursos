-- Banco de questões genérico. Respostas corretas ficam separadas do catálogo
-- público ao aluno e só são reveladas pela função após o registro da tentativa.
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  syllabus_node_id uuid references public.syllabus_nodes(id) on delete set null,
  statement text not null,
  explanation text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  label text not null,
  option_text text not null,
  sort_order integer not null default 0,
  unique (question_id, label),
  unique (question_id, id)
);

create table public.question_solutions (
  question_id uuid primary key references public.questions(id) on delete cascade,
  correct_option_id uuid not null,
  foreign key (question_id, correct_option_id)
    references public.question_options(question_id, id)
    on delete cascade
);

create table public.question_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  selected_option_id uuid not null references public.question_options(id) on delete cascade,
  is_correct boolean not null,
  answered_at timestamptz not null default now()
);

create index questions_product_sort_idx on public.questions(product_id, sort_order);
create index question_options_question_sort_idx on public.question_options(question_id, sort_order);
create index question_attempts_user_question_idx on public.question_attempts(user_id, question_id, answered_at desc);

alter table public.questions enable row level security;
alter table public.question_options enable row level security;
alter table public.question_solutions enable row level security;
alter table public.question_attempts enable row level security;

create policy "questions_enrolled_read" on public.questions for select to authenticated using (
  active and exists (
    select 1 from public.enrollments e
    where e.product_id = questions.product_id
      and e.user_id = (select auth.uid())
      and e.status = 'active'
      and (e.expires_at is null or e.expires_at > now())
  )
);

create policy "question_options_enrolled_read" on public.question_options for select to authenticated using (
  exists (select 1 from public.questions q where q.id = question_options.question_id)
);

create policy "question_attempts_self_read" on public.question_attempts for select to authenticated using (
  user_id = (select auth.uid())
);

revoke all on public.questions, public.question_options, public.question_solutions, public.question_attempts from anon;
grant select on public.questions, public.question_options, public.question_attempts to authenticated;
revoke all on public.question_solutions from authenticated;

create or replace function public.submit_question_attempt(
  p_question_id uuid,
  p_selected_option_id uuid
)
returns table (attempt_id uuid, is_correct boolean, correct_option_id uuid, explanation text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_product_id uuid;
  v_correct_option_id uuid;
  v_explanation text;
  v_attempt_id uuid;
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;

  select q.product_id, q.explanation, s.correct_option_id
    into v_product_id, v_explanation, v_correct_option_id
  from public.questions q
  join public.question_solutions s on s.question_id = q.id
  where q.id = p_question_id and q.active = true;

  if v_product_id is null then raise exception 'question_not_found'; end if;
  if not exists (
    select 1 from public.enrollments e
    where e.product_id = v_product_id and e.user_id = v_user_id
      and e.status = 'active' and (e.expires_at is null or e.expires_at > now())
  ) then raise exception 'access_denied'; end if;
  if not exists (
    select 1 from public.question_options qo
    where qo.id = p_selected_option_id and qo.question_id = p_question_id
  ) then raise exception 'invalid_option'; end if;

  insert into public.question_attempts (user_id, question_id, selected_option_id, is_correct)
  values (v_user_id, p_question_id, p_selected_option_id, p_selected_option_id = v_correct_option_id)
  returning id into v_attempt_id;

  return query select v_attempt_id, p_selected_option_id = v_correct_option_id, v_correct_option_id, v_explanation;
end;
$$;

revoke all on function public.submit_question_attempt(uuid, uuid) from public, anon;
grant execute on function public.submit_question_attempt(uuid, uuid) to authenticated;

insert into public.learning_modules (slug, title, description, module_type, route_path, sort_order)
values ('banco-de-questoes', 'Banco de questões', 'Resolva questões e receba correção comentada após cada tentativa.', 'questions', '/minha-conta/questoes', 30)
on conflict (slug) do update set title=excluded.title, description=excluded.description,
  module_type=excluded.module_type, route_path=excluded.route_path, sort_order=excluded.sort_order;

insert into public.product_modules (product_id, module_id, sort_order)
select p.id, m.id, 30 from public.products p
join public.learning_modules m on m.slug='banco-de-questoes'
where p.active=true on conflict (product_id, module_id) do nothing;

-- Nenhuma questão é semeada: conteúdo depende de validação editorial.
