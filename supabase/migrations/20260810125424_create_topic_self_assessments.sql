create table public.student_topic_assessments (
  user_id uuid not null references auth.users(id) on delete cascade,
  syllabus_node_id uuid not null references public.syllabus_nodes(id) on delete cascade,
  confidence smallint not null check (confidence between 1 and 5),
  updated_at timestamptz not null default now(),
  primary key (user_id, syllabus_node_id)
);
alter table public.student_topic_assessments enable row level security;
create policy "topic_assessments_self_read" on public.student_topic_assessments for select to authenticated using (user_id = (select auth.uid()));
create policy "topic_assessments_enrolled_insert" on public.student_topic_assessments for insert to authenticated with check (user_id = (select auth.uid()) and exists (select 1 from public.syllabus_nodes s join public.enrollments e on e.product_id=s.product_id where s.id=syllabus_node_id and e.user_id=(select auth.uid()) and e.status='active' and (e.expires_at is null or e.expires_at>now())));
create policy "topic_assessments_enrolled_update" on public.student_topic_assessments for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()) and exists (select 1 from public.syllabus_nodes s join public.enrollments e on e.product_id=s.product_id where s.id=syllabus_node_id and e.user_id=(select auth.uid()) and e.status='active' and (e.expires_at is null or e.expires_at>now())));
revoke all on public.student_topic_assessments from anon;
revoke all on public.student_topic_assessments from authenticated;
grant select,insert,update on public.student_topic_assessments to authenticated;

do $$
declare product_uuid uuid; tdas_uuid uuid; edas_uuid uuid;
begin
 select id into product_uuid from public.products where slug='nexo-social-sedes-df-2026' and active=true;
 if product_uuid is null then return; end if;
 insert into public.syllabus_nodes(product_id,node_type,slug,title,description,sort_order) values
 (product_uuid,'position','tdas','TDAS — Técnico em Desenvolvimento e Assistência Social','Conteúdos comuns do cargo TDAS previstos no item 20.2 do edital oficial.',10),
 (product_uuid,'position','edas','EDAS — Especialista em Desenvolvimento e Assistência Social','Conteúdos comuns do cargo EDAS previstos no item 20.2 do edital oficial.',20) on conflict do nothing;
 select id into tdas_uuid from public.syllabus_nodes where product_id=product_uuid and parent_id is null and slug='tdas';
 select id into edas_uuid from public.syllabus_nodes where product_id=product_uuid and parent_id is null and slug='edas';
 insert into public.syllabus_nodes(product_id,parent_id,node_type,slug,title,description,sort_order) values
 (product_uuid,tdas_uuid,'subject','lingua-portuguesa','Língua Portuguesa','Conhecimentos gerais para todos os cargos — item 20.2.2.1.',10),
 (product_uuid,tdas_uuid,'subject','df-politica-legislacao-primeiros-socorros','Distrito Federal, política para mulheres, legislação e primeiros socorros','Conhecimentos gerais para todos os cargos — item 20.2.2.2.',20),
 (product_uuid,tdas_uuid,'subject','fundamentos-suas','Fundamentos, organização, gestão e marcos operacionais do SUAS','Conhecimentos específicos comuns às especialidades TDAS — item 20.2.3.1.1.',30),
 (product_uuid,tdas_uuid,'subject','programas-beneficios-df','Programas, benefícios e instrumentos socioassistenciais do Distrito Federal','Conhecimentos específicos comuns às especialidades TDAS — item 20.2.3.1.2.',40),
 (product_uuid,edas_uuid,'subject','lingua-portuguesa','Língua Portuguesa','Conhecimentos gerais para todos os cargos — item 20.2.2.1.',10),
 (product_uuid,edas_uuid,'subject','df-politica-legislacao-primeiros-socorros','Distrito Federal, política para mulheres, legislação e primeiros socorros','Conhecimentos gerais para todos os cargos — item 20.2.2.2.',20),
 (product_uuid,edas_uuid,'subject','fundamentos-suas','Fundamentos, organização, gestão e marcos normativos da assistência social','Conhecimentos específicos comuns às especialidades EDAS — item 20.2.4.1.1.',30),
 (product_uuid,edas_uuid,'subject','direitos-vulnerabilidades','Direitos, violações de direitos e vulnerabilidades sociais','Conhecimentos específicos comuns às especialidades EDAS — item 20.2.4.1.2.',40),
 (product_uuid,edas_uuid,'subject','programas-beneficios-df','Programas, benefícios e instrumentos socioassistenciais do Distrito Federal','Conhecimentos específicos comuns às especialidades EDAS — item 20.2.4.1.3.',50) on conflict do nothing;
end $$;
