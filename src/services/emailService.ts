interface EmailResponse {
  success: boolean;
  message: string;
  otp?: string;
}

class EmailService {
  private apiUrl: string;

  constructor() {
    // Use your actual domain API endpoint
    this.apiUrl = 'https://fxgold.shop/api';
  }

  async sendVerificationEmail(email: string, userName: string): Promise<EmailResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/auth.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_verification',
          email: email,
          userName: userName
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error sending verification email:', error);
      return {
        success: false,
        message: 'Failed to send verification email. Please try again.'
      };
    }
  }

  async sendPasswordResetEmail(email: string, userName: string): Promise<EmailResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/auth.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'forgot_password',
          email: email
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return {
        success: false,
        message: 'Failed to send password reset email. Please try again.'
      };
    }
  }

  async send2FAEmail(email: string, userName: string): Promise<EmailResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/auth.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_2fa',
          email: email,
          userName: userName
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error sending 2FA email:', error);
      return {
        success: false,
        message: 'Failed to send 2FA code. Please try again.'
      };
    }
  }

  verifyOTP(email: string, otp: string, type: 'verification' | 'password_reset' | '2fa'): { success: boolean; message: string } {
    // This will be handled by the backend API calls
    return { success: true, message: 'OTP verification handled by backend' };
  }

  cleanupExpiredOTPs(): void {
    // This will be handled by the backend
  }
}

export const emailService = new EmailService();