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

interface EmailResponse {
  success: boolean;
  message: string;
  otp?: string;
}

class EmailService {
  private config: EmailConfig;
  private emailEnabled: boolean;
  private websiteUrl: string;

  constructor() {
    // DISABLE email functionality since no mail server is available
    this.emailEnabled = false; // Set to false to disable email
    this.websiteUrl = 'https://fxgold.shop';
    this.config = {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'fxgold.info@gmail.com',
        pass: 'svlw ypaq dqlv vzqz'
      }
    };
  }

  private generateOTP(length: number = 6): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private getVerificationTemplate(otp: string, userName: string): EmailTemplate {
    return {
      subject: '🔐 Verify Your FxGold Account - Action Required',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Verify Your FxGold Account</title>
        </head>
        <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #10b981; text-align: center;">Welcome to FxGold Trading!</h1>
            <h2>Hello ${userName}!</h2>
            <p>Your verification code is:</p>
            <div style="text-align: center; font-size: 32px; font-weight: bold; color: #10b981; padding: 20px; background: #f0f9ff; border-radius: 8px; margin: 20px 0;">
              ${otp}
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't create an account, please ignore this email.</p>
            <hr>
            <p style="text-align: center; color: #666;">
              <strong>FxGold Trading Platform</strong><br>
              Website: <a href="${this.websiteUrl}">${this.websiteUrl}</a>
            </p>
          </div>
        </body>
        </html>
      `
    };
  }

  private getPasswordResetTemplate(otp: string, userName: string): EmailTemplate {
    return {
      subject: '🔑 Reset Your FxGold Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your FxGold Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #ef4444; text-align: center;">Password Reset Request</h1>
            <h2>Hello ${userName}!</h2>
            <p>Your password reset code is:</p>
            <div style="text-align: center; font-size: 32px; font-weight: bold; color: #ef4444; padding: 20px; background: #fef2f2; border-radius: 8px; margin: 20px 0;">
              ${otp}
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr>
            <p style="text-align: center; color: #666;">
              <strong>FxGold Trading Platform</strong><br>
              Website: <a href="${this.websiteUrl}">${this.websiteUrl}</a>
            </p>
          </div>
        </body>
        </html>
      `
    };
  }

  private get2FATemplate(otp: string, userName: string): EmailTemplate {
    return {
      subject: '🔐 FxGold 2FA Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>FxGold 2FA Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #3b82f6; text-align: center;">Two-Factor Authentication</h1>
            <h2>Hello ${userName}!</h2>
            <p>Your 2FA verification code is:</p>
            <div style="text-align: center; font-size: 32px; font-weight: bold; color: #3b82f6; padding: 20px; background: #eff6ff; border-radius: 8px; margin: 20px 0;">
              ${otp}
            </div>
            <p>This code will expire in 5 minutes.</p>
            <p>If you didn't try to log in, please contact support.</p>
            <hr>
            <p style="text-align: center; color: #666;">
              <strong>FxGold Trading Platform</strong><br>
              Website: <a href="${this.websiteUrl}">${this.websiteUrl}</a>
            </p>
          </div>
        </body>
        </html>
      `
    };
  }

  // Simulate email sending without actual SMTP
  private async simulateEmailSend(to: string, template: EmailTemplate, otp: string): Promise<boolean> {
    try {
      // Log email details for development/debugging
      console.log(`📧 [EMAIL SIMULATION] To: ${to}`);
      console.log(`📧 [EMAIL SIMULATION] Subject: ${template.subject}`);
      console.log(`📧 [EMAIL SIMULATION] OTP Code: ${otp}`);
      console.log(`📧 [EMAIL SIMULATION] Website: ${this.websiteUrl}`);
      
      // Show alert to user with the OTP code (for development/testing)
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          alert(`📧 EMAIL SIMULATION\n\nTo: ${to}\nSubject: ${template.subject}\n\nYour verification code is: ${otp}\n\n(This is shown because email server is not configured)`);
        }, 1000);
      }
      
      return true;
    } catch (error) {
      console.error('Email simulation failed:', error);
      return false;
    }
  }

  async sendVerificationEmail(email: string, userName: string): Promise<EmailResponse> {
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
      
      if (this.emailEnabled) {
        // Would send actual email here
        const emailSent = await this.simulateEmailSend(email, template, otp);
        
        if (emailSent) {
          return {
            success: true,
            message: 'Verification email sent successfully! Please check your inbox.',
            otp // Remove this in production
          };
        } else {
          return {
            success: false,
            message: 'Failed to send verification email. Please try again.'
          };
        }
      } else {
        // Email disabled - show OTP directly to user
        await this.simulateEmailSend(email, template, otp);
        return {
          success: true,
          message: `Email server not configured. Your verification code is: ${otp}`,
          otp
        };
      }
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
      if (!this.emailEnabled) {
        // Email disabled - use default OTP
        const otp = '123456'; // Default OTP when email is disabled
        const otpData = {
          otp,
          email,
          type: 'password_reset',
          expires: Date.now() + 10 * 60 * 1000 // 10 minutes
        };
        localStorage.setItem(`otp_${email}_password_reset`, JSON.stringify(otpData));
        
        return {
          success: true,
          message: 'Email server not configured. Use code: 123456 to reset your password',
          otp
        };
      }

      const otp = this.generateOTP();
      const template = this.getPasswordResetTemplate(otp, userName);
      
      // Store OTP in localStorage for demo
      const otpData = {
        otp,
        email,
        type: 'password_reset',
        expires: Date.now() + 10 * 60 * 1000 // 10 minutes
      };
      localStorage.setItem(`otp_${email}_password_reset`, JSON.stringify(otpData));
      
      const emailSent = await this.simulateEmailSend(email, template, otp);
      
      if (emailSent) {
        return {
          success: true,
          message: 'Password reset email sent successfully! Please check your inbox.',
          otp // Remove this in production
        };
      } else {
        return {
          success: false,
          message: 'Failed to send password reset email. Please try again.'
        };
      }
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
      if (!this.emailEnabled) {
        // Email disabled - accept any 6-digit code for 2FA
        const otp = '123456'; // Default OTP when email is disabled
        const otpData = {
          otp,
          email,
          type: '2fa',
          expires: Date.now() + 5 * 60 * 1000 // 5 minutes
        };
        localStorage.setItem(`otp_${email}_2fa`, JSON.stringify(otpData));
        
        return {
          success: true,
          message: 'Email server not configured. Use any 6-digit code for 2FA verification',
          otp
        };
      }

      const otp = this.generateOTP();
      const template = this.get2FATemplate(otp, userName);
      
      // Store OTP in localStorage for demo
      const otpData = {
        otp,
        email,
        type: '2fa',
        expires: Date.now() + 5 * 60 * 1000 // 5 minutes
      };
      localStorage.setItem(`otp_${email}_2fa`, JSON.stringify(otpData));
      
      const emailSent = await this.simulateEmailSend(email, template, otp);
      
      if (emailSent) {
        return {
          success: true,
          message: '2FA code sent successfully! Please check your inbox.',
          otp // Remove this in production
        };
      } else {
        return {
          success: false,
          message: 'Failed to send 2FA code. Please try again.'
        };
      }
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
      if (!this.emailEnabled) {
        // Email disabled - accept specific codes or any 6-digit code for 2FA
        if (type === 'password_reset' && otp === '123456') {
          return { success: true, message: 'OTP verified successfully!' };
        }
        if (type === '2fa' && otp.length === 6 && /^\d{6}$/.test(otp)) {
          return { success: true, message: 'OTP verified successfully!' };
        }
        if (type === 'verification') {
          // For verification, check stored OTP
          const storedData = localStorage.getItem(`otp_${email}_${type}`);
          if (storedData) {
            const otpData = JSON.parse(storedData);
            if (otpData.otp === otp) {
              localStorage.removeItem(`otp_${email}_${type}`);
              return { success: true, message: 'OTP verified successfully!' };
            }
          }
        }
      }

      const storedData = localStorage.getItem(`otp_${email}_${type}`);
      if (!storedData) {
        return { success: false, message: 'OTP not found or expired. Please request a new code.' };
      }

      const otpData = JSON.parse(storedData);
      
      if (Date.now() > otpData.expires) {
        localStorage.removeItem(`otp_${email}_${type}`);
        return { success: false, message: 'OTP has expired. Please request a new code.' };
      }

      if (otpData.otp !== otp) {
        return { success: false, message: 'Invalid OTP. Please check the code and try again.' };
      }

      // Remove OTP after successful verification
      localStorage.removeItem(`otp_${email}_${type}`);
      
      return { success: true, message: 'OTP verified successfully!' };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, message: 'Failed to verify OTP. Please try again.' };
    }
  }

  // Clean up expired OTPs
  cleanupExpiredOTPs(): void {
    const keys = Object.keys(localStorage);
    const otpKeys = keys.filter(key => key.startsWith('otp_'));
    
    otpKeys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        if (data.expires && Date.now() > data.expires) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        // Remove invalid OTP data
        localStorage.removeItem(key);
      }
    });
  }
}

export const emailService = new EmailService();

// Clean up expired OTPs every 5 minutes
setInterval(() => {
  emailService.cleanupExpiredOTPs();
}, 5 * 60 * 1000);