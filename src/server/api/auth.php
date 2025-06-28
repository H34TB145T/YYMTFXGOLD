<?php
// Clean output buffer and ensure JSON-only response
ob_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true'); // Allow credentials

// Set session cookie parameters for better persistence
ini_set('session.cookie_lifetime', 86400 * 30); // 30 days
ini_set('session.gc_maxlifetime', 86400 * 30); // 30 days
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Disable error display to prevent HTML in JSON response
ini_set('display_errors', 0);
error_reporting(E_ALL);
ini_set('log_errors', 1);

// Clean any previous output
ob_clean();

try {
    require_once '../config/database.php';
    require_once '../emailConfig.php';
} catch (Exception $e) {
    // Clean output and send JSON error
    ob_clean();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server configuration error: ' . $e->getMessage()]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Log the incoming request for debugging
error_log("API Request: " . json_encode($input));

// Initialize services
try {
    $emailService = new EmailService();
    $otpManager = new OTPManager($pdo);
} catch (Exception $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Service initialization error: ' . $e->getMessage()]);
    exit;
}

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
                
            case 'update_username':
                handleUpdateUsername($input, $pdo);
                break;
                
            case 'change_password':
                handleChangePassword($input, $pdo);
                break;
                
            default:
                ob_clean();
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid action']);
        }
        break;
        
    default:
        ob_clean();
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

function getUserCompleteData($pdo, $userId) {
    try {
        // Get user basic data
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            return null;
        }
        
        // Get user's crypto assets
        $stmt = $pdo->prepare("SELECT * FROM crypto_assets WHERE user_id = ?");
        $stmt->execute([$userId]);
        $assets = $stmt->fetchAll();
        
        // Get user's transactions
        $stmt = $pdo->prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY timestamp DESC");
        $stmt->execute([$userId]);
        $transactions = $stmt->fetchAll();
        
        // Get user's positions
        $stmt = $pdo->prepare("SELECT * FROM positions WHERE user_id = ? ORDER BY timestamp DESC");
        $stmt->execute([$userId]);
        $positions = $stmt->fetchAll();
        
        // Format assets for frontend
        $formattedAssets = [];
        foreach ($assets as $asset) {
            $formattedAssets[] = [
                'coinId' => $asset['coin_id'],
                'symbol' => $asset['symbol'],
                'name' => $asset['name'],
                'amount' => (float)$asset['amount'],
                'purchasePrice' => (float)$asset['purchase_price']
            ];
        }
        
        // Format transactions for frontend
        $formattedTransactions = [];
        foreach ($transactions as $tx) {
            $formattedTransactions[] = [
                'id' => $tx['id'],
                'coinId' => $tx['coin_id'],
                'coinName' => $tx['coin_name'],
                'coinSymbol' => $tx['coin_symbol'],
                'amount' => (float)$tx['amount'],
                'price' => (float)$tx['price'],
                'total' => (float)$tx['total'],
                'type' => $tx['type'],
                'status' => $tx['status'] ?? 'completed',
                'walletAddress' => $tx['wallet_address'] ?? '',
                'timestamp' => strtotime($tx['timestamp']) * 1000 // Convert to milliseconds
            ];
        }
        
        // Format positions for frontend
        $formattedPositions = [];
        foreach ($positions as $pos) {
            $formattedPositions[] = [
                'id' => $pos['id'],
                'coinId' => $pos['coin_id'],
                'coinName' => $pos['coin_name'],
                'coinSymbol' => $pos['coin_symbol'],
                'type' => $pos['type'],
                'leverage' => (int)$pos['leverage'],
                'size' => (float)$pos['size'],
                'entryPrice' => (float)$pos['entry_price'],
                'liquidationPrice' => (float)$pos['liquidation_price'],
                'margin' => (float)$pos['margin'],
                'pnl' => (float)$pos['pnl'],
                'isOpen' => (bool)$pos['is_open'],
                'timestamp' => strtotime($pos['timestamp']) * 1000 // Convert to milliseconds
            ];
        }
        
        // Return complete user data structure
        return [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'full_name' => $user['full_name'],
            'phone' => $user['phone'] ?? '',
            'role' => $user['role'],
            'is_verified' => (bool)$user['is_verified'],
            'balance' => (float)$user['balance'],
            'usdtBalance' => (float)$user['usdt_balance'],
            'marginBalance' => (float)$user['margin_balance'],
            'wallet_address' => $user['wallet_address'] ?? '',
            'twoFactorEnabled' => (bool)$user['two_factor_enabled'],
            'assets' => $formattedAssets,
            'transactions' => $formattedTransactions,
            'positions' => $formattedPositions
        ];
    } catch (Exception $e) {
        error_log("Error getting complete user data: " . $e->getMessage());
        return null;
    }
}

