alter table public.simulations
  add column if not exists slug text,
  add column if not exists target_specialty_id uuid
    references public.syllabus_nodes(id) on delete set null;

create unique index if not exists simulations_slug_uidx
  on public.simulations(slug)
  where slug is not null;

create index if not exists simulations_product_specialty_sort_idx
  on public.simulations(product_id, target_specialty_id, sort_order);

drop policy if exists "simulations_enrolled_read" on public.simulations;

create policy "simulations_enrolled_read"
on public.simulations for select
to authenticated
using (
  active
  and exists (
    select 1
    from public.enrollments enrollment
    where enrollment.product_id = simulations.product_id
      and enrollment.user_id = (select auth.uid())
      and enrollment.status = 'active'
      and (enrollment.expires_at is null or enrollment.expires_at > now())
  )
  and (
    target_specialty_id is null
    or exists (
      select 1
      from public.student_study_profiles profile
      where profile.user_id = (select auth.uid())
        and profile.target_specialty_id = simulations.target_specialty_id
    )
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
  v_target_specialty_id uuid;
  v_session_id uuid;
begin
  if v_user_id is null then raise exception 'authentication_required'; end if;

  select simulation.product_id, simulation.target_specialty_id
    into v_product_id, v_target_specialty_id
  from public.simulations simulation
  where simulation.id = p_simulation_id
    and simulation.active = true;

  if v_product_id is null then raise exception 'simulation_not_found'; end if;
  if not exists (
    select 1
    from public.enrollments enrollment
    where enrollment.product_id = v_product_id
      and enrollment.user_id = v_user_id
      and enrollment.status = 'active'
      and (enrollment.expires_at is null or enrollment.expires_at > now())
  ) then raise exception 'access_denied'; end if;

  if v_target_specialty_id is not null and not exists (
    select 1
    from public.student_study_profiles profile
    where profile.user_id = v_user_id
      and profile.target_specialty_id = v_target_specialty_id
  ) then raise exception 'specialty_mismatch'; end if;

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

revoke all on function public.start_simulation(uuid) from public, anon;
grant execute on function public.start_simulation(uuid) to authenticated;

with practice_seed(
  subject_slug, question_slug, statement, explanation, source_reference, sort_order
) as (values
  (
    '1-rede-socioassistencial-e-trabalho-no-territorio',
    'pratica-agente-social-referencia-contrarreferencia',
    'Durante o acompanhamento de uma família pelo CRAS, surge uma demanda de saúde que exige atendimento em outra política pública. Qual encaminhamento preserva melhor a continuidade do trabalho socioassistencial?',
    'O encaminhamento responsável articula a rede, registra a providência e mantém o acompanhamento, utilizando referência e contrarreferência para que o atendimento não se transforme em simples transferência de responsabilidade.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.3.2.1, subitem 1; Ministério do Desenvolvimento Social, Orientações Técnicas: Centro de Referência de Assistência Social — CRAS, 2009. Questão autoral Nortis.',
    21010
  ),
  (
    '2-protecao-social-basica-e-trabalho-com-familias-e-comunidades',
    'pratica-agente-social-scfv-paif',
    'Uma equipe pretende organizar encontros coletivos para prevenir isolamento e fortalecer vínculos entre usuários de diferentes faixas etárias. Como o SCFV deve se relacionar com o trabalho social com famílias?',
    'O Serviço de Convivência e Fortalecimento de Vínculos integra a Proteção Social Básica, possui caráter preventivo e complementa o trabalho social com famílias realizado pelo PAIF, sem substituí-lo.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.3.2.1, subitem 2; Resolução CNAS nº 109/2009, Tipificação Nacional dos Serviços Socioassistenciais. Questão autoral Nortis.',
    21020
  ),
  (
    '3-protecao-social-especial-media-e-alta-complexidade',
    'pratica-agente-social-acolhimento-provisoriedade',
    'Ao acompanhar o ingresso de uma pessoa em serviço de acolhimento, qual diretriz deve orientar a atuação da equipe?',
    'Os serviços de acolhimento integram a Proteção Social Especial de Alta Complexidade. A proteção integral não transforma o acolhimento em solução permanente: devem ser preservados vínculos e buscadas alternativas que respeitem sua excepcionalidade e provisoriedade.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.3.2.1, subitem 3; Resolução CNAS nº 109/2009 e Orientações Técnicas oficiais para Serviços de Acolhimento. Questão autoral Nortis.',
    21030
  ),
  (
    '4-abordagem-social-e-populacao-em-situacao-de-rua',
    'pratica-agente-social-vinculo-autonomia',
    'Uma pessoa em situação de rua recusa, naquele momento, o encaminhamento sugerido pela equipe de abordagem social. Qual conduta é compatível com a política nacional?',
    'A abordagem deve respeitar dignidade e autonomia, evitar coerção e manter a possibilidade de construção gradual de vínculo e acesso à rede. A recusa imediata não autoriza tratamento discriminatório nem retirada forçada.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.3.2.1, subitem 4; Decreto Federal nº 7.053/2009, arts. 5º e 6º. Questão autoral Nortis.',
    21040
  ),
  (
    '5-nocoes-de-saude-mental-e-uso-de-alcool-e-outras-drogas',
    'pratica-agente-social-reducao-danos-rede',
    'No atendimento a uma pessoa em vulnerabilidade social que relata uso prejudicial de álcool, qual ação está alinhada a uma abordagem humanizada e de redução de danos?',
    'A atuação socioassistencial deve acolher sem estigma, considerar estratégias de redução de danos e articular a rede de saúde e atenção psicossocial, respeitando direitos e singularidades em vez de condicionar todo apoio à abstinência imediata.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.3.2.1, subitem 5; Lei Federal nº 10.216/2001 e orientações institucionais do Ministério da Saúde sobre cuidado em saúde mental e álcool e outras drogas. Questão autoral Nortis.',
    21050
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
  ('pratica-agente-social-referencia-contrarreferencia','A','Encerrar o acompanhamento do CRAS assim que o endereço do serviço de saúde for informado.',10),
  ('pratica-agente-social-referencia-contrarreferencia','B','Articular o encaminhamento, registrar a providência e acompanhar o retorno da rede por referência e contrarreferência.',20),
  ('pratica-agente-social-referencia-contrarreferencia','C','Aguardar que a família resolva sozinha a demanda para evitar sobreposição entre políticas públicas.',30),
  ('pratica-agente-social-referencia-contrarreferencia','D','Transferir todos os dados da família sem avaliar necessidade, finalidade ou consentimento.',40),
  ('pratica-agente-social-scfv-paif','A','Substituir integralmente o PAIF, pois atividades coletivas dispensam acompanhamento familiar.',10),
  ('pratica-agente-social-scfv-paif','B','Atuar apenas depois de uma violação de direitos confirmada e por determinação judicial.',20),
  ('pratica-agente-social-scfv-paif','C','Complementar o PAIF com atividades preventivas em grupo voltadas à convivência e ao fortalecimento de vínculos.',30),
  ('pratica-agente-social-scfv-paif','D','Restringir-se à entrega de benefícios eventuais, sem planejamento de atividades coletivas.',40),
  ('pratica-agente-social-acolhimento-provisoriedade','A','Manter o acolhimento por tempo indeterminado para evitar qualquer mudança posterior.',10),
  ('pratica-agente-social-acolhimento-provisoriedade','B','Preservar vínculos e trabalhar alternativas, reconhecendo o caráter excepcional e provisório do acolhimento.',20),
  ('pratica-agente-social-acolhimento-provisoriedade','C','Interromper contatos familiares automaticamente no momento do ingresso.',30),
  ('pratica-agente-social-acolhimento-provisoriedade','D','Tratar o acolhimento como serviço da Proteção Social Básica destinado a qualquer demanda preventiva.',40),
  ('pratica-agente-social-vinculo-autonomia','A','Condicionar qualquer nova escuta à aceitação imediata do encaminhamento.',10),
  ('pratica-agente-social-vinculo-autonomia','B','Respeitar a decisão, manter abordagem não coercitiva e continuar disponível para construir vínculo e acesso à rede.',20),
  ('pratica-agente-social-vinculo-autonomia','C','Solicitar retirada compulsória da pessoa e de seus pertences do espaço público.',30),
  ('pratica-agente-social-vinculo-autonomia','D','Encerrar definitivamente o atendimento, pois a recusa elimina o direito a nova abordagem.',40),
  ('pratica-agente-social-reducao-danos-rede','A','Exigir abstinência imediata como condição para qualquer atendimento socioassistencial.',10),
  ('pratica-agente-social-reducao-danos-rede','B','Acolher sem estigma, pactuar estratégias possíveis de redução de danos e articular a rede de atenção psicossocial.',20),
  ('pratica-agente-social-reducao-danos-rede','C','Manter o caso exclusivamente na assistência social para evitar contato com serviços de saúde.',30),
  ('pratica-agente-social-reducao-danos-rede','D','Aplicar a mesma resposta a todos os usuários, independentemente de contexto e singularidades.',40)
)
insert into public.question_options(question_id, label, option_text, sort_order)
select question.id, seed.label, seed.option_text, seed.sort_order
from option_seed seed
join public.questions question on question.slug = seed.question_slug
on conflict (question_id, label) do update set
  option_text = excluded.option_text,
  sort_order = excluded.sort_order;

with solution_seed(question_slug, correct_label) as (values
  ('pratica-agente-social-referencia-contrarreferencia','B'),
  ('pratica-agente-social-scfv-paif','C'),
  ('pratica-agente-social-acolhimento-provisoriedade','B'),
  ('pratica-agente-social-vinculo-autonomia','B'),
  ('pratica-agente-social-reducao-danos-rede','B')
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
       'simulado-piloto-agente-social',
       specialty.id,
       'Simulado piloto — Agente Social',
       'Cinco questões autorais da Nortis, uma por bloco específico do edital. Resultado pedagógico, sem equivalência com nota oficial.',
       10,
       true,
       20010
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
  ('pratica-agente-social-reducao-danos-rede',50)
)
insert into public.simulation_questions(simulation_id, question_id, sort_order)
select simulation.id, question.id, seed.sort_order
from simulation_seed seed
join public.simulations simulation
  on simulation.slug = 'simulado-piloto-agente-social'
join public.questions question
  on question.slug = seed.question_slug
on conflict (simulation_id, question_id) do update set
  sort_order = excluded.sort_order;
