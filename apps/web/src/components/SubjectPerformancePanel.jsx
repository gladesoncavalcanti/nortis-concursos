import React from 'react';
import { Target } from 'lucide-react';

const STATUS_STYLES = {
  weak: 'bg-red-500/10 text-red-700 dark:text-red-300',
  attention: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  stable: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  collecting: 'bg-muted text-muted-foreground',
};

const SubjectPerformancePanel = ({ subjects = [], compact = false }) => (
  <section className={`rounded-2xl bg-card p-6 ${compact ? '' : 'mt-8'}`} aria-labelledby="subject-performance-title">
    <div className="flex items-start gap-3">
      <Target className="mt-1 h-6 w-6 text-[hsl(var(--accent))]" aria-hidden="true" />
      <div>
        <h2 id="subject-performance-title" className="text-xl font-bold">Desempenho por assunto</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Leitura objetiva por conteúdo: separa acerto, volume de evidência e tarefas planejadas.
        </p>
      </div>
    </div>

    {subjects.length === 0 ? (
      <p className="mt-6 rounded-xl bg-muted p-5 text-sm text-muted-foreground">
        Responda diagnóstico, questões ou simulados para formar o mapa de assuntos.
      </p>
    ) : (
      <div className="mt-5 space-y-3">
        {subjects.map((subject) => (
          <article key={subject.title} className="rounded-xl bg-muted p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-semibold">{subject.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {subject.answered} {subject.answered === 1 ? 'evidência objetiva' : 'evidências objetivas'} ·
                  {' '}{subject.plannedTasks} {subject.plannedTasks === 1 ? 'tarefa planejada' : 'tarefas planejadas'}
                </p>
              </div>
              <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLES[subject.status]}`}>
                {subject.label}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-background">
                <div className="h-full bg-[hsl(var(--accent))]" style={{ width: `${subject.accuracy}%` }} />
              </div>
              <span className="text-sm font-bold">{subject.accuracy}%</span>
            </div>
          </article>
        ))}
      </div>
    )}
  </section>
);

export default SubjectPerformancePanel;
