import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ChevronLeft, ClipboardCheck, Clock3, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import {
  answerSimulationQuestion,
  finishSimulation,
  getSimulationHub,
  getMySimulationReview,
  startSimulation,
} from '@/api/simulations.js';
import {
  buildSimulationReportCard,
  buildSavedSimulationAnswers,
  findOpenSimulationSession,
  formatSimulationTime,
  getSimulationRemainingSeconds,
} from '@/api/simulationSessionModel.js';

const SimulationsPage = () => {
  const [hub, setHub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [active, setActive] = useState(null);
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(null);
  const [review, setReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [clock, setClock] = useState(Date.now());

  useEffect(() => {
    let mounted = true;
    getSimulationHub().then(({ data, error: loadError }) => {
      if (!mounted) return;
      setHub(data); setError(loadError); setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!active || !session || !active.time_limit_minutes || result) return undefined;
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [active, session, result]);

  const remainingSeconds = useMemo(() => active && session
    ? getSimulationRemainingSeconds(session.started_at, active.time_limit_minutes, new Date(clock))
    : null, [active, session, clock]);

  const questions = active?.simulation_questions ?? [];
  const answeredCount = Object.keys(answers).length;
  const formatCompletedAt = (value) => value
    ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
    : '—';

  const begin = async (simulation) => {
    setBusy(true); setError(null);
    const { data: openedSession, error: startError } = await startSimulation(simulation.id);
    if (startError) setError(startError);
    else {
      setHub((current) => ({
        ...current,
        sessions: [openedSession, ...current.sessions.filter((item) => item.id !== openedSession.id)],
      }));
      setActive(simulation);
      setSession(openedSession);
      setAnswers(buildSavedSimulationAnswers(hub.answers, openedSession.id));
      setResult(null);
      setClock(Date.now());
    }
    setBusy(false);
  };

  const chooseAnswer = async (questionId, optionId) => {
    if (!session || savingQuestion || remainingSeconds === 0) return;
    const previous = answers[questionId];
    setAnswers((current) => ({ ...current, [questionId]: optionId }));
    setSavingQuestion(questionId); setError(null);
    const saveError = await answerSimulationQuestion(session.id, questionId, optionId);
    if (saveError) {
      setError(saveError);
      setAnswers((current) => {
        const next = { ...current };
        if (previous) next[questionId] = previous;
        else delete next[questionId];
        return next;
      });
    } else {
      setHub((current) => ({
        ...current,
        answers: [
          { session_id: session.id, question_id: questionId, selected_option_id: optionId, answered_at: new Date().toISOString() },
          ...current.answers.filter((item) => !(item.session_id === session.id && item.question_id === questionId)),
        ],
      }));
    }
    setSavingQuestion(null);
  };

  const conclude = async () => {
    if (!session || busy) return;
    setBusy(true); setError(null);
    const { data: summary, error: finishError } = await finishSimulation(session.id);
    if (finishError) setError(finishError);
    else {
      setResult(summary);
      setHub((current) => ({
        ...current,
        sessions: current.sessions.map((item) => item.id === session.id
          ? { ...item, status: 'completed', completed_at: new Date().toISOString(), ...summary }
          : item),
      }));
      setReviewLoading(true);
      const reviewResult = await getMySimulationReview(session.id);
      setReview(reviewResult.data);
      if (reviewResult.error) setError(reviewResult.error);
      setReviewLoading(false);
    }
    setBusy(false);
  };

  const closeResult = () => {
    setActive(null); setSession(null); setAnswers({}); setResult(null); setReview(null); setError(null);
  };

  return (
    <>
      <Helmet><title>Simulados - NORTIS CONCURSOS</title></Helmet>
      <div className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link to="/minha-conta" className="mb-6 inline-flex items-center text-sm font-semibold text-[hsl(var(--accent))] hover:underline"><ChevronLeft className="mr-1 h-4 w-4" />Central Nortis</Link>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent))]">Central Nortis</p>
          <h1 className="mt-2 text-3xl font-bold">Simulados</h1>
          <p className="mt-3 text-muted-foreground">Suas respostas são salvas durante a prova. Se a página for recarregada, a sessão em andamento poderá ser retomada.</p>

          {loading ? <Loader2 className="mx-auto mt-16 h-8 w-8 animate-spin" /> : error && !hub ? <p className="mt-8 rounded-xl bg-card p-6 text-muted-foreground">{error}</p> : !active ? (
            hub.simulations.length === 0 ? <div className="mt-8 rounded-2xl bg-card p-8 text-center"><ClipboardCheck className="mx-auto mb-4 h-10 w-10 text-muted-foreground" /><h2 className="text-xl font-semibold">Simulados em preparação</h2><p className="mt-2 text-sm text-muted-foreground">A estrutura está pronta. As provas serão publicadas após validação editorial.</p></div> : (
              <div className="mt-8 space-y-4">{hub.simulations.map((simulation) => {
                const openSession = findOpenSimulationSession(hub.sessions, simulation.id);
                const savedCount = openSession ? Object.keys(buildSavedSimulationAnswers(hub.answers, openSession.id)).length : 0;
                const report = buildSimulationReportCard(hub.sessions, simulation.id);
                return <article key={simulation.id} className="rounded-2xl bg-card p-6"><div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><h2 className="text-xl font-semibold">{simulation.title}</h2>{simulation.description && <p className="mt-2 text-sm text-muted-foreground">{simulation.description}</p>}<p className="mt-3 text-xs text-muted-foreground">{simulation.simulation_questions.length} questões{simulation.time_limit_minutes ? ` · ${simulation.time_limit_minutes} minutos` : ''} · modo prova sem feedback durante a tentativa</p></div>{report.accuracy !== null && <div className="rounded-xl bg-muted p-4 text-center"><p className="text-3xl font-bold">{report.accuracy}%</p><p className="text-xs text-muted-foreground">último boletim</p></div>}</div>{report.latest && <div className="mt-4 rounded-xl bg-muted p-4"><p className="text-sm font-semibold">Último resultado: {report.latest.correct_count}/{report.latest.question_count} acertos · {report.accuracy}%</p><p className="mt-1 text-xs text-muted-foreground">{report.status === 'reinforce' ? 'Prioridade: revisar fundamentos antes de repetir.' : report.status === 'attention' ? 'Prioridade: reforçar pontos instáveis.' : 'Resultado estável: mantenha simulados periódicos.'}{report.delta !== null ? ` Variação frente à tentativa anterior: ${report.delta > 0 ? '+' : ''}${report.delta} p.p.` : ''}</p>{report.history.length > 1 && <ol className="mt-3 grid gap-2 sm:grid-cols-2">{report.history.map((attempt, attemptIndex) => <li key={attempt.id} className="rounded-lg bg-card p-3 text-xs text-muted-foreground"><strong className="text-foreground">Tentativa {report.history.length - attemptIndex}</strong><br />{attempt.correct_count}/{attempt.question_count} acertos · {formatCompletedAt(attempt.completed_at)}</li>)}</ol>}</div>}{openSession && <p className="mt-2 text-sm font-semibold text-[hsl(var(--accent))]">Sessão em andamento · {savedCount} respostas salvas</p>}<div className="mt-4 flex flex-col gap-3 sm:flex-row"><Button disabled={busy} onClick={() => begin(simulation)}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{openSession ? 'Continuar simulado' : report.latest ? 'Refazer simulado' : 'Iniciar simulado'}</Button>{report.latest && <Button asChild variant="outline"><Link to="/minha-conta/progresso">Ver revisão inteligente</Link></Button>}</div></article>;
              })}</div>
            )
          ) : result ? (
            <div className="mt-8 space-y-6">
              <div className="rounded-2xl bg-card p-8 text-center"><ClipboardCheck className="mx-auto mb-4 h-10 w-10 text-[hsl(var(--accent))]" /><h2 className="text-2xl font-bold">Boletim do simulado</h2><p className="mt-3 text-lg">{result.correct_count} acertos de {result.question_count} questões</p><p className="mt-2 text-sm text-muted-foreground">Use o boletim para revisar blocos instáveis. O resultado é pedagógico e não representa nota oficial da banca.</p><Button className="mt-6" variant="outline" onClick={closeResult}>Ver outros simulados</Button></div>
              {reviewLoading ? <div className="rounded-2xl bg-card p-6 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /><p className="mt-2 text-sm text-muted-foreground">Montando revisão pós-prova...</p></div> : review && <section className="rounded-2xl bg-card p-6"><h3 className="text-xl font-bold">Revisão pós-prova por bloco</h3><p className="mt-2 text-sm text-muted-foreground">Agora você vê o desempenho por conteúdo e os erros que precisam voltar para revisão.</p><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-muted p-4"><p className="text-2xl font-bold">{review.summary.accuracy}%</p><p className="text-xs text-muted-foreground">aproveitamento</p></div><div className="rounded-xl bg-muted p-4"><p className="text-2xl font-bold">{review.summary.incorrect}</p><p className="text-xs text-muted-foreground">erros para revisar</p></div><div className="rounded-xl bg-muted p-4"><p className="text-2xl font-bold">{review.summary.contents.length}</p><p className="text-xs text-muted-foreground">blocos avaliados</p></div></div><div className="mt-5 space-y-3">{review.summary.contents.map((content) => <article key={content.id} className="rounded-xl bg-muted p-4"><div className="flex items-center justify-between gap-3"><h4 className="font-semibold">{content.title}</h4><span className="font-bold">{content.accuracy}%</span></div><p className="mt-1 text-xs text-muted-foreground">{content.correct}/{content.total} acertos · {content.status === 'weak' ? 'reforçar antes de repetir a prova' : content.status === 'attention' ? 'manter em revisão' : 'estável'}</p></article>)}</div>{review.summary.incorrectQuestions.length > 0 && <div className="mt-6 border-t border-border pt-5"><h4 className="font-semibold">Erros da tentativa</h4><ol className="mt-3 space-y-3">{review.summary.incorrectQuestions.map((item) => <li key={item.question_id} className="rounded-xl bg-muted p-4"><p className="text-sm font-medium">{item.question_order}. {item.statement}</p><p className="mt-2 text-xs text-muted-foreground">Marcada: {item.selected_label}. {item.selected_text}</p><p className="mt-1 text-xs text-muted-foreground">Correta: {item.correct_label}. {item.correct_text}</p>{item.explanation && <p className="mt-2 text-xs text-muted-foreground">{item.explanation}</p>}</li>)}</ol></div>}</section>}
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              <div className="sticky top-20 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[hsl(var(--accent))]/30 bg-card p-4 shadow-sm"><div><h2 className="text-xl font-bold">{active.title}</h2><p className="text-sm text-muted-foreground">{answeredCount} de {questions.length} respostas salvas</p></div><div className={`flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-lg font-bold ${remainingSeconds === 0 ? 'bg-red-500/10 text-red-700 dark:text-red-400' : 'bg-muted'}`} role="timer" aria-label={remainingSeconds === null ? 'Simulado sem limite de tempo' : `${remainingSeconds} segundos restantes`}><Clock3 className="h-5 w-5" />{formatSimulationTime(remainingSeconds)}</div></div>
              {error && <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{error}</p>}
              {questions.map((link, index) => {
                const question = link.questions;
                return <fieldset key={question.id} className="rounded-2xl bg-card p-6" disabled={remainingSeconds === 0 || savingQuestion === question.id}><legend className="font-semibold">{index + 1}. {question.statement}</legend><div className="mt-4 space-y-3">{question.question_options.map((option) => <label key={option.id} className="flex cursor-pointer gap-3 rounded-xl border p-3"><input type="radio" name={question.id} checked={answers[question.id] === option.id} onChange={() => chooseAnswer(question.id, option.id)} /><span><strong>{option.label}.</strong> {option.option_text}</span></label>)}</div>{savingQuestion === question.id && <p role="status" className="mt-3 flex items-center text-xs text-muted-foreground"><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Salvando resposta...</p>}</fieldset>;
              })}
              {remainingSeconds === 0 && <p role="status" className="rounded-xl bg-amber-500/10 p-4 text-sm font-semibold">O tempo terminou. As respostas já salvas serão consideradas no resultado.</p>}
              <Button disabled={busy || Boolean(savingQuestion)} onClick={conclude}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{remainingSeconds === 0 ? 'Finalizar e ver resultado' : 'Concluir simulado'}</Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SimulationsPage;
