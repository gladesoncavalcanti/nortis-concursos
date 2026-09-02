import React from 'react';
import { BarChart3, ShieldCheck } from 'lucide-react';

const METRICS = [
  ['Questões respondidas', 'answered', 'average_answered'],
  ['Acerto em questões', 'question_accuracy', 'average_question_accuracy', '%'],
  ['Simulados concluídos', 'completed_simulations', 'average_completed_simulations'],
  ['Acerto médio em simulados', 'average_simulation_accuracy', 'average_simulation_accuracy', '%'],
  ['Minutos estudados em 30 dias', 'studied_minutes_last_30_days', 'average_studied_minutes_last_30_days'],
];

function formatValue(value, suffix = '') {
  if (value === null || value === undefined) return '0';
  return `${Number(value || 0).toLocaleString('pt-BR')}${suffix}`;
}

const AnonymousBenchmarkPanel = ({ benchmark }) => {
  const mine = benchmark?.mine ?? {};
  const cohort = benchmark?.cohort ?? {};

  return (
    <section className="mt-8 rounded-2xl bg-card p-6" aria-labelledby="anonymous-benchmark-title">
      <div className="flex items-start gap-3">
        <BarChart3 className="mt-1 h-6 w-6 text-[hsl(var(--accent))]" aria-hidden="true" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent))]">Comparativo seguro</p>
          <h2 id="anonymous-benchmark-title" className="mt-1 text-xl font-bold">Seu ritmo frente à coorte ativa</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Comparação agregada e anônima. Não há ranking público, nomes de alunos ou exposição individual.
          </p>
        </div>
      </div>

      {!benchmark ? (
        <p className="mt-5 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
          O comparativo será exibido após a atualização da base e coleta de dados suficientes.
        </p>
      ) : !benchmark.sample_ready ? (
        <div className="mt-5 rounded-xl bg-muted p-4">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            Amostra protegida
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Ainda não há pelo menos {benchmark.privacy?.minimum_sample ?? 3} alunos ativos para mostrar médias sem risco de identificação.
            Seus próprios indicadores continuam disponíveis normalmente.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {METRICS.map(([label, mineKey, cohortKey, suffix = '']) => (
            <article key={label} className="rounded-xl bg-muted p-4">
              <h3 className="text-sm font-semibold">{label}</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Você</p>
                  <p className="mt-1 text-2xl font-bold">{formatValue(mine[mineKey], suffix)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Média anônima</p>
                  <p className="mt-1 text-2xl font-bold">{formatValue(cohort[cohortKey], suffix)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default AnonymousBenchmarkPanel;
