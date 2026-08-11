import { buildWeeklyAdherence } from './weeklyAdherence.js';

function toLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDuePlanItem(items, todayKey) {
  return [...(items ?? [])]
    .filter((item) => !item.completed && /^\d{4}-\d{2}-\d{2}$/.test(item.scheduled_date))
    .filter((item) => item.scheduled_date <= todayKey)
    .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date) || a.title.localeCompare(b.title))[0];
}

export function buildNextBestAction({ progress, planItems = [], today = new Date() }) {
  const todayKey = toLocalDateKey(today);
  const adherence = buildWeeklyAdherence({ items: planItems, today });
  const dueItem = getDuePlanItem(planItems, todayKey);
  if (dueItem) {
    const overdueSummary = dueItem.scheduled_date < todayKey && adherence.overdueTasks > 0
      ? ` Há ${adherence.overdueTasks} ${adherence.overdueTasks === 1 ? 'tarefa atrasada' : 'tarefas atrasadas'} e ${adherence.remainingMinutes} minutos restantes nesta semana.`
      : '';
    return {
      kind: 'planned',
      eyebrow: dueItem.scheduled_date === todayKey ? 'Planejado para hoje' : 'Tarefa pendente',
      title: dueItem.title,
      description: `${dueItem.duration_minutes} minutos reservados no seu plano semanal.${overdueSummary}`,
      cta: 'Abrir plano semanal',
      route: '/minha-conta/plano',
    };
  }

  const pendingReviewCount = progress?.review?.length ?? 0;
  if (pendingReviewCount > 0) {
    return {
      kind: 'review',
      eyebrow: 'Prioridade por desempenho',
      title: `Revisar ${pendingReviewCount} ${pendingReviewCount === 1 ? 'questão pendente' : 'questões pendentes'}`,
      description: 'Refaça primeiro os erros recentes e confirme o aprendizado com uma nova tentativa.',
      cta: 'Iniciar revisão',
      route: '/minha-conta/progresso',
    };
  }

  if (!progress || progress.answered === 0) {
    return {
      kind: 'diagnostic',
      eyebrow: 'Primeiro diagnóstico',
      title: 'Descobrir seus pontos fortes e fracos',
      description: 'Responda ao diagnóstico da sua especialidade para orientar as próximas prioridades.',
      cta: 'Iniciar diagnóstico',
      route: '/minha-conta/diagnostico',
    };
  }

  if (progress.completedSimulations === 0 && progress.answered >= 5) {
    return {
      kind: 'simulation',
      eyebrow: 'Próxima evidência objetiva',
      title: 'Realizar seu primeiro simulado',
      description: 'Você já possui prática suficiente para medir o desempenho em um bloco mais amplo.',
      cta: 'Ver simulados',
      route: '/minha-conta/simulados',
    };
  }

  const hasOpenPlanItem = planItems.some((item) => !item.completed);
  if (!hasOpenPlanItem) {
    return {
      kind: 'plan',
      eyebrow: 'Organize a próxima semana',
      title: 'Gerar prioridades no plano de estudos',
      description: 'Use seu tempo disponível, autopercepção e desempenho objetivo para montar a semana.',
      cta: 'Atualizar plano semanal',
      route: '/minha-conta/plano',
    };
  }

  return {
    kind: 'practice',
    eyebrow: 'Mantenha o ritmo',
    title: 'Resolver um novo bloco de questões',
    description: 'Gere novas evidências de aprendizagem enquanto as próximas tarefas do plano não vencem.',
    cta: 'Abrir banco de questões',
    route: '/minha-conta/questoes',
  };
}
