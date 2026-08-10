import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, ChevronLeft, HelpCircle, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { getMyQuestions, submitQuestionAttempt } from '@/api/questions.js';

const QuestionBankPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState({});
  const [results, setResults] = useState({});
  const [submitting, setSubmitting] = useState(null);

  useEffect(() => {
    let mounted = true;
    getMyQuestions().then(({ data, error: loadError }) => {
      if (!mounted) return;
      setQuestions(data); setError(loadError); setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const answer = async (questionId) => {
    if (!selected[questionId] || submitting) return;
    setSubmitting(questionId);
    const { data, error: submitError } = await submitQuestionAttempt(questionId, selected[questionId]);
    if (submitError) setError(submitError);
    else setResults((current) => ({ ...current, [questionId]: data }));
    setSubmitting(null);
  };

  return <>
    <Helmet><title>Banco de questões - NORTIS CONCURSOS</title></Helmet>
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link to="/minha-conta" className="mb-6 inline-flex items-center text-sm font-semibold text-[hsl(var(--accent))] hover:underline">
          <ChevronLeft className="mr-1 h-4 w-4" />Voltar para a Central Nortis
        </Link>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[hsl(var(--accent))]">Central Nortis</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">Banco de questões</h1>
        <p className="mt-3 text-muted-foreground">Resolva uma questão por vez e consulte a correção somente depois de responder.</p>

        {loading ? <div className="mt-8 flex justify-center rounded-2xl bg-card py-16"><Loader2 className="h-7 w-7 animate-spin" /></div>
          : error ? <div className="mt-8 rounded-2xl bg-card p-8 text-center"><AlertCircle className="mx-auto mb-3 h-8 w-8 text-destructive"/><p className="text-muted-foreground">{error}</p></div>
          : questions.length === 0 ? <div className="mt-8 rounded-2xl bg-card p-8 text-center"><HelpCircle className="mx-auto mb-4 h-10 w-10 text-muted-foreground"/><h2 className="text-xl font-semibold">Questões em preparação</h2><p className="mt-2 text-sm text-muted-foreground">A estrutura está pronta. As questões serão publicadas após validação editorial.</p></div>
          : <div className="mt-8 space-y-6">{questions.map((question, index) => {
            const result = results[question.id];
            return <article key={question.id} className="rounded-2xl bg-card p-6">
              <p className="text-xs font-bold uppercase text-[hsl(var(--accent))]">Questão {index + 1}</p>
              <h2 className="mt-2 text-lg font-semibold text-card-foreground">{question.statement}</h2>
              <fieldset className="mt-5 space-y-3" disabled={Boolean(result)}><legend className="sr-only">Alternativas</legend>
                {question.question_options.map((option) => <label key={option.id} className="flex cursor-pointer gap-3 rounded-xl border border-border p-4">
                  <input type="radio" name={`question-${question.id}`} value={option.id} checked={selected[question.id] === option.id} onChange={() => setSelected((current) => ({...current, [question.id]: option.id}))}/>
                  <span><strong>{option.label}.</strong> {option.option_text}</span>
                </label>)}
              </fieldset>
              {!result && <Button className="mt-5" disabled={!selected[question.id] || submitting === question.id} onClick={() => answer(question.id)}>{submitting === question.id && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Corrigir resposta</Button>}
              {result && <div className={`mt-5 rounded-xl p-4 ${result.is_correct ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                <p className="flex items-center font-semibold">{result.is_correct ? <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-600"/> : <XCircle className="mr-2 h-5 w-5 text-red-600"/>}{result.is_correct ? 'Resposta correta' : 'Resposta incorreta'}</p>
                {result.explanation && <p className="mt-2 text-sm text-muted-foreground">{result.explanation}</p>}
              </div>}
            </article>;
          })}</div>}
      </div>
    </div>
  </>;
};

export default QuestionBankPage;
