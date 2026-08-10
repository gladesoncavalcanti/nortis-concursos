export function summarizeProgress(attempts, sessions) {
  const correctAttempts = attempts.filter((attempt) => attempt.is_correct).length;
  const accuracy = attempts.length ? Math.round((correctAttempts / attempts.length) * 100) : 0;
  const latestByQuestion = new Map();
  attempts.forEach((attempt) => {
    if (!latestByQuestion.has(attempt.question_id)) latestByQuestion.set(attempt.question_id, attempt);
  });
  const review = [...latestByQuestion.values()].filter((attempt) => !attempt.is_correct);
  return {
    answered: attempts.length,
    correct: correctAttempts,
    accuracy,
    completedSimulations: sessions.filter((session) => session.status === 'completed').length,
    review,
  };
}
