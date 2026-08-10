create table public.simulations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  title text not null,
  description text,
  time_limit_minutes integer check (time_limit_minutes is null or time_limit_minutes > 0),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.simulation_questions (
  simulation_id uuid not null references public.simulations(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (simulation_id, question_id)
);

create table public.simulation_sessions (
  id uuid primary key default gen_random_uuid(),
  simulation_id uuid not null references public.simulations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'in_progress' check (status in ('in_progress','completed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  correct_count integer,
  question_count integer
);

create table public.simulation_answers (
  session_id uuid not null references public.simulation_sessions(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  selected_option_id uuid not null references public.question_options(id) on delete cascade,
  is_correct boolean not null,
  answered_at timestamptz not null default now(),
  primary key (session_id, question_id)
);

create index simulations_product_sort_idx on public.simulations(product_id, sort_order);
create index simulation_questions_sort_idx on public.simulation_questions(simulation_id, sort_order);
create index simulation_sessions_user_idx on public.simulation_sessions(user_id, started_at desc);

alter table public.simulations enable row level security;
alter table public.simulation_questions enable row level security;
alter table public.simulation_sessions enable row level security;
alter table public.simulation_answers enable row level security;

create policy "simulations_enrolled_read" on public.simulations for select to authenticated using (
  active and exists (select 1 from public.enrollments e where e.product_id=simulations.product_id
    and e.user_id=(select auth.uid()) and e.status='active'
    and (e.expires_at is null or e.expires_at > now()))
);
create policy "simulation_questions_enrolled_read" on public.simulation_questions for select to authenticated using (
  exists (select 1 from public.simulations s where s.id=simulation_questions.simulation_id)
);
create policy "simulation_sessions_self_read" on public.simulation_sessions for select to authenticated using (
  user_id=(select auth.uid())
);
create policy "simulation_answers_completed_read" on public.simulation_answers for select to authenticated using (
  exists (select 1 from public.simulation_sessions ss where ss.id=simulation_answers.session_id
    and ss.user_id=(select auth.uid()) and ss.status='completed')
);

revoke all on public.simulations, public.simulation_questions, public.simulation_sessions, public.simulation_answers from anon;
grant select on public.simulations, public.simulation_questions, public.simulation_sessions, public.simulation_answers to authenticated;

create or replace function public.start_simulation(p_simulation_id uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_user uuid:=auth.uid(); v_product uuid; v_session uuid;
begin
  if v_user is null then raise exception 'authentication_required'; end if;
  select product_id into v_product from public.simulations where id=p_simulation_id and active=true;
  if v_product is null then raise exception 'simulation_not_found'; end if;
  if not exists (select 1 from public.enrollments e where e.product_id=v_product and e.user_id=v_user
    and e.status='active' and (e.expires_at is null or e.expires_at>now())) then raise exception 'access_denied'; end if;
  insert into public.simulation_sessions(simulation_id,user_id) values(p_simulation_id,v_user) returning id into v_session;
  return v_session;
end; $$;

create or replace function public.answer_simulation_question(p_session_id uuid,p_question_id uuid,p_option_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare v_user uuid:=auth.uid(); v_correct uuid;
begin
  if not exists (select 1 from public.simulation_sessions ss join public.simulation_questions sq on sq.simulation_id=ss.simulation_id
    where ss.id=p_session_id and ss.user_id=v_user and ss.status='in_progress' and sq.question_id=p_question_id) then raise exception 'invalid_session_or_question'; end if;
  if not exists (select 1 from public.question_options qo where qo.id=p_option_id and qo.question_id=p_question_id) then raise exception 'invalid_option'; end if;
  select correct_option_id into v_correct from public.question_solutions where question_id=p_question_id;
  insert into public.simulation_answers(session_id,question_id,selected_option_id,is_correct)
  values(p_session_id,p_question_id,p_option_id,p_option_id=v_correct)
  on conflict(session_id,question_id) do update set selected_option_id=excluded.selected_option_id,is_correct=excluded.is_correct,answered_at=now();
end; $$;

create or replace function public.finish_simulation(p_session_id uuid)
returns table(correct_count integer,question_count integer) language plpgsql security definer set search_path=public as $$
declare v_user uuid:=auth.uid(); v_correct integer; v_total integer;
begin
  if not exists (select 1 from public.simulation_sessions where id=p_session_id and user_id=v_user and status='in_progress') then raise exception 'invalid_session'; end if;
  select count(*)::integer into v_total from public.simulation_questions sq join public.simulation_sessions ss on ss.simulation_id=sq.simulation_id where ss.id=p_session_id;
  select count(*) filter(where is_correct)::integer into v_correct from public.simulation_answers where session_id=p_session_id;
  update public.simulation_sessions set status='completed',completed_at=now(),correct_count=v_correct,question_count=v_total where id=p_session_id;
  return query select v_correct,v_total;
end; $$;

revoke all on function public.start_simulation(uuid),public.answer_simulation_question(uuid,uuid,uuid),public.finish_simulation(uuid) from public,anon;
grant execute on function public.start_simulation(uuid),public.answer_simulation_question(uuid,uuid,uuid),public.finish_simulation(uuid) to authenticated;

insert into public.learning_modules(slug,title,description,module_type,route_path,sort_order)
values('simulados','Simulados','Faça provas organizadas e acompanhe seu resultado ao concluir.','simulations','/minha-conta/simulados',40)
on conflict(slug) do update set title=excluded.title,description=excluded.description,module_type=excluded.module_type,route_path=excluded.route_path,sort_order=excluded.sort_order;
insert into public.product_modules(product_id,module_id,sort_order)
select p.id,m.id,40 from public.products p join public.learning_modules m on m.slug='simulados'
where p.active=true on conflict(product_id,module_id) do nothing;

-- Nenhum simulado é semeado sem validação editorial.
