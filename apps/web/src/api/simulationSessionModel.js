export function findOpenSimulationSession(sessions = [], simulationId) {
  return [...sessions]
    .filter((session) => session.simulation_id === simulationId && session.status === 'in_progress')
    .sort((left, right) =>
      String(right.started_at).localeCompare(String(left.started_at))
      || String(right.id).localeCompare(String(left.id))
    )[0] ?? null;
}

export function buildSavedSimulationAnswers(answers = [], sessionId) {
  return Object.fromEntries(
    answers
      .filter((answer) => answer.session_id === sessionId)
      .map((answer) => [answer.question_id, answer.selected_option_id])
  );
}

export function getSimulationRemainingSeconds(startedAt, timeLimitMinutes, now = new Date()) {
  if (!timeLimitMinutes) return null;
  const startedMs = new Date(startedAt).getTime();
  if (!Number.isFinite(startedMs)) return 0;
  const deadlineMs = startedMs + Number(timeLimitMinutes) * 60 * 1000;
  return Math.max(0, Math.ceil((deadlineMs - now.getTime()) / 1000));
}

export function formatSimulationTime(seconds) {
  if (seconds === null) return 'Sem limite de tempo';
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

export function buildSimulationReportCard(sessions = [], simulationId) {
  const completed = sessions
    .filter((session) => session.simulation_id === simulationId && session.status === 'completed')
    .sort((left, right) =>
      String(right.completed_at ?? '').localeCompare(String(left.completed_at ?? ''))
      || String(right.id ?? '').localeCompare(String(left.id ?? ''))
    );

  const latest = completed[0] ?? null;
  const previous = completed[1] ?? null;
  const accuracy = latest?.question_count
    ? Math.round((Number(latest.correct_count || 0) / Number(latest.question_count || 0)) * 100)
    : null;
  const previousAccuracy = previous?.question_count
    ? Math.round((Number(previous.correct_count || 0) / Number(previous.question_count || 0)) * 100)
    : null;
  const delta = accuracy !== null && previousAccuracy !== null ? accuracy - previousAccuracy : null;

  const status = accuracy === null
    ? 'not_started'
    : accuracy < 60
      ? 'reinforce'
      : accuracy < 75
        ? 'attention'
        : 'stable';

  return {
    attempts: completed.length,
    latest,
    accuracy,
    previousAccuracy,
    delta,
    status,
    history: completed.slice(0, 5),
  };
}
