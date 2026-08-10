-- Amplia o piloto editorial do diagnóstico objetivo para Comunicação Social
-- sem alterar o motor, as regras de acesso ou o cálculo já validados.
with diagnostic_seed(
  specialty_slug, subject_slug, question_slug, statement,
  explanation, source_reference, sort_order
) as (values
  (
    'comunicacao-social-402',
    '1-fundamentos-e-teorias-da-comunicacao',
    'diagnostico-comunicacao-social-ruido',
    'Durante uma transmissão institucional ao vivo, falhas na conexão tornam trechos da mensagem inaudíveis. No modelo informacional de Shannon e Weaver, como se classifica essa interferência no processo de transmissão?',
    'Ruído é toda interferência que afeta o sinal ou dificulta a transmissão da mensagem pelo canal. Feedback é a resposta do receptor; fonte e receptor são participantes do processo, não a interferência descrita.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.4.2.3, subitem 1; Portal eduCAPES, Comunicação em Foco: um Guia Instrucional, seção Fundamentos da Comunicação e Teoria da Informação. Questão autoral Nortis.',
    40210
  ),
  (
    'comunicacao-social-402',
    '2-comunicacao-organizacional-e-relacoes-publicas',
    'diagnostico-comunicacao-social-mapeamento-publicos',
    'Um órgão público pretende lançar uma campanha institucional e a equipe começou escolhendo redes sociais antes de definir objetivos ou conhecer os públicos afetados. Qual ajuste torna o planejamento mais consistente?',
    'O planejamento estratégico deve partir de objetivos claros e do mapeamento dos públicos internos e externos. Só depois se definem mensagens, canais, ações e indicadores adequados a cada relacionamento; escolher canais isoladamente antecipa uma decisão tática.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.4.2.3, subitem 2; Escola Nacional de Administração Pública, curso Comunicação Pública e Gestão de Relacionamento com Cidadão; Casa Civil de Goiás, Plano de Comunicação Institucional 2024-2026. Questão autoral Nortis.',
    40220
  ),
  (
    'comunicacao-social-402',
    '3-jornalismo-assessoria-de-imprensa-e-gestao-de-crise',
    'diagnostico-comunicacao-social-crise-porta-voz',
    'Uma informação falsa sobre um serviço público começa a circular rapidamente e jornalistas solicitam posicionamento. Qual resposta inicial é mais adequada à gestão profissional da crise?',
    'A resposta deve seguir o protocolo de crise: reunir e verificar fatos, coordenar a atuação, definir porta-voz preparado, divulgar mensagem objetiva pelos canais oficiais e monitorar a repercussão. Silêncio prolongado, improviso ou múltiplas versões descoordenadas ampliam o risco.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.4.2.3, subitem 3; Instituto de Pesquisa Econômica Aplicada, Manual de Gestão de Crises Ipea 2025, seção 5.1; Agência Nacional de Aviação Civil, Instrução Normativa nº 78/2014, arts. 4º e 5º. Questão autoral Nortis.',
    40230
  ),
  (
    'comunicacao-social-402',
    '4-comunicacao-digital-e-novas-tecnologias',
    'diagnostico-comunicacao-social-metrica-objetivo',
    'Uma campanha digital tem como objetivo ampliar a conclusão de solicitações em um serviço eletrônico. A publicação recebe muitas curtidas, mas a equipe precisa avaliar o resultado ligado ao objetivo. Qual abordagem é a mais adequada?',
    'Curtidas podem ajudar a descrever interação, mas não comprovam a conclusão do serviço. A avaliação deve relacionar métricas ao objetivo, acompanhando o percurso entre alcance, cliques no serviço e solicitações efetivamente concluídas, além de identificar pontos de abandono.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.4.2.3, subitem 4; Governo Federal, Manual de Orientação para Atuação em Mídias Sociais, seção Monitoramento e Métricas em Mídias Sociais. Questão autoral Nortis.',
    40240
  ),
  (
    'comunicacao-social-402',
    '5-etica-profissional',
    'diagnostico-comunicacao-social-impessoalidade',
    'Uma peça custeada pelo poder público informa a entrega de um serviço, mas destaca o nome, a fotografia e um slogan de exaltação pessoal da autoridade responsável. Qual conduta atende à ética da comunicação pública e à Constituição?',
    'A comunicação deve retirar a promoção pessoal e conservar caráter educativo, informativo ou de orientação social. O art. 37, § 1º, da Constituição impede que nomes, símbolos ou imagens caracterizem promoção pessoal de autoridades ou servidores em publicidade pública.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.4.2.3, subitem 5; Constituição da República Federativa do Brasil de 1988, art. 37, caput e § 1º; Código de Ética dos Jornalistas Brasileiros, arts. 1º, 2º e 4º. Questão autoral Nortis.',
    40250
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
  ('diagnostico-comunicacao-social-ruido','A','Feedback, porque corresponde à resposta posterior do público.',10),
  ('diagnostico-comunicacao-social-ruido','B','Fonte, porque é o elemento que origina qualquer falha técnica.',20),
  ('diagnostico-comunicacao-social-ruido','C','Ruído, porque interfere no sinal transmitido pelo canal.',30),
  ('diagnostico-comunicacao-social-ruido','D','Receptor, porque é quem necessariamente produz a perda de informação.',40),
  ('diagnostico-comunicacao-social-mapeamento-publicos','A','Manter a escolha dos canais e adaptar os objetivos ao que cada plataforma oferece.',10),
  ('diagnostico-comunicacao-social-mapeamento-publicos','B','Definir objetivos e mapear públicos internos e externos antes de selecionar mensagens, canais e indicadores.',20),
  ('diagnostico-comunicacao-social-mapeamento-publicos','C','Produzir a maior quantidade possível de peças e medir apenas o volume publicado.',30),
  ('diagnostico-comunicacao-social-mapeamento-publicos','D','Restringir o planejamento à comunicação externa, pois o público interno não afeta a campanha.',40),
  ('diagnostico-comunicacao-social-crise-porta-voz','A','Aguardar o assunto desaparecer e evitar qualquer posicionamento institucional.',10),
  ('diagnostico-comunicacao-social-crise-porta-voz','B','Permitir que cada unidade responda livremente para aumentar a velocidade das manifestações.',20),
  ('diagnostico-comunicacao-social-crise-porta-voz','C','Publicar uma resposta imediata sem conferir os fatos, desde que a mensagem seja breve.',30),
  ('diagnostico-comunicacao-social-crise-porta-voz','D','Acionar o protocolo, verificar fatos, coordenar mensagem e porta-voz e monitorar a repercussão.',40),
  ('diagnostico-comunicacao-social-metrica-objetivo','A','Medir apenas curtidas, pois toda interação equivale à conclusão do serviço.',10),
  ('diagnostico-comunicacao-social-metrica-objetivo','B','Comparar somente o número de seguidores antes e depois da campanha.',20),
  ('diagnostico-comunicacao-social-metrica-objetivo','C','Relacionar alcance e cliques às solicitações concluídas e aos pontos de abandono do percurso.',30),
  ('diagnostico-comunicacao-social-metrica-objetivo','D','Desconsiderar métricas digitais e avaliar a campanha apenas pela percepção interna da equipe.',40),
  ('diagnostico-comunicacao-social-impessoalidade','A','Manter a peça, porque a identificação visual da autoridade sempre comprova transparência.',10),
  ('diagnostico-comunicacao-social-impessoalidade','B','Retirar a promoção pessoal e preservar somente o conteúdo educativo, informativo ou de orientação social.',20),
  ('diagnostico-comunicacao-social-impessoalidade','C','Manter apenas o nome da autoridade, pois a vedação alcança exclusivamente fotografias.',30),
  ('diagnostico-comunicacao-social-impessoalidade','D','Substituir a fotografia por um slogan pessoal, sem alterar o restante da campanha.',40)
)
insert into public.question_options(question_id, label, option_text, sort_order)
select question.id, seed.label, seed.option_text, seed.sort_order
from option_seed seed
join public.questions question on question.slug = seed.question_slug
on conflict (question_id, label) do update set
  option_text = excluded.option_text,
  sort_order = excluded.sort_order;

with solution_seed(question_slug, correct_label) as (values
  ('diagnostico-comunicacao-social-ruido','C'),
  ('diagnostico-comunicacao-social-mapeamento-publicos','B'),
  ('diagnostico-comunicacao-social-crise-porta-voz','D'),
  ('diagnostico-comunicacao-social-metrica-objetivo','C'),
  ('diagnostico-comunicacao-social-impessoalidade','B')
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
