<?php
// Email configuration for FxGold Trading Platform with PHPMailer
require_once 'vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class EmailConfig {
    // cPanel Mail Server Configuration (Your Own Server)
    const SMTP_HOST = 'ps04.zwhhosting.com';
    const SMTP_PORT = 465;
    const SMTP_USERNAME = 'support@fxgold.shop'; // Your cPanel email
    const SMTP_PASSWORD = 'YOUR_EMAIL_PASSWORD'; // Replace with your actual email password
    const SMTP_ENCRYPTION = 'ssl'; // SSL for port 465
    
    // Email settings - All using support@fxgold.shop
    const FROM_EMAIL = 'support@fxgold.shop';
    const FROM_NAME = 'FxGold Trading Support';
    const REPLY_TO = 'support@fxgold.shop'; // Changed to support email
    
    // Website URL - Updated to your domain
    const WEBSITE_URL = 'https://fxgold.shop';
    
    // OTP settings
    const OTP_LENGTH = 6;
    const OTP_EXPIRY_MINUTES = 10;
    const OTP_2FA_EXPIRY_MINUTES = 5;
    
    // Email feature toggle - SET TO TRUE TO ENABLE EMAIL VERIFICATION
    const EMAIL_ENABLED = true; // Set to true to enable PHPMailer email verification
}

// Email service class with PHPMailer and cPanel SMTP
class EmailService {
    private $mailer;
    private $emailEnabled;
    
