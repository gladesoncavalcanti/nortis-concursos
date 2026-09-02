import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';

const KIND_LABELS = {
  diagnostic: 'Diagnóstico',
  practice: 'Questão',
  simulation: 'Simulado',
};

const SmartReviewPanel = ({ queue = [], compact = false }) => (
  <section className={`rounded-2xl bg-card p-6 ${compact ? '' : 'mt-8'}`} aria-labelledby="smart-review-title">
    <div className="flex items-start gap-3">
      <RotateCcw className="mt-1 h-6 w-6 text-[hsl(var(--accent))]" aria-hidden="true" />
      <div>
        <h2 id="smart-review-title" className="text-xl font-bold">Caderno de erros inteligente</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Fila priorizada por erros recentes, diagnóstico, prática e simulados com desempenho abaixo do estável.
        </p>
      </div>
    </div>

    {queue.length === 0 ? (
      <div className="mt-6 rounded-xl bg-muted p-5 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-emerald-600" aria-hidden="true" />
        <p className="text-sm font-medium">Nenhum erro pendente agora.</p>
        <p className="mt-1 text-xs text-muted-foreground">Novas tentativas incorretas entram aqui automaticamente.</p>
      </div>
    ) : (
      <ol className="mt-5 space-y-3">
        {queue.map((item) => (
          <li key={item.id} className="rounded-xl bg-muted p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[hsl(var(--accent))]">
                  {KIND_LABELS[item.kind] ?? 'Revisão'}
                </p>
                <h3 className="mt-1 font-semibold">{item.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{item.subtitle}</p>
                <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                  {item.evidence}
                </p>
              </div>
              <Button asChild size="sm" variant="outline" className="shrink-0">
                <Link to={item.route}>
                  Revisar
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </li>
        ))}
      </ol>
    )}
  </section>
);

export default SmartReviewPanel;
