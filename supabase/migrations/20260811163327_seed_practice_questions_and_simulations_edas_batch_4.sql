-- Amplia o Banco de Questões e os simulados para Psicologia, Serviço Social e Sociologia,
-- reutilizando integralmente o motor e as regras de acesso existentes.
with practice_seed(
  specialty_slug, subject_slug, question_slug, statement,
  explanation, source_reference, sort_order
) as (values
  (
    'psicologia-409',
    '1-fundamentos-da-psicologia-e-psicologia-social',
    'pratica-psicologia-envelhecimento-contextual',
    'Ao avaliar a autonomia de uma pessoa idosa, qual abordagem evita uma interpretação baseada apenas em estereótipos etários?',
    'A avaliação deve considerar capacidade funcional, história de vida, ambiente, relações sociais e condições socioeconômicas. A idade cronológica, isoladamente, não determina dependência nem incapacidade e não justifica retirar o poder de decisão da pessoa.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.10, subitem 1; Conselho Federal de Psicologia, Referências Técnicas para atuação de psicólogas(os) junto às pessoas idosas nas políticas públicas, eixos 1 e 2. Questão autoral Nortis.',
    22910
  ),
  (
    'psicologia-409',
    '2-a-pratica-psicossocial-no-suas',
    'pratica-psicologia-reducao-danos-autonomia',
    'No acompanhamento psicossocial de uma pessoa que faz uso problemático de álcool e outras drogas, qual conduta é compatível com a lógica de redução de danos?',
    'A redução de danos constrói o cuidado com a pessoa, respeita sua autonomia e singularidade e articula recursos do território e da rede. O acesso ao cuidado não deve depender de abstinência prévia nem recorrer a coerção como regra.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.10, subitem 2; Conselho Federal de Psicologia, posicionamento Contra os Retrocessos da Política Nacional de Saúde Mental, diretrizes de autonomia, cuidado no território e em liberdade. Questão autoral Nortis.',
    22920
  ),
  (
    'psicologia-409',
    '3-avaliacao-e-instrumentos-tecnico-operativos',
    'pratica-psicologia-visita-domiciliar',
    'Uma equipe do CRAS planeja uma visita domiciliar. Qual preparação e postura são tecnicamente adequadas para a psicóloga?',
    'A visita deve ter finalidade clara, ser articulada com a equipe e explicada à família. A profissional observa o contexto com respeito aos modos de vida, registra apenas o necessário e evita transformar a visita em fiscalização moral ou inspeção constrangedora.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.10, subitem 3; Conselho Federal de Psicologia, Referências Técnicas para atuação de psicólogas(os) no CRAS/SUAS, 3ª edição, orientações sobre visitas domiciliares. Questão autoral Nortis.',
    22930
  ),
  (
    'psicologia-409',
    '4-etica-profissional-e-elaboracao-de-documentos',
    'pratica-psicologia-declaracao-limites',
    'Uma pessoa solicita documento para comprovar os dias e horários em que compareceu ao acompanhamento psicológico. Qual documento atende ao pedido sem certificar condição psicológica?',
    'A declaração pode informar atendimento, finalidade, local, dias, horários e duração do acompanhamento. Ela não substitui o atestado psicológico, que certifica situação, estado ou funcionamento psicológico com fundamento em avaliação.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.10, subitem 4; Conselho Federal de Psicologia, Resolução CFP nº 6/2019, arts. 9º e 10. Questão autoral Nortis.',
    22940
  ),
  (
    'servico-social-410',
    '1-fundamentos-historicos-e-teorico-metodologicos',
    'pratica-servico-social-questao-social-mediacoes',
    'Diante de sucessivos atrasos de aluguel de uma família atendida, qual análise é coerente com a perspectiva crítica do Serviço Social?',
    'A análise articula a situação singular às relações de trabalho, renda, moradia, proteção social e demais determinações da questão social. Ela evita reduzir a demanda a falha moral ou escolha individual e identifica mediações para o acesso a direitos.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.11, subitem 1; Associação Brasileira de Ensino e Pesquisa em Serviço Social, Diretrizes Gerais para o Curso de Serviço Social, núcleos de fundamentação e questão social. Questão autoral Nortis.',
    23010
  ),
  (
    'servico-social-410',
    '2-etica-e-legislacao-profissional',
    'pratica-servico-social-autonomia-usuario',
    'Uma usuária adulta e capaz discorda da alternativa de atendimento preferida pela equipe. Qual conduta respeita o projeto ético-profissional?',
    'A equipe deve fornecer informações acessíveis, apresentar possibilidades e consequências e respeitar a decisão autônoma da usuária, salvo limites legais concretos. A atuação profissional não autoriza coerção, tutela automática ou discriminação.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.11, subitem 2; Conselho Federal de Serviço Social, Código de Ética Profissional, princípios fundamentais de liberdade, autonomia, cidadania, democracia e não discriminação. Questão autoral Nortis.',
    23020
  ),
  (
    'servico-social-410',
    '3-dimensao-tecnico-operativa-e-pesquisa-social',
    'pratica-servico-social-estudo-social-opiniao',
    'Ao emitir opinião técnica após um estudo social, qual procedimento qualifica o documento profissional?',
    'A opinião técnica deve resultar de estudo e análise fundamentados, selecionar informações pertinentes à finalidade, explicitar mediações e limites e preservar o sigilo. A simples reprodução de relatos ou julgamentos morais não constitui análise profissional.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.11, subitem 3; Conselho Federal de Serviço Social, Produção de documentos e emissão de opinião técnica em Serviço Social, 2022. Questão autoral Nortis.',
    23030
  ),
  (
    'servico-social-410',
    '4-estado-politicas-sociais-planejamento-e-gestao',
    'pratica-servico-social-ldo-prioridades',
    'No ciclo orçamentário, qual é uma função constitucional da Lei de Diretrizes Orçamentárias?',
    'A LDO compreende metas e prioridades da administração pública, estabelece diretrizes de política fiscal e orienta a elaboração da lei orçamentária anual. Ela não substitui o plano plurianual nem executa diretamente as despesas previstas.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.11, subitem 4; Constituição da República Federativa do Brasil de 1988, art. 165, § 2º. Questão autoral Nortis.',
    23040
  ),
  (
    'sociologia-411',
    '1-teoria-sociologica-e-conceitos-fundamentais',
    'pratica-sociologia-acao-social-weber',
    'Segundo a sociologia compreensiva de Max Weber, qual situação exemplifica uma ação social?',
    'A ação é social quando a pessoa atribui sentido à sua conduta e a orienta pelo comportamento de outras pessoas. Um movimento puramente reflexo, sem sentido subjetivo nem referência a outrem, não atende a essa definição.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.12, subitem 1; Universidade de São Paulo, RedeFor, Sociologia: modernidade e contemporaneidade, tema Ação social em Max Weber. Questão autoral Nortis.',
    23110
  ),
  (
    'sociologia-411',
    '2-pensamento-social-colonialismo-e-relacoes-etnico-raciais',
    'pratica-sociologia-desagregacao-indicadores-raciais',
    'A média geral de conclusão do ensino médio de um território parece estável. Para investigar desigualdades raciais e de gênero ocultadas por essa média, qual procedimento é mais informativo?',
    'Os indicadores devem ser desagregados por cor ou raça e sexo, preservando denominadores e critérios comparáveis. A média agregada pode ocultar desvantagens sistemáticas entre grupos e limitar o diagnóstico para políticas públicas.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.12, subitem 2; Instituto Brasileiro de Geografia e Estatística, Desigualdades Sociais por Cor ou Raça no Brasil, indicadores por cor ou raça segundo sexo. Questão autoral Nortis.',
    23120
  ),
  (
    'sociologia-411',
    '3-sociologia-urbana-desigualdades-e-movimentos-sociais',
    'pratica-sociologia-segregacao-mobilidade',
    'Em uma metrópole, famílias de baixa renda concentram-se longe dos empregos e serviços, enquanto o transporte coletivo é insuficiente. Qual interpretação sociológica é mais adequada?',
    'A articulação entre uso do solo, periferização e oferta desigual de transporte intensifica a segregação espacial e restringe o acesso à cidade. O problema não se reduz à distância física nem a escolhas individuais de deslocamento.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.12, subitem 3; Instituto de Pesquisa Econômica Aplicada, Mobilidade cotidiana, segregação urbana e exclusão, análise sobre uso do solo, periferização e acesso à cidade. Questão autoral Nortis.',
    23130
  ),
  (
    'sociologia-411',
    '4-metodologia-de-pesquisa-social-e-avaliacao-de-politicas',
    'pratica-sociologia-taxa-comparacao-territorios',
    'Dois territórios têm populações de tamanhos muito diferentes. Para comparar a ocorrência de determinado evento social entre eles, qual medida evita a distorção de usar apenas números absolutos?',
    'Uma taxa ou proporção relaciona o número de eventos à população exposta no mesmo período, com denominador e unidade claramente definidos. Números absolutos isolados podem refletir apenas diferenças de tamanho populacional.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.12, subitem 4; Instituto Brasileiro de Geografia e Estatística, Princípios Fundamentais das Estatísticas Oficiais e publicações de indicadores sociais com taxas e proporções. Questão autoral Nortis.',
    23140
  )
)
insert into public.questions (
  product_id, syllabus_node_id, slug, statement, explanation,
  authorship, source_reference, diagnostic_eligible, sort_order, active
)
select product.id, subject.id, seed.question_slug, seed.statement,
       seed.explanation, 'Nortis Concursos', seed.source_reference,
       false, seed.sort_order, true
