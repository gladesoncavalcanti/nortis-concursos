-- Amplia o piloto editorial do diagnóstico objetivo para Ciências Contábeis
-- sem alterar o motor, as regras de acesso ou o cálculo já validados.
with diagnostic_seed(
  specialty_slug, subject_slug, question_slug, statement,
  explanation, source_reference, sort_order
) as (values
  (
    'ciencias-contabeis-401',
    '1-contabilidade-geral-e-societaria',
    'diagnostico-ciencias-contabeis-passivo-adiantamento',
    'Uma entidade recebeu antecipadamente um valor de cliente e, em decorrência do contrato, permanece obrigada a prestar o serviço no futuro. À luz da NBC TG Estrutura Conceitual, qual elemento decorre dessa obrigação presente?',
    'O recebimento antecipado, associado à obrigação presente de prestar o serviço, caracteriza um passivo: a entidade deverá transferir um recurso econômico em razão de evento passado. O ingresso de caixa, por si só, não transforma imediatamente todo o valor em receita.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.4.2.2, subitem 1; Conselho Federal de Contabilidade, NBC TG Estrutura Conceitual, itens 4.26, 4.27 e 4.39(b). Questão autoral Nortis.',
    40110
  ),
  (
    'ciencias-contabeis-401',
    '2-administracao-financeira-e-analise-de-balancos',
    'diagnostico-ciencias-contabeis-liquidez-corrente',
    'Uma entidade apresenta Ativo Circulante de R$ 360.000 e Passivo Circulante de R$ 240.000. Qual é a leitura inicial correta de sua liquidez corrente, sem extrapolar o alcance desse indicador?',
    'A liquidez corrente é calculada pela divisão do Ativo Circulante pelo Passivo Circulante. O resultado é 1,5, indicando R$ 1,50 em ativos de curto prazo para cada R$ 1,00 em obrigações de curto prazo. O índice deve ser analisado com outros elementos e não comprova, isoladamente, segurança financeira global.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.4.2.2, subitem 2; Tribunal de Contas da União, indicador de Liquidez Corrente e Acórdão nº 2.951/2019 - Plenário. Questão autoral Nortis.',
    40120
  ),
  (
    'ciencias-contabeis-401',
    '3-contabilidade-aplicada-ao-setor-publico-casp',
    'diagnostico-ciencias-contabeis-dvp-resultado-patrimonial',
    'Na Contabilidade Aplicada ao Setor Público, qual demonstração evidencia as alterações verificadas no patrimônio, resultantes ou independentes da execução orçamentária, e indica o resultado patrimonial do exercício?',
    'A Demonstração das Variações Patrimoniais (DVP) evidencia as alterações patrimoniais e indica o resultado patrimonial do exercício. O Balanço Orçamentário compara previsão e execução orçamentária; o Balanço Financeiro trata de fluxos financeiros; e o Balanço Patrimonial apresenta a posição patrimonial.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.4.2.2, subitem 3; Manual de Contabilidade Aplicada ao Setor Público (MCASP), 11ª edição, Parte V; Lei Federal nº 4.320/1964, art. 104. Questão autoral Nortis.',
    40130
  ),
  (
    'ciencias-contabeis-401',
    '4-orcamento-publico-administracao-financeira-e-orcamentaria-afo',
    'diagnostico-ciencias-contabeis-liquidacao-despesa',
    'Após a entrega de um material contratado, a Administração verifica o direito adquirido pelo credor, a importância exata e os documentos comprobatórios. A qual estágio da despesa pública corresponde esse procedimento?',
    'O procedimento corresponde à liquidação, estágio em que se verifica o direito adquirido pelo credor com base nos títulos e documentos comprobatórios. O empenho antecede a realização da despesa, e o pagamento ocorre somente depois da regular liquidação e da ordem de pagamento.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.4.2.2, subitem 4; Lei Federal nº 4.320/1964, arts. 58 e 62 a 64; MCASP, 11ª edição, Parte I. Questão autoral Nortis.',
    40140
  ),
  (
    'ciencias-contabeis-401',
    '5-auditoria-contabil-e-governamental',
    'diagnostico-ciencias-contabeis-papeis-trabalho',
    'Ao revisar uma auditoria governamental, o supervisor precisa compreender o trabalho executado, as evidências obtidas e as conclusões alcançadas. Qual prática atende às Normas de Auditoria do TCU?',
    'Os papéis de trabalho devem documentar o trabalho de forma completa e suficientemente detalhada para permitir que um auditor experiente compreenda o planejamento, os procedimentos, as evidências, os achados e as conclusões. Relatos apenas verbais ou o relatório final isolado não substituem essa documentação.',
    'Edital SEDES-DF nº 1/2026 atualizado, item 20.2.4.2.2, subitem 5; Tribunal de Contas da União, Normas de Auditoria do TCU, itens 109 a 112; Manual de Auditoria Financeira do TCU. Questão autoral Nortis.',
    40150
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
  ('diagnostico-ciencias-contabeis-passivo-adiantamento','A','Ativo, porque todo ingresso de caixa representa um recurso econômico sem obrigação correspondente.',10),
  ('diagnostico-ciencias-contabeis-passivo-adiantamento','B','Receita integral, porque o recebimento ocorreu antes da prestação do serviço.',20),
  ('diagnostico-ciencias-contabeis-passivo-adiantamento','C','Passivo, porque existe obrigação presente de transferir recurso econômico mediante a prestação futura do serviço.',30),
  ('diagnostico-ciencias-contabeis-passivo-adiantamento','D','Patrimônio líquido, porque o adiantamento pertence definitivamente aos proprietários.',40),
  ('diagnostico-ciencias-contabeis-liquidez-corrente','A','0,67; a entidade possui R$ 0,67 em ativos de curto prazo para cada R$ 1,00 em obrigações de curto prazo.',10),
  ('diagnostico-ciencias-contabeis-liquidez-corrente','B','1,50; há R$ 1,50 em ativos de curto prazo para cada R$ 1,00 em obrigações de curto prazo, mas o índice isolado não comprova segurança financeira global.',20),
  ('diagnostico-ciencias-contabeis-liquidez-corrente','C','R$ 120.000; esse valor é o índice de liquidez corrente e comprova rentabilidade operacional.',30),
  ('diagnostico-ciencias-contabeis-liquidez-corrente','D','1,50; qualquer índice superior a 1 comprova, sozinho, ausência de riscos financeiros.',40),
  ('diagnostico-ciencias-contabeis-dvp-resultado-patrimonial','A','Balanço Orçamentário.',10),
  ('diagnostico-ciencias-contabeis-dvp-resultado-patrimonial','B','Balanço Financeiro.',20),
  ('diagnostico-ciencias-contabeis-dvp-resultado-patrimonial','C','Balanço Patrimonial.',30),
  ('diagnostico-ciencias-contabeis-dvp-resultado-patrimonial','D','Demonstração das Variações Patrimoniais.',40),
  ('diagnostico-ciencias-contabeis-liquidacao-despesa','A','Empenho.',10),
  ('diagnostico-ciencias-contabeis-liquidacao-despesa','B','Liquidação.',20),
  ('diagnostico-ciencias-contabeis-liquidacao-despesa','C','Pagamento.',30),
  ('diagnostico-ciencias-contabeis-liquidacao-despesa','D','Inscrição em restos a pagar.',40),
  ('diagnostico-ciencias-contabeis-papeis-trabalho','A','Preparar documentação completa e detalhada o suficiente para que auditor experiente compreenda o trabalho, as evidências e as conclusões.',10),
  ('diagnostico-ciencias-contabeis-papeis-trabalho','B','Manter apenas explicações verbais da equipe, evitando registros que possam ser revistos posteriormente.',20),
  ('diagnostico-ciencias-contabeis-papeis-trabalho','C','Arquivar somente o relatório final, pois os procedimentos e as evidências não integram a documentação da auditoria.',30),
  ('diagnostico-ciencias-contabeis-papeis-trabalho','D','Eliminar os papéis de trabalho após a emissão do relatório para reduzir o volume documental.',40)
)
insert into public.question_options(question_id, label, option_text, sort_order)
select question.id, seed.label, seed.option_text, seed.sort_order
from option_seed seed
join public.questions question on question.slug = seed.question_slug
on conflict (question_id, label) do update set
  option_text = excluded.option_text,
  sort_order = excluded.sort_order;

with solution_seed(question_slug, correct_label) as (values
  ('diagnostico-ciencias-contabeis-passivo-adiantamento','C'),
  ('diagnostico-ciencias-contabeis-liquidez-corrente','B'),
  ('diagnostico-ciencias-contabeis-dvp-resultado-patrimonial','D'),
  ('diagnostico-ciencias-contabeis-liquidacao-despesa','B'),
  ('diagnostico-ciencias-contabeis-papeis-trabalho','A')
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
