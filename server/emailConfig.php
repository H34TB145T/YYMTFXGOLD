<?php
// Email configuration for servers with or without mail server
class EmailConfig {
    // SMTP Configuration - Using Gmail SMTP as fallback
    const SMTP_HOST = 'smtp.gmail.com';
    const SMTP_PORT = 587;
    const SMTP_USERNAME = 'your-gmail@gmail.com'; // Change this to your Gmail
    const SMTP_PASSWORD = 'your-app-password'; // Gmail App Password
    const SMTP_ENCRYPTION = 'tls';
    
    // Email settings
    const FROM_EMAIL = 'noreply@fxgold.shop';
    const FROM_NAME = 'FxGold Trading';
    const REPLY_TO = 'support@fxgold.shop';
    
    // OTP settings
    const OTP_LENGTH = 6;
    const OTP_EXPIRY_MINUTES = 10;
    const OTP_2FA_EXPIRY_MINUTES = 5;
    
    // Email feature toggle - SET TO TRUE TO ENABLE EMAIL VERIFICATION
    const EMAIL_ENABLED = true; // Set to true to enable email verification
}

// Email service class with fallback for no mail server
class EmailService {
    private $mailer;
    private $emailEnabled;
    
    public function __construct() {
        $this->emailEnabled = EmailConfig::EMAIL_ENABLED;
        
        if ($this->emailEnabled) {
            // Only initialize PHPMailer if email is enabled
            if (file_exists('vendor/autoload.php')) {
                require_once 'vendor/autoload.php';
                
                $this->mailer = new PHPMailer\PHPMailer\PHPMailer(true);
                
                // SMTP configuration
                $this->mailer->isSMTP();
                $this->mailer->Host = EmailConfig::SMTP_HOST;
                $this->mailer->SMTPAuth = true;
                $this->mailer->Username = EmailConfig::SMTP_USERNAME;
                $this->mailer->Password = EmailConfig::SMTP_PASSWORD;
                $this->mailer->SMTPSecure = EmailConfig::SMTP_ENCRYPTION;
                $this->mailer->Port = EmailConfig::SMTP_PORT;
                
                // Default settings
                $this->mailer->setFrom(EmailConfig::FROM_EMAIL, EmailConfig::FROM_NAME);
                $this->mailer->addReplyTo(EmailConfig::REPLY_TO, EmailConfig::FROM_NAME);
                $this->mailer->isHTML(true);
            }
        }
    }
    
    public function generateOTP($length = EmailConfig::OTP_LENGTH) {
        return str_pad(random_int(0, pow(10, $length) - 1), $length, '0', STR_PAD_LEFT);
    }
    
    public function sendVerificationEmail($email, $userName, $otp) {
        if (!$this->emailEnabled) {
            // Log the OTP for manual verification when email is disabled
            error_log("VERIFICATION OTP for $email: $otp");
            return true; // Return true to continue the flow
        }
        
        try {
            if (!$this->mailer) return false;
            
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($email);
            
            $this->mailer->Subject = 'Verify Your FxGold Account';
            $this->mailer->Body = $this->getVerificationTemplate($otp, $userName);
            
            return $this->mailer->send();
        } catch (Exception $e) {
            error_log("Email sending failed: " . $e->getMessage());
            return false;
        }
    }
    
    public function sendPasswordResetEmail($email, $userName, $otp) {
        if (!$this->emailEnabled) {
            // Log the OTP for manual verification when email is disabled
            error_log("PASSWORD RESET OTP for $email: $otp");
            return true; // Return true to continue the flow
        }
        
        try {
            if (!$this->mailer) return false;
            
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($email);
            
            $this->mailer->Subject = 'Reset Your FxGold Password';
            $this->mailer->Body = $this->getPasswordResetTemplate($otp, $userName);
            
            return $this->mailer->send();
        } catch (Exception $e) {
            error_log("Email sending failed: " . $e->getMessage());
            return false;
        }
    }
    
    public function send2FAEmail($email, $userName, $otp) {
        if (!$this->emailEnabled) {
            // Log the OTP for manual verification when email is disabled
            error_log("2FA OTP for $email: $otp");
            return true; // Return true to continue the flow
        }
        
        try {
            if (!$this->mailer) return false;
            
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($email);
            
            $this->mailer->Subject = 'FxGold 2FA Verification Code';
            $this->mailer->Body = $this->get2FATemplate($otp, $userName);
            
            return $this->mailer->send();
        } catch (Exception $e) {
            error_log("Email sending failed: " . $e->getMessage());
            return false;
        }
    }
    
