import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; requires2FA?: boolean; userId?: string; requiresVerification?: boolean }>;
  register: (email: string, password: string, fullName: string, phone: string) => Promise<{ success: boolean; message: string; requiresVerification?: boolean }>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
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
    // Initialize admin user if not exists
    initializeAdminUser();
    
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

  const initializeAdminUser = () => {
    const users = JSON.parse(localStorage.getItem('freddyUsers') || '[]');
    const adminExists = users.some((u: User) => u.email === 'admin@fxgold.shop');
    
    if (!adminExists) {
      const adminUser: User = {
        id: 'admin-fxgold-2024',
        email: 'admin@fxgold.shop',
        full_name: 'FxGold Administrator',
        phone: '',
        role: 'admin',
        is_verified: true,
        balance: 0,
        usdtBalance: 0,
        marginBalance: 0,
        assets: [],
        transactions: [],
        positions: [],
        username: 'fxgoldadmin',
        twoFactorEnabled: false
      };
      
      users.push(adminUser);
      localStorage.setItem('freddyUsers', JSON.stringify(users));
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Use backend API for login
      const result = await authService.login(email, password);
      
      if (result.success && result.token && result.user) {
        localStorage.setItem('token', result.token);
        setUser(result.user);
        
        // Also update localStorage for compatibility
        const users = JSON.parse(localStorage.getItem('freddyUsers') || '[]');
        const updatedUsers = users.map((u: User) => 
          u.email === email ? { ...u, ...result.user } : u
        );
        localStorage.setItem('freddyUsers', JSON.stringify(updatedUsers));
      }
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  };

  const register = async (email: string, password: string, fullName: string, phone: string) => {
    try {
      // 🚀 USE BACKEND API INSTEAD OF LOCALSTORAGE
      const result = await authService.register(email, password, fullName, fullName);
      
      if (result.success) {
        // Also save to localStorage for compatibility
        const users = JSON.parse(localStorage.getItem('freddyUsers') || '[]');
        
        const newUser: User = {
          id: result.userId || uuidv4(),
          email,
          full_name: fullName,
          phone,
          role: 'user',
          is_verified: false,
          balance: 1000,
          usdtBalance: 0,
          marginBalance: 0,
          assets: [],
          transactions: [],
          positions: [],
          username: fullName.toLowerCase().replace(/\s+/g, ''),
          twoFactorEnabled: false
        };
        
        users.push(newUser);
        localStorage.setItem('freddyUsers', JSON.stringify(users));
      }
      
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    const users = JSON.parse(localStorage.getItem('freddyUsers') || '[]');
    const updatedUsers = users.map((u: User) => u.id === updatedUser.id ? updatedUser : u);
    localStorage.setItem('freddyUsers', JSON.stringify(updatedUsers));
  };

  const getCurrentUser = (token: string): User | null => {
    try {
      const userId = token.replace('demo-token-', '');
      const users = JSON.parse(localStorage.getItem('freddyUsers') || '[]');
      const user = users.find((u: User) => u.id === userId);
      
      if (user) {
        return {
          ...user,
          balance: user.balance ?? 1000,
          usdtBalance: user.usdtBalance ?? 0,
          marginBalance: user.marginBalance ?? 0,
          assets: user.assets ?? [],
          transactions: user.transactions ?? [],
          positions: user.positions ?? [],
          username: user.username ?? user.full_name?.toLowerCase().replace(/\s+/g, ''),
          twoFactorEnabled: user.twoFactorEnabled ?? false,
          is_verified: user.is_verified ?? false
        };
      }
      
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      loading,
      login, 
      register, 
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};