function handleSendVerification($input, $emailService, $otpManager) {
    $email = $input['email'] ?? '';
    $userName = $input['userName'] ?? 'User';
    
    if (empty($email)) {
        ob_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email is required']);
        return;
    }
    
    // Generate and send verification OTP
    $otp = $emailService->generateOTP();
    $otpManager->storeOTP($email, $otp, 'verification');
    
    error_log("Generated verification OTP: $otp for email: $email");
    
    if ($emailService->sendVerificationEmail($email, $userName, $otp)) {
        ob_clean();
        echo json_encode([
            'success' => true, 
            'message' => 'Verification email sent successfully! Please check your inbox.',
            'debug_otp' => $otp // Remove this in production
        ]);
    } else {
        ob_clean();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to send verification email']);
    }
}

function handleSend2FA($input, $emailService, $otpManager) {
    $email = $input['email'] ?? '';
    $userName = $input['userName'] ?? 'User';
    
    if (empty($email)) {
        ob_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email is required']);
        return;
    }
    
    // Generate and send 2FA OTP
    $otp = $emailService->generateOTP();
    $otpManager->storeOTP($email, $otp, '2fa', EmailConfig::OTP_2FA_EXPIRY_MINUTES);
    
    if ($emailService->send2FAEmail($email, $userName, $otp)) {
        ob_clean();
        echo json_encode([
            'success' => true, 
            'message' => '2FA code sent to your email'
        ]);
    } else {
        ob_clean();
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
        ob_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        return;
    }
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        ob_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid email format']);
        return;
    }
    
    // Validate password strength
    if (strlen($password) < 6) {
        ob_clean();
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
            ob_clean();
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'User already exists with this email or username. Please try logging in or use different credentials.']);
            return;
        }
        
        // Create user with NO default balance - users start with $0
        $userId = generateUUID();
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        $stmt = $pdo->prepare("INSERT INTO users (id, username, email, password, full_name, is_verified, balance, usdt_balance, margin_balance) VALUES (?, ?, ?, ?, ?, 0, 0, 0, 0)");
        
        if ($stmt->execute([$userId, $username, $email, $hashedPassword, $fullName])) {
            error_log("User created successfully: $userId with $0 balance");
            
            // Generate and send verification OTP using real PHPMailer
            $otp = $emailService->generateOTP();
            $otpStored = $otpManager->storeOTP($email, $otp, 'verification');
            
            if ($otpStored) {
                error_log("OTP stored: $otp for $email");
                
                if ($emailService->sendVerificationEmail($email, $username, $otp)) {
                    error_log("Verification email sent successfully to $email");
                    ob_clean();
                    echo json_encode([
                        'success' => true, 
                        'message' => 'Registration successful! Please check your email for verification code.',
                        'userId' => $userId,
                        'requiresVerification' => true,
                        'debug_otp' => $otp // Remove this in production
                    ]);
                } else {
                    error_log("Failed to send verification email to $email");
                    ob_clean();
                    echo json_encode([
                        'success' => true, 
                        'message' => 'Registration successful but failed to send verification email. Please contact support.',
                        'userId' => $userId,
                        'requiresVerification' => true
                    ]);
                }
            } else {
                error_log("Failed to store OTP for $email");
                ob_clean();
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Registration failed. Please try again.']);
            }
        } else {
            error_log("Failed to insert user into database");
            ob_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Registration failed. Please try again.']);
        }
    } catch (Exception $e) {
        error_log("Registration error: " . $e->getMessage());
        ob_clean();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Registration failed. Please try again.']);
    }
}