    private function getVerificationTemplate($otp, $userName) {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px 20px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
                .content { padding: 40px 30px; }
                .content h2 { color: #333; margin-bottom: 20px; }
                .otp-container { background: #f8f9fa; border: 2px dashed #10b981; border-radius: 10px; padding: 30px; text-align: center; margin: 30px 0; }
                .otp-code { font-size: 36px; font-weight: bold; color: #10b981; letter-spacing: 8px; margin: 10px 0; font-family: 'Courier New', monospace; }
                .otp-label { color: #666; font-size: 14px; margin-bottom: 10px; }
                .instructions { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 0 5px 5px 0; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #eee; }
                .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>🚀 Welcome to FxGold Trading!</h1>
                    <p style='margin: 10px 0 0 0; opacity: 0.9;'>Your Gateway to Cryptocurrency Trading</p>
                </div>
                <div class='content'>
                    <h2>Hello {$userName}! 👋</h2>
                    <p>Thank you for joining FxGold Trading Platform! We're excited to have you on board.</p>
                    <p>To complete your registration and start trading cryptocurrencies, please verify your email address using the verification code below:</p>
                    
                    <div class='otp-container'>
                        <div class='otp-label'>Your Verification Code</div>
                        <div class='otp-code'>{$otp}</div>
                        <div style='color: #666; font-size: 12px; margin-top: 10px;'>Enter this code in the verification page</div>
                    </div>
                    
                    <div class='instructions'>
                        <strong>📋 How to verify:</strong><br>
                        1. Go back to the FxGold website<br>
                        2. Enter the 6-digit code above<br>
                        3. Click 'Verify Email' to complete registration
                    </div>
                    
                    <div class='warning'>
                        <strong>⏰ Important:</strong> This verification code will expire in " . EmailConfig::OTP_EXPIRY_MINUTES . " minutes for security reasons.
                    </div>
                    
                    <p>Once verified, you'll have access to:</p>
                    <ul style='color: #555;'>
                        <li>🔄 Real-time cryptocurrency trading</li>
                        <li>📊 Advanced trading charts and analytics</li>
                        <li>💰 Secure wallet management</li>
                        <li>📱 24/7 customer support</li>
                    </ul>
                    
                    <p>If you didn't create an account with FxGold Trading, please ignore this email.</p>
                </div>
                <div class='footer'>
                    <p><strong>FxGold Trading Platform</strong></p>
                    <p>&copy; 2024 FxGold Trading. All rights reserved.</p>
                    <p style='margin-top: 15px; font-size: 12px;'>This is an automated message, please do not reply to this email.</p>
                    <p style='font-size: 12px;'>Need help? Contact us at support@fxgold.shop</p>
                </div>
            </div>
        </body>
        </html>";
    }
    
    private function getPasswordResetTemplate($otp, $userName) {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px 20px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
                .content { padding: 40px 30px; }
                .content h2 { color: #333; margin-bottom: 20px; }
                .otp-container { background: #fef2f2; border: 2px dashed #ef4444; border-radius: 10px; padding: 30px; text-align: center; margin: 30px 0; }
                .otp-code { font-size: 36px; font-weight: bold; color: #ef4444; letter-spacing: 8px; margin: 10px 0; font-family: 'Courier New', monospace; }
                .otp-label { color: #666; font-size: 14px; margin-bottom: 10px; }
                .instructions { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 0 5px 5px 0; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #eee; }
                .warning { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .security-tip { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>🔐 Password Reset Request</h1>
                    <p style='margin: 10px 0 0 0; opacity: 0.9;'>FxGold Trading Security</p>
                </div>
                <div class='content'>
                    <h2>Hello {$userName}! 👋</h2>
                    <p>We received a request to reset your password for your FxGold Trading account.</p>
                    <p>Use the verification code below to reset your password:</p>
                    
                    <div class='otp-container'>
                        <div class='otp-label'>Password Reset Code</div>
                        <div class='otp-code'>{$otp}</div>
                        <div style='color: #666; font-size: 12px; margin-top: 10px;'>Enter this code to reset your password</div>
                    </div>
                    
                    <div class='instructions'>
                        <strong>📋 How to reset your password:</strong><br>
                        1. Go back to the password reset page<br>
                        2. Enter the 6-digit code above<br>
                        3. Create a new secure password<br>
                        4. Confirm your new password
                    </div>
                    
                    <div class='warning'>
                        <strong>⏰ Important:</strong> This reset code will expire in " . EmailConfig::OTP_EXPIRY_MINUTES . " minutes for security reasons.
                    </div>
                    
                    <div class='security-tip'>
                        <strong>🛡️ Security Tips:</strong><br>
                        • Use a strong password with at least 8 characters<br>
                        • Include uppercase, lowercase, numbers, and symbols<br>
                        • Don't reuse passwords from other accounts<br>
                        • Enable 2FA for extra security
                    </div>
                    
                    <p><strong>Didn't request this?</strong> If you didn't request a password reset, please ignore this email and your password will remain unchanged. Consider enabling 2FA for additional security.</p>
                </div>
                <div class='footer'>
                    <p><strong>FxGold Trading Platform</strong></p>
                    <p>&copy; 2024 FxGold Trading. All rights reserved.</p>
                    <p style='margin-top: 15px; font-size: 12px;'>This is an automated message, please do not reply to this email.</p>
                    <p style='font-size: 12px;'>Need help? Contact us at support@fxgold.shop</p>
                </div>
            </div>
        </body>
        </html>";
    }
    
    private function get2FATemplate($otp, $userName) {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px 20px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
                .content { padding: 40px 30px; }
                .content h2 { color: #333; margin-bottom: 20px; }
                .otp-container { background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 10px; padding: 30px; text-align: center; margin: 30px 0; }
                .otp-code { font-size: 36px; font-weight: bold; color: #3b82f6; letter-spacing: 8px; margin: 10px 0; font-family: 'Courier New', monospace; }
                .otp-label { color: #666; font-size: 14px; margin-bottom: 10px; }
                .instructions { background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0; border-radius: 0 5px 5px 0; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #eee; }
                .warning { background: #fef3c7; border: 1px solid #f59e0b; color: #92400e; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .security-notice { background: #dcfce7; border: 1px solid #22c55e; color: #166534; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>🔐 Two-Factor Authentication</h1>
                    <p style='margin: 10px 0 0 0; opacity: 0.9;'>FxGold Trading Security</p>
                </div>
                <div class='content'>
                    <h2>Hello {$userName}! 👋</h2>
                    <p>Someone is trying to access your FxGold Trading account. For your security, we need to verify it's really you.</p>
                    <p>Your two-factor authentication code is:</p>
                    
                    <div class='otp-container'>
                        <div class='otp-label'>2FA Verification Code</div>
                        <div class='otp-code'>{$otp}</div>
                        <div style='color: #666; font-size: 12px; margin-top: 10px;'>Enter this code to complete login</div>
                    </div>
                    
                    <div class='instructions'>
                        <strong>📋 How to complete login:</strong><br>
                        1. Go back to the login page<br>
                        2. Enter the 6-digit code above<br>
                        3. Click 'Verify' to access your account
                    </div>
                    
                    <div class='warning'>
                        <strong>⏰ Important:</strong> This code will expire in " . EmailConfig::OTP_2FA_EXPIRY_MINUTES . " minutes for security reasons.
                    </div>
                    
                    <div class='security-notice'>
                        <strong>🛡️ Security Notice:</strong> If you didn't try to log in, someone may be trying to access your account. Please contact our support team immediately and consider changing your password.
                    </div>
                    
                    <p><strong>Login Details:</strong></p>
                    <ul style='color: #555;'>
                        <li>Time: " . date('Y-m-d H:i:s T') . "</li>
                        <li>Account: {$userName}</li>
                        <li>Security: 2FA Enabled ✅</li>
                    </ul>
                </div>
                <div class='footer'>
                    <p><strong>FxGold Trading Platform</strong></p>
                    <p>&copy; 2024 FxGold Trading. All rights reserved.</p>
                    <p style='margin-top: 15px; font-size: 12px;'>This is an automated message, please do not reply to this email.</p>
                    <p style='font-size: 12px;'>Need help? Contact us at support@fxgold.shop</p>
                </div>
            </div>
        </body>
        </html>";
    }
}

// OTP management class
class OTPManager {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
    }
    
    public function storeOTP($email, $otp, $type, $expiryMinutes = EmailConfig::OTP_EXPIRY_MINUTES) {
        $expiryTime = date('Y-m-d H:i:s', strtotime("+{$expiryMinutes} minutes"));
        $id = $this->generateUUID();
        
        // Delete any existing OTP for this email and type
        $stmt = $this->db->prepare("DELETE FROM otp_codes WHERE email = ? AND type = ?");
        $stmt->execute([$email, $type]);
        
        // Insert new OTP
        $stmt = $this->db->prepare("INSERT INTO otp_codes (id, email, otp, type, expires_at) VALUES (?, ?, ?, ?, ?)");
        return $stmt->execute([$id, $email, $otp, $type, $expiryTime]);
    }
    
    public function verifyOTP($email, $otp, $type) {
        $stmt = $this->db->prepare("SELECT * FROM otp_codes WHERE email = ? AND otp = ? AND type = ? AND expires_at > NOW()");
        $stmt->execute([$email, $otp, $type]);
        $result = $stmt->fetch();
        
        if ($result) {
            // Delete the OTP after successful verification
            $stmt = $this->db->prepare("DELETE FROM otp_codes WHERE id = ?");
            $stmt->execute([$result['id']]);
            return true;
        }
        
        return false;
    }
    
    public function cleanExpiredOTPs() {
        $stmt = $this->db->prepare("DELETE FROM otp_codes WHERE expires_at <= NOW()");
        return $stmt->execute();
    }
    
    private function generateUUID() {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }
}
?>