import { supabase } from '@/lib/supabase';

export async function getMyQuestionFavorites() {
  const { data, error } = await supabase
    .from('question_favorites')
    .select('question_id,created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: 'Favoritos indisponíveis até a próxima atualização do banco.' };
  }

  return { data: data ?? [], error: null };
}

export async function setQuestionFavorite(questionId, favorite) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Sessão não encontrada.' };

  if (favorite) {
    const { error } = await supabase
      .from('question_favorites')
      .upsert({ user_id: user.id, question_id: questionId }, { onConflict: 'user_id,question_id' });

    return { error: error ? 'Não foi possível salvar o favorito.' : null };
  }

  const { error } = await supabase
    .from('question_favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('question_id', questionId);

  return { error: error ? 'Não foi possível remover o favorito.' : null };
}
