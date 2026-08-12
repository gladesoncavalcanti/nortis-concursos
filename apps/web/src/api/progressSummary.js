import { buildStudyTimeHistory } from './studyTimeHistory.js';

function calculateStreak(activityDates, today = new Date()) {
  const days = new Set(activityDates.filter(Boolean).map((value) => new Date(value).toISOString().slice(0, 10)));
  let cursor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const todayKey = cursor.toISOString().slice(0, 10);
  if (!days.has(todayKey)) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let streak = 0;
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

function activityEntry(type, occurredAt, label) {
  if (!occurredAt || Number.isNaN(new Date(occurredAt).getTime())) return null;
  return { type, occurredAt, label };
}

export function buildActivityHistory(attempts = [], sessions = [], flashcardReviews = [], planItems = [], today = new Date()) {
  const entries = [
    ...attempts.map((item) => activityEntry(
      'question',
      item.answered_at,
      `Questão respondida · ${item.questions?.syllabus_nodes?.title || 'Conteúdo geral'}`
    )),
    ...sessions.filter((item) => item.status === 'completed').map((item) => activityEntry(
      'simulation',
      item.completed_at,
      `Simulado concluído · ${item.simulations?.title || 'Simulado'}`
    )),
    ...flashcardReviews.map((item) => activityEntry('flashcard', item.last_reviewed_at, 'Flashcard revisado')),
    ...planItems.filter((item) => item.completed).map((item) => activityEntry(
      'plan',
      item.completed_at,
      `Tarefa concluída · ${item.title || 'Plano semanal'}`
    )),
  ].filter(Boolean).sort((left, right) =>
    new Date(right.occurredAt) - new Date(left.occurredAt)
  );

  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(end);
    date.setUTCDate(end.getUTCDate() - (6 - index));
    return {
      date: date.toISOString().slice(0, 10),
      total: 0,
      question: 0,
      simulation: 0,
      flashcard: 0,
      plan: 0,
    };
  });
  const byDate = new Map(days.map((day) => [day.date, day]));
  entries.forEach((entry) => {
    const day = byDate.get(new Date(entry.occurredAt).toISOString().slice(0, 10));
    if (!day) return;
    day.total += 1;
    day[entry.type] += 1;
  });

  return { days, recent: entries.slice(0, 10), activityDates: entries.map((entry) => entry.occurredAt) };
}

export function summarizeProgress(attempts, sessions, flashcardReviews = [], today = new Date(), planItems = [], studySessions = []) {
  const correctAttempts = attempts.filter((attempt) => attempt.is_correct).length;
  const accuracy = attempts.length ? Math.round((correctAttempts / attempts.length) * 100) : 0;
  const latestByQuestion = new Map();
  attempts.forEach((attempt) => {
    if (!latestByQuestion.has(attempt.question_id)) latestByQuestion.set(attempt.question_id, attempt);
  });
  const review = [...latestByQuestion.values()].filter((attempt) => !attempt.is_correct);
  const diagnosisByContent = new Map();
  latestByQuestion.forEach((attempt) => {
    const title = attempt.questions?.syllabus_nodes?.title || 'Conteúdo geral';
    const current = diagnosisByContent.get(title) || { title, answered: 0, correct: 0 };
    current.answered += 1;
    if (attempt.is_correct) current.correct += 1;
    diagnosisByContent.set(title, current);
  });
  const contentDiagnosis = [...diagnosisByContent.values()].map((item) => ({
    ...item,
    accuracy: Math.round((item.correct / item.answered) * 100),
    evidence: item.answered >= 3 ? 'sufficient' : 'collecting',
  })).sort((a, b) => a.accuracy - b.accuracy || b.answered - a.answered);
  const completedSimulations = sessions.filter((session) => session.status === 'completed').length;
  const activity = buildActivityHistory(attempts, sessions, flashcardReviews, planItems, today);
  const studyTime = buildStudyTimeHistory({ sessions: studySessions, items: planItems, now: today });
  const streak = calculateStreak(activity.activityDates, today);
  const achievements = [
    { id: 'first-step', title: 'Primeiro passo', description: 'Responda sua primeira questão.', unlocked: attempts.length >= 1 },
    { id: 'practice-10', title: 'Prática consistente', description: 'Responda 10 questões.', unlocked: attempts.length >= 10 },
    { id: 'accuracy-80', title: 'Domínio em construção', description: 'Atinja 80% de acerto após 10 questões.', unlocked: attempts.length >= 10 && accuracy >= 80 },
    { id: 'simulation', title: 'Prova enfrentada', description: 'Conclua seu primeiro simulado.', unlocked: completedSimulations >= 1 },
    { id: 'flashcards-10', title: 'Memória ativa', description: 'Revise 10 flashcards.', unlocked: flashcardReviews.length >= 10 },
    { id: 'streak-3', title: 'Ritmo de estudo', description: 'Estude por 3 dias consecutivos.', unlocked: streak >= 3 },
  ];
  return {
    answered: attempts.length,
    correct: correctAttempts,
    accuracy,
    completedSimulations,
    flashcardsReviewed: flashcardReviews.length,
    streak,
    achievements,
    review,
    contentDiagnosis,
    activity,
    studyTime,
  };
}
