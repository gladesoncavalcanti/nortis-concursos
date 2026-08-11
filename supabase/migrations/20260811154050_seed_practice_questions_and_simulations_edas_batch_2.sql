-- Amplia o Banco de Questões e os simulados para o segundo lote EDAS,
-- reutilizando integralmente o motor e as regras de acesso existentes.
with practice_seed(
  specialty_slug, subject_slug, question_slug, statement,
  explanation, source_reference, sort_order
) as (values
  (
    'direito-e-legislacao-403',
    '1-direito-civil',
    'pratica-direito-legislacao-boa-fe-contratual',
    'Durante a execução de um contrato, uma parte descobre informação relevante para o cumprimento da obrigação, mas a oculta para obter vantagem sobre a outra. Qual dever contratual é diretamente violado?',
    'A boa-fé objetiva exige conduta leal, cooperação e observância de deveres anexos, como informar fatos relevantes para a execução do contrato. Ocultar deliberadamente a informação para obter vantagem é incompatível com esse padrão de conduta.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.4, subitem 1; Código Civil (Lei Federal nº 10.406/2002), arts. 421 e 422. Questão autoral Nortis.',
    22310
  ),
  (
    'direito-e-legislacao-403',
    '2-direito-processual-civil',
    'pratica-direito-legislacao-onus-prova',
    'Em ação de cobrança, o autor afirma que prestou o serviço contratado, enquanto o réu sustenta que já efetuou o pagamento. Pela regra geral do Código de Processo Civil, como se distribui o ônus da prova?',
    'Cabe ao autor provar o fato constitutivo de seu direito, isto é, a prestação que fundamenta a cobrança. Ao réu cabe provar o fato extintivo alegado, no caso, o pagamento, sem prejuízo das hipóteses legais de distribuição diversa por decisão fundamentada.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.4, subitem 2; Código de Processo Civil (Lei Federal nº 13.105/2015), art. 373, incisos I e II. Questão autoral Nortis.',
    22320
  ),
  (
    'direito-e-legislacao-403',
    '3-direito-constitucional',
    'pratica-direito-legislacao-principios-administracao',
    'Um órgão público divulga seus critérios de atendimento, aplica-os igualmente aos usuários e busca reduzir o tempo do serviço. Quais princípios constitucionais aparecem, respectivamente, nessas três condutas?',
    'A divulgação dos critérios concretiza a publicidade; a aplicação igual, sem favorecimentos pessoais, concretiza a impessoalidade; e a busca por melhor resultado e menor demora se relaciona à eficiência.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.4, subitem 3; Constituição da República Federativa do Brasil de 1988, art. 37, caput. Questão autoral Nortis.',
    22330
  ),
  (
    'direito-e-legislacao-403',
    '4-direito-administrativo',
    'pratica-direito-legislacao-objetivos-licitacao',
    'Ao planejar uma licitação, a Administração compara propostas considerando o resultado da contratação e o ciclo de vida do objeto, além de assegurar tratamento isonômico aos licitantes. Essa conduta atende a quais objetivos legais?',
    'A Lei nº 14.133/2021 estabelece como objetivos do processo licitatório selecionar a proposta apta a gerar o resultado mais vantajoso, inclusive quanto ao ciclo de vida do objeto, e assegurar tratamento isonômico e justa competição.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.4, subitem 4; Lei Federal nº 14.133/2021, art. 11, incisos I e II. Questão autoral Nortis.',
    22340
  ),
  (
    'direito-e-legislacao-403',
    '5-direito-financeiro',
    'pratica-direito-legislacao-credito-suplementar',
    'Durante a execução do orçamento, uma dotação existente torna-se insuficiente para concluir uma atividade já prevista. Qual crédito adicional é destinado a reforçar essa dotação?',
    'O crédito suplementar reforça dotação orçamentária existente. O crédito especial atende despesa sem dotação específica, e o extraordinário se destina às despesas urgentes e imprevistas previstas em lei.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.4, subitem 5; Lei Federal nº 4.320/1964, arts. 40 e 41. Questão autoral Nortis.',
    22350
  ),
  (
    'direito-e-legislacao-403',
    '6-transparencia-e-protecao-de-dados',
    'pratica-direito-legislacao-informacao-atualizada',
    'Ao responder a um pedido de acesso, o órgão entrega apenas um resumo antigo, embora possua o registro original atualizado. Segundo a Lei de Acesso à Informação, qual providência é adequada?',
    'O acesso compreende o direito de obter informação primária, íntegra, autêntica e atualizada. Havendo o registro original atualizado e inexistindo restrição legal aplicável, entregar apenas resumo antigo não satisfaz esse dever.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.4, subitem 6; Lei Federal nº 12.527/2011, art. 7º, inciso IV. Questão autoral Nortis.',
    22360
  ),
  (
    'economia-404',
    '1-teoria-economica-microeconomia-e-macroeconomia',
    'pratica-economia-externalidade-negativa',
    'Uma fábrica reduz seu custo privado ao lançar poluentes, mas impõe custos de saúde a moradores que não participam da transação. Como a teoria econômica classifica esse efeito?',
    'Trata-se de externalidade negativa: parte do custo social da atividade recai sobre terceiros e não é incorporada ao custo privado do produtor. Essa divergência entre custos privados e sociais caracteriza uma falha de mercado.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.5, subitem 1; Instituto de Pesquisa Econômica Aplicada (Ipea), Economia do Setor Público no Brasil, capítulo sobre falhas de mercado e externalidades. Questão autoral Nortis.',
    22410
  ),
  (
    'economia-404',
    '2-economia-do-setor-publico',
    'pratica-economia-capacidade-contributiva',
    'Ao instituir imposto de caráter pessoal, o legislador considera, sempre que possível, os rendimentos e o patrimônio do contribuinte. Qual diretriz constitucional orienta essa escolha?',
    'A Constituição determina que, sempre que possível, os impostos tenham caráter pessoal e sejam graduados segundo a capacidade econômica do contribuinte. A diretriz busca ajustar a carga tributária à capacidade contributiva revelada.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.5, subitem 2; Constituição da República Federativa do Brasil de 1988, art. 145, § 1º. Questão autoral Nortis.',
    22420
  ),
  (
    'economia-404',
    '3-economia-social',
    'pratica-economia-pobreza-multidimensional',
    'Duas famílias têm a mesma renda monetária, mas uma delas não tem acesso adequado a saneamento, educação e moradia. Qual abordagem permite captar melhor essa diferença?',
    'A pobreza multidimensional considera restrições em dimensões fundamentais da vida, combinando indicadores monetários e não monetários conforme a metodologia adotada. Por isso, pode distinguir situações que uma medida apenas de renda trataria como iguais.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.5, subitem 3; Instituto Brasileiro de Geografia e Estatística (IBGE), Síntese de Indicadores Sociais, conceitos e métodos sobre pobreza monetária e multidimensional. Questão autoral Nortis.',
    22430
  ),
  (
    'educador-social-405',
    '1-fundamentos-da-politica-social-e-dinamica-familiar',
    'pratica-educador-social-territorializacao',
    'Uma equipe do SUAS analisa onde se concentram vulnerabilidades, serviços, redes de apoio e barreiras de acesso antes de organizar suas ações. Qual diretriz está sendo aplicada?',
    'A territorialização organiza a oferta socioassistencial a partir das características, riscos, vulnerabilidades, potencialidades e redes existentes em cada território. Ela aproxima o planejamento das condições concretas vividas pelas famílias.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.6, subitem 1; Ministério do Desenvolvimento Social, Política Nacional de Assistência Social (PNAS/2004) e NOB/SUAS, diretriz de territorialização. Questão autoral Nortis.',
    22510
  ),
  (
    'educador-social-405',
    '2-a-pratica-socioeducativa-nos-servicos-do-suas',
    'pratica-educador-social-atribuicoes-scfv',
    'No Serviço de Convivência e Fortalecimento de Vínculos, qual atividade é compatível com a atuação do educador ou orientador social?',
    'O educador ou orientador social atua diretamente com os grupos, organiza e facilita oficinas e atividades coletivas, acompanha participantes e registra a assiduidade, em articulação com a equipe técnica. Diagnósticos e atribuições privativas de profissões regulamentadas não lhe são transferidos.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.6, subitem 2; Ministério do Desenvolvimento Social, cartilha Orientações Técnicas sobre o PAIF e articulação PAIF-SCFV; Resolução CNAS nº 9/2014. Questão autoral Nortis.',
    22520
  ),
  (
    'educador-social-405',
    '3-metodologia-do-trabalho-social-e-abordagem',
    'pratica-educador-social-registro-acompanhamento',
    'Após uma atividade socioeducativa, a equipe precisa avaliar o percurso e planejar os próximos encontros. Qual registro favorece esse acompanhamento?',
    'O registro deve ser objetivo e relacionado à finalidade do acompanhamento, indicando atividade realizada, participação, situações relevantes, encaminhamentos e pontos para avaliação. Julgamentos pessoais e exposição de informações desnecessárias não qualificam o trabalho social.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.6, subitem 3; Ministério do Desenvolvimento Social, Orientações Técnicas sobre o PAIF, volume 2, seções sobre planejamento, registro, monitoramento e avaliação. Questão autoral Nortis.',
    22530
  ),
  (
    'educador-social-405',
    '4-temas-contemporaneos-e-diretrizes-internacionais',
    'pratica-educador-social-acolhimento-excepcional',
    'Uma equipe avalia manter indefinidamente uma criança em acolhimento apenas porque a família enfrenta pobreza. Qual orientação técnica deve prevalecer?',
    'O acolhimento é medida protetiva excepcional e provisória, não solução permanente para a pobreza. O atendimento deve preservar vínculos quando possível e articular ações para reintegração familiar ou, quando isso não for viável, para colocação em família substituta conforme a proteção integral.',
    'Edital SEDES-DF nº 1/2026, atualizado pelos Editais nº 2 e nº 3, item 20.2.4.2.6, subitem 4; Resolução Conjunta CNAS/CONANDA nº 1/2009, Orientações Técnicas: Serviços de Acolhimento para Crianças e Adolescentes. Questão autoral Nortis.',
    22540
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
  active = excluded.active;

with option_seed(question_slug, label, option_text, sort_order) as (values
  ('pratica-direito-legislacao-boa-fe-contratual','A','O dever de publicidade administrativa, aplicável a todo contrato privado.',10),
  ('pratica-direito-legislacao-boa-fe-contratual','B','A boa-fé objetiva, que exige lealdade e cooperação na execução contratual.',20),
  ('pratica-direito-legislacao-boa-fe-contratual','C','A liberdade contratual absoluta, que autoriza ocultar informações estratégicas.',30),
  ('pratica-direito-legislacao-boa-fe-contratual','D','A prescrição, que extingue imediatamente qualquer obrigação de informar.',40),
  ('pratica-direito-legislacao-onus-prova','A','O réu deve provar tanto a prestação do serviço quanto o pagamento.',10),
  ('pratica-direito-legislacao-onus-prova','B','O autor deve provar todos os fatos, inclusive o pagamento alegado pelo réu.',20),
  ('pratica-direito-legislacao-onus-prova','C','O autor prova a prestação constitutiva; o réu prova o pagamento extintivo.',30),
  ('pratica-direito-legislacao-onus-prova','D','Nenhuma parte tem ônus probatório, pois ele pertence sempre ao juiz.',40),
  ('pratica-direito-legislacao-principios-administracao','A','Publicidade, impessoalidade e eficiência.',10),
  ('pratica-direito-legislacao-principios-administracao','B','Moralidade, legalidade e publicidade.',20),
  ('pratica-direito-legislacao-principios-administracao','C','Eficiência, publicidade e legalidade.',30),
  ('pratica-direito-legislacao-principios-administracao','D','Impessoalidade, moralidade e legalidade.',40),
  ('pratica-direito-legislacao-objetivos-licitacao','A','Permitir preferência pessoal do gestor e afastar a competição.',10),
  ('pratica-direito-legislacao-objetivos-licitacao','B','Escolher apenas o menor preço nominal, sem considerar o resultado.',20),
  ('pratica-direito-legislacao-objetivos-licitacao','C','Dispensar planejamento sempre que existirem várias propostas.',30),
  ('pratica-direito-legislacao-objetivos-licitacao','D','Buscar o resultado mais vantajoso e assegurar isonomia e justa competição.',40),
  ('pratica-direito-legislacao-credito-suplementar','A','Crédito extraordinário.',10),
  ('pratica-direito-legislacao-credito-suplementar','B','Crédito suplementar.',20),
  ('pratica-direito-legislacao-credito-suplementar','C','Crédito especial.',30),
  ('pratica-direito-legislacao-credito-suplementar','D','Restos a pagar.',40),
  ('pratica-direito-legislacao-informacao-atualizada','A','Manter apenas o resumo antigo, porque todo documento original é sigiloso.',10),
  ('pratica-direito-legislacao-informacao-atualizada','B','Negar o pedido sem fundamentação, mesmo inexistindo restrição legal.',20),
  ('pratica-direito-legislacao-informacao-atualizada','C','Fornecer informação primária, íntegra, autêntica e atualizada.',30),
  ('pratica-direito-legislacao-informacao-atualizada','D','Alterar o registro original para que coincida com o resumo entregue.',40),
  ('pratica-economia-externalidade-negativa','A','Bem público puro.',10),
  ('pratica-economia-externalidade-negativa','B','Externalidade negativa.',20),
  ('pratica-economia-externalidade-negativa','C','Economia de escala interna.',30),
  ('pratica-economia-externalidade-negativa','D','Informação perfeitamente simétrica.',40),
  ('pratica-economia-capacidade-contributiva','A','Capacidade contributiva.',10),
  ('pratica-economia-capacidade-contributiva','B','Sigilo absoluto do orçamento.',20),
  ('pratica-economia-capacidade-contributiva','C','Uniformidade obrigatória de todos os tributos.',30),
  ('pratica-economia-capacidade-contributiva','D','Vedação constitucional à progressividade.',40),
  ('pratica-economia-pobreza-multidimensional','A','Somente o valor nominal da renda mensal.',10),
  ('pratica-economia-pobreza-multidimensional','B','Apenas a média de renda do município.',20),
  ('pratica-economia-pobreza-multidimensional','C','Exclusivamente o preço de um único bem de consumo.',30),
  ('pratica-economia-pobreza-multidimensional','D','Pobreza multidimensional, com restrições monetárias e não monetárias.',40),
  ('pratica-educador-social-territorializacao','A','Centralização indiferente às características locais.',10),
  ('pratica-educador-social-territorializacao','B','Territorialização da política de assistência social.',20),
  ('pratica-educador-social-territorializacao','C','Substituição da rede pública por ações isoladas.',30),
  ('pratica-educador-social-territorializacao','D','Atendimento sem diagnóstico socioterritorial.',40),
  ('pratica-educador-social-atribuicoes-scfv','A','Emitir diagnóstico privativo de profissão regulamentada sem equipe técnica.',10),
  ('pratica-educador-social-atribuicoes-scfv','B','Decidir sozinho sobre o desligamento definitivo de todas as famílias.',20),
  ('pratica-educador-social-atribuicoes-scfv','C','Organizar oficinas, acompanhar participantes e articular-se com a equipe técnica.',30),
  ('pratica-educador-social-atribuicoes-scfv','D','Substituir integralmente o técnico de referência do CRAS.',40),
  ('pratica-educador-social-registro-acompanhamento','A','Registrar objetivamente atividades, participação, encaminhamentos e pontos de avaliação.',10),
  ('pratica-educador-social-registro-acompanhamento','B','Anotar opiniões pessoais sem relação com a finalidade do acompanhamento.',20),
  ('pratica-educador-social-registro-acompanhamento','C','Evitar qualquer registro para impedir avaliação posterior.',30),
  ('pratica-educador-social-registro-acompanhamento','D','Expor todos os dados familiares, mesmo os desnecessários à atividade.',40),
  ('pratica-educador-social-acolhimento-excepcional','A','Manter o acolhimento por prazo indeterminado como resposta automática à pobreza.',10),
  ('pratica-educador-social-acolhimento-excepcional','B','Romper todos os vínculos familiares sem avaliação individual.',20),
  ('pratica-educador-social-acolhimento-excepcional','C','Usar o acolhimento como punição por dificuldades materiais da família.',30),
  ('pratica-educador-social-acolhimento-excepcional','D','Tratar o acolhimento como excepcional e provisório, com trabalho pela convivência familiar.',40)
)
insert into public.question_options(question_id, label, option_text, sort_order)
select question.id, seed.label, seed.option_text, seed.sort_order
from option_seed seed
join public.questions question on question.slug = seed.question_slug
on conflict (question_id, label) do update set
  option_text = excluded.option_text,
  sort_order = excluded.sort_order;

with solution_seed(question_slug, correct_label) as (values
  ('pratica-direito-legislacao-boa-fe-contratual','B'),
  ('pratica-direito-legislacao-onus-prova','C'),
  ('pratica-direito-legislacao-principios-administracao','A'),
  ('pratica-direito-legislacao-objetivos-licitacao','D'),
  ('pratica-direito-legislacao-credito-suplementar','B'),
  ('pratica-direito-legislacao-informacao-atualizada','C'),
  ('pratica-economia-externalidade-negativa','B'),
  ('pratica-economia-capacidade-contributiva','A'),
  ('pratica-economia-pobreza-multidimensional','D'),
  ('pratica-educador-social-territorializacao','B'),
  ('pratica-educador-social-atribuicoes-scfv','C'),
  ('pratica-educador-social-registro-acompanhamento','A'),
  ('pratica-educador-social-acolhimento-excepcional','D')
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
    'direito-e-legislacao-403',
    'simulado-piloto-direito-e-legislacao',
    'Simulado piloto — Direito e Legislação',
    'Seis questões autorais da Nortis, uma por bloco específico do edital. Resultado pedagógico, sem equivalência com nota oficial.',
    10,
    40310
  ),
  (
    'economia-404',
    'simulado-piloto-economia',
    'Simulado piloto — Economia',
    'Três questões autorais da Nortis, uma por bloco específico do edital. Resultado pedagógico, sem equivalência com nota oficial.',
    10,
    40410
  ),
  (
    'educador-social-405',
    'simulado-piloto-educador-social',
    'Simulado piloto — Educador Social',
    'Quatro questões autorais da Nortis, uma por bloco específico do edital. Resultado pedagógico, sem equivalência com nota oficial.',
    10,
    40510
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
  ('simulado-piloto-direito-e-legislacao','pratica-direito-legislacao-boa-fe-contratual',10),
  ('simulado-piloto-direito-e-legislacao','pratica-direito-legislacao-onus-prova',20),
  ('simulado-piloto-direito-e-legislacao','pratica-direito-legislacao-principios-administracao',30),
  ('simulado-piloto-direito-e-legislacao','pratica-direito-legislacao-objetivos-licitacao',40),
  ('simulado-piloto-direito-e-legislacao','pratica-direito-legislacao-credito-suplementar',50),
  ('simulado-piloto-direito-e-legislacao','pratica-direito-legislacao-informacao-atualizada',60),
  ('simulado-piloto-economia','pratica-economia-externalidade-negativa',10),
  ('simulado-piloto-economia','pratica-economia-capacidade-contributiva',20),
  ('simulado-piloto-economia','pratica-economia-pobreza-multidimensional',30),
  ('simulado-piloto-educador-social','pratica-educador-social-territorializacao',10),
  ('simulado-piloto-educador-social','pratica-educador-social-atribuicoes-scfv',20),
  ('simulado-piloto-educador-social','pratica-educador-social-registro-acompanhamento',30),
  ('simulado-piloto-educador-social','pratica-educador-social-acolhimento-excepcional',40)
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
