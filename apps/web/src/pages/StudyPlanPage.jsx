import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { CalendarDays, Check, ChevronLeft, Loader2, Play, Plus, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { createStudyPlanItem, deleteStudyPlanItem, getStudyPlan, toggleStudyPlanItem } from '@/api/studyPlan.js';
import { createSuggestedStudyWeek } from '@/api/suggestedStudyPlan.js';
import { getStudyProfile } from '@/api/studyProfile.js';
import { getMyProgress } from '@/api/progress.js';
import { getWeakestAssessedSubjects } from '@/api/topicAssessments.js';
import { getMySyllabus } from '@/api/syllabus.js';
import { collectSubjectIds, filterSyllabusForProfile } from '@/api/specialtySelection.js';
import { getWeakestObjectiveSubjects } from '@/api/objectiveDiagnostic.js';
import { finishStudySession, startStudySession } from '@/api/studySessions.js';
import StudySessionTimer from '@/components/StudySessionTimer.jsx';
import WeeklyAdherencePanel from '@/components/WeeklyAdherencePanel.jsx';
import StudyTimeHistoryPanel from '@/components/StudyTimeHistoryPanel.jsx';

const today = () => new Date().toISOString().slice(0, 10);

const StudyPlanPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ productId: '', title: '', date: today(), duration: 30 });

  const load = async () => {
    const { data: loaded, error: loadError } = await getStudyPlan();
    setData(loaded);
    setError(loadError);
    setLoading(false);
    if (loaded?.enrollments[0]) {
      setForm((current) => ({ ...current, productId: current.productId || loaded.enrollments[0].product_id }));
    }
  };

  useEffect(() => { load(); }, []);

  const add = async (event) => {
    event.preventDefault(); setBusy(true); setNotice(null);
    const result = await createStudyPlanItem(form); setError(result.error);
    if (!result.error) { setForm((current) => ({ ...current, title: '' })); await load(); }
    setBusy(false);
  };

  const suggestWeek = async () => {
    setBusy(true); setError(null); setNotice(null);
    const [{ data: profile, error: profileError }, { data: progress, error: progressError }, syllabus] = await Promise.all([getStudyProfile(), getMyProgress(), getMySyllabus()]);
    if (profileError || progressError || syllabus.error || !profile) {
      setError(profileError || progressError || syllabus.error || 'Conclua o diagnóstico inicial antes de gerar sua semana.');
    } else {
      const visibleNodes = filterSyllabusForProfile(syllabus.data, profile.target_role, profile.target_specialty_id);
      const subjectIds = collectSubjectIds(visibleNodes);
      const [selfReported, objective] = await Promise.all([
        getWeakestAssessedSubjects(subjectIds),
        getWeakestObjectiveSubjects(subjectIds),
      ]);
      if (selfReported.error || objective.error) {
        setError(selfReported.error || objective.error);
      } else {
        const selfReportedWeakSubjects = selfReported.data.map((item) => item.syllabus_nodes.title);
        const objectiveWeakSubjects = objective.data.map((item) => item.title);
        const result = await createSuggestedStudyWeek({ productId: form.productId, profile, progress, objectiveWeakSubjects, selfReportedWeakSubjects });
        setError(result.error);
        if (!result.error) {
          setNotice(result.created ? `${result.created} tarefas foram adicionadas à sua semana.` : 'A semana sugerida já está no seu plano.');
          await load();
        }
      }
    }
    setBusy(false);
  };

  const toggle = async (item) => { setBusy(true); setError(await toggleStudyPlanItem(item)); await load(); setBusy(false); };
  const remove = async (id) => { setBusy(true); setError(await deleteStudyPlanItem(id)); await load(); setBusy(false); };
  const startSession = async (item) => {
    setBusy(true); setError(null); setNotice(null);
    const sessionError = await startStudySession(item.id);
    setError(sessionError);
    if (!sessionError) { await load(); setNotice(`Cronômetro iniciado para “${item.title}”.`); }
    setBusy(false);
  };
  const finishSession = async () => {
    if (!data?.activeSession) return;
    setBusy(true); setError(null); setNotice(null);
    const sessionError = await finishStudySession(data.activeSession.id);
    setError(sessionError);
    if (!sessionError) { await load(); setNotice('Sessão encerrada e tempo real registrado.'); }
    setBusy(false);
  };

  return <><Helmet><title>Plano de estudos - NORTIS CONCURSOS</title></Helmet><div className="min-h-screen bg-background py-12"><div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
    <Link to="/minha-conta" className="mb-6 inline-flex items-center text-sm font-semibold text-[hsl(var(--accent))] hover:underline"><ChevronLeft className="mr-1 h-4 w-4" />Central Nortis</Link>
    <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent))]">Central Nortis</p><h1 className="mt-2 text-3xl font-bold">Plano de estudos</h1><p className="mt-3 text-muted-foreground">Transforme seu diagnóstico em tarefas possíveis dentro da sua rotina.</p>
    {loading ? <Loader2 className="mx-auto mt-16 h-8 w-8 animate-spin" /> : error && !data ? <p className="mt-8 rounded-2xl bg-card p-6">{error}</p> : <>
      <div className="mt-8 rounded-2xl border border-[hsl(var(--accent))]/30 bg-[hsl(var(--accent))]/10 p-6"><h2 className="flex items-center gap-2 text-xl font-bold"><Sparkles className="h-5 w-5" />Semana sugerida</h2><p className="mt-2 text-sm text-muted-foreground">Usa separadamente seu tempo disponível, autopercepção e o ciclo diagnóstico mais recente. Você continua livre para editar o plano.</p><Button className="mt-4" disabled={busy || !form.productId} onClick={suggestWeek}>Gerar minha semana</Button></div>
      <WeeklyAdherencePanel items={data.items} sessions={data.sessions} />
      <StudyTimeHistoryPanel items={data.items} sessions={data.sessions} compact />
      <StudySessionTimer activeSession={data.activeSession} items={data.items} busy={busy} onFinish={finishSession} />
      <form onSubmit={add} className="mt-6 grid gap-4 rounded-2xl bg-card p-6 sm:grid-cols-2"><label className="text-sm font-medium">Produto<select className="mt-2 w-full rounded-lg border bg-background p-3" value={form.productId} onChange={(event) => setForm((current) => ({ ...current, productId: event.target.value }))}>{data.enrollments.map((enrollment) => <option key={enrollment.product_id} value={enrollment.product_id}>{enrollment.products?.title || 'Produto'}</option>)}</select></label><label className="text-sm font-medium">Tarefa<input required minLength={2} maxLength={160} className="mt-2 w-full rounded-lg border bg-background p-3" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} /></label><label className="text-sm font-medium">Data<input required type="date" className="mt-2 w-full rounded-lg border bg-background p-3" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} /></label><label className="text-sm font-medium">Duração (minutos)<input required type="number" min="5" max="480" className="mt-2 w-full rounded-lg border bg-background p-3" value={form.duration} onChange={(event) => setForm((current) => ({ ...current, duration: event.target.value }))} /></label><Button className="sm:col-span-2" disabled={busy || !form.productId}><Plus className="mr-2 h-4 w-4" />Adicionar tarefa</Button></form>
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}{notice && <p className="mt-4 text-sm text-emerald-600">{notice}</p>}
      <section className="mt-8">
        <h2 className="text-xl font-bold">Suas tarefas</h2>
        {data.items.length === 0 ? (
          <div className="mt-4 rounded-2xl bg-card p-8 text-center">
            <CalendarDays className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Adicione uma tarefa ou gere sua primeira semana.</p>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {data.items.map((item) => {
              const isActiveTask = data.activeSession?.study_plan_item_id === item.id;
              return (
                <li key={item.id} className="flex items-center gap-3 rounded-xl bg-card p-4">
                  <button
                    type="button"
                    aria-label={item.completed ? 'Marcar como pendente' : 'Marcar como concluída'}
                    disabled={busy || isActiveTask}
                    onClick={() => toggle(item)}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${item.completed ? 'bg-emerald-600 text-white' : 'border-border'}`}
                  >
                    {item.completed && <Check className="h-4 w-4" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={`font-medium ${item.completed ? 'line-through opacity-60' : ''}`}>{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(`${item.scheduled_date}T12:00:00`).toLocaleDateString('pt-BR')} · {item.duration_minutes} min
                      {isActiveTask ? ' · sessão em andamento' : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Iniciar sessão de estudo: ${item.title}`}
                    title="Iniciar sessão de estudo"
                    disabled={busy || item.completed || Boolean(data.activeSession)}
                    onClick={() => startSession(item)}
                    className="p-2 text-[hsl(var(--accent))] hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Play className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Excluir tarefa"
                    disabled={busy || isActiveTask}
                    onClick={() => remove(item.id)}
                    className="p-2 text-muted-foreground hover:text-destructive disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>}
  </div></div></>;
};
export default StudyPlanPage;
