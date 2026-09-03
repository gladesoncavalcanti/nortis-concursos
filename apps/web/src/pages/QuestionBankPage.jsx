import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Filter, HelpCircle, Loader2, Search, Star, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { getMyQuestionBank, submitQuestionAttempt } from '@/api/questions.js';
import { buildQuestionBankView } from '@/api/questionBankModel.js';
import { setQuestionFavorite } from '@/api/questionFavorites.js';

const STATUS_LABELS = {
  unanswered: 'Não respondida',
  correct: 'Última resposta correta',
  incorrect: 'Revisão necessária',
};

const QuestionBankPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: 'all', contentId: 'all', searchText: '', onlyFavorites: false });
  const [currentId, setCurrentId] = useState(null);
  const [selected, setSelected] = useState({});
  const [results, setResults] = useState({});
  const [submitting, setSubmitting] = useState(null);

  useEffect(() => {
    let mounted = true;
    getMyQuestionBank().then(({ data: loaded, error: loadError }) => {
      if (!mounted) return;
      setData(loaded); setError(loadError); setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const view = useMemo(() => buildQuestionBankView({
    questions: data?.questions,
    attempts: data?.attempts,
    visibleNodes: data?.visibleNodes,
    ...filters,
  }), [data, filters]);

  useEffect(() => {
    if (!currentId || !view.allQuestions.some((question) => question.id === currentId)) {
      setCurrentId(view.questions[0]?.id ?? null);
    }
  }, [currentId, view]);

  const current = view.allQuestions.find((question) => question.id === currentId) ?? null;
  const filteredIndex = view.questions.findIndex((question) => question.id === currentId);

  const changeFilter = (field, value) => {
    setFilters((currentFilters) => ({ ...currentFilters, [field]: value }));
    setCurrentId(null);
  };

  const answer = async () => {
    if (!current || !selected[current.id] || submitting) return;
    setSubmitting(current.id);
    const { data: result, error: submitError } = await submitQuestionAttempt(current.id, selected[current.id]);
    if (submitError) setError(submitError);
    else {
      setResults((stored) => ({ ...stored, [current.id]: result }));
      setData((stored) => ({
        ...stored,
        attempts: [{
          id: result.attempt_id,
          question_id: current.id,
          is_correct: result.is_correct,
          answered_at: new Date().toISOString(),
        }, ...stored.attempts],
      }));
    }
    setSubmitting(null);
  };

  const toggleFavorite = async (question) => {
    if (!question) return;
    const nextFavorite = !question.favorite;
    setData((stored) => ({
      ...stored,
      favorites: nextFavorite
        ? [{ question_id: question.id, created_at: new Date().toISOString() }, ...(stored.favorites ?? [])]
        : (stored.favorites ?? []).filter((favorite) => favorite.question_id !== question.id),
    }));
    const { error: favoriteError } = await setQuestionFavorite(question.id, nextFavorite);
    if (favoriteError) {
      setError(favoriteError);
      setData((stored) => ({
        ...stored,
        favorites: nextFavorite
          ? (stored.favorites ?? []).filter((favorite) => favorite.question_id !== question.id)
          : [{ question_id: question.id, created_at: new Date().toISOString() }, ...(stored.favorites ?? [])],
      }));
    }
  };

  const goPrevious = () => {
    if (filteredIndex > 0) setCurrentId(view.questions[filteredIndex - 1].id);
  };

  const goNext = () => {
    if (filteredIndex < 0) setCurrentId(view.questions[0]?.id ?? null);
    else if (filteredIndex < view.questions.length - 1) setCurrentId(view.questions[filteredIndex + 1].id);
  };

  const result = current ? results[current.id] : null;

  return (
    <>
      <Helmet><title>Banco de questões - NORTIS CONCURSOS</title></Helmet>
      <div className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link to="/minha-conta" className="mb-6 inline-flex items-center text-sm font-semibold text-[hsl(var(--accent))] hover:underline">
            <ChevronLeft className="mr-1 h-4 w-4" />Voltar para a Central Nortis
          </Link>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[hsl(var(--accent))]">Central Nortis</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">Banco de questões</h1>
          <p className="mt-3 text-muted-foreground">Pratique somente os conteúdos compatíveis com seu cargo e especialidade e retome os erros mais recentes.</p>

          {loading ? <div className="mt-8 flex justify-center rounded-2xl bg-card py-16"><Loader2 className="h-7 w-7 animate-spin" /></div>
            : error && !data ? <div className="mt-8 rounded-2xl bg-card p-8 text-center"><AlertCircle className="mx-auto mb-3 h-8 w-8 text-destructive" /><p className="text-muted-foreground">{error}</p></div>
            : data?.needsSpecialty ? <div className="mt-8 rounded-2xl bg-card p-8 text-center"><Filter className="mx-auto mb-4 h-10 w-10 text-muted-foreground" /><h2 className="text-xl font-semibold">Defina sua especialidade primeiro</h2><p className="mt-2 text-sm text-muted-foreground">O banco só libera questões correspondentes ao cargo e à especialidade salvos no seu perfil.</p><Button asChild className="mt-5"><Link to="/minha-conta">Definir especialidade</Link></Button></div>
            : view.counts.all === 0 ? <div className="mt-8 rounded-2xl bg-card p-8 text-center"><HelpCircle className="mx-auto mb-4 h-10 w-10 text-muted-foreground" /><h2 className="text-xl font-semibold">Questões em preparação</h2><p className="mt-2 text-sm text-muted-foreground">Ainda não há questões de prática validadas para os conteúdos da sua especialidade. O diagnóstico continua disponível separadamente.</p><Button asChild variant="outline" className="mt-5"><Link to="/minha-conta/diagnostico">Abrir diagnóstico</Link></Button></div>
            : <>
              <section className="mt-8 rounded-2xl bg-card p-6" aria-labelledby="question-filters-title">
                <h2 id="question-filters-title" className="flex items-center gap-2 font-semibold"><Filter className="h-4 w-4" />Filtrar prática</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium sm:col-span-2">Buscar por assunto ou termo
                    <div className="mt-2 flex items-center gap-2 rounded-lg border bg-background px-3">
                      <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      <input
                        className="min-w-0 flex-1 bg-transparent py-3 outline-none"
                        value={filters.searchText}
                        placeholder="Ex.: abordagem social, benefício eventual, saúde mental"
                        onChange={(event) => changeFilter('searchText', event.target.value)}
                      />
                    </div>
                  </label>
                  <label className="text-sm font-medium">Conteúdo<select className="mt-2 w-full rounded-lg border bg-background p-3" value={filters.contentId} onChange={(event) => changeFilter('contentId', event.target.value)}><option value="all">Todos os conteúdos</option>{view.contents.map((content) => <option key={content.id} value={content.id}>{content.title}</option>)}</select></label>
                  <label className="text-sm font-medium">Situação<select className="mt-2 w-full rounded-lg border bg-background p-3" value={filters.status} onChange={(event) => changeFilter('status', event.target.value)}><option value="all">Todas ({view.counts.all})</option><option value="unanswered">Não respondidas ({view.counts.unanswered})</option><option value="incorrect">Revisão necessária ({view.counts.incorrect})</option><option value="correct">Última resposta correta ({view.counts.correct})</option></select></label>
                </div>
                <label className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={filters.onlyFavorites}
                    onChange={(event) => changeFilter('onlyFavorites', event.target.checked)}
                  />
                  Mostrar somente questões favoritas para revisão inteligente
                </label>
                {data?.favoritesUnavailable && (
                  <p className="mt-3 text-xs text-muted-foreground">Favoritos serão ativados após aplicação da migration desta fatia.</p>
                )}
              </section>

              {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
              {!current ? <div className="mt-6 rounded-2xl bg-card p-8 text-center"><HelpCircle className="mx-auto mb-3 h-9 w-9 text-muted-foreground" /><p className="text-sm text-muted-foreground">Nenhuma questão corresponde aos filtros escolhidos.</p></div>
                : <article className="mt-6 rounded-2xl bg-card p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold uppercase text-[hsl(var(--accent))]">
                    <span>{filteredIndex >= 0 ? `Questão ${filteredIndex + 1} de ${view.questions.length}` : `Resposta registrada · ${view.questions.length} restantes no filtro`}</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs text-foreground"
                        onClick={() => toggleFavorite(current)}
                        aria-pressed={current.favorite}
                      >
                        <Star className={`h-3.5 w-3.5 ${current.favorite ? 'fill-[hsl(var(--accent))] text-[hsl(var(--accent))]' : ''}`} aria-hidden="true" />
                        {current.favorite ? 'Favorita' : 'Favoritar'}
                      </button>
                      <span>{STATUS_LABELS[current.status]}</span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">{current.syllabusNode?.title}</p>
                  <h2 className="mt-2 text-lg font-semibold text-card-foreground">{current.statement}</h2>
                  <fieldset className="mt-5 space-y-3" disabled={Boolean(result)}><legend className="sr-only">Alternativas</legend>
                    {current.question_options.map((option) => <label key={option.id} className="flex cursor-pointer gap-3 rounded-xl border border-border p-4"><input type="radio" name={`question-${current.id}`} value={option.id} checked={selected[current.id] === option.id} onChange={() => setSelected((stored) => ({ ...stored, [current.id]: option.id }))} /><span><strong>{option.label}.</strong> {option.option_text}</span></label>)}
                  </fieldset>
                  {!result && <Button className="mt-5" disabled={!selected[current.id] || submitting === current.id} onClick={answer}>{submitting === current.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Corrigir resposta</Button>}
                  {result && <div className={`mt-5 rounded-xl p-4 ${result.is_correct ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}><p className="flex items-center font-semibold">{result.is_correct ? <CheckCircle2 className="mr-2 h-5 w-5 text-emerald-600" /> : <XCircle className="mr-2 h-5 w-5 text-red-600" />}{result.is_correct ? 'Resposta correta' : 'Resposta incorreta'}</p>{result.explanation && <p className="mt-2 text-sm text-muted-foreground">{result.explanation}</p>}</div>}
                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-5">
                    <Button variant="outline" disabled={filteredIndex <= 0} onClick={goPrevious}><ChevronLeft className="mr-1 h-4 w-4" />Anterior</Button>
                    <Button variant="outline" disabled={view.questions.length === 0 || (filteredIndex >= 0 && filteredIndex >= view.questions.length - 1)} onClick={goNext}>Próxima<ChevronRight className="ml-1 h-4 w-4" /></Button>
                  </div>
                </article>}
            </>}
        </div>
      </div>
    </>
  );
};

export default QuestionBankPage;
