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
ini_set('session.use_strict_mode', 1);
ini_set('session.use_cookies', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.cookie_samesite', 'Strict');

// Start session for all requests
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

// Check if this is a session check request
if ($method === 'GET' && isset($_GET['check_session'])) {
    if (isset($_SESSION['user_id'])) {
        $userId = $_SESSION['user_id'];
        $userData = getUserCompleteData($pdo, $userId);
        
        if ($userData) {
            ob_clean();
            echo json_encode([
                'success' => true,
                'message' => 'Session active',
                'user' => $userData
            ]);
        } else {
            // Try to restore session from remember token
            $rememberToken = getRememberTokenFromCookie();
            if ($rememberToken) {
                $userId = validateRememberToken($pdo, $rememberToken);
                if ($userId) {
                    // Valid remember token, restore session
                    $_SESSION['user_id'] = $userId;
                    $_SESSION['user_email'] = getUserEmailById($pdo, $userId);
                    
                    $userData = getUserCompleteData($pdo, $userId);
                    if ($userData) {
                        ob_clean();
                        echo json_encode([
                            'success' => true,
                            'message' => 'Session restored from remember token',
                            'user' => $userData
                        ]);
                        exit;
                    }
                }
            }
            
            // Invalid session
            ob_clean();
            session_destroy();
            echo json_encode(['success' => false, 'message' => 'Invalid session']);
        }
    } else {
        // Try to restore session from remember token
        $rememberToken = getRememberTokenFromCookie();
        if ($rememberToken) {
            $userId = validateRememberToken($pdo, $rememberToken);
            if ($userId) {
                // Valid remember token, restore session
                $_SESSION['user_id'] = $userId;
                $_SESSION['user_email'] = getUserEmailById($pdo, $userId);
                
                $userData = getUserCompleteData($pdo, $userId);
                if ($userData) {
                    ob_clean();
                    echo json_encode([
                        'success' => true,
                        'message' => 'Session restored from remember token',
                        'user' => $userData
                    ]);
                    exit;
                }
            }
        }
        
        ob_clean();
        echo json_encode(['success' => false, 'message' => 'No active session']);
    }
    exit;
}

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

// Rate limiting for sensitive endpoints
if (in_array($input['action'] ?? '', ['login', 'forgot_password'])) {
    $ip = $_SERVER['REMOTE_ADDR'];
    $action = $input['action'];
    
    if (isRateLimited($pdo, $ip, $action)) {
        ob_clean();
        http_response_code(429);
        echo json_encode(['success' => false, 'message' => 'Too many attempts. Please try again later.']);
        exit;
    }
    
    // Record this attempt
    recordAttempt($pdo, $ip, $action);
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
                
            case 'logout':
                handleLogout($pdo);
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

// Rate limiting functions
function isRateLimited($pdo, $ip, $action) {
    try {
        // Check if IP has too many attempts in the last hour
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM login_attempts WHERE ip_address = ? AND action = ? AND attempt_time > DATE_SUB(NOW(), INTERVAL 1 HOUR)");
        $stmt->execute([$ip, $action]);
        $count = $stmt->fetchColumn();
        
        $limit = ($action === 'login') ? 10 : 5; // 10 login attempts, 5 password reset attempts per hour
        return $count >= $limit;
    } catch (Exception $e) {
        error_log("Rate limiting error: " . $e->getMessage());
        return false; // Don't block on error
    }
}

function recordAttempt($pdo, $ip, $action) {
    try {
        // Create table if not exists
        $pdo->exec("CREATE TABLE IF NOT EXISTS login_attempts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ip_address VARCHAR(45) NOT NULL,
            action VARCHAR(20) NOT NULL,
            attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX (ip_address, action, attempt_time)
        )");
        
        // Record this attempt
        $stmt = $pdo->prepare("INSERT INTO login_attempts (ip_address, action) VALUES (?, ?)");
        $stmt->execute([$ip, $action]);
    } catch (Exception $e) {
        error_log("Record attempt error: " . $e->getMessage());
    }
}

// Remember token functions
function createRememberToken($pdo, $userId, $expiresInDays = 30) {
    try {
        // Create table if not exists
        $pdo->exec("CREATE TABLE IF NOT EXISTS remember_tokens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(36) NOT NULL,
            token VARCHAR(255) NOT NULL,
            selector VARCHAR(16) NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX (user_id),
            INDEX (selector),
            INDEX (expires_at),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )");
        
        // Generate a secure token
        $selector = bin2hex(random_bytes(8));
        $validator = bin2hex(random_bytes(32));
        
        // Store hashed token in database
        $hashedValidator = password_hash($validator, PASSWORD_DEFAULT);
        $expiresAt = date('Y-m-d H:i:s', time() + (86400 * $expiresInDays));
        
        // Remove any existing tokens for this user
        $stmt = $pdo->prepare("DELETE FROM remember_tokens WHERE user_id = ?");
        $stmt->execute([$userId]);
        
        // Insert new token
        $stmt = $pdo->prepare("INSERT INTO remember_tokens (user_id, token, selector, expires_at) VALUES (?, ?, ?, ?)");
        $stmt->execute([$userId, $hashedValidator, $selector, $expiresAt]);
        
        // Return the token to be stored in cookie
        return $selector . ':' . $validator;
    } catch (Exception $e) {
        error_log("Create remember token error: " . $e->getMessage());
        return null;
    }
}

function validateRememberToken($pdo, $tokenCookie) {
    try {
        // Split the cookie value
        $parts = explode(':', $tokenCookie);
        if (count($parts) !== 2) {
            return null;
        }
        
        list($selector, $validator) = $parts;
        
        // Find token in database
        $stmt = $pdo->prepare("SELECT user_id, token, expires_at FROM remember_tokens WHERE selector = ? AND expires_at > NOW()");
        $stmt->execute([$selector]);
        $token = $stmt->fetch();
        
        if (!$token) {
            return null;
        }
        
        // Verify the validator
        if (password_verify($validator, $token['token'])) {
            // Token is valid, return user ID
            return $token['user_id'];
        }
        
        return null;
    } catch (Exception $e) {
        error_log("Validate remember token error: " . $e->getMessage());
        return null;
    }
}

function getRememberTokenFromCookie() {
    return isset($_COOKIE['remember_token']) ? $_COOKIE['remember_token'] : null;
}

function clearRememberToken($pdo, $userId) {
    try {
        // Remove token from database
        $stmt = $pdo->prepare("DELETE FROM remember_tokens WHERE user_id = ?");
        $stmt->execute([$userId]);
        
        // Clear cookie
        setcookie('remember_token', '', time() - 3600, '/', '', true, true);
    } catch (Exception $e) {
        error_log("Clear remember token error: " . $e->getMessage());
    }
}

function getUserEmailById($pdo, $userId) {
    try {
        $stmt = $pdo->prepare("SELECT email FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $result = $stmt->fetch();
        return $result ? $result['email'] : null;
    } catch (Exception $e) {
        error_log("Get user email error: " . $e->getMessage());
        return null;
    }
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
                $token = createRememberToken($pdo, $user['id']);
                if ($token) {
                    // Set secure cookie with 30 day expiration
                    setcookie(
                        'remember_token',
                        $token,
                        [
                            'expires' => time() + (86400 * 30),
                            'path' => '/',
                            'domain' => '',
                            'secure' => true,
                            'httponly' => true,
                            'samesite' => 'Strict'
                        ]
                    );
                    error_log("Remember me token set for user: {$user['email']}");
                }
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

function handleLogout($pdo) {
    // Clear PHP session
    session_unset();
    session_destroy();
    
    // Clear remember token if exists
    if (isset($_SESSION['user_id'])) {
        clearRememberToken($pdo, $_SESSION['user_id']);
    }
    
    // Clear remember token cookie
    setcookie('remember_token', '', time() - 3600, '/', '', true, true);
    
    ob_clean();
    echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
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
            
            // Get user ID
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            
            if ($user) {
                // Clear any remember tokens for this user
                clearRememberToken($pdo, $user['id']);
            }
            
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
    $rememberMe = $input['rememberMe'] ?? false;
    
    if (empty($email) || empty($otp) || empty($userId)) {
        ob_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        return;
    }
    
    if ($otpManager->verifyOTP($email, $otp, '2fa')) {
        // Set session variables
        $_SESSION['user_id'] = $userId;
        $_SESSION['user_email'] = $email;
        
        // Get user role
        $stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        if ($user) {
            $_SESSION['user_role'] = $user['role'];
        }
        
        // If remember me is checked, set a persistent cookie
        if ($rememberMe) {
            $token = createRememberToken($pdo, $userId);
            if ($token) {
                // Set secure cookie with 30 day expiration
                setcookie(
                    'remember_token',
                    $token,
                    [
                        'expires' => time() + (86400 * 30),
                        'path' => '/',
                        'domain' => '',
                        'secure' => true,
                        'httponly' => true,
                        'samesite' => 'Strict'
                    ]
                );
                error_log("Remember me token set after 2FA for user ID: $userId");
            }
        }
        
        // Generate JWT token with long expiration for persistence
        $token = base64_encode(json_encode(['userId' => $userId, 'exp' => time() + 3600 * 24 * 30])); // 30 days
        
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
            // Clear any remember tokens for this user
            clearRememberToken($pdo, $userId);
            
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

// Cleanup expired tokens (run this periodically via cron)
function cleanupExpiredTokens($pdo) {
    try {
        // Delete expired remember tokens
        $stmt = $pdo->prepare("DELETE FROM remember_tokens WHERE expires_at < NOW()");
        $stmt->execute();
        
        // Delete expired OTP codes
        $stmt = $pdo->prepare("DELETE FROM otp_codes WHERE expires_at < NOW()");
        $stmt->execute();
        
        // Delete old login attempts (older than 24 hours)
        $stmt = $pdo->prepare("DELETE FROM login_attempts WHERE attempt_time < DATE_SUB(NOW(), INTERVAL 24 HOUR)");
        $stmt->execute();
        
        return true;
    } catch (Exception $e) {
        error_log("Cleanup error: " . $e->getMessage());
        return false;
    }
}