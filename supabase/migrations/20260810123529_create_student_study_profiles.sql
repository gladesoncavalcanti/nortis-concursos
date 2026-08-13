create table public.student_study_profiles(
 user_id uuid primary key references auth.users(id) on delete cascade,
 target_exam text not null check(target_exam in('sedes-df','outro')),
 target_role text not null check(target_role in('tecnico','superior','indeciso')),
 preparation_stage text not null check(preparation_stage in('comecando','andamento')),
 daily_time text not null check(daily_time in('ate1h','1a3h','mais3h')),
 daily_minutes integer not null check(daily_minutes between 15 and 480),
 primary_difficulty text not null check(primary_difficulty in('legislacao','redacao','organizacao','questoes','indeciso')),
 completed_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
alter table public.student_study_profiles enable row level security;
create policy "study_profiles_self_read" on public.student_study_profiles for select to authenticated using(user_id=(select auth.uid()));
create policy "study_profiles_self_insert" on public.student_study_profiles for insert to authenticated with check(user_id=(select auth.uid()));
create policy "study_profiles_self_update" on public.student_study_profiles for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
revoke all on public.student_study_profiles from anon;
grant select,insert,update on public.student_study_profiles to authenticated;
