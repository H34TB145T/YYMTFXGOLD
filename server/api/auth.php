<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Add error logging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

require_once '../config/database.php';
require_once '../emailConfig.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Log the incoming request for debugging
error_log("API Request: " . json_encode($input));

// Initialize services
$emailService = new EmailService();
$otpManager = new OTPManager($pdo);

switch ($method) {
    case 'POST':
        $action = $input['action'] ?? '';
        
        switch ($action) {
            case 'register':
                handleRegister($input, $pdo, $emailService, $otpManager);
                break;
                
            case 'send_verification':
                handleSendVerification($input, $emailService, $otpManager);
                break;
                
            case 'verify_email':
                handleVerifyEmail($input, $pdo, $otpManager);
                break;
                
            case 'resend_verification':
                handleResendVerification($input, $pdo, $emailService, $otpManager);
                break;
                
            case 'login':
                handleLogin($input, $pdo, $emailService, $otpManager);
                break;
                
            case 'forgot_password':
                handleForgotPassword($input, $pdo, $emailService, $otpManager);
                break;
                
            case 'reset_password':
                handleResetPassword($input, $pdo, $otpManager);
                break;
                
            case 'verify_2fa':
                handleVerify2FA($input, $pdo, $otpManager);
                break;
                
            case 'send_2fa':
                handleSend2FA($input, $emailService, $otpManager);
                break;
                
            case 'toggle_2fa':
                handleToggle2FA($input, $pdo, $emailService, $otpManager);
                break;
                
            default:
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid action']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

function handleSendVerification($input, $emailService, $otpManager) {
    $email = $input['email'] ?? '';
    $userName = $input['userName'] ?? 'User';
    
    if (empty($email)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email is required']);
        return;
    }
    
    // Generate and send verification OTP
    $otp = $emailService->generateOTP();
    $otpManager->storeOTP($email, $otp, 'verification');
    
    if ($emailService->sendVerificationEmail($email, $userName, $otp)) {
        echo json_encode([
            'success' => true, 
            'message' => 'Verification email sent successfully! Please check your inbox.'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to send verification email']);
    }
}

function handleSend2FA($input, $emailService, $otpManager) {
    $email = $input['email'] ?? '';
    $userName = $input['userName'] ?? 'User';
    
    if (empty($email)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email is required']);
        return;
    }
    
    // Generate and send 2FA OTP
    $otp = $emailService->generateOTP();
    $otpManager->storeOTP($email, $otp, '2fa', EmailConfig::OTP_2FA_EXPIRY_MINUTES);
    
    if ($emailService->send2FAEmail($email, $userName, $otp)) {
        echo json_encode([
            'success' => true, 
            'message' => '2FA code sent to your email'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to send 2FA code']);
    }
}

function handleRegister($input, $pdo, $emailService, $otpManager) {
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    $username = $input['username'] ?? '';
    $fullName = $input['fullName'] ?? '';
    
    // Log registration attempt
    error_log("Registration attempt: email=$email, username=$username");
    
    if (empty($email) || empty($password) || empty($username)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        return;
    }
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid email format']);
        return;
    }
    
    // Validate password strength
    if (strlen($password) < 6) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters long']);
        return;
    }
    
    try {
        // Check if user already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
        $stmt->execute([$email, $username]);
        if ($stmt->fetch()) {
            error_log("User already exists: email=$email, username=$username");
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'User already exists with this email or username. Please try logging in or use different credentials.']);
            return;
        }
        
        // Create user
        $userId = generateUUID();
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        $stmt = $pdo->prepare("INSERT INTO users (id, username, email, password, full_name, is_verified, balance, usdt_balance, margin_balance) VALUES (?, ?, ?, ?, ?, 0, 1000, 0, 0)");
        
        if ($stmt->execute([$userId, $username, $email, $hashedPassword, $fullName])) {
            error_log("User created successfully: $userId");
            
            // Generate and send verification OTP using real PHPMailer
            $otp = $emailService->generateOTP();
            $otpStored = $otpManager->storeOTP($email, $otp, 'verification');
            
            if ($otpStored) {
                error_log("OTP stored: $otp for $email");
                
                if ($emailService->sendVerificationEmail($email, $username, $otp)) {
                    error_log("Verification email sent successfully to $email");
                    echo json_encode([
                        'success' => true, 
                        'message' => 'Registration successful! Please check your email for verification code.',
                        'userId' => $userId,
                        'requiresVerification' => true
                    ]);
                } else {
                    error_log("Failed to send verification email to $email");
                    echo json_encode([
                        'success' => true, 
                        'message' => 'Registration successful but failed to send verification email. Please contact support.',
                        'userId' => $userId,
                        'requiresVerification' => true
                    ]);
                }
            } else {
                error_log("Failed to store OTP for $email");
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Registration failed. Please try again.']);
            }
        } else {
            error_log("Failed to insert user into database");
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Registration failed. Please try again.']);
        }
    } catch (Exception $e) {
        error_log("Registration error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Registration failed. Please try again.']);
    }
}

function handleVerifyEmail($input, $pdo, $otpManager) {
    $email = $input['email'] ?? '';
    $otp = $input['otp'] ?? '';
    
    if (empty($email) || empty($otp)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing email or OTP']);
        return;
    }
    
    // Validate OTP format
    if (!preg_match('/^\d{6}$/', $otp)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'OTP must be 6 digits']);
        return;
    }
    
    if ($otpManager->verifyOTP($email, $otp, 'verification')) {
        // Update user as verified
        $stmt = $pdo->prepare("UPDATE users SET is_verified = 1 WHERE email = ?");
        if ($stmt->execute([$email])) {
            echo json_encode(['success' => true, 'message' => 'Email verified successfully! You can now login.']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to update verification status']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid or expired OTP. Please request a new code.']);
    }
}

function handleResendVerification($input, $pdo, $emailService, $otpManager) {
    $email = $input['email'] ?? '';
    
    if (empty($email)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email is required']);
        return;
    }
    
    // Check if user exists and is not already verified
    $stmt = $pdo->prepare("SELECT username, is_verified FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
        return;
    }
    
    if ($user['is_verified']) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email is already verified']);
        return;
    }
    
    // Generate and send new verification OTP
    $otp = $emailService->generateOTP();
    $otpManager->storeOTP($email, $otp, 'verification');
    
    if ($emailService->sendVerificationEmail($email, $user['username'], $otp)) {
        echo json_encode(['success' => true, 'message' => 'New verification code sent to your email']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to send verification email']);
    }
}

function handleLogin($input, $pdo, $emailService, $otpManager) {
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing email or password']);
        return;
    }
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($password, $user['password'])) {
        // Check if email verification is required
        if (!$user['is_verified']) {
            http_response_code(400);
            echo json_encode([
                'success' => false, 
                'message' => 'Please verify your email first',
                'requiresVerification' => true
            ]);
            return;
        }
        
        // Update last login
        $stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $stmt->execute([$user['id']]);
        
        // Check if 2FA is enabled
        if ($user['two_factor_enabled']) {
            $otp = $emailService->generateOTP();
            $otpManager->storeOTP($email, $otp, '2fa', EmailConfig::OTP_2FA_EXPIRY_MINUTES);
            
            if ($emailService->send2FAEmail($email, $user['username'], $otp)) {
                echo json_encode([
                    'success' => true,
                    'requires2FA' => true,
                    'message' => '2FA code sent to your email',
                    'userId' => $user['id']
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to send 2FA code']);
            }
        } else {
            // Generate JWT token (simplified for demo)
            $token = base64_encode(json_encode(['userId' => $user['id'], 'exp' => time() + 3600]));
            
            echo json_encode([
                'success' => true,
                'message' => 'Login successful',
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'is_verified' => $user['is_verified'],
                    'two_factor_enabled' => $user['two_factor_enabled']
                ]
            ]);
        }
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
    }
}

