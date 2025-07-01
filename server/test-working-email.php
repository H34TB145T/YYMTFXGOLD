<?php
// Test the updated emailConfig.php with your working configuration

require_once 'emailConfig.php';

echo "<h1>🧪 Testing Updated EmailConfig.php</h1>";

// Test the EmailService class
$emailService = new EmailService();

echo "<h2>✅ Testing EmailService Class</h2>";

// Generate a test OTP
$testOTP = $emailService->generateOTP();
echo "<p><strong>Generated OTP:</strong> $testOTP</p>";

// Test sending verification email
echo "<h3>📧 Testing Verification Email</h3>";

try {
    $result = $emailService->sendVerificationEmail('test@example.com', 'Test User', $testOTP);
    
    if ($result) {
        echo "<div style='background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
        echo "<h3>✅ SUCCESS: Verification Email Sent!</h3>";
        echo "<p>✅ Email sent successfully using updated EmailService!</p>";
        echo "<p>✅ Check your inbox: test@example.com</p>";
        echo "<p>✅ OTP Code: <strong>$testOTP</strong></p>";
        echo "</div>";
    } else {
        echo "<div style='background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
        echo "<h3>❌ Failed to send verification email</h3>";
        echo "</div>";
    }
    
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
    echo "<h3>❌ Exception occurred</h3>";
    echo "<p>Error: " . $e->getMessage() . "</p>";
    echo "</div>";
}

echo "<hr>";
echo "<div style='background: #e2e3e5; color: #383d41; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
echo "<h3>📋 Updated Configuration Summary:</h3>";
echo "<ul>";
echo "<li><strong>📧 Gmail Account:</strong> yeyint.jobs@gmail.com</li>";
echo "<li><strong>🔐 Gmail App Password:</strong> jucfeztwwpwyvvrq</li>";
echo "<li><strong>🌐 Host:</strong> smtp.gmail.com</li>";
echo "<li><strong>🔌 Port:</strong> 465 (SSL/SMTPS)</li>";
echo "<li><strong>🔒 Encryption:</strong> SSL (SMTPS)</li>";
echo "<li><strong>📤 From:</strong> yeyint.jobs@gmail.com (FXGold Support)</li>";
echo "<li><strong>📧 Reply-To:</strong> support@fxgold.shop</li>";
echo "</ul>";
echo "</div>";

echo "<div style='background: #d1ecf1; color: #0c5460; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
echo "<h3>🔍 Key Changes Made:</h3>";
echo "<ul>";
echo "<li><strong>Port changed to 465:</strong> Using SSL instead of TLS</li>";
echo "<li><strong>Encryption changed to SMTPS:</strong> PHPMailer::ENCRYPTION_SMTPS</li>";
echo "<li><strong>Configuration matches your working test exactly</strong></li>";
echo "<li><strong>Professional email branding:</strong> FXGold Support</li>";
echo "<li><strong>Reply-To set to support@fxgold.shop</strong></li>";
echo "</ul>";
echo "</div>";
?>