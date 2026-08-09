import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext(null);

/**
 * Mensagem neutra exibida tanto no cadastro quanto no retorno via
 * /login?cadastro=sucesso — nunca confirma nem nega se o e-mail já
 * possuía conta (evita enumeração de contas).
 */
export const PENDING_CONFIRMATION_MESSAGE =
  'Verifique seu e-mail para continuar. Se o cadastro puder ser concluído, você receberá um link de confirmação.';

/**
 * Mesma lógica de neutralidade do PENDING_CONFIRMATION_MESSAGE acima,
 * aplicada à recuperação de senha: nunca confirma nem nega se existe
 * conta para o e-mail informado (evita enumeração de contas).
 */
export const RECOVERY_EMAIL_SENT_MESSAGE =
  'Se houver uma conta com este e-mail, você vai receber um link para redefinir sua senha em instantes.';

/**
 * Converte o `user` bruto do Supabase Auth para o shape já esperado
 * pelos componentes existentes (MyAccountPage, etc.).
 */
function normalizeUser(rawUser) {
  if (!rawUser) return null;

  return {
    id: rawUser.id,
    email: rawUser.email,
    name: rawUser.user_metadata?.full_name || rawUser.email,
    createdAt: rawUser.created_at,
  };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Único sinalizador de recovery do app: só fica true quando o
  // próprio Supabase dispara o evento PASSWORD_RECOVERY (link de
  // "esqueci minha senha" processado). Nunca inferido a partir da mera
  // existência de uma sessão — uma sessão normal (login comum) não
  // prova que houve um fluxo de recuperação. ResetPasswordPage lê este
  // valor em vez de manter seu próprio listener, porque este provider
  // monta antes de qualquer página e é o lugar com menor chance de
  // perder o evento por corrida de inicialização do SDK.
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    // Migração do mock antigo: essas chaves não são mais lidas nem
    // gravadas, mas podem existir no navegador de sessões anteriores.
    localStorage.removeItem('nortis_user');
    localStorage.removeItem('nortis_users');

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(normalizeUser(session?.user));
      setIsAuthenticated(Boolean(session?.user));
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(normalizeUser(session?.user));
      setIsAuthenticated(Boolean(session?.user));

      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      } else if (event === 'SIGNED_OUT' || event === 'SIGNED_IN') {
        // Encerra o "modo recovery" ao sair (inclusive o signOut que
        // updatePassword faz ao final) ou ao entrar normalmente por
        // login — nunca deixa o sinalizador vazar para outra sessão.
        setIsPasswordRecovery(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        if (error.code === 'email_not_confirmed') {
          return { success: false, error: 'Confirme seu e-mail antes de entrar.' };
        }
        if (error.code === 'invalid_credentials') {
          return { success: false, error: 'E-mail ou senha inválidos.' };
        }
        return { success: false, error: 'Não foi possível entrar agora. Tente novamente.' };
      }

      const normalized = normalizeUser(data.user);
      setUser(normalized);
      setIsAuthenticated(true);

      return { success: true, user: normalized };
    } catch (error) {
      return { success: false, error: 'Não foi possível entrar agora. Tente novamente.' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/login?confirmed=1`,
        },
      });

      if (error) {
        // Nunca diferenciar "conta já existe" de outros erros — evita
        // enumeração de contas. Mensagem amigável só para códigos
        // documentados que não revelam nada sobre a existência da conta.
        if (error.code === 'weak_password') {
          return { success: false, error: 'Senha muito fraca. Use uma senha mais forte.' };
        }
        return { success: false, error: 'Não foi possível concluir o cadastro agora. Tente novamente.' };
      }

      // signUp sem erro e sem sessão imediata é sempre tratado como
      // confirmação pendente — nunca se afirma nem se nega se o e-mail
      // já tinha conta (o Supabase não retorna erro explícito nesse
      // caso, exatamente para evitar enumeração de contas).
      if (!data.session) {
        return { success: true, requiresEmailConfirmation: true };
      }

      const normalized = normalizeUser(data.user);
      setUser(normalized);
      setIsAuthenticated(true);

      return { success: true, user: normalized };
    } catch (error) {
      return { success: false, error: 'Não foi possível concluir o cadastro agora. Tente novamente.' };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });

      // 'session_not_found' significa que já não havia sessão local — o
      // objetivo do logout já está satisfeito, então tratamos como sucesso.
      if (error && error.code !== 'session_not_found') {
        return { success: false, error: 'Não foi possível sair agora. Tente novamente.' };
      }

      setUser(null);
      setIsAuthenticated(false);

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Não foi possível sair agora. Tente novamente.' };
    }
  };

  /**
   * Dispara o e-mail de recuperação de senha do Supabase Auth.
   *
   * Em caso de sucesso da chamada, retorna sempre a mesma mensagem
   * neutra (RECOVERY_EMAIL_SENT_MESSAGE) — igual exista ou não conta
   * para o e-mail informado. O Supabase já não diferencia os dois
   * casos nesta chamada, então isso não é enumeração de conta.
   *
   * Um `error` aqui é sempre operacional (rede, indisponibilidade,
   * rate limit) — nunca "conta não existe", já que o Supabase não
   * expõe essa distinção neste endpoint. Por isso é seguro reportar
   * falha sem checar `.message`/texto (só `.code`/presença do erro):
   * o mesmo tipo de falha ocorreria igualmente para um e-mail com ou
   * sem conta, então não vaza nenhuma informação sobre a conta.
   * Validação de formato de e-mail é feita na página, antes de chamar
   * esta função.
   */
  const forgotPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });

      if (error) {
        return {
          success: false,
          error: 'Não foi possível processar sua solicitação agora. Tente novamente em instantes.',
        };
      }

      return { success: true };
    } catch (_error) {
      return {
        success: false,
        error: 'Não foi possível processar sua solicitação agora. Tente novamente em instantes.',
      };
    }
  };

  /**
   * Define a nova senha durante o fluxo de recuperação. Só deve ser
   * chamada quando já existe uma sessão de recovery válida (ver
   * ResetPasswordPage, que lê `isPasswordRecovery` deste contexto —
   * alimentado exclusivamente pelo evento PASSWORD_RECOVERY real).
   *
   * Após sucesso, tenta encerrar a sessão de recovery — o fluxo
   * esperado é redirecionar para /login, não permanecer autenticado
   * aqui. A partir do momento em que `updateUser` retorna sem erro, a
   * senha JÁ foi alterada no servidor: um eventual erro no `signOut`
   * abaixo é só falha de limpeza local, nunca motivo para reportar que
   * a troca de senha falhou (isso seria falso e reverteria uma ação já
   * concluída aos olhos do usuário). Por isso o retorno distingue os
   * dois casos: sucesso limpo, e sucesso com aviso de que a sessão
   * pode ter permanecido ativa localmente.
   */
  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        if (error.code === 'weak_password') {
          return { success: false, error: 'Senha muito fraca. Use uma senha mais forte.' };
        }
        if (error.code === 'same_password') {
          return { success: false, error: 'A nova senha precisa ser diferente da atual.' };
        }
        return { success: false, error: 'Não foi possível redefinir sua senha agora. Tente novamente.' };
      }

      const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' });
      const signOutFailed = Boolean(signOutError) && signOutError.code !== 'session_not_found';

      // Independente do resultado do signOut, o app nunca deve seguir
      // tratando esta sessão de recovery como válida daqui pra frente.
      setUser(null);
      setIsAuthenticated(false);
      setIsPasswordRecovery(false);

      if (signOutFailed) {
        return {
          success: true,
          warning:
            'Sua senha foi alterada. Por segurança, feche este navegador ou saia manualmente antes de continuar.',
        };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Não foi possível redefinir sua senha agora. Tente novamente.' };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    isPasswordRecovery,
    login,
    register,
    logout,
    forgotPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
