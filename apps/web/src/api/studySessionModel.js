export function getStudySessionElapsedSeconds(startedAt, now = new Date()) {
  const started = new Date(startedAt).getTime();
  const current = new Date(now).getTime();
  if (!Number.isFinite(started) || !Number.isFinite(current) || current <= started) return 0;
  return Math.floor((current - started) / 1000);
}

export function formatStudySessionDuration(totalSeconds) {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}

export function getStudySessionWindowStart(now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekday = start.getDay() || 7;
  start.setDate(start.getDate() - weekday + 1);
  return start.toISOString();
}

export function getStudySessionHistoryWindowStart(now = new Date(), weekCount = 8) {
  const start = new Date(getStudySessionWindowStart(now));
  const safeWeekCount = Math.min(12, Math.max(1, Math.floor(Number(weekCount) || 8)));
  start.setDate(start.getDate() - ((safeWeekCount - 1) * 7));
  return start.toISOString();
}
