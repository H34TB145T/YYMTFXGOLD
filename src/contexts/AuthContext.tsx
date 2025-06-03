import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => boolean;
  register: (username: string, email: string, password: string) => boolean;
  logout: () => void;
  updateUser: (user: User) => void;
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
    const storedUser = localStorage.getItem('freddyUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('freddyUser', JSON.stringify(user));
    }
  }, [user]);

  const login = (email: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem('freddyUsers') || '[]');
    const foundUser = users.find((u: any) => u.email === email);
    
    if (foundUser && password === 'password') {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const register = (username: string, email: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem('freddyUsers') || '[]');
    
    if (users.some((u: any) => u.email === email)) {
      return false;
    }
    
    const newUser: User = {
      id: uuidv4(),
      username,
      email,
      balance: 1000,
      marginBalance: 1000,
      assets: [],
      positions: [],
      transactions: []
    };
    
    users.push(newUser);
    localStorage.setItem('freddyUsers', JSON.stringify(users));
    
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('freddyUser');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    
    const users = JSON.parse(localStorage.getItem('freddyUsers') || '[]');
    const updatedUsers = users.map((u: User) => 
      u.id === updatedUser.id ? updatedUser : u
    );
    localStorage.setItem('freddyUsers', JSON.stringify(updatedUsers));
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