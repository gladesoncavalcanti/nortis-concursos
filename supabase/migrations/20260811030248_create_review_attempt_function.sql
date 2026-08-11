-- Registra uma tentativa de revisão sem alterar o ciclo diagnóstico original.
-- A função só aceita questões cuja resposta mais recente do próprio aluno
-- esteja incorreta e mantém matrícula e especialidade como guardas de acesso.
create or replace function public.submit_review_attempt(
  p_question_id uuid,
  p_selected_option_id uuid
)
returns table (
  attempt_id uuid,
  is_correct boolean,
  correct_option_id uuid,
  explanation text,
  answered_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_product_id uuid;
  v_specialty_id uuid;
  v_diagnostic_eligible boolean;
  v_correct_option_id uuid;
  v_explanation text;
  v_latest_attempt_id uuid;
  v_latest_is_correct boolean;
  v_attempt_id uuid;
  v_is_correct boolean;
  v_answered_at timestamptz;
begin
  if v_user_id is null then
    raise exception 'authentication_required';
  end if;

  select question.product_id,
         subject.parent_id,
         question.diagnostic_eligible,
         solution.correct_option_id,
         question.explanation
    into v_product_id,
         v_specialty_id,
         v_diagnostic_eligible,
         v_correct_option_id,
         v_explanation
  from public.questions question
  join public.question_solutions solution
    on solution.question_id = question.id
  left join public.syllabus_nodes subject
    on subject.id = question.syllabus_node_id
   and subject.node_type = 'subject'
  where question.id = p_question_id
    and question.active = true;

  if v_product_id is null then
    raise exception 'question_not_found';
  end if;

  if not exists (
    select 1
    from public.enrollments enrollment
    where enrollment.product_id = v_product_id
      and enrollment.user_id = v_user_id
      and enrollment.status = 'active'
      and (enrollment.expires_at is null or enrollment.expires_at > now())
  ) then
    raise exception 'access_denied';
  end if;

  if v_diagnostic_eligible and (
    v_specialty_id is null
    or not exists (
      select 1
      from public.student_study_profiles profile
      where profile.user_id = v_user_id
        and profile.target_specialty_id = v_specialty_id
    )
  ) then
    raise exception 'specialty_mismatch';
  end if;

  if not exists (
    select 1
    from public.question_options option
    where option.id = p_selected_option_id
      and option.question_id = p_question_id
  ) then
    raise exception 'invalid_option';
  end if;

  select attempt.id, attempt.is_correct
    into v_latest_attempt_id, v_latest_is_correct
  from public.question_attempts attempt
  where attempt.user_id = v_user_id
    and attempt.question_id = p_question_id
  order by attempt.answered_at desc, attempt.id desc
  limit 1;

  if v_latest_attempt_id is null or v_latest_is_correct then
    raise exception 'review_not_pending';
  end if;

  insert into public.question_attempts (
    user_id,
    question_id,
    selected_option_id,
    is_correct,
    attempt_context,
    specialty_id,
    diagnostic_cycle_id
  ) values (
    v_user_id,
    p_question_id,
    p_selected_option_id,
    p_selected_option_id = v_correct_option_id,
    'practice',
    null,
    null
  )
  returning question_attempts.id,
            question_attempts.is_correct,
            question_attempts.answered_at
    into v_attempt_id, v_is_correct, v_answered_at;

  return query
  select v_attempt_id,
         v_is_correct,
         v_correct_option_id,
         v_explanation,
         v_answered_at;
end;
$$;

revoke all on function public.submit_review_attempt(uuid, uuid) from public, anon;
grant execute on function public.submit_review_attempt(uuid, uuid) to authenticated;
