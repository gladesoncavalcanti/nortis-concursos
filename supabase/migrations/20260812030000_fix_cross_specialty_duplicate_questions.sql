-- Lote 2 da correcao editorial: remove duplicacoes semanticas entre
-- especialidades diferentes, reformula dois enunciados com fraseado de
-- "meta" (referencia ao proprio edital em vez da conduta profissional) e
-- reforca a fonte de uma questao que se apoiava apenas no edital.
-- Aditiva: apenas UPDATE por slug, restrito ao banco de questoes. Nao
-- altera estrutura, RLS, policies, vinculos com simulados/gabaritos
-- existentes nem qualquer outra area do produto fora deste conteudo.

with question_update(
  question_slug, statement, explanation, source_reference
) as (values
  (
    'diagnostico-ciencias-contabeis-liquidacao-despesa',
    'Uma unidade pública contrata um serviço e, antes de qualquer pagamento, precisa criar a obrigação de pagamento correspondente, ainda pendente de implemento de condição. Qual estágio da despesa pública corresponde a esse ato?',
    'O empenho é o ato emanado de autoridade competente que cria para o Estado obrigação de pagamento, pendente ou não de implemento de condição. Nenhuma despesa pode ser realizada sem empenho prévio, o que antecede a verificação do direito do credor feita na liquidação.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.4.2.2, subitem 4; Lei Federal nº 4.320/1964, arts. 58 e 60. Questão autoral Nortis.'
  ),
  (
    'diagnostico-servico-social-seguridade-social',
    'Segundo o art. 195 da Constituição Federal, como é financiada a Seguridade Social no Brasil?',
    'A Constituição determina que a Seguridade Social será financiada por toda a sociedade, de forma direta e indireta, mediante recursos provenientes dos orçamentos da União, dos Estados, do Distrito Federal e dos Municípios, e de contribuições sociais incidentes sobre folha de salários, receita ou faturamento e lucro do empregador, sobre a remuneração do trabalhador e sobre a receita de concursos de prognósticos, entre outras fontes previstas em lei.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.4.2.11, subitem 4; Constituição da República Federativa do Brasil de 1988, art. 195, caput. Questão autoral Nortis.'
  ),
  (
    'pratica-tecnico-administrativo-publicidade-impessoal',
    'Um servidor concede, por conta própria, um benefício a um cidadão sem que exista lei autorizando essa concessão. Qual princípio constitucional da Administração Pública está sendo diretamente violado?',
    'O princípio da legalidade determina que o administrador público só pode agir quando a lei autoriza ou determina, ao contrário do particular, que pode fazer tudo o que a lei não proíbe. Conceder benefício sem previsão legal extrapola os limites da atuação administrativa, ainda que a intenção pareça favorável ao cidadão.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.3.2.3, subitem 1; Constituição Federal de 1988, art. 37, caput; Lei Federal nº 9.784/1999, art. 2º. Questão autoral Nortis.'
  ),
  (
    'diagnostico-cuidador-social-populacao-rua',
    'Uma pessoa em situação de rua busca pernoite em uma casa de passagem durante a noite. Qual característica define esse tipo de serviço de acolhimento, segundo a Tipificação Nacional dos Serviços Socioassistenciais?',
    'A casa de passagem oferece acolhimento provisório e de curta permanência, voltado ao atendimento imediato de pessoas em situação de rua, com incentivo à construção de autonomia e à saída da situação de rua. Não se destina a acolhimento institucional de longa duração, que segue outras modalidades da Proteção Social Especial de Alta Complexidade.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.3.2.2, subitem 5; Resolução CNAS nº 109/2009, Tipificação Nacional dos Serviços Socioassistenciais. Questão autoral Nortis.'
  ),
  (
    'diagnostico-tecnico-administrativo-anulacao-revogacao',
    'Um órgão público impede o funcionamento de um estabelecimento que descumpre normas sanitárias, mediante fiscalização e aplicação de sanção administrativa. Qual poder da Administração Pública está sendo exercido?',
    'O poder de polícia é a atividade da Administração Pública que, limitando ou disciplinando direito, interesse ou liberdade, regula a prática de ato ou abstenção de fato em razão do interesse público. Fiscalizar o cumprimento de normas e aplicar sanções administrativas a estabelecimentos são manifestações típicas desse poder, distinto do poder disciplinar, que se volta a servidores e pessoas sujeitas à disciplina interna do órgão.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.3.2.3, subitem 2; Lei Federal nº 5.172/1966 (Código Tributário Nacional), art. 78. Questão autoral Nortis.'
  ),
  (
    'pratica-servico-social-ldo-prioridades',
    'No planejamento orçamentário da assistência social, qual princípio orienta a partilha de responsabilidades financeiras entre os entes federativos na manutenção dos serviços do SUAS?',
    'O SUAS organiza o financiamento por meio do cofinanciamento tripartite entre União, Estados, Distrito Federal e Municípios, com repasses regulares e automáticos conforme pactuação nas instâncias de gestão do sistema. Esse arranjo evita que a manutenção dos serviços socioassistenciais dependa de um único ente federativo.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.4.2.11, subitem 4; Resolução CNAS nº 33/2012, Norma Operacional Básica do SUAS (NOB/SUAS 2012). Questão autoral Nortis.'
  ),
  (
    'diagnostico-agente-social-saude-mental',
    'Uma pessoa em sofrimento psíquico e com uso problemático de álcool procura atendimento socioassistencial. Qual conduta profissional é adequada nessa situação?',
    'O atendimento deve acolher sem estigmatizar, considerar estratégias de redução de danos e articular a rede de atenção psicossocial, respeitando direitos e singularidades em vez de condicionar o apoio a uma abordagem moralizante, padronizada ou de exclusão da rede de saúde.',
    'Edital SEDES-DF nº 1/2026, item 20.2.3.2.1, subitem 5; Lei Federal nº 10.216/2001; Ministério da Saúde, diretrizes da Rede de Atenção Psicossocial (RAPS). Questão autoral Nortis.'
  ),
  (
    'diagnostico-cuidador-social-saude-mental',
    'Uma pessoa acolhida apresenta sofrimento psíquico e uso prejudicial de álcool. Qual encaminhamento o cuidador social deve adotar?',
    'A atuação deve acolher sem estigma, respeitar direitos e autonomia, articular o cuidado com a Rede de Atenção Psicossocial e considerar estratégias de redução de danos quando aplicáveis. Isolamento, julgamento moral e exigência de abstinência como condição prévia de cuidado contrariam essa abordagem.',
    'Edital SEDES-DF nº 1/2026, item 20.2.3.2.2, subitem 6; Ministério da Saúde, diretrizes da Rede de Atenção Psicossocial (RAPS). Questão autoral Nortis.'
  )
)
update public.questions question
set statement = seed.statement,
    explanation = seed.explanation,
    source_reference = seed.source_reference,
    updated_at = now()
