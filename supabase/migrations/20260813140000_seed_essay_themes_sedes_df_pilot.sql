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
-- PENDENCIA REGISTRADA: o PDF-fonte da matriz autoral citada acima nao
-- foi anexado nesta sessao de trabalho. Os seis titulos/comandos-base
-- usados aqui vieram transcritos literalmente no comando que autorizou
-- este lote (nao foram inferidos, resumidos nem expandidos a partir do
-- PDF). A conferencia documental direta contra o PDF original permanece
-- pendente ate que o arquivo seja fornecido em uma sessao futura.
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