from practice_seed seed
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
  active = excluded.active;

with option_seed(question_slug, label, option_text, sort_order) as (values
  ('pratica-psicologia-envelhecimento-contextual','A','Presumir dependência sempre que a pessoa atingir determinada idade.',10),
  ('pratica-psicologia-envelhecimento-contextual','B','Considerar capacidade funcional, história, ambiente, relações e condições sociais.',20),
  ('pratica-psicologia-envelhecimento-contextual','C','Usar somente a idade cronológica para decidir sobre autonomia.',30),
  ('pratica-psicologia-envelhecimento-contextual','D','Transferir automaticamente as decisões para familiares.',40),
  ('pratica-psicologia-reducao-danos-autonomia','A','Exigir abstinência completa antes de oferecer qualquer cuidado.',10),
  ('pratica-psicologia-reducao-danos-autonomia','B','Definir metas sem participação da pessoa e aplicar sanções diante de recaídas.',20),
  ('pratica-psicologia-reducao-danos-autonomia','C','Construir o cuidado com respeito à autonomia, à singularidade e ao território.',30),
  ('pratica-psicologia-reducao-danos-autonomia','D','Substituir a rede territorial por isolamento obrigatório como primeira resposta.',40),
  ('pratica-psicologia-visita-domiciliar','A','Chegar sem finalidade definida e avaliar a organização doméstica segundo padrões pessoais.',10),
  ('pratica-psicologia-visita-domiciliar','B','Explicar a finalidade, articular a equipe e observar o contexto sem julgamento moral.',20),
  ('pratica-psicologia-visita-domiciliar','C','Registrar todos os detalhes da residência, mesmo sem relação com a demanda.',30),
  ('pratica-psicologia-visita-domiciliar','D','Tratar a visita como fiscalização para confirmar suspeitas da equipe.',40),
  ('pratica-psicologia-declaracao-limites','A','Laudo psicológico completo.',10),
  ('pratica-psicologia-declaracao-limites','B','Parecer psicológico sobre conflito técnico.',20),
  ('pratica-psicologia-declaracao-limites','C','Atestado psicológico de aptidão.',30),
  ('pratica-psicologia-declaracao-limites','D','Declaração de comparecimento ou acompanhamento.',40),
  ('pratica-servico-social-questao-social-mediacoes','A','Atribuir os atrasos à falta de responsabilidade individual da família.',10),
  ('pratica-servico-social-questao-social-mediacoes','B','Relacionar a situação singular a trabalho, renda, moradia e proteção social.',20),
  ('pratica-servico-social-questao-social-mediacoes','C','Evitar analisar o território para manter o atendimento estritamente pessoal.',30),
  ('pratica-servico-social-questao-social-mediacoes','D','Considerar que demandas econômicas não integram o trabalho profissional.',40),
  ('pratica-servico-social-autonomia-usuario','A','Informar as alternativas e respeitar a decisão autônoma da usuária.',10),
  ('pratica-servico-social-autonomia-usuario','B','Omitir informações para conduzi-la à decisão preferida pela equipe.',20),
  ('pratica-servico-social-autonomia-usuario','C','Encerrar o atendimento por discordância com a orientação profissional.',30),
  ('pratica-servico-social-autonomia-usuario','D','Transferir automaticamente a decisão para outra pessoa adulta.',40),
  ('pratica-servico-social-estudo-social-opiniao','A','Copiar integralmente os relatos recebidos, sem análise ou finalidade definida.',10),
  ('pratica-servico-social-estudo-social-opiniao','B','Registrar impressões morais para demonstrar convicção profissional.',20),
  ('pratica-servico-social-estudo-social-opiniao','C','Fundamentar a análise, selecionar dados pertinentes e explicitar limites e mediações.',30),
  ('pratica-servico-social-estudo-social-opiniao','D','Divulgar informações sigilosas para tornar o documento mais detalhado.',40),
  ('pratica-servico-social-ldo-prioridades','A','Executar diretamente todas as despesas públicas do exercício.',10),
  ('pratica-servico-social-ldo-prioridades','B','Substituir o plano plurianual por um orçamento definitivo de quatro anos.',20),
  ('pratica-servico-social-ldo-prioridades','C','Definir somente a arrecadação tributária dos municípios.',30),
  ('pratica-servico-social-ldo-prioridades','D','Estabelecer metas e prioridades e orientar a elaboração da lei orçamentária anual.',40),
  ('pratica-sociologia-acao-social-weber','A','Uma pessoa abre o guarda-chuva por reflexo ao sentir a primeira gota, sem considerar ninguém.',10),
  ('pratica-sociologia-acao-social-weber','B','Uma candidata prepara sua fala considerando as expectativas do público que a ouvirá.',20),
  ('pratica-sociologia-acao-social-weber','C','Uma pedra se desloca pela força da gravidade.',30),
  ('pratica-sociologia-acao-social-weber','D','Uma pessoa espirra involuntariamente devido a uma irritação nasal.',40),
  ('pratica-sociologia-desagregacao-indicadores-raciais','A','Manter apenas a média geral, porque toda desagregação impede comparações.',10),
  ('pratica-sociologia-desagregacao-indicadores-raciais','B','Comparar somente números absolutos, sem considerar o tamanho dos grupos.',20),
  ('pratica-sociologia-desagregacao-indicadores-raciais','C','Desagregar por cor ou raça e sexo, mantendo critérios e denominadores comparáveis.',30),
  ('pratica-sociologia-desagregacao-indicadores-raciais','D','Excluir os grupos menores para estabilizar artificialmente a média.',40),
  ('pratica-sociologia-segregacao-mobilidade','A','A distância é uma escolha individual sem relação com políticas urbanas.',10),
  ('pratica-sociologia-segregacao-mobilidade','B','O transporte insuficiente reduz automaticamente a segregação residencial.',20),
  ('pratica-sociologia-segregacao-mobilidade','C','O problema decorre apenas da preferência por modos motorizados individuais.',30),
  ('pratica-sociologia-segregacao-mobilidade','D','Uso do solo, periferização e transporte desigual reforçam segregação e exclusão.',40),
  ('pratica-sociologia-taxa-comparacao-territorios','A','Usar uma taxa ou proporção com população exposta e período compatíveis.',10),
  ('pratica-sociologia-taxa-comparacao-territorios','B','Somar os eventos dos dois territórios e comparar o total único.',20),
  ('pratica-sociologia-taxa-comparacao-territorios','C','Comparar apenas os números absolutos, ignorando os tamanhos populacionais.',30),
  ('pratica-sociologia-taxa-comparacao-territorios','D','Escolher o território com maior população como referência sem calcular medida.',40)
)
insert into public.question_options(question_id, label, option_text, sort_order)
select question.id, seed.label, seed.option_text, seed.sort_order
from option_seed seed
join public.questions question on question.slug = seed.question_slug
on conflict (question_id, label) do update set
  option_text = excluded.option_text,
  sort_order = excluded.sort_order;

