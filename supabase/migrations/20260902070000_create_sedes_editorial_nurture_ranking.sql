-- Nortis Concursos — SEDES extra editorial, nutrição com opt-in e ranking opt-in.
--
-- Escopo:
-- - adiciona um lote editorial inicial para Agente Social;
-- - cria estruturas internas de opt-in/log de nutrição, sem envio externo;
-- - cria ranking nominal somente para alunos que optarem por participar.
--
-- Não altera fluxos comerciais, integrações externas, funções de borda,
-- variáveis sensíveis, dependências ou configurações.

create table if not exists public.lead_nurture_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email_opt_in boolean not null default false,
  whatsapp_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lead_nurture_preferences_some_channel
    check (email_opt_in = true or whatsapp_opt_in = true)
);

create table if not exists public.lead_nurture_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contest_slug text not null,
  channel text not null check (channel in ('email', 'whatsapp')),
  template_key text not null,
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed', 'skipped')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  error_message text
);

create index if not exists lead_nurture_events_user_idx
  on public.lead_nurture_events(user_id, created_at desc);

create index if not exists lead_nurture_events_contest_status_idx
  on public.lead_nurture_events(contest_slug, status, created_at desc);

create table if not exists public.student_ranking_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  enabled boolean not null default false,
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_ranking_display_name_len check (char_length(btrim(display_name)) between 3 and 40)
);

alter table public.lead_nurture_preferences enable row level security;
alter table public.lead_nurture_events enable row level security;
alter table public.student_ranking_preferences enable row level security;

drop policy if exists "lead_nurture_preferences_self_read" on public.lead_nurture_preferences;
create policy "lead_nurture_preferences_self_read"
on public.lead_nurture_preferences for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "lead_nurture_preferences_self_write" on public.lead_nurture_preferences;
create policy "lead_nurture_preferences_self_write"
on public.lead_nurture_preferences for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "lead_nurture_preferences_self_update" on public.lead_nurture_preferences;
create policy "lead_nurture_preferences_self_update"
on public.lead_nurture_preferences for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "student_ranking_preferences_self_read" on public.student_ranking_preferences;
create policy "student_ranking_preferences_self_read"
on public.student_ranking_preferences for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "student_ranking_preferences_self_write" on public.student_ranking_preferences;
create policy "student_ranking_preferences_self_write"
on public.student_ranking_preferences for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "student_ranking_preferences_self_update" on public.student_ranking_preferences;
create policy "student_ranking_preferences_self_update"
on public.student_ranking_preferences for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

revoke all on public.lead_nurture_preferences from anon, authenticated;
revoke all on public.lead_nurture_events from anon, authenticated;
revoke all on public.student_ranking_preferences from anon, authenticated;
grant select, insert, update on public.lead_nurture_preferences to authenticated;
grant select, insert, update on public.student_ranking_preferences to authenticated;

create or replace function public.upsert_my_lead_nurture_preferences(
  p_email_opt_in boolean,
  p_whatsapp_opt_in boolean
)
returns table (email_opt_in boolean, whatsapp_opt_in boolean, updated_at timestamptz)
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

  if coalesce(p_email_opt_in, false) = false and coalesce(p_whatsapp_opt_in, false) = false then
    delete from public.lead_nurture_preferences where user_id = v_user_id;
    return;
  end if;

  return query
  insert into public.lead_nurture_preferences (user_id, email_opt_in, whatsapp_opt_in, updated_at)
  values (v_user_id, coalesce(p_email_opt_in, false), coalesce(p_whatsapp_opt_in, false), now())
  on conflict (user_id) do update set
    email_opt_in = excluded.email_opt_in,
    whatsapp_opt_in = excluded.whatsapp_opt_in,
    updated_at = now()
  returning
    public.lead_nurture_preferences.email_opt_in,
    public.lead_nurture_preferences.whatsapp_opt_in,
    public.lead_nurture_preferences.updated_at;
end;
$$;

