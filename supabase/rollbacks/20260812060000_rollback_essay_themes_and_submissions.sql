-- ROLLBACK MANUAL — NAO E UMA MIGRATION.
--
-- Este arquivo fica fora de supabase/migrations/ de proposito: a CLI do
-- Supabase aplica automaticamente TUDO que estiver em migrations/, em
-- ordem, e um DROP colocado la seria executado sem intencao explicita.
-- Este script so deve ser executado manualmente, e somente se a
-- aplicacao de 20260812060000_create_essay_themes_and_submissions.sql
-- falhar a meio caminho ou precisar ser desfeita antes de qualquer
-- outra migration depender dela.
--
-- Escopo estritamente restrito ao que a propria migration criou:
-- as tabelas public.essay_themes e public.essay_submissions (e tudo o
-- que pertence a elas: indices, constraints, policies). Nao toca em
-- nenhuma tabela, policy, funcao ou dado anterior a esta migration.
--
-- Ordem: essay_submissions primeiro (referencia essay_themes via FK),
-- essay_themes depois. Policies e indices sao removidos automaticamente
-- pelo DROP TABLE — nao ha necessidade de comandos separados para eles.

drop table if exists public.essay_submissions;
drop table if exists public.essay_themes;
