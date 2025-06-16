import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { emailService } from '../services/emailService';
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
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem('freddyUsers') || '[]');
      const user = users.find((u: User) => u.email === email);
      
      if (!user) {
        return { success: false, message: 'Invalid email or password' };
      }

      // Check if user is verified
      if (!user.is_verified) {
        return { 
          success: false, 
          message: 'Please verify your email first. Check your inbox for the verification code.',
          requiresVerification: true
        };
      }

      // For demo purposes, any password works for existing users
      // In production, you would verify the password hash
      
      // Check if 2FA is enabled
      if (user.twoFactorEnabled) {
        // Send 2FA code
        const result = await emailService.send2FAEmail(email, user.username || user.full_name);
        if (result.success) {
          return { 
            success: true, 
            message: '2FA code sent to your email',
            requires2FA: true,
            userId: user.id
          };
        } else {
          return { success: false, message: 'Failed to send 2FA code' };
        }
      }

      // Regular login without 2FA
      const token = `demo-token-${user.id}`;
      localStorage.setItem('token', token);
      setUser(user);
      
      return { 
        success: true, 
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  };

  const register = async (email: string, password: string, fullName: string, phone: string) => {
    try {
      // Get existing users
      const users = JSON.parse(localStorage.getItem('freddyUsers') || '[]');
      
      // Check if user already exists
      if (users.some((u: User) => u.email === email)) {
        return { success: false, message: 'Email already registered' };
      }

      // Create new user
      const newUser: User = {
        id: uuidv4(),
        email,
        full_name: fullName,
        phone,
        role: 'user',
        is_verified: false, // Require email verification
        balance: 1000, // Starting balance for demo
        usdtBalance: 0,
        marginBalance: 0,
        assets: [],
        transactions: [],
        positions: [],
        username: fullName.toLowerCase().replace(/\s+/g, ''),
        twoFactorEnabled: false
      };
      
      // Save user to localStorage
      users.push(newUser);
      localStorage.setItem('freddyUsers', JSON.stringify(users));

      // Send verification email
      const emailResult = await emailService.sendVerificationEmail(email, newUser.username || newUser.full_name);
      
      if (emailResult.success) {
        return { 
          success: true, 
          message: 'Registration successful! Please check your email for verification code.',
          requiresVerification: true
        };
      } else {
        return { 
          success: true, 
          message: 'Registration successful but failed to send verification email. Please contact support.',
          requiresVerification: true
        };
      }
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