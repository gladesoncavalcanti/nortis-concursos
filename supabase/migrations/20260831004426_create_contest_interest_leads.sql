-- =========================================================
-- Nortis Concursos — Interesse por concursos monitorados
--
-- Captura demanda por concurso específico do Radar Nortis,
-- exigindo usuário autenticado e sem tocar em checkout,
-- pedidos, pagamentos, Asaas, matrículas ou produtos.
--
-- A tabela não recebe GRANT direto para anon/authenticated.
-- O frontend usa somente a RPC public.claim_contest_interest(),
-- que valida auth.uid() e restringe os slugs aceitos ao catálogo
-- público versionado nesta entrega.
-- =========================================================

create table if not exists public.contest_interest_leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contest_slug text not null check (contest_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  source text not null default 'contest_radar' check (source = 'contest_radar'),
  first_interested_at timestamptz not null default now(),
  last_confirmed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),

  constraint contest_interest_leads_user_contest_unique unique (user_id, contest_slug)
);

create index if not exists contest_interest_leads_contest_slug_idx
  on public.contest_interest_leads (contest_slug);

create index if not exists contest_interest_leads_user_id_idx
  on public.contest_interest_leads (user_id);

alter table public.contest_interest_leads enable row level security;

revoke all on table public.contest_interest_leads from anon, authenticated;

create or replace function public.claim_contest_interest(p_contest_slug text)
returns table (
  contest_slug text,
  first_interested_at timestamptz,
  last_confirmed_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_contest_slug text := lower(trim(p_contest_slug));
begin
  if v_user_id is null then
    raise exception 'authentication_required' using errcode = '28000';
  end if;

  if v_contest_slug not in (
    'sedes-df-2026',
    'cgu-2026',
    'anpd-2026',
    'tcesp-auditor-2026',
    'ses-rj-iaserj-2026',
    'abgf-2026',
    'ibge-censo-agro-2026'
  ) then
    raise exception 'invalid_contest_slug' using errcode = '22023';
  end if;

  insert into public.contest_interest_leads (
    user_id,
    contest_slug,
    source,
    first_interested_at,
    last_confirmed_at
  )
  values (
    v_user_id,
    v_contest_slug,
    'contest_radar',
    now(),
    now()
  )
  on conflict (user_id, contest_slug)
  do update set last_confirmed_at = now()
  returning contest_interest_leads.contest_slug,
            contest_interest_leads.first_interested_at,
            contest_interest_leads.last_confirmed_at
    into contest_slug,
         first_interested_at,
         last_confirmed_at;

  return next;
end;
$$;

revoke all on function public.claim_contest_interest(text) from public;
revoke all on function public.claim_contest_interest(text) from anon;
grant execute on function public.claim_contest_interest(text) to authenticated;

comment on table public.contest_interest_leads is
  'Interesse autenticado por concursos monitorados no Radar Nortis. Nao concede matricula nem passa por checkout/pagamento.';

comment on function public.claim_contest_interest(text) is
  'Registra ou reconfirma interesse do usuario autenticado por um concurso monitorado permitido, sem duplicar linha.';

