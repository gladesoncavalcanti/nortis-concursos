-- Teste de integração de RLS da Fundação Discursiva (essay_themes /
-- essay_submissions). Roda inteiramente dentro de UMA transação com
-- ROLLBACK no final — nenhuma linha criada aqui persiste, nenhum dado
-- real é modificado. Não contém credenciais: espera-se que seja
-- executado via `supabase db query --linked -f <este arquivo>` (ou
-- --db-url), usando a sessão já autenticada da CLI.
--
-- Estratégia: usa o único usuário real existente no projeto como
-- "proprietário" das fixtures de teste (sem nunca persistir nada nele,
-- por causa do ROLLBACK) e UUIDs sintéticos aleatórios como "outros
-- usuários" para os testes de negação de acesso — a policy de RLS
-- (`user_id = auth.uid()`) não valida se auth.uid() corresponde a um
-- usuário real, então isso testa exatamente a mesma fronteira de
-- segurança.
--
-- Requer que exista pelo menos 1 linha em auth.users e pelo menos 1
-- linha em public.products no projeto vinculado.

begin;

create temporary table rls_test_results (
  scenario text primary key,
  passed boolean not null,
  detail text
) on commit drop;

-- tabela temporária, existe só dentro desta transação (que termina em
-- ROLLBACK) — conceder acesso amplo aos papéis simulados no teste é
-- inofensivo e necessário para registrar o resultado de cada cenário
-- enquanto o role está trocado para anon/authenticated.
grant select, insert on rls_test_results to anon, authenticated;

do $$
declare
  v_owner_uid uuid;
  v_other_uid uuid := gen_random_uuid();
  v_product_a uuid;
  v_product_b uuid;
  v_theme_a uuid;
  v_theme_b uuid;
  v_submission_id uuid;
  v_count integer;