with solution_seed(question_slug, correct_label) as (values
  ('pratica-psicologia-envelhecimento-contextual','B'),
  ('pratica-psicologia-reducao-danos-autonomia','C'),
  ('pratica-psicologia-visita-domiciliar','B'),
  ('pratica-psicologia-declaracao-limites','D'),
  ('pratica-servico-social-questao-social-mediacoes','B'),
  ('pratica-servico-social-autonomia-usuario','A'),
  ('pratica-servico-social-estudo-social-opiniao','C'),
  ('pratica-servico-social-ldo-prioridades','D'),
  ('pratica-sociologia-acao-social-weber','B'),
  ('pratica-sociologia-desagregacao-indicadores-raciais','C'),
  ('pratica-sociologia-segregacao-mobilidade','D'),
  ('pratica-sociologia-taxa-comparacao-territorios','A')
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

with simulation_seed(
  specialty_slug, simulation_slug, title, description, time_limit_minutes, sort_order
) as (values
  (
    'psicologia-409',
    'simulado-piloto-psicologia',
    'Simulado piloto — Psicologia',
    'Quatro questões autorais da Nortis, uma por bloco específico do edital. Resultado pedagógico, sem equivalência com nota oficial.',
    10,
    40910
  ),
  (
    'servico-social-410',
    'simulado-piloto-servico-social',
    'Simulado piloto — Serviço Social',
    'Quatro questões autorais da Nortis, uma por bloco específico do edital. Resultado pedagógico, sem equivalência com nota oficial.',
    10,
    41010
  ),
  (
    'sociologia-411',
    'simulado-piloto-sociologia',
    'Simulado piloto — Sociologia',
    'Quatro questões autorais da Nortis, uma por bloco específico do edital. Resultado pedagógico, sem equivalência com nota oficial.',
    10,
    41110
  )
)
insert into public.simulations(
  product_id, slug, target_specialty_id, title, description,
  time_limit_minutes, active, sort_order
)
select product.id, seed.simulation_slug, specialty.id, seed.title,
       seed.description, seed.time_limit_minutes, true, seed.sort_order
from simulation_seed seed
join public.products product
  on product.slug = 'nexo-social-sedes-df-2026'
 and product.active = true
join public.syllabus_nodes specialty
  on specialty.product_id = product.id
 and specialty.slug = seed.specialty_slug
 and specialty.node_type = 'specialty'
on conflict (slug) where slug is not null do update set
  product_id = excluded.product_id,
  target_specialty_id = excluded.target_specialty_id,
  title = excluded.title,
  description = excluded.description,
  time_limit_minutes = excluded.time_limit_minutes,
  active = excluded.active,
  sort_order = excluded.sort_order;

with simulation_question_seed(simulation_slug, question_slug, sort_order) as (values
  ('simulado-piloto-psicologia','pratica-psicologia-envelhecimento-contextual',10),
  ('simulado-piloto-psicologia','pratica-psicologia-reducao-danos-autonomia',20),
  ('simulado-piloto-psicologia','pratica-psicologia-visita-domiciliar',30),
  ('simulado-piloto-psicologia','pratica-psicologia-declaracao-limites',40),
  ('simulado-piloto-servico-social','pratica-servico-social-questao-social-mediacoes',10),
  ('simulado-piloto-servico-social','pratica-servico-social-autonomia-usuario',20),
  ('simulado-piloto-servico-social','pratica-servico-social-estudo-social-opiniao',30),
  ('simulado-piloto-servico-social','pratica-servico-social-ldo-prioridades',40),
  ('simulado-piloto-sociologia','pratica-sociologia-acao-social-weber',10),
  ('simulado-piloto-sociologia','pratica-sociologia-desagregacao-indicadores-raciais',20),
  ('simulado-piloto-sociologia','pratica-sociologia-segregacao-mobilidade',30),
  ('simulado-piloto-sociologia','pratica-sociologia-taxa-comparacao-territorios',40)
)
insert into public.simulation_questions(simulation_id, question_id, sort_order)
select simulation.id, question.id, seed.sort_order
from simulation_question_seed seed
join public.simulations simulation
  on simulation.slug = seed.simulation_slug
join public.questions question
  on question.slug = seed.question_slug
on conflict (simulation_id, question_id) do update set
  sort_order = excluded.sort_order;
