import { supabase } from '@/lib/supabase';

export async function getAdminDashboard() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: 'Entre com uma conta administradora para acessar o painel.' };
  }

  const { data, error } = await supabase.rpc('get_admin_dashboard');

  if (error) {
    if (error.message?.includes('admin_access_required')) {
      return { data: null, error: 'Esta conta não tem permissão administrativa.' };
    }

    if (error.message?.includes('authentication_required')) {
      return { data: null, error: 'Sessão não encontrada. Entre novamente.' };
    }

    return { data: null, error: 'Não foi possível carregar o painel interno agora.' };
  }

  return { data, error: null };
}
