-- Corrige duplicacoes editoriais entre diagnostico, pratica e simulados sem
-- alterar o motor, os vinculos existentes ou as regras de acesso.
with question_update(
  question_slug, statement, explanation, source_reference
) as (values
  (
    'pratica-tecnico-administrativo-protocolo-rastreavel',
    'Uma unidade consulta frequentemente contratos em execução. Depois de encerrados, eles deixam de ser usados no dia a dia, mas aguardam destinação. Em quais fases arquivísticas ficam, respectivamente?',
    'Enquanto são usados com frequência, os documentos permanecem na fase corrente. Quando deixam o uso cotidiano, mas ainda aguardam eliminação ou recolhimento para guarda permanente, passam à fase intermediária.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.3.2.3, subitem 3; Lei Federal nº 8.159/1991, art. 8º. Questão autoral Nortis.'
  ),
  (
    'pratica-tecnico-administrativo-planejamento-contratacao',
    'Na conferência anual, uma comissão compara os bens encontrados nas unidades com os registros patrimoniais e verifica o estado de conservação de cada item. Qual instrumento de controle está sendo realizado?',
    'O inventário físico permite conferir a existência, a localização, o registro e o estado dos bens. Ele subsidia a conciliação dos controles patrimoniais e a apuração de eventuais diferenças.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.3.2.3, subitem 4; Instrução Normativa SEDAP nº 205/1988, itens 8.1 e 8.2. Questão autoral Nortis.'
  ),
  (
    'pratica-tecnico-administrativo-autotutela',
    'Um servidor distrital recebe ordem manifestamente ilegal de sua chefia. Segundo a Lei Complementar Distrital nº 840/2011, qual conduta está de acordo com seus deveres funcionais?',
    'O dever de cumprir ordens superiores não alcança as que sejam manifestamente ilegais. A mesma lei determina que o servidor represente contra ilegalidade, omissão ou abuso de poder.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.3.2.3, subitem 2; Lei Complementar Distrital nº 840/2011, art. 180, incisos VI e VIII. Questão autoral Nortis.'
  ),
  (
    'pratica-administracao-pdp-lacuna-competencia',
    'Ao iniciar um ciclo de avaliação de desempenho, qual prática favorece o alinhamento entre a contribuição do servidor e os resultados da organização pública?',
    'A gestão do desempenho começa com compromissos conhecidos e coerentes entre si. Metas individuais alinhadas às institucionais, acompanhadas durante o ciclo, permitem orientar o trabalho e avaliar a contribuição para os resultados organizacionais.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.1, subitem 5; Decreto Federal nº 7.133/2010, arts. 2º e 5º; Ministério do Planejamento, Manual de Orientação para a Gestão do Desempenho. Questão autoral Nortis.'
  ),
  (
    'pratica-comunicacao-social-metrica-conversao',
    'Um órgão publicará um infográfico essencial em seu portal. Segundo o Modelo de Acessibilidade em Governo Eletrônico, qual medida amplia o acesso ao conteúdo?',
    'Imagens que transmitem informação precisam de alternativa textual equivalente. Em conteúdo complexo, a descrição deve comunicar os dados relevantes para que usuários de tecnologias assistivas tenham acesso à mesma informação.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.3, subitem 4; Governo Federal, Modelo de Acessibilidade em Governo Eletrônico eMAG 3.1, recomendação 3.6. Questão autoral Nortis.'
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
  ('pratica-tecnico-administrativo-protocolo-rastreavel','A','Corrente e intermediária.'),
  ('pratica-tecnico-administrativo-protocolo-rastreavel','B','Intermediária e permanente, pois todo contrato encerrado deve ter guarda definitiva.'),
  ('pratica-tecnico-administrativo-protocolo-rastreavel','C','Permanente e corrente, conforme a ordem de entrada no arquivo.'),
  ('pratica-tecnico-administrativo-protocolo-rastreavel','D','Corrente e permanente, sem necessidade de avaliação documental.'),
  ('pratica-tecnico-administrativo-planejamento-contratacao','A','Tombamento individual, destinado apenas a criar o número de registro de um bem novo.'),
  ('pratica-tecnico-administrativo-planejamento-contratacao','B','Baixa patrimonial, usada para retirar do acervo todos os bens que mudaram de unidade.'),
  ('pratica-tecnico-administrativo-planejamento-contratacao','C','Movimentação de carga, limitada a transferir a responsabilidade entre dois servidores.'),
  ('pratica-tecnico-administrativo-planejamento-contratacao','D','Inventário físico.'),
  ('pratica-tecnico-administrativo-autotutela','A','Recusar a ordem e representar contra a ilegalidade.'),
  ('pratica-tecnico-administrativo-autotutela','B','Cumprir a ordem e comunicar o fato apenas depois de concluída a providência ilegal.'),
  ('pratica-tecnico-administrativo-autotutela','C','Executar parcialmente a ordem, porque a subordinação afasta a responsabilidade funcional.'),
  ('pratica-tecnico-administrativo-autotutela','D','Transferir a execução a outro servidor e deixar de informar a autoridade competente.'),
  ('pratica-administracao-pdp-lacuna-competencia','A','Adiar a definição dos critérios até o encerramento, quando os resultados já forem conhecidos.'),
  ('pratica-administracao-pdp-lacuna-competencia','B','Avaliar somente a presença diária, sem relacioná-la às entregas da unidade.'),
  ('pratica-administracao-pdp-lacuna-competencia','C','Usar exclusivamente a opinião da chefia, sem compromissos previamente informados.'),
  ('pratica-administracao-pdp-lacuna-competencia','D','Pactuar metas individuais alinhadas às institucionais e acompanhar o ciclo.'),
  ('pratica-comunicacao-social-metrica-conversao','A','Publicar apenas a imagem em alta resolução e retirar o texto adjacente.'),
  ('pratica-comunicacao-social-metrica-conversao','B','Usar a cor como único recurso para diferenciar as categorias do gráfico.'),
  ('pratica-comunicacao-social-metrica-conversao','C','Inserir uma legenda genérica, como imagem, sem transmitir os dados relevantes.'),
  ('pratica-comunicacao-social-metrica-conversao','D','Fornecer alternativa textual equivalente ao conteúdo do infográfico.')
)
update public.question_options option
set option_text = seed.option_text
from option_update seed
join public.questions question
  on question.slug = seed.question_slug
where option.question_id = question.id
  and option.label = seed.label;

with solution_update(question_slug, correct_label) as (values
  ('pratica-tecnico-administrativo-protocolo-rastreavel','A'),
  ('pratica-tecnico-administrativo-planejamento-contratacao','D'),
  ('pratica-tecnico-administrativo-autotutela','A'),
  ('pratica-administracao-pdp-lacuna-competencia','D'),
  ('pratica-comunicacao-social-metrica-conversao','D')
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

with explanation_update(question_slug, explanation) as (values
  (
    'diagnostico-nutricao-sisan-dhaa',
    'A estrutura instituída pela LOSAN reúne instâncias públicas e participação social para planejar, executar e acompanhar ações intersetoriais de segurança alimentar e nutricional. Seu alcance é sistêmico: não corresponde à substituição do SUS, à entrega emergencial exclusiva nem à fiscalização sanitária isolada.'
  ),
  (
    'pratica-agente-social-reducao-danos-rede',
    'A resposta deve preservar o acesso a direitos, evitar exigências coercitivas e conectar, conforme a necessidade, proteção socioassistencial e cuidado em saúde. A estratégia considera o contexto e os riscos de cada pessoa, sem impor uma única condição prévia para oferecer suporte.'
  )
)
update public.questions question
set explanation = seed.explanation,
    updated_at = now()
from explanation_update seed
where question.slug = seed.question_slug;

with source_update(question_slug, source_reference) as (values
  (
    'diagnostico-comunicacao-social-crise-porta-voz',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.4.2.3, subitem 3; Instituto de Pesquisa Econômica Aplicada, Manual de Gestão de Crises Ipea 2025, seção 5.1. Questão autoral Nortis.'
  )
)
update public.questions question
set source_reference = seed.source_reference,
    updated_at = now()
from source_update seed
where question.slug = seed.question_slug;
