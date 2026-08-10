import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { AlertCircle, BookOpen, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { getMySyllabus } from '@/api/syllabus.js';
import { getSyllabusNodeTypeLabel } from '@/api/syllabusTree.js';

const SyllabusNode = ({ node, depth = 0 }) => (
  <li className={depth > 0 ? 'ml-4 border-l border-border pl-4' : ''}>
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[hsl(var(--accent))]">
        {getSyllabusNodeTypeLabel(node.node_type)}
      </p>
      <h2 className="mt-1 font-semibold text-card-foreground">{node.title}</h2>
      {node.description && (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{node.description}</p>
      )}
    </div>
    {node.children.length > 0 && (
      <ul className="mt-3 space-y-3">
        {node.children.map((child) => (
          <SyllabusNode key={child.id} node={child} depth={depth + 1} />
        ))}
      </ul>
    )}
  </li>
);

const SyllabusPage = () => {
  const [nodes, setNodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    getMySyllabus().then(({ data, error: loadError }) => {
      if (!isMounted) return;
      setNodes(data);
      setError(loadError);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

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
              Consulte a estrutura liberada para seu produto, organizada por cargo, especialidade,
              disciplina e tópico.
            </p>
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
                <SyllabusNode key={node.id} node={node} />
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
