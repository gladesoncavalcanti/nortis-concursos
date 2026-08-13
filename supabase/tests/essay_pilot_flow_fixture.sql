-- Teste transacional (begin...rollback) do fluxo completo:
-- tema -> criacao de draft -> texto -> salvar -> confirmar -> submitted
-- -> "recarregar" (releitura). Usa fixture temporaria (produto/tema de
-- teste + matricula), e o UID do unico usuario real do projeto como
-- "dono" (mesma tecnica ja usada e comprovada na suite de RLS da
-- Fundacao - nunca cria usuario ficticio, nunca altera dado real
-- existente desse usuario, tudo revertido ao final).

begin;

create temporary table flow_test_results (step text primary key, passed boolean, detail text) on commit drop;
grant select, insert on flow_test_results to authenticated;

do $flow$
declare
  v_owner_uid uuid;
  v_product_id uuid;
  v_theme_id uuid;
  v_submission_id uuid;
  v_status text;
  v_text text;
  v_count integer;
begin
  select id into v_owner_uid from auth.users limit 1;
  if v_owner_uid is null then
    insert into flow_test_results values ('setup', false, 'nenhum usuario real encontrado em auth.users - teste pulado');
    return;
  end if;

  -- fixture: produto de teste + tema piloto + matricula ativa do dono ---
  insert into public.products (slug, title, price_cents, pdf_path, active)
  values ('flow-test-product-' || v_owner_uid, 'Produto Teste Fluxo', 100, 'flow-test/placeholder.pdf', true)
  returning id into v_product_id;

  insert into public.essay_themes (product_id, title, prompt_text, source_reference, active, sort_order)
  values (v_product_id, 'Tema de teste do fluxo completo', 'Comando de teste para exercitar o fluxo completo.', null, true, 10)
  returning id into v_theme_id;

  insert into public.enrollments (user_id, product_id, status)
  values (v_owner_uid, v_product_id, 'active');

  set local role authenticated;
  perform set_config('request.jwt.claim.sub', v_owner_uid::text, true);

  -- 1) tema visivel ao dono matriculado --------------------------------
  perform 1 from public.essay_themes where id = v_theme_id;
  insert into flow_test_results
  select '1_tema_visivel', exists(select 1 from public.essay_themes where id = v_theme_id), 'ok';

  -- 2) criacao de draft (equivalente a createEssayDraft) ----------------
  insert into public.essay_submissions (user_id, theme_id)
  values (v_owner_uid, v_theme_id)
  returning id into v_submission_id;
  insert into flow_test_results
  select '2_draft_criado', v_submission_id is not null, 'id=' || coalesce(v_submission_id::text, 'null');

  -- 3) texto + salvar rascunho (equivalente a updateEssayDraftText) -----
  update public.essay_submissions
  set essay_text = 'Texto de teste da redacao para validar o fluxo completo.', updated_at = now()
  where id = v_submission_id;
  select essay_text into v_text from public.essay_submissions where id = v_submission_id;
  insert into flow_test_results
  select '3_texto_salvo', v_text = 'Texto de teste da redacao para validar o fluxo completo.', 'ok';

  -- 4) confirmar envio (equivalente a submitEssay) -----------------------
  update public.essay_submissions
  set status = 'submitted', submitted_at = now(), updated_at = now()
  where id = v_submission_id;
  select status into v_status from public.essay_submissions where id = v_submission_id;
  insert into flow_test_results
  select '4_submitted', v_status = 'submitted', 'status=' || v_status;

  -- 5) "recarregar" - releitura pos-envio (equivalente a getMyEssaySubmission) --
  select status, essay_text into v_status, v_text from public.essay_submissions where id = v_submission_id;
  insert into flow_test_results
  select '5_reload_consistente', v_status = 'submitted' and v_text = 'Texto de teste da redacao para validar o fluxo completo.', 'ok';

  -- 6) tentativa de editar apos envio deve falhar silenciosamente -------
  update public.essay_submissions set essay_text = 'tentativa pos-envio' where id = v_submission_id;
  get diagnostics v_count = row_count;
  insert into flow_test_results
  select '6_edicao_pos_envio_bloqueada', v_count = 0, 'linhas_afetadas=' || v_count;

  reset role;
end;
$flow$;

select * from flow_test_results order by step;

rollback;
