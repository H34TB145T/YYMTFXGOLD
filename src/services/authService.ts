import { apiRequest } from '../config/api';
import { User } from '../types';

interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  requires2FA?: boolean;
  userId?: string;
}

export const authService = {
  async register(email: string, password: string, username: string, fullName: string): Promise<AuthResponse> {
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
  },

  async verifyEmail(email: string, otp: string): Promise<AuthResponse> {
    return await apiRequest('/auth.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'verify_email',
        email,
        otp
      })
    });
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    return await apiRequest('/auth.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'login',
        email,
        password
      })
    });
  },

  async forgotPassword(email: string): Promise<AuthResponse> {
    return await apiRequest('/auth.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'forgot_password',
        email
      })
    });
  },

  async resetPassword(email: string, otp: string, newPassword: string): Promise<AuthResponse> {
    return await apiRequest('/auth.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'reset_password',
        email,
        otp,
        newPassword
      })
    });
  },

  async verify2FA(email: string, otp: string, userId: string): Promise<AuthResponse> {
    return await apiRequest('/auth.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'verify_2fa',
        email,
        otp,
        userId
      })
    });
  },

  async toggle2FA(userId: string, enable: boolean): Promise<AuthResponse> {
    return await apiRequest('/auth.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'toggle_2fa',
        userId,
        enable
      })
    });
  }
};