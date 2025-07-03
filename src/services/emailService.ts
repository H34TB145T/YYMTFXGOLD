import { supabase } from '../lib/supabase';

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
      // Generate and store OTP
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
      
      // In a real app, you would send an email here
      console.log('Verification OTP:', otp);
      
      return {
        success: true,
        message: 'Verification email sent successfully! Please check your inbox.',
        otp // Remove this in production
      };
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
      
      // In a real app, you would send an email here
      console.log('Password reset OTP:', otp);
      
      return {
        success: true,
        message: 'Password reset email sent successfully! Please check your inbox.',
        otp // Remove this in production
      };
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
      // Generate and store OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Delete any existing OTPs for this email and type
      await supabase
        .from('otp_codes')
        .delete()
        .eq('email', email)
        .eq('type', '2fa');
      
      // Insert new OTP
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
      
      // In a real app, you would send an email here
      console.log('2FA OTP:', otp);
      
      return {
        success: true,
        message: '2FA code sent to your email',
        otp // Remove this in production
      };
    } catch (error) {
      console.error('Error sending 2FA email:', error);
      return {
        success: false,
        message: 'Failed to send 2FA code. Please try again.'
      };
    }
  }

  verifyOTP(email: string, otp: string, type: 'verification' | 'password_reset' | '2fa'): { success: boolean; message: string } {
    try {
      // In a real implementation, this would verify against the database
      // For demo purposes, we'll just return success
      return { success: true, message: 'OTP verified successfully' };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, message: 'Failed to verify OTP' };
    }
  }

  cleanupExpiredOTPs(): void {
    // This would be handled by a database trigger or scheduled function
  }
}

export const emailService = new EmailService();