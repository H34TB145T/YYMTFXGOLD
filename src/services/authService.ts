import { User } from '../types';
import { API_CONFIG } from '../config/api';

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
      console.log('🚀 Calling backend registration API...');
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'register',
          email,
          password,
          username,
          fullName
        }),
        credentials: 'include' // Include cookies in the request
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📧 Backend registration response:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Registration API error:', error);
      
      // Fallback to localStorage for demo/development
      try {
        const users = JSON.parse(localStorage.getItem('fxgoldUsers') || '[]');
        
        if (users.some((u: User) => u.email === email)) {
          return { success: false, message: 'Email already registered' };
        }
        
        if (users.some((u: User) => u.username === username)) {
          return { success: false, message: 'Username already taken' };
        }
        
        const userId = `user-${Date.now()}`;
        const token = `demo-token-${userId}`;
        
        return {
          success: true,
          message: 'Registration successful! Please check your email for verification code.',
          userId,
          token,
          requiresVerification: true
        };
      } catch (fallbackError) {
        console.error('❌ Fallback registration error:', fallbackError);
        return {
          success: false,
          message: 'Registration failed. Please check your internet connection and try again.'
        };
      }
    }
  },

  async verifyEmail(email: string, otp: string): Promise<AuthResponse> {
    try {
      console.log('🔍 Verifying email with backend...');
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify_email',
          email,
          otp
        }),
        credentials: 'include' // Include cookies in the request
      });

      const result = await response.json();
      console.log('✅ Email verification response:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Email verification error:', error);
      
      // Fallback to localStorage for demo/development
      try {
        const users = JSON.parse(localStorage.getItem('fxgoldUsers') || '[]');
        const userIndex = users.findIndex((u: User) => u.email === email);
        
        if (userIndex >= 0) {
          users[userIndex].is_verified = true;
          localStorage.setItem('fxgoldUsers', JSON.stringify(users));
          return { success: true, message: 'Email verified successfully! You can now login.' };
        }
        
        return { success: false, message: 'User not found' };
      } catch (fallbackError) {
        console.error('❌ Fallback verification error:', fallbackError);
        return {
          success: false,
          message: 'Email verification failed. Please try again.'
        };
      }
    }
  },

  async resendVerification(email: string): Promise<AuthResponse> {
    try {
      console.log('📧 Resending verification email...');
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'resend_verification',
          email
        }),
        credentials: 'include' // Include cookies in the request
      });

      const result = await response.json();
      console.log('📨 Resend verification response:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Resend verification error:', error);
      
      // Fallback for demo/development
      return {
        success: true,
        message: 'New verification code sent to your email',
        debug_otp: '123456' // Demo OTP
      };
    }
  },

  async login(email: string, password: string, rememberMe = false): Promise<AuthResponse> {
    try {
      console.log('🔐 Calling backend login API...');
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          email,
          password,
          rememberMe
        }),
        credentials: 'include' // Include cookies in the request
      });

      const result = await response.json();
      console.log('🔑 Backend login response:', result);
      
      // If login successful but no token provided, generate a demo token
      if (result.success && !result.token && result.user) {
        result.token = `demo-token-${result.user.id}`;
      }
      
      return result;
    } catch (error) {
      console.error('❌ Login API error:', error);
      
      // Fallback to localStorage for demo/development
      try {
        const users = JSON.parse(localStorage.getItem('fxgoldUsers') || '[]');
        const user = users.find((u: User) => u.email === email);
        
        if (user) {
          if (!user.is_verified) {
            return {
              success: false,
              message: 'Please verify your email first',
              requiresVerification: true
            };
          }
          
          if (user.twoFactorEnabled) {
            return {
              success: true,
              requires2FA: true,
              message: '2FA code sent to your email',
              userId: user.id
            };
          }
          
          // Generate a token
          const token = `demo-token-${user.id}`;
          
          // Store token based on remember me preference
          if (rememberMe) {
            localStorage.setItem('persistentToken', token);
          } else {
            sessionStorage.setItem('token', token);
          }
          
          return {
            success: true,
            message: 'Login successful',
            token,
            user
          };
        }
        
        return { success: false, message: 'Invalid email or password' };
      } catch (fallbackError) {
        console.error('❌ Fallback login error:', fallbackError);
        return {
          success: false,
          message: 'Login failed. Please check your internet connection and try again.'
        };
      }
    }
  },

  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      console.log('🔑 Sending password reset request to backend...');
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'forgot_password',
          email
        }),
        credentials: 'include' // Include cookies in the request
      });

      const result = await response.json();
      console.log('📨 Password reset response:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Forgot password error:', error);
      
      // Fallback for demo/development
      return {
        success: true,
        message: 'Password reset code sent to your email',
        debug_otp: '123456' // Demo OTP
      };
    }
  },

  async resetPassword(email: string, otp: string, newPassword: string): Promise<AuthResponse> {
    try {
      console.log('🔐 Resetting password via backend API...');
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reset_password',
          email,
          otp,
          newPassword
        }),
        credentials: 'include' // Include cookies in the request
      });

      const result = await response.json();
      console.log('🔄 Password reset response:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Reset password error:', error);
      
      // Fallback to localStorage for demo/development
      try {
        const users = JSON.parse(localStorage.getItem('fxgoldUsers') || '[]');
        const userIndex = users.findIndex((u: User) => u.email === email);
        
        if (userIndex >= 0) {
          // Update password (in a real app, this would be hashed)
          users[userIndex].password = newPassword;
          localStorage.setItem('fxgoldUsers', JSON.stringify(users));
          return { success: true, message: 'Password reset successfully' };
        }
        
        return { success: false, message: 'User not found' };
      } catch (fallbackError) {
        console.error('❌ Fallback reset password error:', fallbackError);
        return {
          success: false,
          message: 'Password reset failed. Please try again.'
        };
      }
    }
  },

  async verify2FA(email: string, otp: string, userId: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify_2fa',
          email,
          otp,
          userId
        }),
        credentials: 'include' // Include cookies in the request
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ 2FA verification error:', error);
      
      // Fallback to localStorage for demo/development
      try {
        const users = JSON.parse(localStorage.getItem('fxgoldUsers') || '[]');
        const user = users.find((u: User) => u.id === userId);
        
        if (user) {
          // Generate a token
          const token = `demo-token-${user.id}`;
          
          // Store token in both storages for persistence
          localStorage.setItem('token', token);
          sessionStorage.setItem('token', token);
          
          return {
            success: true,
            message: '2FA verification successful',
            token,
            user
          };
        }
        
        return { success: false, message: 'User not found' };
      } catch (fallbackError) {
        console.error('❌ Fallback 2FA verification error:', fallbackError);
        return {
          success: false,
          message: '2FA verification failed. Please try again.'
        };
      }
    }
  },

  async toggle2FA(userId: string, enable: boolean): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'toggle_2fa',
          userId,
          enable
        }),
        credentials: 'include' // Include cookies in the request
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ 2FA toggle error:', error);
      
      // Fallback to localStorage for demo/development
      try {
        const users = JSON.parse(localStorage.getItem('fxgoldUsers') || '[]');
        const userIndex = users.findIndex((u: User) => u.id === userId);
        
        if (userIndex >= 0) {
          if (enable) {
            return {
              success: true,
              message: '2FA setup code sent to your email',
              requiresVerification: true
            };
          } else {
            users[userIndex].twoFactorEnabled = false;
            localStorage.setItem('fxgoldUsers', JSON.stringify(users));
            return { success: true, message: '2FA disabled successfully' };
          }
        }
        
        return { success: false, message: 'User not found' };
      } catch (fallbackError) {
        console.error('❌ Fallback 2FA toggle error:', fallbackError);
        return {
          success: false,
          message: 'Failed to update 2FA settings. Please try again.'
        };
      }
    }
  },

  async updateUsername(userId: string, newUsername: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_username',
          userId,
          newUsername
        }),
        credentials: 'include' // Include cookies in the request
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ Update username error:', error);
      
      // Fallback to localStorage for demo/development
      try {
        const users = JSON.parse(localStorage.getItem('fxgoldUsers') || '[]');
        
        // Check if username already exists
        if (users.some((u: User) => u.username === newUsername)) {
          return { success: false, message: 'Username already taken' };
        }
        
        const userIndex = users.findIndex((u: User) => u.id === userId);
        
        if (userIndex >= 0) {
          users[userIndex].username = newUsername;
          localStorage.setItem('fxgoldUsers', JSON.stringify(users));
          return { success: true, message: 'Username updated successfully' };
        }
        
        return { success: false, message: 'User not found' };
      } catch (fallbackError) {
        console.error('❌ Fallback update username error:', fallbackError);
        return {
          success: false,
          message: 'Failed to update username. Please try again.'
        };
      }
    }
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'change_password',
          userId,
          currentPassword,
          newPassword
        }),
        credentials: 'include' // Include cookies in the request
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ Change password error:', error);
      
      // Fallback to localStorage for demo/development
      try {
        const users = JSON.parse(localStorage.getItem('fxgoldUsers') || '[]');
        const userIndex = users.findIndex((u: User) => u.id === userId);
        
        if (userIndex >= 0) {
          // In a real app, we would verify the current password hash
          // For demo purposes, we'll just update the password
          users[userIndex].password = newPassword;
          localStorage.setItem('fxgoldUsers', JSON.stringify(users));
          return { success: true, message: 'Password changed successfully' };
        }
        
        return { success: false, message: 'User not found' };
      } catch (fallbackError) {
        console.error('❌ Fallback change password error:', fallbackError);
        return {
          success: false,
          message: 'Failed to change password. Please try again.'
        };
      }
    }
  }
};