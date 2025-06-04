import { User } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
}

export const login = async (
  email: string,
  password: string,
  _ipAddress: string
): Promise<AuthResponse> => {
  try {
    const users = JSON.parse(localStorage.getItem('freddyUsers') || '[]');
    const user = users.find((u: User) => u.email === email);
    
    if (user) {
      // For demo purposes, any password works
      return { 
        success: true, 
        message: 'Login successful',
        token: `demo-token-${user.id}`
      };
    }
    
    return { success: false, message: 'Invalid email or password' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Login failed' };
  }
};

export const register = async (
  email: string,
  password: string,
  fullName: string,
  phone: string
): Promise<AuthResponse> => {
  try {
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
      balance: 0,
      usdtBalance: 0,
      marginBalance: 0,
      assets: [],
      transactions: [],
      positions: []
    };
    
    users.push(newUser);
    localStorage.setItem('freddyUsers', JSON.stringify(users));
    
    return { 
      success: true, 
      message: 'Registration successful',
      token: `demo-token-${newUser.id}`
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Registration failed' };
  }
};

export const getCurrentUser = (token: string): User | null => {
  try {
    const userId = token.replace('demo-token-', '');
    const users = JSON.parse(localStorage.getItem('freddyUsers') || '[]');
    const user = users.find((u: User) => u.id === userId);
    
    if (user) {
      // Ensure all required properties exist with default values
      return {
        ...user,
        balance: user.balance ?? 0,
        usdtBalance: user.usdtBalance ?? 0,
        marginBalance: user.marginBalance ?? 0,
        assets: user.assets ?? [],
        transactions: user.transactions ?? [],
        positions: user.positions ?? []
      };
    }
    
    return null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};