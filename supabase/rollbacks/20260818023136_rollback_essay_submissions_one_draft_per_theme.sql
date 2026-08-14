-- ROLLBACK MANUAL — NAO E UMA MIGRATION.
--
-- Este arquivo fica fora de supabase/migrations/ de proposito (mesmo
-- motivo do rollback da fundacao estrutural): a CLI do Supabase aplica
-- automaticamente tudo que estiver em migrations/, e um DROP colocado
-- la seria executado sem intencao explicita. So deve ser executado
-- manualmente.
--
-- Escopo estritamente restrito ao que a propria migration
-- 20260818023136_add_essay_submissions_one_draft_per_theme.sql criou:
-- o indice unico parcial. Nao apaga nenhuma linha de
-- public.essay_submissions, nao toca em nenhuma tabela, policy ou
-- constraint anterior a esta migration - so remove a restricao de "um
-- draft por tema", voltando ao comportamento anterior (multiplos
-- drafts abertos do mesmo tema voltam a ser permitidos).

drop index if exists public.essay_submissions_one_open_draft_per_theme_uidx;
