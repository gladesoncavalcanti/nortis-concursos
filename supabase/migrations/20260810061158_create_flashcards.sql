create table public.flashcard_decks (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  syllabus_node_id uuid references public.syllabus_nodes(id) on delete set null,
  title text not null,
  description text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.flashcards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.flashcard_decks(id) on delete cascade,
  front_text text not null,
  back_text text not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.flashcard_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  flashcard_id uuid not null references public.flashcards(id) on delete cascade,
  repetitions integer not null default 0 check (repetitions >= 0),
  interval_days integer not null default 0 check (interval_days >= 0),
  ease_factor numeric(4,2) not null default 2.50 check (ease_factor between 1.30 and 3.00),
  last_rating text check (last_rating in ('again','hard','good','easy')),
  last_reviewed_at timestamptz,
  next_review_at timestamptz not null default now(),
  primary key(user_id,flashcard_id)
);

create index flashcard_decks_product_sort_idx on public.flashcard_decks(product_id,sort_order);
create index flashcards_deck_sort_idx on public.flashcards(deck_id,sort_order);
create index flashcard_progress_due_idx on public.flashcard_progress(user_id,next_review_at);

alter table public.flashcard_decks enable row level security;
alter table public.flashcards enable row level security;
alter table public.flashcard_progress enable row level security;

create policy "flashcard_decks_enrolled_read" on public.flashcard_decks for select to authenticated using (
  active and exists(select 1 from public.enrollments e where e.product_id=flashcard_decks.product_id
    and e.user_id=(select auth.uid()) and e.status='active'
    and (e.expires_at is null or e.expires_at>now()))
);
create policy "flashcards_enrolled_read" on public.flashcards for select to authenticated using (
  active and exists(select 1 from public.flashcard_decks d where d.id=flashcards.deck_id)
);
create policy "flashcard_progress_self_read" on public.flashcard_progress for select to authenticated using (
  user_id=(select auth.uid())
);

revoke all on public.flashcard_decks,public.flashcards,public.flashcard_progress from anon;
grant select on public.flashcard_decks,public.flashcards,public.flashcard_progress to authenticated;

create or replace function public.review_flashcard(p_flashcard_id uuid,p_rating text)
returns table(repetitions integer,interval_days integer,ease_factor numeric,next_review_at timestamptz)
language plpgsql security definer set search_path=public as $$
declare v_user uuid:=auth.uid();v_product uuid;v_reps integer;v_interval integer;v_ease numeric(4,2);v_next timestamptz;
begin
  if v_user is null then raise exception 'authentication_required'; end if;
  if p_rating not in ('again','hard','good','easy') then raise exception 'invalid_rating'; end if;
  select d.product_id into v_product from public.flashcards f join public.flashcard_decks d on d.id=f.deck_id
    where f.id=p_flashcard_id and f.active and d.active;
  if v_product is null then raise exception 'flashcard_not_found'; end if;
  if not exists(select 1 from public.enrollments e where e.product_id=v_product and e.user_id=v_user
    and e.status='active' and (e.expires_at is null or e.expires_at>now())) then raise exception 'access_denied'; end if;

  select fp.repetitions,fp.interval_days,fp.ease_factor into v_reps,v_interval,v_ease
    from public.flashcard_progress fp where fp.user_id=v_user and fp.flashcard_id=p_flashcard_id;
  v_reps:=coalesce(v_reps,0);v_interval:=coalesce(v_interval,0);v_ease:=coalesce(v_ease,2.50);
  if p_rating='again' then v_reps:=0;v_interval:=0;v_ease:=greatest(1.30,v_ease-0.20);v_next:=now()+interval '10 minutes';
  elsif p_rating='hard' then v_reps:=v_reps+1;v_interval:=greatest(1,ceil(greatest(v_interval,1)*1.20)::integer);v_ease:=greatest(1.30,v_ease-0.15);v_next:=now()+make_interval(days=>v_interval);
  elsif p_rating='good' then v_reps:=v_reps+1;v_interval:=case when v_reps=1 then 1 when v_reps=2 then 3 else greatest(1,round(v_interval*v_ease)::integer) end;v_next:=now()+make_interval(days=>v_interval);
  else v_reps:=v_reps+1;v_interval:=case when v_reps=1 then 3 else greatest(4,round(greatest(v_interval,1)*v_ease*1.30)::integer) end;v_ease:=least(3.00,v_ease+0.15);v_next:=now()+make_interval(days=>v_interval);end if;

  insert into public.flashcard_progress(user_id,flashcard_id,repetitions,interval_days,ease_factor,last_rating,last_reviewed_at,next_review_at)
  values(v_user,p_flashcard_id,v_reps,v_interval,v_ease,p_rating,now(),v_next)
  on conflict(user_id,flashcard_id) do update set repetitions=excluded.repetitions,interval_days=excluded.interval_days,
    ease_factor=excluded.ease_factor,last_rating=excluded.last_rating,last_reviewed_at=excluded.last_reviewed_at,next_review_at=excluded.next_review_at;
  return query select v_reps,v_interval,v_ease,v_next;
end;$$;

revoke all on function public.review_flashcard(uuid,text) from public,anon;
grant execute on function public.review_flashcard(uuid,text) to authenticated;

alter table public.learning_modules drop constraint learning_modules_module_type_check;
alter table public.learning_modules add constraint learning_modules_module_type_check
  check(module_type in ('material','edital','questions','simulations','discursive','review','flashcards'));

insert into public.learning_modules(slug,title,description,module_type,route_path,sort_order)
values('flashcards','Flashcards','Revise conteúdos com repetição espaçada adaptada às suas respostas.','flashcards','/minha-conta/flashcards',60)
on conflict(slug) do update set title=excluded.title,description=excluded.description,module_type=excluded.module_type,route_path=excluded.route_path,sort_order=excluded.sort_order;
insert into public.product_modules(product_id,module_id,sort_order)
select p.id,m.id,60 from public.products p join public.learning_modules m on m.slug='flashcards'
where p.active=true on conflict(product_id,module_id) do nothing;

-- Nenhum cartão é semeado sem validação editorial.
