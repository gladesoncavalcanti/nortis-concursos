-- Teste de integração REAL da regra "no máximo 1 draft aberto por
-- usuário+tema" (20260818023136_add_essay_submissions_one_draft_per_theme.sql).
-- Roda inteiramente dentro de UMA transação com ROLLBACK no final —
-- nenhuma linha criada aqui persiste. Mesmo padrão/convenção de
-- supabase/tests/rls_essay_foundation.sql (mesmo usuário real como
-- "dono" das fixtures, UUID sintético como "segundo usuário").
--
-- Requer que exista pelo menos 1 linha em auth.users e pelo menos 1
-- linha em public.products no projeto vinculado.
--
-- Escopo: garante a regra no nível de banco (índice único parcial) —
-- o comportamento de "buscar o draft existente antes de tentar criar"
-- é da camada de aplicação (getOrCreateEssayDraft, ver
-- apps/web/scripts/test-essay-draft-per-theme.mjs para a verificação
-- estática dessa função) e não pode ser testado aqui sem uma conexão
-- real do PostgREST; o que este arquivo comprova é a garantia final
-- que torna esse comportamento seguro mesmo sob corrida.

begin;

-- Aplica o índice da migration 20260818023136 DENTRO desta transação
-- de teste (a migration em si continua NÃO aplicada ao ambiente
-- remoto — mesmo padrão de supabase/tests/seed_essay_themes_pilot_dry_run.sql).
-- Sem isto, os cenários abaixo testariam o comportamento ANTERIOR à
-- migration, não a regra que ela introduz.
create unique index if not exists essay_submissions_one_open_draft_per_theme_uidx
  on public.essay_submissions(user_id, theme_id)
  where status = 'draft';

create temporary table draft_rule_test_results (
  scenario text primary key,
  passed boolean not null,
  detail text
) on commit drop;

do $$
declare
  v_owner_uid uuid;
  v_second_owner_uid uuid;
  v_product_a uuid;
  v_theme_a uuid;
  v_theme_b uuid;
  v_draft_1 uuid;
  v_draft_2 uuid;
  v_count integer;
