import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowRight, BookMarked, CheckCircle2, ChevronLeft, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { getMyEnrollments } from '@/api/enrollments.js';
import { requestDownloadUrl } from '@/api/downloads.js';
import { buildMaterialsLibrary } from '@/api/studentJourneyModel.js';
import { getStudyProfile } from '@/api/studyProfile.js';
import { getMySyllabus } from '@/api/syllabus.js';
import { getMyMaterialMarks, setMaterialMark } from '@/api/materialMarks.js';
import { SEDES_LEARNING_ASSETS } from '@/config/sedesLearningAssets.js';

const MaterialsLibraryPage = () => {
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marks, setMarks] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);
  const [markingId, setMarkingId] = useState(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([getMyEnrollments(), getStudyProfile(), getMySyllabus(), getMyMaterialMarks()]).then(([enrollments, profile, syllabus, materialMarks]) => {
      if (!mounted) return;
      setLibrary(buildMaterialsLibrary({
        enrollments: enrollments.data,
        profile: profile.data,
        syllabus: syllabus.data,
      }));
      setMarks(materialMarks.data ?? []);
      setError(enrollments.error || profile.error || syllabus.error);
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

  const markStudied = async (assetId) => {
    if (markingId) return;
    setMarkingId(assetId);
    const { error: markError } = await setMaterialMark(assetId, 'reviewed');
    if (markError) setError(markError);
    else setMarks((current) => [
      { material_key: assetId, status: 'reviewed', updated_at: new Date().toISOString() },
      ...current.filter((mark) => mark.material_key !== assetId),
    ]);
    setMarkingId(null);
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
                      {(product.roleLabel || product.specialtyTitle) && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Recorte atual: {product.roleLabel || 'cargo não definido'}{product.specialtyTitle ? ` · ${product.specialtyTitle}` : ''}
                        </p>
                      )}
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

                  <div className="mt-6 rounded-xl bg-muted p-4">
                    <h3 className="font-semibold">Mapas, resumos e trilhas por especialidade</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Materiais curtos conectados às funcionalidades ativas. Itens em preparação ficam marcados sem promessa de entrega imediata.
                    </p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {SEDES_LEARNING_ASSETS.map((asset) => (
                        <article key={asset.id} className="rounded-lg bg-card p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wide text-[hsl(var(--accent))]">{asset.type}</p>
                              <h4 className="mt-1 font-semibold">{asset.title}</h4>
                            </div>
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${asset.status === 'ativo' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}>
                              {asset.status}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">{asset.specialty} · {asset.description}</p>
                          {asset.status === 'ativo' && (
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                              <Link to={asset.route} className="inline-flex items-center text-xs font-bold text-[hsl(var(--accent))] hover:underline">
                                Estudar agora
                                <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
                              </Link>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={markingId === asset.id}
                                onClick={() => markStudied(asset.id)}
                              >
                                {marks.some((mark) => mark.material_key === asset.id)
                                  ? <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                  : null}
                                {marks.some((mark) => mark.material_key === asset.id) ? 'Estudado' : 'Marcar estudado'}
                              </Button>
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
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