create or replace function public.upsert_my_ranking_preference(
  p_enabled boolean,
  p_display_name text
)
returns table (enabled boolean, display_name text, updated_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_display_name text := left(btrim(coalesce(p_display_name, '')), 40);
begin
  if v_user_id is null then
    raise exception 'authentication_required' using errcode = '28000';
  end if;

  if coalesce(p_enabled, false) = false then
    delete from public.student_ranking_preferences where user_id = v_user_id;
    return query select false, ''::text, now();
    return;
  end if;

  if char_length(v_display_name) < 3 then
    raise exception 'invalid_display_name' using errcode = '22023';
  end if;

  return query
  insert into public.student_ranking_preferences (user_id, enabled, display_name, updated_at)
  values (v_user_id, true, v_display_name, now())
  on conflict (user_id) do update set
    enabled = excluded.enabled,
    display_name = excluded.display_name,
    updated_at = now()
  returning
    public.student_ranking_preferences.enabled,
    public.student_ranking_preferences.display_name,
    public.student_ranking_preferences.updated_at;
end;
$$;

create or replace function public.get_student_opt_in_leaderboard()
returns table (
  rank_position integer,
  display_name text,
  answered integer,
  question_accuracy integer,
  completed_simulations integer,
  studied_minutes_last_30_days integer,
  is_current_user boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_product_id uuid;
begin
  if v_user_id is null then
    raise exception 'authentication_required' using errcode = '28000';
  end if;

  select product.id
  into v_product_id
  from public.products product
  where product.slug = 'nexo-social-sedes-df-2026'
    and product.active = true;

  if v_product_id is null then
    raise exception 'sedes_product_not_found' using errcode = 'P0002';
  end if;

  if not exists (
    select 1
    from public.enrollments enrollment
    where enrollment.user_id = v_user_id
      and enrollment.product_id = v_product_id
      and enrollment.status = 'active'
      and (enrollment.expires_at is null or enrollment.expires_at > now())
  ) then
    raise exception 'active_enrollment_required' using errcode = '42501';
  end if;

  if (
    select count(*)
    from public.student_ranking_preferences preference
    join public.enrollments enrollment on enrollment.user_id = preference.user_id
    where preference.enabled = true
      and enrollment.product_id = v_product_id
      and enrollment.status = 'active'
      and (enrollment.expires_at is null or enrollment.expires_at > now())
  ) < 3 then
    return;
  end if;

  return query
  with opted_students as (
    select distinct preference.user_id, preference.display_name
    from public.student_ranking_preferences preference
    join public.enrollments enrollment on enrollment.user_id = preference.user_id
    where preference.enabled = true
      and enrollment.product_id = v_product_id
      and enrollment.status = 'active'
      and (enrollment.expires_at is null or enrollment.expires_at > now())
  ),
  question_stats as (
    select
      attempt.user_id,
      count(*)::integer as answered,
      count(*) filter (where attempt.is_correct)::integer as correct
    from public.question_attempts attempt
    join public.questions question
      on question.id = attempt.question_id
     and question.product_id = v_product_id
    join opted_students student on student.user_id = attempt.user_id
    group by attempt.user_id
  ),
  simulation_stats as (
    select
      session.user_id,
      count(*) filter (where session.status = 'completed')::integer as completed_simulations
    from public.simulation_sessions session
    join public.simulations simulation
      on simulation.id = session.simulation_id
     and simulation.product_id = v_product_id
    join opted_students student on student.user_id = session.user_id
    group by session.user_id
  ),
  study_time_stats as (
    select
      study_session.user_id,
      round(coalesce(sum(study_session.duration_seconds), 0)::numeric / 60)::integer as studied_minutes
    from public.study_sessions study_session
    join opted_students student on student.user_id = study_session.user_id
    where study_session.ended_at is not null
      and study_session.product_id = v_product_id
      and study_session.started_at >= now() - interval '30 days'
    group by study_session.user_id
  ),
  scored as (
    select
      student.user_id,
      student.display_name,
      coalesce(question_stats.answered, 0) as answered,
      case
        when coalesce(question_stats.answered, 0) > 0
        then round((question_stats.correct::numeric / question_stats.answered::numeric) * 100)::integer
        else 0
      end as question_accuracy,
      coalesce(simulation_stats.completed_simulations, 0) as completed_simulations,
      coalesce(study_time_stats.studied_minutes, 0) as studied_minutes_last_30_days
    from opted_students student
    left join question_stats on question_stats.user_id = student.user_id
    left join simulation_stats on simulation_stats.user_id = student.user_id
    left join study_time_stats on study_time_stats.user_id = student.user_id
  )
  select
    (dense_rank() over (
      order by scored.question_accuracy desc,
               scored.answered desc,
               scored.completed_simulations desc,
               scored.studied_minutes_last_30_days desc
    ))::integer as rank_position,
    scored.display_name,
    scored.answered,
    scored.question_accuracy,
    scored.completed_simulations,
    scored.studied_minutes_last_30_days,
    scored.user_id = v_user_id as is_current_user
  from scored
  order by rank_position, display_name
  limit 20;
end;
$$;

revoke all on function public.upsert_my_lead_nurture_preferences(boolean, boolean) from public, anon;
revoke all on function public.upsert_my_ranking_preference(boolean, text) from public, anon;
revoke all on function public.get_student_opt_in_leaderboard() from public, anon;
grant execute on function public.upsert_my_lead_nurture_preferences(boolean, boolean) to authenticated;
grant execute on function public.upsert_my_ranking_preference(boolean, text) to authenticated;
grant execute on function public.get_student_opt_in_leaderboard() to authenticated;

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
          profile.phone,
          lead.source,
          coalesce(preference.email_opt_in, false) as email_opt_in,
          coalesce(preference.whatsapp_opt_in, false) as whatsapp_opt_in,
          lead.first_interested_at,
          lead.last_confirmed_at,
          (
            select count(*)::integer
            from public.lead_nurture_events event
            where event.user_id = lead.user_id
              and event.contest_slug = lead.contest_slug
          ) as nurture_event_count,
          case
            when preference.user_id is null then 'aguardando_opt_in'
            when lead.last_confirmed_at >= now() - interval '7 days' then 'novo_interesse'
            when lead.last_confirmed_at >= now() - interval '30 days' then 'aquecer_com_conteudo'
            else 'reativar_interesse'
          end as funnel_stage,
          case
            when preference.user_id is null then 'solicitar_preferencia'
            when lead.contest_slug = 'sedes-df-2026' then 'oferta_sedes_promocional'
            else 'aguardar_validacao_editorial'
          end as recommended_action
        from public.contest_interest_leads lead
        join auth.users auth_user on auth_user.id = lead.user_id
        left join public.profiles profile on profile.id = lead.user_id
        left join public.lead_nurture_preferences preference on preference.user_id = lead.user_id
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
          count(*) filter (where preference.email_opt_in = true)::integer as email_opt_in_total,
          count(*) filter (where preference.whatsapp_opt_in = true)::integer as whatsapp_opt_in_total,
          count(*) filter (where lead.last_confirmed_at >= now() - interval '7 days')::integer as new_last_7_days,
          max(lead.last_confirmed_at) as last_confirmed_at
        from public.contest_interest_leads lead
        left join public.lead_nurture_preferences preference on preference.user_id = lead.user_id
        group by lead.contest_slug
      ) grouped
    ),
    'nurture_events', (
      select coalesce(jsonb_agg(row_to_json(event_data) order by event_data.created_at desc), '[]'::jsonb)
      from (
        select
          event.contest_slug,
          event.channel,
          event.template_key,
          event.status,
          event.created_at,
          event.sent_at
        from public.lead_nurture_events event
        order by event.created_at desc
        limit 50
      ) event_data
    )
  )
  into v_payload;

  return v_payload;
