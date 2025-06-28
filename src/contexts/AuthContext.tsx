import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message: string; requires2FA?: boolean; userId?: string; requiresVerification?: boolean }>;
  register: (email: string, password: string, username: string, fullName: string) => Promise<{ success: boolean; message: string; requiresVerification?: boolean }>;
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
    
    // Try to restore user session
    restoreUserSession();
  }, []);

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

  const restoreUserSession = () => {
    try {
      // Check for token in localStorage (short-term session)
      const token = localStorage.getItem('token');
      
      // Check for persistent token in sessionStorage (browser session)
      const sessionToken = sessionStorage.getItem('token');
      
      // Check for persistent token in localStorage (remember me)
      const persistentToken = localStorage.getItem('persistentToken');
      
      let currentUser = null;
      
      if (token) {
        // Regular session token
        currentUser = getCurrentUser(token);
      } else if (sessionToken) {
        // Browser session token
        currentUser = getCurrentUser(sessionToken);
        // Store in localStorage for current session
        if (currentUser) {
          localStorage.setItem('token', sessionToken);
        }
      } else if (persistentToken) {
        // Persistent login (remember me)
        currentUser = getCurrentUser(persistentToken);
        // Store in both storages
        if (currentUser) {
          localStorage.setItem('token', persistentToken);
          sessionStorage.setItem('token', persistentToken);
        }
      }
      
      if (currentUser) {
        console.log('✅ Session restored for user:', currentUser.email);
        setUser(currentUser);
      } else {
        // Clear any invalid tokens
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('persistentToken');
      }
    } catch (error) {
      console.error('Error restoring session:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      // Use backend API for login
      const result = await authService.login(email, password);
      
      if (result.success && result.token && result.user) {
        // Store token in localStorage (current session)
        localStorage.setItem('token', result.token);
        
        // Store token in sessionStorage (browser session)
        sessionStorage.setItem('token', result.token);
        
        // If remember me is checked, store persistent token
        if (rememberMe) {
          localStorage.setItem('persistentToken', result.token);
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

  const register = async (email: string, password: string, username: string, fullName: string) => {
    try {
      // Use backend API for registration
      const result = await authService.register(email, password, username, fullName);
      
      if (result.success) {
        // Also save to localStorage for compatibility
        const users = JSON.parse(localStorage.getItem('fxgoldUsers') || '[]');
        
        const newUser: User = {
          id: result.userId || uuidv4(),
          email,
          full_name: fullName,
          phone: '',
          role: 'user',
          is_verified: false,
          balance: 0, // NO default balance for new users
          usdtBalance: 0,
          marginBalance: 0,
          assets: [],
          transactions: [],
          positions: [],
          username: username,
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
    // Clear all tokens
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('persistentToken');
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
      // For API-based authentication, extract user ID from token
      // This is a simplified version - in production, you'd verify the token
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        try {
          // Try to parse as JWT
          const payload = JSON.parse(atob(tokenParts[1]));
          const userId = payload.userId;
          
          // Get user from localStorage
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
        } catch (e) {
          console.error('Error parsing token:', e);
        }
      }
      
      // Fallback to legacy token format
      const userId = token.replace('demo-token-', '');
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