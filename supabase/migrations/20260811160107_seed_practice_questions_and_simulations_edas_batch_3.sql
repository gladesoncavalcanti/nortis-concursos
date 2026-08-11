-- Amplia o Banco de Questões e os simulados para Estatística, Nutrição e Pedagogia,
-- reutilizando integralmente o motor e as regras de acesso existentes.
with practice_seed(
  specialty_slug, subject_slug, question_slug, statement,
  explanation, source_reference, sort_order
) as (values
  (
    'estatistica-406',
    '1-estatistica-descritiva-e-analise-exploratoria-de-dados',
    'pratica-estatistica-boxplot-valor-atipico',
    'Em um boxplot, uma observação aparece além do limite superior definido pelo critério de 1,5 intervalo interquartil. Qual é a interpretação mais adequada?',
    'O ponto é um valor potencialmente atípico e deve ser investigado. A marcação pelo boxplot não prova erro nem autoriza exclusão automática: é preciso examinar a origem, a qualidade e o contexto do dado.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.7, subitem 1; NIST/SEMATECH e-Handbook of Statistical Methods, seções 1.3.3.7 e 7.1.6. Questão autoral Nortis.',
    22610
  ),
  (
    'estatistica-406',
    '2-probabilidade-e-inferencia-estatistica',
    'pratica-estatistica-qui-quadrado-independencia',
    'Uma equipe quer verificar se a categoria de atendimento utilizada está associada à faixa etária dos usuários. As duas variáveis são categóricas e os dados foram organizados em uma tabela de contingência. Qual teste é adequado?',
    'O teste qui-quadrado de independência avalia se existe associação entre duas variáveis categóricas em uma tabela de contingência, desde que suas condições de aplicação sejam verificadas.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.7, subitem 2; NIST/SEMATECH e-Handbook of Statistical Methods, seção sobre teste qui-quadrado para tabelas de contingência. Questão autoral Nortis.',
    22620
  ),
  (
    'estatistica-406',
    '3-modelagem-estatistica-e-analise-multivariada',
    'pratica-estatistica-componentes-principais',
    'Um conjunto possui muitos indicadores quantitativos correlacionados, e a equipe deseja representá-los por poucas combinações lineares que preservem a maior parte possível da variabilidade. Qual técnica atende a esse objetivo?',
    'A análise de componentes principais transforma variáveis correlacionadas em componentes não correlacionados, ordenados pela parcela de variabilidade explicada. Ela é útil para redução de dimensionalidade, sem transformar os componentes em relações causais.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.7, subitem 3; NIST/SEMATECH e-Handbook of Statistical Methods, seção 6.5.5, Principal Components. Questão autoral Nortis.',
    22630
  ),
  (
    'estatistica-406',
    '4-gestao-e-exploracao-de-bancos-de-dados',
    'pratica-estatistica-left-join',
    'Em uma consulta SQL, a tabela de usuários deve aparecer integralmente, inclusive quando não houver atendimento correspondente na tabela de atendimentos. Qual operação de junção deve partir da tabela de usuários?',
    'Um LEFT OUTER JOIN preserva todas as linhas da tabela à esquerda e preenche com valores nulos as colunas da tabela à direita quando não há correspondência. Por isso, a tabela de usuários deve ficar à esquerda da junção.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.7, subitem 4; PostgreSQL 17 Documentation, seção 7.2.1.1, Joined Tables. Questão autoral Nortis.',
    22640
  ),
  (
    'nutricao-407',
    '1-seguranca-alimentar-e-nutricional-san-e-politicas-publicas',
    'pratica-nutricao-conceito-san',
    'Uma ação amplia o acesso regular e permanente das famílias a alimentos de qualidade e em quantidade suficiente, sem comprometer outras necessidades essenciais, respeitando práticas alimentares sustentáveis. Qual conceito orienta essa ação?',
    'A descrição corresponde à segurança alimentar e nutricional: acesso regular e permanente a alimentos de qualidade, em quantidade suficiente, sem comprometer outras necessidades essenciais, com práticas promotoras de saúde e sustentabilidade.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.8, subitem 1; Lei Federal nº 11.346/2006 (LOSAN), art. 3º. Questão autoral Nortis.',
    22710
  ),
  (
    'nutricao-407',
    '2-nutricao-em-saude-publica-e-epidemiologia',
    'pratica-nutricao-vigilancia-alimentar',
    'Para orientar ações de saúde em um território, a equipe deseja acompanhar continuamente o estado nutricional e o consumo alimentar da população atendida. Qual estratégia é coerente com a Vigilância Alimentar e Nutricional?',
    'A vigilância combina avaliação antropométrica, como peso e altura conforme o ciclo de vida, com marcadores de consumo alimentar, registro sistemático e análise contínua. Essas informações subsidiam diagnóstico, planejamento e avaliação das ações de saúde.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.8, subitem 2; Ministério da Saúde, Vigilância Alimentar e Nutricional e Protocolos do SISVAN. Questão autoral Nortis.',
    22720
  ),
  (
    'nutricao-407',
    '3-gestao-de-unidades-de-alimentacao-e-nutricao-uan',
    'pratica-nutricao-prevencao-contaminacao-cruzada',
    'Em uma unidade de alimentação, carnes cruas e alimentos prontos para consumo são manipulados na mesma bancada e com os mesmos utensílios, sem higienização entre as etapas. Qual risco deve ser controlado prioritariamente?',
    'A prática favorece contaminação cruzada. Matérias-primas cruas, alimentos prontos, equipamentos e utensílios devem ser organizados e higienizados de modo a impedir a transferência de contaminantes entre as etapas.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.8, subitem 3; Agência Nacional de Vigilância Sanitária, RDC nº 216/2004, Boas Práticas para Serviços de Alimentação. Questão autoral Nortis.',
    22730
  ),
  (
    'nutricao-407',
    '4-educacao-alimentar-e-nutricional-ean-e-programas-institucionais',
    'pratica-nutricao-cae-controle-social',
    'No âmbito do Programa Nacional de Alimentação Escolar, qual atuação é compatível com o Conselho de Alimentação Escolar?',
    'O Conselho de Alimentação Escolar exerce controle social, acompanhando e fiscalizando a execução do programa, zelando pela qualidade dos alimentos e emitindo parecer sobre a prestação de contas. Ele não substitui a gestão executiva nem o responsável técnico.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.8, subitem 4; Lei Federal nº 11.947/2009, art. 19; Fundo Nacional de Desenvolvimento da Educação, materiais de orientação do PNAE e do CAE. Questão autoral Nortis.',
    22740
  ),
  (
    'nutricao-407',
    '5-fundamentos-de-nutricao-e-dietoterapia-basica',
    'pratica-nutricao-orientacao-hipertensao',
    'Na orientação alimentar de uma pessoa adulta com hipertensão, qual recomendação geral está alinhada ao Guia Alimentar para a População Brasileira?',
    'A orientação deve favorecer alimentos in natura ou minimamente processados e preparações culinárias, reduzindo ultraprocessados e o excesso de sódio. O cuidado precisa ser individualizado e não deve prometer tratamento por um alimento isolado.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.8, subitem 5; Ministério da Saúde, Guia Alimentar para a População Brasileira, 2ª edição. Questão autoral Nortis.',
    22750
  ),
  (
    'pedagogia-408',
    '1-fundamentos-da-educacao-e-pedagogia-social',
    'pratica-pedagogia-espaco-nao-escolar',
    'Uma pedagoga planeja uma oficina socioeducativa em um serviço público não escolar, com objetivos, mediação, acompanhamento e avaliação. Como essa atuação deve ser compreendida?',
    'A formação em Pedagogia abrange processos educativos em espaços escolares e não escolares. A intencionalidade, o planejamento, a mediação e a avaliação caracterizam a dimensão pedagógica da ação, sem transformá-la em escolarização formal.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.9, subitem 1; Conselho Nacional de Educação, Resolução CNE/CP nº 1/2006, arts. 2º e 4º. Questão autoral Nortis.',
    22810
  ),
  (
    'pedagogia-408',
    '2-direito-educacional',
    'pratica-pedagogia-direito-educacao',
    'Segundo a Constituição Federal, qual formulação expressa corretamente o direito à educação?',
    'A educação é direito de todos e dever do Estado e da família, promovida e incentivada com a colaboração da sociedade, visando ao pleno desenvolvimento da pessoa, ao preparo para a cidadania e à qualificação para o trabalho.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.9, subitem 2; Constituição da República Federativa do Brasil de 1988, art. 205. Questão autoral Nortis.',
    22820
  ),
  (
    'pedagogia-408',
    '3-o-pedagogo-no-suas',
    'pratica-pedagogia-planejamento-suas',
    'Ao planejar uma ação coletiva com famílias no SUAS, qual conduta qualifica a atuação pedagógica?',
    'O planejamento deve partir das necessidades e potencialidades identificadas, definir objetivos e estratégias, articular a rede quando necessário e prever registro, monitoramento e avaliação. A ação não deve ser improvisada nem isolada do trabalho da equipe.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.9, subitem 3; Ministério do Desenvolvimento Social, Orientações Técnicas sobre o PAIF, volume 2, seções sobre planejamento, registro, monitoramento e avaliação. Questão autoral Nortis.',
    22830
  ),
  (
    'pedagogia-408',
    '4-intervencao-pedagogica-nas-situacoes-de-vulnerabilidade-e-violencia',
    'pratica-pedagogia-comunicacao-maus-tratos',
    'Durante uma atividade, surgem sinais consistentes de maus-tratos contra uma criança. Sem realizar investigação própria, qual providência institucional deve integrar o fluxo de proteção?',
    'A suspeita ou confirmação de maus-tratos deve ser comunicada ao Conselho Tutelar, sem prejuízo de outras providências legais e do fluxo institucional. O atendimento deve acolher e proteger, evitando exposição, interrogatórios repetidos ou revitimização.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.9, subitem 4; Estatuto da Criança e do Adolescente (Lei Federal nº 8.069/1990), art. 13. Questão autoral Nortis.',
    22840
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
  ('pratica-estatistica-boxplot-valor-atipico','A','A observação deve ser excluída automaticamente, pois todo valor além do limite é um erro.',10),
  ('pratica-estatistica-boxplot-valor-atipico','B','A observação prova que a distribuição dos dados é normal.',20),
  ('pratica-estatistica-boxplot-valor-atipico','C','A observação é potencialmente atípica e deve ser investigada antes de qualquer decisão.',30),
  ('pratica-estatistica-boxplot-valor-atipico','D','A observação deve ser substituída pela média sem avaliação adicional.',40),
  ('pratica-estatistica-qui-quadrado-independencia','A','Teste qui-quadrado de independência.',10),
  ('pratica-estatistica-qui-quadrado-independencia','B','Teste t pareado entre duas médias.',20),
  ('pratica-estatistica-qui-quadrado-independencia','C','Correlação linear de Pearson entre variáveis contínuas.',30),
  ('pratica-estatistica-qui-quadrado-independencia','D','Análise de variância para três médias.',40),
  ('pratica-estatistica-componentes-principais','A','Regressão logística binária.',10),
  ('pratica-estatistica-componentes-principais','B','Análise de componentes principais.',20),
  ('pratica-estatistica-componentes-principais','C','Teste exato de Fisher.',30),
  ('pratica-estatistica-componentes-principais','D','Amostragem aleatória simples.',40),
  ('pratica-estatistica-left-join','A','INNER JOIN, porque ele preserva todas as linhas das duas tabelas.',10),
  ('pratica-estatistica-left-join','B','CROSS JOIN, porque ele elimina combinações sem atendimento.',20),
  ('pratica-estatistica-left-join','C','RIGHT JOIN com atendimentos à direita, pois ele preserva somente correspondências.',30),
  ('pratica-estatistica-left-join','D','LEFT JOIN com usuários à esquerda, pois ele preserva todos os usuários.',40),
  ('pratica-nutricao-conceito-san','A','Segurança alimentar e nutricional.',10),
  ('pratica-nutricao-conceito-san','B','Restrição alimentar temporária baseada apenas em renda.',20),
  ('pratica-nutricao-conceito-san','C','Distribuição eventual de qualquer alimento, sem critério de qualidade.',30),
  ('pratica-nutricao-conceito-san','D','Substituição das políticas públicas por ações exclusivamente privadas.',40),
  ('pratica-nutricao-vigilancia-alimentar','A','Realizar uma única pesagem e descartar o contexto do consumo alimentar.',10),
  ('pratica-nutricao-vigilancia-alimentar','B','Usar somente percepção subjetiva, sem registro ou acompanhamento.',20),
  ('pratica-nutricao-vigilancia-alimentar','C','Combinar antropometria, marcadores de consumo e registro contínuo para análise.',30),
  ('pratica-nutricao-vigilancia-alimentar','D','Avaliar apenas pessoas com diagnóstico clínico já confirmado.',40),
  ('pratica-nutricao-prevencao-contaminacao-cruzada','A','Apenas perda de valor energético pelo contato entre os alimentos.',10),
  ('pratica-nutricao-prevencao-contaminacao-cruzada','B','Contaminação cruzada entre alimentos crus e prontos para consumo.',20),
  ('pratica-nutricao-prevencao-contaminacao-cruzada','C','Aumento obrigatório da vida útil dos alimentos prontos.',30),
  ('pratica-nutricao-prevencao-contaminacao-cruzada','D','Redução automática da carga microbiana pela manipulação conjunta.',40),
  ('pratica-nutricao-cae-controle-social','A','Substituir o nutricionista responsável técnico na elaboração dos cardápios.',10),
  ('pratica-nutricao-cae-controle-social','B','Executar diretamente todas as compras e pagamentos do programa.',20),
  ('pratica-nutricao-cae-controle-social','C','Definir sozinho os preços dos gêneros alimentícios contratados.',30),
  ('pratica-nutricao-cae-controle-social','D','Acompanhar e fiscalizar a execução, zelar pela qualidade e emitir parecer.',40),
  ('pratica-nutricao-orientacao-hipertensao','A','Basear a alimentação em ultraprocessados com alegações de saúde.',10),
  ('pratica-nutricao-orientacao-hipertensao','B','Eliminar grupos alimentares inteiros sem avaliação individual.',20),
  ('pratica-nutricao-orientacao-hipertensao','C','Priorizar alimentos in natura ou minimamente processados e reduzir ultraprocessados e sódio.',30),
  ('pratica-nutricao-orientacao-hipertensao','D','Prometer controle da pressão por um único alimento isolado.',40),
  ('pratica-pedagogia-espaco-nao-escolar','A','Como ação pedagógica em espaço não escolar, com intencionalidade e planejamento.',10),
  ('pratica-pedagogia-espaco-nao-escolar','B','Como atividade sem dimensão educativa, porque ocorre fora da escola.',20),
  ('pratica-pedagogia-espaco-nao-escolar','C','Como escolarização formal obrigatória de todos os participantes.',30),
  ('pratica-pedagogia-espaco-nao-escolar','D','Como ação improvisada, incompatível com acompanhamento e avaliação.',40),
  ('pratica-pedagogia-direito-educacao','A','A educação é benefício restrito a quem comprovar renda mínima.',10),
  ('pratica-pedagogia-direito-educacao','B','A educação é dever exclusivo da família, sem responsabilidade estatal.',20),
  ('pratica-pedagogia-direito-educacao','C','A educação é direito de todos e dever do Estado e da família, com colaboração da sociedade.',30),
  ('pratica-pedagogia-direito-educacao','D','A educação visa apenas à qualificação para o trabalho.',40),
  ('pratica-pedagogia-planejamento-suas','A','Repetir a mesma atividade em qualquer território, sem diagnóstico ou avaliação.',10),
  ('pratica-pedagogia-planejamento-suas','B','Planejar com objetivos, estratégias, articulação, registro, monitoramento e avaliação.',20),
  ('pratica-pedagogia-planejamento-suas','C','Atuar isoladamente e evitar registros para preservar a espontaneidade.',30),
  ('pratica-pedagogia-planejamento-suas','D','Substituir o planejamento da equipe por decisões individuais durante a atividade.',40),
  ('pratica-pedagogia-comunicacao-maus-tratos','A','Investigar e interrogar repetidamente a criança antes de comunicar qualquer órgão.',10),
  ('pratica-pedagogia-comunicacao-maus-tratos','B','Manter a situação em sigilo absoluto, independentemente do risco.',20),
  ('pratica-pedagogia-comunicacao-maus-tratos','C','Comunicar ao Conselho Tutelar e seguir o fluxo de proteção, evitando revitimização.',30),
  ('pratica-pedagogia-comunicacao-maus-tratos','D','Divulgar a suspeita entre usuários do serviço para obter confirmação informal.',40)
)
insert into public.question_options(question_id, label, option_text, sort_order)
select question.id, seed.label, seed.option_text, seed.sort_order
from option_seed seed
join public.questions question on question.slug = seed.question_slug
on conflict (question_id, label) do update set
  option_text = excluded.option_text,
  sort_order = excluded.sort_order;

with solution_seed(question_slug, correct_label) as (values
  ('pratica-estatistica-boxplot-valor-atipico','C'),
  ('pratica-estatistica-qui-quadrado-independencia','A'),
  ('pratica-estatistica-componentes-principais','B'),
  ('pratica-estatistica-left-join','D'),
  ('pratica-nutricao-conceito-san','A'),
  ('pratica-nutricao-vigilancia-alimentar','C'),
  ('pratica-nutricao-prevencao-contaminacao-cruzada','B'),
  ('pratica-nutricao-cae-controle-social','D'),
  ('pratica-nutricao-orientacao-hipertensao','C'),
  ('pratica-pedagogia-espaco-nao-escolar','A'),
  ('pratica-pedagogia-direito-educacao','C'),
  ('pratica-pedagogia-planejamento-suas','B'),
  ('pratica-pedagogia-comunicacao-maus-tratos','C')
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
    'estatistica-406',
    'simulado-piloto-estatistica',
    'Simulado piloto — Estatística',
    'Quatro questões autorais da Nortis, uma por bloco específico do edital. Resultado pedagógico, sem equivalência com nota oficial.',
    10,
    40610
  ),
  (
    'nutricao-407',
    'simulado-piloto-nutricao',
    'Simulado piloto — Nutrição',
    'Cinco questões autorais da Nortis, uma por bloco específico do edital. Resultado pedagógico, sem equivalência com nota oficial.',
    10,
    40710
  ),
  (
    'pedagogia-408',
    'simulado-piloto-pedagogia',
    'Simulado piloto — Pedagogia',
    'Quatro questões autorais da Nortis, uma por bloco específico do edital. Resultado pedagógico, sem equivalência com nota oficial.',
    10,
    40810
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
  ('simulado-piloto-estatistica','pratica-estatistica-boxplot-valor-atipico',10),
  ('simulado-piloto-estatistica','pratica-estatistica-qui-quadrado-independencia',20),
  ('simulado-piloto-estatistica','pratica-estatistica-componentes-principais',30),
  ('simulado-piloto-estatistica','pratica-estatistica-left-join',40),
  ('simulado-piloto-nutricao','pratica-nutricao-conceito-san',10),
  ('simulado-piloto-nutricao','pratica-nutricao-vigilancia-alimentar',20),
  ('simulado-piloto-nutricao','pratica-nutricao-prevencao-contaminacao-cruzada',30),
  ('simulado-piloto-nutricao','pratica-nutricao-cae-controle-social',40),
  ('simulado-piloto-nutricao','pratica-nutricao-orientacao-hipertensao',50),
  ('simulado-piloto-pedagogia','pratica-pedagogia-espaco-nao-escolar',10),
  ('simulado-piloto-pedagogia','pratica-pedagogia-direito-educacao',20),
  ('simulado-piloto-pedagogia','pratica-pedagogia-planejamento-suas',30),
  ('simulado-piloto-pedagogia','pratica-pedagogia-comunicacao-maus-tratos',40)
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
