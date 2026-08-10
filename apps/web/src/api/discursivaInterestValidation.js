/**
 * Validação pura (sem I/O, sem dependência do Supabase ou de alias do
 * Vite) do formulário de cadastro de interesse da Sprint Discursiva.
 *
 * Separado de discursivaInterest.js de propósito: este arquivo não
 * importa nada, então pode ser testado com `node` puro, sem bundler —
 * ver apps/web/scripts/test-discursiva-interest-validation.mjs.
 * discursivaInterest.js reexporta tudo daqui e adiciona só a parte que
 * fala com o Supabase (submitDiscursivaInterest).
 */

export const DISCURSIVA_CATEGORIES = ['TDAS', 'EDAS'];

export const DISCURSIVA_SPECIALTIES_BY_CATEGORY = {
  TDAS: [
    { value: 'agente_social', label: 'Agente Social' },
    { value: 'tecnico_administrativo', label: 'Técnico Administrativo' },
  ],
  EDAS: [{ value: 'servico_social', label: 'Serviço Social' }],
};

export const DISCURSIVA_PACKAGES_BY_CATEGORY = {
  TDAS: ['diagnostico', 'tdas-essencial', 'tdas-intensivo'],
  EDAS: ['diagnostico', 'edas-essencial', 'edas-intensivo'],
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const EMPTY_DISCURSIVA_INTEREST_FORM = {
  name: '',
  email: '',
  whatsapp: '',
  category: '',
  specialty: '',
  packageInterest: '',
  consent: false,
};

/**
 * Validação client-side (UX, não segurança — a garantia real é o
 * CHECK constraint no banco, ver a migration
 * 20260810000000_create_discursive_interest_leads.sql).
 *
 * @param {typeof EMPTY_DISCURSIVA_INTEREST_FORM} form
 * @returns {Record<string, string>} mapa de campo -> mensagem de erro (vazio = válido)
 */
export function validateDiscursivaInterestForm(form) {
  const errors = {};

  if (!form.name || !form.name.trim()) {
    errors.name = 'Informe seu nome.';
  }

  if (!form.email || !form.email.trim()) {
    errors.email = 'Informe seu e-mail.';
  } else if (!EMAIL_REGEX.test(form.email.trim())) {
    errors.email = 'Informe um e-mail válido.';
  }

  const whatsappDigits = (form.whatsapp || '').replace(/\D/g, '');
  if (whatsappDigits.length < 10 || whatsappDigits.length > 13) {
    errors.whatsapp = 'Informe um WhatsApp válido, com DDD.';
  }

  if (!DISCURSIVA_CATEGORIES.includes(form.category)) {
    errors.category = 'Selecione TDAS ou EDAS.';
  }

  const validSpecialties = (DISCURSIVA_SPECIALTIES_BY_CATEGORY[form.category] || []).map((s) => s.value);
  if (!validSpecialties.includes(form.specialty)) {
    errors.specialty = 'Selecione uma especialidade válida para a categoria escolhida.';
  }

  const validPackages = DISCURSIVA_PACKAGES_BY_CATEGORY[form.category] || [];
  if (!validPackages.includes(form.packageInterest)) {
    errors.packageInterest = 'Selecione um pacote válido para a categoria escolhida.';
  }

  if (!form.consent) {
    errors.consent = 'É necessário autorizar o contato para continuar.';
  }

  return errors;
}
