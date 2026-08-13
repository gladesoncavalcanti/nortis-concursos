import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, ChevronLeft, Loader2, Lock, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { getMyProgress } from '@/api/progress.js';
import { getStudyPlan } from '@/api/studyPlan.js';
import { buildTutorGuidance } from '@/api/tutorGuidance.js';

const OPTIONS = [
  ['next', 'O que estudar agora?'],
  ['performance', 'Como está meu desempenho?'],
  ['review', 'O que devo revisar?'],
  ['week', 'Como está minha semana?'],
];

const StudyTutorPage = () => {
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    let mounted = true;
    Promise.all([getMyProgress(), getStudyPlan()])
      .then(([progressResult, planResult]) => {
        if (!mounted) return;
        if (progressResult.error || planResult.error) {
          setError('Não foi possível calcular sua orientação agora.');
        } else {
          setContext({ progress: progressResult.data, planItems: planResult.data.items });
        }
      })
      .catch(() => {
        if (mounted) setError('Não foi possível calcular sua orientação agora.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const ask = (intent, label) => {
    const guidance = buildTutorGuidance({ ...context, intent });
    setMessages((current) => [
      ...current,
      { role: 'user', text: label },
      { role: 'tutor', guidance },
    ]);
  };

  return (
    <>
      <Helmet><title>Tutor Nortis - NORTIS CONCURSOS</title></Helmet>
      <div className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link to="/minha-conta" className="mb-6 inline-flex items-center text-sm font-semibold text-[hsl(var(--accent))] hover:underline">
            <ChevronLeft className="mr-1 h-4 w-4" />Central Nortis
          </Link>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent))]">Central Nortis</p>
          <h1 className="mt-2 text-3xl font-bold">Tutor Nortis</h1>
          <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
            <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>Orientação privada calculada no seu navegador a partir do progresso e do plano da sua conta. Nenhum texto é enviado a um provedor externo de IA.</p>
          </div>

          <Link
            to="/minha-conta/tutor/redacao"
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground hover:border-[hsl(var(--accent))]"
          >
            <PenLine className="h-4 w-4 text-[hsl(var(--accent))]" aria-hidden="true" />
            Praticar redação por tema
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>

          {loading ? <Loader2 className="mx-auto mt-16 h-8 w-8 animate-spin" /> : error ? (
            <p className="mt-8 rounded-2xl bg-card p-6">{error}</p>
          ) : (
            <>
              <div className="mt-8 min-h-72 space-y-4 rounded-2xl bg-card p-6" aria-live="polite">
                <div className="flex gap-3">
                  <Bot className="h-6 w-6 shrink-0 text-[hsl(var(--accent))]" aria-hidden="true" />
                  <p className="rounded-xl bg-muted p-4 text-sm">Posso combinar seu desempenho objetivo, revisões pendentes e aderência ao plano para indicar uma ação concreta.</p>
                </div>
                {messages.map((message, index) => (
                  <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'gap-3'}`}>
                    {message.role === 'tutor' && <Bot className="h-6 w-6 shrink-0 text-[hsl(var(--accent))]" aria-hidden="true" />}
                    {message.role === 'user' ? (
                      <p className="max-w-[85%] rounded-xl bg-[hsl(var(--primary))] p-4 text-sm text-white">{message.text}</p>
                    ) : (
                      <div className="max-w-[85%] rounded-xl bg-muted p-4 text-sm">
                        <p className="font-semibold">{message.guidance.title}</p>
                        <p className="mt-2 text-muted-foreground">{message.guidance.message}</p>
                        <Button asChild size="sm" className="mt-4">
                          <Link to={message.guidance.route}>{message.guidance.cta}<ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {OPTIONS.map(([intent, label]) => (
                  <Button key={intent} variant="outline" onClick={() => ask(intent, label)}>{label}</Button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default StudyTutorPage;
