-- Diagnóstico objetivo reutiliza o banco de questões e mantém as respostas
-- corretas inacessíveis antes do registro de uma tentativa válida.
alter table public.questions
  add column slug text unique,
  add column authorship text not null default 'Nortis Concursos',
  add column source_reference text,
  add column diagnostic_eligible boolean not null default false,
  add constraint questions_authorship_not_blank check (btrim(authorship) <> ''),
  add constraint questions_diagnostic_source_required check (
    not diagnostic_eligible
    or (
      slug is not null
      and source_reference is not null
      and btrim(source_reference) <> ''
    )
  );

alter table public.question_attempts
  add column attempt_context text not null default 'practice'
    check (attempt_context in ('practice', 'diagnostic')),
  add column specialty_id uuid references public.syllabus_nodes(id) on delete set null,
  add constraint question_attempts_diagnostic_specialty check (
    (attempt_context = 'practice' and specialty_id is null)
    or (attempt_context = 'diagnostic' and specialty_id is not null)
  );

create unique index question_attempts_one_diagnostic_per_question_idx
  on public.question_attempts(user_id, question_id)
  where attempt_context = 'diagnostic';
create index question_attempts_user_context_idx
  on public.question_attempts(user_id, attempt_context, answered_at desc);
create index question_attempts_specialty_idx
  on public.question_attempts(specialty_id)
  where attempt_context = 'diagnostic';

drop policy if exists "questions_enrolled_read" on public.questions;
create policy "questions_enrolled_read" on public.questions
for select to authenticated using (
  active
  and exists (
    select 1
    from public.enrollments e
    where e.product_id = questions.product_id
      and e.user_id = (select auth.uid())
      and e.status = 'active'
      and (e.expires_at is null or e.expires_at > now())
  )
  and (
    not diagnostic_eligible
    or exists (
      select 1
      from public.student_study_profiles profile
      join public.syllabus_nodes subject
        on subject.id = questions.syllabus_node_id
       and subject.node_type = 'subject'
      where profile.user_id = (select auth.uid())
        and profile.target_specialty_id = subject.parent_id
    )
  )
);

drop policy if exists "question_attempts_self_read" on public.question_attempts;
create policy "question_attempts_self_read" on public.question_attempts
for select to authenticated using (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.questions question
    join public.enrollments enrollment
      on enrollment.product_id = question.product_id
     and enrollment.user_id = (select auth.uid())
     and enrollment.status = 'active'
     and (enrollment.expires_at is null or enrollment.expires_at > now())
    where question.id = question_attempts.question_id
      and (
        question_attempts.attempt_context = 'practice'
        or exists (
          select 1
          from public.student_study_profiles profile
          join public.syllabus_nodes subject
            on subject.id = question.syllabus_node_id
           and subject.node_type = 'subject'
          where profile.user_id = (select auth.uid())
            and profile.target_specialty_id = question_attempts.specialty_id
            and profile.target_specialty_id = subject.parent_id
        )
      )
  )
);

