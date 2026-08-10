-- Amplia o piloto editorial do diagnóstico objetivo para Técnico Administrativo
-- sem alterar o motor, as regras de acesso ou o cálculo já validados.
with diagnostic_seed(
  specialty_slug, subject_slug, question_slug, statement,
  explanation, source_reference, sort_order
) as (values
  (
    'tecnico-administrativo-202',
    '1-nocoes-de-direito-constitucional',
    'diagnostico-tecnico-administrativo-impessoalidade',
    'Uma campanha institucional usa nome, símbolo e imagem de uma autoridade para associar a entrega de um serviço público à promoção pessoal dessa autoridade. Qual princípio constitucional é diretamente contrariado por essa conduta?',
    'A publicidade institucional deve ter caráter educativo, informativo ou de orientação social e não pode servir à promoção pessoal de autoridades ou servidores. A situação contraria diretamente a impessoalidade, além da regra específica do art. 37, § 1º, da Constituição Federal.',
    'Edital SEDES-DF nº 1/2026, item 20.2.3.2.3, subitem 1; Constituição Federal de 1988, art. 37, caput e § 1º. Questão autoral Nortis.',
    20210
  ),
  (
    'tecnico-administrativo-202',
    '2-nocoes-de-direito-administrativo-e-legislacao',
    'diagnostico-tecnico-administrativo-anulacao-revogacao',
    'Ao revisar dois atos, a Administração constata que o primeiro contém vício de legalidade e que o segundo é válido, mas deixou de ser conveniente ao interesse público. Qual providência corresponde a cada situação?',
    'O ato ilegal deve ser anulado. O ato válido pode ser revogado por razões de conveniência ou oportunidade, com respeito aos direitos adquiridos. Anulação controla a legalidade; revogação resulta de avaliação administrativa sobre mérito.',
    'Edital SEDES-DF nº 1/2026, item 20.2.3.2.3, subitem 2; Lei Federal nº 9.784/1999, art. 53; STF, Súmula 473. Questão autoral Nortis.',
    20220
  ),
  (
    'tecnico-administrativo-202',
    '3-atendimento-rotinas-administrativas-e-arquivologia',
    'diagnostico-tecnico-administrativo-protocolo',
    'Um documento externo chega ao setor de protocolo e precisa ser encaminhado à unidade competente. Qual procedimento preserva adequadamente o controle de seu fluxo?',
    'O protocolo deve conferir e registrar o recebimento, classificar o documento quando cabível, distribuí-lo à unidade responsável e controlar sua tramitação. O registro permite rastrear a entrada e o percurso do documento e reduz o risco de perda ou encaminhamento sem evidência.',
    'Edital SEDES-DF nº 1/2026, item 20.2.3.2.3, subitem 3; Ministério da Gestão e da Inovação em Serviços Públicos, Manual do Protocolo e Arquivo do SEI. Questão autoral Nortis.',
    20230
  ),
  (
    'tecnico-administrativo-202',
    '4-nocoes-de-recursos-materiais-patrimonio-e-compras',
    'diagnostico-tecnico-administrativo-fase-preparatoria',
    'Antes de publicar uma licitação, a equipe descreve a necessidade, elabora o estudo técnico preliminar, estima o valor e avalia riscos da contratação. Em qual fase do processo licitatório essas atividades se concentram?',
    'Essas atividades integram a fase preparatória, caracterizada pelo planejamento da contratação. Nela são examinadas a necessidade pública, a solução, os custos, os riscos e outros elementos que fundamentam a futura seleção do fornecedor.',
    'Edital SEDES-DF nº 1/2026, item 20.2.3.2.3, subitem 4; Lei Federal nº 14.133/2021, arts. 17 e 18. Questão autoral Nortis.',
    20240
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
  ('diagnostico-tecnico-administrativo-impessoalidade','A','Eficiência, porque toda publicidade institucional é proibida quando utiliza recursos públicos.',10),
  ('diagnostico-tecnico-administrativo-impessoalidade','B','Impessoalidade, porque a comunicação oficial não pode ser usada para promoção pessoal da autoridade.',20),
  ('diagnostico-tecnico-administrativo-impessoalidade','C','Legalidade, porque a divulgação de qualquer serviço público depende de autorização judicial prévia.',30),
  ('diagnostico-tecnico-administrativo-impessoalidade','D','Moralidade, porque somente campanhas sem imagens podem ter caráter educativo ou informativo.',40),
  ('diagnostico-tecnico-administrativo-anulacao-revogacao','A','Revogar os dois atos, pois legalidade e conveniência são aspectos equivalentes do mérito administrativo.',10),
  ('diagnostico-tecnico-administrativo-anulacao-revogacao','B','Anular os dois atos, pois todo ato inconveniente é necessariamente ilegal.',20),
  ('diagnostico-tecnico-administrativo-anulacao-revogacao','C','Anular o ato ilegal e revogar o ato válido que se tornou inconveniente, respeitados os direitos adquiridos.',30),
  ('diagnostico-tecnico-administrativo-anulacao-revogacao','D','Convalidar o ato ilegal e manter obrigatoriamente o ato válido, sem exame de conveniência.',40),
  ('diagnostico-tecnico-administrativo-protocolo','A','Conferir e registrar o recebimento, classificar quando cabível, distribuir e controlar a tramitação.',10),
  ('diagnostico-tecnico-administrativo-protocolo','B','Encaminhar diretamente ao destinatário sem registro, para reduzir o tempo de atendimento.',20),
  ('diagnostico-tecnico-administrativo-protocolo','C','Arquivar definitivamente o documento antes de identificar a unidade responsável.',30),
  ('diagnostico-tecnico-administrativo-protocolo','D','Digitalizar e eliminar imediatamente o original, independentemente das regras de preservação e destinação.',40),
  ('diagnostico-tecnico-administrativo-fase-preparatoria','A','Fase de julgamento.',10),
  ('diagnostico-tecnico-administrativo-fase-preparatoria','B','Fase recursal.',20),
  ('diagnostico-tecnico-administrativo-fase-preparatoria','C','Fase de homologação.',30),
  ('diagnostico-tecnico-administrativo-fase-preparatoria','D','Fase preparatória.',40)
)
insert into public.question_options(question_id, label, option_text, sort_order)
select question.id, seed.label, seed.option_text, seed.sort_order
from option_seed seed
join public.questions question on question.slug = seed.question_slug
on conflict (question_id, label) do update set
  option_text = excluded.option_text,
  sort_order = excluded.sort_order;

with solution_seed(question_slug, correct_label) as (values
  ('diagnostico-tecnico-administrativo-impessoalidade','B'),
  ('diagnostico-tecnico-administrativo-anulacao-revogacao','C'),
  ('diagnostico-tecnico-administrativo-protocolo','A'),
  ('diagnostico-tecnico-administrativo-fase-preparatoria','D')
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
