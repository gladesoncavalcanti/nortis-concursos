insert into public.learning_modules(slug,title,description,module_type,route_path,sort_order)
values(
  'progresso-e-revisao',
  'Progresso e revisão',
  'Acompanhe seus resultados e retome os pontos que precisam de atenção.',
  'review',
  '/minha-conta/progresso',
  50
)
on conflict(slug) do update set title=excluded.title,description=excluded.description,
  module_type=excluded.module_type,route_path=excluded.route_path,sort_order=excluded.sort_order;

insert into public.product_modules(product_id,module_id,sort_order)
select p.id,m.id,50 from public.products p
join public.learning_modules m on m.slug='progresso-e-revisao'
where p.active=true on conflict(product_id,module_id) do nothing;

-- O painel deriva métricas das tentativas e sessões existentes; não cria
-- rastreamento paralelo nem concede acesso.
