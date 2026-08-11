-- Mantém a retomada do simulado sem expor o resultado antes da conclusão.
-- A policy existente continua isolando as linhas pelo usuário da sessão.
revoke select on table public.simulation_answers from authenticated;

grant select (
  session_id,
  question_id,
  selected_option_id,
  answered_at
) on table public.simulation_answers to authenticated;
