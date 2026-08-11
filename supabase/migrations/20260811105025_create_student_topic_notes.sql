create table public.student_topic_notes (
  user_id uuid not null references auth.users(id) on delete cascade,
  syllabus_node_id uuid not null references public.syllabus_nodes(id) on delete cascade,
  note text not null check (char_length(btrim(note)) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, syllabus_node_id)
);

create index student_topic_notes_node_user_idx
  on public.student_topic_notes(syllabus_node_id, user_id);

alter table public.student_topic_notes enable row level security;

create policy "topic_notes_self_read"
on public.student_topic_notes for select
to authenticated
using (user_id = (select auth.uid()));

create policy "topic_notes_enrolled_insert"
on public.student_topic_notes for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.syllabus_nodes node
    join public.enrollments enrollment on enrollment.product_id = node.product_id
    where node.id = syllabus_node_id
      and enrollment.user_id = (select auth.uid())
      and enrollment.status = 'active'
      and (enrollment.expires_at is null or enrollment.expires_at > now())
  )
);

create policy "topic_notes_enrolled_update"
on public.student_topic_notes for update
to authenticated
using (user_id = (select auth.uid()))
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.syllabus_nodes node
    join public.enrollments enrollment on enrollment.product_id = node.product_id
    where node.id = syllabus_node_id
      and enrollment.user_id = (select auth.uid())
      and enrollment.status = 'active'
      and (enrollment.expires_at is null or enrollment.expires_at > now())
  )
);

create policy "topic_notes_self_delete"
on public.student_topic_notes for delete
to authenticated
using (user_id = (select auth.uid()));

revoke all on public.student_topic_notes from anon, authenticated;
grant select, insert, update, delete on public.student_topic_notes to authenticated;
