import React from 'react';
import { CalendarClock, Layers3, RefreshCcw, Sparkles } from 'lucide-react';

const FlashcardInsightsPanel = ({ insights, compact = false }) => {
  if (!insights || insights.total === 0) return null;

  const metrics = [
    ['Para revisar', insights.dueCount, RefreshCcw],
    ['Já iniciados', insights.reviewed, Sparkles],
    ['Com 3+ revisões', insights.repeatedCount, Layers3],
    ['Programados', insights.scheduledCount, CalendarClock],
  ];
  const nextReview = insights.nextReviewAt
    ? new Date(insights.nextReviewAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <section className={`${compact ? 'mt-8' : 'mt-6'} rounded-2xl border border-border bg-card p-6`} aria-labelledby={compact ? 'flashcard-insights-progress' : 'flashcard-insights-review'}>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[hsl(var(--accent))]">Repetição espaçada</p>
        <h2 id={compact ? 'flashcard-insights-progress' : 'flashcard-insights-review'} className="mt-1 text-xl font-bold text-foreground">
          Maturidade das revisões
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Mostra seu contato com os cartões e a agenda de repetição. Não representa domínio do conteúdo nem nota de desempenho.
        </p>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map(([label, value, Icon]) => (
          <div key={label} className="rounded-xl bg-muted/50 p-4">
            <Icon className="h-5 w-5 text-[hsl(var(--accent))]" aria-hidden="true" />
            <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>{insights.newCount} novos · {insights.startedCount} em consolidação</p>
        <p>{nextReview ? `Próxima revisão programada: ${nextReview}` : 'Nenhuma revisão futura programada.'}</p>
      </div>
    </section>
  );
};

export default FlashcardInsightsPanel;