function handleVerifyEmail($input, $pdo, $otpManager) {
    $email = $input['email'] ?? '';
    $otp = $input['otp'] ?? '';
    
    if (empty($email) || empty($otp)) {
        ob_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing email or OTP']);
        return;
    }
    
    // Validate OTP format
    if (!preg_match('/^\d{6}$/', $otp)) {
        ob_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'OTP must be 6 digits']);
        return;
    }
    
    error_log("Verifying email: $email with OTP: $otp");
    
    if ($otpManager->verifyOTP($email, $otp, 'verification')) {
        // Update user as verified
        $stmt = $pdo->prepare("UPDATE users SET is_verified = 1 WHERE email = ?");
        if ($stmt->execute([$email])) {
            error_log("User verified successfully: $email");
            ob_clean();
            echo json_encode(['success' => true, 'message' => 'Email verified successfully! You can now login.']);
        } else {
            error_log("Failed to update verification status for: $email");
            ob_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to update verification status']);
        }
    } else {
        error_log("OTP verification failed for: $email with OTP: $otp");
        ob_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid or expired OTP. Please request a new code.']);
    }
}

function handleResendVerification($input, $pdo, $emailService, $otpManager) {
    $email = $input['email'] ?? '';
    
    if (empty($email)) {
        ob_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email is required']);
        return;
    }
    
    // Check if user exists and is not already verified
    $stmt = $pdo->prepare("SELECT username, is_verified FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user) {
        ob_clean();
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
        return;
    }
    
    if ($user['is_verified']) {
        ob_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email is already verified']);
        return;
    }
    
    // Generate and send new verification OTP
    $otp = $emailService->generateOTP();
    $otpManager->storeOTP($email, $otp, 'verification');
    
    error_log("Resending verification OTP: $otp for email: $email");
    
    if ($emailService->sendVerificationEmail($email, $user['username'], $otp)) {
        ob_clean();
        echo json_encode([
            'success' => true, 
            'message' => 'New verification code sent to your email',
            'debug_otp' => $otp // Remove this in production
        ]);
    } else {
        ob_clean();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to send verification email']);
    }
}

function handleLogin($input, $pdo, $emailService, $otpManager) {
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    $rememberMe = $input['rememberMe'] ?? false;
    
    if (empty($email) || empty($password)) {
        ob_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing email or password']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if ($user && password_verify($password, $user['password'])) {
            // Check if email verification is required
            if (!$user['is_verified']) {
                ob_clean();
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
            
            // Set session variables
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user_role'] = $user['role'];
            
            // If remember me is checked, set a persistent cookie
            if ($rememberMe) {
                $token = bin2hex(random_bytes(32));
                setcookie('remember_token', $token, time() + 30 * 24 * 60 * 60, '/', '', true, true);
                
                // Store token in database (in a real app)
                // For now, we'll just log it
                error_log("Remember me token set for user: {$user['email']}");
            }
            
            // Check if 2FA is enabled
            if ($user['two_factor_enabled']) {
                $otp = $emailService->generateOTP();
                $otpManager->storeOTP($email, $otp, '2fa', EmailConfig::OTP_2FA_EXPIRY_MINUTES);
                
                if ($emailService->send2FAEmail($email, $user['username'], $otp)) {
                    ob_clean();
                    echo json_encode([
                        'success' => true,
                        'requires2FA' => true,
                        'message' => '2FA code sent to your email',
                        'userId' => $user['id']
                    ]);
                } else {
                    ob_clean();
                    http_response_code(500);
                    echo json_encode(['success' => false, 'message' => 'Failed to send 2FA code']);
                }
            } else {
                // Generate JWT token (simplified for demo)
                $token = base64_encode(json_encode(['userId' => $user['id'], 'exp' => time() + 3600 * 24 * 30])); // 30 days
                
                // Get complete user data with assets, transactions, and positions
                $completeUserData = getUserCompleteData($pdo, $user['id']);
                
                if ($completeUserData) {
                    ob_clean();
                    echo json_encode([
                        'success' => true,
                        'message' => 'Login successful',
                        'token' => $token,
                        'user' => $completeUserData
                    ]);
                } else {
                    ob_clean();
                    http_response_code(500);
                    echo json_encode(['success' => false, 'message' => 'Failed to load user data']);
                }
            }
        } else {
            ob_clean();
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        }
    } catch (Exception $e) {
        error_log("Login error: " . $e->getMessage());
        ob_clean();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Login failed: ' . $e->getMessage()]);
    }
}

