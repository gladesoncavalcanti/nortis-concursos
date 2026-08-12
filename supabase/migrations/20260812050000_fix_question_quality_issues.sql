-- Lote 3 da correcao editorial: remove uma duplicacao semantica cross-
-- especialidade residual, corrige um vazamento mutuo de explicacao entre
-- especialidades e reduz o viés de comprimento e o fraseado absolutista em
-- distratores de 17 questoes de alta confianca (nao altera nenhum gabarito).
-- Aditiva: apenas UPDATE por slug, restrito ao banco de questoes. Nao
-- altera estrutura, RLS, policies, vinculos com simulados/gabaritos
-- existentes nem qualquer outra area do produto fora deste conteudo.

-- 1) Duplicacao semantica cross-especialidade residual (VERMELHO):
-- pratica-cuidador-social-recusa-acolhimento reutilizava o mesmo cenario e a
-- mesma resposta de pratica-agente-social-vinculo-autonomia. Reescrita para
-- medir a diretriz de nao discriminacao do Decreto 7.053/2009, distinta da
-- ja coberta em diagnostico-cuidador-social-populacao-rua (casas de
-- passagem) e em pratica-agente-social-vinculo-autonomia (recusa e vinculo).
with question_update(
  question_slug, statement, explanation, source_reference
) as (values
  (
    'pratica-cuidador-social-recusa-acolhimento',
    'Em um abrigo que atende pessoas em situação de rua de diferentes origens, idades e orientações sexuais, qual diretriz da Política Nacional para a População em Situação de Rua deve orientar o atendimento?',
    'O Decreto nº 7.053/2009 estabelece, entre as diretrizes da Política Nacional para a População em Situação de Rua, o respeito às diferenças de origem, raça, idade, gênero e orientação sexual, com atendimento humanizado e não discriminatório. Padronizar o atendimento pelo perfil predominante, segregar espaços por grupo ou priorizar semelhança social contraria essa diretriz.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.3.2.2, subitem 5; Decreto Federal nº 7.053/2009, arts. 5º e 6º. Questão autoral Nortis.'
  ),
  -- Vazamento mútuo entre especialidades (AMARELO): a explicação de cada
  -- questão restituía a definição completa da outra, entre Ciências
  -- Contábeis e Direito e Legislação. Mantido o gabarito e a distinção
  -- didática entre os créditos adicionais, sem repetir a definição alheia.
  (
    'pratica-ciencias-contabeis-credito-especial',
    'Durante o exercício surge despesa pública para a qual não existe dotação orçamentária específica. Qual espécie de crédito adicional é destinada a essa situação?',
    'Crédito especial é destinado a despesa para a qual não haja dotação orçamentária específica. Ele se distingue dos demais créditos adicionais previstos na Lei Federal nº 4.320/1964, cada um aplicável a uma situação orçamentária distinta.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.2, subitem 4; Lei Federal nº 4.320/1964, art. 41, inciso II. Questão autoral Nortis.'
  ),
  (
    'pratica-direito-legislacao-credito-suplementar',
    'Durante a execução do orçamento, uma dotação existente torna-se insuficiente para concluir uma atividade já prevista. Qual crédito adicional é destinado a reforçar essa dotação?',
    'O crédito suplementar reforça dotação orçamentária existente que se revela insuficiente. Ele se distingue dos demais créditos adicionais previstos na Lei Federal nº 4.320/1964, cada um aplicável a uma situação orçamentária distinta.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.4, subitem 5; Lei Federal nº 4.320/1964, art. 41, inciso I. Questão autoral Nortis.'
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
  -- alternativas da questão reescrita (item 1)
  ('pratica-cuidador-social-recusa-acolhimento','A','Padronizar o atendimento com base no perfil predominante do grupo, tratando as exceções conforme a disponibilidade da equipe.'),
  ('pratica-cuidador-social-recusa-acolhimento','B','Respeitar as diferenças de raça, idade, gênero e orientação sexual, sem tratamento discriminatório entre as pessoas acolhidas.'),
  ('pratica-cuidador-social-recusa-acolhimento','C','Reservar horários e espaços separados para grupos com perfis distintos, evitando a convivência entre eles na unidade.'),
  ('pratica-cuidador-social-recusa-acolhimento','D','Priorizar o atendimento das pessoas com perfil social e cultural semelhante ao da maioria dos acolhidos na unidade.'),

  -- viés de comprimento (alternativa correta destacando-se sistematicamente): gabarito inalterado
  ('diagnostico-economia-federalismo-fiscal-icms','A','Imposto sobre a importação de produtos estrangeiros, de competência exclusiva da União.'),
  ('diagnostico-economia-federalismo-fiscal-icms','B','Imposto sobre serviços de qualquer natureza, o ISS, tributo de competência municipal e também do Distrito Federal.'),
  ('diagnostico-economia-federalismo-fiscal-icms','D','Imposto sobre produtos industrializados, o IPI, também de competência exclusiva da União.'),

  ('diagnostico-ciencias-contabeis-dvp-resultado-patrimonial','A','Balanço Orçamentário, que confronta a receita prevista com a realizada e a despesa fixada com a executada.'),
  ('diagnostico-ciencias-contabeis-dvp-resultado-patrimonial','B','Balanço Financeiro, que evidencia os ingressos e dispêndios financeiros do exercício.'),
  ('diagnostico-ciencias-contabeis-dvp-resultado-patrimonial','C','Balanço Patrimonial, que evidencia a posição patrimonial e financeira em determinada data.'),

  ('diagnostico-nutricao-sisan-dhaa','A','Substituir integralmente o Sistema Único de Saúde na organização da atenção nutricional individual e coletiva em todo o território nacional.'),
  ('diagnostico-nutricao-sisan-dhaa','C','Executar exclusivamente a distribuição emergencial de alimentos em situações de calamidade pública.'),
  ('diagnostico-nutricao-sisan-dhaa','D','Fiscalizar sozinho todos os estabelecimentos produtores e comercializadores de alimentos do país.'),

  ('diagnostico-nutricao-aleitamento-complementar','A','Oferecer água, chás e outros líquidos já nos primeiros dias de vida, iniciando outros alimentos complementares desde os três meses de idade da criança.'),
  ('diagnostico-nutricao-aleitamento-complementar','B','Manter exclusivamente leite materno até completar um ano de vida, sem qualquer introdução de alimentação complementar.'),
  ('diagnostico-nutricao-aleitamento-complementar','D','Interromper obrigatoriamente a amamentação no momento em que a alimentação complementar for iniciada pela família.'),

  ('diagnostico-ciencias-contabeis-liquidez-corrente','A','0,67; nesse cenário hipotético, a entidade possui R$ 0,67 em ativos de curto prazo para cada R$ 1,00 em obrigações de curto prazo assumidas.'),
  ('diagnostico-ciencias-contabeis-liquidez-corrente','C','R$ 120.000; esse valor representa a diferença entre ativo e passivo circulantes e comprova, isoladamente, a rentabilidade operacional da entidade naquele exercício.'),
  ('diagnostico-ciencias-contabeis-liquidez-corrente','D','1,50; qualquer índice de liquidez corrente superior a 1 comprova, por si só e sem outras informações, a ausência de riscos financeiros relevantes.'),

  ('diagnostico-administracao-projeto-operacao','A','Processamento mensal e permanente da folha de pagamento dos servidores ativos e inativos do órgão.'),
  ('diagnostico-administracao-projeto-operacao','B','Atendimento diário e contínuo de solicitações registradas no setor de protocolo da unidade administrativa.'),
  ('diagnostico-administracao-projeto-operacao','D','Manutenção rotineira e recorrente dos equipamentos e instalações físicas do órgão público.'),

  ('diagnostico-estatistica-regressao-inclinacao','A','Quando x aumenta uma unidade, a resposta observada aumenta obrigatoriamente exatos 12 pontos, sem qualquer variação residual.'),
  ('diagnostico-estatistica-regressao-inclinacao','B','O valor 3 é o intercepto do modelo e representa a resposta estimada quando a variável x assume valor igual a zero.'),
  ('diagnostico-estatistica-regressao-inclinacao','D','A inclinação de 3 demonstra, por si só, que o modelo não possui erro nem variabilidade residual em nenhuma observação.'),

  ('diagnostico-pedagogia-planejamento-participativo-paif','A','Repetir uma atividade padronizada em todos os grupos, sem considerar as características específicas das famílias ou as particularidades do território atendido.'),
  ('diagnostico-pedagogia-planejamento-participativo-paif','B','Executar encontros improvisados e dispensar qualquer registro sistemático, para preservar a espontaneidade e a autonomia da equipe técnica responsável.'),
  ('diagnostico-pedagogia-planejamento-participativo-paif','C','Definir todas as decisões apenas entre os profissionais da equipe técnica, avaliando o resultado do projeto somente ao seu término.'),

  ('diagnostico-agente-social-paif','A','Acolhimento institucional permanente de famílias inteiras, sem qualquer avaliação prévia da situação territorial ou social.'),
  ('diagnostico-agente-social-paif','C','Investigação judicial de violações de direitos, atribuída ao CREAS e ao sistema de justiça, sem participação do CRAS.'),
  ('diagnostico-agente-social-paif','D','Concessão automática de benefício financeiro às famílias, sem qualquer acompanhamento social ou familiar continuado.'),

  -- viés de comprimento + pistas de absolutismo, corrigidos juntos (mesma questão)
  ('pratica-economia-pobreza-multidimensional','A','O valor nominal da renda mensal informado no cadastro socioeconômico oficial, sem considerar outras dimensões de vida da família.'),
  ('pratica-economia-pobreza-multidimensional','B','A média de renda per capita calculada para o conjunto dos domicílios do município de residência.'),
  ('pratica-economia-pobreza-multidimensional','C','O preço de um único bem de consumo básico presente na cesta de referência utilizada no cálculo.'),
  ('pratica-economia-pobreza-multidimensional','D','Pobreza multidimensional, que considera restrições monetárias e não monetárias, como saneamento, educação e moradia.'),

  -- pistas de absolutismo (sempre/nunca/somente/apenas/exclusivamente/automaticamente): gabarito inalterado
  ('diagnostico-cuidador-social-acolhimento-provisorio','A','Prolongar o acolhimento enquanto houver vaga disponível na unidade, sem nova avaliação da situação familiar.'),
  ('diagnostico-cuidador-social-acolhimento-provisorio','B','Reduzir o contato familiar durante o período inicial de adaptação à rotina da unidade.'),
  ('diagnostico-cuidador-social-acolhimento-provisorio','C','Considerar o acolhimento uma solução de médio prazo, com nova avaliação apenas ao final de um ano.'),

  ('diagnostico-comunicacao-social-metrica-objetivo','A','Priorizar o volume de curtidas como indicador central, presumindo que qualquer interação já representa a conclusão do serviço.'),
  ('diagnostico-comunicacao-social-metrica-objetivo','B','Comparar o crescimento do número de seguidores da página oficial durante o período da campanha.'),
  ('diagnostico-comunicacao-social-metrica-objetivo','D','Avaliar a campanha principalmente pela percepção informal da equipe responsável pela comunicação.'),

  ('diagnostico-educador-social-scfv','A','Benefício financeiro individual, vinculado ao cadastro da família no órgão gestor da assistência social.'),
  ('diagnostico-educador-social-scfv','B','Serviço da Proteção Social Especial voltado ao acompanhamento de famílias com vínculos familiares fragilizados.'),
  ('diagnostico-educador-social-scfv','D','Atendimento clínico individual, realizado por profissional de saúde mental fora da rede socioassistencial.'),

  ('diagnostico-pedagogia-gestao-democratica','A','Por regulamento federal único, com participação apenas consultiva dos sistemas estaduais, municipais e distrital.'),
  ('diagnostico-pedagogia-gestao-democratica','C','Por decisão da direção de cada escola pública, com base em regimento interno próprio e sem relação direta com a legislação do sistema de ensino.'),
  ('diagnostico-pedagogia-gestao-democratica','D','Nas instituições federais de ensino, como princípio de aplicação restrita a esse âmbito específico.'),

  ('diagnostico-sociologia-indicadores-e-metodos','A','Coletar relatos individuais de forma assistemática e generalizá-los numericamente para os territórios comparados.'),
  ('diagnostico-sociologia-indicadores-e-metodos','B','Utilizar o total bruto de atendimentos registrados, sem relacioná-lo à população de referência de cada território.'),
  ('diagnostico-sociologia-indicadores-e-metodos','C','Aplicar um único indicador agregado ao conjunto do território, assumindo que ele revela, sozinho, os processos e os sentidos atribuídos pelos moradores.'),

  ('pratica-ciencias-contabeis-evidencia-auditoria','B','Porque a divergência deve ser descartada quando o auditado nega verbalmente a ocorrência do fato apontado.'),
  ('pratica-ciencias-contabeis-evidencia-auditoria','C','Porque o relatório final entregue ao contratante já reúne, por si, todas as informações necessárias sobre o trabalho realizado.'),
  ('pratica-ciencias-contabeis-evidencia-auditoria','D','Porque a opinião do auditor deve ser registrada separadamente, fora dos papéis de trabalho da auditoria.'),

  ('pratica-psicologia-envelhecimento-contextual','A','Presumir dependência a partir de uma idade cronológica de referência, sem avaliação individual complementar.'),
  ('pratica-psicologia-envelhecimento-contextual','C','Basear a decisão sobre autonomia principalmente na idade cronológica registrada em documentos.'),
  ('pratica-psicologia-envelhecimento-contextual','D','Transferir as decisões para familiares assim que a pessoa completa determinada idade, sem consulta prévia.')
)
update public.question_options option
set option_text = seed.option_text
from option_update seed
join public.questions question
  on question.slug = seed.question_slug
where option.question_id = question.id
  and option.label = seed.label;

-- Gabarito da questão totalmente reescrita (item 1). As demais 19 questões
-- deste lote preservam o gabarito já existente e não precisam desta etapa.
with solution_update(question_slug, correct_label) as (values
  ('pratica-cuidador-social-recusa-acolhimento','B')
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
