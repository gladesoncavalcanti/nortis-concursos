-- Ciclos preservam cada diagnóstico e permitem reavaliações sem sobrescrever
-- evidências anteriores. Autopercepção continua em topic_self_assessments e
-- nunca é convertida em nota objetiva neste modelo.
create table public.diagnostic_cycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  specialty_id uuid not null references public.syllabus_nodes(id) on delete restrict,
  cycle_number integer not null check (cycle_number > 0),
  status text not null default 'open' check (status in ('open', 'completed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, product_id, specialty_id, cycle_number),
  unique (id, user_id, specialty_id),
  constraint diagnostic_cycles_completion_consistent check (
    (status = 'open' and completed_at is null)
    or (status = 'completed' and completed_at is not null)
  )
);

create unique index diagnostic_cycles_one_open_idx
  on public.diagnostic_cycles(user_id, product_id, specialty_id)
  where status = 'open';
create index diagnostic_cycles_user_latest_idx
  on public.diagnostic_cycles(user_id, specialty_id, cycle_number desc);

alter table public.diagnostic_cycles enable row level security;

create policy "diagnostic_cycles_self_read" on public.diagnostic_cycles
for select to authenticated using (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.enrollments enrollment
    where enrollment.product_id = diagnostic_cycles.product_id
      and enrollment.user_id = (select auth.uid())
      and enrollment.status = 'active'
      and (enrollment.expires_at is null or enrollment.expires_at > now())
  )
  and exists (
    select 1
    from public.student_study_profiles profile
    where profile.user_id = (select auth.uid())
      and profile.target_specialty_id = diagnostic_cycles.specialty_id
  )
);

revoke all on public.diagnostic_cycles from public, anon, authenticated;
grant select on public.diagnostic_cycles to authenticated;

alter table public.question_attempts
  add column diagnostic_cycle_id uuid;

-- Resultados anteriores viram o ciclo inicial, sem perda nem reclassificação.
insert into public.diagnostic_cycles (
  user_id, product_id, specialty_id, cycle_number,
  status, started_at, completed_at
)
select attempt.user_id, question.product_id, attempt.specialty_id, 1,
       'completed', min(attempt.answered_at), max(attempt.answered_at)
from public.question_attempts attempt
join public.questions question on question.id = attempt.question_id
where attempt.attempt_context = 'diagnostic'
group by attempt.user_id, question.product_id, attempt.specialty_id
on conflict (user_id, product_id, specialty_id, cycle_number) do nothing;

update public.question_attempts attempt
set diagnostic_cycle_id = cycle.id
from public.questions question
join public.diagnostic_cycles cycle
  on cycle.product_id = question.product_id
 and cycle.cycle_number = 1
where attempt.question_id = question.id
  and attempt.attempt_context = 'diagnostic'
  and cycle.user_id = attempt.user_id
  and cycle.specialty_id = attempt.specialty_id;

alter table public.question_attempts
  add constraint question_attempts_diagnostic_cycle_required check (
    (attempt_context = 'practice' and diagnostic_cycle_id is null)
    or (attempt_context = 'diagnostic' and diagnostic_cycle_id is not null)
  ),
  add constraint question_attempts_cycle_owner_fk
    foreign key (diagnostic_cycle_id, user_id, specialty_id)
    references public.diagnostic_cycles(id, user_id, specialty_id)
    on delete cascade;

drop index if exists public.question_attempts_one_diagnostic_per_question_idx;
create unique index question_attempts_one_answer_per_cycle_idx
  on public.question_attempts(diagnostic_cycle_id, question_id)
  where attempt_context = 'diagnostic';
create index question_attempts_cycle_idx
  on public.question_attempts(diagnostic_cycle_id, answered_at);

