-- Ativa os flashcards da Central Nortis com um baralho por especialidade.
-- Cada cartao reutiliza exclusivamente os blocos oficiais ja cadastrados no
-- edital verticalizado. A migration tambem impede leitura e revisao de cartoes
-- pertencentes a outra especialidade.

drop policy if exists "flashcard_decks_enrolled_read" on public.flashcard_decks;
create policy "flashcard_decks_enrolled_read" on public.flashcard_decks
  for select
  to authenticated
  using (
    active
    and exists (
      select 1
      from public.enrollments enrollment
      where enrollment.product_id = flashcard_decks.product_id
        and enrollment.user_id = (select auth.uid())
        and enrollment.status = 'active'
        and (enrollment.expires_at is null or enrollment.expires_at > now())
    )
    and (
      flashcard_decks.syllabus_node_id is null
      or exists (
        select 1
        from public.student_study_profiles profile
        where profile.user_id = (select auth.uid())
          and profile.target_specialty_id = flashcard_decks.syllabus_node_id
      )
    )
  );

drop policy if exists "flashcards_enrolled_read" on public.flashcards;
create policy "flashcards_enrolled_read" on public.flashcards
  for select
  to authenticated
  using (
    active
    and exists (
      select 1
      from public.flashcard_decks deck
      join public.enrollments enrollment
        on enrollment.product_id = deck.product_id
       and enrollment.user_id = (select auth.uid())
       and enrollment.status = 'active'
       and (enrollment.expires_at is null or enrollment.expires_at > now())
      left join public.student_study_profiles profile
        on profile.user_id = (select auth.uid())
      where deck.id = flashcards.deck_id
        and deck.active
        and (
          deck.syllabus_node_id is null
          or profile.target_specialty_id = deck.syllabus_node_id
        )
    )
  );

create or replace function public.review_flashcard(
  p_flashcard_id uuid,
  p_rating text
)
returns table(
  repetitions integer,
  interval_days integer,
  ease_factor numeric,
  next_review_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_product uuid;
  v_specialty uuid;
  v_reps integer;
  v_interval integer;
  v_ease numeric(4,2);
  v_next timestamptz;
begin
  if v_user is null then
    raise exception 'authentication_required';
  end if;

  if p_rating not in ('again', 'hard', 'good', 'easy') then
    raise exception 'invalid_rating';
  end if;

  select deck.product_id, deck.syllabus_node_id
    into v_product, v_specialty
  from public.flashcards card
  join public.flashcard_decks deck on deck.id = card.deck_id
  where card.id = p_flashcard_id
    and card.active
    and deck.active;

  if v_product is null then
    raise exception 'flashcard_not_found';
  end if;

  if not exists (
    select 1
    from public.enrollments enrollment
    where enrollment.product_id = v_product
      and enrollment.user_id = v_user
      and enrollment.status = 'active'
      and (enrollment.expires_at is null or enrollment.expires_at > now())
  ) then
    raise exception 'access_denied';
  end if;

  if v_specialty is not null and not exists (
    select 1
    from public.student_study_profiles profile
    where profile.user_id = v_user
      and profile.target_specialty_id = v_specialty
  ) then
    raise exception 'specialty_mismatch';
  end if;

  select progress.repetitions, progress.interval_days, progress.ease_factor
    into v_reps, v_interval, v_ease
  from public.flashcard_progress progress
  where progress.user_id = v_user
    and progress.flashcard_id = p_flashcard_id;

  v_reps := coalesce(v_reps, 0);
  v_interval := coalesce(v_interval, 0);
  v_ease := coalesce(v_ease, 2.50);

  if p_rating = 'again' then
    v_reps := 0;
    v_interval := 0;
    v_ease := greatest(1.30, v_ease - 0.20);
    v_next := now() + interval '10 minutes';
  elsif p_rating = 'hard' then
    v_reps := v_reps + 1;
    v_interval := greatest(1, ceil(greatest(v_interval, 1) * 1.20)::integer);
    v_ease := greatest(1.30, v_ease - 0.15);
    v_next := now() + make_interval(days => v_interval);
  elsif p_rating = 'good' then
    v_reps := v_reps + 1;
    v_interval := case
      when v_reps = 1 then 1
      when v_reps = 2 then 3
      else greatest(1, round(v_interval * v_ease)::integer)
    end;
    v_next := now() + make_interval(days => v_interval);
  else
    v_reps := v_reps + 1;
    v_interval := case
      when v_reps = 1 then 3
      else greatest(4, round(greatest(v_interval, 1) * v_ease * 1.30)::integer)
    end;
    v_ease := least(3.00, v_ease + 0.15);
    v_next := now() + make_interval(days => v_interval);
  end if;

  insert into public.flashcard_progress (
    user_id,
    flashcard_id,
    repetitions,
    interval_days,
    ease_factor,
    last_rating,
    last_reviewed_at,
    next_review_at
  ) values (
    v_user,
    p_flashcard_id,
    v_reps,
    v_interval,
    v_ease,
    p_rating,
    now(),
    v_next
  )
  on conflict (user_id, flashcard_id) do update
  set repetitions = excluded.repetitions,
      interval_days = excluded.interval_days,
      ease_factor = excluded.ease_factor,
      last_rating = excluded.last_rating,
      last_reviewed_at = excluded.last_reviewed_at,
      next_review_at = excluded.next_review_at;

  return query select v_reps, v_interval, v_ease, v_next;
end;
$$;

revoke all on function public.review_flashcard(uuid, text) from public, anon;
grant execute on function public.review_flashcard(uuid, text) to authenticated;

insert into public.flashcard_decks (
  product_id,
  syllabus_node_id,
  title,
  description,
  sort_order
)
select
  specialty.product_id,
  specialty.id,
  'Revisão — ' || specialty.title,
  'Cartões baseados nos blocos oficiais da especialidade selecionada.',
  specialty.sort_order
from public.syllabus_nodes specialty
where specialty.node_type = 'specialty'
  and specialty.active
  and not exists (
    select 1
    from public.flashcard_decks existing
    where existing.product_id = specialty.product_id
      and existing.syllabus_node_id = specialty.id
  );

insert into public.flashcards (
  deck_id,
  front_text,
  back_text,
  sort_order
)
select
  deck.id,
  'Quais pontos do edital devem ser revisados em “' || subject.title || '”?',
  subject.description,
  subject.sort_order
from public.flashcard_decks deck
join public.syllabus_nodes specialty
  on specialty.id = deck.syllabus_node_id
 and specialty.node_type = 'specialty'
 and specialty.active
join public.syllabus_nodes subject
  on subject.parent_id = specialty.id
 and subject.product_id = specialty.product_id
 and subject.node_type = 'subject'
 and subject.active
where not exists (
  select 1
  from public.flashcards existing
  where existing.deck_id = deck.id
    and existing.front_text = 'Quais pontos do edital devem ser revisados em “' || subject.title || '”?'
);
