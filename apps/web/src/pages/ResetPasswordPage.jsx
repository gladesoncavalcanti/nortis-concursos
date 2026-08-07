import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext.jsx';

// Tempo de tolerância, depois que o AuthContext termina a checagem
// inicial de sessão, para o evento PASSWORD_RECOVERY ainda poder
// chegar de forma assíncrona antes de tratar o link como
// inválido/expirado.
const RECOVERY_GRACE_MS = 5000;

const ResetPasswordPage = () => {
  // 'checking' | 'ready' | 'invalid'
  const [status, setStatus] = useState('checking');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updatePassword, isPasswordRecovery, isLoading: authIsLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Única fonte de verdade: isPasswordRecovery, alimentado pelo
    // AuthContext exclusivamente a partir do evento PASSWORD_RECOVERY
    // real do Supabase — nunca pela mera existência de uma sessão
    // (uma sessão de login comum NÃO libera este formulário).
    if (isPasswordRecovery) {
      setStatus('ready');
      return undefined;
    }

    // Enquanto o AuthContext ainda não concluiu sua checagem inicial,
    // aguarda — pode ser que PASSWORD_RECOVERY ainda vá chegar.
    if (authIsLoading) {
      return undefined;
    }

    // Checagem inicial concluída e nenhum PASSWORD_RECOVERY chegou
    // ainda: dá uma janela curta de tolerância (o evento pode chegar
    // logo em seguida) antes de tratar como link inválido/expirado.
    const timeout = setTimeout(() => {
      setStatus((current) => (current === 'ready' ? current : 'invalid'));
    }, RECOVERY_GRACE_MS);

    return () => clearTimeout(timeout);
  }, [isPasswordRecovery, authIsLoading]);

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
      if (result.warning) {
        toast(result.warning);
      }
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
