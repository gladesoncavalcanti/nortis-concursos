import { supabase } from '@/lib/supabase';

export async function getMyMaterialMarks() {
  const { data, error } = await supabase
    .from('student_material_marks')
    .select('material_key,status,updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    return { data: [], error: 'Marcação de materiais indisponível até a próxima atualização do banco.' };
  }

  return { data: data ?? [], error: null };
}

export async function setMaterialMark(materialKey, status = 'reviewed') {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Sessão não encontrada.' };

  const { error } = await supabase
    .from('student_material_marks')
    .upsert({
      user_id: user.id,
      material_key: materialKey,
      status,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,material_key' });

  return { error: error ? 'Não foi possível marcar este material.' : null };
}

export async function clearMaterialMark(materialKey) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Sessão não encontrada.' };

  const { error } = await supabase
    .from('student_material_marks')
    .delete()
    .eq('user_id', user.id)
    .eq('material_key', materialKey);

  return { error: error ? 'Não foi possível remover a marcação.' : null };
}
