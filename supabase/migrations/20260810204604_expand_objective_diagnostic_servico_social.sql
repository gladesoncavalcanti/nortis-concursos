-- Amplia o diagnóstico objetivo para a especialidade Serviço Social com uma questão autoral
-- por bloco oficial, sem alterar o motor ou as regras de acesso.
with diagnostic_seed(
  specialty_slug, subject_slug, question_slug, statement,
  explanation, source_reference, sort_order
) as (values
  (
    'servico-social-410',
    '1-fundamentos-historicos-e-teorico-metodologicos',
    'diagnostico-servico-social-nucleos-formacao-profissional',
    'Nas Diretrizes Gerais da ABEPSS, como os núcleos de fundamentação devem organizar a formação profissional em Serviço Social?',
    'Os núcleos de fundamentos teórico-metodológicos da vida social, da formação sócio-histórica da sociedade brasileira e do trabalho profissional articulam-se como uma totalidade. Eles não devem ser tratados como blocos autônomos ou como etapas sucessivas, pois atravessam os componentes curriculares e relacionam teoria, realidade social e exercício profissional.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.11, subitem 1; Associação Brasileira de Ensino e Pesquisa em Serviço Social, Diretrizes Gerais para o Curso de Serviço Social, 1996, seção 3. Questão autoral Nortis.',
    41010
  ),
  (
    'servico-social-410',
    '2-etica-e-legislacao-profissional',
    'diagnostico-servico-social-atribuicao-privativa',
    'Qual atividade constitui atribuição privativa da assistente social, nos termos do artigo 5º da Lei nº 8.662/1993?',
    'A realização de vistorias, perícias técnicas, laudos periciais, informações e pareceres sobre matéria de Serviço Social é atribuição privativa da assistente social. A lei também prevê competências profissionais mais amplas, mas a questão exige identificar uma atividade expressamente reservada à profissão.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.11, subitem 2; Brasil, Lei nº 8.662/1993, art. 5º, inciso IV. Questão autoral Nortis.',
    41020
  ),
  (
    'servico-social-410',
    '3-dimensao-tecnico-operativa-e-pesquisa-social',
    'diagnostico-servico-social-parecer-multiprofissional',
    'Em um parecer elaborado com equipe multiprofissional, qual conduta atende à Resolução CFESS nº 557/2009?',
    'A atuação conjunta deve preservar a especificidade profissional. A assistente social destaca separadamente sua área de conhecimento, delimita o âmbito da atuação, o objeto, os instrumentos e a análise social, e emite opinião técnica somente sobre matéria de sua atribuição e habilitação. A discussão pode ser multiprofissional, mas não apaga a autoria nem os limites de cada profissão.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.11, subitem 3; Conselho Federal de Serviço Social, Resolução CFESS nº 557/2009, art. 4º e parágrafos. Questão autoral Nortis.',
    41030
  ),
  (
    'servico-social-410',
    '4-estado-politicas-sociais-planejamento-e-gestao',
    'diagnostico-servico-social-seguridade-social',
    'Segundo o artigo 194 da Constituição Federal, quais políticas compõem a Seguridade Social?',
    'A Constituição define a Seguridade Social como o conjunto integrado de ações destinadas a assegurar os direitos relativos à saúde, à previdência e à assistência social. Educação, habitação, trabalho e segurança pública são políticas relevantes, mas não integram esse tripé constitucional específico.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.11, subitem 4; Brasil, Constituição da República Federativa do Brasil de 1988, art. 194. Questão autoral Nortis.',
    41040
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
  ('diagnostico-servico-social-nucleos-formacao-profissional','A','Organizá-los como etapas independentes e sucessivas, concluindo primeiro a teoria social e somente depois iniciando o estudo do trabalho profissional.',10),
  ('diagnostico-servico-social-nucleos-formacao-profissional','B','Articulá-los como uma totalidade formada pelos fundamentos da vida social, da formação sócio-histórica brasileira e do trabalho profissional, sem tratá-los como blocos autônomos.',20),
  ('diagnostico-servico-social-nucleos-formacao-profissional','C','Concentrar a formação exclusivamente em técnicas operacionais, deixando os fundamentos históricos e teóricos para atividades optativas.',30),
  ('diagnostico-servico-social-nucleos-formacao-profissional','D','Substituir os núcleos por disciplinas isoladas, sem relações entre realidade social, teoria e exercício profissional.',40),
  ('diagnostico-servico-social-atribuicao-privativa','A','Participar de campanhas educativas de caráter geral promovidas por qualquer política pública.',10),
  ('diagnostico-servico-social-atribuicao-privativa','B','Realizar atendimento administrativo inicial e encaminhar documentos para outros setores da instituição.',20),
  ('diagnostico-servico-social-atribuicao-privativa','C','Realizar vistorias, perícias técnicas, laudos periciais, informações e pareceres sobre matéria de Serviço Social.',30),
  ('diagnostico-servico-social-atribuicao-privativa','D','Executar qualquer avaliação clínica de saúde solicitada pela equipe, ainda que fora da formação e da habilitação profissional.',40),
  ('diagnostico-servico-social-parecer-multiprofissional','A','Apresentar uma única conclusão indiferenciada, assinada por toda a equipe, sem identificar o objeto e a contribuição de cada profissão.',10),
  ('diagnostico-servico-social-parecer-multiprofissional','B','Destacar separadamente a área de Serviço Social, delimitar objeto, âmbito, instrumentos e análise social, e opinar apenas sobre matéria de sua atribuição profissional.',20),
  ('diagnostico-servico-social-parecer-multiprofissional','C','Recusar toda produção conjunta, pois a participação em equipe multiprofissional é incompatível com a autonomia da assistente social.',30),
  ('diagnostico-servico-social-parecer-multiprofissional','D','Permitir que outro profissional subscreva a análise social, desde que a equipe concorde informalmente com o conteúdo.',40),
  ('diagnostico-servico-social-seguridade-social','A','Saúde, educação e habitação.',10),
  ('diagnostico-servico-social-seguridade-social','B','Previdência, trabalho e segurança pública.',20),
  ('diagnostico-servico-social-seguridade-social','C','Assistência social, educação e cultura.',30),
  ('diagnostico-servico-social-seguridade-social','D','Saúde, previdência e assistência social.',40)
)
insert into public.question_options(question_id, label, option_text, sort_order)
select question.id, seed.label, seed.option_text, seed.sort_order
from option_seed seed
join public.questions question on question.slug = seed.question_slug
on conflict (question_id, label) do update set
  option_text = excluded.option_text,
  sort_order = excluded.sort_order;

with solution_seed(question_slug, correct_label) as (values
  ('diagnostico-servico-social-nucleos-formacao-profissional','B'),
  ('diagnostico-servico-social-atribuicao-privativa','C'),
  ('diagnostico-servico-social-parecer-multiprofissional','B'),
  ('diagnostico-servico-social-seguridade-social','D')
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
