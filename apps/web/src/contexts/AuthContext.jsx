import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext(null);

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
        const message = error.message?.toLowerCase() ?? '';
        if (message.includes('email not confirmed')) {
          return { success: false, error: 'Confirme seu e-mail antes de entrar.' };
        }
        return { success: false, error: 'E-mail ou senha inválidos.' };
      }

      const normalized = normalizeUser(data.user);
      setUser(normalized);
      setIsAuthenticated(true);

      return { success: true, user: normalized };
    } catch (error) {
      return { success: false, error: 'Erro ao fazer login.' };
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
        const message = error.message?.toLowerCase() ?? '';
        if (message.includes('already') || message.includes('registered') || message.includes('exists')) {
          return { success: false, error: 'E-mail já cadastrado.' };
        }
        return { success: false, error: 'Erro ao criar conta.' };
      }

      // Supabase não retorna erro explícito para e-mail já cadastrado e
      // confirmado (evita enumeração de contas) — nesse caso, `identities`
      // vem como array vazio.
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return { success: false, error: 'E-mail já cadastrado.' };
      }

      if (!data.session) {
        return { success: true, requiresEmailConfirmation: true };
      }

      const normalized = normalizeUser(data.user);
      setUser(normalized);
      setIsAuthenticated(true);

      return { success: true, user: normalized };
    } catch (error) {
      return { success: false, error: 'Erro ao criar conta.' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
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