function handleForgotPassword($input, $pdo, $emailService, $otpManager) {
    $email = $input['email'] ?? '';
    
    if (empty($email)) {
        ob_clean();
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
        
        error_log("Password reset OTP generated: $otp for email: $email");
        
        if ($emailService->sendPasswordResetEmail($email, $user['username'], $otp)) {
            ob_clean();
            echo json_encode([
                'success' => true, 
                'message' => 'Password reset code sent to your email',
                'debug_otp' => $otp // Remove this in production
            ]);
        } else {
            ob_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to send reset email']);
        }
    } else {
        // Don't reveal if email exists or not for security
        ob_clean();
        echo json_encode(['success' => true, 'message' => 'If the email exists, a reset code has been sent']);
    }
}

function handleResetPassword($input, $pdo, $otpManager) {
    $email = $input['email'] ?? '';
    $otp = $input['otp'] ?? '';
    $newPassword = $input['newPassword'] ?? '';
    
    if (empty($email) || empty($otp) || empty($newPassword)) {
        ob_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        return;
    }
    
    // Validate password strength
    if (strlen($newPassword) < 6) {
        ob_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters long']);
        return;
    }
    
    error_log("Attempting password reset for email: $email with OTP: $otp");
    
    if ($otpManager->verifyOTP($email, $otp, 'password_reset')) {
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE email = ?");
        
        if ($stmt->execute([$hashedPassword, $email])) {
            error_log("Password reset successful for email: $email");
            ob_clean();
            echo json_encode(['success' => true, 'message' => 'Password reset successfully']);
        } else {
            error_log("Failed to update password in database for email: $email");
            ob_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to update password']);
        }
    } else {
        error_log("OTP verification failed for password reset: email=$email, otp=$otp");
        ob_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid or expired OTP']);
    }
}

function handleVerify2FA($input, $pdo, $otpManager) {
    $email = $input['email'] ?? '';
    $otp = $input['otp'] ?? '';
    $userId = $input['userId'] ?? '';
    
    if (empty($email) || empty($otp) || empty($userId)) {
        ob_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        return;
    }
    
    if ($otpManager->verifyOTP($email, $otp, '2fa')) {
        // Generate JWT token with long expiration for persistence
        $token = base64_encode(json_encode(['userId' => $userId, 'exp' => time() + 3600 * 24 * 30])); // 30 days
        
        // Set session variables
        $_SESSION['user_id'] = $userId;
        $_SESSION['user_email'] = $email;
        
        // Get complete user data with assets, transactions, and positions
        $completeUserData = getUserCompleteData($pdo, $userId);
        
        if ($completeUserData) {
            ob_clean();
            echo json_encode([
                'success' => true,
                'message' => '2FA verification successful',
                'token' => $token,
                'user' => $completeUserData
            ]);
        } else {
            ob_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to load user data']);
        }
    } else {
        ob_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid or expired 2FA code']);
    }
}

