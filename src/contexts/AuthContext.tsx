import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { login as authLogin, register as authRegister, getCurrentUser } from '../services/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (email: string, password: string, fullName: string, phone: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const currentUser = getCurrentUser(token);
      if (currentUser) {
        setUser(currentUser);
      } else {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authLogin(email, password, '127.0.0.1');
    if (result.success && result.token) {
      localStorage.setItem('token', result.token);
      const currentUser = getCurrentUser(result.token);
      if (currentUser) {
        setUser(currentUser);
      }
    }
    return result;
  };

  const register = async (email: string, password: string, fullName: string, phone: string) => {
    const result = await authRegister(email, password, fullName, phone);
    if (result.success && result.token) {
      localStorage.setItem('token', result.token);
      const currentUser = getCurrentUser(result.token);
      if (currentUser) {
        setUser(currentUser);
      }
    }
    return result;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      loading,
      login, 
      register, 
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};