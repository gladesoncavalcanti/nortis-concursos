alter table public.study_plan_items
  add column item_source text not null default 'manual';

alter table public.study_plan_items
  add constraint study_plan_items_source_check
  check (item_source in ('manual', 'suggested'));

create index study_plan_items_suggested_week_idx
  on public.study_plan_items(user_id, product_id, scheduled_date)
  where item_source = 'suggested';
