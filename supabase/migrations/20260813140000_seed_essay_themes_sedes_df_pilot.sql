-- Seed inicial de temas de treino de redacao para o piloto do Tutor Nortis
-- (SEDES-DF 2026). ISOLADA da migration estrutural
-- (20260812060000_create_essay_themes_and_submissions.sql) de proposito -
-- schema e conteudo sao mudancas de natureza diferente.
--
-- Fonte editorial: Nortis Concursos - Redacao Quadrix SEDES-DF 2026 -
-- Secao 6: Matriz de temas com maior potencial discursivo. Material
-- autoral Nortis; NAO e publicacao oficial do Instituto Quadrix nem da
-- SEDES-DF. Os seis temas abaixo sao linhas de treino Nortis - NAO sao
-- "temas oficiais" da banca, e nenhuma previsao de incidencia foi
-- atribuida a eles.
--
-- CONFERENCIA DOCUMENTAL ENCERRADA (DECISAO HUMANA - reconciliacao
-- literal com o PDF-fonte, 2026-08-13): a auditoria anterior (ver
-- historico abaixo) encontrou 4 de 6 temas com DIVERGENCIA MATERIAL
-- frente ao texto original da Secao 6, confirmado por fonte dupla
-- identica -
-- (a) Nortis_Redacao_Quadrix_SEDES_DF_2026.pdf (edicao original,
--     pagina 32, item 16) e
-- (b) Nortis_Redacao_SEDES_DF_2026_Direcao_Editorial_V2.pdf (edicao
--     visual V2 do mesmo manual, pagina 26).
-- Diante disso, foi tomada a decisao humana de adotar como fonte
-- CANONICA a redacao LITERAL do PDF-fonte - os seis titulos/comandos
-- abaixo sao TRANSCRICOES do PDF, sem parafrase, ampliacao,
-- modernizacao ou complemento proprio (os slugs foram ajustados para
-- refletir os novos titulos - campo tecnico, nao editorial). A
-- pendencia documental do PR #81 esta ENCERRADA: o conteudo foi
-- reconciliado com a fonte original.
--
-- Historico (para auditoria - NAO reflete mais o conteudo semeado
-- abaixo): a versao anterior desta migration usava titulos/comandos
-- parafraseados/expandidos a partir da mesma Secao 6, registrados e
-- classificados tema a tema (IDENTICO / EQUIVALENTE COM AJUSTE
-- EDITORIAL MINIMO / DIVERGENCIA MATERIAL) nos comentarios do PR #81 e
-- no commit dad07a0 desta branch - ver esse commit e o comentario do
-- PR para o detalhe completo da comparacao anterior. Os PDFs
-- complementares "V3_Premium_Modelos_Nota_Alta" e
-- "V3_Premium_ABNT_Justificada" continuam sendo uma familia de material
-- DIFERENTE, sem esta matriz (ver nota em
-- docs/claude-staging/knowledge/plano-integracao-contratos-oficiais-tutor-nortis.md).
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
-- NAO deve ser aplicada ao ambiente remoto nesta sessao.

alter table public.essay_themes
  add column if not exists slug text;

create unique index if not exists essay_themes_slug_uidx
  on public.essay_themes(slug)
  where slug is not null;

with theme_seed(slug, title, prompt_text, source_reference, sort_order) as (
  values
    (
      'suas-e-pnas',
      'SUAS e PNAS',
      'Explique princípios, proteções, seguranças e organização territorial.',
      'Nortis Concursos — Redação Quadrix SEDES-DF 2026 — Seção 6: Matriz de temas com maior potencial discursivo. Transcrição literal do PDF-fonte. Material autoral Nortis; não é publicação oficial do Instituto Quadrix nem da SEDES-DF.',
      10
    ),
    (
      'protecao-social-basica-e-especial',
      'Proteção social básica e especial',
      'Diferencie CRAS/CREAS, PAIF/PAEFI, média/alta complexidade.',
      'Nortis Concursos — Redação Quadrix SEDES-DF 2026 — Seção 6: Matriz de temas com maior potencial discursivo. Transcrição literal do PDF-fonte. Material autoral Nortis; não é publicação oficial do Instituto Quadrix nem da SEDES-DF.',
      20
    ),
    (
      'intersetorialidade',
      'Intersetorialidade',
      'Analise a articulação entre assistência, saúde, educação, justiça e segurança.',
      'Nortis Concursos — Redação Quadrix SEDES-DF 2026 — Seção 6: Matriz de temas com maior potencial discursivo. Transcrição literal do PDF-fonte. Material autoral Nortis; não é publicação oficial do Instituto Quadrix nem da SEDES-DF.',
      30
    ),
    (
      'territorializacao-e-diagnostico',
      'Territorialização e diagnóstico',
      'Explique por que o território orienta a atuação socioassistencial.',
      'Nortis Concursos — Redação Quadrix SEDES-DF 2026 — Seção 6: Matriz de temas com maior potencial discursivo. Transcrição literal do PDF-fonte. Material autoral Nortis; não é publicação oficial do Instituto Quadrix nem da SEDES-DF.',
      40
    ),
    (
      'beneficios-e-programas-do-df',
      'Benefícios e programas do DF',
      'Relacione benefícios, segurança de renda e acompanhamento familiar.',
      'Nortis Concursos — Redação Quadrix SEDES-DF 2026 — Seção 6: Matriz de temas com maior potencial discursivo. Transcrição literal do PDF-fonte. Material autoral Nortis; não é publicação oficial do Instituto Quadrix nem da SEDES-DF.',
      50
    ),
    (
      'direitos-e-violacoes',
      'Direitos e violações',
      'Analise resposta estatal diante de violação de direitos.',
      'Nortis Concursos — Redação Quadrix SEDES-DF 2026 — Seção 6: Matriz de temas com maior potencial discursivo. Transcrição literal do PDF-fonte. Material autoral Nortis; não é publicação oficial do Instituto Quadrix nem da SEDES-DF.',
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
    'suas-e-pnas',
    'protecao-social-basica-e-especial',
    'intersetorialidade',
    'territorializacao-e-diagnostico',
    'beneficios-e-programas-do-df',
    'direitos-e-violacoes'
  )
  and product.slug = 'nexo-social-sedes-df-2026';

  if v_seeded_count <> 6 then
    raise exception 'seed_essay_themes_pilot: esperava 6 temas vinculados ao produto nexo-social-sedes-df-2026, encontrou %. Produto nao existe, esta inativo, ou o slug mudou.', v_seeded_count;
  end if;
end;
$guard$;
