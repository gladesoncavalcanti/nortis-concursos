import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, ChevronLeft, ClipboardCheck, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { buildObjectiveDiagnostic } from '@/api/objectiveDiagnosticModel.js';
import { getObjectiveDiagnostic, submitDiagnosticAnswer } from '@/api/objectiveDiagnostic.js';

const CONFIDENCE_LABELS = ['Não estudei', 'Muita dificuldade', 'Alguma dificuldade', 'Estou seguro', 'Domino bem'];

const ObjectiveDiagnosticPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState({});
  const [submitting, setSubmitting] = useState(null);

  useEffect(() => {
    let mounted = true;
    getObjectiveDiagnostic().then((result) => {
      if (!mounted) return;
      setData(result.data); setError(result.error); setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const answer = async (questionId) => {
    if (!selected[questionId] || submitting || data.summary.resultsByQuestion[questionId]) return;
    setSubmitting(questionId); setError(null);
    const result = await submitDiagnosticAnswer(questionId, selected[questionId]);
    if (result.error) setError(result.error);
    else {
      const results = [...data.results.filter((item) => item.question_id !== questionId), {
        ...result.data,
        question_id: questionId,
        selected_option_id: selected[questionId],
      }];
      setData((current) => ({
        ...current,
        results,
        summary: buildObjectiveDiagnostic({
          questions: current.questions,
          results,
          selfAssessments: current.selfAssessments,
        }),
      }));
    }
    setSubmitting(null);
  };

  return <>
    <Helmet><title>Diagnóstico objetivo - NORTIS CONCURSOS</title></Helmet>
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Link to="/minha-conta" className="mb-6 inline-flex items-center text-sm font-semibold text-[hsl(var(--accent))] hover:underline">
          <ChevronLeft className="mr-1 h-4 w-4" />Central Nortis
        </Link>
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent))]">Central Nortis</p>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">Diagnóstico objetivo inicial</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">Responda questões autorais vinculadas ao seu edital. O resultado mostra evidências de aprendizagem e permanece separado da sua autopercepção.</p>
        <p className="mt-2 max-w-3xl text-xs text-muted-foreground">Ferramenta pedagógica e independente. Não representa nota, classificação ou resultado oficial do Instituto Quadrix.</p>

        {loading ? <div className="mt-8 flex justify-center rounded-2xl bg-card py-16"><Loader2 className="h-8 w-8 animate-spin" /></div>
          : error && !data ? <div className="mt-8 rounded-2xl bg-card p-8 text-center"><AlertCircle className="mx-auto mb-3 h-8 w-8 text-destructive"/><p>{error}</p></div>
          : data?.needsSpecialty ? <div className="mt-8 rounded-2xl bg-card p-8 text-center"><ClipboardCheck className="mx-auto mb-3 h-10 w-10 text-muted-foreground"/><h2 className="text-xl font-bold">Escolha sua especialidade primeiro</h2><p className="mt-2 text-sm text-muted-foreground">O diagnóstico só libera questões correspondentes ao cargo e à especialidade salvos no seu perfil.</p><Link to="/minha-conta"><Button className="mt-5">Definir especialidade</Button></Link></div>
          : data.questions.length === 0 ? <div className="mt-8 rounded-2xl bg-card p-8 text-center"><ClipboardCheck className="mx-auto mb-3 h-10 w-10 text-muted-foreground"/><h2 className="text-xl font-bold">Piloto ainda não disponível para {data.specialty?.title || 'esta especialidade'}</h2><p className="mt-2 text-sm text-muted-foreground">O motor está pronto, mas as questões desta área ainda dependem de validação editorial. Nenhum resultado será simulado.</p></div>
          : <>
            <section className="mt-8 rounded-2xl border border-[hsl(var(--accent))]/30 bg-[hsl(var(--accent))]/10 p-6">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[hsl(var(--accent))]">Piloto editorial · {data.specialty?.title}</p>
              <div className="mt-3 flex flex-wrap items-end justify-between gap-4"><div><p className="text-3xl font-bold">{data.summary.answered}/{data.summary.total}</p><p className="text-sm text-muted-foreground">questões respondidas uma única vez</p></div>{data.summary.accuracy !== null && <div className="text-right"><p className="text-3xl font-bold">{data.summary.accuracy}%</p><p className="text-sm text-muted-foreground">acerto objetivo no piloto</p></div>}</div>
              {data.summary.completed && <p role="status" className="mt-4 text-sm font-semibold text-emerald-600">Diagnóstico inicial concluído. Suas evidências já podem orientar o plano semanal.</p>}
            </section>

            <div className="mt-6 space-y-6">{data.questions.map((question, index) => {
              const result = data.summary.resultsByQuestion[question.id];
              const correctOption = result && question.question_options.find((option) => option.id === result.correct_option_id);
              return <article key={question.id} className="rounded-2xl bg-card p-6">
                <p className="text-xs font-bold uppercase text-[hsl(var(--accent))]">Questão {index + 1} · {question.syllabus_nodes?.title}</p>
                <h2 className="mt-2 text-lg font-semibold">{question.statement}</h2>
                <fieldset className="mt-5 space-y-3" disabled={Boolean(result) || submitting === question.id}><legend className="sr-only">Alternativas da questão {index + 1}</legend>{question.question_options.map((option) => <label key={option.id} className="flex cursor-pointer gap-3 rounded-xl border border-border p-4"><input type="radio" name={`diagnostic-${question.id}`} value={option.id} checked={selected[question.id] === option.id} onChange={() => setSelected((current) => ({ ...current, [question.id]: option.id }))}/><span><strong>{option.label}.</strong> {option.option_text}</span></label>)}</fieldset>
                {!result && <Button className="mt-5" disabled={!selected[question.id] || submitting} onClick={() => answer(question.id)}>{submitting === question.id && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Registrar resposta</Button>}
                {result && <div aria-live="polite" className={`mt-5 rounded-xl p-4 ${result.is_correct ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}><p className="flex items-center font-semibold">{result.is_correct ? <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-600"/> : <XCircle className="mr-2 h-5 w-5 text-red-600"/>}{result.is_correct ? 'Evidência de acerto' : 'Evidência de dificuldade'}</p>{!result.is_correct && correctOption && <p className="mt-2 text-sm">Alternativa correta: <strong>{correctOption.label}</strong></p>}<p className="mt-2 text-sm text-muted-foreground">{result.explanation}</p></div>}
                <p className="mt-4 text-xs text-muted-foreground">Autoria: {question.authorship}. Referência de elaboração: {question.source_reference}</p>
              </article>;
            })}</div>

            <section className="mt-8 rounded-2xl bg-card p-6"><h2 className="text-xl font-bold">Autopercepção × desempenho objetivo</h2><p className="mt-2 text-sm text-muted-foreground">Os dois sinais são exibidos separadamente. Uma percepção de 1 a 5 não é convertida em nota.</p><div className="mt-5 space-y-3">{data.summary.comparison.map((item) => <div key={item.subjectId} className="grid gap-3 rounded-xl bg-muted p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"><h3 className="font-semibold">{item.title}</h3><p className="text-sm"><span className="text-muted-foreground">Autopercepção:</span> {item.selfConfidence ? `${item.selfConfidence}/5 · ${CONFIDENCE_LABELS[item.selfConfidence - 1]}` : 'não informada'}</p><p className="text-sm"><span className="text-muted-foreground">Evidência objetiva:</span> {item.accuracy === null ? 'aguardando resposta' : `${item.accuracy}% neste piloto`}</p></div>)}</div></section>
          </>}
        {error && data && <p role="alert" className="mt-5 text-sm text-destructive">{error}</p>}
      </div>
    </div>
  </>;
};

export default ObjectiveDiagnosticPage;
