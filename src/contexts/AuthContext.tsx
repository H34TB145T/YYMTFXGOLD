import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { login as authLogin, register as authRegister } from '../services/auth';

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
      // Verify token and set user
      // This would typically involve a backend call
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authLogin(email, password, '127.0.0.1');
    if (result.success && result.token) {
      localStorage.setItem('token', result.token);
      // Set user from token
      setUser({
        id: 'user-id',
        email,
        full_name: 'User Name',
        role: 'user',
        is_verified: true,
        phone: ''
      });
    }
    return result;
  };

  const register = async (email: string, password: string, fullName: string, phone: string) => {
    return await authRegister(email, password, fullName, phone);
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