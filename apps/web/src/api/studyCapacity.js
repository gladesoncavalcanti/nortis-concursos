const DEFAULT_DAILY_MINUTES = 45;
const PROFILE_DAYS_PER_WEEK = 5;
const HISTORY_WEEK_LIMIT = 4;
const MIN_SUGGESTED_SESSION_MINUTES = 15;

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

const roundedToSession = (minutes) => Math.max(
  MIN_SUGGESTED_SESSION_MINUTES,
  Math.round(minutes / MIN_SUGGESTED_SESSION_MINUTES) * MIN_SUGGESTED_SESSION_MINUTES
);

const median = (values) => {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
};

const validDuration = (item) => Math.max(0, Number(item?.duration_minutes) || 0);

export function buildStudyCapacity({ profile, history, items = [], replaceSuggestedProductId = null } = {}) {
  const dailyMinutes = clamp(
    Math.round(Number(profile?.daily_minutes) || DEFAULT_DAILY_MINUTES),
    30,
    180
  );
  const profileWeeklyMinutes = dailyMinutes * PROFILE_DAYS_PER_WEEK;
  const currentWeek = history?.weeks?.at(-1) ?? null;
  const evidenceWeeks = (history?.weeks ?? [])
    .slice(0, -1)
    .filter((week) => Number(week?.trackedMinutes) > 0)
    .slice(-HISTORY_WEEK_LIMIT);
  const usesHistory = evidenceWeeks.length >= 2;
  const observedWeeklyMinutes = usesHistory
    ? roundedToSession(median(evidenceWeeks.map((week) => Number(week.trackedMinutes))))
    : null;
  const weeklyTargetMinutes = usesHistory
    ? Math.min(profileWeeklyMinutes, observedWeeklyMinutes)
    : profileWeeklyMinutes;
  const currentWeekItems = currentWeek
    ? items.filter((item) => item?.scheduled_date >= currentWeek.start
      && item?.scheduled_date <= currentWeek.end)
    : [];
  const manualMinutes = currentWeekItems
    .filter((item) => item?.item_source !== 'suggested')
    .reduce((total, item) => total + validDuration(item), 0);
  const preservedSuggestedMinutes = currentWeekItems
    .filter((item) => item?.item_source === 'suggested'
      && replaceSuggestedProductId
      && item?.product_id !== replaceSuggestedProductId)
    .reduce((total, item) => total + validDuration(item), 0);
  const committedMinutes = manualMinutes + preservedSuggestedMinutes;
  const remainingMinutes = Math.max(0, weeklyTargetMinutes - committedMinutes);

  return {
    source: usesHistory ? 'history' : 'profile',
    sampleWeeks: evidenceWeeks.length,
    dailyMinutes,
    profileWeeklyMinutes,
    observedWeeklyMinutes,
    weeklyTargetMinutes,
    manualMinutes,
    preservedSuggestedMinutes,
    committedMinutes,
    remainingMinutes,
    weekStart: currentWeek?.start ?? null,
    weekEnd: currentWeek?.end ?? null,
    minimumSuggestedSessionMinutes: MIN_SUGGESTED_SESSION_MINUTES,
    description: usesHistory
      ? `Carga baseada na mediana das últimas ${evidenceWeeks.length} semanas concluídas com tempo registrado, sem ultrapassar a disponibilidade informada no perfil.`
      : 'Enquanto não houver duas semanas concluídas com tempo registrado, a carga usa a disponibilidade informada no perfil.',
  };
}
