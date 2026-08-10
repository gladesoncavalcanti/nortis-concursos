import { supabase } from '@/lib/supabase';
import {
  DISCURSIVA_CATEGORIES,
  DISCURSIVA_SPECIALTIES_BY_CATEGORY,
  DISCURSIVA_PACKAGES_BY_CATEGORY,
  EMPTY_DISCURSIVA_INTEREST_FORM,
  validateDiscursivaInterestForm,
} from '@/api/discursivaInterestValidation.js';

/**
 * Cadastro de interesse estruturado da Sprint Discursiva (SEDES-DF 2026).
 *
 * Grava em public.discursive_interest_leads — tabela NOVA e ISOLADA
 * (migration 20260810000000_create_discursive_interest_leads.sql),
 * sem relação com products/orders/enrollments/profiles/free_sample_leads.
 * Não envolve checkout, Asaas, créditos ou correção — é só captura de
 * demanda para os pontos de decisão do cronograma (abrir TDAS
 * Intensivo/EDAS, etc.).
 *
 * Reaproveita o cliente Supabase padrão do frontend (chave publishable)
 * — o INSERT só funciona porque a migration cria uma policy pública de
 * INSERT (sem SELECT/UPDATE/DELETE), no mesmo padrão de
 * free_sample_leads.
 *
 * A validação em si (validateDiscursivaInterestForm) vive em
 * discursivaInterestValidation.js — um módulo sem nenhum import, para
 * poder ser testado com `node` puro, sem bundler (ver
 * apps/web/scripts/test-discursiva-interest-validation.mjs). Reexportada
 * aqui só por conveniência, para quem já importa deste arquivo.
 */
export {
  DISCURSIVA_CATEGORIES,
  DISCURSIVA_SPECIALTIES_BY_CATEGORY,
  DISCURSIVA_PACKAGES_BY_CATEGORY,
  EMPTY_DISCURSIVA_INTEREST_FORM,
  validateDiscursivaInterestForm,
};

/**
 * Envia o cadastro de interesse. Nunca lança — sempre retorna
 * { success, error }, para o componente decidir a UI sem try/catch.
 *
 * @param {typeof EMPTY_DISCURSIVA_INTEREST_FORM} form
 * @returns {Promise<{ success: boolean, error: string|null }>}
 */
export async function submitDiscursivaInterest(form) {
  const { error } = await supabase.from('discursive_interest_leads').insert({
    name: form.name.trim(),
    email: form.email.trim(),
    whatsapp: form.whatsapp.replace(/\D/g, ''),
    category: form.category,
    specialty: form.specialty,
    package_interest: form.packageInterest,
    consent: form.consent,
    source: 'sprint_discursiva_landing',
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