function handleForgotPassword($input, $pdo, $emailService, $otpManager) {
    $email = $input['email'] ?? '';
    
    if (empty($email)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email is required']);
        return;
    }
    
    $stmt = $pdo->prepare("SELECT username FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if ($user) {
        $otp = $emailService->generateOTP();
        $otpManager->storeOTP($email, $otp, 'password_reset');
        
        if ($emailService->sendPasswordResetEmail($email, $user['username'], $otp)) {
            echo json_encode(['success' => true, 'message' => 'Password reset code sent to your email']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to send reset email']);
        }
    } else {
        // Don't reveal if email exists or not for security
        echo json_encode(['success' => true, 'message' => 'If the email exists, a reset code has been sent']);
    }
}

function handleResetPassword($input, $pdo, $otpManager) {
    $email = $input['email'] ?? '';
    $otp = $input['otp'] ?? '';
    $newPassword = $input['newPassword'] ?? '';
    
    if (empty($email) || empty($otp) || empty($newPassword)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        return;
    }
    
    // Validate password strength
    if (strlen($newPassword) < 6) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters long']);
        return;
    }
    
    if ($otpManager->verifyOTP($email, $otp, 'password_reset')) {
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE email = ?");
        
        if ($stmt->execute([$hashedPassword, $email])) {
            echo json_encode(['success' => true, 'message' => 'Password reset successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to update password']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid or expired OTP']);
    }
}

function handleVerify2FA($input, $pdo, $otpManager) {
    $email = $input['email'] ?? '';
    $otp = $input['otp'] ?? '';
    $userId = $input['userId'] ?? '';
    
    if (empty($email) || empty($otp) || empty($userId)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        return;
    }
    
    if ($otpManager->verifyOTP($email, $otp, '2fa')) {
        // Generate JWT token
        $token = base64_encode(json_encode(['userId' => $userId, 'exp' => time() + 3600]));
        
        // Get user data
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        echo json_encode([
            'success' => true,
            'message' => '2FA verification successful',
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => $user['role'],
                'is_verified' => $user['is_verified'],
                'two_factor_enabled' => $user['two_factor_enabled']
            ]
        ]);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid or expired 2FA code']);
    }
}

function handleToggle2FA($input, $pdo, $emailService, $otpManager) {
    $userId = $input['userId'] ?? '';
    $enable = $input['enable'] ?? false;
    
    if (empty($userId)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'User ID is required']);
        return;
    }
    
    $stmt = $pdo->prepare("SELECT email, username FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
        return;
    }
    
    if ($enable) {
        // Send verification code before enabling 2FA
        $otp = $emailService->generateOTP();
        $otpManager->storeOTP($user['email'], $otp, '2fa_setup', EmailConfig::OTP_2FA_EXPIRY_MINUTES);
        
        if ($emailService->send2FAEmail($user['email'], $user['username'], $otp)) {
            echo json_encode([
                'success' => true,
                'message' => '2FA setup code sent to your email',
                'requiresVerification' => true
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to send 2FA setup code']);
        }
    } else {
        // Disable 2FA
        $stmt = $pdo->prepare("UPDATE users SET two_factor_enabled = 0 WHERE id = ?");
        if ($stmt->execute([$userId])) {
            echo json_encode(['success' => true, 'message' => '2FA disabled successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to disable 2FA']);
        }
    }
}

function generateUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}
?>