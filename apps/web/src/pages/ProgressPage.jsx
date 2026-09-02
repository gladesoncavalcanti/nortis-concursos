import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  Award,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Flame,
  ListChecks,
  Loader2,
  RotateCcw,
  Target,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { getMyProgress, submitReviewAttempt } from '@/api/progress.js';
import StudyTimeHistoryPanel from '@/components/StudyTimeHistoryPanel.jsx';
import FlashcardInsightsPanel from '@/components/FlashcardInsightsPanel.jsx';
import SmartReviewPanel from '@/components/SmartReviewPanel.jsx';
import SubjectPerformancePanel from '@/components/SubjectPerformancePanel.jsx';
import { buildSmartReviewQueue, buildSubjectPerformance } from '@/api/studentJourneyModel.js';

const ACTIVITY_LABELS = {
  question: 'Questão',
  simulation: 'Simulado',
  flashcard: 'Flashcard',
  plan: 'Plano',
};

const formatActivityDate = (value) => new Date(value).toLocaleString('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

const ProgressPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewError, setReviewError] = useState(null);
  const [selected, setSelected] = useState({});
  const [submitting, setSubmitting] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const loadProgress = async () => {
    const { data: loaded, error: loadError } = await getMyProgress();
    setData(loaded);
    setError(loadError);
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;
    getMyProgress().then(({ data: loaded, error: loadError }) => {
      if (!mounted) return;
      setData(loaded);
      setError(loadError);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const reviewQuestion = async (questionId) => {
    const selectedOptionId = selected[questionId];
    if (!selectedOptionId || submitting) return;

    setSubmitting(questionId);
    setReviewError(null);
    const result = await submitReviewAttempt(questionId, selectedOptionId);

    if (result.error) {
      setReviewError(result.error);
    } else {
      setFeedback({ questionId, ...result.data });
      setSelected((current) => {
        const next = { ...current };
        delete next[questionId];
        return next;
      });
      await loadProgress();
    }
    setSubmitting(null);
  };

  const cards = data ? [
    ['Questões respondidas', data.answered],
    ['Taxa de acerto', `${data.accuracy}%`],
    ['Simulados concluídos', data.completedSimulations],
  ] : [];
  const maxDailyActivity = Math.max(1, ...(data?.activity.days.map((day) => day.total) ?? [0]));
  const smartReviewQueue = data ? buildSmartReviewQueue({
    progress: data,
    simulations: data.simulationSessions,
  }) : [];
  const subjectPerformance = data ? buildSubjectPerformance({
    progress: data,
    planItems: data.planItems ?? [],
  }) : [];

  return <>
    <Helmet><title>Progresso e revisão - NORTIS CONCURSOS</title></Helmet>
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Link to="/minha-conta" className="mb-6 inline-flex items-center text-sm font-semibold text-[hsl(var(--accent))] hover:underline">
          <ChevronLeft className="mr-1 h-4 w-4" />Central Nortis
        </Link>
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent))]">Central Nortis</p>
        <h1 className="mt-2 text-3xl font-bold">Progresso e revisão</h1>
        <p className="mt-3 text-muted-foreground">Indicadores calculados a partir das suas atividades reais.</p>

        {loading ? <Loader2 className="mx-auto mt-16 h-8 w-8 animate-spin" /> : error ? (
          <p className="mt-8 rounded-2xl bg-card p-6 text-muted-foreground">{error}</p>
        ) : <>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {cards.map(([label, value]) => <div key={label} className="rounded-2xl bg-card p-6">
              <BarChart3 className="mb-3 h-6 w-6 text-[hsl(var(--accent))]" />
              <p className="text-3xl font-bold">{value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </div>)}
          </div>

          <StudyTimeHistoryPanel history={data.studyTime} />

          <FlashcardInsightsPanel insights={data.flashcardInsights} compact />

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <SmartReviewPanel queue={smartReviewQueue} compact />
            <SubjectPerformancePanel subjects={subjectPerformance.slice(0, 6)} compact />
          </div>

          <section className="mt-8 rounded-2xl bg-card p-6">
            <div className="flex items-center gap-3">
              <Clock3 className="h-6 w-6 text-[hsl(var(--accent))]" />
              <div>
                <h2 className="text-xl font-bold">Atividade nos últimos 7 dias</h2>
                <p className="text-sm text-muted-foreground">Questões, simulados, flashcards e tarefas concluídas formam seu ritmo real.</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-7 gap-2" aria-label="Atividades diárias dos últimos sete dias">
              {data.activity.days.map((day) => (
                <div key={day.date} className="text-center">
                  <div className="flex h-28 items-end justify-center rounded-lg bg-muted p-1">
                    <div
                      className="w-full rounded-md bg-[hsl(var(--accent))]"
                      style={{ height: day.total ? `${Math.max(10, (day.total / maxDailyActivity) * 100)}%` : '4px' }}
                      role="img"
                      aria-label={`${day.total} ${day.total === 1 ? 'atividade' : 'atividades'} em ${new Date(`${day.date}T12:00:00`).toLocaleDateString('pt-BR')}`}
                    />
                  </div>
                  <p className="mt-2 text-xs font-semibold">{new Date(`${day.date}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</p>
                  <p className="text-xs text-muted-foreground">{day.total}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 border-t border-border pt-5">
              <h3 className="flex items-center gap-2 font-semibold"><ListChecks className="h-5 w-5" />Histórico recente</h3>
              {data.activity.recent.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">Sua próxima atividade aparecerá aqui.</p> : (
                <ol className="mt-4 space-y-3">
                  {data.activity.recent.map((item, index) => (
                    <li key={`${item.type}-${item.occurredAt}-${index}`} className="flex flex-col justify-between gap-1 rounded-xl bg-muted p-4 sm:flex-row sm:items-center">
                      <div><span className="text-xs font-bold uppercase tracking-wide text-[hsl(var(--accent))]">{ACTIVITY_LABELS[item.type]}</span><p className="mt-1 text-sm font-medium">{item.label}</p></div>
                      <time className="text-xs text-muted-foreground" dateTime={item.occurredAt}>{formatActivityDate(item.occurredAt)}</time>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </section>

          <section className="mt-8 rounded-2xl bg-card p-6">
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-[hsl(var(--accent))]" />
              <div>
                <h2 className="text-xl font-bold">Diagnóstico por conteúdo</h2>
                <p className="text-sm text-muted-foreground">Baseado na sua resposta mais recente em cada questão.</p>
              </div>
            </div>
            {data.contentDiagnosis.length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">Ainda não há respostas suficientes. Comece pelo banco de questões para gerar evidências por conteúdo.</p>
            ) : <div className="mt-5 space-y-3">
              {data.contentDiagnosis.map((item) => <div key={item.title} className="rounded-xl bg-muted p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{item.title}</h3>
                  <span className="font-bold">{item.accuracy}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-background">
                  <div className="h-full bg-[hsl(var(--accent))]" style={{ width: `${item.accuracy}%` }} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {item.answered} {item.answered === 1 ? 'questão avaliada' : 'questões avaliadas'} · {item.evidence === 'sufficient' ? 'evidência suficiente para priorização inicial' : 'coletando mais evidências'}
                </p>
              </div>)}
            </div>}
          </section>

          <section className="mt-8 rounded-2xl bg-card p-6">
            <div className="flex items-center gap-3">
              <Flame className="h-6 w-6 text-[hsl(var(--accent))]" />
              <div>
                <h2 className="text-xl font-bold">Ritmo e marcos</h2>
                <p className="text-sm text-muted-foreground">Sequência atual: {data.streak} {data.streak === 1 ? 'dia' : 'dias'}</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {data.achievements.map((item) => <div key={item.id} className={`rounded-xl border p-4 ${item.unlocked ? 'border-[hsl(var(--accent))]/50 bg-[hsl(var(--accent))]/10' : 'border-border bg-muted/40 opacity-70'}`}>
                <div className="flex items-center gap-2"><Award className="h-5 w-5" /><h3 className="font-semibold">{item.title}</h3></div>
                <p className="mt-2 text-xs text-muted-foreground">{item.description}</p>
              </div>)}
            </div>
          </section>

          <section className="mt-8 rounded-2xl bg-card p-6">
            <div className="flex items-center gap-3">
              <RotateCcw className="h-6 w-6 text-[hsl(var(--accent))]" />
              <div>
                <h2 className="text-xl font-bold">Revisar agora</h2>
                <p className="text-sm text-muted-foreground">Refaça os erros recentes sem apagar o histórico do seu diagnóstico.</p>
              </div>
            </div>

            {reviewError && <p role="alert" className="mt-5 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{reviewError}</p>}
            {feedback && <div aria-live="polite" className={`mt-5 rounded-xl p-4 ${feedback.is_correct ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
              <p className="flex items-center font-semibold">
                {feedback.is_correct ? <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-600" /> : <XCircle className="mr-2 h-5 w-5 text-red-600" />}
                {feedback.is_correct ? 'Revisão concluída: a questão saiu da fila.' : 'Ainda precisa de revisão. Tente novamente.'}
              </p>
              {feedback.explanation && <p className="mt-2 text-sm text-muted-foreground">{feedback.explanation}</p>}
            </div>}

            {data.review.length === 0 ? <div className="mt-6 text-center">
              <CheckCircle2 className="mx-auto mb-3 h-9 w-9 text-emerald-600" />
              <p className="text-sm text-muted-foreground">Nenhuma questão pendente de revisão.</p>
            </div> : <ul className="mt-5 space-y-4">
              {data.review.map((item) => {
                const question = item.questions;
                const options = question?.question_options ?? [];
                return <li key={item.question_id} className="rounded-xl bg-muted p-4">
                  <p className="font-medium">{question?.statement || 'Questão para revisão'}</p>
                  {question?.syllabus_nodes?.title && <p className="mt-1 text-xs text-muted-foreground">{question.syllabus_nodes.title}</p>}
                  {options.length > 0 ? <fieldset className="mt-4 space-y-2" disabled={submitting === item.question_id}>
                    <legend className="sr-only">Escolha uma alternativa para revisar esta questão</legend>
                    {options.map((option) => <label key={option.id} className="flex cursor-pointer gap-3 rounded-lg border border-border bg-card p-3">
                      <input
                        type="radio"
                        name={`review-${item.question_id}`}
                        value={option.id}
                        checked={selected[item.question_id] === option.id}
                        onChange={() => setSelected((current) => ({ ...current, [item.question_id]: option.id }))}
                      />
                      <span><strong>{option.label}.</strong> {option.option_text}</span>
                    </label>)}
                  </fieldset> : <p className="mt-3 text-sm text-muted-foreground">As alternativas desta questão não estão disponíveis agora.</p>}
                  <Button
                    className="mt-4"
                    disabled={!selected[item.question_id] || submitting === item.question_id || options.length === 0}
                    onClick={() => reviewQuestion(item.question_id)}
                  >
                    {submitting === item.question_id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Corrigir revisão
                  </Button>
                </li>;
              })}
            </ul>}
          </section>
        </>}
      </div>
    </div>
  </>;
};

export default ProgressPage;
