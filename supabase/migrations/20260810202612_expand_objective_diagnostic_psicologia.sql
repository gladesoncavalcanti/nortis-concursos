-- Amplia o diagnóstico objetivo para a especialidade Psicologia com uma questão autoral
-- por bloco oficial, sem alterar o motor ou as regras de acesso.
with diagnostic_seed(
  specialty_slug, subject_slug, question_slug, statement,
  explanation, source_reference, sort_order
) as (values
  (
    'psicologia-409',
    '1-fundamentos-da-psicologia-e-psicologia-social',
    'diagnostico-psicologia-subjetividade-contexto-social',
    'Ao analisar uma situação de vulnerabilidade social, qual conduta é coerente com a Psicologia Social crítica e com o compromisso social da profissão?',
    'A atuação deve articular as dimensões subjetivas às condições sociais, históricas, políticas, econômicas, culturais e territoriais. Essa leitura reconhece sentimentos, discursos e modos de interação sem reduzir a vulnerabilidade a uma patologia individual nem desconsiderar os recursos pessoais e coletivos presentes no território.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.10, subitem 1; Conselho Federal de Psicologia, Referências Técnicas para atuação de psicólogas(os) no CRAS/SUAS, 3ª edição, eixo 3, princípios e diretrizes para a prática no CRAS. Questão autoral Nortis.',
    40910
  ),
  (
    'psicologia-409',
    '2-a-pratica-psicossocial-no-suas',
    'diagnostico-psicologia-atuacao-psicossocial-suas',
    'No CRAS, uma família apresenta fragilização de vínculos e dificuldades de acesso a direitos. Qual encaminhamento profissional é compatível com a prática psicossocial no SUAS?',
    'A prática no CRAS integra leitura territorial, trabalho interdisciplinar, fortalecimento de vínculos e articulação da rede para ampliar direitos, autonomia e protagonismo. O acompanhamento não deve converter o PAIF em psicoterapia individual, fragmentar a demanda entre profissionais nem se limitar a classificar a família.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.10, subitem 2; Conselho Federal de Psicologia, Referências Técnicas para atuação de psicólogas(os) no CRAS/SUAS, 3ª edição, eixos 2 e 3; Ministério do Desenvolvimento Social e Combate à Fome, Orientações Técnicas sobre o PAIF, volume 2, 2012. Questão autoral Nortis.',
    40920
  ),
  (
    'psicologia-409',
    '3-avaliacao-e-instrumentos-tecnico-operativos',
    'diagnostico-psicologia-fontes-avaliacao-psicologica',
    'Segundo a Resolução CFP nº 31/2022, qual alternativa apresenta somente fontes fundamentais de informação que podem compor uma avaliação psicológica?',
    'São fontes fundamentais os testes psicológicos aprovados pelo CFP, as entrevistas psicológicas e anamneses, e os protocolos ou registros de observação de comportamentos, inclusive os obtidos em processo grupal ou por técnicas de grupo. A avaliação é um processo estruturado e não exige que toda situação utilize obrigatoriamente um teste psicológico.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.10, subitem 3; Conselho Federal de Psicologia, Resolução CFP nº 31/2022, arts. 1º e 2º, e Sistema de Avaliação de Testes Psicológicos (SATEPSI), Perguntas Frequentes. Questão autoral Nortis.',
    40930
  ),
  (
    'psicologia-409',
    '4-etica-profissional-e-elaboracao-de-documentos',
    'diagnostico-psicologia-sigilo-equipe-multiprofissional',
    'Em uma equipe multiprofissional, como a psicóloga deve compartilhar informações obtidas no atendimento, segundo o Código de Ética Profissional do Psicólogo?',
    'No relacionamento com profissionais não psicólogos, devem ser compartilhadas somente as informações relevantes para qualificar o serviço, resguardando o caráter confidencial das comunicações e assinalando a responsabilidade de quem as recebe de preservar o sigilo. A participação em equipe não autoriza acesso irrestrito ao conteúdo do atendimento.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.10, subitem 4; Conselho Federal de Psicologia, Resolução CFP nº 10/2005, Código de Ética Profissional do Psicólogo, art. 6º, alínea b. Questão autoral Nortis.',
    40940
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
  ('diagnostico-psicologia-subjetividade-contexto-social','A','Explicar a vulnerabilidade exclusivamente por características individuais e encaminhar todas as pessoas para avaliação psicopatológica.',10),
  ('diagnostico-psicologia-subjetividade-contexto-social','B','Articular aspectos subjetivos à história, ao território e às condições sociais, políticas, econômicas e culturais, reconhecendo também recursos individuais e coletivos.',20),
  ('diagnostico-psicologia-subjetividade-contexto-social','C','Desconsiderar sentimentos e discursos individuais, porque apenas indicadores socioeconômicos interessam às políticas públicas.',30),
  ('diagnostico-psicologia-subjetividade-contexto-social','D','Aplicar uma interpretação universal, sem considerar diferenças culturais, identitárias ou territoriais.',40),
  ('diagnostico-psicologia-atuacao-psicossocial-suas','A','Converter o acompanhamento do PAIF em psicoterapia individual contínua, sem articulação com os demais profissionais.',10),
  ('diagnostico-psicologia-atuacao-psicossocial-suas','B','Classificar a família por um diagnóstico individual e encerrar a intervenção após o encaminhamento clínico.',20),
  ('diagnostico-psicologia-atuacao-psicossocial-suas','C','Construir a intervenção com leitura do território, trabalho interdisciplinar, fortalecimento de vínculos e articulação da rede para ampliar autonomia e acesso a direitos.',30),
  ('diagnostico-psicologia-atuacao-psicossocial-suas','D','Dividir a demanda em partes estanques, impedindo o compartilhamento ético de informações relevantes entre os profissionais da equipe.',40),
  ('diagnostico-psicologia-fontes-avaliacao-psicologica','A','Somente testes psicológicos aprovados pelo CFP, sendo vedado o uso de entrevistas ou observação.',10),
  ('diagnostico-psicologia-fontes-avaliacao-psicologica','B','Relatos informais sem registro, opiniões pessoais do avaliador e materiais sem respaldo científico.',20),
  ('diagnostico-psicologia-fontes-avaliacao-psicologica','C','Apenas documentos de equipes multiprofissionais e instrumentos não psicológicos, ainda que não haja fonte fundamental.',30),
  ('diagnostico-psicologia-fontes-avaliacao-psicologica','D','Testes psicológicos aprovados pelo CFP, entrevistas ou anamneses e protocolos ou registros de observação, inclusive em processos grupais.',40),
  ('diagnostico-psicologia-sigilo-equipe-multiprofissional','A','Compartilhar integralmente registros e falas do atendimento com toda a instituição, pois o trabalho em equipe elimina o dever de sigilo.',10),
  ('diagnostico-psicologia-sigilo-equipe-multiprofissional','B','Não compartilhar nenhuma informação em qualquer circunstância, mesmo quando um dado relevante for necessário para qualificar o serviço.',20),
  ('diagnostico-psicologia-sigilo-equipe-multiprofissional','C','Compartilhar somente informações relevantes para qualificar o serviço, preservar a confidencialidade e assinalar a responsabilidade de quem recebe de manter o sigilo.',30),
  ('diagnostico-psicologia-sigilo-equipe-multiprofissional','D','Entregar documentos psicológicos completos sempre que outro profissional solicitar, independentemente da finalidade ou da necessidade.',40)
)
insert into public.question_options(question_id, label, option_text, sort_order)
select question.id, seed.label, seed.option_text, seed.sort_order
from option_seed seed
join public.questions question on question.slug = seed.question_slug
on conflict (question_id, label) do update set
  option_text = excluded.option_text,
  sort_order = excluded.sort_order;

with solution_seed(question_slug, correct_label) as (values
  ('diagnostico-psicologia-subjetividade-contexto-social','B'),
  ('diagnostico-psicologia-atuacao-psicossocial-suas','C'),
  ('diagnostico-psicologia-fontes-avaliacao-psicologica','D'),
  ('diagnostico-psicologia-sigilo-equipe-multiprofissional','C')
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