function handleToggle2FA($input, $pdo, $emailService, $otpManager) {
    $userId = $input['userId'] ?? '';
    $enable = $input['enable'] ?? false;
    
    if (empty($userId)) {
        ob_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'User ID is required']);
        return;
    }
    
    $stmt = $pdo->prepare("SELECT email, username FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    if (!$user) {
        ob_clean();
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
        return;
    }
    
    if ($enable) {
        // Send verification code before enabling 2FA
        $otp = $emailService->generateOTP();
        $otpManager->storeOTP($user['email'], $otp, '2fa_setup', EmailConfig::OTP_2FA_EXPIRY_MINUTES);
        
        if ($emailService->send2FAEmail($user['email'], $user['username'], $otp)) {
            ob_clean();
            echo json_encode([
                'success' => true,
                'message' => '2FA setup code sent to your email',
                'requiresVerification' => true
            ]);
        } else {
            ob_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to send 2FA setup code']);
        }
    } else {
        // Disable 2FA
        $stmt = $pdo->prepare("UPDATE users SET two_factor_enabled = 0 WHERE id = ?");
        if ($stmt->execute([$userId])) {
            ob_clean();
            echo json_encode(['success' => true, 'message' => '2FA disabled successfully']);
        } else {
            ob_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to disable 2FA']);
        }
    }
}

function handleUpdateUsername($input, $pdo) {
    $userId = $input['userId'] ?? '';
    $newUsername = $input['newUsername'] ?? '';
    
    if (empty($userId) || empty($newUsername)) {
        ob_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'User ID and new username are required']);
        return;
    }
    
    // Validate username
    if (strlen($newUsername) < 3) {
        ob_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Username must be at least 3 characters long']);
        return;
    }
    
    try {
        // Check if username already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
        $stmt->execute([$newUsername, $userId]);
        if ($stmt->fetch()) {
            ob_clean();
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Username already taken']);
            return;
        }
        
        // Update username
        $stmt = $pdo->prepare("UPDATE users SET username = ? WHERE id = ?");
        if ($stmt->execute([$newUsername, $userId])) {
            ob_clean();
            echo json_encode(['success' => true, 'message' => 'Username updated successfully']);
        } else {
            ob_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to update username']);
        }
    } catch (Exception $e) {
        error_log("Update username error: " . $e->getMessage());
        ob_clean();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update username']);
    }
}

function handleChangePassword($input, $pdo) {
    $userId = $input['userId'] ?? '';
    $currentPassword = $input['currentPassword'] ?? '';
    $newPassword = $input['newPassword'] ?? '';
    
    if (empty($userId) || empty($currentPassword) || empty($newPassword)) {
        ob_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        return;
    }
    
    // Validate new password
    if (strlen($newPassword) < 6) {
        ob_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'New password must be at least 6 characters long']);
        return;
    }
    
    try {
        // Get current user data
        $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            ob_clean();
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'User not found']);
            return;
        }
        
        // Verify current password
        if (!password_verify($currentPassword, $user['password'])) {
            ob_clean();
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Current password is incorrect']);
            return;
        }
        
        // Update password
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
        
        if ($stmt->execute([$hashedPassword, $userId])) {
            ob_clean();
            echo json_encode(['success' => true, 'message' => 'Password changed successfully']);
        } else {
            ob_clean();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to change password']);
        }
    } catch (Exception $e) {
        error_log("Change password error: " . $e->getMessage());
        ob_clean();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to change password']);
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

function generateJWT($userId, $expiresIn = 86400) {
    $issuedAt = time();
    $expiresAt = $issuedAt + $expiresIn;
    
    $payload = [
        'userId' => $userId,
        'iat' => $issuedAt,
        'exp' => $expiresAt
    ];
    
    // Simple base64 encoding (not a real JWT, but similar structure)
    $header = base64_encode(json_encode(['alg' => 'none', 'typ' => 'JWT']));
    $encodedPayload = base64_encode(json_encode($payload));
    $signature = base64_encode('signature'); // Not a real signature
    
    return "$header.$encodedPayload.$signature";
}
?>