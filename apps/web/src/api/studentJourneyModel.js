const LOW_ACCURACY = 60;
const STABLE_ACCURACY = 75;

function safePercent(part, total) {
  if (!total) return 0;
  return Math.round((Number(part || 0) / Number(total || 0)) * 100);
}

function uniqueBy(items, getKey) {
  const seen = new Set();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function statusFromAccuracy(accuracy, answered) {
  if (!answered) return 'collecting';
  if (accuracy < LOW_ACCURACY) return 'weak';
  if (accuracy < STABLE_ACCURACY) return 'attention';
  return 'stable';
}

function labelForStatus(status) {
  return {
    weak: 'Reforçar agora',
    attention: 'Manter em revisão',
    stable: 'Estável',
    collecting: 'Coletando evidências',
  }[status] ?? 'Coletando evidências';
}

export function buildSmartReviewQueue({ progress = null, simulations = [], limit = 8 } = {}) {
  const questionReviews = (progress?.review ?? []).map((attempt) => ({
    id: `question-${attempt.question_id}`,
    kind: attempt.attempt_context === 'diagnostic' ? 'diagnostic' : 'practice',
    title: attempt.questions?.statement ?? 'Questão para revisar',
    subtitle: attempt.questions?.syllabus_nodes?.title ?? 'Conteúdo geral',
    route: '/minha-conta/progresso',
    evidence: 'Erro mais recente nesta questão',
    occurredAt: attempt.answered_at,
    priority: 3,
  }));

  const simulationReviews = (simulations ?? [])
    .filter((session) => session.status === 'completed' && Number(session.question_count || 0) > 0)
    .map((session) => ({
      ...session,
      accuracy: safePercent(session.correct_count, session.question_count),
    }))
    .filter((session) => session.accuracy < STABLE_ACCURACY)
    .map((session) => ({
      id: `simulation-${session.id}`,
      kind: 'simulation',
      title: session.simulations?.title ?? 'Simulado concluído',
      subtitle: `${session.correct_count ?? 0}/${session.question_count ?? 0} acertos`,
      route: '/minha-conta/simulados',
      evidence: `Resultado abaixo de ${STABLE_ACCURACY}% no simulado`,
      occurredAt: session.completed_at ?? session.started_at,
      priority: session.accuracy < LOW_ACCURACY ? 2 : 1,
    }));

  return uniqueBy([...questionReviews, ...simulationReviews]
    .sort((left, right) =>
      right.priority - left.priority ||
      String(right.occurredAt ?? '').localeCompare(String(left.occurredAt ?? ''))
    ), (item) => item.id).slice(0, limit);
}

export function buildSubjectPerformance({ progress = null, planItems = [] } = {}) {
  const plannedByTitle = new Map();
  (planItems ?? []).forEach((item) => {
    const title = item.syllabus_nodes?.title;
    if (!title) return;
    const current = plannedByTitle.get(title) ?? { planned: 0, completed: 0, minutes: 0 };
    current.planned += 1;
    if (item.completed) current.completed += 1;
    current.minutes += Number(item.duration_minutes || 0);
    plannedByTitle.set(title, current);
  });

  return (progress?.contentDiagnosis ?? []).map((item) => {
    const plan = plannedByTitle.get(item.title) ?? { planned: 0, completed: 0, minutes: 0 };
    const status = statusFromAccuracy(item.accuracy, item.answered);
    return {
      ...item,
      status,
      label: labelForStatus(status),
      plannedTasks: plan.planned,
      completedTasks: plan.completed,
      plannedMinutes: plan.minutes,
    };
  }).sort((left, right) =>
    ['weak', 'attention', 'collecting', 'stable'].indexOf(left.status) -
    ['weak', 'attention', 'collecting', 'stable'].indexOf(right.status) ||
    left.accuracy - right.accuracy ||
    right.answered - left.answered
  );
}

export function buildGuidedSedesJourney({
  hasActiveEnrollment = false,
  profile = null,
  progress = null,
  planItems = [],
  essayThemes = [],
  flashcardDecks = [],
} = {}) {
  const hasSpecialty = Boolean(profile?.target_role && profile?.target_specialty_id);
  const hasDiagnostic = Number(progress?.answered || 0) > 0;
  const hasPlan = (planItems ?? []).length > 0;
  const hasReview = (progress?.review ?? []).length > 0;
  const hasSimulation = Number(progress?.completedSimulations || 0) > 0;
  const hasEssayTheme = (essayThemes ?? []).length > 0;
  const hasFlashcards = (flashcardDecks ?? []).some((deck) => (deck.flashcards ?? []).length > 0);

  const steps = [
    {
      id: 'access',
      title: 'Liberar acesso SEDES-DF',
      description: 'Entrada gratuita provisória ou matrícula ativa do produto.',
      route: '/materiais-gratuitos',
      cta: 'Liberar acesso',
      done: hasActiveEnrollment,
    },
    {
      id: 'profile',
      title: 'Definir cargo e especialidade',
      description: 'Filtra edital, questões, simulados e temas pelo seu alvo.',
      route: '/minha-conta/onboarding',
      cta: 'Configurar perfil',
      done: hasSpecialty,
    },
    {
      id: 'diagnostic',
      title: 'Fazer diagnóstico objetivo',
      description: 'Gera a primeira leitura dos pontos fortes e fracos.',
      route: '/minha-conta/diagnostico',
      cta: 'Iniciar diagnóstico',
      done: hasDiagnostic,
    },
    {
      id: 'plan',
      title: 'Montar plano semanal',
      description: 'Transforma diagnóstico, tempo real e autopercepção em rotina.',
      route: '/minha-conta/plano',
      cta: 'Gerar semana',
      done: hasPlan,
    },
    {
      id: 'practice',
      title: 'Resolver questões e revisar erros',
      description: 'Alimenta o caderno de erros e melhora a precisão por assunto.',
      route: hasReview ? '/minha-conta/progresso' : '/minha-conta/questoes',
      cta: hasReview ? 'Revisar erros' : 'Praticar questões',
      done: hasReview ? false : hasDiagnostic,
    },
    {
      id: 'simulation',
      title: 'Medir em simulado',
      description: 'Valida ritmo, atenção e desempenho em bloco de prova.',
      route: '/minha-conta/simulados',
      cta: 'Abrir simulados',
      done: hasSimulation,
    },
    {
      id: 'essay',
      title: 'Treinar discursiva',
      description: 'Pratica tema, rascunho e envio com separação do estudo objetivo.',
      route: '/minha-conta/tutor/redacao',
      cta: 'Ver temas',
      done: !hasEssayTheme,
      optional: true,
    },
    {
      id: 'flashcards',
      title: 'Revisar flashcards',
      description: 'Reforça memória por repetição, sem virar nota de desempenho.',
      route: '/minha-conta/flashcards',
      cta: 'Abrir flashcards',
      done: !hasFlashcards,
      optional: true,
    },
  ];

  const nextStep = steps.find((step) => !step.done && !step.optional) ?? steps.find((step) => !step.done) ?? steps.at(-1);

  return {
    steps,
    nextStep,
    completedRequired: steps.filter((step) => !step.optional && step.done).length,
    requiredTotal: steps.filter((step) => !step.optional).length,
  };
}

export function buildMaterialsLibrary({ enrollments = [] } = {}) {
  return (enrollments ?? []).map((enrollment) => {
    const modules = enrollment.modules ?? [];
    const groups = [
      {
        id: 'foundation',
        title: 'Base do concurso',
        modules: modules.filter((module) => ['material', 'edital'].includes(module.module_type)),
      },
      {
        id: 'practice',
        title: 'Prática e medição',
        modules: modules.filter((module) => ['questions', 'simulations', 'review', 'flashcards'].includes(module.module_type)),
      },
      {
        id: 'routine',
        title: 'Rotina e acompanhamento',
        modules: modules.filter((module) => ['plan', 'tutor', 'community', 'discursive'].includes(module.module_type)),
      },
    ].filter((group) => group.modules.length > 0);

    return {
      productId: enrollment.product_id,
      enrollmentId: enrollment.id,
      title: enrollment.products?.title ?? 'Produto liberado',
      status: enrollment.status,
      active: enrollment.status === 'active' &&
        (!enrollment.expires_at || new Date(enrollment.expires_at).getTime() > Date.now()),
      groups,
    };
  });
}

export function buildStudentJourneyState({
  enrollments = [],
  profile = null,
  progress = null,
  plan = null,
  essayThemes = [],
  flashcardDecks = [],
} = {}) {
  const activeEnrollments = (enrollments ?? []).filter((enrollment) =>
    enrollment.status === 'active' &&
    (!enrollment.expires_at || new Date(enrollment.expires_at).getTime() > Date.now())
  );
  const planItems = plan?.items ?? [];
  const simulations = progress?.simulationSessions ?? [];

  return {
    hasActiveEnrollment: activeEnrollments.length > 0,
    reviewQueue: buildSmartReviewQueue({ progress, simulations }),
    subjectPerformance: buildSubjectPerformance({ progress, planItems }),
    journey: buildGuidedSedesJourney({
      hasActiveEnrollment: activeEnrollments.length > 0,
      profile,
      progress,
      planItems,
      essayThemes,
      flashcardDecks,
    }),
    library: buildMaterialsLibrary({ enrollments }),
  };
}
