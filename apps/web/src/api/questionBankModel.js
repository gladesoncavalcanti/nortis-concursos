function collectNodeIds(nodes = []) {
  const ids = new Set();
  const visit = (items) => items.forEach((item) => {
    ids.add(item.id);
    visit(item.children ?? []);
  });
  visit(nodes);
  return ids;
}

function normalizeNode(question) {
  return Array.isArray(question.syllabus_nodes)
    ? question.syllabus_nodes[0] ?? null
    : question.syllabus_nodes ?? null;
}

function latestAttempts(attempts = []) {
  const sorted = [...attempts].sort((left, right) =>
    String(right.answered_at ?? '').localeCompare(String(left.answered_at ?? ''))
    || String(right.id ?? '').localeCompare(String(left.id ?? ''))
  );
  const byQuestion = new Map();
  sorted.forEach((attempt) => {
    if (!byQuestion.has(attempt.question_id)) byQuestion.set(attempt.question_id, attempt);
  });
  return byQuestion;
}

export function buildQuestionBankView({
  questions = [],
  attempts = [],
  visibleNodes = [],
  status = 'all',
  contentId = 'all',
}) {
  const visibleIds = collectNodeIds(visibleNodes);
  const attemptsByQuestion = latestAttempts(attempts);
  const scopedQuestions = questions
    .filter((question) => question.syllabus_node_id && visibleIds.has(question.syllabus_node_id))
    .map((question) => {
      const lastAttempt = attemptsByQuestion.get(question.id) ?? null;
      return {
        ...question,
        syllabusNode: normalizeNode(question),
        lastAttempt,
        status: !lastAttempt ? 'unanswered' : lastAttempt.is_correct ? 'correct' : 'incorrect',
      };
    });

  const contents = [...new Map(scopedQuestions.map((question) => [
    question.syllabus_node_id,
    { id: question.syllabus_node_id, title: question.syllabusNode?.title ?? 'Conteúdo geral' },
  ])).values()].sort((left, right) => left.title.localeCompare(right.title, 'pt-BR'));

  const counts = {
    all: scopedQuestions.length,
    unanswered: scopedQuestions.filter((question) => question.status === 'unanswered').length,
    correct: scopedQuestions.filter((question) => question.status === 'correct').length,
    incorrect: scopedQuestions.filter((question) => question.status === 'incorrect').length,
  };

  const filteredQuestions = scopedQuestions.filter((question) =>
    (status === 'all' || question.status === status)
    && (contentId === 'all' || question.syllabus_node_id === contentId)
  );

  return { questions: filteredQuestions, allQuestions: scopedQuestions, contents, counts };
}
