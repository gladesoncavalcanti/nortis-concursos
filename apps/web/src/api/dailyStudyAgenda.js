function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dueFlashcards(decks, now) {
  return (decks ?? []).flatMap((deck) => deck.flashcards ?? []).filter((card) => {
    const nextReview = card.progress?.next_review_at;
    return !nextReview || new Date(nextReview).getTime() <= now.getTime();
  });
}

export function buildDailyStudyAgenda({
  planItems = [],
  progress = null,
  flashcardDecks = [],
  today = new Date(),
}) {
  const todayKey = localDateKey(today);
  const pendingPlan = planItems
    .filter((item) => !item.completed && /^\d{4}-\d{2}-\d{2}$/.test(item.scheduled_date))
    .filter((item) => item.scheduled_date <= todayKey)
    .sort((left, right) =>
      left.scheduled_date.localeCompare(right.scheduled_date) || left.title.localeCompare(right.title)
    );
  const overdueCount = pendingPlan.filter((item) => item.scheduled_date < todayKey).length;
  const agendaItems = pendingPlan.slice(0, 2).map((item) => ({
    id: `plan-${item.id}`,
    kind: 'plan',
    title: item.title,
    description: item.scheduled_date < todayKey
      ? `${item.duration_minutes} min · tarefa atrasada`
      : `${item.duration_minutes} min · planejada para hoje`,
    route: '/minha-conta/plano',
    cta: 'Abrir tarefa',
    minutes: item.duration_minutes,
  }));

  const reviewCount = progress?.review?.length ?? 0;
  if (reviewCount > 0) {
    agendaItems.push({
      id: 'error-review',
      kind: 'review',
      title: `Revisar ${reviewCount} ${reviewCount === 1 ? 'erro recente' : 'erros recentes'}`,
      description: 'Confirme o aprendizado sem misturar essa evidência com sua autopercepção.',
      route: '/minha-conta/progresso',
      cta: 'Revisar erros',
      minutes: 0,
    });
  }

  const flashcardCount = dueFlashcards(flashcardDecks, today).length;
  if (flashcardCount > 0) {
    agendaItems.push({
      id: 'flashcards-due',
      kind: 'flashcards',
      title: `Revisar ${flashcardCount} ${flashcardCount === 1 ? 'flashcard' : 'flashcards'}`,
      description: 'Cartões programados para hoje pelo ritmo de repetição espaçada.',
      route: '/minha-conta/flashcards',
      cta: 'Iniciar revisão',
      minutes: 0,
    });
  }

  if (agendaItems.length === 0) {
    const needsDiagnostic = !progress || progress.answered === 0;
    agendaItems.push({
      id: needsDiagnostic ? 'diagnostic' : 'practice',
      kind: needsDiagnostic ? 'diagnostic' : 'practice',
      title: needsDiagnostic ? 'Criar sua referência diagnóstica' : 'Gerar uma nova evidência de aprendizagem',
      description: needsDiagnostic
        ? 'Comece pelo diagnóstico da sua especialidade antes de definir prioridades.'
        : 'Sua agenda imediata está livre; pratique um novo bloco do edital.',
      route: needsDiagnostic ? '/minha-conta/diagnostico' : '/minha-conta/questoes',
      cta: needsDiagnostic ? 'Iniciar diagnóstico' : 'Praticar questões',
      minutes: 0,
    });
  }

  return {
    items: agendaItems.slice(0, 4),
    overdueCount,
    flashcardCount,
    reviewCount,
    plannedMinutes: pendingPlan.reduce((total, item) => total + Number(item.duration_minutes || 0), 0),
  };
}

