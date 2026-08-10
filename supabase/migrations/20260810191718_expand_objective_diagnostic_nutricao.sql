-- Amplia o diagnóstico objetivo para Nutrição com uma questão autoral
-- por bloco oficial, sem alterar o motor ou as regras de acesso.
with diagnostic_seed(
  specialty_slug, subject_slug, question_slug, statement,
  explanation, source_reference, sort_order
) as (values
  (
    'nutricao-407',
    '1-seguranca-alimentar-e-nutricional-san-e-politicas-publicas',
    'diagnostico-nutricao-sisan-dhaa',
    'Qual alternativa descreve corretamente o papel institucional do Sistema Nacional de Segurança Alimentar e Nutricional (SISAN)?',
    'O SISAN organiza e coordena a Política Nacional de Segurança Alimentar e Nutricional por meio da articulação entre governo e sociedade, orientada à garantia do Direito Humano à Alimentação Adequada. Ele não substitui o SUS, não se limita a ações emergenciais e não atua apenas como órgão de fiscalização sanitária.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.8, subitem 1; Ministério do Desenvolvimento e Assistência Social, página oficial Sisan; Lei Federal nº 11.346/2006 e Decreto Federal nº 7.272/2010. Questão autoral Nortis.',
    40710
  ),
  (
    'nutricao-407',
    '2-nutricao-em-saude-publica-e-epidemiologia',
    'diagnostico-nutricao-aleitamento-complementar',
    'Qual orientação está de acordo com as recomendações do Ministério da Saúde sobre aleitamento materno e alimentação complementar?',
    'A recomendação é manter o aleitamento materno exclusivo nos primeiros seis meses, iniciar a alimentação complementar a partir dos seis meses e continuar a amamentação até dois anos ou mais. Água, chás e outros alimentos não são necessários durante o período de aleitamento exclusivo.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.8, subitem 2; Ministério da Saúde, página oficial Amamentação e Guia Alimentar para Crianças Brasileiras Menores de 2 Anos. Questão autoral Nortis.',
    40720
  ),
  (
    'nutricao-407',
    '3-gestao-de-unidades-de-alimentacao-e-nutricao-uan',
    'diagnostico-nutricao-uan-boas-praticas',
    'Em uma Unidade de Alimentação e Nutrição, qual é o objetivo central dos procedimentos de Boas Práticas previstos na RDC nº 216/2004?',
    'A RDC nº 216/2004 estabelece procedimentos de Boas Práticas para garantir as condições higiênico-sanitárias do alimento preparado. A norma não se restringe ao sabor, à redução de custos ou à substituição da capacitação e do controle dos processos.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.8, subitem 3; Agência Nacional de Vigilância Sanitária, Resolução RDC nº 216/2004, itens 1.1 e 2.3. Questão autoral Nortis.',
    40730
  ),
  (
    'nutricao-407',
    '4-educacao-alimentar-e-nutricional-ean-e-programas-institucionais',
    'diagnostico-nutricao-pnae-teste-aceitabilidade',
    'Uma escola pretende introduzir uma nova preparação no cardápio do PNAE. Qual conduta corresponde às orientações do FNDE?',
    'O teste de aceitabilidade deve ser aplicado ao introduzir uma nova preparação ou adaptar uma preparação existente, com o objetivo de avaliar sua aceitação sensorial pelos estudantes. O procedimento apoia o planejamento do cardápio e não é substituído por decisão baseada apenas em custo, opinião da equipe ou origem dos alimentos.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.8, subitem 4; Fundo Nacional de Desenvolvimento da Educação, Alimentação e Nutrição no PNAE e Manual para aplicação dos Testes de Aceitabilidade, 2ª edição. Questão autoral Nortis.',
    40740
  ),
  (
    'nutricao-407',
    '5-fundamentos-de-nutricao-e-dietoterapia-basica',
    'diagnostico-nutricao-hipertensao-alimentacao',
    'Em uma orientação dietoterápica básica para uma pessoa com hipertensão arterial, qual recomendação é compatível com as diretrizes do Ministério da Saúde?',
    'Uma alimentação equilibrada e a redução do consumo excessivo de sal integram o cuidado com a hipertensão. A orientação alimentar não pressupõe retirar todos os carboidratos, aumentar alimentos ricos em sódio ou interromper medicamentos prescritos.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.8, subitem 5; Ministério da Saúde, página oficial Hipertensão (pressão alta), seção Prevenção. Questão autoral Nortis.',
    40750
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
  ('diagnostico-nutricao-sisan-dhaa','A','Substituir o Sistema Único de Saúde na organização da atenção nutricional individual.',10),
  ('diagnostico-nutricao-sisan-dhaa','B','Organizar e coordenar a política de segurança alimentar e nutricional, articulando governo e sociedade para promover o DHAA.',20),
  ('diagnostico-nutricao-sisan-dhaa','C','Executar exclusivamente a distribuição emergencial de alimentos.',30),
  ('diagnostico-nutricao-sisan-dhaa','D','Fiscalizar sozinho todos os estabelecimentos produtores de alimentos.',40),
  ('diagnostico-nutricao-aleitamento-complementar','A','Oferecer água e chás desde o nascimento e iniciar outros alimentos aos três meses.',10),
  ('diagnostico-nutricao-aleitamento-complementar','B','Manter somente leite materno até um ano, sem introduzir alimentação complementar.',20),
  ('diagnostico-nutricao-aleitamento-complementar','C','Manter aleitamento exclusivo por seis meses, iniciar alimentação complementar a partir daí e continuar amamentando até dois anos ou mais.',30),
  ('diagnostico-nutricao-aleitamento-complementar','D','Interromper obrigatoriamente a amamentação quando a alimentação complementar começar.',40),
  ('diagnostico-nutricao-uan-boas-praticas','A','Garantir as condições higiênico-sanitárias do alimento preparado.',10),
  ('diagnostico-nutricao-uan-boas-praticas','B','Padronizar apenas o sabor e a apresentação das preparações.',20),
  ('diagnostico-nutricao-uan-boas-praticas','C','Reduzir custos independentemente do controle sanitário.',30),
  ('diagnostico-nutricao-uan-boas-praticas','D','Eliminar a necessidade de capacitação dos manipuladores.',40),
  ('diagnostico-nutricao-pnae-teste-aceitabilidade','A','Incluir a preparação definitivamente com base apenas no menor custo.',10),
  ('diagnostico-nutricao-pnae-teste-aceitabilidade','B','Dispensar qualquer avaliação por se tratar de alimento adquirido para o PNAE.',20),
  ('diagnostico-nutricao-pnae-teste-aceitabilidade','C','Consultar somente a equipe administrativa, sem participação dos estudantes.',30),
  ('diagnostico-nutricao-pnae-teste-aceitabilidade','D','Aplicar teste de aceitabilidade para avaliar a aceitação sensorial da nova preparação pelos estudantes.',40),
  ('diagnostico-nutricao-hipertensao-alimentacao','A','Aumentar o consumo de alimentos ricos em sódio para estabilizar a pressão.',10),
  ('diagnostico-nutricao-hipertensao-alimentacao','B','Adotar alimentação equilibrada e evitar o consumo excessivo de sal.',20),
  ('diagnostico-nutricao-hipertensao-alimentacao','C','Retirar todos os carboidratos da alimentação, independentemente da avaliação individual.',30),
  ('diagnostico-nutricao-hipertensao-alimentacao','D','Interromper os medicamentos prescritos assim que a alimentação for modificada.',40)
)
insert into public.question_options(question_id, label, option_text, sort_order)
select question.id, seed.label, seed.option_text, seed.sort_order
from option_seed seed
join public.questions question on question.slug = seed.question_slug
on conflict (question_id, label) do update set
  option_text = excluded.option_text,
  sort_order = excluded.sort_order;

with solution_seed(question_slug, correct_label) as (values
  ('diagnostico-nutricao-sisan-dhaa','B'),
  ('diagnostico-nutricao-aleitamento-complementar','C'),
  ('diagnostico-nutricao-uan-boas-praticas','A'),
  ('diagnostico-nutricao-pnae-teste-aceitabilidade','D'),
  ('diagnostico-nutricao-hipertensao-alimentacao','B')
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
