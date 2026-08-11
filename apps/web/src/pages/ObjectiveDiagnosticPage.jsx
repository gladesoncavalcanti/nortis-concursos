import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ClipboardCheck,
  History,
  Loader2,
  Minus,
  RefreshCw,
  TrendingUp,
  TriangleAlert,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import {
  getObjectiveDiagnostic,
  startDiagnosticCycle,
  submitDiagnosticAnswer,
} from '@/api/objectiveDiagnostic.js';

const CONFIDENCE_LABELS = ['Não estudei', 'Muita dificuldade', 'Alguma dificuldade', 'Estou seguro', 'Domino bem'];
const TREND_STYLES = {
  improved: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  stable: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
  reinforce: 'bg-amber-500/10 text-amber-800 dark:text-amber-400',
  initial: 'bg-muted text-muted-foreground',
  pending: 'bg-muted text-muted-foreground',
};

const formatDate = (value) => value
  ? new Date(value).toLocaleDateString('pt-BR')
  : 'em andamento';

const TrendBadge = ({ trend }) => {
  const Icon = trend.key === 'improved'
    ? TrendingUp
    : trend.key === 'reinforce'
      ? TriangleAlert
      : Minus;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${TREND_STYLES[trend.key]}`}>
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {trend.label}{trend.delta === null ? '' : ` (${trend.delta > 0 ? '+' : ''}${trend.delta} p.p.)`}
    </span>
  );
};

const ObjectiveDiagnosticPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState({});
  const [submitting, setSubmitting] = useState(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let mounted = true;
    getObjectiveDiagnostic().then((result) => {
      if (!mounted) return;
      setData(result.data);
      setError(result.error);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const refresh = async () => {
    const result = await getObjectiveDiagnostic();
    setData(result.data);
    setError(result.error);
    return !result.error;
  };

  const startCycle = async () => {
    if (starting) return;
    setStarting(true);
    setError(null);
    const result = await startDiagnosticCycle();
    if (result.error) setError(result.error);
    else {
      setSelected({});
      await refresh();
    }
    setStarting(false);
  };

  const answer = async (questionId) => {
    if (!selected[questionId] || submitting || data.summary.resultsByQuestion[questionId]) return;
    setSubmitting(questionId);
    setError(null);
    const result = await submitDiagnosticAnswer(questionId, selected[questionId]);
    if (result.error) setError(result.error);
    else await refresh();
    setSubmitting(null);
  };

  const currentCycle = data?.currentCycle;
  const cycleOpen = currentCycle?.status === 'open';

  return <>
    <Helmet><title>Diagnóstico e evolução - NORTIS CONCURSOS</title></Helmet>
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Link to="/minha-conta" className="mb-6 inline-flex items-center text-sm font-semibold text-[hsl(var(--accent))] hover:underline">
          <ChevronLeft className="mr-1 h-4 w-4" />Central Nortis
        </Link>
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent))]">Central Nortis</p>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">Diagnóstico objetivo e evolução</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">Responda questões autorais vinculadas ao seu edital, preserve cada ciclo e acompanhe a evolução das evidências de aprendizagem.</p>
        <p className="mt-2 max-w-3xl text-xs text-muted-foreground">A autopercepção e o desempenho objetivo permanecem separados. Ferramenta pedagógica e independente, sem valor de nota ou resultado oficial do Instituto Quadrix.</p>

        {loading ? <div className="mt-8 flex justify-center rounded-2xl bg-card py-16"><Loader2 className="h-8 w-8 animate-spin" /></div>
          : error && !data ? <div className="mt-8 rounded-2xl bg-card p-8 text-center"><AlertCircle className="mx-auto mb-3 h-8 w-8 text-destructive"/><p>{error}</p></div>
          : data?.needsSpecialty ? <div className="mt-8 rounded-2xl bg-card p-8 text-center"><ClipboardCheck className="mx-auto mb-3 h-10 w-10 text-muted-foreground"/><h2 className="text-xl font-bold">Escolha sua especialidade primeiro</h2><p className="mt-2 text-sm text-muted-foreground">O diagnóstico só libera questões correspondentes ao cargo e à especialidade salvos no seu perfil.</p><Link to="/minha-conta"><Button className="mt-5">Definir especialidade</Button></Link></div>
          : data.questions.length === 0 ? <div className="mt-8 rounded-2xl bg-card p-8 text-center"><ClipboardCheck className="mx-auto mb-3 h-10 w-10 text-muted-foreground"/><h2 className="text-xl font-bold">Diagnóstico ainda não disponível para {data.specialty?.title || 'esta especialidade'}</h2><p className="mt-2 text-sm text-muted-foreground">O motor está pronto, mas as questões desta área ainda dependem de validação editorial. Nenhum resultado será simulado.</p></div>
          : <>
            <section className="mt-8 rounded-2xl border border-[hsl(var(--accent))]/30 bg-[hsl(var(--accent))]/10 p-6">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[hsl(var(--accent))]">{data.specialty?.title}</p>
              {!currentCycle ? <div className="mt-3"><h2 className="text-xl font-bold">Crie sua referência inicial</h2><p className="mt-2 max-w-2xl text-sm text-muted-foreground">O primeiro ciclo registra a linha de base. Depois dele, você poderá iniciar reavaliações sem apagar o histórico anterior.</p><Button className="mt-5" disabled={starting} onClick={startCycle}>{starting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Iniciar diagnóstico inicial</Button></div>
                : <div className="mt-3"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold">Ciclo {currentCycle.cycle_number} · {cycleOpen ? 'em andamento' : 'concluído'}</p><p className="mt-1 text-3xl font-bold">{data.summary.answered}/{data.summary.total}</p><p className="text-sm text-muted-foreground">questões respondidas neste ciclo</p></div>{data.summary.accuracy !== null && <div className="text-right"><p className="text-3xl font-bold">{data.summary.accuracy}%</p><p className="text-sm text-muted-foreground">desempenho objetivo atual</p></div>}</div>
                  {!cycleOpen && <div className="mt-5 flex flex-wrap items-center gap-3"><p role="status" className="text-sm font-semibold text-emerald-600">Ciclo preservado no histórico. O plano semanal já pode usar este resultado.</p><Button variant="outline" disabled={starting} onClick={startCycle}><RefreshCw className="mr-2 h-4 w-4"/>{starting ? 'Iniciando...' : 'Iniciar reavaliação'}</Button><Link to="/minha-conta/plano" className="text-sm font-semibold text-[hsl(var(--accent))] hover:underline">Atualizar plano semanal</Link></div>}
                </div>}
            </section>

            {currentCycle && <div className="mt-6 space-y-6">{data.questions.map((question, index) => {
              const result = data.summary.resultsByQuestion[question.id];
              const correctOption = result && question.question_options.find((option) => option.id === result.correct_option_id);
              return <article key={question.id} className="rounded-2xl bg-card p-6">
                <p className="text-xs font-bold uppercase text-[hsl(var(--accent))]">Questão {index + 1} · {question.syllabus_nodes?.title}</p>
                <h2 className="mt-2 text-lg font-semibold">{question.statement}</h2>
                <fieldset className="mt-5 space-y-3" disabled={!cycleOpen || Boolean(result) || submitting === question.id}><legend className="sr-only">Alternativas da questão {index + 1}</legend>{question.question_options.map((option) => <label key={option.id} className="flex cursor-pointer gap-3 rounded-xl border border-border p-4"><input type="radio" name={`diagnostic-${currentCycle.id}-${question.id}`} value={option.id} checked={selected[question.id] === option.id} onChange={() => setSelected((current) => ({ ...current, [question.id]: option.id }))}/><span><strong>{option.label}.</strong> {option.option_text}</span></label>)}</fieldset>
                {cycleOpen && !result && <Button className="mt-5" disabled={!selected[question.id] || submitting} onClick={() => answer(question.id)}>{submitting === question.id && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Registrar resposta</Button>}
                {result && <div aria-live="polite" className={`mt-5 rounded-xl p-4 ${result.is_correct ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}><p className="flex items-center font-semibold">{result.is_correct ? <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-600"/> : <XCircle className="mr-2 h-5 w-5 text-red-600"/>}{result.is_correct ? 'Evidência de acerto' : 'Evidência de dificuldade'}</p>{!result.is_correct && correctOption && <p className="mt-2 text-sm">Alternativa correta: <strong>{correctOption.label}</strong></p>}<p className="mt-2 text-sm text-muted-foreground">{result.explanation}</p></div>}
                <p className="mt-4 text-xs text-muted-foreground">Autoria: {question.authorship}. Referência de elaboração: {question.source_reference}</p>
              </article>;
            })}</div>}

            {data.evolution.cycles.length > 0 && <section className="mt-8 rounded-2xl bg-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="flex items-center gap-2 text-xl font-bold"><History className="h-5 w-5"/>Histórico de evolução objetiva</h2><p className="mt-2 text-sm text-muted-foreground">A referência inicial e o ciclo mais recente são comparados sem apagar resultados anteriores.</p></div><TrendBadge trend={data.evolution.overall}/></div>
              <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{data.evolution.cycles.map((cycle) => <li key={cycle.id} className="rounded-xl bg-muted p-4"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Ciclo {cycle.cycleNumber}</p><p className="mt-2 text-2xl font-bold">{cycle.accuracy === null ? '—' : `${cycle.accuracy}%`}</p><p className="mt-1 text-xs text-muted-foreground">{cycle.answered} resposta(s) · {cycle.status === 'completed' ? `concluído em ${formatDate(cycle.completedAt)}` : 'em andamento'}</p></li>)}</ol>
            </section>}

            {data.evolution.comparison.length > 0 && <section className="mt-8 rounded-2xl bg-card p-6"><h2 className="text-xl font-bold">Autopercepção × desempenho objetivo</h2><p className="mt-2 text-sm text-muted-foreground">A percepção de 1 a 5 e os acertos são sinais independentes. Eles orientam prioridades, mas não formam uma nota combinada.</p><div className="mt-5 space-y-3">{data.evolution.comparison.map((item) => <div key={item.subjectId} className="rounded-xl bg-muted p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">{item.title}</h3><TrendBadge trend={item.trend}/></div><div className="mt-3 grid gap-2 text-sm sm:grid-cols-3"><p><span className="text-muted-foreground">Autopercepção:</span> {item.selfConfidence ? `${item.selfConfidence}/5 · ${CONFIDENCE_LABELS[item.selfConfidence - 1]}` : 'não informada'}</p><p><span className="text-muted-foreground">Resultado inicial:</span> {item.initialAccuracy === null ? 'sem evidência' : `${item.initialAccuracy}%`}</p><p><span className="text-muted-foreground">Resultado atual:</span> {item.currentAccuracy === null ? 'aguardando resposta' : `${item.currentAccuracy}%`}</p></div></div>)}</div></section>}
          </>}
        {error && data && <p role="alert" className="mt-5 text-sm text-destructive">{error}</p>}
      </div>
    </div>
  </>;
};

export default ObjectiveDiagnosticPage;
