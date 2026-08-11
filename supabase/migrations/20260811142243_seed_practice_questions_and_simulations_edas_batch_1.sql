-- Amplia o Banco de Questões e os simulados para o primeiro lote EDAS,
-- reutilizando integralmente o motor e as regras de acesso existentes.
with practice_seed(
  specialty_slug, subject_slug, question_slug, statement,
  explanation, source_reference, sort_order
) as (values
  (
    'administracao-400',
    '1-teoria-geral-e-processos-administrativos',
    'pratica-administracao-analise-swot',
    'Ao preparar o planejamento estratégico, uma unidade identifica servidores experientes e, ao mesmo tempo, uma mudança legal externa que pode reduzir o prazo de atendimento. Como esses fatores devem ser classificados na análise SWOT?',
    'Na análise SWOT, capacidades e limitações sob controle da organização são fatores internos: servidores experientes representam uma força. Mudanças legais e outras condições do ambiente são fatores externos; quando podem prejudicar o objetivo, representam ameaça.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.1, subitem 1; Escola Nacional de Administração Pública, materiais institucionais sobre planejamento estratégico e análise SWOT. Questão autoral Nortis.',
    22010
  ),
  (
    'administracao-400',
    '2-organizacao-sistemas-metodos-os-m-e-qualidade',
    'pratica-administracao-redesenho-processo',
    'Um processo de concessão passa por duas conferências idênticas, feitas por setores diferentes, e acumula atrasos. Qual é o primeiro passo mais consistente para redesenhá-lo?',
    'O redesenho deve começar pelo mapeamento do fluxo atual, com entradas, atividades, responsáveis, decisões e saídas. Isso permite confirmar a duplicidade, localizar o gargalo e só então desenhar, implantar e monitorar o fluxo futuro.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.1, subitem 2; Ministério da Gestão e da Inovação em Serviços Públicos, Guia Prático de Gestão de Processos, 1ª edição, 2024. Questão autoral Nortis.',
    22020
  ),
  (
    'administracao-400',
    '3-gestao-de-projetos',
    'pratica-administracao-resposta-risco-projeto',
    'Durante o planejamento de um projeto, a equipe identifica risco de atraso na entrega de dados por um fornecedor. Qual ação representa tratamento adequado do risco?',
    'O risco deve ser registrado, analisado quanto à probabilidade e ao impacto, associado a um responsável e a uma resposta planejada. Ignorá-lo ou tratá-lo apenas depois que o atraso ocorrer converte uma incerteza administrável em problema sem preparação.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.1, subitem 3; Governo Digital, Metodologia de Gerenciamento de Projetos do SISP (MGP-SISP). Questão autoral Nortis.',
    22030
  ),
  (
    'administracao-400',
    '4-administracao-financeira-e-orcamentaria-afo',
    'pratica-administracao-arrecadacao-recolhimento',
    'Uma receita pública é recebida por agente arrecadador autorizado e, depois, o valor é transferido para a conta do Tesouro. Quais estágios são descritos, nessa ordem?',
    'O recebimento do valor pelo agente arrecadador corresponde à arrecadação. A transferência desses recursos à conta do Tesouro corresponde ao recolhimento, que observa o princípio da unidade de tesouraria.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.1, subitem 4; Lei Federal nº 4.320/1964, arts. 55 e 56; Manual de Contabilidade Aplicada ao Setor Público, 11ª edição, Parte I. Questão autoral Nortis.',
    22040
  ),
  (
    'administracao-400',
    '5-gestao-de-pessoas',
    'pratica-administracao-pdp-lacuna-competencia',
    'Um órgão pretende montar seu Plano de Desenvolvimento de Pessoas. Antes de escolher os cursos, o que deve orientar a decisão?',
    'O plano deve partir das competências necessárias ao trabalho, das lacunas identificadas e dos objetivos institucionais. Escolher ações apenas por preferência individual ou popularidade não assegura que o desenvolvimento responda às necessidades atuais e futuras do órgão.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.1, subitem 5; Decreto Federal nº 9.991/2019, art. 3º, §§ 1º e 2º. Questão autoral Nortis.',
    22050
  ),
  (
    'administracao-400',
    '6-etica-e-conduta-profissional',
    'pratica-administracao-etica-tratamento-impessoal',
    'Duas pessoas apresentam pedidos equivalentes ao mesmo setor. Uma delas é conhecida do servidor responsável. Qual conduta atende à ética pública?',
    'Os pedidos devem seguir os mesmos critérios, ordem e procedimentos aplicáveis, sem favorecimento decorrente de relação pessoal. A impessoalidade, a integridade e o compromisso com o interesse público afastam privilégios e preservam a confiança no serviço.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.1, subitem 6; Decreto Distrital nº 37.297/2016, Anexo II, princípios, deveres e vedações do Código de Ética. Questão autoral Nortis.',
    22060
  ),
  (
    'ciencias-contabeis-401',
    '1-contabilidade-geral-e-societaria',
    'pratica-ciencias-contabeis-compra-equipamento-caixa',
    'Uma entidade compra à vista um equipamento para uso nas operações. Desconsiderando tributos e outros efeitos, qual é o impacto imediato sobre o total do ativo?',
    'A operação troca um ativo por outro: o caixa diminui e o imobilizado aumenta pelo mesmo valor. Assim, o total do ativo não se altera no reconhecimento inicial, embora sua composição mude.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.2, subitem 1; Conselho Federal de Contabilidade, NBC TG Estrutura Conceitual e NBC TG 27 — Ativo Imobilizado. Questão autoral Nortis.',
    22110
  ),
  (
    'ciencias-contabeis-401',
    '2-administracao-financeira-e-analise-de-balancos',
    'pratica-ciencias-contabeis-ciclo-financeiro',
    'Mantidos os demais fatores, uma empresa passa a receber de clientes mais tarde, sem obter prazo adicional dos fornecedores. Qual efeito é esperado sobre sua necessidade de financiamento do capital de giro?',
    'O alongamento do prazo de recebimento aumenta o intervalo entre os desembolsos e as entradas de caixa. Sem compensação no prazo de fornecedores, cresce a necessidade de financiar o capital de giro durante esse ciclo.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.2, subitem 2; Banco Nacional de Desenvolvimento Econômico e Social, orientações institucionais sobre capital de giro e ciclo financeiro. Questão autoral Nortis.',
    22120
  ),
  (
    'ciencias-contabeis-401',
    '3-contabilidade-aplicada-ao-setor-publico-casp',
    'pratica-ciencias-contabeis-depreciacao-patrimonial',
    'Um equipamento de entidade pública perde potencial de serviços pelo uso ao longo do exercício. Como esse fato deve ser tratado na Contabilidade Aplicada ao Setor Público?',
    'A depreciação reconhece a alocação sistemática do valor depreciável durante a vida útil e produz efeito patrimonial, ainda que não corresponda a uma nova execução orçamentária no momento do registro. A contabilidade pública evidencia fatos orçamentários e patrimoniais.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.2, subitem 3; Secretaria do Tesouro Nacional, Manual de Contabilidade Aplicada ao Setor Público, 11ª edição, Parte II; Conselho Federal de Contabilidade, NBC TSP 07. Questão autoral Nortis.',
    22130
  ),
  (
    'ciencias-contabeis-401',
    '4-orcamento-publico-administracao-financeira-e-orcamentaria-afo',
    'pratica-ciencias-contabeis-credito-especial',
    'Durante o exercício surge despesa pública para a qual não existe dotação orçamentária específica. Qual espécie de crédito adicional é destinada a essa situação?',
    'Crédito especial é destinado a despesa para a qual não haja dotação orçamentária específica. O crédito suplementar reforça dotação existente, e o extraordinário atende despesas urgentes e imprevisíveis nas hipóteses legais.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.2, subitem 4; Lei Federal nº 4.320/1964, arts. 40 e 41. Questão autoral Nortis.',
    22140
  ),
  (
    'ciencias-contabeis-401',
    '5-auditoria-contabil-e-governamental',
    'pratica-ciencias-contabeis-evidencia-auditoria',
    'Ao detectar divergência relevante, a equipe de auditoria registra apenas a opinião do auditor, sem anexar documentos nem descrever os procedimentos realizados. Por que esse registro é insuficiente?',
    'As conclusões precisam estar sustentadas por evidência suficiente e apropriada e por documentação que permita compreender procedimentos, achados e fundamentos. A opinião isolada não permite revisão nem demonstra a base do resultado.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.2, subitem 5; Tribunal de Contas da União, Normas de Auditoria do TCU, itens 109 a 116. Questão autoral Nortis.',
    22150
  ),
  (
    'comunicacao-social-402',
    '1-fundamentos-e-teorias-da-comunicacao',
    'pratica-comunicacao-social-feedback',
    'Após divulgar uma orientação, um órgão recebe perguntas que revelam interpretação diferente da pretendida. No processo de comunicação, como o retorno do público pode ser utilizado?',
    'O retorno funciona como feedback: informa ao emissor como a mensagem foi recebida e permite ajustar linguagem, canal ou conteúdo. Ele não elimina automaticamente o ruído, mas ajuda a identificá-lo e a melhorar a comunicação.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.3, subitem 1; Portal eduCAPES, Comunicação em Foco: um Guia Instrucional, seção sobre fundamentos e teoria da comunicação. Questão autoral Nortis.',
    22210
  ),
  (
    'comunicacao-social-402',
    '2-comunicacao-organizacional-e-relacoes-publicas',
    'pratica-comunicacao-social-segmentacao-publicos',
    'Uma mudança de serviço afeta servidores, entidades parceiras e usuários de maneiras diferentes. Como o plano de comunicação deve tratar esses grupos?',
    'O planejamento deve mapear os públicos, compreender necessidades e impactos distintos e definir mensagens, canais e oportunidades de diálogo adequados a cada relação. Uma mensagem idêntica e sem segmentação pode deixar dúvidas relevantes sem resposta.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.3, subitem 2; Escola Nacional de Administração Pública, curso Comunicação Pública e Gestão de Relacionamento com Cidadão. Questão autoral Nortis.',
    22220
  ),
  (
    'comunicacao-social-402',
    '3-jornalismo-assessoria-de-imprensa-e-gestao-de-crise',
    'pratica-comunicacao-social-confirmacao-crise',
    'Durante uma crise, circula nas redes uma estimativa ainda não confirmada. Jornalistas pedem resposta imediata. Qual procedimento reduz o risco de ampliar a desinformação?',
    'A equipe deve verificar os fatos com as áreas responsáveis, coordenar uma mensagem objetiva, indicar o que já está confirmado e atualizar os canais oficiais quando houver nova informação. Rapidez não substitui verificação nem justifica divulgar estimativa como fato.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.3, subitem 3; Instituto de Pesquisa Econômica Aplicada, Manual de Gestão de Crises, 2025, seção 5.1. Questão autoral Nortis.',
    22230
  ),
  (
    'comunicacao-social-402',
    '4-comunicacao-digital-e-novas-tecnologias',
    'pratica-comunicacao-social-metrica-conversao',
    'Uma campanha orienta o cidadão a concluir um agendamento digital. Qual conjunto de métricas está mais ligado a esse objetivo?',
    'Alcance e interação ajudam a compreender a exposição da mensagem, mas o objetivo exige acompanhar também cliques, início do fluxo, agendamentos concluídos e pontos de abandono. As métricas devem ser escolhidas em função da meta da campanha.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.3, subitem 4; Governo Federal, Manual de Orientação para Atuação em Mídias Sociais, seção Monitoramento e Métricas. Questão autoral Nortis.',
    22240
  ),
  (
    'comunicacao-social-402',
    '5-etica-profissional',
    'pratica-comunicacao-social-protecao-dados',
    'Para ilustrar uma campanha pública, a equipe considera publicar o relato de um usuário com nome e dados pessoais desnecessários à finalidade. Qual conduta é mais adequada?',
    'A comunicação deve usar apenas os dados necessários à finalidade legítima, avaliar base legal e transparência e, quando possível, anonimizar o caso. A exposição desnecessária de dados pessoais contraria os princípios de finalidade, adequação e necessidade.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.3, subitem 5; Lei Federal nº 13.709/2018, art. 6º, incisos I, II e III. Questão autoral Nortis.',
    22250
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
  ('pratica-administracao-analise-swot','A','A experiência é oportunidade e a mudança legal é fraqueza.',10),
  ('pratica-administracao-analise-swot','B','A experiência é força e a mudança legal potencialmente desfavorável é ameaça.',20),
  ('pratica-administracao-analise-swot','C','Os dois fatores são forças porque podem ser administrados pela equipe.',30),
  ('pratica-administracao-analise-swot','D','Os dois fatores são ameaças porque exigem resposta gerencial.',40),
  ('pratica-administracao-redesenho-processo','A','Eliminar imediatamente uma das conferências sem registrar como o processo funciona.',10),
  ('pratica-administracao-redesenho-processo','B','Trocar os responsáveis antes de identificar entradas, decisões e causas do atraso.',20),
  ('pratica-administracao-redesenho-processo','C','Mapear e analisar o fluxo atual antes de desenhar, implantar e monitorar a melhoria.',30),
  ('pratica-administracao-redesenho-processo','D','Redesenhar apenas o organograma, sem examinar as atividades executadas.',40),
  ('pratica-administracao-resposta-risco-projeto','A','Registrar e analisar o risco, definir resposta, responsável e forma de acompanhamento.',10),
  ('pratica-administracao-resposta-risco-projeto','B','Excluir o risco do plano para evitar que a incerteza afete os indicadores.',20),
  ('pratica-administracao-resposta-risco-projeto','C','Esperar o atraso acontecer para então identificar quem deveria ter agido.',30),
  ('pratica-administracao-resposta-risco-projeto','D','Encerrar o projeto, pois toda incerteza impede seu gerenciamento.',40),
  ('pratica-administracao-arrecadacao-recolhimento','A','Previsão e lançamento.',10),
  ('pratica-administracao-arrecadacao-recolhimento','B','Lançamento e arrecadação.',20),
  ('pratica-administracao-arrecadacao-recolhimento','C','Arrecadação e recolhimento.',30),
  ('pratica-administracao-arrecadacao-recolhimento','D','Recolhimento e previsão.',40),
  ('pratica-administracao-pdp-lacuna-competencia','A','A popularidade dos cursos disponíveis no mercado.',10),
  ('pratica-administracao-pdp-lacuna-competencia','B','As competências necessárias, as lacunas identificadas e os objetivos institucionais.',20),
  ('pratica-administracao-pdp-lacuna-competencia','C','Somente as preferências individuais dos servidores.',30),
  ('pratica-administracao-pdp-lacuna-competencia','D','A repetição automática do catálogo usado no exercício anterior.',40),
  ('pratica-administracao-etica-tratamento-impessoal','A','Priorizar o conhecido, desde que o pedido dele também seja válido.',10),
  ('pratica-administracao-etica-tratamento-impessoal','B','Pedir que outro servidor priorize o conhecido para evitar participação direta.',20),
  ('pratica-administracao-etica-tratamento-impessoal','C','Aplicar os mesmos critérios e procedimentos aos dois pedidos, sem favorecimento.',30),
  ('pratica-administracao-etica-tratamento-impessoal','D','Adiar os dois pedidos para que a relação pessoal não seja percebida.',40),
  ('pratica-ciencias-contabeis-compra-equipamento-caixa','A','O total do ativo aumenta, porque apenas o equipamento deve ser registrado.',10),
  ('pratica-ciencias-contabeis-compra-equipamento-caixa','B','O total do ativo diminui, porque todo pagamento à vista é uma despesa.',20),
  ('pratica-ciencias-contabeis-compra-equipamento-caixa','C','O total do ativo permanece igual: diminui caixa e aumenta imobilizado no mesmo valor.',30),
  ('pratica-ciencias-contabeis-compra-equipamento-caixa','D','O total do ativo e o passivo aumentam pelo valor integral da compra.',40),
  ('pratica-ciencias-contabeis-ciclo-financeiro','A','A necessidade tende a aumentar, pois o caixa demora mais a retornar.',10),
  ('pratica-ciencias-contabeis-ciclo-financeiro','B','A necessidade tende a diminuir, pois receber mais tarde reduz contas a receber.',20),
  ('pratica-ciencias-contabeis-ciclo-financeiro','C','A necessidade desaparece, porque o prazo de fornecedores não mudou.',30),
  ('pratica-ciencias-contabeis-ciclo-financeiro','D','Não há qualquer relação entre prazo de recebimento e capital de giro.',40),
  ('pratica-ciencias-contabeis-depreciacao-patrimonial','A','Não registrar, porque todo fato contábil público depende de nova despesa orçamentária.',10),
  ('pratica-ciencias-contabeis-depreciacao-patrimonial','B','Reconhecer a depreciação como fato patrimonial, conforme vida útil e valor depreciável.',20),
  ('pratica-ciencias-contabeis-depreciacao-patrimonial','C','Reconhecer nova aquisição do equipamento a cada encerramento de exercício.',30),
  ('pratica-ciencias-contabeis-depreciacao-patrimonial','D','Registrar somente quando o bem for alienado, sem acompanhar a perda de potencial.',40),
  ('pratica-ciencias-contabeis-credito-especial','A','Crédito suplementar.',10),
  ('pratica-ciencias-contabeis-credito-especial','B','Crédito especial.',20),
  ('pratica-ciencias-contabeis-credito-especial','C','Crédito extraordinário em qualquer circunstância.',30),
  ('pratica-ciencias-contabeis-credito-especial','D','Restos a pagar.',40),
  ('pratica-ciencias-contabeis-evidencia-auditoria','A','Porque a conclusão exige documentação e evidência suficiente e apropriada que permitam revisão.',10),
  ('pratica-ciencias-contabeis-evidencia-auditoria','B','Porque toda divergência deve ser descartada quando não existe confissão do auditado.',20),
  ('pratica-ciencias-contabeis-evidencia-auditoria','C','Porque somente o relatório final pode conter qualquer informação sobre o trabalho.',30),
  ('pratica-ciencias-contabeis-evidencia-auditoria','D','Porque opiniões de auditor nunca podem integrar um trabalho de auditoria.',40),
  ('pratica-comunicacao-social-feedback','A','Como ruído, pois toda resposta do público prejudica a mensagem original.',10),
  ('pratica-comunicacao-social-feedback','B','Como feedback para avaliar a recepção e ajustar a comunicação.',20),
  ('pratica-comunicacao-social-feedback','C','Como canal, pois o retorno substitui o meio usado na divulgação.',30),
  ('pratica-comunicacao-social-feedback','D','Como fonte, pois o público passa a ser o único emissor possível.',40),
  ('pratica-comunicacao-social-segmentacao-publicos','A','Enviar a mesma mensagem, pelo mesmo canal, sem considerar impactos distintos.',10),
  ('pratica-comunicacao-social-segmentacao-publicos','B','Comunicar somente aos usuários externos, pois servidores não são público organizacional.',20),
  ('pratica-comunicacao-social-segmentacao-publicos','C','Mapear os públicos e adequar mensagens, canais e diálogo às necessidades de cada grupo.',30),
  ('pratica-comunicacao-social-segmentacao-publicos','D','Escolher primeiro os canais mais populares e depois definir os objetivos.',40),
  ('pratica-comunicacao-social-confirmacao-crise','A','Publicar imediatamente a estimativa como fato, sem consultar as áreas responsáveis.',10),
  ('pratica-comunicacao-social-confirmacao-crise','B','Verificar os fatos, coordenar a resposta e distinguir informação confirmada de atualização pendente.',20),
  ('pratica-comunicacao-social-confirmacao-crise','C','Permitir que cada unidade divulgue uma versão própria para acelerar o atendimento.',30),
  ('pratica-comunicacao-social-confirmacao-crise','D','Apagar todos os canais oficiais até o encerramento da crise.',40),
  ('pratica-comunicacao-social-metrica-conversao','A','Somente a quantidade de publicações feitas pela equipe.',10),
  ('pratica-comunicacao-social-metrica-conversao','B','Somente curtidas e número total de seguidores.',20),
  ('pratica-comunicacao-social-metrica-conversao','C','Alcance, cliques, início do fluxo, agendamentos concluídos e abandono.',30),
  ('pratica-comunicacao-social-metrica-conversao','D','Somente a percepção informal dos responsáveis pela campanha.',40),
  ('pratica-comunicacao-social-protecao-dados','A','Publicar todos os dados para tornar o relato mais convincente.',10),
  ('pratica-comunicacao-social-protecao-dados','B','Usar apenas dados necessários, avaliar a base legal e anonimizar quando possível.',20),
  ('pratica-comunicacao-social-protecao-dados','C','Publicar os dados e removê-los apenas se o usuário reclamar.',30),
  ('pratica-comunicacao-social-protecao-dados','D','Substituir o nome por iniciais, mantendo todos os demais identificadores desnecessários.',40)
)
insert into public.question_options(question_id, label, option_text, sort_order)
select question.id, seed.label, seed.option_text, seed.sort_order
from option_seed seed
join public.questions question on question.slug = seed.question_slug
on conflict (question_id, label) do update set
  option_text = excluded.option_text,
  sort_order = excluded.sort_order;

with solution_seed(question_slug, correct_label) as (values
  ('pratica-administracao-analise-swot','B'),
  ('pratica-administracao-redesenho-processo','C'),
  ('pratica-administracao-resposta-risco-projeto','A'),
  ('pratica-administracao-arrecadacao-recolhimento','C'),
  ('pratica-administracao-pdp-lacuna-competencia','B'),
  ('pratica-administracao-etica-tratamento-impessoal','C'),
  ('pratica-ciencias-contabeis-compra-equipamento-caixa','C'),
  ('pratica-ciencias-contabeis-ciclo-financeiro','A'),
  ('pratica-ciencias-contabeis-depreciacao-patrimonial','B'),
  ('pratica-ciencias-contabeis-credito-especial','B'),
  ('pratica-ciencias-contabeis-evidencia-auditoria','A'),
  ('pratica-comunicacao-social-feedback','B'),
  ('pratica-comunicacao-social-segmentacao-publicos','C'),
  ('pratica-comunicacao-social-confirmacao-crise','B'),
  ('pratica-comunicacao-social-metrica-conversao','C'),
  ('pratica-comunicacao-social-protecao-dados','B')
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
    'administracao-400',
    'simulado-piloto-administracao',
    'Simulado piloto — Administração',
    'Seis questões autorais da Nortis, uma por bloco específico do edital. Resultado pedagógico, sem equivalência com nota oficial.',
    10,
    40010
  ),
  (
    'ciencias-contabeis-401',
    'simulado-piloto-ciencias-contabeis',
    'Simulado piloto — Ciências Contábeis',
    'Cinco questões autorais da Nortis, uma por bloco específico do edital. Resultado pedagógico, sem equivalência com nota oficial.',
    10,
    40110
  ),
  (
    'comunicacao-social-402',
    'simulado-piloto-comunicacao-social',
    'Simulado piloto — Comunicação Social',
    'Cinco questões autorais da Nortis, uma por bloco específico do edital. Resultado pedagógico, sem equivalência com nota oficial.',
    10,
    40210
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
  ('simulado-piloto-administracao','pratica-administracao-analise-swot',10),
  ('simulado-piloto-administracao','pratica-administracao-redesenho-processo',20),
  ('simulado-piloto-administracao','pratica-administracao-resposta-risco-projeto',30),
  ('simulado-piloto-administracao','pratica-administracao-arrecadacao-recolhimento',40),
  ('simulado-piloto-administracao','pratica-administracao-pdp-lacuna-competencia',50),
  ('simulado-piloto-administracao','pratica-administracao-etica-tratamento-impessoal',60),
  ('simulado-piloto-ciencias-contabeis','pratica-ciencias-contabeis-compra-equipamento-caixa',10),
  ('simulado-piloto-ciencias-contabeis','pratica-ciencias-contabeis-ciclo-financeiro',20),
  ('simulado-piloto-ciencias-contabeis','pratica-ciencias-contabeis-depreciacao-patrimonial',30),
  ('simulado-piloto-ciencias-contabeis','pratica-ciencias-contabeis-credito-especial',40),
  ('simulado-piloto-ciencias-contabeis','pratica-ciencias-contabeis-evidencia-auditoria',50),
  ('simulado-piloto-comunicacao-social','pratica-comunicacao-social-feedback',10),
  ('simulado-piloto-comunicacao-social','pratica-comunicacao-social-segmentacao-publicos',20),
  ('simulado-piloto-comunicacao-social','pratica-comunicacao-social-confirmacao-crise',30),
  ('simulado-piloto-comunicacao-social','pratica-comunicacao-social-metrica-conversao',40),
  ('simulado-piloto-comunicacao-social','pratica-comunicacao-social-protecao-dados',50)
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
