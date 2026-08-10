-- Amplia o diagnóstico objetivo para Educador Social com uma questão autoral
-- por bloco oficial, sem alterar o motor ou as regras de acesso.
with diagnostic_seed(
  specialty_slug, subject_slug, question_slug, statement,
  explanation, source_reference, sort_order
) as (values
  (
    'educador-social-405',
    '1-fundamentos-da-politica-social-e-dinamica-familiar',
    'diagnostico-educador-social-seguridade-social',
    'Segundo a Constituição Federal, a seguridade social compreende um conjunto integrado de ações destinado a assegurar direitos relativos a quais áreas?',
    'A Constituição define a seguridade social como o conjunto integrado de ações dos Poderes Públicos e da sociedade destinado a assegurar os direitos relativos à saúde, à previdência e à assistência social.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.4.2.6, subitem 1; Constituição da República Federativa do Brasil de 1988, art. 194, caput. Questão autoral Nortis.',
    40510
  ),
  (
    'educador-social-405',
    '2-a-pratica-socioeducativa-nos-servicos-do-suas',
    'diagnostico-educador-social-scfv',
    'Uma equipe organiza atividades coletivas por ciclos de vida para fortalecer vínculos familiares e comunitários. Qual descrição identifica corretamente o Serviço de Convivência e Fortalecimento de Vínculos (SCFV)?',
    'O SCFV integra a Proteção Social Básica do SUAS, realiza atendimentos em grupo e complementa o trabalho social com famílias desenvolvido por meio do PAIF e do PAEFI. Seu caráter é preventivo e voltado ao fortalecimento da convivência e dos vínculos.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.4.2.6, subitem 2; Resolução CNAS nº 109/2009; Ministério do Desenvolvimento e Assistência Social, Serviço de Convivência e Fortalecimento de Vínculos. Questão autoral Nortis.',
    40520
  ),
  (
    'educador-social-405',
    '3-metodologia-do-trabalho-social-e-abordagem',
    'diagnostico-educador-social-planejamento-acoes',
    'Ao preparar uma ação socioeducativa com famílias, qual procedimento favorece um trabalho social tecnicamente orientado?',
    'O trabalho socioeducativo deve partir da realidade e das necessidades identificadas, definir objetivos, planejar e executar as ações, registrar o percurso e utilizar monitoramento e avaliação para qualificar as intervenções. Atividades improvisadas ou sem registro dificultam o acompanhamento.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.4.2.6, subitem 3; Ministério do Desenvolvimento Social, Orientações Técnicas sobre o PAIF, volume 2, capítulos 4.2 a 4.5. Questão autoral Nortis.',
    40530
  ),
  (
    'educador-social-405',
    '4-temas-contemporaneos-e-diretrizes-internacionais',
    'diagnostico-educador-social-melhor-interesse-crianca',
    'Uma instituição de bem-estar social precisa decidir sobre uma medida que afetará diretamente uma criança. Segundo a Convenção sobre os Direitos da Criança, qual critério deve receber consideração primordial?',
    'A Convenção estabelece que todas as ações relativas às crianças realizadas por instituições públicas ou privadas de bem-estar social, tribunais, autoridades administrativas ou órgãos legislativos devem considerar primordialmente o melhor interesse da criança.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.4.2.6, subitem 4; Decreto Federal nº 99.710/1990, Convenção sobre os Direitos da Criança, art. 3º, item 1. Questão autoral Nortis.',
    40540
  )
)
insert into public.questions (
  product_id, syllabus_node_id, slug, statement, explanation,
  authorship, source_reference, diagnostic_eligible, sort_order, active
)
select product.id, subject.id, seed.question_slug, seed.statement,
       seed.explanation, 'Nortis Concursos', seed.source_reference,
       true, seed.sort_order, true
from diagnostic_seed seed
join public.products product
  on product.slug = 'nexo-social-sedes-df-2026'
 and product.active = true
