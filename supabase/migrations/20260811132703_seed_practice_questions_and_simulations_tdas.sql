-- Amplia o Banco de Questões e os simulados para as duas especialidades TDAS
-- restantes, reutilizando integralmente o motor e as regras de acesso existentes.
with practice_seed(
  specialty_slug, subject_slug, question_slug, statement,
  explanation, source_reference, sort_order
) as (values
  (
    'cuidador-social-201',
    '2-rede-socioassistencial-e-intersetorialidade',
    'pratica-cuidador-social-articulacao-intersetorial',
    'Uma pessoa acolhida precisa retomar os estudos e também realizar acompanhamento de saúde. Qual atuação do cuidador social favorece a continuidade do atendimento?',
    'O trabalho em rede exige articulação entre assistência social, educação e saúde, com registro e acompanhamento dos encaminhamentos. O cuidador não substitui as equipes especializadas, mas contribui para que a pessoa acolhida acesse os serviços e para que o cuidado não seja fragmentado.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.3.2.2, subitem 2; Resolução CNAS nº 33/2012, NOB/SUAS. Questão autoral Nortis.',
    21110
  ),
  (
    'cuidador-social-201',
    '3-rotinas-de-acolhimento-cuidado-e-trabalho-em-equipe',
    'pratica-cuidador-social-rotina-autonomia',
    'Em uma unidade de acolhimento, uma adolescente pede para participar da organização de sua rotina diária. Qual resposta está alinhada ao cuidado humanizado?',
    'As rotinas devem combinar proteção, participação e respeito às características de cada pessoa acolhida. Promover escolhas compatíveis com a idade e a situação fortalece autonomia; as decisões relevantes também devem ser registradas e articuladas com a equipe responsável.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.3.2.2, subitem 3; Resolução Conjunta CNAS/CONANDA nº 1/2009, Orientações Técnicas: Serviços de Acolhimento para Crianças e Adolescentes. Questão autoral Nortis.',
    21120
  ),
  (
    'cuidador-social-201',
    '4-protecao-social-especial-de-alta-complexidade',
    'pratica-cuidador-social-preservacao-vinculos',
    'Durante o acolhimento, a avaliação técnica indica que o contato de uma criança com familiares de referência é seguro e contribui para seu desenvolvimento. Qual conduta é adequada?',
    'O acolhimento de crianças e adolescentes é medida protetiva excepcional e provisória. Quando não houver risco e houver indicação técnica, o serviço deve apoiar a preservação e o fortalecimento dos vínculos familiares e comunitários, considerando o melhor interesse da criança.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.3.2.2, subitem 4; Resolução Conjunta CNAS/CONANDA nº 1/2009; Resolução CNAS nº 109/2009. Questão autoral Nortis.',
    21130
  ),
  (
    'cuidador-social-201',
    '5-populacao-em-situacao-de-rua-e-nocoes-de-abordagem-e-acolhimento-social',
    'pratica-cuidador-social-recusa-acolhimento',
    'Uma pessoa em situação de rua recusa a vaga de acolhimento oferecida naquele momento. Qual postura é compatível com a política nacional?',
    'A recusa não autoriza coerção nem tratamento discriminatório. A equipe deve respeitar a autonomia, oferecer informações acessíveis, registrar a abordagem e manter aberta a possibilidade de construção gradual de vínculo e acesso a direitos.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.3.2.2, subitem 5; Decreto Federal nº 7.053/2009, arts. 5º e 6º. Questão autoral Nortis.',
    21140
  ),
  (
    'cuidador-social-201',
    '6-nocoes-de-saude-mental-e-reducao-de-danos',
    'pratica-cuidador-social-crise-saude-mental',
    'Uma pessoa acolhida apresenta intenso sofrimento psíquico e sinais de risco imediato. Qual é a conduta mais adequada para o cuidador social?',
    'O cuidador deve acolher sem julgamento, acionar a equipe responsável e articular o ponto adequado da Rede de Atenção Psicossocial ou o serviço de urgência, conforme o risco. Não cabe ao cuidador formular diagnóstico clínico nem isolar a pessoa como punição.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.3.2.2, subitem 6; Ministério da Saúde, Rede de Atenção Psicossocial e Guia de Acolhimento à Crise em Saúde Mental na RAPS. Questão autoral Nortis.',
    21150
  ),
  (
    'tecnico-administrativo-202',
    '1-nocoes-de-direito-constitucional',
    'pratica-tecnico-administrativo-publicidade-impessoal',
    'Uma peça de divulgação de serviço público destaca o nome e a imagem de uma autoridade como responsável pessoal pela entrega. Qual ajuste atende à Constituição Federal?',
    'A publicidade dos órgãos públicos deve ter caráter educativo, informativo ou de orientação social e não pode promover pessoalmente autoridades ou servidores. A peça deve comunicar o serviço de forma impessoal, sem nomes, símbolos ou imagens de promoção pessoal.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.3.2.3, subitem 1; Constituição Federal de 1988, art. 37, caput e § 1º. Questão autoral Nortis.',
    21210
  ),
  (
    'tecnico-administrativo-202',
    '2-nocoes-de-direito-administrativo-e-legislacao',
    'pratica-tecnico-administrativo-autotutela',
    'Ao revisar seus atos, a Administração identifica um ato ilegal e outro válido que deixou de ser conveniente. Como deve proceder?',
    'No exercício da autotutela, a Administração deve anular o ato ilegal e pode revogar o ato válido por motivo de conveniência ou oportunidade, respeitados os direitos adquiridos e os limites legais aplicáveis.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.3.2.3, subitem 2; Lei Federal nº 9.784/1999, art. 53; Supremo Tribunal Federal, Súmula nº 473. Questão autoral Nortis.',
    21220
  ),
  (
    'tecnico-administrativo-202',
    '3-atendimento-rotinas-administrativas-e-arquivologia',
    'pratica-tecnico-administrativo-protocolo-rastreavel',
    'Um documento externo chega ao setor de protocolo e precisa seguir para a unidade competente. Qual procedimento mantém sua rastreabilidade?',
    'O protocolo deve conferir e registrar o recebimento, classificar quando cabível, distribuir e controlar a tramitação. O encaminhamento sem registro rompe a cadeia de controle documental e dificulta localizar o documento e comprovar seu fluxo.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.3.2.3, subitem 3; Ministério da Gestão e da Inovação em Serviços Públicos, Manual do Protocolo e Arquivo do SEI. Questão autoral Nortis.',
    21230
  ),
  (
    'tecnico-administrativo-202',
    '4-nocoes-de-recursos-materiais-patrimonio-e-compras',
    'pratica-tecnico-administrativo-planejamento-contratacao',
    'Antes de iniciar uma licitação, a unidade identifica a necessidade pública, estuda alternativas e verifica a compatibilidade com o planejamento e o orçamento. Em qual fase essas atividades se concentram?',
    'Essas atividades integram a fase preparatória, caracterizada pelo planejamento da contratação. Nela são examinadas a necessidade, as soluções possíveis, os requisitos, os riscos e a compatibilidade orçamentária antes da seleção do fornecedor.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.3.2.3, subitem 4; Lei Federal nº 14.133/2021, art. 18. Questão autoral Nortis.',
    21240
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
  active = excluded.active,
  updated_at = now();

with option_seed(question_slug, label, option_text, sort_order) as (values
  ('pratica-cuidador-social-articulacao-intersetorial','A','Encerrar o acompanhamento assim que forem informados os endereços da escola e do serviço de saúde.',10),
  ('pratica-cuidador-social-articulacao-intersetorial','B','Articular os serviços necessários, registrar os encaminhamentos e acompanhar sua continuidade com a equipe.',20),
  ('pratica-cuidador-social-articulacao-intersetorial','C','Concentrar todas as decisões na unidade de acolhimento para evitar participação de outras políticas.',30),
  ('pratica-cuidador-social-articulacao-intersetorial','D','Compartilhar integralmente todos os dados pessoais com qualquer serviço, sem avaliar finalidade e necessidade.',40),
  ('pratica-cuidador-social-rotina-autonomia','A','Impor uma rotina idêntica a todos, pois a participação individual prejudica a organização coletiva.',10),
  ('pratica-cuidador-social-rotina-autonomia','B','Permitir que a adolescente decida sozinha sobre todas as medidas protetivas e técnicas.',20),
  ('pratica-cuidador-social-rotina-autonomia','C','Combinar participação e proteção, apoiando escolhas adequadas e articulando a rotina com a equipe.',30),
  ('pratica-cuidador-social-rotina-autonomia','D','Evitar registrar preferências e decisões cotidianas para preservar a informalidade do cuidado.',40),
  ('pratica-cuidador-social-preservacao-vinculos','A','Impedir todo contato familiar enquanto durar o acolhimento, mesmo sem risco identificado.',10),
  ('pratica-cuidador-social-preservacao-vinculos','B','Apoiar os contatos indicados e o fortalecimento dos vínculos, conforme avaliação e planejamento da equipe.',20),
  ('pratica-cuidador-social-preservacao-vinculos','C','Transformar o acolhimento em medida permanente para evitar mudanças na rotina da criança.',30),
  ('pratica-cuidador-social-preservacao-vinculos','D','Delegar à criança toda a responsabilidade pela organização dos contatos familiares.',40),
  ('pratica-cuidador-social-recusa-acolhimento','A','Respeitar a decisão, informar alternativas e manter uma abordagem não coercitiva para construir vínculo.',10),
  ('pratica-cuidador-social-recusa-acolhimento','B','Condicionar qualquer atendimento futuro à aceitação imediata da vaga oferecida.',20),
  ('pratica-cuidador-social-recusa-acolhimento','C','Solicitar retirada forçada da pessoa e de seus pertences do espaço público.',30),
  ('pratica-cuidador-social-recusa-acolhimento','D','Encerrar definitivamente a abordagem, pois a recusa elimina o direito a novo atendimento.',40),
  ('pratica-cuidador-social-crise-saude-mental','A','Acolher, comunicar a equipe e acionar a rede de saúde ou urgência conforme a avaliação de risco.',10),
  ('pratica-cuidador-social-crise-saude-mental','B','Realizar diagnóstico clínico por conta própria e definir medicação antes de avisar a equipe.',20),
  ('pratica-cuidador-social-crise-saude-mental','C','Isolar a pessoa como medida disciplinar até que o sofrimento diminua.',30),
  ('pratica-cuidador-social-crise-saude-mental','D','Encerrar o acolhimento porque situações de saúde não envolvem a proteção socioassistencial.',40),
  ('pratica-tecnico-administrativo-publicidade-impessoal','A','Manter a imagem da autoridade e apenas reduzir seu tamanho na peça.',10),
  ('pratica-tecnico-administrativo-publicidade-impessoal','B','Retirar a promoção pessoal e manter somente conteúdo educativo, informativo ou de orientação social.',20),
  ('pratica-tecnico-administrativo-publicidade-impessoal','C','Substituir o nome da autoridade pelo nome de um servidor que executou o serviço.',30),
  ('pratica-tecnico-administrativo-publicidade-impessoal','D','Eliminar toda publicidade institucional, pois a Constituição proíbe a divulgação de serviços públicos.',40),
  ('pratica-tecnico-administrativo-autotutela','A','Revogar os dois atos, pois ilegalidade e inconveniência produzem a mesma consequência.',10),
  ('pratica-tecnico-administrativo-autotutela','B','Manter os dois atos até que exista decisão judicial obrigando a Administração a agir.',20),
  ('pratica-tecnico-administrativo-autotutela','C','Anular o ato ilegal e avaliar a revogação do ato válido que se tornou inconveniente.',30),
  ('pratica-tecnico-administrativo-autotutela','D','Convalidar sempre o ato ilegal e anular o ato válido por razões de mérito.',40),
  ('pratica-tecnico-administrativo-protocolo-rastreavel','A','Encaminhar diretamente à unidade sem registro para reduzir o tempo do atendimento.',10),
  ('pratica-tecnico-administrativo-protocolo-rastreavel','B','Conferir, registrar, classificar quando cabível, distribuir e controlar a tramitação do documento.',20),
  ('pratica-tecnico-administrativo-protocolo-rastreavel','C','Arquivar definitivamente o documento antes de identificar a unidade responsável.',30),
  ('pratica-tecnico-administrativo-protocolo-rastreavel','D','Eliminar o original logo após a digitalização, independentemente das regras de destinação.',40),
  ('pratica-tecnico-administrativo-planejamento-contratacao','A','Fase de julgamento.',10),
  ('pratica-tecnico-administrativo-planejamento-contratacao','B','Fase recursal.',20),
  ('pratica-tecnico-administrativo-planejamento-contratacao','C','Fase preparatória.',30),
  ('pratica-tecnico-administrativo-planejamento-contratacao','D','Fase de homologação.',40)
)
insert into public.question_options(question_id, label, option_text, sort_order)
select question.id, seed.label, seed.option_text, seed.sort_order
from option_seed seed
join public.questions question on question.slug = seed.question_slug
on conflict (question_id, label) do update set
  option_text = excluded.option_text,
  sort_order = excluded.sort_order;

with solution_seed(question_slug, correct_label) as (values
  ('pratica-cuidador-social-articulacao-intersetorial','B'),
  ('pratica-cuidador-social-rotina-autonomia','C'),
  ('pratica-cuidador-social-preservacao-vinculos','B'),
  ('pratica-cuidador-social-recusa-acolhimento','A'),
  ('pratica-cuidador-social-crise-saude-mental','A'),
  ('pratica-tecnico-administrativo-publicidade-impessoal','B'),
  ('pratica-tecnico-administrativo-autotutela','C'),
  ('pratica-tecnico-administrativo-protocolo-rastreavel','B'),
  ('pratica-tecnico-administrativo-planejamento-contratacao','C')
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
    'cuidador-social-201',
    'simulado-piloto-cuidador-social',
    'Simulado piloto — Cuidador Social',
    'Cinco questões autorais da Nortis, uma por bloco específico do edital. Resultado pedagógico, sem equivalência com nota oficial.',
    10,
    20110
  ),
  (
    'tecnico-administrativo-202',
    'simulado-piloto-tecnico-administrativo',
    'Simulado piloto — Técnico Administrativo',
    'Quatro questões autorais da Nortis, uma por bloco específico do edital. Resultado pedagógico, sem equivalência com nota oficial.',
    10,
    20210
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
  ('simulado-piloto-cuidador-social','pratica-cuidador-social-articulacao-intersetorial',10),
  ('simulado-piloto-cuidador-social','pratica-cuidador-social-rotina-autonomia',20),
  ('simulado-piloto-cuidador-social','pratica-cuidador-social-preservacao-vinculos',30),
  ('simulado-piloto-cuidador-social','pratica-cuidador-social-recusa-acolhimento',40),
  ('simulado-piloto-cuidador-social','pratica-cuidador-social-crise-saude-mental',50),
  ('simulado-piloto-tecnico-administrativo','pratica-tecnico-administrativo-publicidade-impessoal',10),
  ('simulado-piloto-tecnico-administrativo','pratica-tecnico-administrativo-autotutela',20),
  ('simulado-piloto-tecnico-administrativo','pratica-tecnico-administrativo-protocolo-rastreavel',30),
  ('simulado-piloto-tecnico-administrativo','pratica-tecnico-administrativo-planejamento-contratacao',40)
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
