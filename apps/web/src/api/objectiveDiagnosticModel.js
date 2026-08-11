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

function classifyEvolution(initialAccuracy, currentAccuracy, sameCycle) {
  if (currentAccuracy === null) return { key: 'pending', label: 'Aguardando evidências', delta: null };
  if (sameCycle || initialAccuracy === null) return { key: 'initial', label: 'Referência inicial', delta: null };
  const delta = currentAccuracy - initialAccuracy;
  if (delta >= 10) return { key: 'improved', label: 'Melhora', delta };
  if (delta <= -10) return { key: 'reinforce', label: 'Necessidade de reforço', delta };
  return { key: 'stable', label: 'Estabilidade', delta };
}

export function buildDiagnosticEvolution({ cycles = [], history = [], selfAssessments = [] }) {
  const orderedCycles = [...cycles].sort((a, b) => a.cycle_number - b.cycle_number);
  const confidenceBySubject = new Map(
    selfAssessments.map((assessment) => [assessment.syllabus_node_id, assessment.confidence])
  );
  const historyByCycle = new Map();

  history.forEach((row) => {
    const cycle = historyByCycle.get(row.cycle_id) ?? {
      id: row.cycle_id,
      cycleNumber: row.cycle_number,
      status: row.cycle_status,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      answered: 0,
      correct: 0,
      subjects: new Map(),
    };
    cycle.answered += row.answered ?? 0;
    cycle.correct += row.correct ?? 0;
    cycle.subjects.set(row.subject_id, {
      subjectId: row.subject_id,
      title: row.subject_title,
      answered: row.answered ?? 0,
      correct: row.correct ?? 0,
      accuracy: row.accuracy,
    });
    historyByCycle.set(row.cycle_id, cycle);
  });

  const summaries = orderedCycles.map((cycle) => {
    const aggregate = historyByCycle.get(cycle.id);
    const answered = aggregate?.answered ?? 0;
    const correct = aggregate?.correct ?? 0;
    return {
      id: cycle.id,
      cycleNumber: cycle.cycle_number,
      status: cycle.status,
      startedAt: cycle.started_at,
      completedAt: cycle.completed_at,
      answered,
      correct,
      accuracy: answered ? Math.round((correct / answered) * 100) : null,
      subjects: aggregate?.subjects ?? new Map(),
    };
  });
  const initial = summaries[0] ?? null;
  const current = summaries.at(-1) ?? null;
  const overall = classifyEvolution(
    initial?.accuracy ?? null,
    current?.accuracy ?? null,
    !initial || initial.id === current?.id
  );

  const subjectIds = new Set([
    ...(initial?.subjects.keys() ?? []),
    ...(current?.subjects.keys() ?? []),
  ]);
  const comparison = [...subjectIds].map((subjectId) => {
    const first = initial?.subjects.get(subjectId);
    const latest = current?.subjects.get(subjectId);
    const trend = classifyEvolution(
      first?.accuracy ?? null,
      latest?.accuracy ?? null,
      !initial || initial.id === current?.id
    );
    return {
      subjectId,
      title: latest?.title ?? first?.title,
      initialAccuracy: first?.accuracy ?? null,
      currentAccuracy: latest?.accuracy ?? null,
      selfConfidence: confidenceBySubject.get(subjectId) ?? null,
      trend,
    };
  }).sort((a, b) => a.title.localeCompare(b.title));

  return { cycles: summaries, initial, current, overall, comparison };
}

export function rankObjectiveWeaknesses(attempts, subjectIds, limit = 3) {
  const allowed = new Set(subjectIds);
  const cycleNumbers = attempts
    .map((attempt) => attempt.diagnostic_cycles?.cycle_number)
    .filter(Number.isFinite);
  const latestCycleNumber = cycleNumbers.length ? Math.max(...cycleNumbers) : null;
  const currentAttempts = latestCycleNumber === null
    ? attempts
    : attempts.filter((attempt) => attempt.diagnostic_cycles?.cycle_number === latestCycleNumber);
  const latest = latestResultByQuestion(currentAttempts);
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
