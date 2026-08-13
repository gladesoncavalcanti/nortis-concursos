alter table public.learning_modules drop constraint learning_modules_module_type_check;
alter table public.learning_modules add constraint learning_modules_module_type_check check(module_type in('material','edital','questions','simulations','discursive','review','flashcards','plan','community','tutor'));
insert into public.learning_modules(slug,title,description,module_type,route_path,sort_order)
values('tutor-de-estudo','Tutor Nortis','Receba orientação privada baseada no seu progresso real.','tutor','/minha-conta/tutor',90)
on conflict(slug) do update set title=excluded.title,description=excluded.description,module_type=excluded.module_type,route_path=excluded.route_path,sort_order=excluded.sort_order;
insert into public.product_modules(product_id,module_id,sort_order)
select p.id,m.id,90 from public.products p join public.learning_modules m on m.slug='tutor-de-estudo'
where p.active=true on conflict(product_id,module_id) do nothing;
