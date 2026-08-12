import React, { useEffect, useMemo, useState } from 'react';
import { Clock3, Square } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { formatStudySessionDuration, getStudySessionElapsedSeconds } from '@/api/studySessionModel.js';

const StudySessionTimer = ({ activeSession, items, busy, onFinish }) => {
  const [now, setNow] = useState(() => new Date());
  const activeItem = useMemo(
    () => items.find((item) => item.id === activeSession?.study_plan_item_id),
    [activeSession, items]
  );

  useEffect(() => {
    if (!activeSession) return undefined;
    setNow(new Date());
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, [activeSession]);

  if (!activeSession) {
    return (
      <section className="mt-6 rounded-2xl border border-border bg-card p-6" aria-labelledby="study-session-title">
        <h2 id="study-session-title" className="flex items-center gap-2 text-xl font-bold">
          <Clock3 className="h-5 w-5 text-[hsl(var(--accent))]" aria-hidden="true" />
          Sessão de estudo
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Inicie o cronômetro em uma tarefa para comparar o tempo realmente estudado com o tempo planejado.
        </p>
      </section>
    );
  }

  const elapsed = getStudySessionElapsedSeconds(activeSession.started_at, now);

  return (
    <section className="mt-6 rounded-2xl border border-[hsl(var(--accent))]/40 bg-[hsl(var(--accent))]/10 p-6" aria-labelledby="study-session-title">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent))]">Sessão em andamento</p>
      <h2 id="study-session-title" className="mt-2 text-xl font-bold">{activeItem?.title || 'Tarefa do plano de estudos'}</h2>
      <p className="mt-4 font-mono text-4xl font-bold tabular-nums" role="timer" aria-label="Tempo decorrido da sessão">
        {formatStudySessionDuration(elapsed)}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">O tempo é confirmado pelo servidor quando você encerra a sessão.</p>
      <Button className="mt-4" disabled={busy} onClick={onFinish}>
        {busy ? <LoaderLabel /> : <Square className="mr-2 h-4 w-4" aria-hidden="true" />}
        Encerrar sessão
      </Button>
    </section>
  );
};

const LoaderLabel = () => <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />;

export default StudySessionTimer;
