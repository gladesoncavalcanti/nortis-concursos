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

export function summarizeProgress(attempts, sessions, flashcardReviews = [], today = new Date()) {
  const correctAttempts = attempts.filter((attempt) => attempt.is_correct).length;
  const accuracy = attempts.length ? Math.round((correctAttempts / attempts.length) * 100) : 0;
  const latestByQuestion = new Map();
  attempts.forEach((attempt) => {
    if (!latestByQuestion.has(attempt.question_id)) latestByQuestion.set(attempt.question_id, attempt);
  });
  const review = [...latestByQuestion.values()].filter((attempt) => !attempt.is_correct);
  const completedSimulations = sessions.filter((session) => session.status === 'completed').length;
  const activityDates = [
    ...attempts.map((item) => item.answered_at),
    ...sessions.map((item) => item.completed_at),
    ...flashcardReviews.map((item) => item.last_reviewed_at),
  ];
  const streak = calculateStreak(activityDates, today);
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
  };
}
