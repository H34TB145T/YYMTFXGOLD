<?php
// Email configuration for your domain
class EmailConfig {
    // SMTP Configuration for your domain
    const SMTP_HOST = 'mail.fxgold.shop';
    const SMTP_PORT = 587;
    const SMTP_USERNAME = 'no-reply@fxgold.shop';
    const SMTP_PASSWORD = 'your_email_password_here'; // Set this in your cPanel
    const SMTP_ENCRYPTION = 'tls';
    
    // Email settings
    const FROM_EMAIL = 'no-reply@fxgold.shop';
    const FROM_NAME = 'FxGold Trading';
    const REPLY_TO = 'support@fxgold.shop';
    
    // OTP settings
    const OTP_LENGTH = 6;
    const OTP_EXPIRY_MINUTES = 10;
    const OTP_2FA_EXPIRY_MINUTES = 5;
}

// Email service class
class EmailService {
    private $mailer;
    
    public function __construct() {
        // Using PHPMailer for sending emails
        require_once 'vendor/autoload.php'; // You'll need to install PHPMailer via Composer
        
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
    
    public function generateOTP($length = EmailConfig::OTP_LENGTH) {
        return str_pad(random_int(0, pow(10, $length) - 1), $length, '0', STR_PAD_LEFT);
    }
    
    public function sendVerificationEmail($email, $userName, $otp) {
        try {
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
        try {
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
        try {
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
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #10b981; color: white; padding: 20px; text-align: center; }
                .content { padding: 30px; background: #f9f9f9; }
                .otp-code { font-size: 32px; font-weight: bold; color: #10b981; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>Welcome to FxGold Trading</h1>
                </div>
                <div class='content'>
                    <h2>Hello {$userName},</h2>
                    <p>Thank you for registering with FxGold Trading Platform. To complete your registration, please verify your email address using the OTP code below:</p>
                    <div class='otp-code'>{$otp}</div>
                    <p>This code will expire in " . EmailConfig::OTP_EXPIRY_MINUTES . " minutes for security reasons.</p>
                    <p>If you didn't create an account with us, please ignore this email.</p>
                </div>
                <div class='footer'>
                    <p>&copy; 2024 FxGold Trading. All rights reserved.</p>
                    <p>This is an automated message, please do not reply.</p>
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
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
                .content { padding: 30px; background: #f9f9f9; }
                .otp-code { font-size: 32px; font-weight: bold; color: #ef4444; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>Password Reset Request</h1>
                </div>
                <div class='content'>
                    <h2>Hello {$userName},</h2>
                    <p>We received a request to reset your password for your FxGold Trading account. Use the OTP code below to reset your password:</p>
                    <div class='otp-code'>{$otp}</div>
                    <p>This code will expire in " . EmailConfig::OTP_EXPIRY_MINUTES . " minutes for security reasons.</p>
                    <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
                </div>
                <div class='footer'>
                    <p>&copy; 2024 FxGold Trading. All rights reserved.</p>
                    <p>This is an automated message, please do not reply.</p>
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
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
                .content { padding: 30px; background: #f9f9f9; }
                .otp-code { font-size: 32px; font-weight: bold; color: #3b82f6; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>Two-Factor Authentication</h1>
                </div>
                <div class='content'>
                    <h2>Hello {$userName},</h2>
                    <p>Your two-factor authentication code for FxGold Trading is:</p>
                    <div class='otp-code'>{$otp}</div>
                    <p>This code will expire in " . EmailConfig::OTP_2FA_EXPIRY_MINUTES . " minutes for security reasons.</p>
                    <p>If you didn't request this code, please contact our support team immediately.</p>
                </div>
                <div class='footer'>
                    <p>&copy; 2024 FxGold Trading. All rights reserved.</p>
                    <p>This is an automated message, please do not reply.</p>
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
        
        // Delete any existing OTP for this email and type
        $stmt = $this->db->prepare("DELETE FROM otp_codes WHERE email = ? AND type = ?");
        $stmt->execute([$email, $type]);
        
        // Insert new OTP
        $stmt = $this->db->prepare("INSERT INTO otp_codes (email, otp, type, expires_at) VALUES (?, ?, ?, ?)");
        return $stmt->execute([$email, $otp, $type, $expiryTime]);
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
}
?>