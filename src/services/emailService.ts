interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailTemplate {
  subject: string;
  html: string;
}

class EmailService {
  private config: EmailConfig;

  constructor() {
    this.config = {
      host: 'mail.fxgold.shop',
      port: 587,
      secure: false,
      auth: {
        user: 'no-reply@fxgold.shop',
        pass: ''
      }
    };
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private getVerificationTemplate(otp: string, userName: string): EmailTemplate {
    return {
      subject: 'Verify Your FxGold Account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .otp-code { font-size: 32px; font-weight: bold; color: #10b981; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to FxGold Trading</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName},</h2>
              <p>Thank you for registering with FxGold Trading Platform. To complete your registration, please verify your email address using the OTP code below:</p>
              <div class="otp-code">${otp}</div>
              <p>This code will expire in 10 minutes for security reasons.</p>
              <p>If you didn't create an account with us, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 FxGold Trading. All rights reserved.</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  private getPasswordResetTemplate(otp: string, userName: string): EmailTemplate {
    return {
      subject: 'Reset Your FxGold Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .otp-code { font-size: 32px; font-weight: bold; color: #ef4444; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName},</h2>
              <p>We received a request to reset your password for your FxGold Trading account. Use the OTP code below to reset your password:</p>
              <div class="otp-code">${otp}</div>
              <p>This code will expire in 10 minutes for security reasons.</p>
              <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 FxGold Trading. All rights reserved.</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  private get2FATemplate(otp: string, userName: string): EmailTemplate {
    return {
      subject: 'FxGold 2FA Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .otp-code { font-size: 32px; font-weight: bold; color: #3b82f6; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Two-Factor Authentication</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName},</h2>
              <p>Your two-factor authentication code for FxGold Trading is:</p>
              <div class="otp-code">${otp}</div>
              <p>This code will expire in 5 minutes for security reasons.</p>
              <p>If you didn't request this code, please contact our support team immediately.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 FxGold Trading. All rights reserved.</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  async sendVerificationEmail(email: string, userName: string): Promise<{ success: boolean; otp?: string; message: string }> {
    try {
      const otp = this.generateOTP();
      const template = this.getVerificationTemplate(otp, userName);
      
      // Store OTP in localStorage for demo (in production, store in database)
      const otpData = {
        otp,
        email,
        type: 'verification',
        expires: Date.now() + 10 * 60 * 1000 // 10 minutes
      };
      localStorage.setItem(`otp_${email}_verification`, JSON.stringify(otpData));
      
      // In production, you would send actual email here
      console.log(`Verification email sent to ${email} with OTP: ${otp}`);
      
      return {
        success: true,
        otp, // Remove this in production
        message: 'Verification email sent successfully'
      };
    } catch (error) {
      console.error('Error sending verification email:', error);
      return {
        success: false,
        message: 'Failed to send verification email'
      };
    }
  }

  async sendPasswordResetEmail(email: string, userName: string): Promise<{ success: boolean; otp?: string; message: string }> {
    try {
      const otp = this.generateOTP();
      const template = this.getPasswordResetTemplate(otp, userName);
      
      // Store OTP in localStorage for demo (in production, store in database)
      const otpData = {
        otp,
        email,
        type: 'password_reset',
        expires: Date.now() + 10 * 60 * 1000 // 10 minutes
      };
      localStorage.setItem(`otp_${email}_password_reset`, JSON.stringify(otpData));
      
      // In production, you would send actual email here
      console.log(`Password reset email sent to ${email} with OTP: ${otp}`);
      
      return {
        success: true,
        otp, // Remove this in production
        message: 'Password reset email sent successfully'
      };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return {
        success: false,
        message: 'Failed to send password reset email'
      };
    }
  }

  async send2FAEmail(email: string, userName: string): Promise<{ success: boolean; otp?: string; message: string }> {
    try {
      const otp = this.generateOTP();
      const template = this.get2FATemplate(otp, userName);
      
      // Store OTP in localStorage for demo (in production, store in database)
      const otpData = {
        otp,
        email,
        type: '2fa',
        expires: Date.now() + 5 * 60 * 1000 // 5 minutes
      };
      localStorage.setItem(`otp_${email}_2fa`, JSON.stringify(otpData));
      
      // In production, you would send actual email here
      console.log(`2FA email sent to ${email} with OTP: ${otp}`);
      
      return {
        success: true,
        otp, // Remove this in production
        message: '2FA code sent successfully'
      };
    } catch (error) {
      console.error('Error sending 2FA email:', error);
      return {
        success: false,
        message: 'Failed to send 2FA code'
      };
    }
  }

  verifyOTP(email: string, otp: string, type: 'verification' | 'password_reset' | '2fa'): { success: boolean; message: string } {
    try {
      const storedData = localStorage.getItem(`otp_${email}_${type}`);
      if (!storedData) {
        return { success: false, message: 'OTP not found or expired' };
      }

      const otpData = JSON.parse(storedData);
      
      if (Date.now() > otpData.expires) {
        localStorage.removeItem(`otp_${email}_${type}`);
        return { success: false, message: 'OTP has expired' };
      }

      if (otpData.otp !== otp) {
        return { success: false, message: 'Invalid OTP' };
      }

      // Remove OTP after successful verification
      localStorage.removeItem(`otp_${email}_${type}`);
      
      return { success: true, message: 'OTP verified successfully' };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, message: 'Failed to verify OTP' };
    }
  }
}

export const emailService = new EmailService();