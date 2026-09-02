import { supabase } from '@/lib/supabase';

export async function getMyLeadNurturePreferences() {
  const { data, error } = await supabase
    .from('lead_nurture_preferences')
    .select('email_opt_in,whatsapp_opt_in,updated_at')
    .maybeSingle();

  if (error) return { data: null, error: 'Não foi possível carregar suas preferências de avisos.' };
  return { data: data ?? { email_opt_in: false, whatsapp_opt_in: false }, error: null };
}

export async function saveMyLeadNurturePreferences({ emailOptIn, whatsappOptIn }) {
  const { data, error } = await supabase.rpc('upsert_my_lead_nurture_preferences', {
    p_email_opt_in: Boolean(emailOptIn),
    p_whatsapp_opt_in: Boolean(whatsappOptIn),
  });

  if (error) return { data: null, error: 'Não foi possível salvar suas preferências de avisos.' };
  return { data: data?.[0] ?? { email_opt_in: false, whatsapp_opt_in: false }, error: null };
}
