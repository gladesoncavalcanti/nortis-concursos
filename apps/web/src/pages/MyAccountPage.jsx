import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Download, User, Mail, Calendar, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const MyAccountPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/');
    } else {
      toast.error(result.error);
    }
  };

  const purchasedApostilas = [
    {
      id: 1,
      title: 'Apostila SEDES DF 2026',
      purchaseDate: '2026-06-15',
      downloadUrl: '#'
    }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <>
      <Helmet>
        <title>Minha Conta - NORTIS CONCURSOS</title>
        <meta name="description" content="Gerencie sua conta, acesse suas apostilas e acompanhe seu histórico de compras." />
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
              Gerencie suas informações e acesse seus materiais
            </p>
          </motion.div>

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
                  <div className="flex items-center space-x-3 text-card-foreground/80">
                    <Mail className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm break-all">{user?.email || 'email@exemplo.com'}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-card-foreground/80">
                    <Calendar className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">
                      Membro desde {user?.createdAt ? formatDate(user.createdAt) : 'junho de 2026'}
                    </span>
                  </div>
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

            {/* Purchased Apostilas */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2"
            >
              <div className="bg-card rounded-2xl p-6 shadow-sm mb-6">
                <h2 className="text-2xl font-bold text-card-foreground mb-6">
                  Minhas Apostilas
                </h2>

                {purchasedApostilas.length > 0 ? (
                  <div className="space-y-4">
                    {purchasedApostilas.map((apostila) => (
                      <div
                        key={apostila.id}
                        className="flex items-center justify-between p-4 bg-muted rounded-xl"
                      >
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">
                            {apostila.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Comprado em {formatDate(apostila.purchaseDate)}
                          </p>
                        </div>
                        <Button size="sm" className="bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90">
                          <Download className="w-4 h-4 mr-2" />
                          Baixar
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Download className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Você ainda não possui apostilas
                    </p>
                    <Button
                      onClick={() => navigate('/apostilas')}
                      className="bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90"
                    >
                      Ver apostilas disponíveis
                    </Button>
                  </div>
                )}
              </div>

              {/* Purchase History */}
              <div className="bg-card rounded-2xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-card-foreground mb-6">
                  Histórico de Compras
                </h2>

                {purchasedApostilas.length > 0 ? (
                  <div className="space-y-3">
                    {purchasedApostilas.map((apostila) => (
                      <div
                        key={apostila.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-card-foreground">{apostila.title}</p>
                          <p className="text-sm text-card-foreground/60">
                            {formatDate(apostila.purchaseDate)}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-green-600">
                          Concluído
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma compra realizada ainda
                  </p>
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