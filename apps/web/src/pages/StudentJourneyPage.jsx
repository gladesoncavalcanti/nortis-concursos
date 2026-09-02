import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ChevronLeft, Loader2, Map, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { getStudentJourneyState } from '@/api/studentJourney.js';
import SmartReviewPanel from '@/components/SmartReviewPanel.jsx';
import SubjectPerformancePanel from '@/components/SubjectPerformancePanel.jsx';

const StudentJourneyPage = () => {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    getStudentJourneyState().then(({ data, error: loadError }) => {
      if (!mounted) return;
      setState(data);
      setError(loadError);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const nextStep = state?.journey.nextStep;

  return (
    <>
      <Helmet>
        <title>Trilha SEDES-DF - NORTIS CONCURSOS</title>
        <meta name="description" content="Trilha guiada da Central Nortis para estudar SEDES-DF com diagnóstico, plano, revisão, simulado e redação." />
      </Helmet>
      <div className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Link to="/minha-conta" className="mb-6 inline-flex items-center text-sm font-semibold text-[hsl(var(--accent))] hover:underline">
            <ChevronLeft className="mr-1 h-4 w-4" />Central Nortis
          </Link>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent))]">Jornada guiada</p>
          <h1 className="mt-2 text-3xl font-bold">Seu caminho SEDES-DF</h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Uma sequência objetiva: acesso, perfil, diagnóstico, plano semanal, questões, simulado, discursiva e revisão.
          </p>

          {loading ? (
            <Loader2 className="mx-auto mt-16 h-8 w-8 animate-spin" aria-hidden="true" />
          ) : error ? (
            <p className="mt-8 rounded-2xl bg-card p-6 text-muted-foreground" role="alert">{error}</p>
          ) : (
            <>
              <section className="mt-8 rounded-2xl border border-[hsl(var(--accent))]/35 bg-[hsl(var(--accent))]/10 p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <Map className="mt-1 h-7 w-7 text-[hsl(var(--accent))]" aria-hidden="true" />
                    <div>
                      <h2 className="text-xl font-bold">
                        {state.journey.completedRequired} de {state.journey.requiredTotal} etapas centrais concluídas
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Próximo passo recomendado: {nextStep?.title ?? 'manter revisão e simulado'}.
                      </p>
                    </div>
                  </div>
                  {nextStep && (
                    <Button asChild>
                      <Link to={nextStep.route}>
                        {nextStep.cta}
                        <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  )}
                </div>
              </section>

              <section className="mt-8 rounded-2xl bg-card p-6" aria-labelledby="journey-steps-title">
                <h2 id="journey-steps-title" className="text-xl font-bold">Trilha operacional</h2>
                <ol className="mt-5 space-y-3">
                  {state.journey.steps.map((step, index) => (
                    <li key={step.id} className="rounded-xl bg-muted p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${step.done ? 'bg-emerald-600 text-white' : 'bg-background text-[hsl(var(--accent))]'}`}>
                            {step.done ? <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> : index + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold">{step.title}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                            {step.optional && <p className="mt-1 text-xs text-muted-foreground">Etapa complementar, não bloqueia a trilha central.</p>}
                          </div>
                        </div>
                        <Button asChild size="sm" variant={step.done ? 'outline' : 'default'} className="shrink-0">
                          <Link to={step.route}>{step.done ? 'Abrir' : step.cta}</Link>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <SmartReviewPanel queue={state.reviewQueue} compact />
                <SubjectPerformancePanel subjects={state.subjectPerformance.slice(0, 5)} compact />
              </div>

              <section className="mt-8 rounded-2xl bg-card p-6">
                <div className="flex items-start gap-3">
                  <Radio className="mt-1 h-6 w-6 text-[hsl(var(--accent))]" aria-hidden="true" />
                  <div>
                    <h2 className="text-xl font-bold">Leitura pedagógica</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Tempo estudado, tarefa concluída, autopercepção, acerto objetivo e redação são sinais diferentes.
                      A trilha organiza prioridade; ela não transforma tempo de tela em domínio de conteúdo.
                    </p>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default StudentJourneyPage;
