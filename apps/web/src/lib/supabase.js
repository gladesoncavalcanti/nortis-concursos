import { createClient } from '@supabase/supabase-js';

// Chave publishable (novo sistema de API keys do Supabase) — não há
// fallback para a chave anon legacy de propósito: a ausência desta
// variável deve falhar fechado, nunca reaproveitar uma credencial antiga.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Missing Supabase environment variables. Configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (see .env.example).'
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
