import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowRight, BookMarked, ChevronLeft, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { getMyEnrollments } from '@/api/enrollments.js';
import { requestDownloadUrl } from '@/api/downloads.js';
import { buildMaterialsLibrary } from '@/api/studentJourneyModel.js';

const MaterialsLibraryPage = () => {
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    let mounted = true;
    getMyEnrollments().then(({ data, error: loadError }) => {
      if (!mounted) return;
      setLibrary(buildMaterialsLibrary({ enrollments: data }));
      setError(loadError);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const download = async (enrollmentId) => {
    if (downloadingId) return;
    setDownloadingId(enrollmentId);
    const { url, error: downloadError } = await requestDownloadUrl({ enrollmentId });
    if (downloadError || !url) setError(downloadError || 'Não foi possível gerar o link agora.');
    else window.open(url, '_blank', 'noopener,noreferrer');
    setDownloadingId(null);
  };

  return (
    <>
      <Helmet>
        <title>Biblioteca SEDES-DF - NORTIS CONCURSOS</title>
        <meta name="description" content="Biblioteca interna da Central Nortis organizada por produto, cargo, prática e acompanhamento." />
      </Helmet>
      <div className="min-h-screen bg-background py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Link to="/minha-conta" className="mb-6 inline-flex items-center text-sm font-semibold text-[hsl(var(--accent))] hover:underline">
            <ChevronLeft className="mr-1 h-4 w-4" />Central Nortis
          </Link>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[hsl(var(--accent))]">Biblioteca do aluno</p>
          <h1 className="mt-2 text-3xl font-bold">Materiais e funcionalidades por área</h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Apostila, edital, questões, simulados, discursiva, flashcards e acompanhamento organizados no mesmo ambiente.
          </p>

          {loading ? (
            <Loader2 className="mx-auto mt-16 h-8 w-8 animate-spin" aria-hidden="true" />
          ) : error ? (
            <p className="mt-8 rounded-2xl bg-card p-6 text-muted-foreground" role="alert">{error}</p>
          ) : library.length === 0 ? (
            <div className="mt-8 rounded-2xl bg-card p-8 text-center">
              <BookMarked className="mx-auto mb-4 h-10 w-10 text-muted-foreground" aria-hidden="true" />
              <h2 className="text-xl font-semibold">Nenhum produto liberado</h2>
              <p className="mt-2 text-sm text-muted-foreground">Libere o acesso gratuito SEDES-DF ou adquira a apostila promocional para usar a biblioteca.</p>
              <Button asChild className="mt-5"><Link to="/materiais-gratuitos">Liberar acesso gratuito</Link></Button>
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              {library.map((product) => (
                <section key={product.enrollmentId} className="rounded-2xl bg-card p-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-xl font-bold">{product.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {product.active ? 'Acesso ativo' : 'Acesso indisponível no momento'}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      disabled={!product.active || downloadingId === product.enrollmentId}
                      onClick={() => download(product.enrollmentId)}
                    >
                      {downloadingId === product.enrollmentId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                      Apostila
                    </Button>
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-3">
                    {product.groups.map((group) => (
                      <article key={group.id} className="rounded-xl bg-muted p-4">
                        <h3 className="font-semibold">{group.title}</h3>
                        <ul className="mt-4 space-y-3">
                          {group.modules.map((module) => (
                            <li key={module.id} className="rounded-lg bg-card p-3">
                              <p className="font-medium">{module.title}</p>
                              {module.description && <p className="mt-1 text-xs text-muted-foreground">{module.description}</p>}
                              {module.route_path && (
                                <Link to={module.route_path} className="mt-2 inline-flex items-center text-xs font-bold text-[hsl(var(--accent))] hover:underline">
                                  Acessar
                                  <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
                                </Link>
                              )}
                            </li>
                          ))}
                        </ul>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MaterialsLibraryPage;