from question_update seed
where question.slug = seed.question_slug;

with option_update(question_slug, label, option_text) as (values
  ('diagnostico-ciencias-contabeis-liquidacao-despesa','A','Estágio da receita em que o valor já arrecadado é transferido à conta única do Tesouro.'),
  ('diagnostico-ciencias-contabeis-liquidacao-despesa','B','Empenho.'),
  ('diagnostico-ciencias-contabeis-liquidacao-despesa','C','Estágio em que se verifica o direito já adquirido pelo credor, após a entrega do objeto contratado.'),
  ('diagnostico-ciencias-contabeis-liquidacao-despesa','D','Ordem de pagamento emitida em favor do credor após a liquidação.'),
  ('diagnostico-servico-social-seguridade-social','A','Exclusivamente por contribuições descontadas da folha de pagamento dos trabalhadores, sem qualquer outra fonte de custeio prevista em lei.'),
  ('diagnostico-servico-social-seguridade-social','B','Somente por recursos do orçamento da União, sem participação orçamentária de Estados, do Distrito Federal e dos Municípios no financiamento.'),
  ('diagnostico-servico-social-seguridade-social','C','Exclusivamente por doações voluntárias e parcerias firmadas com organizações da sociedade civil, sem previsão de contribuições sociais.'),
  ('diagnostico-servico-social-seguridade-social','D','Por toda a sociedade, de forma direta e indireta, mediante recursos orçamentários dos entes federativos e contribuições sociais.'),
  ('pratica-tecnico-administrativo-publicidade-impessoal','A','Impessoalidade, porque toda concessão de benefício público deve ser comunicada de forma neutra à imprensa e à população em geral.'),
  ('pratica-tecnico-administrativo-publicidade-impessoal','B','Legalidade, porque o administrador só pode agir com base em autorização legal, ao contrário do particular.'),
  ('pratica-tecnico-administrativo-publicidade-impessoal','C','Eficiência, porque toda concessão informal de benefício produz resultado administrativo mais rápido ao cidadão interessado.'),
  ('pratica-tecnico-administrativo-publicidade-impessoal','D','Publicidade, porque o benefício concedido não foi divulgado previamente em canal oficial de comunicação do órgão.'),
  ('diagnostico-cuidador-social-populacao-rua','A','Acolhimento provisório e de curta permanência, com incentivo à autonomia e à saída da situação de rua.'),
  ('diagnostico-cuidador-social-populacao-rua','B','Acolhimento institucional de longa duração, equivalente aos serviços de alta complexidade permanentes.'),
  ('diagnostico-cuidador-social-populacao-rua','C','Atendimento exclusivamente diurno, sem possibilidade de pernoite em nenhuma hipótese.'),
  ('diagnostico-cuidador-social-populacao-rua','D','Substituição definitiva do Centro POP, dispensando a articulação com a abordagem social de rua.'),
  ('diagnostico-tecnico-administrativo-anulacao-revogacao','A','Poder hierárquico, pois decorre da relação de subordinação entre servidores do mesmo órgão.'),
  ('diagnostico-tecnico-administrativo-anulacao-revogacao','B','Poder disciplinar, pois toda sanção administrativa decorre necessariamente de vínculo funcional.'),
  ('diagnostico-tecnico-administrativo-anulacao-revogacao','C','Poder de polícia, por limitar direito e liberdade em razão do interesse público.'),
  ('diagnostico-tecnico-administrativo-anulacao-revogacao','D','Poder regulamentar, por se limitar à edição de normas complementares à lei.'),
  ('pratica-servico-social-ldo-prioridades','A','Concentração exclusiva do financiamento no ente municipal, sem qualquer repasse regular dos demais entes federativos.'),
  ('pratica-servico-social-ldo-prioridades','B','Dependência de doações privadas e parcerias eventuais para a manutenção regular dos serviços socioassistenciais do SUAS.'),
  ('pratica-servico-social-ldo-prioridades','C','Repasse condicionado a decisão discricionária anual de um único ente federativo, sem pactuação nas instâncias de gestão.'),
  ('pratica-servico-social-ldo-prioridades','D','Cofinanciamento tripartite entre União, Estados, Distrito Federal e Municípios, com repasses regulares e automáticos.'),
  ('diagnostico-agente-social-saude-mental','A','Adotar linguagem moralizante para estimular mudança imediata de comportamento.'),
  ('diagnostico-agente-social-saude-mental','B','Evitar a rede de saúde para manter o caso exclusivamente na assistência social.'),
  ('diagnostico-agente-social-saude-mental','C','Aplicar uma resposta padronizada, sem considerar sofrimento psíquico ou vulnerabilidade.'),
  ('diagnostico-agente-social-saude-mental','D','Acolher sem estigmatizar, considerar redução de danos e articular a rede de atenção psicossocial.'),
  ('diagnostico-cuidador-social-saude-mental','A','Usar julgamento moral para convencer a pessoa a interromper imediatamente o uso de álcool.'),
  ('diagnostico-cuidador-social-saude-mental','B','Isolar a pessoa da rede de saúde até que ela aceite abstinência total.'),
  ('diagnostico-cuidador-social-saude-mental','C','Acolher sem estigma, articular a RAPS e considerar estratégias de redução de danos.'),
  ('diagnostico-cuidador-social-saude-mental','D','Encerrar o acompanhamento socioassistencial porque saúde mental é responsabilidade exclusiva do setor de saúde.')
)
update public.question_options option
set option_text = seed.option_text
from option_update seed
join public.questions question
  on question.slug = seed.question_slug
where option.question_id = question.id
  and option.label = seed.label;

with solution_update(question_slug, correct_label) as (values
  ('diagnostico-ciencias-contabeis-liquidacao-despesa','B'),
  ('diagnostico-servico-social-seguridade-social','D'),
  ('pratica-tecnico-administrativo-publicidade-impessoal','B'),
  ('diagnostico-cuidador-social-populacao-rua','A'),
  ('diagnostico-tecnico-administrativo-anulacao-revogacao','C'),
  ('pratica-servico-social-ldo-prioridades','D'),
  ('diagnostico-agente-social-saude-mental','D'),
  ('diagnostico-cuidador-social-saude-mental','C')
)
update public.question_solutions solution
set correct_option_id = option.id
from solution_update seed
join public.questions question
  on question.slug = seed.question_slug
join public.question_options option
  on option.question_id = question.id
 and option.label = seed.correct_label
where solution.question_id = question.id;