begin
  -- reset para role privilegiado antes de cada bloco de setup
  reset role;
  reset request.jwt.claim.sub;

  select id into v_owner_uid from auth.users limit 1;
  if v_owner_uid is null then
    insert into rls_test_results values ('setup', false, 'Nenhum usuário real encontrado em auth.users — suíte pulada.');
    return;
  end if;

  -- fixtures: 2 produtos de teste, o usuário real matriculado só no A
  insert into public.products (slug, title, pdf_path, price_cents, active)
  values ('rls-test-product-a-' || v_owner_uid, 'RLS TEST PRODUCT A (apagar)', 'rls-test/placeholder.pdf', 100, true)
  returning id into v_product_a;
  insert into public.products (slug, title, pdf_path, price_cents, active)
  values ('rls-test-product-b-' || v_owner_uid, 'RLS TEST PRODUCT B (apagar)', 'rls-test/placeholder.pdf', 100, true)
  returning id into v_product_b;

  insert into public.essay_themes (product_id, title, prompt_text)
  values (v_product_a, 'RLS TEST THEME A', 'Enunciado de teste, nunca persiste — só existe dentro da transação de teste.')
  returning id into v_theme_a;
  insert into public.essay_themes (product_id, title, prompt_text)
  values (v_product_b, 'RLS TEST THEME B', 'Enunciado de teste, nunca persiste — só existe dentro da transação de teste.')
  returning id into v_theme_b;

  insert into public.enrollments (user_id, product_id, status)
  values (v_owner_uid, v_product_a, 'active');
  -- propositalmente SEM matrícula em v_product_b (para o cenário 16)

  -- === 1) anon não acessa temas/submissões privadas ===
  -- anon não tem NENHUM grant nas duas tabelas (revoke all ... from
  -- anon), então a tentativa nem chega a ser filtrada por RLS: o
  -- Postgres já nega no nível de permissão de tabela (mais forte que
  -- só RLS). Ambos os desfechos (permission denied OU 0 linhas) contam
  -- como sucesso do teste.
  reset role;
  set local role anon;
  reset request.jwt.claim.sub;
  begin
    select count(*) into v_count from public.essay_themes where id = v_theme_a;
    insert into rls_test_results values ('1_anon_nao_le_tema', v_count = 0, 'linhas visíveis=' || v_count);
  exception when insufficient_privilege then
    insert into rls_test_results values ('1_anon_nao_le_tema', true, 'permission denied conforme esperado (sem grant a anon)');
  end;

  begin
    select count(*) into v_count from public.essay_submissions;
    insert into rls_test_results values ('1b_anon_nao_le_submissions', v_count = 0, 'linhas visíveis=' || v_count);
  exception when insufficient_privilege then
    insert into rls_test_results values ('1b_anon_nao_le_submissions', true, 'permission denied conforme esperado (sem grant a anon)');
  end;

  -- === 2) autenticado sem matrícula não lê tema ===
  reset role;
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', v_other_uid::text, true);
  select count(*) into v_count from public.essay_themes where id = v_theme_a;
  insert into rls_test_results values ('2_sem_matricula_nao_le_tema', v_count = 0, 'linhas visíveis=' || v_count);

  -- === 3) matriculado lê tema ativo permitido ===
  reset role;
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', v_owner_uid::text, true);
  select count(*) into v_count from public.essay_themes where id = v_theme_a;
  insert into rls_test_results values ('3_matriculado_le_tema', v_count = 1, 'linhas visíveis=' || v_count);

  -- === 6) proprietário pode criar seu draft ===
  reset role;
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', v_owner_uid::text, true);
  begin
    insert into public.essay_submissions (user_id, theme_id)
    values (v_owner_uid, v_theme_a)
    returning id into v_submission_id;
    insert into rls_test_results values ('6_dono_cria_draft', v_submission_id is not null, 'id=' || v_submission_id);
  exception when others then
    insert into rls_test_results values ('6_dono_cria_draft', false, sqlerrm);
  end;

  -- === 4) usuário A (sintético) não lê submission do dono ===
  reset role;
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', v_other_uid::text, true);
  select count(*) into v_count from public.essay_submissions where id = v_submission_id;
  insert into rls_test_results values ('4_outro_nao_le_submission', v_count = 0, 'linhas visíveis=' || v_count);

  -- === 5) usuário A (sintético) não altera submission do dono ===
  update public.essay_submissions set essay_text = 'invasão' where id = v_submission_id;
  get diagnostics v_count = row_count;
  insert into rls_test_results values ('5_outro_nao_altera_submission', v_count = 0, 'linhas afetadas=' || v_count);

  -- === 7) draft pode ser atualizado enquanto continua draft ===
  reset role;
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', v_owner_uid::text, true);
  update public.essay_submissions set essay_text = 'Rascunho de teste, nunca persiste.' where id = v_submission_id;
  get diagnostics v_count = row_count;
  insert into rls_test_results values ('7_dono_atualiza_draft', v_count = 1, 'linhas afetadas=' || v_count);

  -- === 9) texto vazio não pode ser enviado (constraint de banco) ===
  begin
    update public.essay_submissions set status = 'submitted', submitted_at = now(), essay_text = '   '
    where id = v_submission_id;
    insert into rls_test_results values ('9_texto_vazio_bloqueado', false, 'UPDATE não deveria ter sido aceito');
  exception when check_violation then
    insert into rls_test_results values ('9_texto_vazio_bloqueado', true, 'check_violation conforme esperado: ' || sqlerrm);
  end;

  -- === 11/12/13) aluno não pode pular direto para processing/corrected/failed ===
  -- USING ainda casa (linha é do dono e continua 'draft'), mas o novo
  -- valor de status viola o WITH CHECK -> Postgres levanta erro de RLS
  -- em vez de simplesmente não afetar linhas.
  begin
    update public.essay_submissions set status = 'processing', submitted_at = now(), essay_text = 'x' where id = v_submission_id;
    insert into rls_test_results values ('11_nao_pula_para_processing', false, 'UPDATE não deveria ter sido aceito');
  exception when insufficient_privilege then
    insert into rls_test_results values ('11_nao_pula_para_processing', true, 'RLS bloqueou conforme esperado: ' || sqlerrm);
  end;

  begin
    update public.essay_submissions set status = 'corrected', submitted_at = now(), essay_text = 'x' where id = v_submission_id;
    insert into rls_test_results values ('12_nao_pula_para_corrected', false, 'UPDATE não deveria ter sido aceito');
  exception when insufficient_privilege then
    insert into rls_test_results values ('12_nao_pula_para_corrected', true, 'RLS bloqueou conforme esperado: ' || sqlerrm);
  end;

  begin
    update public.essay_submissions set status = 'failed', submitted_at = now(), essay_text = 'x' where id = v_submission_id;
    insert into rls_test_results values ('13_nao_pula_para_failed', false, 'UPDATE não deveria ter sido aceito');
  exception when insufficient_privilege then
    insert into rls_test_results values ('13_nao_pula_para_failed', true, 'RLS bloqueou conforme esperado: ' || sqlerrm);
  end;

  -- === 14) aluno não pode reassociar submission a outro usuário ===
  begin
    update public.essay_submissions set user_id = v_other_uid where id = v_submission_id;
    insert into rls_test_results values ('14_nao_reassocia_user_id', false, 'UPDATE não deveria ter sido aceito');
  exception when insufficient_privilege then
    insert into rls_test_results values ('14_nao_reassocia_user_id', true, 'RLS bloqueou conforme esperado: ' || sqlerrm);
  end;

  -- === 14b) aluno não pode trocar o tema de uma submission existente
  -- para um tema de outro produto (fugir da matrícula original) ===
  begin
    update public.essay_submissions set theme_id = v_theme_b where id = v_submission_id;
    insert into rls_test_results values ('14b_nao_troca_theme_id', false, 'UPDATE não deveria ter sido aceito');
  exception when insufficient_privilege then
    insert into rls_test_results values ('14b_nao_troca_theme_id', true, 'RLS bloqueou conforme esperado: ' || sqlerrm);
  end;

  -- === 17) cliente não pode inserir tema (nenhum grant de insert) ===
  begin
    insert into public.essay_themes (product_id, title, prompt_text)
    values (v_product_a, 'TEMA INJETADO PELO CLIENTE', 'Não deveria ser possível inserir um tema pelo client.');
    insert into rls_test_results values ('17_cliente_nao_insere_tema', false, 'INSERT não deveria ter sido aceito');
  exception when insufficient_privilege then
    insert into rls_test_results values ('17_cliente_nao_insere_tema', true, 'permission denied conforme esperado (sem grant de insert): ' || sqlerrm);
  end;

  -- === 18) cliente não pode modificar tema (nenhum grant de update) ===
  begin
    update public.essay_themes set title = 'TEMA ADULTERADO PELO CLIENTE' where id = v_theme_a;
    insert into rls_test_results values ('18_cliente_nao_modifica_tema', false, 'UPDATE não deveria ter sido aceito');
  exception when insufficient_privilege then
    insert into rls_test_results values ('18_cliente_nao_modifica_tema', true, 'permission denied conforme esperado (sem grant de update): ' || sqlerrm);
  end;

  -- === 8) draft pode transicionar para submitted (com texto válido) ===
  update public.essay_submissions set status = 'submitted', submitted_at = now(), essay_text = 'Redação de teste concluída, nunca persiste.'
  where id = v_submission_id;
  get diagnostics v_count = row_count;
  insert into rls_test_results values ('8_draft_para_submitted', v_count = 1, 'linhas afetadas=' || v_count);

  -- === 10) submitted não pode ser editada pelo aluno ===
  update public.essay_submissions set essay_text = 'tentativa pós-envio' where id = v_submission_id;
  get diagnostics v_count = row_count;
  insert into rls_test_results values ('10_submitted_nao_editavel', v_count = 0, 'linhas afetadas=' || v_count);

  -- === 15) aluno não pode excluir submission ===
  -- authenticated não tem NENHUM grant de DELETE na tabela (revoke all
  -- + grant só select/insert/update) — nega no nível de permissão,
  -- antes mesmo de RLS entrar em jogo.
  begin
    delete from public.essay_submissions where id = v_submission_id;
    insert into rls_test_results values ('15_nao_exclui_submission', false, 'DELETE não deveria ter sido aceito');
  exception when insufficient_privilege then
    insert into rls_test_results values ('15_nao_exclui_submission', true, 'permission denied conforme esperado (sem grant de delete): ' || sqlerrm);
  end;

  -- === 16) sem matrícula no produto do tema não cria submission ===
  begin
    insert into public.essay_submissions (user_id, theme_id) values (v_owner_uid, v_theme_b)
    returning id into v_submission_id;
    insert into rls_test_results values ('16_sem_matricula_nao_cria', false, 'INSERT não deveria ter sido aceito');
  exception when others then
    insert into rls_test_results values ('16_sem_matricula_nao_cria', true, sqlerrm);
  end;

  reset role;
  reset request.jwt.claim.sub;
end $$;

select scenario, passed, detail from rls_test_results order by scenario;

rollback;
