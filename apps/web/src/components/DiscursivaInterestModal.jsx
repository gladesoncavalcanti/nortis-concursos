import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import {
  DISCURSIVA_CATEGORIES,
  DISCURSIVA_SPECIALTIES_BY_CATEGORY,
  DISCURSIVA_PACKAGES_BY_CATEGORY,
  EMPTY_DISCURSIVA_INTEREST_FORM,
  validateDiscursivaInterestForm,
  submitDiscursivaInterest,
} from '@/api/discursivaInterest.js';
import { DISCURSIVA_PACKAGES } from '@/config/discursivaCatalog.js';

const CATEGORY_LABELS = { TDAS: 'TDAS', EDAS: 'EDAS' };

const inputClass =
  'bg-white/[0.04] border-white/15 text-[#f4efe4] placeholder:text-[#f4efe4]/40 h-11';
const selectClass =
  'w-full h-11 rounded-md px-3 text-sm bg-white/[0.04] border border-white/15 text-[#f4efe4] disabled:opacity-50 disabled:cursor-not-allowed';

/**
 * Modal de cadastro de interesse estruturado da Sprint Discursiva
 * (fatia vertical 2 — ver apps/web/src/api/discursivaInterest.js).
 *
 * Mesmo padrão visual e de estados (idle/success/error) do
 * FreeSampleModal.jsx já existente. Grava em
 * public.discursive_interest_leads — tabela nova e isolada, sem
 * checkout, sem Asaas, sem crédito, sem correção.
 *
 * `initialCategory`/`initialPackageId` permitem abrir o modal já
 * pré-preenchido a partir do botão de um pacote específico na landing;
 * quando abertos a partir do CTA genérico, ambos ficam vazios e o
 * aluno escolhe no próprio formulário.
 */
const DiscursivaInterestModal = ({ isOpen, onClose, initialCategory = '', initialPackageId = '' }) => {
  const [form, setForm] = useState(EMPTY_DISCURSIVA_INTEREST_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | success | error

  useEffect(() => {
    if (!isOpen) return;
    setForm((prev) => ({
      ...EMPTY_DISCURSIVA_INTEREST_FORM,
      category: initialCategory || '',
      packageInterest: initialPackageId || '',
    }));
    setErrors({});
    setStatus('idle');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialCategory, initialPackageId]);

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const updateField = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Trocar de categoria invalida a especialidade escolhida antes
      // (TDAS e EDAS nunca compartilham especialidade).
      if (field === 'category') {
        next.specialty = '';
        const validPackages = DISCURSIVA_PACKAGES_BY_CATEGORY[value] || [];
        if (!validPackages.includes(next.packageInterest)) next.packageInterest = '';
      }
      return next;
    });
  };

  const availableSpecialties = DISCURSIVA_SPECIALTIES_BY_CATEGORY[form.category] || [];
  const availablePackages = DISCURSIVA_PACKAGES.filter(
    (pkg) => !form.category || pkg.category === 'AMBOS' || pkg.category === form.category
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || status === 'success') return;

    const nextErrors = validateDiscursivaInterestForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    const result = await submitDiscursivaInterest(form);
    setIsSubmitting(false);

    if (!result.success) {
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
          className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-label="Cadastro de interesse — Sprint Discursiva"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md my-8 rounded-2xl p-7"
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
                <h3 className="text-lg font-bold text-[#f4efe4] mb-2">Interesse registrado</h3>
                <p className="text-sm text-[#f4efe4]/70 leading-relaxed mb-6">
                  Recebemos seu cadastro. A Nortis vai entrar em contato assim que as vagas do seu
                  cargo forem abertas.
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
                <Send className="w-8 h-8 mb-4" style={{ color: '#f1c85b' }} />
                <h3 className="text-lg font-bold text-[#f4efe4] mb-2">Entrar na lista de interesse</h3>
                <p className="text-sm text-[#f4efe4]/65 leading-relaxed mb-5">
                  Informe seus dados e o cargo de interesse. Avisamos assim que as vagas abrirem.
                </p>

                <form onSubmit={handleSubmit} noValidate className="space-y-3">
                  <div>
                    <Input
                      value={form.name}
                      onChange={updateField('name')}
                      placeholder="Nome"
                      disabled={isSubmitting}
                      className={inputClass}
                    />
                    {errors.name && <p className="text-xs text-red-400 mt-1.5">{errors.name}</p>}
                  </div>

                  <div>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={updateField('email')}
                      placeholder="E-mail"
                      disabled={isSubmitting}
                      className={inputClass}
                    />
                    {errors.email && <p className="text-xs text-red-400 mt-1.5">{errors.email}</p>}
                  </div>

                  <div>
                    <Input
                      type="tel"
                      value={form.whatsapp}
                      onChange={updateField('whatsapp')}
                      placeholder="WhatsApp com DDD"
                      disabled={isSubmitting}
                      className={inputClass}
                    />
                    {errors.whatsapp && <p className="text-xs text-red-400 mt-1.5">{errors.whatsapp}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <select
                        value={form.category}
                        onChange={updateField('category')}
                        disabled={isSubmitting}
                        className={selectClass}
                      >
                        <option value="">Categoria</option>
                        {DISCURSIVA_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {CATEGORY_LABELS[cat]}
                          </option>
                        ))}
                      </select>
                      {errors.category && <p className="text-xs text-red-400 mt-1.5">{errors.category}</p>}
                    </div>

                    <div>
                      <select
                        value={form.specialty}
                        onChange={updateField('specialty')}
                        disabled={isSubmitting || !form.category}
                        className={selectClass}
                      >
                        <option value="">Especialidade</option>
                        {availableSpecialties.map((spec) => (
                          <option key={spec.value} value={spec.value}>
                            {spec.label}
                          </option>
                        ))}
                      </select>
                      {errors.specialty && <p className="text-xs text-red-400 mt-1.5">{errors.specialty}</p>}
                    </div>
                  </div>

                  <div>
                    <select
                      value={form.packageInterest}
                      onChange={updateField('packageInterest')}
                      disabled={isSubmitting}
                      className={selectClass}
                    >
                      <option value="">Pacote de interesse</option>
                      {availablePackages.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name}
                        </option>
                      ))}
                    </select>
                    {errors.packageInterest && (
                      <p className="text-xs text-red-400 mt-1.5">{errors.packageInterest}</p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-start gap-2.5 text-xs text-[#f4efe4]/65 leading-relaxed cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={form.consent}
                        onChange={updateField('consent')}
                        disabled={isSubmitting}
                        className="mt-0.5 shrink-0 accent-[#d3a52f]"
                      />
                      <span>
                        Autorizo o contato da Nortis Concursos sobre a Sprint Discursiva e aceito a{' '}
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
                        'Entrar na lista de interesse'
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

export default DiscursivaInterestModal;
