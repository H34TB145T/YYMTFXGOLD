<?php
// Test email configuration with your working settings
require_once 'vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

echo "<h1>🧪 Email Configuration Test</h1>";

// Test Gmail SMTP (Using your working configuration)
echo "<h2>✅ Testing Gmail SMTP</h2>";

$mail = new PHPMailer(true);

try {
    // Gmail SMTP Configuration - EXACT MATCH to your working test
    $mail->SMTPDebug = SMTP::DEBUG_SERVER;
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'yeyint.jobs@gmail.com'; // Your Gmail account
    $mail->Password = 'jucfeztwwpwyvvrq'; // Your Gmail App Password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // Using SMTPS (SSL)
    $mail->Port = 465; // Port 465 for SSL
    
    $mail->setFrom('yeyint.jobs@gmail.com', 'FxGold Trading Support');
    $mail->addAddress('nayyaunglinpromax969@gmail.com'); // Replace with your test email
    $mail->addReplyTo('support@fxgold.shop', 'FxGold Support');
    
    $mail->isHTML(true);
    $mail->Subject = '🔐 FxGold Email Test';
    
    // Generate test OTP
    $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
    
    $mail->Body = '
    <h2>✅ Email Test Successful!</h2>
    <p>This email was sent using your working configuration.</p>
    <p><strong>Test OTP Code:</strong> <span style="font-size: 24px; color: #10b981;">'.$otp.'</span></p>
    <p><strong>Configuration Details:</strong></p>
    <ul>
        <li><strong>Gmail Account:</strong> yeyint.jobs@gmail.com</li>
        <li><strong>Host:</strong> smtp.gmail.com</li>
        <li><strong>Port:</strong> 465 (SSL/SMTPS)</li>
        <li><strong>From:</strong> yeyint.jobs@gmail.com (FxGold Support)</li>
        <li><strong>Reply-To:</strong> support@fxgold.shop</li>
    </ul>
    <p>Your email system is working correctly! 🎉</p>
    ';
    
    if ($mail->send()) {
        echo "<div style='background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
        echo "<h3>✅ SUCCESS: Gmail SMTP Email Sent!</h3>";
        echo "<p>✅ Email sent successfully using Gmail SMTP!</p>";
        echo "<p>✅ Check your inbox: nayyaunglinpromax969@gmail.com</p>";
        echo "<p>✅ Test OTP: $otp</p>";
        echo "<p>✅ Your email system is working perfectly!</p>";
        echo "</div>";
    }
    
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
    echo "<h3>❌ Gmail SMTP Failed</h3>";
    echo "<p>Error: {$mail->ErrorInfo}</p>";
    echo "</div>";
}

echo "<hr>";
echo "<div style='background: #e2e3e5; color: #383d41; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
echo "<h3>📋 Gmail Configuration Summary:</h3>";
echo "<ul>";
echo "<li><strong>📧 Gmail Account:</strong> yeyint.jobs@gmail.com</li>";
echo "<li><strong>🔐 Gmail App Password:</strong> jucfeztwwpwyvvrq</li>";
echo "<li><strong>🌐 Host:</strong> smtp.gmail.com</li>";
echo "<li><strong>🔌 Port:</strong> 465 (SSL)</li>";
echo "<li><strong>🔒 Encryption:</strong> SSL (SMTPS)</li>";
echo "<li><strong>📤 From:</strong> yeyint.jobs@gmail.com (FxGold Support)</li>";
echo "<li><strong>📧 Reply-To:</strong> support@fxgold.shop</li>";
echo "</ul>";
echo "</div>";

echo "<div style='background: #d1ecf1; color: #0c5460; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
echo "<h3>🔍 Next Steps:</h3>";
echo "<ol>";
echo "<li>If the test was successful, your email configuration is working correctly</li>";
echo "<li>The same configuration has been applied to emailConfig.php</li>";
echo "<li>Try registering a new user at <a href='https://fxgold.shop/register'>https://fxgold.shop/register</a></li>";
echo "<li>You should receive a verification email with OTP code</li>";
echo "</ol>";
echo "</div>";
?>