end;
$$;

revoke all on function public.get_admin_lead_nurture_queue() from public;
revoke all on function public.get_admin_lead_nurture_queue() from anon;
grant execute on function public.get_admin_lead_nurture_queue() to authenticated;

with practice_seed(
  subject_slug, question_slug, statement, explanation, source_reference, sort_order
) as (values
  (
    '1-rede-socioassistencial-e-trabalho-no-territorio',
    'pratica-agente-social-prontuario-suas',
    'Em visita ao território, a equipe identifica nova situação de vulnerabilidade em família já acompanhada. Qual registro fortalece a continuidade técnica do atendimento?',
    'O registro deve ser objetivo, datado, vinculado ao acompanhamento e útil para a equipe. A lógica do prontuário não é burocracia isolada: é instrumento de memória institucional, continuidade e responsabilização técnica.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.3.2.1; orientações oficiais do SUAS sobre registros e trabalho social com famílias. Questão autoral Nortis.',
    21060
  ),
  (
    '2-protecao-social-basica-e-trabalho-com-familias-e-comunidades',
    'pratica-agente-social-beneficio-eventual-acompanhamento',
    'Uma família busca benefício eventual em razão de insegurança temporária. Qual conduta evita transformar o benefício em resposta isolada?',
    'Benefícios eventuais devem ser articulados ao acompanhamento familiar e à proteção social, quando cabível. A concessão não substitui escuta qualificada, identificação de vulnerabilidades e encaminhamentos necessários.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.3.2.1; LOAS e normativas do SUAS sobre benefícios eventuais. Questão autoral Nortis.',
    21070
  ),
  (
    '3-protecao-social-especial-media-e-alta-complexidade',
    'pratica-agente-social-creas-violacao-direitos',
    'Ao identificar suspeita de violação de direitos que exige acompanhamento especializado, qual articulação é mais adequada para o agente social?',
    'A Proteção Social Especial demanda encaminhamento responsável, registro e articulação com equipe/serviço competente, preservando sigilo, escuta qualificada e proteção da pessoa atendida.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.3.2.1; Tipificação Nacional dos Serviços Socioassistenciais. Questão autoral Nortis.',
    21080
  ),
  (
    '4-abordagem-social-e-populacao-em-situacao-de-rua',
    'pratica-agente-social-abordagem-nao-higienista',
    'Em ação no espaço público, a equipe é pressionada a retirar pessoas em situação de rua apenas para liberar a circulação. Qual postura está alinhada à política socioassistencial?',
    'A abordagem social não deve ser higienista ou coercitiva. Deve reconhecer direitos, construir vínculo, ofertar possibilidades de acesso à rede e respeitar a autonomia da pessoa atendida.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.3.2.1; Decreto Federal nº 7.053/2009. Questão autoral Nortis.',
    21090
  ),
  (
    '5-nocoes-de-saude-mental-e-uso-de-alcool-e-outras-drogas',
    'pratica-agente-social-crise-saude-mental-rede',
    'Durante atendimento, uma pessoa apresenta sofrimento psíquico intenso e risco de agravamento. Qual resposta preserva proteção social sem substituir a rede de saúde?',
    'A atuação deve acolher, reduzir riscos imediatos, acionar fluxos da rede de saúde/atenção psicossocial quando necessário e evitar julgamento moral. A assistência social articula proteção, mas não substitui cuidado clínico.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.3.2.1; Lei Federal nº 10.216/2001. Questão autoral Nortis.',
    21100
  )
)
insert into public.questions (
  product_id, syllabus_node_id, slug, statement, explanation,
  authorship, source_reference, diagnostic_eligible, sort_order, active
)
select product.id, subject.id, seed.question_slug, seed.statement,
       seed.explanation, 'Nortis Concursos', seed.source_reference,
       false, seed.sort_order, true
