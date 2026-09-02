import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { toast } from 'sonner';
import { useAuth, PENDING_CONFIRMATION_MESSAGE } from '@/contexts/AuthContext.jsx';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const cadastroSucesso = searchParams.get('cadastro') === 'sucesso';
  const emailConfirmado = searchParams.get('confirmed') === '1';
  const redirectTo = searchParams.get('redirect');
  const safeRedirect = redirectTo?.startsWith('/minha-conta') ? redirectTo : '/minha-conta';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error('E-mail inválido');
      return;
    }

    setIsSubmitting(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success('Login realizado com sucesso');
      navigate(safeRedirect);
    } else {
      toast.error(result.error || 'E-mail ou senha inválidos.');
    }

    setIsSubmitting(false);
  };

  return (
    <>
      <Helmet>
        <title>Login | Nortis Concursos</title>
        <meta name="description" content="Acesse sua conta Nortis Concursos para consultar seus materiais digitais." />
        <link rel="canonical" href="https://www.nortisconcursos.com.br/login" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Login | Nortis Concursos" />
        <meta property="og:description" content="Acesse sua conta Nortis Concursos para consultar seus materiais digitais." />
        <meta property="og:url" content="https://www.nortisconcursos.com.br/login" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Login | Nortis Concursos" />
        <meta name="twitter:description" content="Acesse sua conta Nortis Concursos para consultar seus materiais digitais." />
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
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 leading-tight" style={{ letterSpacing: '-0.02em' }}>
              Bem-vindo de volta
            </h1>
            <p className="text-muted-foreground">
              Entre na sua conta para acessar seus materiais
            </p>
          </div>

          {(cadastroSucesso || emailConfirmado) && (
            <div className="mb-6 rounded-lg border border-[hsl(var(--accent))]/40 bg-[hsl(var(--accent))]/10 px-4 py-3 text-sm text-card-foreground">
              {emailConfirmado ? 'E-mail confirmado! Você já pode entrar.' : PENDING_CONFIRMATION_MESSAGE}
            </div>
          )}

          <div className="bg-card rounded-2xl p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-2">
                  E-mail
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="text-gray-900"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-card-foreground">
                    Senha
                  </label>
                  <Link
                    to="/esqueci-senha"
                    className="text-sm text-[hsl(var(--primary))] hover:underline font-medium"
                  >
                    Esqueci minha senha
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                {isSubmitting ? 'Entrando...' : 'Entrar'}
                <LogIn className="ml-2 w-5 h-5" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-card-foreground/70">
                Não tem uma conta?{' '}
                <Link to="/signup" className="text-[hsl(var(--primary))] hover:underline font-semibold">
                  Cadastre-se
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;
