import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { useAuth, RECOVERY_EMAIL_SENT_MESSAGE } from '@/contexts/AuthContext.jsx';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setFieldError('Informe seu e-mail.');
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setFieldError('Informe um e-mail válido.');
      return;
    }

    setFieldError('');
    setIsSubmitting(true);
    await forgotPassword(trimmedEmail);
    setIsSubmitting(false);
    setIsSent(true);
  };

  return (
    <>
      <Helmet>
        <title>Esqueci minha senha | Nortis Concursos</title>
        <meta name="description" content="Redefina sua senha de acesso à Nortis Concursos." />
        <link rel="canonical" href="https://www.nortisconcursos.com.br/esqueci-senha" />
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
              Esqueci minha senha
            </h1>
            <p className="text-muted-foreground">
              Informe seu e-mail e enviaremos um link para redefinir sua senha
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg">
            {isSent ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-12 h-12 rounded-full bg-[hsl(var(--accent))]/15 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-[hsl(var(--accent))]" aria-hidden="true" />
                  </div>
                </div>
                <p className="text-card-foreground">{RECOVERY_EMAIL_SENT_MESSAGE}</p>
                <Link
                  to="/login"
                  className="inline-block text-sm text-[hsl(var(--primary))] hover:underline font-semibold"
                >
                  Voltar para o login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-card-foreground mb-2">
                    E-mail
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldError) setFieldError('');
                    }}
                    className="text-gray-900"
                    aria-invalid={Boolean(fieldError)}
                    aria-describedby={fieldError ? 'email-error' : undefined}
                    required
                  />
                  {fieldError && (
                    <p id="email-error" className="text-xs text-red-500 mt-1.5">
                      {fieldError}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90 font-semibold"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar link de recuperação'}
                  <Mail className="ml-2 w-5 h-5" aria-hidden="true" />
                </Button>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="text-sm text-card-foreground/70 hover:text-[hsl(var(--primary))] transition-colors"
                  >
                    Voltar para o login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
