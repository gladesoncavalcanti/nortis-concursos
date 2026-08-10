-- Amplia o piloto editorial do diagnóstico objetivo sem alterar o motor,
-- as regras de acesso ou o cálculo já validados.
with diagnostic_seed(
  specialty_slug, subject_slug, question_slug, statement,
  explanation, source_reference, sort_order
) as (values
  (
    'cuidador-social-201',
    '2-rede-socioassistencial-e-intersetorialidade',
    'diagnostico-cuidador-social-rede-intersetorial',
    'Uma criança acolhida precisa de acompanhamento de saúde e de continuidade na escola. Qual conduta expressa adequadamente o trabalho em rede previsto para o cuidador social?',
    'O atendimento deve ser articulado entre o serviço de acolhimento e as políticas de saúde e educação, com encaminhamentos acompanhados e circulação das informações necessárias entre as equipes responsáveis. A articulação intersetorial evita respostas isoladas e favorece a continuidade do cuidado.',
    'Edital SEDES-DF nº 1/2026, item 20.2.3.2.2, subitem 2; Resolução CNAS nº 33/2012 (NOB/SUAS). Questão autoral Nortis.',
    20110
  ),
  (
    'cuidador-social-201',
    '3-rotinas-de-acolhimento-cuidado-e-trabalho-em-equipe',
    'diagnostico-cuidador-social-rotina-humanizada',
    'Durante a organização da rotina de uma unidade de acolhimento, qual atuação está alinhada às orientações técnicas para crianças e adolescentes?',
    'O cuidado cotidiano deve ser personalizado, respeitar a história e as características de cada pessoa acolhida, estimular sua autonomia e ser articulado com a equipe técnica. Rotinas coletivas não justificam tratamento impessoal nem substituem o planejamento individualizado.',
    'Edital SEDES-DF nº 1/2026, item 20.2.3.2.2, subitem 3; Resolução Conjunta CNAS/CONANDA nº 1/2009. Questão autoral Nortis.',
    20120
  ),
  (
    'cuidador-social-201',
    '4-protecao-social-especial-de-alta-complexidade',
    'diagnostico-cuidador-social-acolhimento-provisorio',
    'Em relação ao acolhimento institucional de crianças e adolescentes, qual princípio deve orientar a atuação da equipe?',
    'O afastamento do convívio familiar deve ser excepcional e provisório. Sempre que for seguro e atender ao melhor interesse da criança ou do adolescente, o serviço deve contribuir para preservar e fortalecer vínculos familiares e comunitários, sem transformar o acolhimento em solução permanente.',
    'Edital SEDES-DF nº 1/2026, item 20.2.3.2.2, subitem 4; Resolução Conjunta CNAS/CONANDA nº 1/2009; Resolução CNAS nº 109/2009. Questão autoral Nortis.',
    20130
  ),
  (
    'cuidador-social-201',
    '5-populacao-em-situacao-de-rua-e-nocoes-de-abordagem-e-acolhimento-social',
    'diagnostico-cuidador-social-populacao-rua',
    'Ao acolher uma pessoa em situação de rua em uma casa de passagem, qual postura está de acordo com a Política Nacional para a População em Situação de Rua?',
    'A política determina atendimento humanizado e universalizado, respeito à dignidade e às diferenças e articulação entre políticas públicas. O acolhimento não pode ser condicionado a práticas coercitivas nem reduzir a pessoa à sua condição de moradia.',
    'Edital SEDES-DF nº 1/2026, item 20.2.3.2.2, subitem 5; Decreto nº 7.053/2009, arts. 5º e 6º. Questão autoral Nortis.',
    20140
  ),
  (
    'cuidador-social-201',
    '6-nocoes-de-saude-mental-e-reducao-de-danos',
    'diagnostico-cuidador-social-saude-mental',
    'Uma pessoa acolhida apresenta sofrimento psíquico e uso prejudicial de álcool. Qual encaminhamento é pedagogicamente adequado?',
    'A atuação deve acolher sem estigma, respeitar direitos e autonomia, articular o cuidado com a Rede de Atenção Psicossocial e considerar estratégias de redução de danos quando aplicáveis. Isolamento, julgamento moral e exigência de abstinência como condição prévia de cuidado contrariam essa abordagem.',
    'Edital SEDES-DF nº 1/2026, item 20.2.3.2.2, subitem 6; Ministério da Saúde, diretrizes da Rede de Atenção Psicossocial (RAPS). Questão autoral Nortis.',
    20150
  ),
  (
    'administracao-400',
    '1-teoria-geral-e-processos-administrativos',
    'diagnostico-administracao-funcao-planejamento',
    'Antes de distribuir recursos e atribuições, uma unidade pública define objetivos, resultados esperados e ações para alcançá-los. Qual função administrativa predomina nessa situação?',
    'O planejamento antecede a execução e estabelece objetivos e caminhos para alcançá-los. A organização distribui recursos e responsabilidades; a direção mobiliza as pessoas; e o controle compara resultados com o que foi planejado.',
    'Edital SEDES-DF nº 1/2026, item 20.2.4.2.1, subitem 1; materiais institucionais da Enap sobre funções administrativas e planejamento. Questão autoral Nortis.',
    40010
  ),
  (
    'administracao-400',
    '2-organizacao-sistemas-metodos-os-m-e-qualidade',
    'diagnostico-administracao-mapeamento-processos',
    'Uma equipe pretende reduzir atrasos em um processo administrativo. Qual sequência favorece uma melhoria fundamentada do fluxo de trabalho?',
    'Primeiro se representa e analisa o processo atual para localizar etapas, responsabilidades, gargalos e riscos. Depois se desenha o fluxo futuro, implantam-se as melhorias e monitoram-se os resultados. Alterar o processo sem compreender o estado atual dificulta identificar causas e avaliar ganhos.',
    'Edital SEDES-DF nº 1/2026, item 20.2.4.2.1, subitem 2; Ministério do Planejamento e Orçamento, Guia Metodológico de Gestão de Processos. Questão autoral Nortis.',
    40020
  ),
  (
    'administracao-400',
    '3-gestao-de-projetos',
    'diagnostico-administracao-projeto-operacao',
    'Qual situação caracteriza um projeto, em vez de uma operação rotineira da organização?',
    'Projeto é um esforço temporário orientado a um objetivo e a entregas definidas, com início, desenvolvimento, monitoramento e encerramento. Operações são contínuas e repetitivas, embora também exijam gestão e controle.',
    'Edital SEDES-DF nº 1/2026, item 20.2.4.2.1, subitem 3; Governo Digital, Metodologia de Gerenciamento de Projetos do SISP (MGP-SISP). Questão autoral Nortis.',
    40030
  ),
  (
    'administracao-400',
    '4-administracao-financeira-e-orcamentaria-afo',
    'diagnostico-administracao-liquidacao-despesa',
    'Após a entrega de um serviço contratado, a Administração verifica os documentos comprobatórios, o direito do credor, o objeto e o valor exato a pagar. Qual estágio da despesa está sendo realizado?',
    'Trata-se da liquidação da despesa. Nos termos da Lei nº 4.320/1964, a liquidação verifica o direito adquirido pelo credor com base nos títulos e documentos comprobatórios, apurando a origem, o objeto, o valor e o beneficiário do pagamento.',
    'Edital SEDES-DF nº 1/2026, item 20.2.4.2.1, subitem 4; Lei Federal nº 4.320/1964, arts. 62 e 63. Questão autoral Nortis.',
    40040
  ),
  (
    'administracao-400',
    '5-gestao-de-pessoas',
    'diagnostico-administracao-desenvolvimento-competencias',
    'Ao elaborar um plano de desenvolvimento de pessoas, qual critério torna a capacitação coerente com a gestão por competências?',
    'As ações de desenvolvimento devem partir das competências necessárias ao trabalho e das lacunas identificadas, mantendo alinhamento com os objetivos institucionais. Ofertas desconectadas das necessidades do cargo ou sem acompanhamento não caracterizam uma gestão de desenvolvimento orientada a resultados.',
    'Edital SEDES-DF nº 1/2026, item 20.2.4.2.1, subitem 5; Decreto Federal nº 9.991/2019, arts. 1º a 3º. Questão autoral Nortis.',
    40050
  ),
  (
    'administracao-400',
    '6-etica-e-conduta-profissional',
    'diagnostico-administracao-etica-informacao',
    'Um servidor tem acesso, em razão do trabalho, a informação ainda não divulgada que poderia beneficiar um conhecido. Qual conduta é compatível com a ética no serviço público?',
    'O servidor deve preservar o sigilo aplicável, não utilizar informação funcional para benefício próprio ou de terceiros e agir com impessoalidade e compromisso com o interesse público. A confiança institucional depende do uso responsável das informações obtidas no exercício do cargo.',
    'Edital SEDES-DF nº 1/2026, item 20.2.4.2.1, subitem 6; Decreto Distrital nº 37.297/2016, Anexo II. Questão autoral Nortis.',
    40060
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
  ('diagnostico-cuidador-social-rede-intersetorial','A','Concentrar todas as decisões no serviço de acolhimento para evitar contato com outras políticas públicas.',10),
  ('diagnostico-cuidador-social-rede-intersetorial','B','Articular saúde, educação e assistência social, acompanhar os encaminhamentos e favorecer a continuidade do cuidado.',20),
  ('diagnostico-cuidador-social-rede-intersetorial','C','Transferir integralmente o caso à escola, encerrando a responsabilidade da equipe de acolhimento.',30),
  ('diagnostico-cuidador-social-rede-intersetorial','D','Aguardar que a família resolva isoladamente as demandas antes de acionar a rede.',40),
  ('diagnostico-cuidador-social-rotina-humanizada','A','Aplicar uma rotina idêntica e inflexível a todos, independentemente de idade, história ou necessidades.',10),
  ('diagnostico-cuidador-social-rotina-humanizada','B','Evitar que a pessoa acolhida participe de decisões cotidianas para acelerar o trabalho da equipe.',20),
  ('diagnostico-cuidador-social-rotina-humanizada','C','Oferecer cuidado personalizado, estimular autonomia e articular as rotinas com a equipe técnica.',30),
  ('diagnostico-cuidador-social-rotina-humanizada','D','Substituir registros individuais por relatos informais compartilhados apenas entre cuidadores.',40),
  ('diagnostico-cuidador-social-acolhimento-provisorio','A','Manter o acolhimento por prazo indeterminado sempre que houver vaga disponível.',10),
  ('diagnostico-cuidador-social-acolhimento-provisorio','B','Evitar contato familiar em todos os casos para facilitar a adaptação à unidade.',20),
  ('diagnostico-cuidador-social-acolhimento-provisorio','C','Considerar o acolhimento definitivo, independentemente da avaliação individual.',30),
  ('diagnostico-cuidador-social-acolhimento-provisorio','D','Tratar o afastamento como excepcional e provisório e preservar vínculos quando isso for seguro e adequado.',40),
  ('diagnostico-cuidador-social-populacao-rua','A','Oferecer atendimento humanizado, respeitar diferenças e articular as políticas públicas necessárias.',10),
  ('diagnostico-cuidador-social-populacao-rua','B','Condicionar o acolhimento à aceitação imediata de todas as decisões da equipe.',20),
  ('diagnostico-cuidador-social-populacao-rua','C','Padronizar o atendimento sem considerar necessidades, identidade ou trajetória da pessoa.',30),
  ('diagnostico-cuidador-social-populacao-rua','D','Restringir o atendimento à oferta de pernoite, sem encaminhamento para outros direitos.',40),
  ('diagnostico-cuidador-social-saude-mental','A','Usar julgamento moral para convencer a pessoa a interromper imediatamente o uso de álcool.',10),
  ('diagnostico-cuidador-social-saude-mental','B','Isolar a pessoa da rede de saúde até que ela aceite abstinência total.',20),
  ('diagnostico-cuidador-social-saude-mental','C','Acolher sem estigma, articular a RAPS e considerar estratégias de redução de danos.',30),
  ('diagnostico-cuidador-social-saude-mental','D','Encerrar o acompanhamento socioassistencial porque saúde mental é responsabilidade exclusiva do setor de saúde.',40),
  ('diagnostico-administracao-funcao-planejamento','A','Planejamento.',10),
  ('diagnostico-administracao-funcao-planejamento','B','Organização.',20),
  ('diagnostico-administracao-funcao-planejamento','C','Direção.',30),
  ('diagnostico-administracao-funcao-planejamento','D','Controle.',40),
  ('diagnostico-administracao-mapeamento-processos','A','Implantar uma ferramenta nova e somente depois identificar qual problema deveria ser resolvido.',10),
  ('diagnostico-administracao-mapeamento-processos','B','Mapear o processo atual, analisar gargalos, desenhar o fluxo futuro, implantar melhorias e monitorar resultados.',20),
  ('diagnostico-administracao-mapeamento-processos','C','Eliminar registros do fluxo atual para que a equipe não seja influenciada por práticas anteriores.',30),
  ('diagnostico-administracao-mapeamento-processos','D','Redesenhar apenas o organograma, sem examinar atividades, decisões ou responsáveis pelo processo.',40),
  ('diagnostico-administracao-projeto-operacao','A','Processamento mensal e permanente da folha de pagamento.',10),
  ('diagnostico-administracao-projeto-operacao','B','Atendimento diário e contínuo de solicitações em um protocolo.',20),
  ('diagnostico-administracao-projeto-operacao','C','Implantação temporária de um novo sistema, com objetivo, entregas e encerramento definidos.',30),
  ('diagnostico-administracao-projeto-operacao','D','Manutenção rotineira e recorrente dos equipamentos do órgão.',40),
  ('diagnostico-administracao-liquidacao-despesa','A','Fixação.',10),
  ('diagnostico-administracao-liquidacao-despesa','B','Empenho.',20),
  ('diagnostico-administracao-liquidacao-despesa','C','Liquidação.',30),
  ('diagnostico-administracao-liquidacao-despesa','D','Pagamento.',40),
  ('diagnostico-administracao-desenvolvimento-competencias','A','Escolher cursos apenas pela popularidade, sem relacioná-los às atividades do órgão.',10),
  ('diagnostico-administracao-desenvolvimento-competencias','B','Repetir anualmente o mesmo catálogo, mesmo que as necessidades tenham mudado.',20),
  ('diagnostico-administracao-desenvolvimento-competencias','C','Priorizar somente preferências individuais, sem referência aos objetivos institucionais.',30),
  ('diagnostico-administracao-desenvolvimento-competencias','D','Identificar competências necessárias e lacunas de desenvolvimento, alinhando as ações à estratégia institucional.',40),
  ('diagnostico-administracao-etica-informacao','A','Compartilhar a informação se não houver pagamento direto pelo favorecimento.',10),
  ('diagnostico-administracao-etica-informacao','B','Usar a informação apenas para beneficiar pessoa de confiança, mantendo-a fora do público geral.',20),
  ('diagnostico-administracao-etica-informacao','C','Preservar o sigilo aplicável e impedir o uso da informação para benefício particular.',30),
  ('diagnostico-administracao-etica-informacao','D','Divulgar a informação em grupo privado para dividir a responsabilidade pela decisão.',40)
)
insert into public.question_options(question_id, label, option_text, sort_order)
select question.id, seed.label, seed.option_text, seed.sort_order
from option_seed seed
join public.questions question on question.slug = seed.question_slug
on conflict (question_id, label) do update set
  option_text = excluded.option_text,
  sort_order = excluded.sort_order;

with solution_seed(question_slug, correct_label) as (values
  ('diagnostico-cuidador-social-rede-intersetorial','B'),
  ('diagnostico-cuidador-social-rotina-humanizada','C'),
  ('diagnostico-cuidador-social-acolhimento-provisorio','D'),
  ('diagnostico-cuidador-social-populacao-rua','A'),
  ('diagnostico-cuidador-social-saude-mental','C'),
  ('diagnostico-administracao-funcao-planejamento','A'),
  ('diagnostico-administracao-mapeamento-processos','B'),
  ('diagnostico-administracao-projeto-operacao','C'),
  ('diagnostico-administracao-liquidacao-despesa','C'),
  ('diagnostico-administracao-desenvolvimento-competencias','D'),
  ('diagnostico-administracao-etica-informacao','C')
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