from practice_seed seed
join public.products product
  on product.slug = 'nexo-social-sedes-df-2026'
 and product.active = true
join public.syllabus_nodes specialty
  on specialty.product_id = product.id
 and specialty.slug = 'agente-social-200'
 and specialty.node_type = 'specialty'
join public.syllabus_nodes subject
  on subject.product_id = product.id
 and subject.parent_id = specialty.id
 and subject.slug = seed.subject_slug
 and subject.node_type = 'subject'
on conflict (slug) do update set
  product_id = excluded.product_id,
  syllabus_node_id = excluded.syllabus_node_id,
  statement = excluded.statement,
  explanation = excluded.explanation,
  authorship = excluded.authorship,
  source_reference = excluded.source_reference,
  diagnostic_eligible = excluded.diagnostic_eligible,
  sort_order = excluded.sort_order,
  active = excluded.active,
  updated_at = now();

with option_seed(question_slug, label, option_text, sort_order) as (values
  ('pratica-agente-social-prontuario-suas','A','Registrar apenas a demanda final, sem histórico, para acelerar a fila de atendimento.',10),
  ('pratica-agente-social-prontuario-suas','B','Produzir registro objetivo, datado e útil à continuidade do acompanhamento pela equipe.',20),
  ('pratica-agente-social-prontuario-suas','C','Evitar qualquer registro para impedir compartilhamento interno de informações.',30),
  ('pratica-agente-social-prontuario-suas','D','Substituir o acompanhamento técnico por relato informal em grupo de mensagem.',40),
  ('pratica-agente-social-beneficio-eventual-acompanhamento','A','Tratar a concessão como ato isolado, sem escuta ou avaliação familiar.',10),
  ('pratica-agente-social-beneficio-eventual-acompanhamento','B','Condicionar o benefício a contrapartida não prevista em regra pública.',20),
  ('pratica-agente-social-beneficio-eventual-acompanhamento','C','Articular a demanda ao acompanhamento e aos encaminhamentos necessários, quando cabíveis.',30),
  ('pratica-agente-social-beneficio-eventual-acompanhamento','D','Negar automaticamente o benefício sempre que a família já tiver cadastro anterior.',40),
  ('pratica-agente-social-creas-violacao-direitos','A','Expor o caso publicamente para obter apoio comunitário imediato.',10),
  ('pratica-agente-social-creas-violacao-direitos','B','Encaminhar com registro, sigilo e articulação com serviço/equipe especializada.',20),
  ('pratica-agente-social-creas-violacao-direitos','C','Resolver individualmente a situação sem acionar a rede especializada.',30),
  ('pratica-agente-social-creas-violacao-direitos','D','Aguardar confirmação judicial antes de qualquer providência protetiva.',40),
  ('pratica-agente-social-abordagem-nao-higienista','A','Atuar com coerção para remover pessoas do espaço público.',10),
  ('pratica-agente-social-abordagem-nao-higienista','B','Manter postura não higienista, construir vínculo e ofertar acesso à rede.',20),
  ('pratica-agente-social-abordagem-nao-higienista','C','Condicionar escuta social à saída imediata do local.',30),
  ('pratica-agente-social-abordagem-nao-higienista','D','Registrar a recusa como perda definitiva do direito de atendimento.',40),
  ('pratica-agente-social-crise-saude-mental-rede','A','Fazer diagnóstico clínico e definir medicação no próprio serviço socioassistencial.',10),
  ('pratica-agente-social-crise-saude-mental-rede','B','Acolher, reduzir riscos e articular a rede de saúde/atenção psicossocial quando necessário.',20),
  ('pratica-agente-social-crise-saude-mental-rede','C','Ignorar a situação por ser tema exclusivo da família.',30),
  ('pratica-agente-social-crise-saude-mental-rede','D','Exigir abstinência ou comportamento ideal como condição de atendimento.',40)
)
insert into public.question_options(question_id, label, option_text, sort_order)
select question.id, seed.label, seed.option_text, seed.sort_order
from option_seed seed
join public.questions question on question.slug = seed.question_slug
on conflict (question_id, label) do update set
  option_text = excluded.option_text,
  sort_order = excluded.sort_order;

