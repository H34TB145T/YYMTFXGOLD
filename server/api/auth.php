<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';
require_once '../emailConfig.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

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
                
            case 'verify_email':
                handleVerifyEmail($input, $pdo, $otpManager);
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

function handleRegister($input, $pdo, $emailService, $otpManager) {
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    $username = $input['username'] ?? '';
    $fullName = $input['fullName'] ?? '';
    
    if (empty($email) || empty($password) || empty($username)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        return;
    }
    
    // Check if user already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
    $stmt->execute([$email, $username]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'User already exists']);
        return;
    }
    
    // Create user
    $userId = generateUUID();
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // If email is disabled, auto-verify the user
    $isVerified = !EmailConfig::EMAIL_ENABLED;
    
    $stmt = $pdo->prepare("INSERT INTO users (id, username, email, password, full_name, is_verified, balance, usdt_balance, margin_balance) VALUES (?, ?, ?, ?, ?, ?, 1000, 0, 0)");
    
    if ($stmt->execute([$userId, $username, $email, $hashedPassword, $fullName, $isVerified])) {
        if (EmailConfig::EMAIL_ENABLED) {
            // Generate and send verification OTP
            $otp = $emailService->generateOTP();
            $otpManager->storeOTP($email, $otp, 'verification');
            
            if ($emailService->sendVerificationEmail($email, $username, $otp)) {
                echo json_encode([
                    'success' => true, 
                    'message' => 'Registration successful. Please check your email for verification code.',
                    'userId' => $userId
                ]);
            } else {
                echo json_encode([
                    'success' => true, 
                    'message' => 'Registration successful but failed to send verification email.',
                    'userId' => $userId
                ]);
            }
        } else {
            // Email disabled - auto-verify and allow immediate login
            echo json_encode([
                'success' => true, 
                'message' => 'Registration successful. You can now login.',
                'userId' => $userId,
                'autoVerified' => true
            ]);
        }
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Registration failed']);
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
    
    // If email is disabled, accept any 6-digit code
    if (!EmailConfig::EMAIL_ENABLED) {
        if (strlen($otp) === 6 && is_numeric($otp)) {
            $stmt = $pdo->prepare("UPDATE users SET is_verified = 1 WHERE email = ?");
            if ($stmt->execute([$email])) {
                echo json_encode(['success' => true, 'message' => 'Email verified successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to update verification status']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Please enter a valid 6-digit code']);
        }
        return;
    }
    
    if ($otpManager->verifyOTP($email, $otp, 'verification')) {
        // Update user as verified
        $stmt = $pdo->prepare("UPDATE users SET is_verified = 1 WHERE email = ?");
        if ($stmt->execute([$email])) {
            echo json_encode(['success' => true, 'message' => 'Email verified successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to update verification status']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid or expired OTP']);
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
        if (!$user['is_verified'] && EmailConfig::EMAIL_ENABLED) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Please verify your email first']);
            return;
        }
        
        // Update last login
        $stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $stmt->execute([$user['id']]);
        
        // Check if 2FA is enabled
        if ($user['two_factor_enabled'] && EmailConfig::EMAIL_ENABLED) {
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
                    'role' => $user['role']
                ]
            ]);
        }
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
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
        if (EmailConfig::EMAIL_ENABLED) {
            $otp = $emailService->generateOTP();
            $otpManager->storeOTP($email, $otp, 'password_reset');
            
            if ($emailService->sendPasswordResetEmail($email, $user['username'], $otp)) {
                echo json_encode(['success' => true, 'message' => 'Password reset code sent to your email']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to send reset email']);
            }
        } else {
            // Email disabled - provide a default reset code
            $otp = '123456'; // Default OTP when email is disabled
            $otpManager->storeOTP($email, $otp, 'password_reset');
            echo json_encode(['success' => true, 'message' => 'Use code: 123456 to reset your password']);
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
    
    // If email is disabled, accept the default OTP
    $otpValid = EmailConfig::EMAIL_ENABLED 
        ? $otpManager->verifyOTP($email, $otp, 'password_reset')
        : ($otp === '123456');
    
    if ($otpValid) {
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
    
    // If email is disabled, accept any 6-digit code
    $otpValid = EmailConfig::EMAIL_ENABLED 
        ? $otpManager->verifyOTP($email, $otp, '2fa')
        : (strlen($otp) === 6 && is_numeric($otp));
    
    if ($otpValid) {
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
                'role' => $user['role']
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
        if (EmailConfig::EMAIL_ENABLED) {
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
            // Email disabled - enable 2FA without verification
            $stmt = $pdo->prepare("UPDATE users SET two_factor_enabled = 1 WHERE id = ?");
            if ($stmt->execute([$userId])) {
                echo json_encode(['success' => true, 'message' => '2FA enabled successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to enable 2FA']);
            }
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