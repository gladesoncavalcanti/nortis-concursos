import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { AlertCircle, BookOpen, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { getMySyllabus } from '@/api/syllabus.js';
import { getSyllabusNodeTypeLabel } from '@/api/syllabusTree.js';
import { getStudyProfile } from '@/api/studyProfile.js';
import { getTopicAssessments, saveTopicAssessment } from '@/api/topicAssessments.js';
import { filterSyllabusForProfile } from '@/api/specialtySelection.js';

const CONFIDENCE_LABELS = ['Não estudei', 'Tenho muita dificuldade', 'Tenho alguma dificuldade', 'Estou seguro', 'Domino bem'];

const SyllabusNode = ({ node, assessments, onAssess, savingId, depth = 0 }) => (
  <li className={depth > 0 ? 'ml-4 border-l border-border pl-4' : ''}>
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[hsl(var(--accent))]">
        {getSyllabusNodeTypeLabel(node.node_type)}
      </p>
      <h2 className="mt-1 font-semibold text-card-foreground">{node.title}</h2>
      {node.description && (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{node.description}</p>
      )}
      {node.node_type === 'subject' && (
        <fieldset className="mt-4">
          <legend className="text-xs font-semibold text-muted-foreground">Como você está neste conteúdo?</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {CONFIDENCE_LABELS.map((label, index) => {
              const value = index + 1;
              const selected = assessments[node.id] === value;
              return (
                <button key={value} type="button" disabled={savingId === node.id} aria-pressed={selected} title={label} onClick={() => onAssess(node.id, value)} className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${selected ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/15 text-foreground' : 'border-border text-muted-foreground hover:border-[hsl(var(--accent))]/60'}`}>
                  {value}<span className="sr-only"> — {label}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{assessments[node.id] ? CONFIDENCE_LABELS[assessments[node.id] - 1] : '1 = não estudei · 5 = domino bem'}</p>
        </fieldset>
      )}
    </div>
    {node.children.length > 0 && (
      <ul className="mt-3 space-y-3">
        {node.children.map((child) => (
          <SyllabusNode key={child.id} node={child} assessments={assessments} onAssess={onAssess} savingId={savingId} depth={depth + 1} />
        ))}
      </ul>
    )}
  </li>
);

const SyllabusPage = () => {
  const [nodes, setNodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assessments, setAssessments] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let isMounted = true;

    Promise.all([getMySyllabus(), getTopicAssessments(), getStudyProfile()]).then(([syllabus, assessmentResult, profile]) => {
      if (!isMounted) return;
      setNodes(filterSyllabusForProfile(syllabus.data, profile.data?.target_role, profile.data?.target_specialty_id));
      setAssessments(Object.fromEntries(assessmentResult.data.map((item) => [item.syllabus_node_id, item.confidence])));
      setError(syllabus.error || assessmentResult.error);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const assess = async (nodeId, confidence) => {
    setSavingId(nodeId); setNotice(null);
    const result = await saveTopicAssessment(nodeId, confidence);
    if (result.error) setNotice(result.error);
    else {
      setAssessments((current) => ({ ...current, [nodeId]: confidence }));
      setNotice('Autoavaliação salva. Ela será usada para priorizar seu plano.');
    }
    setSavingId(null);
  };

  return (
    <>
      <Helmet>
        <title>Edital verticalizado - NORTIS CONCURSOS</title>
        <meta
          name="description"
          content="Conteúdo do edital organizado por cargo, especialidade, disciplina e tópico na Central Nortis."
        />
      </Helmet>

      <div className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/minha-conta"
            className="mb-6 inline-flex items-center text-sm font-semibold text-[hsl(var(--accent))] hover:underline"
          >
            <ChevronRight className="mr-1 h-4 w-4 rotate-180" />
            Voltar para a Central Nortis
          </Link>

          <div className="mb-8">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[hsl(var(--accent))]">
              Central Nortis
            </p>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">Edital verticalizado</h1>
            <p className="mt-3 max-w-3xl text-muted-foreground">
              Consulte o conteúdo oficial liberado e marque de 1 a 5 como você se sente em cada disciplina. Esta autoavaliação orienta o plano, mas não substitui seu desempenho em questões.
            </p>
            {notice && <p role="status" className="mt-3 text-sm text-[hsl(var(--accent))]">{notice}</p>}
            {!isLoading && nodes.every((root) => !root.children.some((child) => child.node_type === 'specialty')) && (
              <p className="mt-3 text-sm text-muted-foreground">
                Para liberar o conteúdo específico, escolha sua especialidade no diagnóstico da <Link className="font-semibold text-[hsl(var(--accent))] hover:underline" to="/minha-conta">Central Nortis</Link>.
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center rounded-2xl bg-card py-16">
              <Loader2 className="mr-3 h-6 w-6 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Carregando edital...</span>
            </div>
          ) : error ? (
            <div className="rounded-2xl bg-card p-8 text-center">
              <AlertCircle className="mx-auto mb-3 h-8 w-8 text-destructive" />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : nodes.length > 0 ? (
            <ul className="space-y-4">
              {nodes.map((node) => (
                <SyllabusNode key={node.id} node={node} assessments={assessments} onAssess={assess} savingId={savingId} />
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl bg-card p-8 text-center">
              <BookOpen className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
              <h2 className="text-xl font-semibold text-card-foreground">Conteúdo em preparação</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                A estrutura está pronta. Os itens serão publicados após a validação do conteúdo oficial.
              </p>
              <Link to="/minha-conta" className="mt-6 inline-block">
                <Button variant="outline">Voltar para meus módulos</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SyllabusPage;
