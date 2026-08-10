create table public.community_posts(
 id uuid primary key default gen_random_uuid(),product_id uuid not null references public.products(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,title text not null check(char_length(title) between 5 and 140),
 body text not null check(char_length(body) between 10 and 3000),status text not null default 'pending' check(status in('pending','approved','rejected')),
 created_at timestamptz not null default now(),moderated_at timestamptz
);
create table public.community_replies(
 id uuid primary key default gen_random_uuid(),post_id uuid not null references public.community_posts(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,body text not null check(char_length(body) between 2 and 2000),
 status text not null default 'pending' check(status in('pending','approved','rejected')),created_at timestamptz not null default now(),moderated_at timestamptz
);
create index community_posts_product_status_idx on public.community_posts(product_id,status,created_at desc);
create index community_replies_post_status_idx on public.community_replies(post_id,status,created_at);
alter table public.community_posts enable row level security;alter table public.community_replies enable row level security;
create policy "community_posts_enrolled_read" on public.community_posts for select to authenticated using(
 (status='approved' or user_id=(select auth.uid())) and exists(select 1 from public.enrollments e where e.product_id=community_posts.product_id and e.user_id=(select auth.uid()) and e.status='active' and(e.expires_at is null or e.expires_at>now()))
);
create policy "community_posts_self_insert" on public.community_posts for insert to authenticated with check(
 user_id=(select auth.uid()) and status='pending' and exists(select 1 from public.enrollments e where e.product_id=community_posts.product_id and e.user_id=(select auth.uid()) and e.status='active' and(e.expires_at is null or e.expires_at>now()))
);
create policy "community_posts_self_delete" on public.community_posts for delete to authenticated using(user_id=(select auth.uid()) and status='pending');
create policy "community_replies_enrolled_read" on public.community_replies for select to authenticated using(
 (status='approved' or user_id=(select auth.uid())) and exists(select 1 from public.community_posts p join public.enrollments e on e.product_id=p.product_id where p.id=community_replies.post_id and e.user_id=(select auth.uid()) and e.status='active' and(e.expires_at is null or e.expires_at>now()))
);
create policy "community_replies_self_insert" on public.community_replies for insert to authenticated with check(
 user_id=(select auth.uid()) and status='pending' and exists(select 1 from public.community_posts p join public.enrollments e on e.product_id=p.product_id where p.id=community_replies.post_id and p.status='approved' and e.user_id=(select auth.uid()) and e.status='active' and(e.expires_at is null or e.expires_at>now()))
);
create policy "community_replies_self_delete" on public.community_replies for delete to authenticated using(user_id=(select auth.uid()) and status='pending');
revoke all on public.community_posts,public.community_replies from anon;grant select,insert,delete on public.community_posts,public.community_replies to authenticated;
alter table public.learning_modules drop constraint learning_modules_module_type_check;
alter table public.learning_modules add constraint learning_modules_module_type_check check(module_type in('material','edital','questions','simulations','discursive','review','flashcards','plan','community'));
insert into public.learning_modules(slug,title,description,module_type,route_path,sort_order) values('comunidade-moderada','Comunidade','Compartilhe dúvidas em um espaço moderado entre alunos.','community','/minha-conta/comunidade',80)
on conflict(slug) do update set title=excluded.title,description=excluded.description,module_type=excluded.module_type,route_path=excluded.route_path,sort_order=excluded.sort_order;
insert into public.product_modules(product_id,module_id,sort_order) select p.id,m.id,80 from public.products p join public.learning_modules m on m.slug='comunidade-moderada' where p.active=true on conflict(product_id,module_id) do nothing;