join public.syllabus_nodes specialty
  on specialty.product_id = product.id
 and specialty.slug = seed.specialty_slug
 and specialty.node_type = 'specialty'
join public.syllabus_nodes subject
  on subject.product_id = product.id
 and subject.parent_id = specialty.id
 and subject.slug = seed.subject_slug
 and subject.node_type = 'subject'
on conflict (slug) do update set
  product_id = excluded.product_id,
  syllabus_node_id = excluded.syllabus_node_id,
  statement = excluded.statement,
  explanation = excluded.explanation,
  authorship = excluded.authorship,
  source_reference = excluded.source_reference,
  diagnostic_eligible = excluded.diagnostic_eligible,
  sort_order = excluded.sort_order,
  active = excluded.active,
  updated_at = now();

with option_seed(question_slug, label, option_text, sort_order) as (values
  ('diagnostico-educador-social-seguridade-social','A','Educação, trabalho e habitação.',10),
  ('diagnostico-educador-social-seguridade-social','B','Saúde, previdência e assistência social.',20),
  ('diagnostico-educador-social-seguridade-social','C','Segurança pública, justiça e defesa nacional.',30),
  ('diagnostico-educador-social-seguridade-social','D','Cultura, esporte e lazer.',40),
  ('diagnostico-educador-social-scfv','A','Benefício financeiro individual, concedido automaticamente e sem acompanhamento familiar.',10),
  ('diagnostico-educador-social-scfv','B','Serviço da Proteção Social Especial destinado exclusivamente ao acolhimento institucional.',20),
  ('diagnostico-educador-social-scfv','C','Serviço da Proteção Social Básica, realizado em grupos e complementar ao trabalho social com famílias.',30),
  ('diagnostico-educador-social-scfv','D','Atendimento exclusivamente clínico, individual e desvinculado da rede socioassistencial.',40),
  ('diagnostico-educador-social-planejamento-acoes','A','Repetir atividades padronizadas, independentemente das necessidades observadas no território.',10),
  ('diagnostico-educador-social-planejamento-acoes','B','Definir objetivos a partir da realidade identificada, registrar as ações e acompanhar seus resultados.',20),
  ('diagnostico-educador-social-planejamento-acoes','C','Executar ações espontâneas e evitar registros para preservar a flexibilidade da equipe.',30),
  ('diagnostico-educador-social-planejamento-acoes','D','Avaliar apenas a presença dos participantes ao final, sem relacioná-la aos objetivos da ação.',40),
  ('diagnostico-educador-social-melhor-interesse-crianca','A','A conveniência administrativa da instituição responsável.',10),
  ('diagnostico-educador-social-melhor-interesse-crianca','B','A redução de custos, independentemente dos efeitos sobre a criança.',20),
  ('diagnostico-educador-social-melhor-interesse-crianca','C','O melhor interesse da criança, considerado primordialmente na decisão.',30),
  ('diagnostico-educador-social-melhor-interesse-crianca','D','A preferência automática de qualquer adulto envolvido, sem análise do caso.',40)
)
insert into public.question_options(question_id, label, option_text, sort_order)
select question.id, seed.label, seed.option_text, seed.sort_order
from option_seed seed
join public.questions question on question.slug = seed.question_slug
on conflict (question_id, label) do update set
  option_text = excluded.option_text,
  sort_order = excluded.sort_order;

with solution_seed(question_slug, correct_label) as (values
  ('diagnostico-educador-social-seguridade-social','B'),
  ('diagnostico-educador-social-scfv','C'),
  ('diagnostico-educador-social-planejamento-acoes','B'),
  ('diagnostico-educador-social-melhor-interesse-crianca','C')
)
insert into public.question_solutions(question_id, correct_option_id)
select question.id, option.id
from solution_seed seed
join public.questions question on question.slug = seed.question_slug
join public.question_options option
  on option.question_id = question.id
 and option.label = seed.correct_label
on conflict (question_id) do update set
  correct_option_id = excluded.correct_option_id;
