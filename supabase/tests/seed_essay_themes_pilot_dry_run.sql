-- Teste transacional (begin...rollback) da migration de seed do piloto de
-- temas de treino. NAO aplica nada de forma permanente - roda o seed DUAS
-- vezes dentro da mesma transacao para provar idempotencia, confere o
-- resultado, e reverte tudo. Nao deve ser rodado como migration.

begin;

alter table public.essay_themes
  add column if not exists slug text;

create unique index if not exists essay_themes_slug_uidx
  on public.essay_themes(slug)
  where slug is not null;

-- roda o seed duas vezes seguidas (simula reaplicacao) --------------------
do $seed$
begin
  for i in 1..2 loop
    with theme_seed(slug, title, prompt_text, source_reference, sort_order) as (
      values
        ('suas-e-pnas-principios-e-organizacao-territorial', 'SUAS e PNAS — princípios e organização territorial', 'Explique princípios, proteções, seguranças e organização territorial no âmbito do SUAS e da PNAS.', 'Nortis Concursos — Redação Quadrix SEDES-DF 2026 — Seção 6: Matriz de temas com maior potencial discursivo. Material autoral Nortis; não é publicação oficial do Instituto Quadrix nem da SEDES-DF.', 10),
        ('protecao-social-basica-e-especial', 'Proteção social básica e especial', 'Diferencie CRAS e CREAS, PAIF e PAEFI, e proteção de média e alta complexidade.', 'Nortis Concursos — Redação Quadrix SEDES-DF 2026 — Seção 6: Matriz de temas com maior potencial discursivo. Material autoral Nortis; não é publicação oficial do Instituto Quadrix nem da SEDES-DF.', 20),
        ('intersetorialidade-na-protecao-social', 'Intersetorialidade na proteção social', 'Analise a articulação entre assistência social, saúde, educação, justiça e segurança no atendimento de demandas complexas.', 'Nortis Concursos — Redação Quadrix SEDES-DF 2026 — Seção 6: Matriz de temas com maior potencial discursivo. Material autoral Nortis; não é publicação oficial do Instituto Quadrix nem da SEDES-DF.', 30),
        ('territorializacao-e-diagnostico-socioassistencial', 'Territorialização e diagnóstico socioassistencial', 'Explique por que o território orienta a atuação socioassistencial.', 'Nortis Concursos — Redação Quadrix SEDES-DF 2026 — Seção 6: Matriz de temas com maior potencial discursivo. Material autoral Nortis; não é publicação oficial do Instituto Quadrix nem da SEDES-DF.', 40),
        ('beneficios-e-programas-socioassistenciais-do-df', 'Benefícios e programas socioassistenciais do DF', 'Relacione benefícios socioassistenciais, segurança de renda e acompanhamento familiar.', 'Nortis Concursos — Redação Quadrix SEDES-DF 2026 — Seção 6: Matriz de temas com maior potencial discursivo. Material autoral Nortis; não é publicação oficial do Instituto Quadrix nem da SEDES-DF.', 50),
        ('resposta-estatal-as-violacoes-de-direitos', 'Resposta estatal às violações de direitos', 'Analise a resposta estatal diante de situações de violação de direitos.', 'Nortis Concursos — Redação Quadrix SEDES-DF 2026 — Seção 6: Matriz de temas com maior potencial discursivo. Material autoral Nortis; não é publicação oficial do Instituto Quadrix nem da SEDES-DF.', 60)
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
      on product.slug = 'nexo-social-sedes-df-2026'
     and product.active = true
    on conflict (slug) where slug is not null do update set
      title = excluded.title,
      prompt_text = excluded.prompt_text,
      source_reference = excluded.source_reference,
      sort_order = excluded.sort_order,
      updated_at = now();

    -- mesma guarda de integridade da migration real: se isto disparar
    -- durante o teste do caminho feliz (produto existe), e uma falha
    -- do teste, nao do cenario.
    declare
      v_seeded_count integer;
    begin
      select count(*) into v_seeded_count
      from public.essay_themes theme
      join public.products product on product.id = theme.product_id
      where theme.slug in (
        'suas-e-pnas-principios-e-organizacao-territorial',
        'protecao-social-basica-e-especial',
        'intersetorialidade-na-protecao-social',
        'territorializacao-e-diagnostico-socioassistencial',
        'beneficios-e-programas-socioassistenciais-do-df',
        'resposta-estatal-as-violacoes-de-direitos'
      )
      and product.slug = 'nexo-social-sedes-df-2026';

      if v_seeded_count <> 6 then
        raise exception 'guarda disparou inesperadamente no caminho feliz: encontrou %, nao 6', v_seeded_count;
      end if;
    end;
  end loop;
end;
$seed$;

-- verificacoes --------------------------------------------------------
create temporary table seed_test_results (check_name text primary key, passed boolean, detail text) on commit drop;

insert into seed_test_results
select 'exatamente_6_temas', count(*) = 6, 'count=' || count(*)
from public.essay_themes
where slug in (
  'suas-e-pnas-principios-e-organizacao-territorial',
  'protecao-social-basica-e-especial',
  'intersetorialidade-na-protecao-social',
  'territorializacao-e-diagnostico-socioassistencial',
  'beneficios-e-programas-socioassistenciais-do-df',
  'resposta-estatal-as-violacoes-de-direitos'
);

insert into seed_test_results
select 'nenhum_duplicado_por_slug', count(*) = count(distinct slug), 'rows=' || count(*) || ' distinct_slugs=' || count(distinct slug)
from public.essay_themes
where slug in (
  'suas-e-pnas-principios-e-organizacao-territorial',
  'protecao-social-basica-e-especial',
  'intersetorialidade-na-protecao-social',
  'territorializacao-e-diagnostico-socioassistencial',
  'beneficios-e-programas-socioassistenciais-do-df',
  'resposta-estatal-as-violacoes-de-direitos'
);

insert into seed_test_results
select 'produto_correto', bool_and(product_id = (select id from public.products where slug = 'nexo-social-sedes-df-2026')), 'ok'
from public.essay_themes
where slug in (
  'suas-e-pnas-principios-e-organizacao-territorial',
  'protecao-social-basica-e-especial',
  'intersetorialidade-na-protecao-social',
  'territorializacao-e-diagnostico-socioassistencial',
  'beneficios-e-programas-socioassistenciais-do-df',
  'resposta-estatal-as-violacoes-de-direitos'
);

-- title/prompt_text nunca devem conter a palavra "oficial" (afirmacao
-- indevida de tema oficial da banca); a mencao a "oficial" so pode
-- aparecer em source_reference, e so como parte da negacao explicita
-- ("nao e publicacao oficial...") - por isso source_reference fica de
-- fora desta checagem.
insert into seed_test_results
select 'nenhum_tema_oficial_no_texto', not exists (
  select 1 from public.essay_themes
  where slug in (
    'suas-e-pnas-principios-e-organizacao-territorial',
    'protecao-social-basica-e-especial',
    'intersetorialidade-na-protecao-social',
    'territorializacao-e-diagnostico-socioassistencial',
    'beneficios-e-programas-socioassistenciais-do-df',
    'resposta-estatal-as-violacoes-de-direitos'
  )
  and (title ilike '%oficial%' or prompt_text ilike '%oficial%')
), 'ok';

insert into seed_test_results
select 'active_false_por_padrao', bool_and(active = false), 'ok'
from public.essay_themes
where slug in (
  'suas-e-pnas-principios-e-organizacao-territorial',
  'protecao-social-basica-e-especial',
  'intersetorialidade-na-protecao-social',
  'territorializacao-e-diagnostico-socioassistencial',
  'beneficios-e-programas-socioassistenciais-do-df',
  'resposta-estatal-as-violacoes-de-direitos'
);

insert into seed_test_results
select 'produto_nao_alterado', not exists (
  select 1 from public.products where slug = 'nexo-social-sedes-df-2026' and title <> 'Nexo Social – SEDES DF 2026'
), 'ok';

select * from seed_test_results order by check_name;

rollback;
