import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, Loader2, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { getActiveEssayThemes } from '@/api/essayThemes.js';
import { getOrCreateEssayDraft } from '@/api/essaySubmissions.js';

const EssayThemesPage = () => {
  const navigate = useNavigate();
  const [themes, setThemes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startingThemeId, setStartingThemeId] = useState(null);

  useEffect(() => {
    let mounted = true;
    getActiveEssayThemes().then(({ data, error: loadError }) => {
      if (!mounted) return;
      setThemes(data);
      setError(loadError);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const startEssay = async (themeId) => {
    // Bloqueia o próprio clique duplo antes de qualquer chamada de rede
    // (o botão já fica desabilitado por causa disto). A garantia contra
    // duas abas ou requisições concorrentes fica em getOrCreateEssayDraft
    // + no índice único parcial do banco — aqui é só a primeira linha de
    // defesa, mais rápida.
    if (startingThemeId) return;
    setStartingThemeId(themeId);
    setError(null);
    const { data, error: createError } = await getOrCreateEssayDraft({ themeId });
    if (createError || !data) {
      setError(createError ?? 'Não foi possível iniciar a redação agora.');
      setStartingThemeId(null);
      return;
    }
    navigate(`/minha-conta/tutor/redacao/${data.id}`);
  };

  return (
    <>
      <Helmet><title>Redação - Tutor Nortis - NORTIS CONCURSOS</title></Helmet>
      <div className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link to="/minha-conta/tutor" className="mb-6 inline-flex items-center text-sm font-semibold text-[hsl(var(--accent))] hover:underline">
            <ChevronLeft className="mr-1 h-4 w-4" />Tutor Nortis
          </Link>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent))]">Tutor Nortis</p>
          <h1 className="mt-2 text-3xl font-bold">Temas de treino Nortis</h1>
          <p className="mt-3 text-muted-foreground">Escolha um tema para praticar. Sua redação fica salva como rascunho até você enviá-la.</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Os temas são elaborados para treinamento a partir dos conteúdos do edital. Não representam previsão oficial da banca.
          </p>

          {loading ? (
            <Loader2 className="mx-auto mt-16 h-8 w-8 animate-spin" aria-hidden="true" />
          ) : error ? (
            <p className="mt-8 rounded-2xl bg-card p-6" role="alert">{error}</p>
          ) : themes.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-card p-8 text-center">
              <FileText className="mx-auto mb-4 h-10 w-10 text-muted-foreground" aria-hidden="true" />
              <h2 className="text-xl font-semibold">Nenhum tema disponível no momento</h2>
              <p className="mt-2 text-sm text-muted-foreground">Novos temas serão publicados aqui em breve.</p>
            </div>
          ) : (
            <ul className="mt-8 space-y-4">
              {themes.map((theme) => (
                <li key={theme.id} className="rounded-2xl border border-border bg-card p-6">
                  <h2 className="text-lg font-bold text-foreground">{theme.title}</h2>
                  {theme.syllabus_nodes?.title && (
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{theme.syllabus_nodes.title}</p>
                  )}
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{theme.prompt_text}</p>
                  {theme.source_reference && (
                    <p className="mt-2 text-xs text-muted-foreground/80">{theme.source_reference}</p>
                  )}
                  <Button
                    className="mt-4"
                    disabled={startingThemeId === theme.id}
                    onClick={() => startEssay(theme.id)}
                  >
                    <PenLine className="mr-2 h-4 w-4" aria-hidden="true" />
                    {startingThemeId === theme.id ? 'Iniciando...' : 'Escrever redação'}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default EssayThemesPage;
