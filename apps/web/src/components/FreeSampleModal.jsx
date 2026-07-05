import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { supabase } from '@/lib/supabase';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMPTY_FORM = { name: '', email: '', consent: false };

/**
 * Modal de captura de lead para a amostra gratuita (Fase 5).
 *
 * Grava em public.free_sample_leads — tabela NOVA e ISOLADA, sem
 * relação com products/orders/enrollments/profiles. Não existe PDF de
 * amostra real no projeto (verificado antes de implementar), então após
 * o cadastro mostramos uma mensagem honesta em vez de simular um
 * download que não existe.
 *
 * Reaproveita o cliente Supabase padrão do frontend (apps/web/src/lib/
 * supabase.js, chave anon) — o INSERT só funciona porque a migration
 * cria uma policy pública de INSERT (sem SELECT/UPDATE/DELETE).
 */
const FreeSampleModal = ({ isOpen, onClose }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | success | error

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
    // reseta pra próxima vez que o modal abrir, sem afetar nada externo
    setForm(EMPTY_FORM);
    setErrors({});
    setStatus('idle');
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Informe seu nome.';
    if (!form.email.trim()) {
      nextErrors.email = 'Informe seu e-mail.';
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      nextErrors.email = 'Informe um e-mail válido.';
    }
    if (!form.consent) nextErrors.consent = 'É necessário autorizar o contato para continuar.';
    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || status === 'success') return;

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    const { error } = await supabase.from('free_sample_leads').insert({
      name: form.name.trim(),
      email: form.email.trim(),
      consent: form.consent,
      source: 'apostila_preview',
      product_slug: 'nexo-social-sedes-df-2026',
    });
    setIsSubmitting(false);

    if (error) {
      setStatus('error');
      return;
    }
    setStatus('success');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-label="Receba a amostra gratuita"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-sm rounded-2xl p-7"
            style={{ background: '#0b2238', border: '1px solid rgba(211,165,47,0.3)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleClose}
              aria-label="Fechar"
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-[#f4efe4]/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {status === 'success' ? (
              <div className="text-center py-2">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-4" style={{ color: '#f1c85b' }} />
                <h3 className="text-lg font-bold text-[#f4efe4] mb-2">Cadastro recebido</h3>
                <p className="text-sm text-[#f4efe4]/70 leading-relaxed mb-6">
                  A amostra gratuita será enviada assim que estiver disponível.
                </p>
                <Button
                  type="button"
                  onClick={handleClose}
                  className="w-full h-11 font-bold text-sm uppercase tracking-wide rounded-sm text-[#f1c85b] hover:text-[#f1c85b] transition-premium"
                  style={{ border: '1px solid #d3a52f', background: 'rgba(211,165,47,0.08)' }}
                >
                  Fechar
                </Button>
              </div>
            ) : (
              <>
                <Download className="w-8 h-8 mb-4" style={{ color: '#f1c85b' }} />
                <h3 className="text-lg font-bold text-[#f4efe4] mb-2">Receba a amostra gratuita</h3>
                <p className="text-sm text-[#f4efe4]/65 leading-relaxed mb-5">
                  Informe seus dados para acessar uma prévia do material Nexo Social SEDES-DF 2026.
                </p>

                <form onSubmit={handleSubmit} noValidate className="space-y-3">
                  <div>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome"
                      disabled={isSubmitting}
                      className="bg-white/[0.04] border-white/15 text-[#f4efe4] placeholder:text-[#f4efe4]/40 h-11"
                    />
                    {errors.name && <p className="text-xs text-red-400 mt-1.5">{errors.name}</p>}
                  </div>

                  <div>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="E-mail"
                      disabled={isSubmitting}
                      className="bg-white/[0.04] border-white/15 text-[#f4efe4] placeholder:text-[#f4efe4]/40 h-11"
                    />
                    {errors.email && <p className="text-xs text-red-400 mt-1.5">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="flex items-start gap-2.5 text-xs text-[#f4efe4]/65 leading-relaxed cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={form.consent}
                        onChange={(e) => setForm((prev) => ({ ...prev, consent: e.target.checked }))}
                        disabled={isSubmitting}
                        className="mt-0.5 shrink-0 accent-[#d3a52f]"
                      />
                      <span>
                        Autorizo o contato da Nortis Concursos sobre este material e aceito a{' '}
                        <Link
                          to="/politica-privacidade"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-[#f1c85b]"
                        >
                          Política de Privacidade
                        </Link>
                        .
                      </span>
                    </label>
                    {errors.consent && <p className="text-xs text-red-400 mt-1.5">{errors.consent}</p>}
                  </div>

                  {status === 'error' && (
                    <p className="text-xs text-red-400">
                      Não foi possível enviar seu cadastro agora. Tente novamente em alguns instantes.
                    </p>
                  )}

                  <div className="pt-1 space-y-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-11 font-bold text-sm uppercase tracking-wide rounded-sm text-[#f1c85b] hover:text-[#f1c85b] transition-premium"
                      style={{ border: '1px solid #d3a52f', background: 'rgba(211,165,47,0.08)' }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...
                        </>
                      ) : (
                        'Receber amostra'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="w-full h-10 text-sm text-[#f4efe4]/60 hover:text-[#f4efe4] hover:bg-white/5"
                    >
                      Agora não
                    </Button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FreeSampleModal;
