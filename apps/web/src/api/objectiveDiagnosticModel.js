function latestResultByQuestion(results) {
  const latest = new Map();
  results.forEach((result) => {
    const current = latest.get(result.question_id);
    if (!current || new Date(result.answered_at) > new Date(current.answered_at)) {
      latest.set(result.question_id, result);
    }
  });
  return latest;
}

export function buildObjectiveDiagnostic({ questions, results, selfAssessments }) {
  const resultByQuestion = latestResultByQuestion(results);
  const confidenceBySubject = new Map(
    selfAssessments.map((assessment) => [assessment.syllabus_node_id, assessment.confidence])
  );
  const bySubject = new Map();

  questions.forEach((question) => {
    const subject = question.syllabus_nodes;
    if (!subject) return;
    const current = bySubject.get(subject.id) ?? {
      subjectId: subject.id,
      title: subject.title,
      answered: 0,
      correct: 0,
      selfConfidence: confidenceBySubject.get(subject.id) ?? null,
      sortOrder: question.sort_order,
    };
    const result = resultByQuestion.get(question.id);
    if (result) {
      current.answered += 1;
      if (result.is_correct) current.correct += 1;
    }
    current.sortOrder = Math.min(current.sortOrder, question.sort_order);
    bySubject.set(subject.id, current);
  });

  const answered = resultByQuestion.size;
  const correct = [...resultByQuestion.values()].filter((result) => result.is_correct).length;
  const comparison = [...bySubject.values()]
    .map((item) => ({
      ...item,
      accuracy: item.answered ? Math.round((item.correct / item.answered) * 100) : null,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));

  return {
    total: questions.length,
    answered,
    correct,
    accuracy: answered ? Math.round((correct / answered) * 100) : null,
    completed: questions.length > 0 && answered === questions.length,
    comparison,
    resultsByQuestion: Object.fromEntries(resultByQuestion),
  };
}

export function rankObjectiveWeaknesses(attempts, subjectIds, limit = 3) {
  const allowed = new Set(subjectIds);
  const latest = latestResultByQuestion(attempts);
  const bySubject = new Map();

  latest.forEach((attempt) => {
    const subject = attempt.questions?.syllabus_nodes;
    if (!subject || !allowed.has(subject.id) || subject.node_type !== 'subject') return;
    const current = bySubject.get(subject.id) ?? {
      subjectId: subject.id,
      title: subject.title,
      answered: 0,
      correct: 0,
    };
    current.answered += 1;
    if (attempt.is_correct) current.correct += 1;
    bySubject.set(subject.id, current);
  });

  return [...bySubject.values()]
    .map((item) => ({
      ...item,
      accuracy: Math.round((item.correct / item.answered) * 100),
    }))
    .sort((a, b) => a.accuracy - b.accuracy || b.answered - a.answered || a.title.localeCompare(b.title))
    .slice(0, limit);
}
