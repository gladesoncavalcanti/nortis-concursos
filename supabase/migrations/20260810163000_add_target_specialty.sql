alter table public.student_study_profiles
  add column target_specialty_id uuid references public.syllabus_nodes(id) on delete set null;
create index student_study_profiles_target_specialty_idx
  on public.student_study_profiles(target_specialty_id);
revoke all on public.student_study_profiles from anon;
revoke all on public.student_study_profiles from authenticated;
grant select, insert, update on public.student_study_profiles to authenticated;

with specialty_seed(role_slug,slug,title,description,sort_order) as (values
  ('tdas','agente-social-200','Agente Social','Cargo 200 - conteúdo específico do item 20.2.3.2.1 do edital oficial.',200),
  ('tdas','cuidador-social-201','Cuidador Social','Cargo 201 - conteúdo específico do item 20.2.3.2.2 do edital oficial.',201),
  ('tdas','tecnico-administrativo-202','Técnico Administrativo','Cargo 202 - conteúdo específico do item 20.2.3.2.3 do edital oficial.',202),
  ('edas','administracao-400','Administração','Cargo 400 - conteúdo específico do item 20.2.4.2.1 do edital oficial.',400),
  ('edas','ciencias-contabeis-401','Ciências Contábeis','Cargo 401 - conteúdo específico do item 20.2.4.2.2 do edital oficial.',401),
  ('edas','comunicacao-social-402','Comunicação Social','Cargo 402 - conteúdo específico do item 20.2.4.2.3 do edital oficial.',402),
  ('edas','direito-e-legislacao-403','Direito e Legislação','Cargo 403 - conteúdo específico do item 20.2.4.2.4 do edital oficial.',403),
  ('edas','economia-404','Economia','Cargo 404 - conteúdo específico do item 20.2.4.2.5 do edital oficial.',404),
  ('edas','educador-social-405','Educador Social','Cargo 405 - conteúdo específico do item 20.2.4.2.6 do edital oficial.',405),
  ('edas','estatistica-406','Estatística','Cargo 406 - conteúdo específico do item 20.2.4.2.7 do edital oficial.',406),
  ('edas','nutricao-407','Nutrição','Cargo 407 - conteúdo específico do item 20.2.4.2.8 do edital oficial.',407),
  ('edas','pedagogia-408','Pedagogia','Cargo 408 - conteúdo específico do item 20.2.4.2.9 do edital oficial.',408),
  ('edas','psicologia-409','Psicologia','Cargo 409 - conteúdo específico do item 20.2.4.2.10 do edital oficial.',409),
  ('edas','servico-social-410','Serviço Social','Cargo 410 - conteúdo específico do item 20.2.4.2.11 do edital oficial.',410),
  ('edas','sociologia-411','Sociologia','Cargo 411 - conteúdo específico do item 20.2.4.2.12 do edital oficial.',411)
) insert into public.syllabus_nodes(product_id,parent_id,node_type,slug,title,description,sort_order)
select p.id, root.id, 'specialty', seed.slug, seed.title, seed.description, seed.sort_order
from specialty_seed seed
join public.products p on p.slug='nexo-social-sedes-df-2026' and p.active=true
join public.syllabus_nodes root on root.product_id=p.id and root.parent_id is null and root.slug=seed.role_slug
on conflict do nothing;

create function public.validate_study_profile_specialty()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  specialty_type text;
  role_slug text;
begin
  if new.target_specialty_id is null then
    return new;
  end if;

  select specialty.node_type, role_node.slug
    into specialty_type, role_slug
  from public.syllabus_nodes specialty
  join public.syllabus_nodes role_node on role_node.id = specialty.parent_id
  where specialty.id = new.target_specialty_id;

  if specialty_type is distinct from 'specialty'
     or (new.target_role = 'tecnico' and role_slug is distinct from 'tdas')
     or (new.target_role = 'superior' and role_slug is distinct from 'edas') then
    raise exception 'Especialidade incompatível com o perfil de estudo.';
  end if;

  return new;
end;
$$;

revoke all on function public.validate_study_profile_specialty() from public;
revoke all on function public.validate_study_profile_specialty() from anon;
revoke all on function public.validate_study_profile_specialty() from authenticated;

create trigger validate_study_profile_specialty_before_write
before insert or update of target_role, target_specialty_id
on public.student_study_profiles
for each row execute function public.validate_study_profile_specialty();