create or replace function public.submit_question_attempt(
  p_question_id uuid,
  p_selected_option_id uuid
)
returns table (attempt_id uuid, is_correct boolean, correct_option_id uuid, explanation text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_product_id uuid;
  v_correct_option_id uuid;
  v_explanation text;
  v_attempt_id uuid;
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;

  select q.product_id, q.explanation, solution.correct_option_id
    into v_product_id, v_explanation, v_correct_option_id
  from public.questions q
  join public.question_solutions solution on solution.question_id = q.id
  where q.id = p_question_id
    and q.active = true
    and q.diagnostic_eligible = false;

  if v_product_id is null then raise exception 'question_not_found'; end if;
  if not exists (
    select 1 from public.enrollments enrollment
    where enrollment.product_id = v_product_id
      and enrollment.user_id = v_user_id
      and enrollment.status = 'active'
      and (enrollment.expires_at is null or enrollment.expires_at > now())
  ) then raise exception 'access_denied'; end if;
  if not exists (
    select 1 from public.question_options option
    where option.id = p_selected_option_id
      and option.question_id = p_question_id
  ) then raise exception 'invalid_option'; end if;

  insert into public.question_attempts as attempt (
    user_id, question_id, selected_option_id, is_correct, attempt_context
  ) values (
    v_user_id, p_question_id, p_selected_option_id,
    p_selected_option_id = v_correct_option_id, 'practice'
  ) returning id into v_attempt_id;

  return query
  select v_attempt_id, p_selected_option_id = v_correct_option_id,
    v_correct_option_id, v_explanation;
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
  v_correct_option_id uuid;
  v_explanation text;
  v_attempt_id uuid;
  v_is_correct boolean;
  v_answered_at timestamptz;
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

  insert into public.question_attempts as attempt (
    user_id, question_id, selected_option_id, is_correct,
    attempt_context, specialty_id
  ) values (
    v_user_id, p_question_id, p_selected_option_id,
    p_selected_option_id = v_correct_option_id,
    'diagnostic', v_specialty_id
  )
  on conflict (user_id, question_id)
    where attempt_context = 'diagnostic'
  do nothing
  returning attempt.id, attempt.is_correct, attempt.answered_at
    into v_attempt_id, v_is_correct, v_answered_at;

  if v_attempt_id is null then
    select attempt.id, attempt.is_correct, attempt.answered_at
      into v_attempt_id, v_is_correct, v_answered_at
    from public.question_attempts attempt
    where attempt.user_id = v_user_id
      and attempt.question_id = p_question_id
      and attempt.attempt_context = 'diagnostic';
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
  join public.questions question on question.id = attempt.question_id
  join public.question_solutions solution on solution.question_id = question.id
  join public.enrollments enrollment
    on enrollment.product_id = question.product_id
   and enrollment.user_id = (select auth.uid())
   and enrollment.status = 'active'
   and (enrollment.expires_at is null or enrollment.expires_at > now())
  join public.student_study_profiles profile
    on profile.user_id = (select auth.uid())
   and profile.target_specialty_id = attempt.specialty_id
  join public.syllabus_nodes subject
    on subject.id = question.syllabus_node_id
   and subject.node_type = 'subject'
   and subject.parent_id = profile.target_specialty_id
  where attempt.user_id = (select auth.uid())
    and attempt.attempt_context = 'diagnostic'
  order by attempt.answered_at;
$$;

revoke all on function public.submit_question_attempt(uuid, uuid) from public, anon;
revoke all on function public.submit_diagnostic_answer(uuid, uuid) from public, anon;
revoke all on function public.get_my_diagnostic_results() from public, anon;
grant execute on function public.submit_question_attempt(uuid, uuid) to authenticated;
grant execute on function public.submit_diagnostic_answer(uuid, uuid) to authenticated;
grant execute on function public.get_my_diagnostic_results() to authenticated;

insert into public.learning_modules (
  slug, title, description, module_type, route_path, sort_order
) values (
  'diagnostico-objetivo',
  'Diagnóstico objetivo',
  'Compare sua autopercepção com evidências obtidas em questões autorais da Nortis.',
  'questions',
  '/minha-conta/diagnostico',
  25
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  module_type = excluded.module_type,
  route_path = excluded.route_path,
  sort_order = excluded.sort_order;

insert into public.product_modules (product_id, module_id, sort_order)
select product.id, module.id, 25
from public.products product
join public.learning_modules module on module.slug = 'diagnostico-objetivo'
where product.slug = 'nexo-social-sedes-df-2026'
  and product.active = true
on conflict (product_id, module_id) do nothing;

with diagnostic_seed(
  subject_slug, question_slug, statement, explanation, source_reference, sort_order
) as (values
  (
    '1-rede-socioassistencial-e-trabalho-no-territorio',
    'diagnostico-agente-social-cras-creas',
    'Uma família procura atendimento preventivo para fortalecer vínculos e acessar direitos, sem relato de violação já ocorrida. Qual é a unidade de referência mais adequada no SUAS?',
    'O CRAS é a unidade de referência da Proteção Social Básica e atua preventivamente no território. O CREAS atende situações que demandam proteção social especial, especialmente quando há violação de direitos.',
    'Edital SEDES-DF nº 1/2026, item 20.2.3.2.1, subitem 1; orientações oficiais do MDS sobre CRAS e CREAS. Questão autoral Nortis.',
    20010
  ),
  (
    '2-protecao-social-basica-e-trabalho-com-familias-e-comunidades',
    'diagnostico-agente-social-paif',
    'Qual alternativa descreve corretamente a atuação do Serviço de Proteção e Atendimento Integral à Família (PAIF)?',
    'O PAIF realiza trabalho social continuado com famílias, é ofertado no CRAS e busca fortalecer a função protetiva, prevenir rupturas de vínculos e ampliar o acesso a direitos.',
    'Edital SEDES-DF nº 1/2026, item 20.2.3.2.1, subitem 2; Resolução CNAS nº 109/2009. Questão autoral Nortis.',
    20020
  ),
  (
    '3-protecao-social-especial-media-e-alta-complexidade',
    'diagnostico-agente-social-media-complexidade',
    'Uma pessoa vivencia violação de direitos, mas seus vínculos familiares e comunitários permanecem preservados. Em qual nível e unidade de referência deve ocorrer o acompanhamento especializado?',
    'Situações de violação de direitos com vínculos ainda preservados são atendidas pela Proteção Social Especial de Média Complexidade, tendo o CREAS como unidade de referência.',
    'Edital SEDES-DF nº 1/2026, item 20.2.3.2.1, subitem 3; Resolução CNAS nº 109/2009 e orientações oficiais do MDS sobre o CREAS. Questão autoral Nortis.',
    20030
  ),
  (
    '4-abordagem-social-e-populacao-em-situacao-de-rua',
    'diagnostico-agente-social-abordagem-rua',
    'Durante uma abordagem a uma pessoa em situação de rua, qual conduta está alinhada ao Decreto nº 7.053/2009?',
    'A Política Nacional para a População em Situação de Rua prevê respeito à dignidade, atendimento humanizado e articulação das políticas públicas. A abordagem deve reconhecer diferenças e evitar práticas coercitivas ou discriminatórias.',
    'Edital SEDES-DF nº 1/2026, item 20.2.3.2.1, subitem 4; Decreto nº 7.053/2009, arts. 5º e 6º. Questão autoral Nortis.',
    20040
  ),
  (
    '5-nocoes-de-saude-mental-e-uso-de-alcool-e-outras-drogas',
    'diagnostico-agente-social-saude-mental',
    'Ao atender uma pessoa em sofrimento psíquico e com uso problemático de álcool, qual postura é pedagogicamente adequada ao conteúdo previsto no edital?',
    'O edital orienta abordagem humanizada e não estigmatizante, noções de redução de danos e articulação com a rede de saúde e atenção psicossocial.',
    'Edital SEDES-DF nº 1/2026, item 20.2.3.2.1, subitem 5. Questão autoral Nortis.',
    20050
  )
)
insert into public.questions (
  product_id, syllabus_node_id, slug, statement, explanation,
  authorship, source_reference, diagnostic_eligible, sort_order, active
)
select product.id, subject.id, seed.question_slug, seed.statement,
       seed.explanation, 'Nortis Concursos', seed.source_reference,
       true, seed.sort_order, true
from diagnostic_seed seed
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
  ('diagnostico-agente-social-cras-creas','A','CRAS, por integrar a Proteção Social Básica e atuar preventivamente no território.',10),
  ('diagnostico-agente-social-cras-creas','B','CREAS, porque todo atendimento familiar começa obrigatoriamente na Proteção Social Especial.',20),
  ('diagnostico-agente-social-cras-creas','C','Unidade de acolhimento, porque o fortalecimento de vínculos exige afastamento temporário da família.',30),
  ('diagnostico-agente-social-cras-creas','D','Conselho Tutelar, independentemente da presença de criança ou adolescente.',40),
  ('diagnostico-agente-social-paif','A','Acolhimento institucional permanente de famílias sem avaliação territorial.',10),
  ('diagnostico-agente-social-paif','B','Trabalho social continuado com famílias, ofertado no CRAS, para fortalecer sua função protetiva e prevenir rupturas.',20),
  ('diagnostico-agente-social-paif','C','Investigação judicial de violações de direitos realizada exclusivamente pelo CREAS.',30),
  ('diagnostico-agente-social-paif','D','Concessão automática de benefício financeiro, sem acompanhamento familiar.',40),
  ('diagnostico-agente-social-media-complexidade','A','Proteção Social Básica no CRAS.',10),
  ('diagnostico-agente-social-media-complexidade','B','Proteção Social Especial de Média Complexidade no CREAS.',20),
  ('diagnostico-agente-social-media-complexidade','C','Proteção Social Especial de Alta Complexidade em acolhimento institucional.',30),
  ('diagnostico-agente-social-media-complexidade','D','Atendimento exclusivamente policial, sem articulação socioassistencial.',40),
  ('diagnostico-agente-social-abordagem-rua','A','Condicionar qualquer atendimento à saída imediata do espaço público.',10),
  ('diagnostico-agente-social-abordagem-rua','B','Padronizar o atendimento e desconsiderar diferenças individuais para acelerar o fluxo.',20),
  ('diagnostico-agente-social-abordagem-rua','C','Realizar atendimento humanizado, respeitar a dignidade e articular as políticas públicas necessárias.',30),
  ('diagnostico-agente-social-abordagem-rua','D','Restringir a abordagem à retirada compulsória de pertences.',40),
  ('diagnostico-agente-social-saude-mental','A','Adotar linguagem moralizante para estimular mudança imediata de comportamento.',10),
  ('diagnostico-agente-social-saude-mental','B','Evitar a rede de saúde para manter o caso exclusivamente na assistência social.',20),
  ('diagnostico-agente-social-saude-mental','C','Aplicar uma resposta padronizada, sem considerar sofrimento psíquico ou vulnerabilidade.',30),
  ('diagnostico-agente-social-saude-mental','D','Acolher sem estigmatizar, considerar redução de danos e articular a rede de atenção psicossocial.',40)
)
insert into public.question_options(question_id, label, option_text, sort_order)
select question.id, seed.label, seed.option_text, seed.sort_order
from option_seed seed
join public.questions question on question.slug = seed.question_slug
on conflict (question_id, label) do update set
  option_text = excluded.option_text,
  sort_order = excluded.sort_order;

with solution_seed(question_slug, correct_label) as (values
  ('diagnostico-agente-social-cras-creas','A'),
  ('diagnostico-agente-social-paif','B'),
  ('diagnostico-agente-social-media-complexidade','B'),
  ('diagnostico-agente-social-abordagem-rua','C'),
  ('diagnostico-agente-social-saude-mental','D')
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
