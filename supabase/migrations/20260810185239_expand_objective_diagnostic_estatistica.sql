-- Amplia o diagnóstico objetivo para Estatística com uma questão autoral
-- por bloco oficial, sem alterar o motor ou as regras de acesso.
with diagnostic_seed(
  specialty_slug, subject_slug, question_slug, statement,
  explanation, source_reference, sort_order
) as (values
  (
    'estatistica-406',
    '1-estatistica-descritiva-e-analise-exploratoria-de-dados',
    'diagnostico-estatistica-boxplot-limite-superior',
    'Em um conjunto de dados, o primeiro quartil é 20 e o terceiro quartil é 32. Pela regra das cercas internas de um boxplot, baseada em 1,5 vez o intervalo interquartil, qual é a cerca superior?',
    'O intervalo interquartil é Q3 menos Q1: 32 menos 20 resulta em 12. A cerca superior é Q3 mais 1,5 vezes esse intervalo: 32 mais 18, totalizando 50. Valores acima dessa cerca são sinalizados como potenciais outliers pela regra.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.4.2.7, subitem 1; NIST/SEMATECH e-Handbook of Statistical Methods, seção 1.3.3.7, Box Plot. Questão autoral Nortis.',
    40610
  ),
  (
    'estatistica-406',
    '2-probabilidade-e-inferencia-estatistica',
    'diagnostico-estatistica-intervalo-confianca',
    'Qual interpretação descreve corretamente o nível de confiança de 95% de um procedimento de estimação por intervalo?',
    'O nível de 95% caracteriza o desempenho do procedimento em repetições: se novas amostras fossem obtidas sob as mesmas condições e novos intervalos fossem calculados, aproximadamente 95% deles conteriam o parâmetro populacional verdadeiro. Ele não atribui probabilidade de 95% a um parâmetro fixo depois que um intervalo específico foi observado.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.4.2.7, subitem 2; NIST/SEMATECH e-Handbook of Statistical Methods, seção 7.1.4, What are confidence intervals. Questão autoral Nortis.',
    40620
  ),
  (
    'estatistica-406',
    '3-modelagem-estatistica-e-analise-multivariada',
    'diagnostico-estatistica-regressao-inclinacao',
    'Um modelo de regressão linear ajustado é dado por resposta estimada igual a 12 mais 3 vezes x. Qual interpretação da inclinação é adequada?',
    'A inclinação 3 indica que, no modelo ajustado e dentro de seu domínio de aplicação, o aumento de uma unidade em x está associado a um acréscimo de 3 unidades na resposta estimada. Essa interpretação descreve a relação modelada e, isoladamente, não demonstra causalidade.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.4.2.7, subitem 3; National Institute of Standards and Technology, Dataplot Linear Fit, modelo Y = A + B*X. Questão autoral Nortis.',
    40630
  ),
  (
    'estatistica-406',
    '4-gestao-e-exploracao-de-bancos-de-dados',
    'diagnostico-estatistica-sql-media-grupo',
    'Uma tabela atendimentos possui as colunas especialidade e duracao. Qual consulta SQL calcula a duração média separadamente para cada especialidade?',
    'A função AVG calcula a média e a cláusula GROUP BY forma um grupo para cada especialidade. Assim, a consulta deve selecionar a especialidade, aplicar AVG à duração e agrupar pela especialidade.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.4.2.7, subitem 4; PostgreSQL Documentation, SELECT, GROUP BY e Aggregate Functions. Questão autoral Nortis.',
    40640
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
  ('diagnostico-estatistica-boxplot-limite-superior','A','14.',10),
  ('diagnostico-estatistica-boxplot-limite-superior','B','32.',20),
  ('diagnostico-estatistica-boxplot-limite-superior','C','50.',30),
  ('diagnostico-estatistica-boxplot-limite-superior','D','68.',40),
  ('diagnostico-estatistica-intervalo-confianca','A','Há 95% de probabilidade de o parâmetro fixo mudar e ficar dentro do intervalo já calculado.',10),
  ('diagnostico-estatistica-intervalo-confianca','B','Em repetições do procedimento sob as mesmas condições, cerca de 95% dos intervalos conteriam o parâmetro verdadeiro.',20),
  ('diagnostico-estatistica-intervalo-confianca','C','Exatamente 95% dos valores individuais da população precisam estar dentro de qualquer intervalo calculado.',30),
  ('diagnostico-estatistica-intervalo-confianca','D','O intervalo garante que a estimativa pontual coincida com o parâmetro populacional.',40),
  ('diagnostico-estatistica-regressao-inclinacao','A','Quando x aumenta uma unidade, a resposta observada aumenta obrigatoriamente 12 unidades.',10),
  ('diagnostico-estatistica-regressao-inclinacao','B','O valor 3 é o intercepto e representa a resposta estimada quando x é zero.',20),
  ('diagnostico-estatistica-regressao-inclinacao','C','Um aumento unitário em x está associado a um aumento de 3 unidades na resposta estimada, sem provar causalidade por si só.',30),
  ('diagnostico-estatistica-regressao-inclinacao','D','A inclinação demonstra que não existe erro ou variabilidade residual no modelo.',40),
  ('diagnostico-estatistica-sql-media-grupo','A','SELECT AVG(especialidade), duracao FROM atendimentos;',10),
  ('diagnostico-estatistica-sql-media-grupo','B','SELECT especialidade, duracao FROM atendimentos ORDER BY duracao;',20),
  ('diagnostico-estatistica-sql-media-grupo','C','SELECT AVG(duracao) FROM atendimentos WHERE especialidade = AVG(especialidade);',30),
  ('diagnostico-estatistica-sql-media-grupo','D','SELECT especialidade, AVG(duracao) FROM atendimentos GROUP BY especialidade;',40)
)
insert into public.question_options(question_id, label, option_text, sort_order)
select question.id, seed.label, seed.option_text, seed.sort_order
from option_seed seed
join public.questions question on question.slug = seed.question_slug
on conflict (question_id, label) do update set
  option_text = excluded.option_text,
  sort_order = excluded.sort_order;

with solution_seed(question_slug, correct_label) as (values
  ('diagnostico-estatistica-boxplot-limite-superior','C'),
  ('diagnostico-estatistica-intervalo-confianca','B'),
  ('diagnostico-estatistica-regressao-inclinacao','C'),
  ('diagnostico-estatistica-sql-media-grupo','D')
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
