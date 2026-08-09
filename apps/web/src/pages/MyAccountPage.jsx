import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Mail, Calendar, LogOut, Loader2, AlertCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { getMyEnrollments } from '@/api/enrollments.js';
import PersonalizationQuiz from '@/components/PersonalizationQuiz.jsx';

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

const MyAccountPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

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

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/');
    } else {
      toast.error(result.error);
    }
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
              Gerencie suas informações e acompanhe seus materiais liberados
            </p>
          </motion.div>

          {/* Diagnóstico inicial (Sprint Funcional 1.2) — 100% local, ver PersonalizationQuiz.jsx */}
          <div className="mb-8">
            <PersonalizationQuiz userId={user?.id} />
          </div>

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

            {/* Materiais liberados (enrollments reais) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2"
            >
              <div className="bg-card rounded-2xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-card-foreground mb-6">
                  Minhas Apostilas
                </h2>

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

                      return (
                        <div
                          key={enrollment.id}
                          className="p-4 bg-muted rounded-xl"
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

                          {enrollment.status === 'active' ? (
                            <p className="text-sm text-muted-foreground">
                              Acesso registrado. O download seguro será disponibilizado nesta área
                              após a conclusão da configuração de entrega.
                            </p>
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
                      Você ainda não possui materiais liberados nesta conta.
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Vendas temporariamente pausadas durante o pré-lançamento.
                    </p>
                    <Link to="/apostilas">
                      <Button className="bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90">
                        Ver apostilas
                      </Button>
                    </Link>
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
