import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session on mount
    const storedUser = localStorage.getItem('nortis_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error loading user session:', error);
        localStorage.removeItem('nortis_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Simulate API call - ready for backend integration
      const storedUsers = JSON.parse(localStorage.getItem('nortis_users') || '[]');
      const user = storedUsers.find(u => u.email === email && u.password === password);
      
      if (!user) {
        return { success: false, error: 'E-mail ou senha incorretos' };
      }

      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      };

      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('nortis_user', JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: 'Erro ao fazer login' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const storedUsers = JSON.parse(localStorage.getItem('nortis_users') || '[]');
      
      // Check if user already exists
      if (storedUsers.some(u => u.email === email)) {
        return { success: false, error: 'E-mail já cadastrado' };
      }

      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password, // In production, this would be hashed on backend
        createdAt: new Date().toISOString()
      };

      storedUsers.push(newUser);
      localStorage.setItem('nortis_users', JSON.stringify(storedUsers));

      const userData = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt
      };

      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('nortis_user', JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: 'Erro ao criar conta' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('nortis_user');
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout
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