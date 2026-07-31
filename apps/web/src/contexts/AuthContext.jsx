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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(normalizeUser(session?.user));
      setIsAuthenticated(Boolean(session?.user));
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

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
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
