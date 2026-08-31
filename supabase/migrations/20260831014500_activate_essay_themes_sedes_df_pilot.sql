-- Ativa os seis temas piloto de redação SEDES-DF já semeados.
--
-- Escopo restrito:
-- - não cria tabela;
-- - não altera estrutura;
-- - não toca RLS/policies/grants;
-- - não altera checkout, pagamentos, pedidos, Asaas ou Edge Functions;
-- - apenas muda active=false -> true para os seis slugs oficiais do piloto
--   vinculados ao produto nexo-social-sedes-df-2026.

with expected_theme_slugs(slug) as (
  values
    ('suas-e-pnas'),
    ('protecao-social-basica-e-especial'),
    ('intersetorialidade'),
    ('territorializacao-e-diagnostico'),
    ('beneficios-e-programas-do-df'),
    ('direitos-e-violacoes')
)
update public.essay_themes theme
set
  active = true,
  updated_at = now()
from expected_theme_slugs expected
join public.products product
  on product.slug = 'nexo-social-sedes-df-2026'
 and product.active = true
where theme.slug = expected.slug
  and theme.product_id = product.id;

do $guard$
declare
  v_active_count integer;
begin
  select count(*) into v_active_count
  from public.essay_themes theme
  join public.products product on product.id = theme.product_id
  where theme.slug in (
    'suas-e-pnas',
    'protecao-social-basica-e-especial',
    'intersetorialidade',
    'territorializacao-e-diagnostico',
    'beneficios-e-programas-do-df',
    'direitos-e-violacoes'
  )
  and product.slug = 'nexo-social-sedes-df-2026'
  and product.active = true
  and theme.active = true;

  if v_active_count <> 6 then
    raise exception 'activate_essay_themes_sedes_df_pilot: esperava 6 temas ativos vinculados ao produto nexo-social-sedes-df-2026, encontrou %.', v_active_count;
  end if;
end;
$guard$;
