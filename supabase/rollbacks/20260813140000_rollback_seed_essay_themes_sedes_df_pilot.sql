-- ROLLBACK MANUAL — NAO E UMA MIGRATION.
--
-- Reverte SOMENTE o que 20260813140000_seed_essay_themes_sedes_df_pilot.sql
-- adicionou: os seis temas semeados (por slug) e a coluna `slug` em
-- essay_themes (com seu indice). Deliberadamente diferente do rollback
-- estrutural (20260812060000_rollback_essay_themes_and_submissions.sql,
-- que dropa as tabelas inteiras) — este e mais estreito de proposito,
-- para poder ser usado com seguranca mesmo depois que a fundacao
-- discursiva (PR #80) ja estiver em producao com submissoes reais de
-- alunos, sem apagar nenhuma delas.
--
-- Nao toca em essay_submissions, RLS, policies, grants ou qualquer
-- tema que nao tenha sido criado por este seed especifico (identificado
-- exclusivamente pelos seis slugs abaixo).

delete from public.essay_themes
where slug in (
  'suas-e-pnas-principios-e-organizacao-territorial',
  'protecao-social-basica-e-especial',
  'intersetorialidade-na-protecao-social',
  'territorializacao-e-diagnostico-socioassistencial',
  'beneficios-e-programas-socioassistenciais-do-df',
  'resposta-estatal-as-violacoes-de-direitos'
);

-- Só remova a coluna/índice se nenhum outro tema (fora deste seed)
-- passar a depender de `slug` no futuro. Comentado de propósito —
-- decisão deliberada de quem executar o rollback, não automática.
-- drop index if exists public.essay_themes_slug_uidx;
-- alter table public.essay_themes drop column if exists slug;
