drop policy if exists "simulation_answers_completed_read" on public.simulation_answers;

create policy "simulation_answers_self_read"
on public.simulation_answers for select
to authenticated
using (
  exists (
    select 1
    from public.simulation_sessions session
    where session.id = simulation_answers.session_id
      and session.user_id = (select auth.uid())
  )
);

create or replace function public.start_simulation(p_simulation_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_product_id uuid;
  v_session_id uuid;
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;

  select simulation.product_id into v_product_id
  from public.simulations simulation
  where simulation.id = p_simulation_id and simulation.active = true;

  if v_product_id is null then raise exception 'simulation_not_found'; end if;
  if not exists (
    select 1 from public.enrollments enrollment
    where enrollment.product_id = v_product_id
      and enrollment.user_id = v_user_id
      and enrollment.status = 'active'
      and (enrollment.expires_at is null or enrollment.expires_at > now())
  ) then raise exception 'access_denied'; end if;

  select session.id into v_session_id
  from public.simulation_sessions session
  where session.simulation_id = p_simulation_id
    and session.user_id = v_user_id
    and session.status = 'in_progress'
  order by session.started_at desc, session.id desc
  limit 1;

  if v_session_id is null then
    insert into public.simulation_sessions(simulation_id, user_id)
    values (p_simulation_id, v_user_id)
    returning id into v_session_id;
  end if;

  return v_session_id;
end;
$$;

create or replace function public.answer_simulation_question(
  p_session_id uuid,
  p_question_id uuid,
  p_option_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_correct_option_id uuid;
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;

  select solution.correct_option_id into v_correct_option_id
  from public.simulation_sessions session
  join public.simulations simulation on simulation.id = session.simulation_id
  join public.enrollments enrollment
    on enrollment.product_id = simulation.product_id
   and enrollment.user_id = session.user_id
   and enrollment.status = 'active'
   and (enrollment.expires_at is null or enrollment.expires_at > now())
  join public.simulation_questions link
    on link.simulation_id = session.simulation_id
   and link.question_id = p_question_id
  join public.question_solutions solution on solution.question_id = p_question_id
  where session.id = p_session_id
    and session.user_id = v_user_id
    and session.status = 'in_progress'
    and (
      simulation.time_limit_minutes is null
      or now() <= session.started_at + make_interval(mins => simulation.time_limit_minutes)
    );

  if v_correct_option_id is null then raise exception 'invalid_or_expired_session'; end if;
  if not exists (
    select 1 from public.question_options option
    where option.id = p_option_id and option.question_id = p_question_id
  ) then raise exception 'invalid_option'; end if;

  insert into public.simulation_answers(session_id, question_id, selected_option_id, is_correct)
  values (p_session_id, p_question_id, p_option_id, p_option_id = v_correct_option_id)
  on conflict(session_id, question_id) do update set
    selected_option_id = excluded.selected_option_id,
    is_correct = excluded.is_correct,
    answered_at = now();
end;
$$;

create or replace function public.finish_simulation(p_session_id uuid)
returns table(correct_count integer, question_count integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_correct integer;
  v_total integer;
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;
  if not exists (
    select 1
    from public.simulation_sessions session
    join public.simulations simulation on simulation.id = session.simulation_id
    join public.enrollments enrollment
      on enrollment.product_id = simulation.product_id
     and enrollment.user_id = session.user_id
     and enrollment.status = 'active'
     and (enrollment.expires_at is null or enrollment.expires_at > now())
    where session.id = p_session_id
      and session.user_id = v_user_id
      and session.status = 'in_progress'
  ) then raise exception 'invalid_session'; end if;

  select count(*)::integer into v_total
  from public.simulation_questions link
  join public.simulation_sessions session on session.simulation_id = link.simulation_id
  where session.id = p_session_id;

  select count(*) filter (where answer.is_correct)::integer into v_correct
  from public.simulation_answers answer
  where answer.session_id = p_session_id;

  update public.simulation_sessions
  set status = 'completed', completed_at = now(), correct_count = v_correct, question_count = v_total
  where id = p_session_id;

  return query select v_correct, v_total;
end;
$$;

revoke all on function public.start_simulation(uuid) from public, anon;
revoke all on function public.answer_simulation_question(uuid, uuid, uuid) from public, anon;
revoke all on function public.finish_simulation(uuid) from public, anon;
grant execute on function public.start_simulation(uuid) to authenticated;
grant execute on function public.answer_simulation_question(uuid, uuid, uuid) to authenticated;
grant execute on function public.finish_simulation(uuid) to authenticated;
