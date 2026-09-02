export function summarizeSimulationReview(rows = []) {
  const safeRows = rows.filter((row) => row?.question_id);
  const total = safeRows.length;
  const correct = safeRows.filter((row) => row.is_correct).length;
  const accuracy = total ? Math.round((correct / total) * 100) : 0;
  const byContent = new Map();

  safeRows.forEach((row) => {
    const key = row.syllabus_node_id ?? 'unlinked';
    const current = byContent.get(key) ?? {
      id: key,
      title: row.syllabus_node_title ?? 'Sem conteúdo vinculado',
      total: 0,
      correct: 0,
      incorrectQuestions: [],
    };
    current.total += 1;
    if (row.is_correct) current.correct += 1;
    else current.incorrectQuestions.push(row);
    byContent.set(key, current);
  });

  const contents = [...byContent.values()].map((content) => ({
    ...content,
    accuracy: content.total ? Math.round((content.correct / content.total) * 100) : 0,
    status: content.total === 0
      ? 'collecting'
      : content.correct / content.total < 0.6
        ? 'weak'
        : content.correct / content.total < 0.75
          ? 'attention'
          : 'stable',
  })).sort((left, right) =>
    left.accuracy - right.accuracy ||
    right.total - left.total ||
    left.title.localeCompare(right.title, 'pt-BR')
  );

  return {
    total,
    correct,
    accuracy,
    incorrect: total - correct,
    contents,
    incorrectQuestions: safeRows.filter((row) => !row.is_correct),
  };
}
