-- Amplia o diagnóstico objetivo para Direito e Legislação com uma questão
-- autoral por bloco oficial, sem alterar o motor ou as regras de acesso.
with diagnostic_seed(
  specialty_slug, subject_slug, question_slug, statement,
  explanation, source_reference, sort_order
) as (values
  (
    'direito-e-legislacao-403',
    '1-direito-civil',
    'diagnostico-direito-legislacao-personalidade-civil',
    'Segundo o Código Civil, em que momento começa a personalidade civil da pessoa natural e qual proteção é reconhecida antes desse marco?',
    'A personalidade civil começa com o nascimento com vida. Mesmo antes desse marco, a lei resguarda, desde a concepção, os direitos do nascituro. Registro civil e maioridade não definem o início da personalidade.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.4.2.4, subitem 1; Código Civil (Lei Federal nº 10.406/2002), art. 2º. Questão autoral Nortis.',
    40310
  ),
  (
    'direito-e-legislacao-403',
    '2-direito-processual-civil',
    'diagnostico-direito-legislacao-tutela-urgencia',
    'Em um processo civil, a parte pede tutela provisória de urgência para impedir que a demora torne inútil a decisão final. Quais elementos o CPC exige para a concessão dessa tutela?',
    'O art. 300 do CPC exige elementos que evidenciem a probabilidade do direito e o perigo de dano ou o risco ao resultado útil do processo. A urgência não dispensa fundamentação nem depende do reconhecimento definitivo do direito.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.4.2.4, subitem 2; Código de Processo Civil (Lei Federal nº 13.105/2015), art. 300. Questão autoral Nortis.',
    40320
  ),
  (
    'direito-e-legislacao-403',
    '3-direito-constitucional',
    'diagnostico-direito-legislacao-assistencia-juridica',
    'Uma pessoa comprova não possuir recursos para custear orientação e defesa jurídicas. De acordo com a Constituição Federal, qual dever corresponde a essa situação?',
    'A Constituição determina que o Estado preste assistência jurídica integral e gratuita a quem comprovar insuficiência de recursos. A garantia não se limita à esfera penal nem depende de pagamento posterior.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.4.2.4, subitem 3; Constituição da República Federativa do Brasil de 1988, art. 5º, inciso LXXIV. Questão autoral Nortis.',
    40330
  ),
  (
    'direito-e-legislacao-403',
    '4-direito-administrativo',
    'diagnostico-direito-legislacao-autotutela-administrativa',
    'Ao revisar seus próprios atos, a Administração identifica um ato com vício de legalidade e outro ato válido que deixou de ser conveniente ao interesse público. Conforme a Lei nº 9.784/1999, como deve proceder?',
    'A Administração deve anular o ato ilegal e pode revogar o ato válido por motivo de conveniência ou oportunidade, respeitados os direitos adquiridos. Anulação controla legalidade; revogação avalia mérito administrativo.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.4.2.4, subitem 4; Lei Federal nº 9.784/1999, art. 53, aplicada no Distrito Federal pela Lei Distrital nº 2.834/2001. Questão autoral Nortis.',
    40340
  ),
  (
    'direito-e-legislacao-403',
    '5-direito-financeiro',
    'diagnostico-direito-legislacao-ldo',
    'No sistema constitucional de planejamento e orçamento, qual é uma função própria da Lei de Diretrizes Orçamentárias (LDO)?',
    'A LDO compreende metas e prioridades da administração pública, estabelece diretrizes de política fiscal e orienta a elaboração da lei orçamentária anual, entre outras atribuições constitucionais. Ela não substitui o PPA nem executa diretamente as despesas.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.4.2.4, subitem 5; Constituição da República Federativa do Brasil de 1988, art. 165, § 2º. Questão autoral Nortis.',
    40350
  ),
  (
    'direito-e-legislacao-403',
    '6-transparencia-e-protecao-de-dados',
    'diagnostico-direito-legislacao-principio-necessidade',
    'Um órgão público prepara um cadastro e pretende solicitar dados pessoais que não são úteis à finalidade informada. Qual princípio da LGPD orienta a limitar a coleta aos dados pertinentes, proporcionais e não excessivos?',
    'O princípio da necessidade limita o tratamento ao mínimo necessário para realizar a finalidade, abrangendo apenas dados pertinentes, proporcionais e não excessivos. Finalidade e adequação também orientam o tratamento, mas a limitação quantitativa descrita é própria da necessidade.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.4.2.4, subitem 6; Lei Geral de Proteção de Dados Pessoais (Lei Federal nº 13.709/2018), art. 6º, inciso III. Questão autoral Nortis.',
    40360
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
  ('diagnostico-direito-legislacao-personalidade-civil','A','Na concepção, quando também se adquire automaticamente plena capacidade civil.',10),
  ('diagnostico-direito-legislacao-personalidade-civil','B','No nascimento com vida, ficando resguardados desde a concepção os direitos do nascituro.',20),
  ('diagnostico-direito-legislacao-personalidade-civil','C','No registro civil, sem proteção jurídica anterior à emissão da certidão.',30),
  ('diagnostico-direito-legislacao-personalidade-civil','D','Aos dezoito anos, quando personalidade e capacidade passam a existir simultaneamente.',40),
  ('diagnostico-direito-legislacao-tutela-urgencia','A','A certeza definitiva do direito e o trânsito em julgado da decisão.',10),
  ('diagnostico-direito-legislacao-tutela-urgencia','B','A concordância da parte contrária e a prestação obrigatória de caução em todos os casos.',20),
  ('diagnostico-direito-legislacao-tutela-urgencia','C','A probabilidade do direito e o perigo de dano ou risco ao resultado útil do processo.',30),
  ('diagnostico-direito-legislacao-tutela-urgencia','D','A mera alegação de urgência, independentemente de elementos que a evidenciem.',40),
  ('diagnostico-direito-legislacao-assistencia-juridica','A','O Estado deve prestar assistência jurídica integral e gratuita a quem comprovar insuficiência de recursos.',10),
  ('diagnostico-direito-legislacao-assistencia-juridica','B','A assistência gratuita é restrita a processos penais e exclui orientação extrajudicial.',20),
  ('diagnostico-direito-legislacao-assistencia-juridica','C','O serviço deve ser custeado pelo beneficiário após o encerramento do processo.',30),
  ('diagnostico-direito-legislacao-assistencia-juridica','D','A garantia depende exclusivamente de autorização do órgão demandado.',40),
  ('diagnostico-direito-legislacao-autotutela-administrativa','A','Revogar ambos os atos, pois legalidade e conveniência produzem a mesma consequência.',10),
  ('diagnostico-direito-legislacao-autotutela-administrativa','B','Manter o ato ilegal e anular o ato inconveniente, preservando os efeitos originais.',20),
  ('diagnostico-direito-legislacao-autotutela-administrativa','C','Anular ambos os atos, porque a Administração não pode exercer juízo de conveniência.',30),
  ('diagnostico-direito-legislacao-autotutela-administrativa','D','Anular o ato ilegal e poder revogar o ato válido por conveniência ou oportunidade, respeitados os direitos adquiridos.',40),
  ('diagnostico-direito-legislacao-ldo','A','Substituir o Plano Plurianual e fixar todas as despesas para quatro exercícios.',10),
  ('diagnostico-direito-legislacao-ldo','B','Compreender metas e prioridades, estabelecer diretrizes de política fiscal e orientar a elaboração da LOA.',20),
  ('diagnostico-direito-legislacao-ldo','C','Executar diretamente cada despesa autorizada, dispensando a lei orçamentária anual.',30),
  ('diagnostico-direito-legislacao-ldo','D','Regular somente tributos, sem relação com metas, prioridades ou orçamento anual.',40),
  ('diagnostico-direito-legislacao-principio-necessidade','A','Livre acesso, porque autoriza coletar qualquer dado desde que o titular possa consultá-lo.',10),
  ('diagnostico-direito-legislacao-principio-necessidade','B','Qualidade dos dados, porque elimina a obrigação de justificar a quantidade coletada.',20),
  ('diagnostico-direito-legislacao-principio-necessidade','C','Necessidade, porque restringe o tratamento ao mínimo necessário para a finalidade.',30),
  ('diagnostico-direito-legislacao-principio-necessidade','D','Transparência, porque a informação ao titular torna irrelevante o excesso de dados.',40)
)
insert into public.question_options(question_id, label, option_text, sort_order)
select question.id, seed.label, seed.option_text, seed.sort_order
from option_seed seed
join public.questions question on question.slug = seed.question_slug
on conflict (question_id, label) do update set
  option_text = excluded.option_text,
  sort_order = excluded.sort_order;

with solution_seed(question_slug, correct_label) as (values
  ('diagnostico-direito-legislacao-personalidade-civil','B'),
  ('diagnostico-direito-legislacao-tutela-urgencia','C'),
  ('diagnostico-direito-legislacao-assistencia-juridica','A'),
  ('diagnostico-direito-legislacao-autotutela-administrativa','D'),
  ('diagnostico-direito-legislacao-ldo','B'),
  ('diagnostico-direito-legislacao-principio-necessidade','C')
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
