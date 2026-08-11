import React from 'react';
import { AlertTriangle, BarChart3, CalendarCheck2, Clock3 } from 'lucide-react';
import { buildWeeklyAdherence } from '@/api/weeklyAdherence.js';

const WeeklyAdherencePanel = ({ items }) => {
  const adherence = buildWeeklyAdherence({ items });
  const metrics = [
    ['Tarefas', `${adherence.completedTasks}/${adherence.plannedTasks}`],
    ['Minutos', `${adherence.completedMinutes}/${adherence.plannedMinutes}`],
    ['Aderência', `${adherence.adherencePercent}%`],
    ['Atrasadas', adherence.overdueTasks],
    ['Restantes', `${adherence.remainingMinutes} min`],
  ];

  return (
    <section className="mt-6 rounded-2xl bg-card p-6" aria-labelledby="weekly-adherence-title">
      <div className="flex items-start gap-3">
        <CalendarCheck2 className="mt-0.5 h-6 w-6 text-[hsl(var(--accent))]" aria-hidden="true" />
        <div>
          <h2 id="weekly-adherence-title" className="text-xl font-bold">Aderência desta semana</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Segunda a domingo · {adherence.manualTasks} manuais · {adherence.suggestedTasks} sugeridas
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-xl bg-muted p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Progresso planejado</span>
          <span>{adherence.adherencePercent}%</span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label="Aderência ao plano semanal"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={adherence.adherencePercent}
        >
          <div
            className="h-full bg-[hsl(var(--accent))] transition-[width]"
            style={{ width: `${adherence.adherencePercent}%` }}
          />
        </div>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-border p-4" role="status">
        {adherence.overdueTasks > 0 ? (
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
        ) : adherence.adherencePercent === 100 ? (
          <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
        ) : (
          <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--accent))]" aria-hidden="true" />
        )}
        <div>
          <p className="font-semibold">{adherence.guidance.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{adherence.guidance.description}</p>
        </div>
      </div>
    </section>
  );
};

export default WeeklyAdherencePanel;
