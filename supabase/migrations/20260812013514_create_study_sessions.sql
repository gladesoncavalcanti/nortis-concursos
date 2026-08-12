create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  study_plan_item_id uuid references public.study_plan_items(id) on delete set null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer check (duration_seconds between 1 and 28800),
  created_at timestamptz not null default now(),
  constraint study_sessions_time_order_check check (ended_at is null or ended_at >= started_at),
  constraint study_sessions_completion_check check (
    (ended_at is null and duration_seconds is null)
    or (ended_at is not null and duration_seconds is not null)
  )
);

create unique index study_sessions_one_active_per_user_idx
  on public.study_sessions(user_id)
  where ended_at is null;
create index study_sessions_user_started_idx
  on public.study_sessions(user_id, started_at desc);
create index study_sessions_product_started_idx
  on public.study_sessions(product_id, started_at desc);
create index study_sessions_plan_item_idx
  on public.study_sessions(study_plan_item_id)
  where study_plan_item_id is not null;

alter table public.study_sessions enable row level security;

create policy "study_sessions_enrolled_self_read"
on public.study_sessions for select
to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.enrollments enrollment
    where enrollment.user_id = (select auth.uid())
      and enrollment.product_id = study_sessions.product_id
      and enrollment.status = 'active'
      and (enrollment.expires_at is null or enrollment.expires_at > now())
  )
);

revoke all on public.study_sessions from anon, authenticated;
grant select on public.study_sessions to authenticated;

create or replace function public.start_study_session(p_study_plan_item_id uuid)
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

  select item.product_id into v_product_id
  from public.study_plan_items item
  join public.enrollments enrollment
    on enrollment.product_id = item.product_id
   and enrollment.user_id = v_user_id
   and enrollment.status = 'active'
   and (enrollment.expires_at is null or enrollment.expires_at > now())
  where item.id = p_study_plan_item_id
    and item.user_id = v_user_id;

  if v_product_id is null then raise exception 'study_plan_item_not_available'; end if;

  select session.id into v_session_id
  from public.study_sessions session
  where session.user_id = v_user_id
    and session.ended_at is null
  order by session.started_at desc, session.id desc
  limit 1;

  if v_session_id is null then
    begin
      insert into public.study_sessions(user_id, product_id, study_plan_item_id)
      values (v_user_id, v_product_id, p_study_plan_item_id)
      returning id into v_session_id;
    exception when unique_violation then
      select session.id into v_session_id
      from public.study_sessions session
      where session.user_id = v_user_id
        and session.ended_at is null
      order by session.started_at desc, session.id desc
      limit 1;
    end;
  end if;

  return v_session_id;
end;
$$;

create or replace function public.finish_study_session(p_session_id uuid)
returns table(session_id uuid, duration_seconds integer, ended_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;

  if not exists (
    select 1
    from public.study_sessions session
    join public.enrollments enrollment
      on enrollment.product_id = session.product_id
     and enrollment.user_id = session.user_id
     and enrollment.status = 'active'
     and (enrollment.expires_at is null or enrollment.expires_at > now())
    where session.id = p_session_id
      and session.user_id = v_user_id
      and session.ended_at is null
  ) then raise exception 'study_session_not_available'; end if;

  return query
  update public.study_sessions session
  set ended_at = now(),
      duration_seconds = least(
        28800,
        greatest(1, floor(extract(epoch from (now() - session.started_at)))::integer)
      )
  where session.id = p_session_id
    and session.user_id = v_user_id
    and session.ended_at is null
  returning session.id, session.duration_seconds, session.ended_at;
end;
$$;

revoke all on function public.start_study_session(uuid) from public, anon;
revoke all on function public.finish_study_session(uuid) from public, anon;
grant execute on function public.start_study_session(uuid) to authenticated;
grant execute on function public.finish_study_session(uuid) to authenticated;
