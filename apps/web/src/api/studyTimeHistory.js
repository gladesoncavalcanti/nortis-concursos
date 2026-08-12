const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_WEEK_COUNT = 8;

function toLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfLocalDay(value) {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfLocalWeek(value) {
  const date = startOfLocalDay(value);
  const weekday = date.getDay() || 7;
  date.setDate(date.getDate() - weekday + 1);
  return date;
}

function addDays(value, amount) {
  const date = new Date(value);
  date.setDate(date.getDate() + amount);
  return date;
}

function normalizedRelation(value) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function validDurationSeconds(session) {
  if (!session?.ended_at) return null;
  const seconds = Number(session.duration_seconds);
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : null;
}

function sessionDateKey(session) {
  const date = new Date(session?.started_at);
  return Number.isNaN(date.getTime()) ? null : toLocalDateKey(date);
}

function buildWeeks(now, weekCount) {
  const currentStart = startOfLocalWeek(now);
  return Array.from({ length: weekCount }, (_, index) => {
    const weeksAgo = weekCount - index - 1;
    const start = addDays(currentStart, weeksAgo * -7);
    const end = addDays(start, 6);
    return {
      start: toLocalDateKey(start),
      end: toLocalDateKey(end),
      plannedMinutes: 0,
      completedMinutes: 0,
      plannedTasks: 0,
      completedTasks: 0,
      trackedSeconds: 0,
      trackedMinutes: 0,
      executionPercent: null,
    };
  });
}

function buildTrend(weeks) {
  const completedWeeks = weeks.slice(0, -1);
  const recent = completedWeeks.at(-1);
  const previous = completedWeeks.at(-2);
  if (!recent || !previous || (recent.trackedMinutes === 0 && previous.trackedMinutes === 0)) {
    return {
      status: 'collecting',
      title: 'Construindo histórico',
      description: 'Conclua sessões em semanas diferentes para acompanhar sua constância.',
      deltaMinutes: 0,
    };
  }

  const deltaMinutes = recent.trackedMinutes - previous.trackedMinutes;
  const tolerance = Math.max(5, Math.round(previous.trackedMinutes * 0.15));
  if (deltaMinutes > tolerance) {
    return {
      status: 'improving',
      title: 'Constância em evolução',
      description: `${deltaMinutes} minutos a mais na última semana concluída.`,
      deltaMinutes,
    };
  }
  if (deltaMinutes < -tolerance) {
    return {
      status: 'reinforce',
      title: 'Constância precisa de reforço',
      description: `${Math.abs(deltaMinutes)} minutos a menos na última semana concluída.`,
      deltaMinutes,
    };
  }
  return {
    status: 'stable',
    title: 'Constância estável',
    description: 'A variação entre as duas últimas semanas concluídas permaneceu pequena.',
    deltaMinutes,
  };
}

export function buildStudyTimeHistory({
  sessions = [],
  items = [],
  now = new Date(),
  weekCount = DEFAULT_WEEK_COUNT,
} = {}) {
  const safeWeekCount = Math.min(12, Math.max(3, Math.floor(Number(weekCount) || DEFAULT_WEEK_COUNT)));
  const weeks = buildWeeks(now, safeWeekCount);
  const periodStart = weeks[0].start;
  const periodEnd = weeks.at(-1).end;
  const itemById = new Map(items.filter((item) => item?.id).map((item) => [item.id, item]));

  items.filter((item) => DATE_KEY_PATTERN.test(item?.scheduled_date ?? '')).forEach((item) => {
    const week = weeks.find(({ start, end }) => item.scheduled_date >= start && item.scheduled_date <= end);
    if (!week) return;
    const duration = Math.max(0, Number(item.duration_minutes) || 0);
    week.plannedTasks += 1;
    week.plannedMinutes += duration;
    if (item.completed) {
      week.completedTasks += 1;
      week.completedMinutes += duration;
    }
  });

  const completedSessions = sessions.map((session) => ({
    ...session,
    dateKey: sessionDateKey(session),
    safeDurationSeconds: validDurationSeconds(session),
  })).filter((session) => session.dateKey
    && session.dateKey >= periodStart
    && session.dateKey <= periodEnd
    && session.safeDurationSeconds !== null);

  completedSessions.forEach((session) => {
    const week = weeks.find(({ start, end }) => session.dateKey >= start && session.dateKey <= end);
    if (week) week.trackedSeconds += session.safeDurationSeconds;
  });
  weeks.forEach((week) => {
    week.trackedMinutes = Math.floor(week.trackedSeconds / 60);
    week.executionPercent = week.plannedMinutes
      ? Math.round((week.trackedMinutes / week.plannedMinutes) * 100)
      : null;
  });

  const lastDay = startOfLocalDay(now);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(lastDay, index - 6);
    return { date: toLocalDateKey(date), trackedSeconds: 0, trackedMinutes: 0, sessions: 0 };
  });
  const dayByKey = new Map(days.map((day) => [day.date, day]));
  completedSessions.forEach((session) => {
    const day = dayByKey.get(session.dateKey);
    if (!day) return;
    day.trackedSeconds += session.safeDurationSeconds;
    day.sessions += 1;
  });
  days.forEach((day) => { day.trackedMinutes = Math.floor(day.trackedSeconds / 60); });

  const tasks = new Map();
  const contents = new Map();
  completedSessions.forEach((session) => {
    const embeddedItem = normalizedRelation(session.study_plan_items);
    const item = itemById.get(session.study_plan_item_id) ?? embeddedItem;
    const syllabusNode = normalizedRelation(item?.syllabus_nodes);
    const taskKey = item?.id ?? 'unlinked';
    const taskTitle = item?.title || 'Sessão sem tarefa vinculada';
    const contentTitle = syllabusNode?.title || 'Sem conteúdo vinculado';
    const task = tasks.get(taskKey) ?? {
      id: taskKey,
      title: taskTitle,
      contentTitle,
      plannedMinutes: Math.max(0, Number(item?.duration_minutes) || 0),
      trackedSeconds: 0,
      trackedMinutes: 0,
      sessions: 0,
    };
    task.trackedSeconds += session.safeDurationSeconds;
    task.sessions += 1;
    tasks.set(taskKey, task);

    const content = contents.get(contentTitle) ?? {
      title: contentTitle,
      trackedSeconds: 0,
      trackedMinutes: 0,
      sessions: 0,
      taskIds: new Set(),
    };
    content.trackedSeconds += session.safeDurationSeconds;
    content.sessions += 1;
    content.taskIds.add(taskKey);
    contents.set(contentTitle, content);
  });

  const taskGroups = [...tasks.values()].map((task) => ({
    ...task,
    trackedMinutes: Math.floor(task.trackedSeconds / 60),
  })).sort((left, right) => right.trackedSeconds - left.trackedSeconds || left.title.localeCompare(right.title));
  const contentGroups = [...contents.values()].map((content) => ({
    title: content.title,
    trackedSeconds: content.trackedSeconds,
    trackedMinutes: Math.floor(content.trackedSeconds / 60),
    sessions: content.sessions,
    tasks: content.taskIds.size,
  })).sort((left, right) => right.trackedSeconds - left.trackedSeconds || left.title.localeCompare(right.title));

  const totalTrackedSeconds = completedSessions.reduce((total, session) => total + session.safeDurationSeconds, 0);
  const totalPlannedMinutes = weeks.reduce((total, week) => total + week.plannedMinutes, 0);
  return {
    periodStart,
    periodEnd,
    weeks,
    days,
    taskGroups,
    contentGroups,
    totalTrackedSeconds,
    totalTrackedMinutes: Math.floor(totalTrackedSeconds / 60),
    totalPlannedMinutes,
    completedSessions: completedSessions.length,
    activeSessions: sessions.filter((session) => !session.ended_at).length,
    hasData: completedSessions.length > 0 || totalPlannedMinutes > 0,
    trend: buildTrend(weeks),
  };
}
