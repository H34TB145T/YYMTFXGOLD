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
    try {
      // First try with the API service
      const result = await authService.login(email, password);
      
      if (result.success) {
        if (result.requires2FA) {
          return { 
            success: true, 
            message: result.message,
            requires2FA: true,
            userId: result.userId
          };
        }
        
        if (result.requiresVerification) {
          return {
            success: false,
            message: result.message,
            requiresVerification: true
          };
        }
        
        if (result.token && result.user) {
          localStorage.setItem('token', result.token);
          setUser(result.user);
          return { 
            success: true, 
            message: result.message
          };
        }
      }
      
      // Fallback to localStorage for demo
      const users = JSON.parse(localStorage.getItem('freddyUsers') || '[]');
      const user = users.find((u: User) => u.email === email);
      
      if (user) {
        // For demo purposes, any password works
        const token = `demo-token-${user.id}`;
        localStorage.setItem('token', token);
        setUser(user);
        return { 
          success: true, 
          message: 'Login successful'
        };
      }
      
      return { success: false, message: result.message || 'Invalid email or password' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  };

  const register = async (email: string, password: string, fullName: string, phone: string) => {
    try {
      // First try with the API service
      const result = await authService.register(email, password, fullName.toLowerCase().replace(/\s+/g, ''), fullName);
      
      if (result.success) {
        return { 
          success: true, 
          message: result.message,
          requiresVerification: result.requiresVerification && !result.autoVerified
        };
      }
      
      // Fallback to localStorage for demo
      const users = JSON.parse(localStorage.getItem('freddyUsers') || '[]');
      
      if (users.some((u: User) => u.email === email)) {
        return { success: false, message: 'Email already registered' };
      }
      
      const newUser: User = {
        id: uuidv4(),
        email,
        full_name: fullName,
        phone,
        role: 'user',
        is_verified: false,
        balance: 1000, // Starting balance for demo
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
      
      return { 
        success: true, 
        message: 'Registration successful',
        requiresVerification: true
      };
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
        // Ensure all required properties exist with default values
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