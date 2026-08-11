-- Amplia o diagnóstico objetivo para a especialidade Sociologia com uma questão autoral
-- por bloco oficial, sem alterar o motor ou as regras de acesso.
with diagnostic_seed(
  specialty_slug, subject_slug, question_slug, statement,
  explanation, source_reference, sort_order
) as (values
  (
    'sociologia-411',
    '1-teoria-sociologica-e-conceitos-fundamentais',
    'diagnostico-sociologia-fato-social-durkheim',
    'Uma instituição mantém uma norma que já existia antes das pessoas atualmente vinculadas a ela, é observada de modo geral pelo grupo e exerce pressão para que cada integrante a cumpra. Na perspectiva de Émile Durkheim, qual conceito descreve melhor essa norma?',
    'A norma apresenta existência independente das manifestações individuais, generalidade no grupo e capacidade de exercer coerção exterior. Essas características identificam um fato social na formulação durkheimiana. Não se trata apenas de uma escolha pessoal repetida, porque a prática coletiva antecede o indivíduo e condiciona sua conduta.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.12, subitem 1; Universidade de São Paulo, FFLCH, Laboratório Didático USP Ensina Sociologia, texto sobre Émile Durkheim e a definição de fato social. Questão autoral Nortis.',
    41110
  ),
  (
    'sociologia-411',
    '2-pensamento-social-colonialismo-e-relacoes-etnico-raciais',
    'diagnostico-sociologia-desigualdade-racial',
    'Um diagnóstico identifica diferença injustificada no acesso a serviços e oportunidades entre grupos, associada à raça ou cor, tanto em espaços públicos quanto privados. Segundo o Estatuto da Igualdade Racial, como essa situação deve ser classificada?',
    'O Estatuto da Igualdade Racial define desigualdade racial como toda diferenciação injustificada de acesso e fruição de bens, serviços e oportunidades, nas esferas pública e privada, em virtude de raça, cor, descendência ou origem nacional ou étnica. A identificação não depende de reduzir o fenômeno a um ato individual explícito de preconceito.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.12, subitem 2; Brasil, Lei nº 12.288/2010, art. 1º, parágrafo único, inciso II. Questão autoral Nortis.',
    41120
  ),
  (
    'sociologia-411',
    '3-sociologia-urbana-desigualdades-e-movimentos-sociais',
    'diagnostico-sociologia-gestao-democratica-urbana',
    'Durante a elaboração de um programa de requalificação urbana com impacto sobre moradores de diferentes bairros, qual procedimento concretiza a gestão democrática prevista no Estatuto da Cidade?',
    'A gestão democrática urbana requer participação da população e de associações representativas dos vários segmentos da comunidade na formulação, na execução e no acompanhamento de planos, programas e projetos de desenvolvimento urbano. Informar a decisão apenas depois de tomada ou restringir a participação a agentes econômicos não cumpre essa diretriz.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.12, subitem 3; Brasil, Lei nº 10.257/2001, art. 2º, inciso II. Questão autoral Nortis.',
    41130
  ),
  (
    'sociologia-411',
    '4-metodologia-de-pesquisa-social-e-avaliacao-de-politicas',
    'diagnostico-sociologia-indicadores-e-metodos',
    'Uma equipe precisa comparar vulnerabilidades entre territórios e também compreender como os moradores vivenciam o acesso a uma política pública. Qual desenho de pesquisa é mais adequado a esses dois objetivos?',
    'Indicadores quantitativos permitem dimensionar e comparar condições entre grupos e territórios, enquanto entrevistas, histórias de vida ou etnografia ajudam a compreender processos, sentidos e experiências. A combinação preserva a contribuição específica de cada método e produz uma leitura mais completa do que a substituição de uma abordagem pela outra.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.12, subitem 4; Instituto Brasileiro de Geografia e Estatística, Síntese de Indicadores Sociais: uma análise das condições de vida da população brasileira, 2025, seções O que é e Sobre a publicação. Questão autoral Nortis.',
    41140
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
  ('diagnostico-sociologia-fato-social-durkheim','A','Ação social orientada exclusivamente pelo cálculo racional de vantagens individuais.',10),
  ('diagnostico-sociologia-fato-social-durkheim','B','Fato social, por combinar generalidade, existência exterior ao indivíduo e força coercitiva.',20),
  ('diagnostico-sociologia-fato-social-durkheim','C','Escolha estritamente privada, sem relação com instituições ou expectativas coletivas.',30),
  ('diagnostico-sociologia-fato-social-durkheim','D','Mobilidade social, porque a norma modifica automaticamente a posição econômica dos integrantes.',40),
  ('diagnostico-sociologia-desigualdade-racial','A','Diversidade cultural, pois qualquer diferença entre grupos expressa apenas pluralidade de costumes.',10),
  ('diagnostico-sociologia-desigualdade-racial','B','Desigualdade de gênero e raça, ainda que o diagnóstico não trate especificamente da assimetria vivida por mulheres negras.',20),
  ('diagnostico-sociologia-desigualdade-racial','C','Desigualdade racial, por haver diferenciação injustificada de acesso a bens, serviços ou oportunidades em razão de raça ou cor.',30),
  ('diagnostico-sociologia-desigualdade-racial','D','Discriminação administrativa neutra, porque diferenças de acesso na esfera privada não são alcançadas pelo Estatuto.',40),
  ('diagnostico-sociologia-gestao-democratica-urbana','A','Assegurar a participação da população e de associações representativas na formulação, execução e acompanhamento do programa.',10),
  ('diagnostico-sociologia-gestao-democratica-urbana','B','Comunicar o programa à população somente depois de sua execução, evitando mudanças no planejamento técnico.',20),
  ('diagnostico-sociologia-gestao-democratica-urbana','C','Restringir as decisões aos proprietários de maior área e aos agentes financiadores do projeto.',30),
  ('diagnostico-sociologia-gestao-democratica-urbana','D','Substituir toda análise técnica por votação informal, sem registro, acompanhamento ou representação comunitária.',40),
  ('diagnostico-sociologia-indicadores-e-metodos','A','Usar somente relatos individuais e generalizá-los numericamente para todos os territórios, sem critérios de seleção.',10),
  ('diagnostico-sociologia-indicadores-e-metodos','B','Utilizar apenas o total bruto de atendimentos, sem considerar população, grupos sociais, território ou condições de acesso.',20),
  ('diagnostico-sociologia-indicadores-e-metodos','C','Aplicar apenas um indicador agregado e assumir que ele revela, sozinho, os processos e os sentidos atribuídos pelos moradores.',30),
  ('diagnostico-sociologia-indicadores-e-metodos','D','Combinar indicadores quantitativos comparáveis com técnicas qualitativas adequadas para compreender experiências e processos.',40)
)
insert into public.question_options(question_id, label, option_text, sort_order)
select question.id, seed.label, seed.option_text, seed.sort_order
from option_seed seed
join public.questions question on question.slug = seed.question_slug
on conflict (question_id, label) do update set
  option_text = excluded.option_text,
  sort_order = excluded.sort_order;

with solution_seed(question_slug, correct_label) as (values
  ('diagnostico-sociologia-fato-social-durkheim','B'),
  ('diagnostico-sociologia-desigualdade-racial','C'),
  ('diagnostico-sociologia-gestao-democratica-urbana','A'),
  ('diagnostico-sociologia-indicadores-e-metodos','D')
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
