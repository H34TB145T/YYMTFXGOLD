<?php
// Test password reset system
header('Content-Type: text/html; charset=UTF-8');

echo "<h1>🔑 Test Password Reset System</h1>";

require_once 'config/database.php';
require_once 'emailConfig.php';

$emailService = new EmailService();
$otpManager = new OTPManager($pdo);

// Test email
$testEmail = 'test@example.com';
$testPassword = 'newpassword123';

echo "<h2>🔐 Testing Password Reset</h2>";

// Step 1: Generate and store password reset OTP
$otp = $emailService->generateOTP();
echo "<p><strong>Generated Password Reset OTP:</strong> $otp</p>";

$stored = $otpManager->storeOTP($testEmail, $otp, 'password_reset');
if ($stored) {
    echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "✅ Password reset OTP stored successfully";
    echo "</div>";
} else {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "❌ Failed to store password reset OTP";
    echo "</div>";
}

// Step 2: Test password reset email
echo "<h3>📨 Testing Password Reset Email</h3>";
$emailSent = $emailService->sendPasswordResetEmail($testEmail, 'Test User', $otp);

if ($emailSent) {
    echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "✅ Password reset email sent successfully!";
    echo "</div>";
} else {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "❌ Failed to send password reset email";
    echo "</div>";
}

// Step 3: Test OTP verification for password reset
echo "<h3>🔍 Testing Password Reset OTP Verification</h3>";
$verified = $otpManager->verifyOTP($testEmail, $otp, 'password_reset');

if ($verified) {
    echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "✅ Password reset OTP verification successful!";
    echo "</div>";
    
    // Step 4: Test password update in database
    echo "<h3>💾 Testing Password Database Update</h3>";
    try {
        // First, create a test user if not exists
        $userId = 'test-user-' . uniqid();
        $hashedOldPassword = password_hash('oldpassword123', PASSWORD_DEFAULT);
        
        $stmt = $pdo->prepare("INSERT IGNORE INTO users (id, username, email, password, full_name, role, is_verified) VALUES (?, ?, ?, ?, ?, 'user', 1)");
        $stmt->execute([$userId, 'testuser', $testEmail, $hashedOldPassword, 'Test User']);
        
        // Now test password update
        $hashedNewPassword = password_hash($testPassword, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE email = ?");
        $updateResult = $stmt->execute([$hashedNewPassword, $testEmail]);
        
        if ($updateResult) {
            echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
            echo "✅ Password updated successfully in database!";
            echo "</div>";
            
            // Verify the password was actually updated
            $stmt = $pdo->prepare("SELECT password FROM users WHERE email = ?");
            $stmt->execute([$testEmail]);
            $user = $stmt->fetch();
            
            if ($user && password_verify($testPassword, $user['password'])) {
                echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
                echo "✅ Password verification successful - new password works!";
                echo "</div>";
            } else {
                echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
                echo "❌ Password verification failed - new password doesn't work";
                echo "</div>";
            }
        } else {
            echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
            echo "❌ Failed to update password in database";
            echo "</div>";
        }
        
        // Clean up test user
        $stmt = $pdo->prepare("DELETE FROM users WHERE email = ? AND id = ?");
        $stmt->execute([$testEmail, $userId]);
        
    } catch (Exception $e) {
        echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "❌ Database error: " . $e->getMessage();
        echo "</div>";
    }
    
} else {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "❌ Password reset OTP verification failed";
    echo "</div>";
}

echo "<hr>";
echo "<div style='background: #d1ecf1; color: #0c5460; padding: 15px; border-radius: 5px;'>";
echo "<h3>🎯 Password Reset Test Summary</h3>";
echo "<p>This test verifies the complete password reset flow:</p>";
echo "<ul>";
echo "<li>✅ Password reset OTP generation</li>";
echo "<li>✅ Database storage of reset OTP</li>";
echo "<li>✅ Password reset email sending</li>";
echo "<li>✅ OTP verification for password reset</li>";
echo "<li>✅ Password update in database</li>";
echo "<li>✅ New password verification</li>";
echo "</ul>";
echo "</div>";
?>