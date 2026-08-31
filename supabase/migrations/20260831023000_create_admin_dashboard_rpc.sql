-- Painel interno Nortis — leitura agregada para administradores.
--
-- Não concede SELECT direto em tabelas sensíveis. O frontend chama apenas
-- public.get_admin_dashboard(), que valida auth.uid() e profiles.role='admin'
-- antes de ler dados operacionais.

create or replace function public.get_admin_dashboard()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_is_admin boolean := false;
  v_payload jsonb;
begin
  if v_user_id is null then
    raise exception 'authentication_required' using errcode = '28000';
  end if;

  select exists (
    select 1
    from public.profiles profile
    where profile.id = v_user_id
      and profile.role = 'admin'
  )
  into v_is_admin;

  if not v_is_admin then
    raise exception 'admin_access_required' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'generated_at', now(),
    'summary', jsonb_build_object(
      'students', (select count(*) from public.profiles where role = 'student'),
      'admins', (select count(*) from public.profiles where role = 'admin'),
      'active_enrollments', (
        select count(*)
        from public.enrollments enrollment
        where enrollment.status = 'active'
          and (enrollment.expires_at is null or enrollment.expires_at > now())
      ),
      'free_sedes_enrollments', (
        select count(*)
        from public.enrollments enrollment
        join public.products product on product.id = enrollment.product_id
        where product.slug = 'nexo-social-sedes-df-2026'
          and enrollment.status = 'active'
          and enrollment.order_id is null
          and (enrollment.expires_at is null or enrollment.expires_at > now())
      ),
      'free_sample_leads', (select count(*) from public.free_sample_leads),
      'discursive_interest_leads', (select count(*) from public.discursive_interest_leads),
      'contest_interest_leads', (select count(*) from public.contest_interest_leads),
      'question_attempts', (select count(*) from public.question_attempts),
      'completed_simulations', (
        select count(*)
        from public.simulation_sessions session
        where session.status = 'completed'
      ),
      'essay_submissions', (select count(*) from public.essay_submissions),
      'study_minutes', (
        select coalesce(round(sum(session.duration_seconds)::numeric / 60), 0)::integer
        from public.study_sessions session
        where session.ended_at is not null
      )
    ),
    'contest_interests_by_slug', (
      select coalesce(jsonb_agg(row_to_json(grouped) order by grouped.total desc, grouped.contest_slug), '[]'::jsonb)
      from (
        select
          lead.contest_slug,
          count(*)::integer as total,
          max(lead.last_confirmed_at) as last_confirmed_at
        from public.contest_interest_leads lead
        group by lead.contest_slug
      ) grouped
    ),
    'discursive_interest_by_package', (
      select coalesce(jsonb_agg(row_to_json(grouped) order by grouped.total desc, grouped.package_interest), '[]'::jsonb)
      from (
        select
          lead.category,
          lead.specialty,
          lead.package_interest,
          count(*)::integer as total,
          max(lead.created_at) as latest_at
        from public.discursive_interest_leads lead
        group by lead.category, lead.specialty, lead.package_interest
      ) grouped
    ),
    'enrollments_by_product', (
      select coalesce(jsonb_agg(row_to_json(grouped) order by grouped.active_total desc, grouped.product_title), '[]'::jsonb)
      from (
        select
          product.slug as product_slug,
          product.title as product_title,
          count(*) filter (
            where enrollment.status = 'active'
              and (enrollment.expires_at is null or enrollment.expires_at > now())
          )::integer as active_total,
          count(*) filter (where enrollment.status = 'revoked')::integer as revoked_total,
          count(*) filter (
            where enrollment.status = 'expired'
              or (enrollment.expires_at is not null and enrollment.expires_at <= now())
          )::integer as expired_total
        from public.products product
        left join public.enrollments enrollment on enrollment.product_id = product.id
        group by product.slug, product.title
      ) grouped
    ),
    'study_profiles_by_target', (
      select coalesce(jsonb_agg(row_to_json(grouped) order by grouped.total desc, grouped.target_specialty), '[]'::jsonb)
      from (
        select
          coalesce(specialty.slug, 'nao_informado') as target_specialty,
          count(*)::integer as total
        from public.student_study_profiles profile
        left join public.syllabus_nodes specialty
          on specialty.id = profile.target_specialty_id
        group by coalesce(specialty.slug, 'nao_informado')
      ) grouped
    ),
    'recent_free_sample_leads', (
      select coalesce(jsonb_agg(row_to_json(lead_row) order by lead_row.created_at desc), '[]'::jsonb)
      from (
        select
          lead.id,
          lead.name,
          lead.email,
          lead.product_slug,
          lead.created_at
        from public.free_sample_leads lead
        order by lead.created_at desc
        limit 10
      ) lead_row
    ),
    'recent_discursive_interest_leads', (
      select coalesce(jsonb_agg(row_to_json(lead_row) order by lead_row.created_at desc), '[]'::jsonb)
      from (
        select
          lead.id,
          lead.name,
          lead.email,
          lead.whatsapp,
          lead.category,
          lead.specialty,
          lead.package_interest,
          lead.created_at
        from public.discursive_interest_leads lead
        order by lead.created_at desc
        limit 10
      ) lead_row
    ),
    'recent_contest_interest_leads', (
      select coalesce(jsonb_agg(row_to_json(lead_row) order by lead_row.last_confirmed_at desc), '[]'::jsonb)
      from (
        select
          lead.id,
          lead.contest_slug,
          auth_user.email,
          lead.first_interested_at,
          lead.last_confirmed_at
        from public.contest_interest_leads lead
        join auth.users auth_user on auth_user.id = lead.user_id
        order by lead.last_confirmed_at desc
        limit 10
      ) lead_row
    ),
    'recent_activity', jsonb_build_object(
      'question_attempts_last_7_days', (
        select count(*)
        from public.question_attempts attempt
        where attempt.answered_at >= now() - interval '7 days'
      ),
      'completed_simulations_last_7_days', (
        select count(*)
        from public.simulation_sessions session
        where session.status = 'completed'
          and session.completed_at >= now() - interval '7 days'
      ),
      'study_minutes_last_7_days', (
        select coalesce(round(sum(session.duration_seconds)::numeric / 60), 0)::integer
        from public.study_sessions session
        where session.ended_at is not null
          and session.ended_at >= now() - interval '7 days'
      ),
      'essay_submissions_last_7_days', (
        select count(*)
        from public.essay_submissions submission
        where submission.created_at >= now() - interval '7 days'
      )
    )
  )
  into v_payload;

  return v_payload;
end;
$$;

revoke all on function public.get_admin_dashboard() from public;
revoke all on function public.get_admin_dashboard() from anon;
grant execute on function public.get_admin_dashboard() to authenticated;

comment on function public.get_admin_dashboard() is
  'Retorna métricas agregadas e leads recentes do painel interno Nortis apenas para profiles.role=admin.';
