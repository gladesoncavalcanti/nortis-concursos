-- Nortis Concursos — suite de conclusão da experiência do aluno.
--
-- Escopo:
-- - favoritos de questões;
-- - marcação pedagógica de materiais;
-- - snapshots futuros de ranking opt-in;
-- - base auditável para ações de nutrição sem disparo externo automático.
--
-- Esta migration não altera fluxos comerciais, funções de borda, secrets,
-- dependências ou configurações de produção.

create table if not exists public.question_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create index if not exists question_favorites_question_idx
  on public.question_favorites(question_id);

alter table public.question_favorites enable row level security;

drop policy if exists "question_favorites_self_read" on public.question_favorites;
create policy "question_favorites_self_read"
on public.question_favorites for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "question_favorites_self_insert" on public.question_favorites;
create policy "question_favorites_self_insert"
on public.question_favorites for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "question_favorites_self_delete" on public.question_favorites;
create policy "question_favorites_self_delete"
on public.question_favorites for delete
to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.question_favorites from anon, authenticated;
grant select, insert, delete on public.question_favorites to authenticated;

create table if not exists public.student_material_marks (
  user_id uuid not null references auth.users(id) on delete cascade,
  material_key text not null check (material_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  status text not null default 'reviewed' check (status in ('reviewed', 'favorite')),
  updated_at timestamptz not null default now(),
  primary key (user_id, material_key)
);

alter table public.student_material_marks enable row level security;

drop policy if exists "student_material_marks_self_read" on public.student_material_marks;
create policy "student_material_marks_self_read"
on public.student_material_marks for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "student_material_marks_self_insert" on public.student_material_marks;
create policy "student_material_marks_self_insert"
on public.student_material_marks for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "student_material_marks_self_update" on public.student_material_marks;
create policy "student_material_marks_self_update"
on public.student_material_marks for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "student_material_marks_self_delete" on public.student_material_marks;
create policy "student_material_marks_self_delete"
on public.student_material_marks for delete
to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.student_material_marks from anon, authenticated;
grant select, insert, update, delete on public.student_material_marks to authenticated;

create table if not exists public.student_leaderboard_snapshots (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  scope_type text not null check (scope_type in ('weekly', 'subject', 'simulation', 'specialty')),
  scope_key text not null check (btrim(scope_key) <> ''),
  generated_at timestamptz not null default now(),
  participant_count integer not null check (participant_count >= 0),
  payload jsonb not null default '[]'::jsonb
);

create index if not exists student_leaderboard_snapshots_scope_idx
  on public.student_leaderboard_snapshots(product_id, scope_type, scope_key, generated_at desc);

alter table public.student_leaderboard_snapshots enable row level security;

drop policy if exists "student_leaderboard_snapshots_admin_read" on public.student_leaderboard_snapshots;
create policy "student_leaderboard_snapshots_admin_read"
on public.student_leaderboard_snapshots for select
to authenticated
using (
  exists (
    select 1
    from public.profiles profile
    where profile.id = (select auth.uid())
      and profile.role = 'admin'
  )
);

revoke all on public.student_leaderboard_snapshots from anon, authenticated;
grant select on public.student_leaderboard_snapshots to authenticated;

create table if not exists public.lead_nurture_campaign_steps (
  id uuid primary key default gen_random_uuid(),
  contest_slug text not null check (contest_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  step_key text not null check (step_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  channel text not null check (channel in ('email', 'whatsapp', 'internal')),
  title text not null check (btrim(title) <> ''),
  template_summary text not null check (btrim(template_summary) <> ''),
  cta_label text,
  cta_path text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (contest_slug, step_key, channel)
);

alter table public.lead_nurture_campaign_steps enable row level security;

drop policy if exists "lead_nurture_campaign_steps_admin_read" on public.lead_nurture_campaign_steps;
create policy "lead_nurture_campaign_steps_admin_read"
on public.lead_nurture_campaign_steps for select
to authenticated
using (
  exists (
    select 1
    from public.profiles profile
    where profile.id = (select auth.uid())
      and profile.role = 'admin'
  )
);

revoke all on public.lead_nurture_campaign_steps from anon, authenticated;
grant select on public.lead_nurture_campaign_steps to authenticated;

with steps(contest_slug, step_key, channel, title, template_summary, cta_label, cta_path, sort_order) as (values
  ('sedes-df-2026','boas-vindas','email','Boas-vindas SEDES-DF','Orientar cadastro, login, acesso gratuito provisório, escolha de especialidade e primeiro diagnóstico.','Começar na Central','/minha-conta/onboarding',10),
  ('sedes-df-2026','diagnostico-pendente','email','Diagnóstico pendente','Reforçar que o diagnóstico organiza plano, questões e revisão sem virar nota oficial.','Iniciar diagnóstico','/minha-conta/diagnostico',20),
  ('sedes-df-2026','simulado-semanal','email','Simulado semanal','Convidar para simulado e revisão pós-prova por bloco, sem promessa de resultado.','Abrir simulados','/minha-conta/simulados',30),
  ('sedes-df-2026','biblioteca-premium','internal','Biblioteca premium','Apresentar apostila, mapas, resumos, discursiva, questões, simulados e flashcards organizados por especialidade.','Ver biblioteca','/minha-conta/biblioteca',40),
  ('sedes-df-2026','reativacao-7-dias','whatsapp','Reativação com opt-in','Mensagem curta para aluno opt-in sem atividade recente, direcionando para revisão inteligente.','Revisar agora','/minha-conta/progresso',50)
)
insert into public.lead_nurture_campaign_steps (
  contest_slug, step_key, channel, title, template_summary,
  cta_label, cta_path, sort_order
)
select contest_slug, step_key, channel, title, template_summary, cta_label, cta_path, sort_order
from steps
on conflict (contest_slug, step_key, channel) do update set
  title = excluded.title,
  template_summary = excluded.template_summary,
  cta_label = excluded.cta_label,
  cta_path = excluded.cta_path,
  sort_order = excluded.sort_order,
  active = true,
  updated_at = now();

comment on table public.question_favorites is
  'Favoritos de questões por aluno para revisão dirigida. RLS limita leitura/escrita ao próprio usuário.';

comment on table public.student_material_marks is
  'Marcação individual de materiais estudados/favoritos, sem transformar leitura em nota de desempenho.';

comment on table public.student_leaderboard_snapshots is
  'Snapshots administrativos de ranking opt-in. Não expõe ranking diretamente ao aluno.';

comment on table public.lead_nurture_campaign_steps is
  'Playbook interno de nutrição. Não envia e-mail ou WhatsApp automaticamente.';
