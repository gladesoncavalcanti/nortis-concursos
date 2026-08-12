const DAY = 86400000;
const MIN_TASK_MINUTES = 15;
const TASK_STEP_MINUTES = 5;

function fitPrioritiesToBudget(priorities, weeklyBudgetMinutes) {
  if (weeklyBudgetMinutes === null || weeklyBudgetMinutes === undefined) return priorities;
  const budget = Math.max(0, Math.floor(Number(weeklyBudgetMinutes) / TASK_STEP_MINUTES) * TASK_STEP_MINUTES);
  const taskCount = Math.min(
    priorities.length,
    Math.floor(budget / MIN_TASK_MINUTES),
    Math.max(1, Math.ceil(budget / 30))
  );
  if (!taskCount) return [];

  let remaining = budget;
  return priorities.slice(0, taskCount).map(([title, requestedMinutes], index) => {
    const remainingTasks = taskCount - index - 1;
    const availableForTask = remaining - (remainingTasks * MIN_TASK_MINUTES);
    const duration = Math.max(
      MIN_TASK_MINUTES,
      Math.floor(Math.min(requestedMinutes, availableForTask) / TASK_STEP_MINUTES) * TASK_STEP_MINUTES
    );
    remaining -= duration;
    return [title, duration];
  });
}

export function buildSuggestedStudyItems({
  profile,
  progress,
  objectiveWeakSubjects = [],
  selfReportedWeakSubjects = [],
  startDate = new Date(),
  endDate = null,
  weeklyBudgetMinutes,
}) {
  const minutes = Math.max(30, Math.min(profile?.daily_minutes ?? 45, 180));
  const short = Math.max(15, Math.round(minutes / 2));
  const priorities = [];
  if (progress?.review?.length) priorities.push(['Revisar questões com erro', short]);
  if (objectiveWeakSubjects.length) priorities.push([`Reforçar por desempenho: ${objectiveWeakSubjects[0]}`, minutes]);
  const objectiveSet = new Set(objectiveWeakSubjects);
  const perceived = selfReportedWeakSubjects.filter((title) => !objectiveSet.has(title));
  if (perceived.length) priorities.push([`Revisar por autoavaliação: ${perceived[0]}`, minutes]);
  if (!objectiveWeakSubjects.length && !perceived.length) {
    if (profile?.primary_difficulty === 'redacao') priorities.push(['Praticar produção discursiva', minutes]);
    else if (profile?.primary_difficulty === 'legislacao') priorities.push(['Revisar legislação prioritária', minutes]);
    else priorities.push(['Revisar conteúdo prioritário', minutes]);
  }
  objectiveWeakSubjects.slice(1, 3).forEach((title) => priorities.push([`Reforçar por desempenho: ${title}`, minutes]));
  perceived.slice(1, 3).forEach((title) => priorities.push([`Revisar por autoavaliação: ${title}`, minutes]));
  priorities.push(['Resolver questões do conteúdo estudado', minutes], ['Revisar flashcards programados', short]);
  if ((progress?.answered ?? 0) >= 5) priorities.push(['Realizar simulado e analisar o resultado', Math.min(180, minutes + 30)]);

  const uniquePriorities = [...new Map(priorities.map((item) => [item[0], item])).values()].slice(0, 5);
  const lastDate = endDate ? new Date(`${endDate}T12:00:00`) : null;
  return fitPrioritiesToBudget(uniquePriorities, weeklyBudgetMinutes)
    .map(([title, duration_minutes], index) => {
      const suggestedDate = new Date(startDate.getTime() + index * DAY);
      const scheduledDate = lastDate && suggestedDate > lastDate ? lastDate : suggestedDate;
      return {
        title,
        duration_minutes,
        scheduled_date: scheduledDate.toISOString().slice(0, 10),
      };
    });
}
