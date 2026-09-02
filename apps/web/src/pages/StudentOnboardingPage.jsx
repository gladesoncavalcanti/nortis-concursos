import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import PersonalizationQuiz from '@/components/PersonalizationQuiz.jsx';
import FreeSedesAccessCta from '@/components/FreeSedesAccessCta.jsx';
import LeadNurtureOptInPanel from '@/components/LeadNurtureOptInPanel.jsx';

const StudentOnboardingPage = () => {
  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>Começar na Central Nortis - NORTIS CONCURSOS</title>
        <meta name="description" content="Onboarding do aluno Nortis para liberar acesso SEDES-DF, escolher especialidade e iniciar diagnóstico." />
      </Helmet>
      <div className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link to="/minha-conta" className="mb-6 inline-flex items-center text-sm font-semibold text-[hsl(var(--accent))] hover:underline">
            <ChevronLeft className="mr-1 h-4 w-4" />Central Nortis
          </Link>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent))]">Primeiros passos</p>
          <h1 className="mt-2 text-3xl font-bold">Configurar seu estudo SEDES-DF</h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Cada aluno precisa criar conta, entrar e liberar o acesso. Depois disso, cargo e especialidade organizam edital, questões, simulados e plano.
          </p>

          <section className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-card p-5">
              <p className="text-sm font-bold text-[hsl(var(--accent))]">1</p>
              <h2 className="mt-1 font-semibold">Acesso</h2>
              <p className="mt-2 text-sm text-muted-foreground">Libere a matrícula gratuita provisória de lançamento.</p>
              <FreeSedesAccessCta className="mt-4 w-full" />
            </div>
            <div className="rounded-2xl bg-card p-5">
              <p className="text-sm font-bold text-[hsl(var(--accent))]">2</p>
              <h2 className="mt-1 font-semibold">Perfil</h2>
              <p className="mt-2 text-sm text-muted-foreground">Escolha cargo, especialidade, rotina e dificuldade principal.</p>
              <UserCheck className="mt-4 h-7 w-7 text-[hsl(var(--accent))]" aria-hidden="true" />
            </div>
            <div className="rounded-2xl bg-card p-5">
              <p className="text-sm font-bold text-[hsl(var(--accent))]">3</p>
              <h2 className="mt-1 font-semibold">Diagnóstico</h2>
              <p className="mt-2 text-sm text-muted-foreground">Comece com evidência objetiva antes de planejar a semana.</p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link to="/minha-conta/diagnostico">
                  Diagnóstico
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </section>

          <div className="mt-8">
            <PersonalizationQuiz userId={user?.id} />
          </div>

          <LeadNurtureOptInPanel />
        </div>
      </div>
    </>
  );
};

export default StudentOnboardingPage;
