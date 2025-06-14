import { apiRequest } from '../config/api';
import { User } from '../types';

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
      return await apiRequest('/auth.php', {
        method: 'POST',
        body: JSON.stringify({
          action: 'register',
          email,
          password,
          username,
          fullName
        })
      });
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Registration failed. Please try again.'
      };
    }
  },

  async verifyEmail(email: string, otp: string): Promise<AuthResponse> {
    try {
      return await apiRequest('/auth.php', {
        method: 'POST',
        body: JSON.stringify({
          action: 'verify_email',
          email,
          otp
        })
      });
    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        message: 'Email verification failed. Please try again.'
      };
    }
  },

  async resendVerification(email: string): Promise<AuthResponse> {
    try {
      return await apiRequest('/auth.php', {
        method: 'POST',
        body: JSON.stringify({
          action: 'resend_verification',
          email
        })
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      return {
        success: false,
        message: 'Failed to resend verification code. Please try again.'
      };
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      return await apiRequest('/auth.php', {
        method: 'POST',
        body: JSON.stringify({
          action: 'login',
          email,
          password
        })
      });
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    }
  },

  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      return await apiRequest('/auth.php', {
        method: 'POST',
        body: JSON.stringify({
          action: 'forgot_password',
          email
        })
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: 'Failed to send reset code. Please try again.'
      };
    }
  },

  async resetPassword(email: string, otp: string, newPassword: string): Promise<AuthResponse> {
    try {
      return await apiRequest('/auth.php', {
        method: 'POST',
        body: JSON.stringify({
          action: 'reset_password',
          email,
          otp,
          newPassword
        })
      });
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: 'Password reset failed. Please try again.'
      };
    }
  },

  async verify2FA(email: string, otp: string, userId: string): Promise<AuthResponse> {
    try {
      return await apiRequest('/auth.php', {
        method: 'POST',
        body: JSON.stringify({
          action: 'verify_2fa',
          email,
          otp,
          userId
        })
      });
    } catch (error) {
      console.error('2FA verification error:', error);
      return {
        success: false,
        message: '2FA verification failed. Please try again.'
      };
    }
  },

  async toggle2FA(userId: string, enable: boolean): Promise<AuthResponse> {
    try {
      return await apiRequest('/auth.php', {
        method: 'POST',
        body: JSON.stringify({
          action: 'toggle_2fa',
          userId,
          enable
        })
      });
    } catch (error) {
      console.error('2FA toggle error:', error);
      return {
        success: false,
        message: 'Failed to update 2FA settings. Please try again.'
      };
    }
  }
};