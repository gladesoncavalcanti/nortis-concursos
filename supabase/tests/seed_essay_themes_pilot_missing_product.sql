-- Teste transacional: confirma o comportamento REAL da migration de seed
-- quando o produto-alvo nao existe (slug errado/renomeado/inativo).
-- Objetivo: provar se o INSERT falha silenciosamente (0 linhas, sem erro)
-- ou se ha algum sinal. Nao aplica nada de forma permanente.

begin;

alter table public.essay_themes
  add column if not exists slug text;

create unique index if not exists essay_themes_slug_uidx
  on public.essay_themes(slug)
  where slug is not null;

with theme_seed(slug, title, prompt_text, source_reference, sort_order) as (
  values
    ('teste-produto-inexistente', 'Tema teste', 'Comando de teste.', null, 10)
)
insert into public.essay_themes (
  product_id, syllabus_node_id, slug, title, prompt_text, source_reference,
  active, sort_order
)
select
  product.id, null, seed.slug, seed.title, seed.prompt_text, seed.source_reference,
  false, seed.sort_order
from theme_seed seed
join public.products product
  on product.slug = 'slug-que-nao-existe-de-proposito'
 and product.active = true
on conflict (slug) where slug is not null do update set
  title = excluded.title,
  updated_at = now();

select
  'linhas_inseridas_com_slug_inexistente' as check_name,
  count(*) as total
from public.essay_themes
where slug = 'teste-produto-inexistente';

-- confirma que a guarda de integridade da migration real detectaria
-- este cenario e falharia explicitamente (mesma logica, produto
-- proposital-mente inexistente)
do $guard$
declare
  v_seeded_count integer;
begin
  select count(*) into v_seeded_count
  from public.essay_themes theme
  join public.products product on product.id = theme.product_id
  where theme.slug = 'teste-produto-inexistente'
    and product.slug = 'nexo-social-sedes-df-2026';

  if v_seeded_count <> 1 then
    raise exception 'guarda funcionou como esperado: encontrou %, nao 1 (produto realmente nao existe)', v_seeded_count;
  end if;
end;
$guard$;

rollback;