create or replace function public.start_diagnostic_cycle()
returns table (
  cycle_id uuid,
  cycle_number integer,
  cycle_status text,
  started_at timestamptz,
  completed_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_product_id uuid;
  v_specialty_id uuid;
  v_cycle public.diagnostic_cycles%rowtype;
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;

  select specialty.product_id, specialty.id
    into v_product_id, v_specialty_id
  from public.student_study_profiles profile
  join public.syllabus_nodes specialty
    on specialty.id = profile.target_specialty_id
   and specialty.node_type = 'specialty'
  where profile.user_id = v_user_id;

  if v_specialty_id is null then raise exception 'specialty_required'; end if;
  if not exists (
    select 1
    from public.enrollments enrollment
    where enrollment.product_id = v_product_id
      and enrollment.user_id = v_user_id
      and enrollment.status = 'active'
      and (enrollment.expires_at is null or enrollment.expires_at > now())
  ) then raise exception 'access_denied'; end if;
  if not exists (
    select 1
    from public.questions question
    join public.syllabus_nodes subject
      on subject.id = question.syllabus_node_id
     and subject.parent_id = v_specialty_id
     and subject.node_type = 'subject'
    where question.product_id = v_product_id
      and question.active = true
      and question.diagnostic_eligible = true
  ) then raise exception 'diagnostic_not_available'; end if;

  perform pg_advisory_xact_lock(
    hashtextextended(v_user_id::text || ':' || v_product_id::text || ':' || v_specialty_id::text, 0)
  );

  select cycle.* into v_cycle
  from public.diagnostic_cycles cycle
  where cycle.user_id = v_user_id
    and cycle.product_id = v_product_id
    and cycle.specialty_id = v_specialty_id
    and cycle.status = 'open';

  if v_cycle.id is null then
    insert into public.diagnostic_cycles (
      user_id, product_id, specialty_id, cycle_number
    ) values (
      v_user_id, v_product_id, v_specialty_id,
      coalesce((
        select max(cycle.cycle_number) + 1
        from public.diagnostic_cycles cycle
        where cycle.user_id = v_user_id
          and cycle.product_id = v_product_id
          and cycle.specialty_id = v_specialty_id
      ), 1)
    ) returning * into v_cycle;
  end if;

  return query select v_cycle.id, v_cycle.cycle_number, v_cycle.status,
                      v_cycle.started_at, v_cycle.completed_at;
end;
$$;

create or replace function public.submit_diagnostic_answer(
  p_question_id uuid,
  p_selected_option_id uuid
)
returns table (
  attempt_id uuid,
  is_correct boolean,
  correct_option_id uuid,
  explanation text,
  answered_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_product_id uuid;
  v_specialty_id uuid;
  v_cycle_id uuid;
  v_correct_option_id uuid;
  v_explanation text;
  v_attempt_id uuid;
  v_is_correct boolean;
  v_answered_at timestamptz;
  v_expected_count integer;
  v_answered_count integer;
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;

  select question.product_id, subject.parent_id,
         solution.correct_option_id, question.explanation
    into v_product_id, v_specialty_id, v_correct_option_id, v_explanation
  from public.questions question
  join public.question_solutions solution on solution.question_id = question.id
  join public.syllabus_nodes subject
    on subject.id = question.syllabus_node_id
   and subject.node_type = 'subject'
  join public.syllabus_nodes specialty
    on specialty.id = subject.parent_id
   and specialty.node_type = 'specialty'
  where question.id = p_question_id
    and question.active = true
    and question.diagnostic_eligible = true;

  if v_product_id is null then raise exception 'diagnostic_question_not_found'; end if;
  if not exists (
    select 1 from public.enrollments enrollment
    where enrollment.product_id = v_product_id
      and enrollment.user_id = v_user_id
      and enrollment.status = 'active'
      and (enrollment.expires_at is null or enrollment.expires_at > now())
  ) then raise exception 'access_denied'; end if;
  if not exists (
    select 1 from public.student_study_profiles profile
    where profile.user_id = v_user_id
      and profile.target_specialty_id = v_specialty_id
  ) then raise exception 'specialty_mismatch'; end if;
  if not exists (
    select 1 from public.question_options option
    where option.id = p_selected_option_id
      and option.question_id = p_question_id
  ) then raise exception 'invalid_option'; end if;

  select cycle.id into v_cycle_id
  from public.diagnostic_cycles cycle
  where cycle.user_id = v_user_id
    and cycle.product_id = v_product_id
    and cycle.specialty_id = v_specialty_id
    and cycle.status = 'open';

  if v_cycle_id is null then raise exception 'diagnostic_cycle_required'; end if;

  insert into public.question_attempts as attempt (
    user_id, question_id, selected_option_id, is_correct,
    attempt_context, specialty_id, diagnostic_cycle_id
  ) values (
    v_user_id, p_question_id, p_selected_option_id,
    p_selected_option_id = v_correct_option_id,
    'diagnostic', v_specialty_id, v_cycle_id
  )
  on conflict (diagnostic_cycle_id, question_id)
    where attempt_context = 'diagnostic'
  do nothing
  returning attempt.id, attempt.is_correct, attempt.answered_at
    into v_attempt_id, v_is_correct, v_answered_at;

  if v_attempt_id is null then
    select attempt.id, attempt.is_correct, attempt.answered_at
      into v_attempt_id, v_is_correct, v_answered_at
    from public.question_attempts attempt
    where attempt.diagnostic_cycle_id = v_cycle_id
      and attempt.question_id = p_question_id
      and attempt.attempt_context = 'diagnostic';
  end if;

  select count(*) into v_expected_count
  from public.questions question
  join public.syllabus_nodes subject
    on subject.id = question.syllabus_node_id
   and subject.parent_id = v_specialty_id
   and subject.node_type = 'subject'
  where question.product_id = v_product_id
    and question.active = true
    and question.diagnostic_eligible = true;

  select count(*) into v_answered_count
  from public.question_attempts attempt
  where attempt.diagnostic_cycle_id = v_cycle_id
    and attempt.attempt_context = 'diagnostic';

  if v_expected_count > 0 and v_answered_count >= v_expected_count then
    update public.diagnostic_cycles
    set status = 'completed', completed_at = now()
    where id = v_cycle_id and status = 'open';
  end if;

  return query select v_attempt_id, v_is_correct, v_correct_option_id,
                      v_explanation, v_answered_at;
end;
$$;

create or replace function public.get_my_diagnostic_results()
returns table (
  question_id uuid,
  selected_option_id uuid,
  is_correct boolean,
  correct_option_id uuid,
  explanation text,
  answered_at timestamptz
)
language sql
security definer
set search_path = ''
stable
as $$
  select attempt.question_id, attempt.selected_option_id, attempt.is_correct,
         solution.correct_option_id, question.explanation, attempt.answered_at
  from public.question_attempts attempt
  join public.diagnostic_cycles cycle
    on cycle.id = attempt.diagnostic_cycle_id
   and cycle.user_id = (select auth.uid())
  join public.questions question on question.id = attempt.question_id
  join public.question_solutions solution on solution.question_id = question.id
  join public.enrollments enrollment
    on enrollment.product_id = question.product_id
   and enrollment.user_id = (select auth.uid())
   and enrollment.status = 'active'
   and (enrollment.expires_at is null or enrollment.expires_at > now())
  join public.student_study_profiles profile
    on profile.user_id = (select auth.uid())
   and profile.target_specialty_id = cycle.specialty_id
  join public.syllabus_nodes subject
    on subject.id = question.syllabus_node_id
   and subject.node_type = 'subject'
   and subject.parent_id = profile.target_specialty_id
  where cycle.cycle_number = (
    select max(latest.cycle_number)
    from public.diagnostic_cycles latest
    where latest.user_id = (select auth.uid())
      and latest.product_id = cycle.product_id
      and latest.specialty_id = cycle.specialty_id
  )
  order by attempt.answered_at;
$$;

create or replace function public.get_my_diagnostic_history()
returns table (
  cycle_id uuid,
  cycle_number integer,
  cycle_status text,
  started_at timestamptz,
  completed_at timestamptz,
  subject_id uuid,
  subject_title text,
  answered integer,
  correct integer,
  accuracy integer
)
language sql
security definer
set search_path = ''
stable
as $$
  select cycle.id, cycle.cycle_number, cycle.status,
         cycle.started_at, cycle.completed_at,
         subject.id, subject.title,
         count(attempt.id)::integer,
         count(attempt.id) filter (where attempt.is_correct)::integer,
         case when count(attempt.id) = 0 then null
              else round(100.0 * count(attempt.id) filter (where attempt.is_correct)
                         / count(attempt.id))::integer end
  from public.diagnostic_cycles cycle
  join public.enrollments enrollment
    on enrollment.product_id = cycle.product_id
   and enrollment.user_id = (select auth.uid())
   and enrollment.status = 'active'
   and (enrollment.expires_at is null or enrollment.expires_at > now())
  join public.student_study_profiles profile
    on profile.user_id = (select auth.uid())
   and profile.target_specialty_id = cycle.specialty_id
  join public.syllabus_nodes subject
    on subject.parent_id = cycle.specialty_id
   and subject.node_type = 'subject'
  join public.questions question
    on question.syllabus_node_id = subject.id
   and question.product_id = cycle.product_id
   and question.active = true
   and question.diagnostic_eligible = true
  left join public.question_attempts attempt
    on attempt.diagnostic_cycle_id = cycle.id
   and attempt.question_id = question.id
   and attempt.attempt_context = 'diagnostic'
  where cycle.user_id = (select auth.uid())
  group by cycle.id, cycle.cycle_number, cycle.status,
           cycle.started_at, cycle.completed_at, subject.id, subject.title
  order by cycle.cycle_number, subject.title;
$$;

revoke all on function public.start_diagnostic_cycle() from public, anon;
revoke all on function public.submit_diagnostic_answer(uuid, uuid) from public, anon;
revoke all on function public.get_my_diagnostic_results() from public, anon;
revoke all on function public.get_my_diagnostic_history() from public, anon;
grant execute on function public.start_diagnostic_cycle() to authenticated;
grant execute on function public.submit_diagnostic_answer(uuid, uuid) to authenticated;
grant execute on function public.get_my_diagnostic_results() to authenticated;
grant execute on function public.get_my_diagnostic_history() to authenticated;
