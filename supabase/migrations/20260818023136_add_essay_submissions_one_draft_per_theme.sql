-- Regra de negocio: no maximo 1 rascunho (status = 'draft') aberto por
-- usuario+tema em public.essay_submissions. Migration ISOLADA,
-- dependente apenas da fundacao estrutural
-- (20260812060000_create_essay_themes_and_submissions.sql) - nao
-- reescreve nem recria a tabela, so adiciona um indice unico parcial.
--
-- Motivacao: sem esta garantia, um clique duplo, duas abas abertas com
-- o mesmo tema, ou uma corrida de requisicoes concorrentes na camada de
-- aplicacao (getOrCreateEssayDraft) poderiam criar dois ou mais
-- rascunhos abertos do mesmo tema para o mesmo aluno. A garantia final
-- de unicidade fica aqui, no banco - a aplicacao trata a violacao do
-- indice (23505 - unique_violation) como sinal para buscar de novo o
-- draft ja existente, nunca como erro fatal exposto ao aluno (ver
-- apps/web/src/api/essaySubmissions.js, getOrCreateEssayDraft).
--
-- Multiplas TENTATIVAS historicas do mesmo tema continuam permitidas
-- sem limite (submitted/processing/corrected/failed) - a restricao vale
-- exclusivamente enquanto status = 'draft'. Depois que o rascunho e
-- enviado (submitted), o aluno pode abrir um novo rascunho do mesmo
-- tema normalmente, e o historico da tentativa anterior permanece
-- intacto (nenhuma linha e apagada ou alterada por esta migration).
--
-- Nao altera nenhuma outra tabela, policy, grant ou constraint alem
-- deste indice novo em public.essay_submissions.

create unique index if not exists essay_submissions_one_open_draft_per_theme_uidx
  on public.essay_submissions(user_id, theme_id)
  where status = 'draft';
