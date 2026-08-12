export function buildFlashcardInsights(decks = [], now = new Date()) {
  const cards = decks.flatMap((deck) => deck.flashcards ?? []);
  const reviewed = cards.filter((card) => card.progress?.last_reviewed_at);
  const due = cards.filter((card) => {
    const nextReview = card.progress?.next_review_at;
    return !nextReview || new Date(nextReview).getTime() <= now.getTime();
  });
  const scheduled = cards.filter((card) => {
    const nextReview = card.progress?.next_review_at;
    return nextReview && new Date(nextReview).getTime() > now.getTime();
  });
  const nextReviewAt = scheduled
    .map((card) => card.progress.next_review_at)
    .sort((left, right) => new Date(left) - new Date(right))[0] ?? null;

  return {
    total: cards.length,
    reviewed: reviewed.length,
    newCount: cards.length - reviewed.length,
    dueCount: due.length,
    scheduledCount: scheduled.length,
    startedCount: reviewed.filter((card) => Number(card.progress.repetitions ?? 0) < 3).length,
    repeatedCount: reviewed.filter((card) => Number(card.progress.repetitions ?? 0) >= 3).length,
    nextReviewAt,
  };
}
