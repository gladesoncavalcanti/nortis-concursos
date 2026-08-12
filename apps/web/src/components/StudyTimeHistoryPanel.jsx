import React from 'react';
import { BarChart3, BookOpen, CalendarRange, Clock3, ListChecks, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { buildStudyTimeHistory } from '@/api/studyTimeHistory.js';

const formatMinutes = (minutes) => {
  const safe = Math.max(0, Math.floor(Number(minutes) || 0));
  if (safe < 60) return `${safe} min`;
  const hours = Math.floor(safe / 60);
  const remainder = safe % 60;
  return remainder ? `${hours}h ${remainder}min` : `${hours}h`;
};

const formatDate = (key, options = {}) => new Date(`${key}T12:00:00`).toLocaleDateString('pt-BR', options);

const TrendIcon = ({ status }) => {
  if (status === 'improving') return <TrendingUp className="h-5 w-5 text-emerald-600" aria-hidden="true" />;
  if (status === 'reinforce') return <TrendingDown className="h-5 w-5 text-amber-600" aria-hidden="true" />;
  return <Minus className="h-5 w-5 text-[hsl(var(--accent))]" aria-hidden="true" />;
};

const StudyTimeHistoryPanel = ({ sessions = [], items = [], history: preparedHistory = null, compact = false }) => {
  const history = preparedHistory ?? buildStudyTimeHistory({ sessions, items });
  const visibleWeeks = compact ? history.weeks.slice(-4) : history.weeks;
  const visibleTasks = history.taskGroups.slice(0, compact ? 3 : 6);
  const visibleContents = history.contentGroups.slice(0, compact ? 3 : 6);
  const maxDailySeconds = Math.max(1, ...history.days.map((day) => day.trackedSeconds));
  const maxWeeklyMinutes = Math.max(1, ...visibleWeeks.flatMap((week) => [week.plannedMinutes, week.trackedMinutes]));

  return (
    <section className="mt-8 rounded-2xl bg-card p-6" aria-labelledby="study-time-history-title">
      <div className="flex items-start gap-3">
        <Clock3 className="mt-0.5 h-6 w-6 text-[hsl(var(--accent))]" aria-hidden="true" />
        <div>
          <h2 id="study-time-history-title" className="text-xl font-bold">Histórico de tempo real</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Compare o que foi planejado com o tempo efetivamente registrado pelo cronômetro.
          </p>
        </div>
      </div>

      {!history.hasData ? (
        <div className="mt-6 rounded-xl border border-dashed border-border p-6 text-center">
          <CalendarRange className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <h3 className="mt-3 font-semibold">Seu histórico começa na primeira sessão</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Planeje uma tarefa e use o cronômetro. O tempo aparecerá aqui sem alterar sua nota, autopercepção ou diagnóstico.
          </p>
        </div>
      ) : <>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Tempo real', formatMinutes(history.totalTrackedMinutes)],
            ['Tempo planejado', formatMinutes(history.totalPlannedMinutes)],
            ['Sessões encerradas', history.completedSessions],
            ['Período', `${formatDate(history.periodStart, { day: '2-digit', month: '2-digit' })}–${formatDate(history.periodEnd, { day: '2-digit', month: '2-digit' })}`],
          ].map(([label, value]) => <div key={label} className="rounded-xl bg-muted p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
          </div>)}
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-border p-4" role="status">
          <TrendIcon status={history.trend.status} />
          <div>
            <p className="font-semibold">{history.trend.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{history.trend.description}</p>
            <p className="mt-1 text-xs text-muted-foreground">Comparação entre as duas últimas semanas concluídas; indica constância, não desempenho.</p>
          </div>
        </div>

        <div className="mt-7">
          <h3 className="flex items-center gap-2 font-semibold"><BarChart3 className="h-5 w-5" />Últimos 7 dias</h3>
          <div className="mt-4 grid grid-cols-7 gap-2" aria-label="Tempo real diário dos últimos sete dias">
            {history.days.map((day) => <div key={day.date} className="text-center">
              <div className="flex h-24 items-end rounded-lg bg-muted p-1">
                <div
                  className="w-full rounded-md bg-[hsl(var(--accent))]"
                  style={{ height: day.trackedSeconds ? `${Math.max(8, (day.trackedSeconds / maxDailySeconds) * 100)}%` : '4px' }}
                  role="img"
                  aria-label={`${formatMinutes(day.trackedMinutes)} estudados em ${formatDate(day.date)}`}
                />
              </div>
              <p className="mt-2 text-xs font-semibold">{formatDate(day.date, { weekday: 'short' }).replace('.', '')}</p>
              <p className="text-xs text-muted-foreground">{formatMinutes(day.trackedMinutes)}</p>
            </div>)}
          </div>
        </div>

        <div className="mt-7 border-t border-border pt-6">
          <h3 className="flex items-center gap-2 font-semibold"><CalendarRange className="h-5 w-5" />Planejado × executado por semana</h3>
          <div className="mt-4 space-y-4">
            {visibleWeeks.map((week) => <div key={week.start} className="rounded-xl bg-muted p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{formatDate(week.start, { day: '2-digit', month: '2-digit' })}–{formatDate(week.end, { day: '2-digit', month: '2-digit' })}</p>
                <p className="text-xs text-muted-foreground">{week.plannedTasks} planejadas · {week.completedTasks} concluídas</p>
              </div>
              <div className="mt-3 grid gap-2 text-xs">
                <div className="grid grid-cols-[5rem_1fr_auto] items-center gap-2">
                  <span>Planejado</span><div className="h-2 overflow-hidden rounded-full bg-background"><div className="h-full bg-slate-400" style={{ width: `${(week.plannedMinutes / maxWeeklyMinutes) * 100}%` }} /></div><strong>{formatMinutes(week.plannedMinutes)}</strong>
                </div>
                <div className="grid grid-cols-[5rem_1fr_auto] items-center gap-2">
                  <span>Tempo real</span><div className="h-2 overflow-hidden rounded-full bg-background"><div className="h-full bg-[hsl(var(--accent))]" style={{ width: `${(week.trackedMinutes / maxWeeklyMinutes) * 100}%` }} /></div><strong>{formatMinutes(week.trackedMinutes)}</strong>
                </div>
              </div>
            </div>)}
          </div>
        </div>

        {(visibleTasks.length > 0 || visibleContents.length > 0) && <div className="mt-7 grid gap-6 border-t border-border pt-6 lg:grid-cols-2">
          <div>
            <h3 className="flex items-center gap-2 font-semibold"><ListChecks className="h-5 w-5" />Por tarefa</h3>
            <ul className="mt-3 space-y-2">
              {visibleTasks.map((task) => <li key={task.id} className="rounded-xl bg-muted p-4">
                <div className="flex justify-between gap-3"><p className="font-medium">{task.title}</p><strong className="shrink-0">{formatMinutes(task.trackedMinutes)}</strong></div>
                <p className="mt-1 text-xs text-muted-foreground">{task.contentTitle} · {task.sessions} {task.sessions === 1 ? 'sessão' : 'sessões'}{task.plannedMinutes ? ` · ${task.plannedMinutes} min planejados` : ''}</p>
              </li>)}
            </ul>
          </div>
          <div>
            <h3 className="flex items-center gap-2 font-semibold"><BookOpen className="h-5 w-5" />Por conteúdo</h3>
            <ul className="mt-3 space-y-2">
              {visibleContents.map((content) => <li key={content.title} className="flex items-center justify-between gap-3 rounded-xl bg-muted p-4">
                <div><p className="font-medium">{content.title}</p><p className="mt-1 text-xs text-muted-foreground">{content.tasks} {content.tasks === 1 ? 'tarefa' : 'tarefas'} · {content.sessions} {content.sessions === 1 ? 'sessão' : 'sessões'}</p></div>
                <strong className="shrink-0">{formatMinutes(content.trackedMinutes)}</strong>
              </li>)}
            </ul>
          </div>
        </div>}
      </>}

      <p className="mt-6 text-xs text-muted-foreground">
        Tempo real, conclusão de tarefas, autopercepção e desempenho objetivo são sinais diferentes. Este histórico organiza sua rotina; não representa nota ou domínio do conteúdo.
      </p>
    </section>
  );
};

export default StudyTimeHistoryPanel;
