-- Fundacao tecnica do fluxo discursivo do Tutor Nortis (schema minimo).
--
-- Cria APENAS estrutura: nenhum tema pedagogico oficial e inserido aqui
-- (nenhum INSERT nesta migration). O motor de correcao por IA (Rubrica,
-- Taxonomia, Contrato Pedagogico, Espelho, Casos de Calibracao, DLP,
-- Contrato JSON, Prompt Consolidado) NAO e implementado nesta migration
-- e NAO deve ser inventado aqui — os estados de public.essay_submissions
-- sao deliberadamente neutros (draft/submitted/processing/corrected/
-- failed) para nao impor "correcao humana" nem qualquer arquitetura de
-- correcao como requisito estrutural.
--
-- Reutiliza os mesmos padroes ja maduros do projeto:
--   - conteudo por produto com RLS "enrolled_read" (ver
--     flashcard_decks_enrolled_read, 20260810060909_create_flashcards.sql);
--   - conteudo autoral do proprio aluno, editavel enquanto rascunho (ver
--     student_topic_notes, 20260811105025_create_student_topic_notes.sql).
--
-- Nao altera nenhuma tabela, policy, funcao ou area do produto fora
-- deste conteudo (schema exclusivo de essay_themes/essay_submissions).

create table public.essay_themes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  syllabus_node_id uuid references public.syllabus_nodes(id) on delete set null,
  title text not null check (char_length(btrim(title)) between 2 and 200),
  prompt_text text not null check (char_length(btrim(prompt_text)) between 10 and 8000),
  source_reference text check (source_reference is null or char_length(btrim(source_reference)) between 2 and 500),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index essay_themes_product_sort_idx
  on public.essay_themes(product_id, sort_order);
create index essay_themes_syllabus_node_idx
  on public.essay_themes(syllabus_node_id)
  where syllabus_node_id is not null;

alter table public.essay_themes enable row level security;

-- Temas ativos legiveis apenas por aluno com matricula ativa no produto
-- do tema — mesmo padrao de flashcard_decks_enrolled_read.
create policy "essay_themes_enrolled_read"
on public.essay_themes for select
to authenticated
using (
  active
  and exists (
    select 1
    from public.enrollments enrollment
    where enrollment.product_id = essay_themes.product_id
      and enrollment.user_id = (select auth.uid())
      and enrollment.status = 'active'
      and (enrollment.expires_at is null or enrollment.expires_at > now())
  )
);

revoke all on public.essay_themes from anon, authenticated;
grant select on public.essay_themes to authenticated;


create table public.essay_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  theme_id uuid not null references public.essay_themes(id),
  essay_text text not null default '' check (char_length(essay_text) <= 20000),
  status text not null default 'draft'
    check (status in ('draft', 'submitted', 'processing', 'corrected', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz,
  -- Nao aceita transicao para fora de "draft" com texto vazio — proibe
  -- submissao vazia no nivel de banco, independente do que o client envie.
  constraint essay_submissions_non_empty_when_active check (
    status = 'draft' or char_length(btrim(essay_text)) > 0
  ),
  constraint essay_submissions_submitted_at_consistency check (
    (status = 'draft' and submitted_at is null)
    or (status <> 'draft' and submitted_at is not null)
  )
);

create index essay_submissions_user_created_idx
  on public.essay_submissions(user_id, created_at desc);
create index essay_submissions_theme_idx
  on public.essay_submissions(theme_id);

alter table public.essay_submissions enable row level security;

-- Leitura: somente as proprias submissoes, sem exigir matricula ainda
-- ativa (mesmo padrao de topic_notes_self_read — o aluno preserva acesso
-- ao que ja escreveu mesmo que a matricula expire depois).
create policy "essay_submissions_self_read"
on public.essay_submissions for select
to authenticated
using (user_id = (select auth.uid()));

-- Criacao: somente rascunho proprio, para tema ativo de produto com
-- matricula ativa (mesmo padrao de topic_notes_enrolled_insert).
create policy "essay_submissions_enrolled_insert"
on public.essay_submissions for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and status = 'draft'
  and exists (
    select 1
    from public.essay_themes theme
    join public.enrollments enrollment
      on enrollment.product_id = theme.product_id
    where theme.id = theme_id
      and theme.active
      and enrollment.user_id = (select auth.uid())
      and enrollment.status = 'active'
      and (enrollment.expires_at is null or enrollment.expires_at > now())
  )
);

-- Atualizacao: só enquanto a linha ainda estiver em draft (USING avalia o
-- estado ANTES do update); o aluno só pode manter em draft ou mover para
-- submitted uma unica vez — nunca para processing/corrected/failed
-- diretamente (reservado a um mecanismo de servidor ainda nao criado).
create policy "essay_submissions_draft_owner_update"
on public.essay_submissions for update
to authenticated
using (
  user_id = (select auth.uid())
  and status = 'draft'
)
with check (
  user_id = (select auth.uid())
  and status in ('draft', 'submitted')
  and exists (
    select 1
    from public.essay_themes theme
    join public.enrollments enrollment
      on enrollment.product_id = theme.product_id
    where theme.id = theme_id
      and theme.active
      and enrollment.user_id = (select auth.uid())
      and enrollment.status = 'active'
      and (enrollment.expires_at is null or enrollment.expires_at > now())
  )
);

revoke all on public.essay_submissions from anon, authenticated;
grant select, insert, update on public.essay_submissions to authenticated;
