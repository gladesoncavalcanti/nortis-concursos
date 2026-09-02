import { supabase } from '@/lib/supabase';

export async function getStudentOptInLeaderboard() {
  const { data, error } = await supabase.rpc('get_student_opt_in_leaderboard');
  if (error) return { data: [], error: 'Não foi possível carregar o ranking agora.' };
  return { data: data ?? [], error: null };
}

export async function saveMyRankingPreference({ enabled, displayName }) {
  const { data, error } = await supabase.rpc('upsert_my_ranking_preference', {
    p_enabled: Boolean(enabled),
    p_display_name: displayName,
  });

  if (error?.message?.includes('invalid_display_name')) {
    return { data: null, error: 'Use um nome público entre 3 e 40 caracteres.' };
  }
  if (error) return { data: null, error: 'Não foi possível salvar sua preferência de ranking.' };
  return { data: data?.[0] ?? null, error: null };
}