with solution_seed(question_slug, correct_label) as (values
  ('pratica-agente-social-prontuario-suas','B'),
  ('pratica-agente-social-beneficio-eventual-acompanhamento','C'),
  ('pratica-agente-social-creas-violacao-direitos','B'),
  ('pratica-agente-social-abordagem-nao-higienista','B'),
  ('pratica-agente-social-crise-saude-mental-rede','B')
)
insert into public.question_solutions(question_id, correct_option_id)
select question.id, option.id
from solution_seed seed
join public.questions question on question.slug = seed.question_slug
join public.question_options option
  on option.question_id = question.id
 and option.label = seed.correct_label
on conflict (question_id) do update set
  correct_option_id = excluded.correct_option_id;

insert into public.simulations(
  product_id, slug, target_specialty_id, title, description,
  time_limit_minutes, active, sort_order
)
select product.id,
       'simulado-revisao-agente-social-10-questoes',
       specialty.id,
       'Simulado de revisão — Agente Social',
       'Dez questões autorais para revisar rede socioassistencial, proteção social, abordagem social e saúde mental. Resultado pedagógico, sem valor oficial.',
       20,
       true,
       20020
from public.products product
join public.syllabus_nodes specialty
  on specialty.product_id = product.id
 and specialty.slug = 'agente-social-200'
 and specialty.node_type = 'specialty'
where product.slug = 'nexo-social-sedes-df-2026'
  and product.active = true
on conflict (slug) where slug is not null do update set
  product_id = excluded.product_id,
  target_specialty_id = excluded.target_specialty_id,
  title = excluded.title,
  description = excluded.description,
  time_limit_minutes = excluded.time_limit_minutes,
  active = excluded.active,
  sort_order = excluded.sort_order;

with simulation_seed(question_slug, sort_order) as (values
  ('pratica-agente-social-referencia-contrarreferencia',10),
  ('pratica-agente-social-scfv-paif',20),
  ('pratica-agente-social-acolhimento-provisoriedade',30),
  ('pratica-agente-social-vinculo-autonomia',40),
  ('pratica-agente-social-reducao-danos-rede',50),
  ('pratica-agente-social-prontuario-suas',60),
  ('pratica-agente-social-beneficio-eventual-acompanhamento',70),
  ('pratica-agente-social-creas-violacao-direitos',80),
  ('pratica-agente-social-abordagem-nao-higienista',90),
  ('pratica-agente-social-crise-saude-mental-rede',100)
)
insert into public.simulation_questions(simulation_id, question_id, sort_order)
select simulation.id, question.id, seed.sort_order
from simulation_seed seed
join public.simulations simulation
  on simulation.slug = 'simulado-revisao-agente-social-10-questoes'
