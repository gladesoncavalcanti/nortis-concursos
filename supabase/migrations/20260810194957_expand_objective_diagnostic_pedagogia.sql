-- Amplia o diagnóstico objetivo para Pedagogia com uma questão autoral
-- por bloco oficial, sem alterar o motor ou as regras de acesso.
with diagnostic_seed(
  specialty_slug, subject_slug, question_slug, statement,
  explanation, source_reference, sort_order
) as (values
  (
    'pedagogia-408',
    '1-fundamentos-da-educacao-e-pedagogia-social',
    'diagnostico-pedagogia-atuacao-nao-escolar',
    'De acordo com as Diretrizes Curriculares Nacionais do curso de Pedagogia, qual alternativa descreve corretamente o campo de formação e atuação do licenciado?',
    'As Diretrizes abrangem a docência na Educação Infantil, nos anos iniciais do Ensino Fundamental, no Ensino Médio na modalidade Normal e na Educação Profissional em serviços e apoio escolar, além de outras áreas em que sejam previstos conhecimentos pedagógicos. A formação do pedagogo, portanto, não se restringe à sala de aula escolar nem autoriza atuação sem os conhecimentos exigidos para cada contexto.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.9, subitem 1; Conselho Nacional de Educação, Resolução CNE/CP nº 1/2006, art. 2º. Questão autoral Nortis.',
    40810
  ),
  (
    'pedagogia-408',
    '2-direito-educacional',
    'diagnostico-pedagogia-gestao-democratica',
    'Segundo a redação vigente do art. 3º da Lei de Diretrizes e Bases da Educação Nacional, como deve ocorrer a gestão democrática do ensino público?',
    'A LDB estabelece a gestão democrática do ensino público na forma da própria Lei e da legislação dos respectivos Estados e Municípios e do Distrito Federal. Ela não elimina a competência dos sistemas de ensino, não restringe a participação à direção escolar e não transforma a gestão democrática em regra exclusiva da rede federal.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.9, subitem 2; Presidência da República, Lei Federal nº 9.394/1996, art. 3º, inciso VIII, com redação dada pela Lei nº 14.644/2023. Questão autoral Nortis.',
    40820
  ),
  (
    'pedagogia-408',
    '3-o-pedagogo-no-suas',
    'diagnostico-pedagogia-planejamento-participativo-paif',
    'Uma equipe do CRAS vai estruturar um projeto socioeducativo com famílias acompanhadas pelo PAIF. Qual conduta é coerente com o planejamento participativo e com a organização do trabalho social com famílias?',
    'O trabalho planejado parte do conhecimento das famílias e do território, define objetivos e ações com participação dos sujeitos, mantém registros e acompanha resultados, revendo o percurso quando necessário. Essa organização qualifica a ação socioeducativa e pode exigir articulação com a rede; improvisação isolada, padronização sem diagnóstico e ausência de avaliação contrariam esse processo.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.9, subitem 3; Ministério do Desenvolvimento Social e Combate à Fome e Secretaria Nacional de Assistência Social, Orientações Técnicas sobre o PAIF, volume 2: Trabalho Social com Famílias do Serviço de Proteção e Atendimento Integral à Família, 2012. Questão autoral Nortis.',
    40830
  ),
  (
    'pedagogia-408',
    '4-intervencao-pedagogica-nas-situacoes-de-vulnerabilidade-e-violencia',
    'diagnostico-pedagogia-principios-educacao-direitos-humanos',
    'Qual alternativa reúne somente princípios que fundamentam a Educação em Direitos Humanos segundo a Resolução CNE/CP nº 1/2012?',
    'A Resolução inclui dignidade humana, igualdade de direitos, reconhecimento e valorização das diferenças e das diversidades, laicidade do Estado, democracia na educação, transversalidade, vivência e globalidade e sustentabilidade socioambiental. Homogeneização cultural, confessionalidade estatal e seleção por mérito não integram essa lista de princípios.',
    'Edital SEDES-DF nº 1/2026 atualizado conforme os Editais nº 2 e nº 3, item 20.2.4.2.9, subitem 4; Conselho Nacional de Educação, Resolução CNE/CP nº 1/2012, arts. 2º e 3º. Questão autoral Nortis.',
    40840
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
  ('diagnostico-pedagogia-atuacao-nao-escolar','A','Restringe-se à docência na Educação Infantil e nos anos iniciais do Ensino Fundamental.',10),
  ('diagnostico-pedagogia-atuacao-nao-escolar','B','Limita-se à administração escolar, sem abranger processos educativos em outros contextos.',20),
  ('diagnostico-pedagogia-atuacao-nao-escolar','C','Abrange os campos de docência previstos nas Diretrizes e outras áreas em que sejam necessários conhecimentos pedagógicos.',30),
  ('diagnostico-pedagogia-atuacao-nao-escolar','D','Autoriza qualquer atuação social, mesmo quando não houver dimensão educativa ou conhecimento pedagógico envolvido.',40),
  ('diagnostico-pedagogia-gestao-democratica','A','Exclusivamente por regulamento federal único, sem participação dos sistemas estaduais, municipais ou distrital.',10),
  ('diagnostico-pedagogia-gestao-democratica','B','Na forma da LDB e da legislação dos respectivos Estados e Municípios e do Distrito Federal.',20),
  ('diagnostico-pedagogia-gestao-democratica','C','Somente por decisão da direção de cada escola pública, independentemente da legislação do sistema de ensino.',30),
  ('diagnostico-pedagogia-gestao-democratica','D','Apenas nas instituições federais, por não constituir princípio aplicável aos demais sistemas públicos.',40),
  ('diagnostico-pedagogia-planejamento-participativo-paif','A','Repetir uma atividade padronizada sem considerar as características das famílias ou do território.',10),
  ('diagnostico-pedagogia-planejamento-participativo-paif','B','Executar encontros improvisados e dispensar registros para preservar a espontaneidade da equipe.',20),
  ('diagnostico-pedagogia-planejamento-participativo-paif','C','Definir todas as decisões apenas entre os profissionais e avaliar o projeto somente ao final.',30),
  ('diagnostico-pedagogia-planejamento-participativo-paif','D','Conhecer famílias e território, construir objetivos e ações com participação, registrar, monitorar, avaliar e articular a rede quando necessário.',40),
  ('diagnostico-pedagogia-principios-educacao-direitos-humanos','A','Uniformidade cultural, neutralidade diante das desigualdades, centralização e competitividade.',10),
  ('diagnostico-pedagogia-principios-educacao-direitos-humanos','B','Dignidade humana, igualdade de direitos, valorização das diferenças e diversidades e laicidade do Estado.',20),
  ('diagnostico-pedagogia-principios-educacao-direitos-humanos','C','Confessionalidade estatal, seleção por mérito, homogeneização das identidades e disciplina punitiva.',30),
  ('diagnostico-pedagogia-principios-educacao-direitos-humanos','D','Hierarquia de direitos, assimilação cultural, tutela permanente e exclusão de temas controversos.',40)
)
insert into public.question_options(question_id, label, option_text, sort_order)
select question.id, seed.label, seed.option_text, seed.sort_order
from option_seed seed
join public.questions question on question.slug = seed.question_slug
on conflict (question_id, label) do update set
  option_text = excluded.option_text,
  sort_order = excluded.sort_order;

with solution_seed(question_slug, correct_label) as (values
  ('diagnostico-pedagogia-atuacao-nao-escolar','C'),
  ('diagnostico-pedagogia-gestao-democratica','B'),
  ('diagnostico-pedagogia-planejamento-participativo-paif','D'),
  ('diagnostico-pedagogia-principios-educacao-direitos-humanos','B')
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
