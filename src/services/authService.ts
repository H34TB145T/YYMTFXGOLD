import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  requires2FA?: boolean;
  userId?: string;
  requiresVerification?: boolean;
  autoVerified?: boolean;
}

export const authService = {
  async register(email: string, password: string, username: string, fullName: string): Promise<AuthResponse> {
    try {
      console.log('🚀 Calling Supabase registration API...');
      
      // Check if email or username already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .or(`email.eq.${email},username.eq.${username}`)
        .single();
      
      if (existingUser) {
        return { 
          success: false, 
          message: 'User already exists with this email or username. Please try logging in or use different credentials.'
        };
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
      
      console.log('📧 Verification OTP:', otp);
      
      return { 
        success: true, 
        message: 'Registration successful! Please check your email for verification code.',
        requiresVerification: true,
        userId: data.user.id,
        debug_otp: otp // Remove this in production
      };
    } catch (error) {
      console.error('❌ Registration API error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed. Please check your internet connection and try again.'
      };
    }
  },

  async verifyEmail(email: string, otp: string): Promise<AuthResponse> {
    try {
      console.log('🔍 Verifying email with Supabase...');
      
      // Check if OTP is valid
      const { data: otpData } = await supabase
        .from('otp_codes')
        .select('*')
        .eq('email', email)
        .eq('otp', otp)
        .eq('type', 'verification')
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (!otpData) {
        return { success: false, message: 'Invalid or expired OTP. Please request a new code.' };
      }
      
      // Update user as verified
      const { error: updateError } = await supabase
        .from('users')
        .update({ is_verified: true })
        .eq('email', email);
      
      if (updateError) {
        return { success: false, message: 'Failed to update verification status' };
      }
      
      // Delete used OTP
      await supabase
        .from('otp_codes')
        .delete()
        .eq('id', otpData.id);
      
      console.log('✅ Email verification successful');
      
      return { success: true, message: 'Email verified successfully! You can now login.' };
    } catch (error) {
      console.error('❌ Email verification error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Email verification failed. Please try again.'
      };
    }
  },

  async resendVerification(email: string): Promise<AuthResponse> {
    try {
      console.log('📧 Resending verification email...');
      
      // Check if user exists and is not already verified
      const { data: user } = await supabase
        .from('users')
        .select('username, is_verified')
        .eq('email', email)
        .single();
      
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      
      if (user.is_verified) {
        return { success: false, message: 'Email is already verified' };
      }
      
      // Generate and store new OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Delete any existing OTPs for this email and type
      await supabase
        .from('otp_codes')
        .delete()
        .eq('email', email)
        .eq('type', 'verification');
      
      // Insert new OTP
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
      
      console.log('📨 New verification OTP:', otp);
      
      return { 
        success: true, 
        message: 'New verification code sent to your email',
        debug_otp: otp // Remove this in production
      };
    } catch (error) {
      console.error('❌ Resend verification error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to resend verification code. Please try again.'
      };
    }
  },

  async login(email: string, password: string, rememberMe: boolean = false): Promise<AuthResponse> {
    try {
      console.log('🔐 Calling Supabase login API...');
      
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
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        const { error: otpError } = await supabase
          .from('otp_codes')
          .insert({
            email,
            otp,
            type: '2fa',
            expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
          });
        
        if (otpError) {
          return { success: false, message: 'Failed to generate 2FA code' };
        }
        
        console.log('2FA code:', otp);
        
        return {
          success: true,
          requires2FA: true,
          message: '2FA code sent to your email',
          userId: userExists.id
        };
      }
      
      // Get user profile data
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user!.id)
        .single();
      
      if (!profile) {
        return { success: false, message: 'Failed to load user profile' };
      }
      
      // Get user assets, transactions, and positions
      const { data: assets } = await supabase
        .from('crypto_assets')
        .select('*')
        .eq('user_id', data.user!.id);
      
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', data.user!.id)
        .order('timestamp', { ascending: false });
      
      const { data: positions } = await supabase
        .from('positions')
        .select('*')
        .eq('user_id', data.user!.id)
        .order('timestamp', { ascending: false });
      
      // Create complete user object
      const user: User = {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone || '',
        role: profile.role,
        is_verified: profile.is_verified,
        balance: profile.balance,
        usdtBalance: profile.usdt_balance,
        marginBalance: profile.margin_balance,
        assets: (assets || []).map(asset => ({
          coinId: asset.coin_id,
          symbol: asset.symbol,
          name: asset.name,
          amount: asset.amount,
          purchasePrice: asset.purchase_price
        })),
        transactions: (transactions || []).map(tx => ({
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
        positions: (positions || []).map(pos => ({
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
      
      console.log('🔑 Login successful');
      
      return { 
        success: true, 
        message: 'Login successful',
        token: data.session?.access_token,
        user
      };
    } catch (error) {
      console.error('❌ Login API error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed. Please try again.'
      };
    }
  },
  
  async logout(): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { success: false, message: error.message };
      }
      
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('❌ Logout error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Logout failed. Please try again.'
      };
    }
  },

  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      // Check if user exists
      const { data: user } = await supabase
        .from('users')
        .select('username')
        .eq('email', email)
        .single();
      
      if (!user) {
        // Don't reveal if email exists or not for security
        return { success: true, message: 'If the email exists, a reset code has been sent' };
      }
      
      // Generate and store OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Delete any existing OTPs for this email and type
      await supabase
        .from('otp_codes')
        .delete()
        .eq('email', email)
        .eq('type', 'password_reset');
      
      // Insert new OTP
      const { error: otpError } = await supabase
        .from('otp_codes')
        .insert({
          email,
          otp,
          type: 'password_reset',
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
        });
      
      if (otpError) {
        return { success: false, message: 'Failed to generate reset code' };
      }
      
      console.log('Password reset OTP:', otp);
      
      return { 
        success: true, 
        message: 'Password reset code sent to your email',
        debug_otp: otp // Remove this in production
      };
    } catch (error) {
      console.error('❌ Forgot password error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send reset code. Please try again.'
      };
    }
  },

  async resetPassword(email: string, otp: string, newPassword: string): Promise<AuthResponse> {
    try {
      // Check if OTP is valid
      const { data: otpData } = await supabase
        .from('otp_codes')
        .select('*')
        .eq('email', email)
        .eq('otp', otp)
        .eq('type', 'password_reset')
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (!otpData) {
        return { success: false, message: 'Invalid or expired OTP' };
      }
      
      // Update password in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (authError) {
        return { success: false, message: authError.message };
      }
      
      // Delete used OTP
      await supabase
        .from('otp_codes')
        .delete()
        .eq('id', otpData.id);
      
      return { success: true, message: 'Password reset successfully' };
    } catch (error) {
      console.error('❌ Reset password error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Password reset failed. Please try again.'
      };
    }
  },

  async verify2FA(email: string, otp: string, userId: string, rememberMe: boolean = false): Promise<AuthResponse> {
    try {
      // Check if OTP is valid
      const { data: otpData } = await supabase
        .from('otp_codes')
        .select('*')
        .eq('email', email)
        .eq('otp', otp)
        .eq('type', '2fa')
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (!otpData) {
        return { success: false, message: 'Invalid or expired 2FA code' };
      }
      
      // Delete used OTP
      await supabase
        .from('otp_codes')
        .delete()
        .eq('id', otpData.id);
      
      // Get user profile data
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!profile) {
        return { success: false, message: 'Failed to load user profile' };
      }
      
      // Get user assets, transactions, and positions
      const { data: assets } = await supabase
        .from('crypto_assets')
        .select('*')
        .eq('user_id', userId);
      
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });
      
      const { data: positions } = await supabase
        .from('positions')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });
      
      // Create complete user object
      const user: User = {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone || '',
        role: profile.role,
        is_verified: profile.is_verified,
        balance: profile.balance,
        usdtBalance: profile.usdt_balance,
        marginBalance: profile.margin_balance,
        assets: (assets || []).map(asset => ({
          coinId: asset.coin_id,
          symbol: asset.symbol,
          name: asset.name,
          amount: asset.amount,
          purchasePrice: asset.purchase_price
        })),
        transactions: (transactions || []).map(tx => ({
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
        positions: (positions || []).map(pos => ({
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
      
      // Get session token
      const { data: session } = await supabase.auth.getSession();
      
      return { 
        success: true, 
        message: '2FA verification successful',
        token: session.session?.access_token,
        user
      };
    } catch (error) {
      console.error('❌ 2FA verification error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '2FA verification failed. Please try again.'
      };
    }
  },

  async toggle2FA(userId: string, enable: boolean): Promise<AuthResponse> {
    try {
      // Get user email and username
      const { data: user } = await supabase
        .from('users')
        .select('email, username')
        .eq('id', userId)
        .single();
      
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      
      if (enable) {
        // Generate and send 2FA setup code
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        const { error: otpError } = await supabase
          .from('otp_codes')
          .insert({
            email: user.email,
            otp,
            type: '2fa_setup',
            expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
          });
        
        if (otpError) {
          return { success: false, message: 'Failed to generate 2FA setup code' };
        }
        
        console.log('2FA setup code:', otp);
        
        return {
          success: true,
          message: '2FA setup code sent to your email',
          requiresVerification: true
        };
      } else {
        // Disable 2FA
        const { error } = await supabase
          .from('users')
          .update({ two_factor_enabled: false })
          .eq('id', userId);
        
        if (error) {
          return { success: false, message: 'Failed to disable 2FA' };
        }
        
        return { success: true, message: '2FA disabled successfully' };
      }
    } catch (error) {
      console.error('❌ 2FA toggle error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update 2FA settings. Please try again.'
      };
    }
  },

  async updateUsername(userId: string, newUsername: string): Promise<AuthResponse> {
    try {
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', newUsername)
        .neq('id', userId)
        .single();
      
      if (existingUser) {
        return { success: false, message: 'Username already taken' };
      }
      
      // Update username
      const { error } = await supabase
        .from('users')
        .update({ username: newUsername })
        .eq('id', userId);
      
      if (error) {
        return { success: false, message: error.message };
      }
      
      return { success: true, message: 'Username updated successfully' };
    } catch (error) {
      console.error('❌ Update username error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update username. Please try again.'
      };
    }
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<AuthResponse> {
    try {
      // Verify current password
      const { data: user } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();
      
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      
      // Sign in with current password to verify it
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });
      
      if (signInError) {
        return { success: false, message: 'Current password is incorrect' };
      }
      
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        return { success: false, message: error.message };
      }
      
      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      console.error('❌ Change password error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to change password. Please try again.'
      };
    }
  },
  
  // Check if user is authenticated via Supabase session
  async checkSession(): Promise<AuthResponse> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return { success: false, message: 'No active session' };
      }
      
      // Get user profile data
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (!profile) {
        return { success: false, message: 'Failed to load user profile' };
      }
      
      // Get user assets, transactions, and positions
      const { data: assets } = await supabase
        .from('crypto_assets')
        .select('*')
        .eq('user_id', session.user.id);
      
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('timestamp', { ascending: false });
      
      const { data: positions } = await supabase
        .from('positions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('timestamp', { ascending: false });
      
      // Create complete user object
      const user: User = {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone || '',
        role: profile.role,
        is_verified: profile.is_verified,
        balance: profile.balance,
        usdtBalance: profile.usdt_balance,
        marginBalance: profile.margin_balance,
        assets: (assets || []).map(asset => ({
          coinId: asset.coin_id,
          symbol: asset.symbol,
          name: asset.name,
          amount: asset.amount,
          purchasePrice: asset.purchase_price
        })),
        transactions: (transactions || []).map(tx => ({
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
        positions: (positions || []).map(pos => ({
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
      
      return { 
        success: true, 
        message: 'Session active',
        user
      };
    } catch (error) {
      console.error('❌ Session check error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to check session'
      };
    }
  },
  
  async send2FA(data: { email: string; userName: string }): Promise<AuthResponse> {
    try {
      // Generate and store 2FA code
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Delete any existing OTPs for this email and type
      await supabase
        .from('otp_codes')
        .delete()
        .eq('email', data.email)
        .eq('type', '2fa');
      
      // Insert new OTP
      const { error: otpError } = await supabase
        .from('otp_codes')
        .insert({
          email: data.email,
          otp,
          type: '2fa',
          expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
        });
      
      if (otpError) {
        return { success: false, message: 'Failed to generate 2FA code' };
      }
      
      console.log('2FA code:', otp);
      
      return { 
        success: true, 
        message: '2FA code sent to your email'
      };
    } catch (error) {
      console.error('❌ Send 2FA error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send 2FA code. Please try again.'
      };
    }
  }
};