join public.questions question
  on question.slug = seed.question_slug
on conflict (simulation_id, question_id) do update set
  sort_order = excluded.sort_order;

with theme_seed(slug, title, prompt_text, source_reference, sort_order) as (values
  (
    'vulnerabilidade-risco-e-protecao-social',
    'Vulnerabilidade, risco e proteção social',
    'Analise a diferença entre vulnerabilidade social, risco pessoal/social e resposta protetiva no SUAS, indicando efeitos práticos para o trabalho territorial.',
    'Nortis Concursos — tema autoral de treino para SEDES-DF 2026, elaborado a partir dos eixos do edital. Não é previsão oficial da banca.',
    70
  ),
  (
    'abordagem-social-e-direitos-humanos',
    'Abordagem social e direitos humanos',
    'Discuta limites da abordagem social diante de pressões por retirada de pessoas em situação de rua, articulando autonomia, dignidade, vínculo e acesso à rede.',
    'Nortis Concursos — tema autoral de treino para SEDES-DF 2026, elaborado a partir dos eixos do edital. Não é previsão oficial da banca.',
    80
  ),
  (
    'saude-mental-reducao-de-danos-e-suas',
    'Saúde mental, redução de danos e SUAS',
    'Explique como a assistência social pode atuar com pessoas em sofrimento psíquico ou uso prejudicial de álcool e outras drogas sem substituir a rede de saúde.',
    'Nortis Concursos — tema autoral de treino para SEDES-DF 2026, elaborado a partir dos eixos do edital. Não é previsão oficial da banca.',
    90
  )
)
insert into public.essay_themes (
  product_id, syllabus_node_id, slug, title, prompt_text, source_reference,
  active, sort_order
)
select product.id, null, seed.slug, seed.title, seed.prompt_text, seed.source_reference,
       true, seed.sort_order
from theme_seed seed
join public.products product
  on product.slug = 'nexo-social-sedes-df-2026'
 and product.active = true
on conflict (slug) where slug is not null do update set
  title = excluded.title,
  prompt_text = excluded.prompt_text,
  source_reference = excluded.source_reference,
  active = excluded.active,
  sort_order = excluded.sort_order,
  updated_at = now();

do $guard$
declare
  v_question_count integer;
  v_theme_count integer;
  v_simulation_question_count integer;
begin
  select count(*) into v_question_count
  from public.questions
  where slug in (
    'pratica-agente-social-prontuario-suas',
    'pratica-agente-social-beneficio-eventual-acompanhamento',
    'pratica-agente-social-creas-violacao-direitos',
    'pratica-agente-social-abordagem-nao-higienista',
    'pratica-agente-social-crise-saude-mental-rede'
  );

  select count(*) into v_theme_count
  from public.essay_themes
  where slug in (
    'vulnerabilidade-risco-e-protecao-social',
    'abordagem-social-e-direitos-humanos',
    'saude-mental-reducao-de-danos-e-suas'
  )
    and active = true;

  select count(*) into v_simulation_question_count
  from public.simulation_questions link
  join public.simulations simulation on simulation.id = link.simulation_id
  where simulation.slug = 'simulado-revisao-agente-social-10-questoes';

  if v_question_count <> 5 then
    raise exception 'sedes_editorial_seed: esperava 5 questões extras, encontrou %.', v_question_count;
  end if;
  if v_theme_count <> 3 then
    raise exception 'sedes_editorial_seed: esperava 3 temas ativos extras, encontrou %.', v_theme_count;
  end if;
  if v_simulation_question_count <> 10 then
    raise exception 'sedes_editorial_seed: esperava simulado com 10 questões, encontrou %.', v_simulation_question_count;
  end if;
end;
$guard$;

comment on table public.lead_nurture_preferences is
  'Preferências explícitas de contato para nutrição de leads; não dispara comunicação externa por si só.';

comment on table public.lead_nurture_events is
  'Fila/log interno de nutrição. Envio externo depende de integração autorizada separadamente.';

comment on table public.student_ranking_preferences is
  'Opt-in para ranking nominal. Sem opt-in, o aluno permanece apenas em comparativos anônimos.';
