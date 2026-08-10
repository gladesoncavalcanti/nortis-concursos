-- Amplia o diagnóstico objetivo para Economia com uma questão autoral
-- por bloco oficial, sem alterar o motor ou as regras de acesso.
with diagnostic_seed(
  specialty_slug, subject_slug, question_slug, statement,
  explanation, source_reference, sort_order
) as (values
  (
    'economia-404',
    '1-teoria-economica-microeconomia-e-macroeconomia',
    'diagnostico-economia-transmissao-selic',
    'Considere uma elevação da taxa Selic pelo Banco Central, mantidos os demais fatores. Qual efeito descreve corretamente um dos mecanismos de transmissão da política monetária?',
    'Quando a Selic sobe, as taxas reais e o custo do crédito tendem a aumentar. Isso pode reduzir consumo e investimento, diminuir a demanda por bens e serviços e contribuir para a redução da inflação. Os efeitos não são instantâneos nem eliminam toda a atividade econômica.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.4.2.5, subitem 1; Banco Central do Brasil, Mecanismos de transmissão da política monetária, canais das taxas de juros e do crédito. Questão autoral Nortis.',
    40410
  ),
  (
    'economia-404',
    '2-economia-do-setor-publico',
    'diagnostico-economia-federalismo-fiscal-icms',
    'No federalismo fiscal brasileiro, a Constituição distribui competências tributárias entre os entes. Qual imposto é atribuído aos Estados e ao Distrito Federal?',
    'A Constituição atribui aos Estados e ao Distrito Federal o imposto sobre operações relativas à circulação de mercadorias e sobre determinadas prestações de serviços de transporte e comunicação, conhecido como ICMS. Imposto de importação e IPI são federais, enquanto o ISS é municipal.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.4.2.5, subitem 2; Constituição da República Federativa do Brasil de 1988, art. 155, caput e inciso II. Questão autoral Nortis.',
    40420
  ),
  (
    'economia-404',
    '3-economia-social',
    'diagnostico-economia-indice-gini',
    'Duas distribuições de renda foram medidas com a mesma metodologia: a primeira apresentou índice de Gini 0,28 e a segunda, 0,55. Qual interpretação é correta?',
    'O índice de Gini varia de zero, situação de perfeita igualdade, até um, situação de desigualdade máxima. Assim, mantendo-se a mesma metodologia, 0,28 indica menor concentração da renda que 0,55; o indicador não mede diretamente o nível médio de renda.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.4.2.5, subitem 3; Instituto Brasileiro de Geografia e Estatística, Indicadores Sociais Mínimos, conceito do Índice de Gini. Questão autoral Nortis.',
    40430
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
  ('diagnostico-economia-transmissao-selic','A','As taxas de crédito tendem a cair, estimulando consumo e investimento e reduzindo a demanda agregada.',10),
  ('diagnostico-economia-transmissao-selic','B','O custo do crédito tende a subir, podendo reduzir consumo, investimento e pressões da demanda sobre a inflação.',20),
  ('diagnostico-economia-transmissao-selic','C','A inflação é eliminada imediatamente, sem efeitos sobre consumo, investimento ou crédito.',30),
  ('diagnostico-economia-transmissao-selic','D','O volume de crédito necessariamente aumenta porque juros maiores ampliam a procura por empréstimos.',40),
  ('diagnostico-economia-federalismo-fiscal-icms','A','Imposto sobre a importação de produtos estrangeiros.',10),
  ('diagnostico-economia-federalismo-fiscal-icms','B','Imposto sobre serviços de qualquer natureza, o ISS.',20),
  ('diagnostico-economia-federalismo-fiscal-icms','C','Imposto sobre circulação de mercadorias e determinadas prestações de transporte e comunicação, o ICMS.',30),
  ('diagnostico-economia-federalismo-fiscal-icms','D','Imposto sobre produtos industrializados, o IPI.',40),
  ('diagnostico-economia-indice-gini','A','A segunda distribuição é mais igualitária, porque índices maiores indicam menor concentração.',10),
  ('diagnostico-economia-indice-gini','B','As duas distribuições têm a mesma desigualdade, pois o índice não permite comparação numérica.',20),
  ('diagnostico-economia-indice-gini','C','A primeira distribuição possui necessariamente renda média maior, porque seu índice é menor.',30),
  ('diagnostico-economia-indice-gini','D','A primeira distribuição é menos desigual, porque seu índice está mais próximo de zero.',40)
)
insert into public.question_options(question_id, label, option_text, sort_order)
select question.id, seed.label, seed.option_text, seed.sort_order
from option_seed seed
join public.questions question on question.slug = seed.question_slug
on conflict (question_id, label) do update set
  option_text = excluded.option_text,
  sort_order = excluded.sort_order;

with solution_seed(question_slug, correct_label) as (values
  ('diagnostico-economia-transmissao-selic','B'),
  ('diagnostico-economia-federalismo-fiscal-icms','C'),
  ('diagnostico-economia-indice-gini','D')
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
