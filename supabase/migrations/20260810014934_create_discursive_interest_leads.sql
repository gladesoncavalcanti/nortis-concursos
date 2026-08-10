-- =========================================================
-- Nortis Concursos — Cadastro de interesse da Sprint Discursiva
-- SEDES-DF 2026 (fatia vertical 2, pós-landing)
--
-- Tabela NOVA e ISOLADA para capturar interesse estruturado
-- (nome/e-mail/WhatsApp/categoria/especialidade/pacote) a partir da
-- landing /sprint-discursiva-sedes-df. Mesmo padrão de segurança já
-- aprovado e em produção para public.free_sample_leads
-- (20260706000000_create_free_sample_leads.sql): RLS habilitado,
-- INSERT público restrito por CHECK constraints, sem SELECT/UPDATE/
-- DELETE via anon/authenticated.
--
-- Não tem foreign key nem qualquer relação com products, orders,
-- order_items, enrollments, profiles, downloads ou free_sample_leads
-- — não altera nenhuma tabela existente. Não envolve checkout, Asaas,
-- créditos ou correção — é só captura de demanda.
--
-- Escopo: só esta tabela. Nenhuma outra migration, Edge Function ou
-- policy existente é tocada.
-- =========================================================

create table public.discursive_interest_leads (
  id uuid primary key default gen_random_uuid(),

  name text not null check (char_length(trim(name)) between 2 and 120),

  email text not null check (
    char_length(trim(email)) between 5 and 254
    and email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  ),

  -- Guardado só com dígitos (DDI/DDD/número) — normalização acontece no
  -- frontend antes do insert; o CHECK aqui é a garantia de servidor,
  -- independente do que o cliente envie.
  whatsapp text not null check (whatsapp ~ '^[0-9]{10,13}$'),

  category text not null check (category in ('TDAS', 'EDAS')),

  -- Combinação categoria/especialidade validada no próprio banco — não
  -- basta a especialidade existir isoladamente, ela precisa ser
  -- compatível com a categoria (regra de produto: TDAS e EDAS têm
  -- fluxos, rubricas e produtos separados, nunca misturados).
  specialty text not null check (specialty in ('agente_social', 'tecnico_administrativo', 'servico_social')),
  constraint discursive_interest_leads_category_specialty_check check (
    (category = 'TDAS' and specialty in ('agente_social', 'tecnico_administrativo'))
    or (category = 'EDAS' and specialty = 'servico_social')
  ),

  -- Espelha os ids de apps/web/src/config/discursivaCatalog.js
  -- (DISCURSIVA_PACKAGES[].id) — mantido como texto simples (sem FK),
  -- já que o catálogo hoje vive em código, não em tabela (Opção A).
  package_interest text not null check (
    package_interest in ('diagnostico', 'tdas-essencial', 'tdas-intensivo', 'edas-essencial', 'edas-intensivo')
  ),
  constraint discursive_interest_leads_category_package_check check (
    package_interest = 'diagnostico'
    or (category = 'TDAS' and package_interest in ('tdas-essencial', 'tdas-intensivo'))
    or (category = 'EDAS' and package_interest in ('edas-essencial', 'edas-intensivo'))
  ),

  source text not null default 'sprint_discursiva_landing',
  consent boolean not null default false,

  created_at timestamptz not null default now()
);

alter table public.discursive_interest_leads enable row level security;

-- Permissões de tabela explícitas, além da RLS: anon/authenticated só
-- têm INSERT nesta tabela — nada de SELECT/UPDATE/DELETE pelo cliente.
-- Consulta é só via Supabase Studio (service_role) ou uma Edge Function
-- futura, se um dia for necessário (não criada nesta fatia).
revoke all on table public.discursive_interest_leads from anon, authenticated;
grant insert on table public.discursive_interest_leads to anon, authenticated;

create policy "discursive_interest_leads_public_insert"
  on public.discursive_interest_leads
  for insert
  to anon, authenticated
  with check (
    consent = true
    and source = 'sprint_discursiva_landing'
  );
