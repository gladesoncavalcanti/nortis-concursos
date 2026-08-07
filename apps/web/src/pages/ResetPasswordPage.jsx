import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext.jsx';

// Tempo máximo esperando o Supabase confirmar uma sessão de
// recuperação válida antes de tratar o link como inválido/expirado.
const SESSION_CHECK_TIMEOUT_MS = 6000;

const ResetPasswordPage = () => {
  // 'checking' | 'ready' | 'invalid'
  const [status, setStatus] = useState('checking');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let settled = false;

    const markReady = () => {
      if (settled) return;
      settled = true;
      setStatus('ready');
    };

    // Fonte de verdade: o evento PASSWORD_RECOVERY que o próprio
    // Supabase dispara ao processar o link (nunca lemos query params
    // manualmente para decidir se o usuário está autorizado).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        markReady();
      }
    });

    // Cobre a corrida em que o SDK já processou o link antes deste
    // componente se inscrever no evento acima.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) markReady();
    });

    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        setStatus('invalid');
      }
    }, SESSION_CHECK_TIMEOUT_MS);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!password || !confirmPassword) {
      toast.error('Preencha os dois campos.');
      return;
    }

    if (password.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setIsSubmitting(true);
    const result = await updatePassword(password);
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Senha redefinida com sucesso. Entre com sua nova senha.');
      navigate('/login');
    } else {
      toast.error(result.error || 'Não foi possível redefinir sua senha agora.');
    }
  };

  return (
    <>
      <Helmet>
        <title>Redefinir senha | Nortis Concursos</title>
        <meta name="description" content="Defina uma nova senha de acesso à Nortis Concursos." />
        <link rel="canonical" href="https://www.nortisconcursos.com.br/redefinir-senha" />
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-[hsl(var(--primary))] rounded-xl flex items-center justify-center">
                <span className="text-3xl font-bold text-white">N</span>
              </div>
            </div>
            <h1
              className="text-3xl md:text-4xl font-bold text-foreground mb-2 leading-tight"
              style={{ letterSpacing: '-0.02em' }}
            >
              Redefinir senha
            </h1>
            <p className="text-muted-foreground">Escolha uma nova senha para sua conta</p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg">
            {status === 'checking' && (
              <div className="text-center py-6">
                <div
                  className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"
                  role="status"
                  aria-label="Verificando link de recuperação"
                />
                <p className="text-muted-foreground text-sm">Verificando seu link de recuperação...</p>
              </div>
            )}

            {status === 'invalid' && (
              <div className="text-center space-y-4">
                <p className="text-card-foreground">Este link de redefinição é inválido ou expirou.</p>
                <Link
                  to="/esqueci-senha"
                  className="inline-block text-sm text-[hsl(var(--primary))] hover:underline font-semibold"
                >
                  Pedir um novo link
                </Link>
              </div>
            )}

            {status === 'ready' && (
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-card-foreground mb-2">
                    Nova senha
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-card-foreground mb-2">
                    Confirmar nova senha
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Digite a senha novamente"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="text-gray-900"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90 font-semibold"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
                  <KeyRound className="ml-2 w-5 h-5" aria-hidden="true" />
                </Button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
