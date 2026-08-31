import { supabase } from '@/lib/supabase';

export async function claimContestInterest(contestSlug) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: 'Entre ou crie sua conta para acompanhar este concurso.' };
  }

  const { data, error } = await supabase.rpc('claim_contest_interest', {
    p_contest_slug: contestSlug,
  });

  if (error) {
    if (error.message?.includes('invalid_contest_slug')) {
      return { data: null, error: 'Este concurso ainda não está disponível para acompanhamento.' };
    }

    return { data: null, error: 'Não foi possível registrar seu interesse agora.' };
  }

  return { data: data?.[0] ?? null, error: null };
}

