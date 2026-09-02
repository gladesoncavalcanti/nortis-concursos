import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { toast } from 'sonner';
import { useAuth, PENDING_CONFIRMATION_MESSAGE } from '@/contexts/AuthContext.jsx';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const safeRedirect = redirectTo?.startsWith('/minha-conta') ? redirectTo : '/minha-conta/onboarding';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (formData.name.length < 3) {
      toast.error('Nome deve ter pelo menos 3 caracteres');
      return;
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error('E-mail inválido');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setIsSubmitting(true);

    const result = await register(formData.name, formData.email, formData.password);

    if (result.success) {
      if (result.requiresEmailConfirmation) {
        toast.success(PENDING_CONFIRMATION_MESSAGE);
        navigate(`/login?cadastro=sucesso&redirect=${encodeURIComponent(safeRedirect)}`);
      } else {
        toast.success('Conta criada com sucesso');
        navigate(safeRedirect);
      }
    } else {
      toast.error(result.error || 'Erro ao criar conta');
    }

    setIsSubmitting(false);
  };

  return (
    <>
      <Helmet>
        <title>Criar Conta - NORTIS CONCURSOS</title>
        <meta name="description" content="Crie sua conta na Nortis Concursos e tenha acesso a apostilas completas para concursos públicos." />
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
              Crie sua conta
            </h1>
            <p className="text-muted-foreground">
              Comece sua jornada rumo à aprovação
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-card-foreground mb-2">
                  Nome completo
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Digite seu nome"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-gray-900"
                  required
                />
              </div>

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
                <label htmlFor="password" className="block text-sm font-medium text-card-foreground mb-2">
                  Senha
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="text-gray-900"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-card-foreground mb-2">
                  Confirmar senha
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Digite a senha novamente"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                {isSubmitting ? 'Criando conta...' : 'Criar conta'}
                <UserPlus className="ml-2 w-5 h-5" />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-card-foreground/70">
                Já tem uma conta?{' '}
                <Link to="/login" className="text-[hsl(var(--primary))] hover:underline font-semibold">
                  Entrar
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default SignupPage;
