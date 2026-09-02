import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Mail, Calendar, LogOut, Loader2, AlertCircle, FileText, Download, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { getMyEnrollments } from '@/api/enrollments.js';
import { requestDownloadUrl } from '@/api/downloads.js';
import { getMyProgress } from '@/api/progress.js';
import { getStudyPlan } from '@/api/studyPlan.js';
import { getMyFlashcards } from '@/api/flashcards.js';
import { buildNextBestAction } from '@/api/nextBestAction.js';
import { buildDailyStudyAgenda } from '@/api/dailyStudyAgenda.js';
import PersonalizationQuiz from '@/components/PersonalizationQuiz.jsx';
import DailyStudyAgenda from '@/components/DailyStudyAgenda.jsx';
import FreeSedesAccessCta from '@/components/FreeSedesAccessCta.jsx';

const STATUS_LABELS = {
  active: 'Ativo',
  revoked: 'Revogado',
  expired: 'Expirado',
};

const STATUS_BADGE_STYLES = {
  active: 'bg-emerald-500/10 text-emerald-600',
  revoked: 'bg-red-500/10 text-red-600',
  expired: 'bg-muted text-muted-foreground',
};

const hasAvailableAccess = (enrollment) =>
  enrollment.status === 'active' &&
  (!enrollment.expires_at || new Date(enrollment.expires_at).getTime() > Date.now());

const MyAccountPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [nextAction, setNextAction] = useState(null);
  const [isNextActionLoading, setIsNextActionLoading] = useState(false);
  const [nextActionError, setNextActionError] = useState(null);
  const [dailyAgenda, setDailyAgenda] = useState(null);
  const [dailyAgendaError, setDailyAgendaError] = useState(null);
  // Um único download por vez (id do enrollment em andamento, ou null).
  // Evita múltiplos cliques disparando várias signed URLs em paralelo.
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchEnrollments = async () => {
      setIsLoading(true);
      setLoadError(null);

      const { data, error } = await getMyEnrollments();

      if (!isMounted) return;

      if (error) {
        setLoadError(error);
      } else {
        setEnrollments(data);
      }

      setIsLoading(false);
    };

    fetchEnrollments();

    return () => {
      isMounted = false;
    };
  }, []);

  const reloadEnrollments = async () => {
    setIsLoading(true);
    setLoadError(null);

    const { data, error } = await getMyEnrollments();

    if (error) {
      setLoadError(error);
    } else {
      setEnrollments(data);
    }

    setIsLoading(false);
  };

  const hasActiveEnrollment = enrollments.some(hasAvailableAccess);

  useEffect(() => {
    if (!hasActiveEnrollment) {
      setNextAction(null);
      setNextActionError(null);
      setIsNextActionLoading(false);
      setDailyAgenda(null);
      setDailyAgendaError(null);
      return undefined;
    }

    let isMounted = true;
    setIsNextActionLoading(true);
    setNextActionError(null);
    setDailyAgendaError(null);

    const activeProductIds = new Set(
      enrollments.filter(hasAvailableAccess).map((enrollment) => enrollment.product_id)
    );

    Promise.all([getMyProgress(), getStudyPlan(), getMyFlashcards()])
      .then(([progressResult, planResult, flashcardResult]) => {
        if (!isMounted) return;

        if (progressResult.error || planResult.error) {
          setNextAction(null);
          setNextActionError('Não foi possível calcular sua prioridade agora.');
          setDailyAgenda(null);
          setDailyAgendaError('Não foi possível organizar sua agenda completa agora.');
        } else {
          setNextAction(buildNextBestAction({
            progress: progressResult.data,
            planItems: planResult.data.items.filter((item) => activeProductIds.has(item.product_id)),
          }));
          if (flashcardResult.error) {
            setDailyAgenda(null);
            setDailyAgendaError('Não foi possível organizar sua agenda completa agora.');
          } else {
            setDailyAgenda(buildDailyStudyAgenda({
              progress: progressResult.data,
              planItems: planResult.data.items.filter((item) => activeProductIds.has(item.product_id)),
              flashcardDecks: flashcardResult.data,
            }));
          }
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setNextAction(null);
        setNextActionError('Não foi possível calcular sua prioridade agora.');
        setDailyAgenda(null);
        setDailyAgendaError('Não foi possível organizar sua agenda completa agora.');
      })
      .finally(() => {
        if (isMounted) setIsNextActionLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [hasActiveEnrollment, enrollments]);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/');
    } else {
      toast.error(result.error);
    }
  };

  const handleDownload = async (enrollmentId) => {
    if (downloadingId) return; // já existe um download em andamento
    setDownloadingId(enrollmentId);

    const { url, error } = await requestDownloadUrl({ enrollmentId });

    if (error || !url) {
      toast.error(error || 'Não foi possível gerar o link agora. Tente novamente.');
      setDownloadingId(null);
      return;
    }

    // Só a signed URL retornada é usada — nunca é montada manualmente
    // nem reaproveitada; cada clique pede uma nova.
    window.open(url, '_blank', 'noopener,noreferrer');
    setDownloadingId(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const memberSince = formatDate(user?.createdAt);

  return (
    <>
      <Helmet>
        <title>Minha Conta - NORTIS CONCURSOS</title>
        <meta name="description" content="Acesse os dados da sua conta Nortis Concursos e acompanhe os materiais liberados para o seu acesso." />
      </Helmet>

      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 leading-tight" style={{ letterSpacing: '-0.02em' }}>
              Minha Conta
            </h1>
            <p className="text-lg text-muted-foreground">
              Continue seus estudos nos produtos e módulos liberados para sua conta
            </p>
          </motion.div>

          {/* Diagnóstico inicial (Sprint Funcional 1.2) — 100% local, ver PersonalizationQuiz.jsx */}
          <div className="mb-8">
            <PersonalizationQuiz userId={user?.id} />
          </div>

          {hasActiveEnrollment && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8 rounded-2xl border border-[hsl(var(--accent))]/40 bg-[hsl(var(--accent))]/10 p-6"
              aria-labelledby="next-best-action-label"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-white">
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p id="next-best-action-label" className="text-xs font-bold uppercase tracking-[0.16em] text-[hsl(var(--accent))]">
                    Próximo melhor passo
                  </p>
                  {isNextActionLoading ? (
                    <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground" role="status">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Calculando sua prioridade...
                    </div>
                  ) : nextActionError ? (
                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground">{nextActionError}</p>
                      <Link to="/minha-conta/plano" className="mt-2 inline-flex text-sm font-semibold text-[hsl(var(--accent))] hover:underline">
                        Abrir plano semanal
                      </Link>
                    </div>
                  ) : nextAction ? (
                    <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[hsl(var(--accent))]">{nextAction.eyebrow}</p>
                        <h2 className="mt-1 text-xl font-bold text-foreground">{nextAction.title}</h2>
                        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{nextAction.description}</p>
                      </div>
                      <Button asChild className="shrink-0">
                        <Link to={nextAction.route}>
                          {nextAction.cta}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.section>
          )}

          {hasActiveEnrollment && (
            <DailyStudyAgenda
              agenda={dailyAgenda}
              loading={isNextActionLoading}
              error={dailyAgendaError}
            />
          )}

          {hasActiveEnrollment && (
            <section className="mb-8 grid gap-4 md:grid-cols-3" aria-label="Atalhos inteligentes da Central Nortis">
              <Link to="/minha-conta/trilha" className="rounded-2xl bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[hsl(var(--accent))]">Jornada</p>
                <h2 className="mt-2 font-bold text-foreground">Trilha SEDES guiada</h2>
                <p className="mt-2 text-sm text-muted-foreground">Diagnóstico, plano, questões, simulado, discursiva e revisão em sequência.</p>
              </Link>
              <Link to="/minha-conta/progresso" className="rounded-2xl bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[hsl(var(--accent))]">Revisão</p>
                <h2 className="mt-2 font-bold text-foreground">Caderno de erros</h2>
                <p className="mt-2 text-sm text-muted-foreground">Priorize erros recentes e assuntos com desempenho mais fraco.</p>
              </Link>
              <Link to="/minha-conta/biblioteca" className="rounded-2xl bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[hsl(var(--accent))]">Biblioteca</p>
                <h2 className="mt-2 font-bold text-foreground">Materiais por área</h2>
                <p className="mt-2 text-sm text-muted-foreground">Apostila, edital, prática e acompanhamento organizados por produto.</p>
              </Link>
            </section>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* User Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-1"
            >
              <div className="bg-card rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-20 h-20 bg-[hsl(var(--primary))] rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-card-foreground text-center mb-6">
                  {user?.name || 'Usuário'}
                </h2>

                <div className="space-y-4 mb-6">
                  {user?.email && (
                    <div className="flex items-center space-x-3 text-card-foreground/80">
                      <Mail className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm break-all">{user.email}</span>
                    </div>
                  )}
                  {memberSince && (
                    <div className="flex items-center space-x-3 text-card-foreground/80">
                      <Calendar className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm">Membro desde {memberSince}</span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair da conta
                </Button>
              </div>
            </motion.div>

            {/* Central Nortis: produtos e módulos liberados por enrollments reais */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2"
            >
              <div className="bg-card rounded-2xl p-6 shadow-sm">
                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[hsl(var(--accent))] mb-2">
                    Central Nortis
                  </p>
                  <h2 className="text-2xl font-bold text-card-foreground">
                    Meus produtos e módulos
                  </h2>
                </div>

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Loader2 className="w-8 h-8 text-muted-foreground animate-spin mb-3" />
                    <p className="text-sm text-muted-foreground">Carregando seus materiais...</p>
                  </div>
                ) : loadError ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="w-8 h-8 text-destructive mb-3" />
                    <p className="text-sm text-muted-foreground">{loadError}</p>
                  </div>
                ) : enrollments.length > 0 ? (
                  <div className="space-y-4">
                    {enrollments.map((enrollment) => {
                      const grantedAt = formatDate(enrollment.granted_at);
                      const accessAvailable = hasAvailableAccess(enrollment);

                      return (
                        <div
                          key={enrollment.id}
                          className="p-5 bg-muted rounded-xl"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="font-semibold text-foreground">
                              {enrollment.products?.title || 'Material'}
                            </h3>
                            <span
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                                STATUS_BADGE_STYLES[enrollment.status] || 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {STATUS_LABELS[enrollment.status] || enrollment.status}
                            </span>
                          </div>

                          {grantedAt && (
                            <p className="text-sm text-muted-foreground mb-2">
                              Acesso concedido em {grantedAt}
                            </p>
                          )}

                          {accessAvailable ? (
                            enrollment.modules.length > 0 ? (
                              <div className="mt-4 pt-4 border-t border-border/70 space-y-3">
                                {enrollment.modules.map((module) => (
                                  <div
                                    key={module.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg bg-card p-4"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="w-9 h-9 rounded-lg bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] flex items-center justify-center shrink-0">
                                        <BookOpen className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <h4 className="font-semibold text-foreground">{module.title}</h4>
                                        {module.description && (
                                          <p className="text-xs leading-relaxed text-muted-foreground mt-1">
                                            {module.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {module.module_type === 'material' ? (
                                      <Button
                                        onClick={() => handleDownload(enrollment.id)}
                                        disabled={downloadingId === enrollment.id}
                                        size="sm"
                                        className="shrink-0 bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90"
                                      >
                                        {downloadingId === enrollment.id ? (
                                          <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Gerando link...
                                          </>
                                        ) : (
                                          <>
                                            <Download className="w-4 h-4 mr-2" />
                                            Baixar apostila
                                          </>
                                        )}
                                      </Button>
                                    ) : module.route_path ? (
                                      <Link to={module.route_path} className="shrink-0">
                                        <Button size="sm" variant="outline">
                                          Acessar módulo
                                          <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                      </Link>
                                    ) : null}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground mt-4 pt-4 border-t border-border/70">
                                Nenhum módulo está liberado para este produto no momento.
                              </p>
                            )
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Este acesso não está disponível no momento.
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-2">
                      Você ainda não possui produtos liberados nesta conta.
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Libere gratuitamente a preparação SEDES-DF 2026 na sua conta.
                    </p>
                    <FreeSedesAccessCta
                      onClaimed={reloadEnrollments}
                      className="bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyAccountPage;
