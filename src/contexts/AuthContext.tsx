import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message: string; requires2FA?: boolean; userId?: string; requiresVerification?: boolean }>;
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

// Token expiration times
const TOKEN_EXPIRY = {
  DEFAULT: 24 * 60 * 60 * 1000, // 24 hours
  REMEMBER_ME: 30 * 24 * 60 * 60 * 1000 // 30 days
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize admin user if not exists
    initializeAdminUser();
    
    // Try to restore user session
    restoreUserSession();
  }, []);

  const restoreUserSession = () => {
    try {
      // Check for token in localStorage
      const token = localStorage.getItem('token');
      // Check for token in sessionStorage (for session-only login)
      const sessionToken = sessionStorage.getItem('token');
      
      // Use token from localStorage or sessionStorage
      const activeToken = token || sessionToken;
      
      if (activeToken) {
        // Check token expiration
        const tokenData = JSON.parse(atob(activeToken.split('.')[1]));
        const expirationTime = tokenData.exp * 1000; // Convert to milliseconds
        
        if (Date.now() < expirationTime) {
          // Token is still valid
          const currentUser = getCurrentUser(activeToken);
          if (currentUser) {
            setUser(currentUser);
          } else {
            // User not found, clear tokens
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
          }
        } else {
          // Token expired, clear it
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error('Error restoring session:', error);
      // Clear potentially corrupted tokens
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const initializeAdminUser = () => {
    const users = JSON.parse(localStorage.getItem('fxgoldUsers') || '[]');
    const adminExists = users.some((u: User) => u.email === 'admin@fxgold.shop');
    
    if (!adminExists) {
      const adminUser: User = {
        id: 'admin-fxgold-2024',
        email: 'admin@fxgold.shop',
        full_name: 'FxGold Administrator',
        phone: '',
        role: 'admin',
        is_verified: true,
        balance: 0, // No default balance for admin
        usdtBalance: 0,
        marginBalance: 0,
        assets: [],
        transactions: [],
        positions: [],
        username: 'fxgoldadmin',
        twoFactorEnabled: false
      };
      
      users.push(adminUser);
      localStorage.setItem('fxgoldUsers', JSON.stringify(users));
    }
  };

  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      // Use backend API for login
      const result = await authService.login(email, password);
      
      if (result.success && result.token && result.user) {
        // Store token based on remember me preference
        if (rememberMe) {
          // Create a token with longer expiration
          const tokenPayload = {
            userId: result.user.id,
            exp: Math.floor(Date.now() / 1000) + (TOKEN_EXPIRY.REMEMBER_ME / 1000)
          };
          const longToken = btoa(JSON.stringify(tokenPayload));
          localStorage.setItem('token', longToken);
        } else {
          // Store in sessionStorage for session-only login
          sessionStorage.setItem('token', result.token);
        }
        
        // Ensure user has all required properties with defaults
        const completeUser: User = {
          ...result.user,
          assets: result.user.assets || [],
          transactions: result.user.transactions || [],
          positions: result.user.positions || [],
          balance: result.user.balance || 0, // No default balance
          usdtBalance: result.user.usdtBalance || 0,
          marginBalance: result.user.marginBalance || 0,
          username: result.user.username || result.user.full_name?.toLowerCase().replace(/\s+/g, ''),
          twoFactorEnabled: result.user.twoFactorEnabled || false
        };
        
        setUser(completeUser);
        
        // Also update localStorage for compatibility
        const users = JSON.parse(localStorage.getItem('fxgoldUsers') || '[]');
        const updatedUsers = users.map((u: User) => 
          u.email === email ? { ...u, ...completeUser } : u
        );
        
        // If user doesn't exist in localStorage, add them
        if (!users.some((u: User) => u.email === email)) {
          updatedUsers.push(completeUser);
        }
        
        localStorage.setItem('fxgoldUsers', JSON.stringify(updatedUsers));
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
        const users = JSON.parse(localStorage.getItem('fxgoldUsers') || '[]');
        
        const newUser: User = {
          id: result.userId || uuidv4(),
          email,
          full_name: fullName,
          phone,
          role: 'user',
          is_verified: false,
          balance: 0, // NO default balance for new users
          usdtBalance: 0,
          marginBalance: 0,
          assets: [],
          transactions: [],
          positions: [],
          username: fullName.toLowerCase().replace(/\s+/g, ''),
          twoFactorEnabled: false
        };
        
        users.push(newUser);
        localStorage.setItem('fxgoldUsers', JSON.stringify(users));
      }
      
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed' };
    }
  };

  const logout = () => {
    // Clear both localStorage and sessionStorage tokens
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    // Ensure updated user has all required properties
    const completeUpdatedUser: User = {
      ...updatedUser,
      assets: updatedUser.assets || [],
      transactions: updatedUser.transactions || [],
      positions: updatedUser.positions || [],
      balance: updatedUser.balance || 0, // No default balance
      usdtBalance: updatedUser.usdtBalance || 0,
      marginBalance: updatedUser.marginBalance || 0,
      username: updatedUser.username || updatedUser.full_name?.toLowerCase().replace(/\s+/g, ''),
      twoFactorEnabled: updatedUser.twoFactorEnabled || false
    };
    
    setUser(completeUpdatedUser);
    
    const users = JSON.parse(localStorage.getItem('fxgoldUsers') || '[]');
    const updatedUsers = users.map((u: User) => u.id === completeUpdatedUser.id ? completeUpdatedUser : u);
    localStorage.setItem('fxgoldUsers', JSON.stringify(updatedUsers));
  };

  const getCurrentUser = (token: string): User | null => {
    try {
      // Parse the token to get user ID
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenData.userId;
      
      const users = JSON.parse(localStorage.getItem('fxgoldUsers') || '[]');
      const user = users.find((u: User) => u.id === userId);
      
      if (user) {
        // Ensure user has all required properties with defaults
        return {
          ...user,
          balance: user.balance ?? 0, // No default balance
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