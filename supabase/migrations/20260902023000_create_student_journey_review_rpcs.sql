-- Jornada Inteligente SEDES — RPCs protegidas para revisão pós-simulado
-- e nutrição operacional de leads.
--
-- Não altera checkout, pagamentos, pedidos, Asaas, Edge Functions, secrets,
-- dependências ou configurações. Não concede SELECT direto em tabelas
-- sensíveis. As leituras passam por funções security definer com validação
-- explícita de auth.uid().

create or replace function public.get_my_simulation_review(p_session_id uuid)
returns table (
  session_id uuid,
  simulation_id uuid,
  simulation_title text,
  question_id uuid,
  question_order integer,
  statement text,
  syllabus_node_id uuid,
  syllabus_node_title text,
  selected_option_id uuid,
  selected_label text,
  selected_text text,
  correct_option_id uuid,
  correct_label text,
  correct_text text,
  is_correct boolean,
  explanation text,
  answered_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'authentication_required' using errcode = '28000';
  end if;

  if not exists (
    select 1
    from public.simulation_sessions session
    join public.simulations simulation on simulation.id = session.simulation_id
    join public.enrollments enrollment
      on enrollment.product_id = simulation.product_id
     and enrollment.user_id = v_user_id
     and enrollment.status = 'active'
     and (enrollment.expires_at is null or enrollment.expires_at > now())
    where session.id = p_session_id
      and session.user_id = v_user_id
      and session.status = 'completed'
  ) then
    raise exception 'simulation_review_not_available' using errcode = '42501';
  end if;

  return query
  select
    session.id as session_id,
    simulation.id as simulation_id,
    simulation.title as simulation_title,
    question.id as question_id,
    link.sort_order as question_order,
    question.statement,
    question.syllabus_node_id,
    syllabus.title as syllabus_node_title,
    answer.selected_option_id,
    selected_option.label as selected_label,
    selected_option.option_text as selected_text,
    solution.correct_option_id,
    correct_option.label as correct_label,
    correct_option.option_text as correct_text,
    answer.is_correct,
    question.explanation,
    answer.answered_at
  from public.simulation_sessions session
  join public.simulations simulation on simulation.id = session.simulation_id
  join public.simulation_questions link on link.simulation_id = simulation.id
  join public.questions question on question.id = link.question_id
  left join public.syllabus_nodes syllabus on syllabus.id = question.syllabus_node_id
  left join public.simulation_answers answer
    on answer.session_id = session.id
   and answer.question_id = question.id
  left join public.question_options selected_option
    on selected_option.id = answer.selected_option_id
  join public.question_solutions solution
    on solution.question_id = question.id
  join public.question_options correct_option
    on correct_option.id = solution.correct_option_id
  where session.id = p_session_id
    and session.user_id = v_user_id
    and session.status = 'completed'
  order by link.sort_order, question.id;
end;
$$;

revoke all on function public.get_my_simulation_review(uuid) from public;
revoke all on function public.get_my_simulation_review(uuid) from anon;
grant execute on function public.get_my_simulation_review(uuid) to authenticated;

comment on function public.get_my_simulation_review(uuid) is
  'Retorna revisão detalhada de simulado concluído somente para o próprio aluno com matrícula ativa no produto.';


create or replace function public.get_admin_lead_nurture_queue()
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
    'contest_queue', (
      select coalesce(jsonb_agg(row_to_json(row_data) order by row_data.last_confirmed_at desc), '[]'::jsonb)
      from (
        select
          lead.contest_slug,
          auth_user.email,
          lead.source,
          lead.first_interested_at,
          lead.last_confirmed_at,
          case
            when lead.last_confirmed_at >= now() - interval '7 days' then 'novo_interesse'
            when lead.last_confirmed_at >= now() - interval '30 days' then 'aquecer_com_conteudo'
            else 'reativar_interesse'
          end as funnel_stage,
          case
            when lead.contest_slug = 'sedes-df-2026' then 'oferta_sedes_promocional'
            else 'aguardar_validacao_editorial'
          end as recommended_action
        from public.contest_interest_leads lead
        join auth.users auth_user on auth_user.id = lead.user_id
        order by lead.last_confirmed_at desc
        limit 100
      ) row_data
    ),
    'contest_summary', (
      select coalesce(jsonb_agg(row_to_json(grouped) order by grouped.total desc, grouped.contest_slug), '[]'::jsonb)
      from (
        select
          lead.contest_slug,
          count(*)::integer as total,
          count(*) filter (where lead.last_confirmed_at >= now() - interval '7 days')::integer as new_last_7_days,
          max(lead.last_confirmed_at) as last_confirmed_at
        from public.contest_interest_leads lead
        group by lead.contest_slug
      ) grouped
    )
  )
  into v_payload;

  return v_payload;
end;
$$;

revoke all on function public.get_admin_lead_nurture_queue() from public;
revoke all on function public.get_admin_lead_nurture_queue() from anon;
grant execute on function public.get_admin_lead_nurture_queue() to authenticated;

comment on function public.get_admin_lead_nurture_queue() is
  'Retorna fila interna de nutrição de leads somente para admin; não envia e-mail, WhatsApp ou mensagem externa.';
