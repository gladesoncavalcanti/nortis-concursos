function toLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getWeekBounds(today) {
  const day = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const weekday = day.getDay() || 7;
  const start = new Date(day);
  start.setDate(day.getDate() - weekday + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: toLocalDateKey(start), end: toLocalDateKey(end) };
}

const hasValidDate = (item) => /^\d{4}-\d{2}-\d{2}$/.test(item.scheduled_date);
const durationOf = (item) => Math.max(0, Number(item.duration_minutes) || 0);

function trackedSecondsInWeek(sessions, week) {
  return sessions.reduce((total, session) => {
    if (!session.ended_at || !Number.isFinite(Number(session.duration_seconds))) return total;
    const startedAt = new Date(session.started_at);
    if (Number.isNaN(startedAt.getTime())) return total;
    const dateKey = toLocalDateKey(startedAt);
    if (dateKey < week.start || dateKey > week.end) return total;
    return total + Math.max(0, Number(session.duration_seconds));
  }, 0);
}

export function filterPlanByActiveProducts(enrollments = [], items = [], now = new Date()) {
  const nowMs = now.getTime();
  const activeEnrollments = enrollments.filter((enrollment) =>
    enrollment.status === 'active' &&
    (!enrollment.expires_at || new Date(enrollment.expires_at).getTime() > nowMs)
  );
  const activeProductIds = new Set(activeEnrollments.map((enrollment) => enrollment.product_id));

  return {
    enrollments: activeEnrollments,
    items: items.filter((item) => activeProductIds.has(item.product_id)),
  };
}

function buildGuidance({ plannedTasks, adherencePercent, overdueTasks, remainingMinutes }) {
  if (plannedTasks === 0 && overdueTasks === 0) {
    return {
      status: 'empty',
      title: 'Planeje uma semana possível',
      description: 'Gere uma semana sugerida ou adicione tarefas compatíveis com o tempo que você realmente possui.',
    };
  }
  if (overdueTasks > 0) {
    return {
      status: 'attention',
      title: 'Replaneje antes de adicionar mais carga',
      description: remainingMinutes > 0
        ? `${overdueTasks} ${overdueTasks === 1 ? 'tarefa está atrasada' : 'tarefas estão atrasadas'}. Redistribua primeiro os ${remainingMinutes} minutos ainda pendentes nesta semana.`
        : `${overdueTasks} ${overdueTasks === 1 ? 'tarefa está atrasada' : 'tarefas estão atrasadas'}. Reencaixe essas pendências antes de adicionar mais carga.`,
    };
  }
  if (adherencePercent === 100) {
    return {
      status: 'complete',
      title: 'Semana concluída',
      description: 'Mantenha o ritmo e use o próximo diagnóstico para ajustar a semana seguinte.',
    };
  }
  if (adherencePercent >= 80) {
    return {
      status: 'on_track',
      title: 'Ritmo consistente',
      description: `Faltam ${remainingMinutes} minutos para concluir o que foi planejado nesta semana.`,
    };
  }
  if (adherencePercent >= 50) {
    return {
      status: 'adjust',
      title: 'Ajuste a carga restante',
      description: `Você concluiu mais da metade da semana. Redistribua os ${remainingMinutes} minutos restantes sem acumular tarefas.`,
    };
  }
  return {
    status: 'reinforce',
    title: 'Reduza a dispersão',
    description: `Concentre os ${remainingMinutes} minutos restantes nas tarefas de maior prioridade antes de ampliar o plano.`,
  };
}

export function buildWeeklyAdherence({ items = [], sessions = [], today = new Date() }) {
  const todayKey = toLocalDateKey(today);
  const week = getWeekBounds(today);
  const validItems = items.filter(hasValidDate);
  const weekItems = validItems.filter(
    (item) => item.scheduled_date >= week.start && item.scheduled_date <= week.end
  );
  const plannedMinutes = weekItems.reduce((total, item) => total + durationOf(item), 0);
  const completedItems = weekItems.filter((item) => item.completed);
  const completedMinutes = completedItems.reduce((total, item) => total + durationOf(item), 0);
  const overdueTasks = validItems.filter(
    (item) => !item.completed && item.scheduled_date < todayKey
  ).length;
  const remainingMinutes = Math.max(0, plannedMinutes - completedMinutes);
  const adherencePercent = plannedMinutes
    ? Math.min(100, Math.round((completedMinutes / plannedMinutes) * 100))
    : 0;
  const trackedSeconds = trackedSecondsInWeek(sessions, week);
  const trackedMinutes = Math.floor(trackedSeconds / 60);
  const timeAdherencePercent = plannedMinutes
    ? Math.min(100, Math.round((trackedMinutes / plannedMinutes) * 100))
    : 0;

  const result = {
    weekStart: week.start,
    weekEnd: week.end,
    plannedTasks: weekItems.length,
    completedTasks: completedItems.length,
    plannedMinutes,
    completedMinutes,
    trackedSeconds,
    trackedMinutes,
    timeAdherencePercent,
    adherencePercent,
    overdueTasks,
    remainingMinutes,
    manualTasks: weekItems.filter((item) => item.item_source !== 'suggested').length,
    suggestedTasks: weekItems.filter((item) => item.item_source === 'suggested').length,
  };

  return { ...result, guidance: buildGuidance(result) };
}
