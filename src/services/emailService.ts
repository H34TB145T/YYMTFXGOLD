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

  constructor() {
    this.emailEnabled = true; // Enable email functionality
    this.config = {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: 'fxgold.info@gmail.com',
        pass: 'svlw ypaq dqlv vzqz' // Gmail App Password
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
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your FxGold Account</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              background: #f4f4f4; 
              margin: 0; 
              padding: 20px; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white; 
              border-radius: 12px; 
              overflow: hidden; 
              box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
            }
            .header { 
              background: linear-gradient(135deg, #10b981, #059669); 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
            }
            .header h1 { 
              margin: 0; 
              font-size: 28px; 
              font-weight: bold; 
            }
            .header p { 
              margin: 10px 0 0 0; 
              opacity: 0.9; 
              font-size: 16px; 
            }
            .content { 
              padding: 40px 30px; 
            }
            .content h2 { 
              color: #333; 
              margin-bottom: 20px; 
              font-size: 24px; 
            }
            .otp-container { 
              background: linear-gradient(135deg, #f8f9fa, #e9ecef); 
              border: 2px dashed #10b981; 
              border-radius: 12px; 
              padding: 30px; 
              text-align: center; 
              margin: 30px 0; 
            }
            .otp-code { 
              font-size: 42px; 
              font-weight: bold; 
              color: #10b981; 
              letter-spacing: 8px; 
              margin: 15px 0; 
              font-family: 'Courier New', monospace; 
              text-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
            }
            .otp-label { 
              color: #666; 
              font-size: 14px; 
              margin-bottom: 10px; 
              font-weight: 600;
            }
            .instructions { 
              background: linear-gradient(135deg, #e3f2fd, #bbdefb); 
              border-left: 4px solid #2196f3; 
              padding: 20px; 
              margin: 25px 0; 
              border-radius: 0 8px 8px 0; 
            }
            .instructions strong { 
              color: #1976d2; 
              display: block; 
              margin-bottom: 10px; 
            }
            .footer { 
              background: #f8f9fa; 
              padding: 25px; 
              text-align: center; 
              color: #666; 
              font-size: 14px; 
              border-top: 1px solid #eee; 
            }
            .warning { 
              background: linear-gradient(135deg, #fff3cd, #ffeaa7); 
              border: 1px solid #ffc107; 
              color: #856404; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 25px 0; 
            }
            .warning strong { 
              display: block; 
              margin-bottom: 8px; 
            }
            .features { 
              background: #f8f9fa; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 25px 0; 
            }
            .features ul { 
              margin: 0; 
              padding-left: 20px; 
            }
            .features li { 
              margin: 8px 0; 
              color: #555; 
            }
            .security-notice {
              background: linear-gradient(135deg, #d1ecf1, #bee5eb);
              border: 1px solid #17a2b8;
              color: #0c5460;
              padding: 20px;
              border-radius: 8px;
              margin: 25px 0;
            }
            .logo {
              display: inline-block;
              background: rgba(255,255,255,0.2);
              padding: 10px;
              border-radius: 50%;
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🚀</div>
              <h1>Welcome to FxGold Trading!</h1>
              <p>Your Gateway to Professional Cryptocurrency Trading</p>
            </div>
            <div class="content">
              <h2>Hello ${userName}! 👋</h2>
              <p>Thank you for joining FxGold Trading Platform! We're excited to have you on board and ready to help you start your cryptocurrency trading journey.</p>
              <p>To complete your registration and unlock all trading features, please verify your email address using the verification code below:</p>
              
              <div class="otp-container">
                <div class="otp-label">🔐 Your Verification Code</div>
                <div class="otp-code">${otp}</div>
                <div style="color: #666; font-size: 12px; margin-top: 10px;">Enter this code in the verification page</div>
              </div>
              
              <div class="instructions">
                <strong>📋 How to verify your account:</strong>
                1. Go back to the FxGold website<br>
                2. Enter the 6-digit code above in the verification field<br>
                3. Click 'Verify Email' to complete your registration<br>
                4. Start trading immediately after verification!
              </div>
              
              <div class="warning">
                <strong>⏰ Important Security Notice:</strong>
                This verification code will expire in <strong>10 minutes</strong> for your security. If you don't verify within this time, you'll need to request a new code.
              </div>
              
              <div class="features">
                <strong>🎉 What you'll get access to after verification:</strong>
                <ul>
                  <li>🔄 Real-time cryptocurrency trading (BTC, ETH, USDT & more)</li>
                  <li>📊 Advanced trading charts and market analytics</li>
                  <li>💰 Secure wallet management with multi-network support</li>
                  <li>📱 24/7 customer support and trading assistance</li>
                  <li>🛡️ Bank-level security with 2FA protection</li>
                  <li>💎 Access to both spot and futures trading</li>
                </ul>
              </div>
              
              <div class="security-notice">
                <strong>🛡️ Security Reminder:</strong>
                We will never ask for your password via email. If you didn't create an account with FxGold Trading, please ignore this email and contact our support team.
              </div>
              
              <p style="margin-top: 30px;">If you have any questions or need assistance, our support team is here to help!</p>
            </div>
            <div class="footer">
              <p><strong>FxGold Trading Platform</strong></p>
              <p>&copy; 2024 FxGold Trading. All rights reserved.</p>
              <p style="margin-top: 15px; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
              <p style="font-size: 12px;">Need help? Contact us at <strong>support@fxgold.shop</strong></p>
              <p style="font-size: 12px; margin-top: 10px;">📧 Email: fxgold.info@gmail.com | 🌐 Website: fxgold.shop</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  private getPasswordResetTemplate(otp: string, userName: string): EmailTemplate {
    return {
      subject: '🔑 Reset Your FxGold Password - Secure Access Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your FxGold Password</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              background: #f4f4f4; 
              margin: 0; 
              padding: 20px; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white; 
              border-radius: 12px; 
              overflow: hidden; 
              box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
            }
            .header { 
              background: linear-gradient(135deg, #ef4444, #dc2626); 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
            }
            .header h1 { 
              margin: 0; 
              font-size: 28px; 
              font-weight: bold; 
            }
            .header p { 
              margin: 10px 0 0 0; 
              opacity: 0.9; 
              font-size: 16px; 
            }
            .content { 
              padding: 40px 30px; 
            }
            .content h2 { 
              color: #333; 
              margin-bottom: 20px; 
              font-size: 24px; 
            }
            .otp-container { 
              background: linear-gradient(135deg, #fef2f2, #fee2e2); 
              border: 2px dashed #ef4444; 
              border-radius: 12px; 
              padding: 30px; 
              text-align: center; 
              margin: 30px 0; 
            }
            .otp-code { 
              font-size: 42px; 
              font-weight: bold; 
              color: #ef4444; 
              letter-spacing: 8px; 
              margin: 15px 0; 
              font-family: 'Courier New', monospace; 
              text-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
            }
            .otp-label { 
              color: #666; 
              font-size: 14px; 
              margin-bottom: 10px; 
              font-weight: 600;
            }
            .instructions { 
              background: linear-gradient(135deg, #fff3cd, #ffeaa7); 
              border-left: 4px solid #ffc107; 
              padding: 20px; 
              margin: 25px 0; 
              border-radius: 0 8px 8px 0; 
            }
            .instructions strong { 
              color: #856404; 
              display: block; 
              margin-bottom: 10px; 
            }
            .footer { 
              background: #f8f9fa; 
              padding: 25px; 
              text-align: center; 
              color: #666; 
              font-size: 14px; 
              border-top: 1px solid #eee; 
            }
            .warning { 
              background: linear-gradient(135deg, #f8d7da, #f5c6cb); 
              border: 1px solid #dc3545; 
              color: #721c24; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 25px 0; 
            }
            .warning strong { 
              display: block; 
              margin-bottom: 8px; 
            }
            .security-tip { 
              background: linear-gradient(135deg, #d1ecf1, #bee5eb); 
              border: 1px solid #17a2b8; 
              color: #0c5460; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 25px 0; 
            }
            .security-tip strong { 
              display: block; 
              margin-bottom: 10px; 
            }
            .security-tip ul { 
              margin: 0; 
              padding-left: 20px; 
            }
            .security-tip li { 
              margin: 5px 0; 
            }
            .logo {
              display: inline-block;
              background: rgba(255,255,255,0.2);
              padding: 10px;
              border-radius: 50%;
              margin-bottom: 10px;
            }
            .urgent {
              background: linear-gradient(135deg, #fff3cd, #ffeaa7);
              border: 2px solid #ffc107;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🔐</div>
              <h1>Password Reset Request</h1>
              <p>FxGold Trading Security Center</p>
            </div>
            <div class="content">
              <h2>Hello ${userName}! 👋</h2>
              <p>We received a request to reset your password for your FxGold Trading account. Your account security is our top priority.</p>
              <p>Use the verification code below to reset your password and regain access to your trading account:</p>
              
              <div class="otp-container">
                <div class="otp-label">🔑 Password Reset Code</div>
                <div class="otp-code">${otp}</div>
                <div style="color: #666; font-size: 12px; margin-top: 10px;">Enter this code to reset your password</div>
              </div>
              
              <div class="instructions">
                <strong>📋 How to reset your password:</strong>
                1. Go back to the FxGold password reset page<br>
                2. Enter the 6-digit code above<br>
                3. Create a new secure password<br>
                4. Confirm your new password<br>
                5. Login with your new credentials
              </div>
              
              <div class="urgent">
                <strong>⏰ URGENT:</strong> This reset code will expire in <strong>10 minutes</strong> for security reasons. Please reset your password immediately.
              </div>
              
              <div class="security-tip">
                <strong>🛡️ Password Security Tips:</strong>
                <ul>
                  <li>Use a strong password with at least 8 characters</li>
                  <li>Include uppercase letters, lowercase letters, numbers, and symbols</li>
                  <li>Don't reuse passwords from other accounts</li>
                  <li>Consider enabling 2FA for extra security</li>
                  <li>Never share your password with anyone</li>
                </ul>
              </div>
              
              <div class="warning">
                <strong>🚨 Security Alert:</strong>
                If you didn't request this password reset, please ignore this email and your password will remain unchanged. Consider enabling 2FA and contact our support team if you suspect unauthorized access.
              </div>
              
              <p style="margin-top: 30px;"><strong>Need help?</strong> Our security team is available 24/7 to assist you with account recovery.</p>
            </div>
            <div class="footer">
              <p><strong>FxGold Trading Platform - Security Center</strong></p>
              <p>&copy; 2024 FxGold Trading. All rights reserved.</p>
              <p style="margin-top: 15px; font-size: 12px;">This is an automated security message, please do not reply to this email.</p>
              <p style="font-size: 12px;">Security concerns? Contact us at <strong>security@fxgold.shop</strong></p>
              <p style="font-size: 12px; margin-top: 10px;">📧 Email: fxgold.info@gmail.com | 🌐 Website: fxgold.shop</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  private get2FATemplate(otp: string, userName: string): EmailTemplate {
    return {
      subject: '🔐 FxGold 2FA Verification Code - Secure Login',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>FxGold 2FA Verification</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              background: #f4f4f4; 
              margin: 0; 
              padding: 20px; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white; 
              border-radius: 12px; 
              overflow: hidden; 
              box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
            }
            .header { 
              background: linear-gradient(135deg, #3b82f6, #1d4ed8); 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
            }
            .header h1 { 
              margin: 0; 
              font-size: 28px; 
              font-weight: bold; 
            }
            .header p { 
              margin: 10px 0 0 0; 
              opacity: 0.9; 
              font-size: 16px; 
            }
            .content { 
              padding: 40px 30px; 
            }
            .content h2 { 
              color: #333; 
              margin-bottom: 20px; 
              font-size: 24px; 
            }
            .otp-container { 
              background: linear-gradient(135deg, #eff6ff, #dbeafe); 
              border: 2px dashed #3b82f6; 
              border-radius: 12px; 
              padding: 30px; 
              text-align: center; 
              margin: 30px 0; 
            }
            .otp-code { 
              font-size: 42px; 
              font-weight: bold; 
              color: #3b82f6; 
              letter-spacing: 8px; 
              margin: 15px 0; 
              font-family: 'Courier New', monospace; 
              text-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
            }
            .otp-label { 
              color: #666; 
              font-size: 14px; 
              margin-bottom: 10px; 
              font-weight: 600;
            }
            .instructions { 
              background: linear-gradient(135deg, #f0f9ff, #e0f2fe); 
              border-left: 4px solid #0ea5e9; 
              padding: 20px; 
              margin: 25px 0; 
              border-radius: 0 8px 8px 0; 
            }
            .instructions strong { 
              color: #0c4a6e; 
              display: block; 
              margin-bottom: 10px; 
            }
            .footer { 
              background: #f8f9fa; 
              padding: 25px; 
              text-align: center; 
              color: #666; 
              font-size: 14px; 
              border-top: 1px solid #eee; 
            }
            .warning { 
              background: linear-gradient(135deg, #fef3c7, #fde68a); 
              border: 1px solid #f59e0b; 
              color: #92400e; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 25px 0; 
            }
            .warning strong { 
              display: block; 
              margin-bottom: 8px; 
            }
            .security-notice { 
              background: linear-gradient(135deg, #dcfce7, #bbf7d0); 
              border: 1px solid #22c55e; 
              color: #166534; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 25px 0; 
            }
            .security-notice strong { 
              display: block; 
              margin-bottom: 10px; 
            }
            .login-details {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #6c757d;
            }
            .logo {
              display: inline-block;
              background: rgba(255,255,255,0.2);
              padding: 10px;
              border-radius: 50%;
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🛡️</div>
              <h1>Two-Factor Authentication</h1>
              <p>FxGold Trading Security Verification</p>
            </div>
            <div class="content">
              <h2>Hello ${userName}! 👋</h2>
              <p>Someone is trying to access your FxGold Trading account. For your security, we need to verify that it's really you.</p>
              <p>Your two-factor authentication code is:</p>
              
              <div class="otp-container">
                <div class="otp-label">🔐 2FA Verification Code</div>
                <div class="otp-code">${otp}</div>
                <div style="color: #666; font-size: 12px; margin-top: 10px;">Enter this code to complete your login</div>
              </div>
              
              <div class="instructions">
                <strong>📋 How to complete your login:</strong>
                1. Go back to the FxGold login page<br>
                2. Enter the 6-digit code above<br>
                3. Click 'Verify' to access your account<br>
                4. Start trading securely!
              </div>
              
              <div class="warning">
                <strong>⏰ Time Sensitive:</strong>
                This code will expire in <strong>5 minutes</strong> for maximum security. Please complete your login promptly.
              </div>
              
              <div class="login-details">
                <strong>📊 Login Details:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Time: ${new Date().toLocaleString()}</li>
                  <li>Account: ${userName}</li>
                  <li>Security Level: 2FA Enabled ✅</li>
                  <li>Location: Secure Login Attempt</li>
                </ul>
              </div>
              
              <div class="security-notice">
                <strong>🛡️ Security Notice:</strong>
                If you didn't try to log in, someone may be attempting to access your account. Please contact our security team immediately and consider changing your password.
              </div>
              
              <p style="margin-top: 30px;">Your account security is our priority. Thank you for using 2FA to protect your trading account!</p>
            </div>
            <div class="footer">
              <p><strong>FxGold Trading Platform - Security Center</strong></p>
              <p>&copy; 2024 FxGold Trading. All rights reserved.</p>
              <p style="margin-top: 15px; font-size: 12px;">This is an automated security message, please do not reply to this email.</p>
              <p style="font-size: 12px;">Security concerns? Contact us at <strong>security@fxgold.shop</strong></p>
              <p style="font-size: 12px; margin-top: 10px;">📧 Email: fxgold.info@gmail.com | 🌐 Website: fxgold.shop</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  // Simulate email sending (in production, this would use actual SMTP)
  private async simulateEmailSend(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      // Log email details for development
      console.log(`📧 Email sent to: ${to}`);
      console.log(`📧 Subject: ${template.subject}`);
      console.log(`📧 SMTP Config: ${this.config.host}:${this.config.port}`);
      console.log(`📧 From: ${this.config.auth.user}`);
      
      // In production, you would use nodemailer or similar:
      /*
      const transporter = nodemailer.createTransporter(this.config);
      await transporter.sendMail({
        from: `"FxGold Trading" <${this.config.auth.user}>`,
        to: to,
        subject: template.subject,
        html: template.html
      });
      */
      
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
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
      
      const emailSent = await this.simulateEmailSend(email, template);
      
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
      
      const emailSent = await this.simulateEmailSend(email, template);
      
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
      
      const emailSent = await this.simulateEmailSend(email, template);
      
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