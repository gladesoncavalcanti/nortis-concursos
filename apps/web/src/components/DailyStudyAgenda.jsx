import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, Brain, CalendarCheck2, Clock3, Layers3, Loader2 } from 'lucide-react';

const ICONS = {
  plan: CalendarCheck2,
  review: AlertCircle,
  flashcards: Layers3,
  diagnostic: Brain,
  practice: Brain,
};

const DailyStudyAgenda = ({ agenda, loading = false, error = null }) => (
  <section className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm" aria-labelledby="daily-agenda-title">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[hsl(var(--accent))]">Execução diária</p>
        <h2 id="daily-agenda-title" className="mt-1 text-2xl font-bold text-foreground">Sua agenda de hoje</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Reúne tarefas vencidas ou de hoje, revisão de erros e flashcards programados — sem transformar atividade em nota.
        </p>
      </div>
      {agenda && !loading && !error && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock3 className="h-4 w-4" aria-hidden="true" />
          {agenda.plannedMinutes} min pendentes no plano
        </div>
      )}
    </div>

    {loading ? (
      <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground" role="status">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Organizando sua agenda...
      </div>
    ) : error ? (
      <p className="mt-6 text-sm text-muted-foreground" role="alert">{error}</p>
    ) : (
      <ol className="mt-6 grid gap-3 lg:grid-cols-2">
        {(agenda?.items ?? []).map((item) => {
          const Icon = ICONS[item.kind] ?? Brain;
          return (
            <li key={item.id} className="rounded-xl border border-border bg-muted/40 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-white">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                  <Link to={item.route} className="mt-3 inline-flex items-center text-sm font-semibold text-[hsl(var(--accent))] hover:underline">
                    {item.cta}
                    <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    )}
  </section>
);

export default DailyStudyAgenda;

