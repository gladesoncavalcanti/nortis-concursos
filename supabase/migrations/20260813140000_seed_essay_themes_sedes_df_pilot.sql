-- Seed inicial de temas de treino de redacao para o piloto do Tutor Nortis
-- (SEDES-DF 2026). ISOLADA da migration estrutural
-- (20260812060000_create_essay_themes_and_submissions.sql) de proposito -
-- schema e conteudo sao mudancas de natureza diferente.
--
-- Fonte editorial: Nortis Concursos - Redacao Quadrix SEDES-DF 2026 -
-- Secao 6: Matriz de temas com maior potencial discursivo. Material
-- autoral Nortis; NAO e publicacao oficial do Instituto Quadrix nem da
-- SEDES-DF. Os seis temas abaixo sao linhas de treino Nortis derivadas
-- dessa matriz autoral - NAO sao "temas oficiais" da banca, e nenhuma
-- previsao de incidencia foi atribuida a eles. Nenhum conteudo alem dos
-- seis titulos/comandos-base fornecidos foi adicionado por conta propria
-- (apenas ajustes minimos de pontuacao para caber no modelo de dados).
--
-- CONFERENCIA DOCUMENTAL REALIZADA (atualizacao posterior a esta
-- migration, com FONTE DUPLA CONFIRMADA em sessao seguinte): dois
-- PDFs foram disponibilizados e lidos na integra contendo a mesma
-- Secao 6 "Matriz de temas com maior potencial discursivo", com texto
-- identico entre si -
-- (a) Nortis_Redacao_Quadrix_SEDES_DF_2026.pdf (edicao original,
--     pagina 32, item 16) e
-- (b) Nortis_Redacao_SEDES_DF_2026_Direcao_Editorial_V2.pdf (edicao
--     visual V2 do mesmo manual, pagina 26) -
-- confirmando que a Secao 6 e de fato a fonte primaria dos seis temas
-- abaixo (dois outros PDFs recebidos na mesma sessao -
-- "V3_Premium_Modelos_Nota_Alta" e "V3_Premium_ABNT_Justificada" - sao
-- uma familia de material DIFERENTE, sem esta matriz; ver nota em
-- docs/claude-staging/knowledge/plano-integracao-contratos-oficiais-tutor-nortis.md).
--
-- Classificacao tema a tema (titulo/comando da migration vs.
-- eixo/comando da Secao 6 do PDF-fonte):
-- (1) SUAS e PNAS - DIVERGENCIA MATERIAL no comando: PDF nao tem o
--     sufixo "no ambito do SUAS e da PNAS".
-- (2) Protecao basica/especial - EQUIVALENTE COM AJUSTE EDITORIAL
--     MINIMO: PDF usa notacao de tabela com barras ("CRAS/CREAS",
--     "PAIF/PAEFI", "media/alta complexidade"), migration expande em
--     prosa ("e", "proteção de") sem alterar o conteudo informado.
-- (3) Intersetorialidade - DIVERGENCIA MATERIAL: PDF diz apenas
--     "assistencia" (nao "assistencia social") e nao tem o sufixo "no
--     atendimento de demandas complexas" (clausula importada de outra
--     celula da tabela do PDF).
-- (4) Territorializacao - EQUIVALENTE COM AJUSTE EDITORIAL MINIMO: o
--     comando bate exatamente com o PDF; so o titulo do eixo no PDF e
--     mais curto ("Territorializacao e diagnostico", sem
--     "socioassistencial").
-- (5) Beneficios - DIVERGENCIA MATERIAL: PDF nao tem
--     "socioassistenciais" apos "beneficios" nem no eixo nem no
--     comando - o PDF usa "beneficios" em sentido mais amplo.
-- (6) Direitos - DIVERGENCIA MATERIAL, a mais relevante das seis: o
--     eixo no PDF chama-se "Direitos e violacoes" (nao "Resposta
--     estatal as violacoes de direitos" - o titulo da migration e uma
--     parafrase do COMANDO do PDF, usada como se fosse o nome do
--     eixo), e o comando do PDF e "Analise resposta estatal diante de
--     violacao de direitos" (sem "a" antes de "resposta", singular
--     "violacao").
--
-- Resultado: 4 de 6 temas (1, 3, 5, 6) tem DIVERGENCIA MATERIAL no
-- titulo e/ou comando frente ao PDF-fonte (confirmado por duas fontes
-- identicas); 2 de 6 (2, 4) sao apenas ajuste editorial minimo
-- (formatacao/tamanho do titulo, sem mudar o conteudo). Por isso esta
-- conferencia NAO foi encerrada como "identica" - a pendencia
-- documental permanece ABERTA para decisao humana sobre se os seis
-- temas devem ser corrigidos para bater literalmente com o PDF antes
-- de qualquer aplicacao remota. NENHUM conteudo pedagogico foi
-- alterado nesta migration em funcao deste achado.
--
-- Escopo estritamente restrito a public.essay_themes: adiciona uma
-- coluna `slug` (com indice unico) para permitir upsert idempotente no
-- mesmo padrao ja usado em public.simulations/public.questions (ver
-- 20260811124715_seed_practice_questions_and_simulation_pilot.sql) - e
-- insere os seis temas via upsert por slug. Nenhuma outra tabela e
-- tocada; nenhuma policy, grant ou constraint de essay_themes e alterada
-- aqui alem da coluna nova.
--
-- Produto resolvido por slug ('nexo-social-sedes-df-2026'), nunca por
-- UUID hardcoded - mesmo padrao das demais seeds deste repositorio.
--
-- syllabus_node_id deliberadamente NULL nos seis temas: a busca por
-- correspondencia objetiva em public.syllabus_nodes para este produto
-- encontrou 12 nos candidatos com titulos sobrepostos entre modulos
-- diferentes (ambiguo, nao e uma correspondencia inequivoca) - nenhum
-- relacionamento foi inventado.
--
-- `active = false` de proposito: esta migration pode ser aplicada sem
-- tornar os temas visiveis a nenhum aluno. Ativa-los e uma etapa
-- separada, pequena e controlada (um UPDATE ou uma migration adicional
-- futura), a ser feita somente depois que o frontend da Fundacao
-- Discursiva (PR #80) estiver de fato em producao. Esta migration em si
-- NAO deve ser aplicada ao ambiente remoto nesta sessao (ver Fase 8 do
-- comando que originou este trabalho).

alter table public.essay_themes
  add column if not exists slug text;

create unique index if not exists essay_themes_slug_uidx
  on public.essay_themes(slug)
  where slug is not null;

with theme_seed(slug, title, prompt_text, source_reference, sort_order) as (
  values
    (
      'suas-e-pnas-principios-e-organizacao-territorial',
      'SUAS e PNAS — princípios e organização territorial',
      'Explique princípios, proteções, seguranças e organização territorial no âmbito do SUAS e da PNAS.',
      'Nortis Concursos — Redação Quadrix SEDES-DF 2026 — Seção 6: Matriz de temas com maior potencial discursivo. Material autoral Nortis; não é publicação oficial do Instituto Quadrix nem da SEDES-DF.',
      10
    ),
    (
      'protecao-social-basica-e-especial',
      'Proteção social básica e especial',
      'Diferencie CRAS e CREAS, PAIF e PAEFI, e proteção de média e alta complexidade.',
      'Nortis Concursos — Redação Quadrix SEDES-DF 2026 — Seção 6: Matriz de temas com maior potencial discursivo. Material autoral Nortis; não é publicação oficial do Instituto Quadrix nem da SEDES-DF.',
      20
    ),
    (
      'intersetorialidade-na-protecao-social',
      'Intersetorialidade na proteção social',
      'Analise a articulação entre assistência social, saúde, educação, justiça e segurança no atendimento de demandas complexas.',
      'Nortis Concursos — Redação Quadrix SEDES-DF 2026 — Seção 6: Matriz de temas com maior potencial discursivo. Material autoral Nortis; não é publicação oficial do Instituto Quadrix nem da SEDES-DF.',
      30
    ),
    (
      'territorializacao-e-diagnostico-socioassistencial',
      'Territorialização e diagnóstico socioassistencial',
      'Explique por que o território orienta a atuação socioassistencial.',
      'Nortis Concursos — Redação Quadrix SEDES-DF 2026 — Seção 6: Matriz de temas com maior potencial discursivo. Material autoral Nortis; não é publicação oficial do Instituto Quadrix nem da SEDES-DF.',
      40
    ),
    (
      'beneficios-e-programas-socioassistenciais-do-df',
      'Benefícios e programas socioassistenciais do DF',
      'Relacione benefícios socioassistenciais, segurança de renda e acompanhamento familiar.',
      'Nortis Concursos — Redação Quadrix SEDES-DF 2026 — Seção 6: Matriz de temas com maior potencial discursivo. Material autoral Nortis; não é publicação oficial do Instituto Quadrix nem da SEDES-DF.',
      50
    ),
    (
      'resposta-estatal-as-violacoes-de-direitos',
      'Resposta estatal às violações de direitos',
      'Analise a resposta estatal diante de situações de violação de direitos.',
      'Nortis Concursos — Redação Quadrix SEDES-DF 2026 — Seção 6: Matriz de temas com maior potencial discursivo. Material autoral Nortis; não é publicação oficial do Instituto Quadrix nem da SEDES-DF.',
      60
    )
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

-- Guarda de integridade: se o produto 'nexo-social-sedes-df-2026' nao
-- existir (renomeado, slug diferente, ou inativo), o INSERT acima
-- afeta silenciosamente 0 linhas - sem erro, sem aviso (comprovado em
-- supabase/tests/seed_essay_themes_pilot_missing_product.sql). Essa
-- guarda transforma esse silencio em falha explicita da migration,
-- para nunca deixar a aplicacao "ter sucesso" sem realmente ter
-- semeado os seis temas no produto correto.
do $guard$
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
    raise exception 'seed_essay_themes_pilot: esperava 6 temas vinculados ao produto nexo-social-sedes-df-2026, encontrou %. Produto nao existe, esta inativo, ou o slug mudou.', v_seeded_count;
  end if;
end;
$guard$;
