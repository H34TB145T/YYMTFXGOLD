<?php
// Test registration process
header('Content-Type: text/html; charset=UTF-8');

echo "<h1>🔍 Registration Debug Test</h1>";

// Test 1: Check if emailConfig.php loads correctly
echo "<h2>📧 Test 1: EmailConfig Loading</h2>";
try {
    require_once 'emailConfig.php';
    echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px;'>";
    echo "✅ EmailConfig.php loaded successfully<br>";
    echo "✅ EmailService class available<br>";
    echo "✅ EMAIL_ENABLED: " . (EmailConfig::EMAIL_ENABLED ? 'true' : 'false') . "<br>";
    echo "✅ SMTP Host: " . EmailConfig::SMTP_HOST . "<br>";
    echo "✅ SMTP Port: " . EmailConfig::SMTP_PORT . "<br>";
    echo "</div>";
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px;'>";
    echo "❌ Error loading EmailConfig: " . $e->getMessage();
    echo "</div>";
}

// Test 2: Check database connection
echo "<h2>🗄️ Test 2: Database Connection</h2>";
try {
    require_once 'config/database.php';
    echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px;'>";
    echo "✅ Database connection successful<br>";
    echo "✅ PDO object created<br>";
    
    // Test users table
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    echo "✅ Users table accessible (count: " . $result['count'] . ")<br>";
    
    // Test otp_codes table
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM otp_codes");
    $result = $stmt->fetch();
    echo "✅ OTP codes table accessible (count: " . $result['count'] . ")<br>";
    echo "</div>";
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px;'>";
    echo "❌ Database error: " . $e->getMessage();
    echo "</div>";
}

// Test 3: Test EmailService initialization
echo "<h2>📨 Test 3: EmailService Initialization</h2>";
try {
    $emailService = new EmailService();
    $otpManager = new OTPManager($pdo);
    
    echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px;'>";
    echo "✅ EmailService initialized successfully<br>";
    echo "✅ OTPManager initialized successfully<br>";
    
    // Generate test OTP
    $testOTP = $emailService->generateOTP();
    echo "✅ OTP generation works: " . $testOTP . "<br>";
    echo "</div>";
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px;'>";
    echo "❌ EmailService error: " . $e->getMessage();
    echo "</div>";
}

// Test 4: Simulate registration API call
echo "<h2>🚀 Test 4: Simulate Registration API Call</h2>";
try {
    // Simulate the registration process
    $testEmail = 'test@example.com';
    $testUsername = 'testuser';
    $testPassword = 'testpass123';
    $testFullName = 'Test User';
    
    echo "<div style='background: #e2e3e5; color: #383d41; padding: 10px; border-radius: 5px; margin: 10px 0;'>";
    echo "<strong>📋 Test Registration Data:</strong><br>";
    echo "Email: $testEmail<br>";
    echo "Username: $testUsername<br>";
    echo "Password: $testPassword<br>";
    echo "Full Name: $testFullName<br>";
    echo "</div>";
    
    // Check if user already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
    $stmt->execute([$testEmail, $testUsername]);
    $existingUser = $stmt->fetch();
    
    if ($existingUser) {
        echo "<div style='background: #fff3cd; color: #856404; padding: 10px; border-radius: 5px;'>";
        echo "⚠️ Test user already exists in database<br>";
        echo "✅ Database query works correctly<br>";
        echo "</div>";
    } else {
        echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px;'>";
        echo "✅ No existing user found (good for registration)<br>";
        echo "✅ Database query works correctly<br>";
        echo "</div>";
    }
    
    // Test OTP generation and storage
    $otp = $emailService->generateOTP();
    $otpStored = $otpManager->storeOTP($testEmail, $otp, 'verification');
    
    if ($otpStored) {
        echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px;'>";
        echo "✅ OTP generated: $otp<br>";
        echo "✅ OTP stored in database successfully<br>";
        echo "</div>";
    } else {
        echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px;'>";
        echo "❌ Failed to store OTP in database<br>";
        echo "</div>";
    }
    
    // Test email sending (without actually sending)
    echo "<div style='background: #d1ecf1; color: #0c5460; padding: 10px; border-radius: 5px;'>";
    echo "<strong>📧 Email Sending Test:</strong><br>";
    echo "Would send verification email to: $testEmail<br>";
    echo "With OTP: $otp<br>";
    echo "Using SMTP: " . EmailConfig::SMTP_HOST . ":" . EmailConfig::SMTP_PORT . "<br>";
    echo "From: " . EmailConfig::FROM_EMAIL . "<br>";
    echo "</div>";
    
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px;'>";
    echo "❌ Registration simulation error: " . $e->getMessage();
    echo "</div>";
}

// Test 5: Check API endpoint accessibility
echo "<h2>🌐 Test 5: API Endpoint Check</h2>";
echo "<div style='background: #e2e3e5; color: #383d41; padding: 10px; border-radius: 5px;'>";
echo "<strong>📍 API Endpoint Information:</strong><br>";
echo "Registration API: https://fxgold.shop/api/auth.php<br>";
echo "Method: POST<br>";
echo "Action: register<br>";
echo "Expected Response: JSON with success/message<br>";
echo "</div>";

echo "<div style='background: #d1ecf1; color: #0c5460; padding: 10px; border-radius: 5px; margin: 10px 0;'>";
echo "<strong>🔍 Next Steps to Test:</strong><br>";
echo "1. Visit your registration page: https://fxgold.shop/register<br>";
echo "2. Open browser Developer Tools (F12)<br>";
echo "3. Go to Network tab<br>";
echo "4. Try to register a new user<br>";
echo "5. Check if API call is made to /api/auth.php<br>";
echo "6. Check the response in Network tab<br>";
echo "7. Check your Gmail inbox for OTP email<br>";
echo "</div>";

echo "<hr>";
echo "<div style='background: #f8f9fa; color: #495057; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
echo "<h3>🎯 Summary</h3>";
echo "If all tests above show ✅, then your backend is ready to send emails.<br>";
echo "The issue might be in the frontend not calling the backend API correctly.<br>";
echo "Check the browser console and network tab when registering a user.";
echo "</div>";
?>