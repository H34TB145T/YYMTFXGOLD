import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase, getUserProfile, getUserAssets, getUserTransactions, getUserPositions } from '../lib/supabase';
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
    // Check if user is authenticated with Supabase
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          
          if (authUser) {
            // Get user profile data
            const profile = await getUserProfile(authUser.id);
            
            if (profile) {
              // Get user assets, transactions, and positions
              const assets = await getUserAssets(authUser.id);
              const transactions = await getUserTransactions(authUser.id);
              const positions = await getUserPositions(authUser.id);
              
              // Create complete user object
              const completeUser: User = {
                id: profile.id,
                email: profile.email,
                full_name: profile.full_name,
                phone: profile.phone || '',
                role: profile.role,
                is_verified: profile.is_verified,
                balance: profile.balance,
                usdtBalance: profile.usdt_balance,
                marginBalance: profile.margin_balance,
                assets: assets.map(asset => ({
                  coinId: asset.coin_id,
                  symbol: asset.symbol,
                  name: asset.name,
                  amount: asset.amount,
                  purchasePrice: asset.purchase_price
                })),
                transactions: transactions.map(tx => ({
                  id: tx.id,
                  coinId: tx.coin_id,
                  coinName: tx.coin_name,
                  coinSymbol: tx.coin_symbol,
                  amount: tx.amount,
                  price: tx.price,
                  total: tx.total,
                  type: tx.type as any,
                  status: tx.status,
                  walletAddress: tx.wallet_address || undefined,
                  timestamp: new Date(tx.timestamp).getTime()
                })),
                positions: positions.map(pos => ({
                  id: pos.id,
                  coinId: pos.coin_id,
                  coinName: pos.coin_name,
                  coinSymbol: pos.coin_symbol,
                  type: pos.type as 'long' | 'short',
                  leverage: pos.leverage,
                  size: pos.size,
                  entryPrice: pos.entry_price,
                  liquidationPrice: pos.liquidation_price,
                  margin: pos.margin,
                  pnl: pos.pnl,
                  isOpen: pos.is_open,
                  timestamp: new Date(pos.timestamp).getTime()
                })),
                username: profile.username,
                twoFactorEnabled: profile.two_factor_enabled,
                wallet_address: profile.wallet_address
              };
              
              setUser(completeUser);
            }
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // User signed in, update user state
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          // Get user profile data
          const profile = await getUserProfile(authUser.id);
          
          if (profile) {
            // Get user assets, transactions, and positions
            const assets = await getUserAssets(authUser.id);
            const transactions = await getUserTransactions(authUser.id);
            const positions = await getUserPositions(authUser.id);
            
            // Create complete user object
            const completeUser: User = {
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name,
              phone: profile.phone || '',
              role: profile.role,
              is_verified: profile.is_verified,
              balance: profile.balance,
              usdtBalance: profile.usdt_balance,
              marginBalance: profile.margin_balance,
              assets: assets.map(asset => ({
                coinId: asset.coin_id,
                symbol: asset.symbol,
                name: asset.name,
                amount: asset.amount,
                purchasePrice: asset.purchase_price
              })),
              transactions: transactions.map(tx => ({
                id: tx.id,
                coinId: tx.coin_id,
                coinName: tx.coin_name,
                coinSymbol: tx.coin_symbol,
                amount: tx.amount,
                price: tx.price,
                total: tx.total,
                type: tx.type as any,
                status: tx.status,
                walletAddress: tx.wallet_address || undefined,
                timestamp: new Date(tx.timestamp).getTime()
              })),
              positions: positions.map(pos => ({
                id: pos.id,
                coinId: pos.coin_id,
                coinName: pos.coin_name,
                coinSymbol: pos.coin_symbol,
                type: pos.type as 'long' | 'short',
                leverage: pos.leverage,
                size: pos.size,
                entryPrice: pos.entry_price,
                liquidationPrice: pos.liquidation_price,
                margin: pos.margin,
                pnl: pos.pnl,
                isOpen: pos.is_open,
                timestamp: new Date(pos.timestamp).getTime()
              })),
              username: profile.username,
              twoFactorEnabled: profile.two_factor_enabled,
              wallet_address: profile.wallet_address
            };
            
            setUser(completeUser);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        // User signed out, clear user state
        setUser(null);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      // First check if user exists in the database
      const { data: userExists } = await supabase
        .from('users')
        .select('id, is_verified, two_factor_enabled')
        .eq('email', email)
        .single();
      
      if (!userExists) {
        return { success: false, message: 'Invalid email or password' };
      }
      
      // Check if user is verified
      if (!userExists.is_verified) {
        return { 
          success: false, 
          message: 'Please verify your email first', 
          requiresVerification: true 
        };
      }
      
      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        return { success: false, message: error.message };
      }
      
      // Check if 2FA is enabled
      if (userExists.two_factor_enabled) {
        // Generate and send 2FA code
        const { data: otpData, error: otpError } = await supabase
          .from('otp_codes')
          .insert({
            email,
            otp: Math.floor(100000 + Math.random() * 900000).toString(),
            type: '2fa',
            expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
          })
          .select()
          .single();
        
        if (otpError) {
          return { success: false, message: 'Failed to generate 2FA code' };
        }
        
        // In a real app, you would send this code via email
        console.log('2FA code:', otpData.otp);
        
        return {
          success: true,
          requires2FA: true,
          message: '2FA code sent to your email',
          userId: userExists.id
        };
      }
      
      // Get user profile data
      const profile = await getUserProfile(data.user!.id);
      
      if (!profile) {
        return { success: false, message: 'Failed to load user profile' };
      }
      
      // Get user assets, transactions, and positions
      const assets = await getUserAssets(data.user!.id);
      const transactions = await getUserTransactions(data.user!.id);
      const positions = await getUserPositions(data.user!.id);
      
      // Create complete user object
      const completeUser: User = {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone || '',
        role: profile.role,
        is_verified: profile.is_verified,
        balance: profile.balance,
        usdtBalance: profile.usdt_balance,
        marginBalance: profile.margin_balance,
        assets: assets.map(asset => ({
          coinId: asset.coin_id,
          symbol: asset.symbol,
          name: asset.name,
          amount: asset.amount,
          purchasePrice: asset.purchase_price
        })),
        transactions: transactions.map(tx => ({
          id: tx.id,
          coinId: tx.coin_id,
          coinName: tx.coin_name,
          coinSymbol: tx.coin_symbol,
          amount: tx.amount,
          price: tx.price,
          total: tx.total,
          type: tx.type as any,
          status: tx.status,
          walletAddress: tx.wallet_address || undefined,
          timestamp: new Date(tx.timestamp).getTime()
        })),
        positions: positions.map(pos => ({
          id: pos.id,
          coinId: pos.coin_id,
          coinName: pos.coin_name,
          coinSymbol: pos.coin_symbol,
          type: pos.type as 'long' | 'short',
          leverage: pos.leverage,
          size: pos.size,
          entryPrice: pos.entry_price,
          liquidationPrice: pos.liquidation_price,
          margin: pos.margin,
          pnl: pos.pnl,
          isOpen: pos.is_open,
          timestamp: new Date(pos.timestamp).getTime()
        })),
        username: profile.username,
        twoFactorEnabled: profile.two_factor_enabled,
        wallet_address: profile.wallet_address
      };
      
      setUser(completeUser);
      
      return { 
        success: true, 
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const register = async (email: string, password: string, username: string, fullName: string) => {
    try {
      // Check if email or username already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .or(`email.eq.${email},username.eq.${username}`)
        .single();
      
      if (existingUser) {
        return { success: false, message: 'Email or username already exists' };
      }
      
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) {
        return { success: false, message: error.message };
      }
      
      if (!data.user) {
        return { success: false, message: 'Registration failed' };
      }
      
      // Create user profile in the database
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email,
          username,
          password: 'hashed_in_backend', // In a real app, password would be hashed in the backend
          full_name: fullName,
          role: 'user',
          is_verified: false,
          balance: 0,
          usdt_balance: 0,
          margin_balance: 0
        });
      
      if (insertError) {
        return { success: false, message: insertError.message };
      }
      
      // Generate and store OTP for email verification
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      const { error: otpError } = await supabase
        .from('otp_codes')
        .insert({
          email,
          otp,
          type: 'verification',
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
        });
      
      if (otpError) {
        return { success: false, message: 'Failed to generate verification code' };
      }
      
      // In a real app, you would send this code via email
      console.log('Verification OTP:', otp);
      
      return { 
        success: true, 
        message: 'Registration successful! Please check your email for verification code.',
        requiresVerification: true
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      // Update user profile in the database
      const { error } = await supabase
        .from('users')
        .update({
          username: updatedUser.username,
          full_name: updatedUser.full_name,
          phone: updatedUser.phone,
          balance: updatedUser.balance,
          usdt_balance: updatedUser.usdtBalance,
          margin_balance: updatedUser.marginBalance,
          wallet_address: updatedUser.wallet_address,
          two_factor_enabled: updatedUser.twoFactorEnabled
        })
        .eq('id', updatedUser.id);
      
      if (error) {
        console.error('Error updating user:', error);
        return;
      }
      
      setUser(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
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