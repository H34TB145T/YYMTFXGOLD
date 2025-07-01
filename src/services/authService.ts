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

const API_BASE_URL = 'https://fxgold.shop/api';

export const authService = {
  async register(email: string, password: string, username: string, fullName: string): Promise<AuthResponse> {
    try {
      console.log('🚀 Calling backend registration API...');
      
      const response = await fetch(`${API_BASE_URL}/auth.php`, {
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

      const responseText = await response.text();
      if (!responseText) {
        throw new Error("Received an empty response from the server. The backend script might have an error.");
      }
      
      const result = JSON.parse(responseText);
      console.log('📧 Backend registration response:', result);
      
      return result;
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
      console.log('🔍 Verifying email with backend...');
      
      const response = await fetch(`${API_BASE_URL}/auth.php`, {
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

      const responseText = await response.text();
      if (!responseText) {
        throw new Error("Received an empty response from the server. The backend script might have an error.");
      }
      
      const result = JSON.parse(responseText);
      console.log('✅ Email verification response:', result);
      
      return result;
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
      
      const response = await fetch(`${API_BASE_URL}/auth.php`, {
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

      const responseText = await response.text();
      if (!responseText) {
        throw new Error("Received an empty response from the server. The backend script might have an error.");
      }
      
      const result = JSON.parse(responseText);
      console.log('📨 Resend verification response:', result);
      
      return result;
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
      console.log('🔐 Calling backend login API...');
      
      const response = await fetch(`${API_BASE_URL}/auth.php`, {
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

      const responseText = await response.text();
      if (!responseText) {
        throw new Error("Received an empty response from the server. The backend script might have an error.");
      }
      
      const result = JSON.parse(responseText);
      console.log('🔑 Backend login response:', result);
      
      return result;
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
      const response = await fetch(`${API_BASE_URL}/auth.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'logout'
        }),
        credentials: 'include' // Include cookies in the request
      });
      
      const responseText = await response.text();
      if (!responseText) {
        throw new Error("Received an empty response from the server. The backend script might have an error.");
      }
      
      const result = JSON.parse(responseText);
      return result;
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
      const response = await fetch(`${API_BASE_URL}/auth.php`, {
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

      const responseText = await response.text();
      if (!responseText) {
        throw new Error("Received an empty response from the server. The backend script might have an error.");
      }
      
      const result = JSON.parse(responseText);
      return result;
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
      const response = await fetch(`${API_BASE_URL}/auth.php`, {
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

      const responseText = await response.text();
      if (!responseText) {
        throw new Error("Received an empty response from the server. The backend script might have an error.");
      }
      
      const result = JSON.parse(responseText);
      return result;
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
      const response = await fetch(`${API_BASE_URL}/auth.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify_2fa',
          email,
          otp,
          userId,
          rememberMe
        }),
        credentials: 'include' // Include cookies in the request
      });

      const responseText = await response.text();
      if (!responseText) {
        throw new Error("Received an empty response from the server. The backend script might have an error.");
      }
      
      const result = JSON.parse(responseText);
      return result;
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
      const response = await fetch(`${API_BASE_URL}/auth.php`, {
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

      const responseText = await response.text();
      if (!responseText) {
        throw new Error("Received an empty response from the server. The backend script might have an error.");
      }
      
      const result = JSON.parse(responseText);
      return result;
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
      const response = await fetch(`${API_BASE_URL}/auth.php`, {
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

      const responseText = await response.text();
      if (!responseText) {
        throw new Error("Received an empty response from the server. The backend script might have an error.");
      }
      
      const result = JSON.parse(responseText);
      return result;
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
      const response = await fetch(`${API_BASE_URL}/auth.php`, {
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

      const responseText = await response.text();
      if (!responseText) {
        throw new Error("Received an empty response from the server. The backend script might have an error.");
      }
      
      const result = JSON.parse(responseText);
      return result;
    } catch (error) {
      console.error('❌ Change password error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to change password. Please try again.'
      };
    }
  },
  
  // Check if user is authenticated via PHP session
  async checkSession(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth.php?check_session=1`, {
        method: 'GET',
        credentials: 'include' // Include cookies in the request
      });
      
      const responseText = await response.text();
      if (!responseText) {
        throw new Error("Received an empty response from the server. The backend script might have an error.");
      }
      
      const result = JSON.parse(responseText);
      return result;
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
      const response = await fetch(`${API_BASE_URL}/auth.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_2fa',
          ...data
        }),
        credentials: 'include' // Include cookies in the request
      });

      const responseText = await response.text();
      if (!responseText) {
        throw new Error("Received an empty response from the server. The backend script might have an error.");
      }
      
      const result = JSON.parse(responseText);
      return result;
    } catch (error) {
      console.error('❌ Send 2FA error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send 2FA code. Please try again.'
      };
    }
  }
};