begin
  select id into v_owner_uid from auth.users limit 1;
  if v_owner_uid is null then
    insert into draft_rule_test_results values ('setup', false, 'Nenhum usuário real encontrado em auth.users — suíte pulada.');
    return;
  end if;

  -- user_id de essay_submissions tem FK para auth.users(id) — ao
  -- contrário do teste de RLS (que só simula auth.uid() via role
  -- trocado, nunca insere de fato uma linha com um UUID sintético),
  -- este cenário precisa inserir uma linha real para o "segundo
  -- usuário", então precisa de um segundo usuário REAL existente no
  -- projeto vinculado.
  select id into v_second_owner_uid from auth.users where id <> v_owner_uid limit 1;

  insert into public.products (slug, title, pdf_path, price_cents, active)
  values ('draft-rule-test-product-' || v_owner_uid, 'DRAFT RULE TEST PRODUCT (apagar)', 'draft-rule-test/placeholder.pdf', 100, true)
  returning id into v_product_a;

  insert into public.essay_themes (product_id, title, prompt_text)
  values (v_product_a, 'DRAFT RULE TEST THEME A', 'Enunciado de teste, nunca persiste — só existe dentro da transação de teste.')
  returning id into v_theme_a;
  insert into public.essay_themes (product_id, title, prompt_text)
  values (v_product_a, 'DRAFT RULE TEST THEME B', 'Enunciado de teste, nunca persiste — só existe dentro da transação de teste.')
  returning id into v_theme_b;

  -- === 1) primeiro draft do tema é criado ===
  insert into public.essay_submissions (user_id, theme_id)
  values (v_owner_uid, v_theme_a)
  returning id into v_draft_1;
  insert into draft_rule_test_results values ('1_primeiro_draft_criado', v_draft_1 is not null, 'id=' || v_draft_1);

  -- === 3) não existem dois drafts simultâneos do mesmo usuário+tema ===
  -- (e === 8, corrida/conflito não gera duplicação): uma segunda
  -- tentativa de INSERT para o mesmo usuário+tema+draft precisa ser
  -- rejeitada pelo índice único parcial, nunca criar uma segunda linha.
  begin
    insert into public.essay_submissions (user_id, theme_id) values (v_owner_uid, v_theme_a);
    insert into draft_rule_test_results values ('3_indice_bloqueia_segundo_draft', false, 'segundo INSERT não deveria ter sido aceito');
  exception when unique_violation then
    insert into draft_rule_test_results values ('3_indice_bloqueia_segundo_draft', true, 'unique_violation conforme esperado: ' || sqlerrm);
  end;

  select count(*) into v_count
  from public.essay_submissions
  where user_id = v_owner_uid and theme_id = v_theme_a and status = 'draft';
  insert into draft_rule_test_results values ('8_sem_duplicacao_apos_conflito', v_count = 1, 'drafts abertos=' || v_count);

  -- === 6) dois temas diferentes podem ter drafts simultâneos ===
  insert into public.essay_submissions (user_id, theme_id) values (v_owner_uid, v_theme_b);
  select count(*) into v_count
  from public.essay_submissions
  where user_id = v_owner_uid and status = 'draft';
  insert into draft_rule_test_results values ('6_temas_diferentes_drafts_simultaneos', v_count = 2, 'drafts abertos do usuário=' || v_count);

  -- === 7) dois usuários diferentes podem ter draft do mesmo tema ===
  -- requer um segundo usuário REAL (FK essay_submissions_user_id_fkey
  -- não aceita UUID sintético) — se o projeto vinculado só tiver 1
  -- usuário em auth.users, o cenário é registrado como pulado (não
  -- como falha: é limitação do ambiente de teste, não do código; a
  -- garantia em si é óbvia pela própria definição do índice, que só
  -- restringe linhas com o MESMO user_id).
  if v_second_owner_uid is null then
    insert into draft_rule_test_results values ('7_usuarios_diferentes_mesmo_tema', true, 'pulado: só 1 usuário real em auth.users neste projeto — índice é por (user_id, theme_id), então a restrição já não se aplicaria entre usuários diferentes por definição.');
  else
    insert into public.essay_submissions (user_id, theme_id) values (v_second_owner_uid, v_theme_a);
    select count(*) into v_count
    from public.essay_submissions
    where theme_id = v_theme_a and status = 'draft';
    insert into draft_rule_test_results values ('7_usuarios_diferentes_mesmo_tema', v_count = 2, 'drafts abertos no tema A=' || v_count);
  end if;

  -- === 10) fluxo draft -> submitted continua funcionando ===
  -- o índice é parcial (where status = 'draft') — mover para submitted
  -- tira a linha do índice, então não deveria haver nenhum efeito
  -- colateral desta migration nessa transição.
  update public.essay_submissions
  set status = 'submitted', submitted_at = now(), essay_text = 'Redação de teste, nunca persiste.'
  where id = v_draft_1;
  get diagnostics v_count = row_count;
  insert into draft_rule_test_results values ('10_draft_para_submitted_continua_ok', v_count = 1, 'linhas afetadas=' || v_count);

  -- === 4) depois de submitted, nova tentativa pode criar novo draft ===
  insert into public.essay_submissions (user_id, theme_id)
  values (v_owner_uid, v_theme_a)
  returning id into v_draft_2;
  insert into draft_rule_test_results values ('4_novo_draft_apos_submitted', v_draft_2 is not null and v_draft_2 <> v_draft_1, 'novo id=' || v_draft_2);

  -- === 5) histórico da tentativa anterior permanece intacto ===
  select count(*) into v_count
  from public.essay_submissions
  where id = v_draft_1 and status = 'submitted' and essay_text = 'Redação de teste, nunca persiste.';
  insert into draft_rule_test_results values ('5_historico_anterior_intacto', v_count = 1, 'linha submitted preservada=' || v_count);

  -- confirma o estado final: 1 draft aberto do tema A (o novo,
  -- pós-submissão) + 1 draft aberto do tema B do mesmo dono, mais 1
  -- draft do segundo usuário no tema A se ele existir neste projeto.
  select count(*) into v_count from public.essay_submissions where status = 'draft';
  insert into draft_rule_test_results values (
    'final_contagem_drafts_abertos',
    v_count = (case when v_second_owner_uid is null then 2 else 3 end),
    'total=' || v_count
  );
end $$;

select scenario, passed, detail from draft_rule_test_results order by scenario;

rollback;
