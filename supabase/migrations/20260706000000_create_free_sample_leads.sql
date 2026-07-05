-- =========================================================
-- Nortis Concursos — Leads da amostra gratuita (Fase 5 do redesign)
--
-- Tabela NOVA e ISOLADA para capturar nome/e-mail de quem pede a
-- amostra gratuita na Home ("Veja por dentro da apostila"). Não tem
-- foreign key nem qualquer relação com products, orders, order_items,
-- enrollments, profiles ou downloads — não altera nenhuma tabela
-- existente.
--
-- Segurança / hardening:
-- - RLS habilitado.
-- - Validações no próprio banco (CHECK constraints): name e email não
--   podem ser vazios após trim, têm tamanho máximo razoável e o e-mail
--   precisa passar por uma regex simples de formato. Isso vale mesmo
--   que alguém insira direto pela API, ignorando o formulário.
-- - Única policy: INSERT público (anon + authenticated), pois o
--   formulário roda para visitantes sem conta. O `with check` restringe
--   o INSERT EXATAMENTE ao caso desta funcionalidade: consentimento
--   LGPD marcado, source e product_slug fixos. Qualquer tentativa de
--   gravar com outro source/product_slug ou sem consent é rejeitada
--   pelo próprio banco.
-- - Nenhuma policy de SELECT/UPDATE/DELETE — ninguém lê, edita ou
--   apaga os leads a partir do cliente (chave anon). Consulta só via
--   Supabase Dashboard (Table Editor, com service_role) ou uma Edge
--   Function futura, se um dia for necessário.
-- - Sem senha, sem CPF, sem telefone — só o mínimo para contato.
-- =========================================================

create table public.free_sample_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 120),
  email text not null check (
    char_length(trim(email)) between 5 and 254
    and email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  ),
  source text not null default 'apostila_preview',
  product_slug text not null default 'nexo-social-sedes-df-2026',
  consent boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.free_sample_leads enable row level security;

-- Permissões de tabela explícitas: além da RLS, garante no nível de
-- GRANT que anon/authenticated só têm INSERT nesta tabela (nada de
-- SELECT/UPDATE/DELETE). RLS decide QUAIS linhas; o GRANT decide QUAIS
-- comandos são sequer permitidos — as duas camadas somadas.
revoke all on table public.free_sample_leads from anon, authenticated;
grant insert on table public.free_sample_leads to anon, authenticated;

create policy "free_sample_leads_public_insert"
  on public.free_sample_leads
  for insert
  to anon, authenticated
  with check (
    consent = true
    and source = 'apostila_preview'
    and product_slug = 'nexo-social-sedes-df-2026'
  );
