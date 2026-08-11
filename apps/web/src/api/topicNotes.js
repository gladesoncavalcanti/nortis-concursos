import { supabase } from '@/lib/supabase';
import { validateTopicNote } from '@/api/topicNotesModel.js';

export async function getTopicNotes() {
  const { data, error } = await supabase
    .from('student_topic_notes')
    .select('syllabus_node_id,note,updated_at')
    .order('updated_at', { ascending: false });
  return {
    data: data ?? [],
    error: error ? 'Não foi possível carregar suas anotações.' : null,
  };
}

export async function saveTopicNote(syllabusNodeId, value) {
  const validation = validateTopicNote(value);
  if (validation.error) return { error: validation.error };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão não encontrada.' };
  const { error } = await supabase.from('student_topic_notes').upsert({
    user_id: user.id,
    syllabus_node_id: syllabusNodeId,
    note: validation.note,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,syllabus_node_id' });
  return { error: error ? 'Não foi possível salvar sua anotação.' : null };
}

export async function deleteTopicNote(syllabusNodeId) {
  const { error } = await supabase
    .from('student_topic_notes')
    .delete()
    .eq('syllabus_node_id', syllabusNodeId);
  return { error: error ? 'Não foi possível excluir sua anotação.' : null };
}
