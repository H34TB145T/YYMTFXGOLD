<?php
// Test email verification system
header('Content-Type: text/html; charset=UTF-8');

echo "<h1>🧪 Test Email Verification System</h1>";

require_once 'config/database.php';
require_once 'emailConfig.php';

$emailService = new EmailService();
$otpManager = new OTPManager($pdo);

// Test email
$testEmail = 'test@example.com';

echo "<h2>📧 Testing Email Verification</h2>";

// Step 1: Generate and store OTP
$otp = $emailService->generateOTP();
echo "<p><strong>Generated OTP:</strong> $otp</p>";

$stored = $otpManager->storeOTP($testEmail, $otp, 'verification');
if ($stored) {
    echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "✅ OTP stored successfully in database";
    echo "</div>";
} else {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "❌ Failed to store OTP in database";
    echo "</div>";
}

// Step 2: Test email sending
echo "<h3>📨 Testing Email Sending</h3>";
$emailSent = $emailService->sendVerificationEmail($testEmail, 'Test User', $otp);

if ($emailSent) {
    echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "✅ Email sent successfully!";
    echo "</div>";
} else {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "❌ Failed to send email";
    echo "</div>";
}

// Step 3: Test OTP verification
echo "<h3>🔍 Testing OTP Verification</h3>";
$verified = $otpManager->verifyOTP($testEmail, $otp, 'verification');

if ($verified) {
    echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "✅ OTP verification successful!";
    echo "</div>";
} else {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "❌ OTP verification failed";
    echo "</div>";
}

// Step 4: Check database state
echo "<h3>🗄️ Database State Check</h3>";
try {
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM otp_codes WHERE email = ?");
    $stmt->execute([$testEmail]);
    $result = $stmt->fetch();
    
    echo "<div style='background: #e2e3e5; color: #383d41; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "📊 OTP codes in database for $testEmail: " . $result['count'];
    echo "</div>";
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "❌ Database error: " . $e->getMessage();
    echo "</div>";
}

echo "<hr>";
echo "<div style='background: #d1ecf1; color: #0c5460; padding: 15px; border-radius: 5px;'>";
echo "<h3>🎯 Summary</h3>";
echo "<p>This test verifies the complete email verification flow:</p>";
echo "<ul>";
echo "<li>✅ OTP generation</li>";
echo "<li>✅ Database storage</li>";
echo "<li>✅ Email sending</li>";
echo "<li>✅ OTP verification</li>";
echo "</ul>";
echo "</div>";
?>