    public function __construct() {
        $this->emailEnabled = EmailConfig::EMAIL_ENABLED;
        
        if ($this->emailEnabled) {
            // Initialize PHPMailer
            $this->mailer = new PHPMailer(true);
            
            try {
                // Server settings for cPanel mail
                $this->mailer->isSMTP();
                $this->mailer->Host = EmailConfig::SMTP_HOST;
                $this->mailer->SMTPAuth = true;
                $this->mailer->Username = EmailConfig::SMTP_USERNAME;
                $this->mailer->Password = EmailConfig::SMTP_PASSWORD;
                $this->mailer->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // SSL encryption
                $this->mailer->Port = EmailConfig::SMTP_PORT;
                
                // Default settings
                $this->mailer->setFrom(EmailConfig::FROM_EMAIL, EmailConfig::FROM_NAME);
                $this->mailer->addReplyTo(EmailConfig::REPLY_TO, EmailConfig::FROM_NAME);
                $this->mailer->isHTML(true);
                $this->mailer->CharSet = 'UTF-8';
                
                // Enable verbose debug output (disable in production)
                // $this->mailer->SMTPDebug = SMTP::DEBUG_SERVER;
                
            } catch (Exception $e) {
                error_log("PHPMailer initialization failed: " . $e->getMessage());
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
            
            // Clear previous recipients
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($email);
            
            $this->mailer->Subject = '🔐 Verify Your FxGold Account - Action Required';
            $this->mailer->Body = $this->getVerificationTemplate($otp, $userName);
            
            $result = $this->mailer->send();
            
            if ($result) {
                error_log("Verification email sent successfully to: $email");
            } else {
                error_log("Failed to send verification email to: $email");
            }
            
            return $result;
            
        } catch (Exception $e) {
            error_log("PHPMailer Error: " . $e->getMessage());
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
            
            // Clear previous recipients
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($email);
            
            $this->mailer->Subject = '🔑 Reset Your FxGold Password - Secure Access Code';
            $this->mailer->Body = $this->getPasswordResetTemplate($otp, $userName);
            
            $result = $this->mailer->send();
            
            if ($result) {
                error_log("Password reset email sent successfully to: $email");
            } else {
                error_log("Failed to send password reset email to: $email");
            }
            
            return $result;
            
        } catch (Exception $e) {
            error_log("PHPMailer Error: " . $e->getMessage());
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
            
            // Clear previous recipients
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($email);
            
            $this->mailer->Subject = '🔐 FxGold 2FA Verification Code - Secure Login';
            $this->mailer->Body = $this->get2FATemplate($otp, $userName);
            
            $result = $this->mailer->send();
            
            if ($result) {
                error_log("2FA email sent successfully to: $email");
            } else {
                error_log("Failed to send 2FA email to: $email");
            }
            
            return $result;
            
        } catch (Exception $e) {
            error_log("PHPMailer Error: " . $e->getMessage());
            return false;
        }
    }
    
    private function getVerificationTemplate($otp, $userName) {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
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
                .content { 
                    padding: 40px 30px; 
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
                }
                .footer { 
                    background: #f8f9fa; 
                    padding: 25px; 
                    text-align: center; 
                    color: #666; 
                    font-size: 14px; 
                    border-top: 1px solid #eee; 
                }
                .instructions { 
                    background: linear-gradient(135deg, #e3f2fd, #bbdefb); 
                    border-left: 4px solid #2196f3; 
                    padding: 20px; 
                    margin: 25px 0; 
                    border-radius: 0 8px 8px 0; 
                }
                .warning { 
                    background: linear-gradient(135deg, #fff3cd, #ffeaa7); 
                    border: 1px solid #ffc107; 
                    color: #856404; 
                    padding: 20px; 
                    border-radius: 8px; 
                    margin: 25px 0; 
                }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>🚀 Welcome to FxGold Trading!</h1>
                    <p style='margin: 10px 0 0 0; opacity: 0.9;'>Your Gateway to Professional Cryptocurrency Trading</p>
                </div>
                <div class='content'>
                    <h2>Hello {$userName}! 👋</h2>
                    <p>Thank you for joining FxGold Trading Platform! We're excited to have you on board.</p>
                    <p>To complete your registration and start trading cryptocurrencies, please verify your email address using the verification code below:</p>
                    
                    <div class='otp-container'>
                        <div style='color: #666; font-size: 14px; margin-bottom: 10px; font-weight: 600;'>🔐 Your Verification Code</div>
                        <div class='otp-code'>{$otp}</div>
                        <div style='color: #666; font-size: 12px; margin-top: 10px;'>Enter this code in the verification page</div>
                    </div>
                    
                    <div class='instructions'>
                        <strong>📋 How to verify:</strong><br>
                        1. Go back to <a href='" . EmailConfig::WEBSITE_URL . "' style='color: #2196f3;'>fxgold.shop</a><br>
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
                    <p>&copy; 2025 FxGold Trading. All rights reserved.</p>
                    <p style='margin-top: 15px; font-size: 12px;'>This is an automated message, please do not reply to this email.</p>
                    <p style='font-size: 12px;'>Need help? Contact us at support@fxgold.shop</p>
                    <p style='font-size: 12px; margin-top: 10px;'>🌐 Website: <a href='" . EmailConfig::WEBSITE_URL . "' style='color: #10b981;'>fxgold.shop</a></p>
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
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
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
                .content { 
                    padding: 40px 30px; 
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
                }
                .footer { 
                    background: #f8f9fa; 
                    padding: 25px; 
                    text-align: center; 
                    color: #666; 
                    font-size: 14px; 
                    border-top: 1px solid #eee; 
                }
                .instructions { 
                    background: linear-gradient(135deg, #fff3cd, #ffeaa7); 
                    border-left: 4px solid #ffc107; 
                    padding: 20px; 
                    margin: 25px 0; 
                    border-radius: 0 8px 8px 0; 
                }
                .warning { 
                    background: linear-gradient(135deg, #f8d7da, #f5c6cb); 
                    border: 1px solid #dc3545; 
                    color: #721c24; 
                    padding: 20px; 
                    border-radius: 8px; 
                    margin: 25px 0; 
                }
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
                        <div style='color: #666; font-size: 14px; margin-bottom: 10px; font-weight: 600;'>🔑 Password Reset Code</div>
                        <div class='otp-code'>{$otp}</div>
                        <div style='color: #666; font-size: 12px; margin-top: 10px;'>Enter this code to reset your password</div>
                    </div>
                    
                    <div class='instructions'>
                        <strong>📋 How to reset your password:</strong><br>
                        1. Go back to <a href='" . EmailConfig::WEBSITE_URL . "' style='color: #ffc107;'>fxgold.shop</a><br>
                        2. Enter the 6-digit code above<br>
                        3. Create a new secure password<br>
                        4. Confirm your new password
                    </div>
                    
                    <div class='warning'>
                        <strong>⏰ Important:</strong> This reset code will expire in " . EmailConfig::OTP_EXPIRY_MINUTES . " minutes for security reasons.
                    </div>
                    
                    <p><strong>Didn't request this?</strong> If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
                </div>
                <div class='footer'>
                    <p><strong>FxGold Trading Platform</strong></p>
                    <p>&copy; 2025 FxGold Trading. All rights reserved.</p>
                    <p style='margin-top: 15px; font-size: 12px;'>This is an automated message, please do not reply to this email.</p>
                    <p style='font-size: 12px;'>Need help? Contact us at support@fxgold.shop</p>
                    <p style='font-size: 12px; margin-top: 10px;'>🌐 Website: <a href='" . EmailConfig::WEBSITE_URL . "' style='color: #ef4444;'>fxgold.shop</a></p>
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
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
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
                .content { 
                    padding: 40px 30px; 
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
                }
                .footer { 
                    background: #f8f9fa; 
                    padding: 25px; 
                    text-align: center; 
                    color: #666; 
                    font-size: 14px; 
                    border-top: 1px solid #eee; 
                }
                .instructions { 
                    background: linear-gradient(135deg, #f0f9ff, #e0f2fe); 
                    border-left: 4px solid #0ea5e9; 
                    padding: 20px; 
                    margin: 25px 0; 
                    border-radius: 0 8px 8px 0; 
                }
                .warning { 
                    background: linear-gradient(135deg, #fef3c7, #fde68a); 
                    border: 1px solid #f59e0b; 
                    color: #92400e; 
                    padding: 20px; 
                    border-radius: 8px; 
                    margin: 25px 0; 
                }
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
                        <div style='color: #666; font-size: 14px; margin-bottom: 10px; font-weight: 600;'>🔐 2FA Verification Code</div>
                        <div class='otp-code'>{$otp}</div>
                        <div style='color: #666; font-size: 12px; margin-top: 10px;'>Enter this code to complete login</div>
                    </div>
                    
                    <div class='instructions'>
                        <strong>📋 How to complete login:</strong><br>
                        1. Go back to <a href='" . EmailConfig::WEBSITE_URL . "' style='color: #0ea5e9;'>fxgold.shop</a><br>
                        2. Enter the 6-digit code above<br>
                        3. Click 'Verify' to access your account
                    </div>
                    
                    <div class='warning'>
                        <strong>⏰ Important:</strong> This code will expire in " . EmailConfig::OTP_2FA_EXPIRY_MINUTES . " minutes for security reasons.
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
                    <p>&copy; 2025 FxGold Trading. All rights reserved.</p>
                    <p style='margin-top: 15px; font-size: 12px;'>This is an automated message, please do not reply to this email.</p>
                    <p style='font-size: 12px;'>Need help? Contact us at support@fxgold.shop</p>
                    <p style='font-size: 12px; margin-top: 10px;'>🌐 Website: <a href='" . EmailConfig::WEBSITE_URL . "' style='color: #3b82f6;'>fxgold.shop</a></p>
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