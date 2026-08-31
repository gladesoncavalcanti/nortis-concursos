-- =========================================================
-- Nortis Concursos — Acesso gratuito SEDES-DF 2026
--
-- Cria uma função idempotente para que um usuário autenticado libere
-- a própria matrícula no produto SEDES-DF sem checkout, pedidos,
-- pagamentos ou Asaas. A matrícula continua sendo a fonte de verdade
-- usada pelas policies existentes dos módulos da Central Nortis.
-- =========================================================

create or replace function public.claim_free_sedes_df_access()
returns table (
  enrollment_id uuid,
  product_id uuid,
  status text,
  granted_at timestamptz,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_product_id uuid;
  v_existing public.enrollments%rowtype;
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
    raise exception 'free_product_not_available' using errcode = 'P0001';
  end if;

  select *
    into v_existing
  from public.enrollments enrollment
  where enrollment.user_id = v_user_id
    and enrollment.product_id = v_product_id
  for update;

  if found then
    if v_existing.status = 'revoked' then
      raise exception 'access_revoked' using errcode = 'P0001';
    end if;

    update public.enrollments enrollment
    set status = 'active',
        expires_at = null
    where enrollment.id = v_existing.id
    returning enrollment.id,
              enrollment.product_id,
              enrollment.status,
              enrollment.granted_at,
              enrollment.expires_at
      into enrollment_id,
           product_id,
           status,
           granted_at,
           expires_at;

    return next;
    return;
  end if;

  insert into public.enrollments (
    user_id,
    product_id,
    order_id,
    status,
    expires_at
  )
  values (
    v_user_id,
    v_product_id,
    null,
    'active',
    null
  )
  returning enrollments.id,
            enrollments.product_id,
            enrollments.status,
            enrollments.granted_at,
            enrollments.expires_at
    into enrollment_id,
         product_id,
         status,
         granted_at,
         expires_at;

  return next;
end;
$$;

revoke all on function public.claim_free_sedes_df_access() from public;
revoke all on function public.claim_free_sedes_df_access() from anon;
grant execute on function public.claim_free_sedes_df_access() to authenticated;

comment on function public.claim_free_sedes_df_access() is
  'Concede acesso gratuito ao produto SEDES-DF 2026 para o usuario autenticado, sem checkout/pagamento. Nao reativa matricula revogada.';
