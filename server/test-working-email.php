<?php
require_once 'vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

echo "<h1>🧪 Email Configuration Test</h1>";

// Test Gmail SMTP (Recommended)
echo "<h2>✅ Testing Gmail SMTP (Recommended)</h2>";

$mail = new PHPMailer(true);

try {
    // Gmail SMTP Configuration
    $mail->SMTPDebug = SMTP::DEBUG_SERVER;
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'fxgold.info@gmail.com'; // Your Gmail account
    $mail->Password = 'svlwypaqdqlvvzqz'; // Your Gmail App Password (16 chars, no spaces)
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // Using SSL instead of TLS
    $mail->Port = 465; // Port 465 for SSL
    
    $mail->setFrom('fxgold.info@gmail.com', 'FxGold Trading Support');
    $mail->addAddress('yeminthanriki@gmail.com'); // Replace with your test email
    $mail->addReplyTo('support@fxgold.shop', 'FxGold Support');
    
    $mail->isHTML(true);
    $mail->Subject = '🔐 FxGold Email Test - Gmail SMTP';
    $mail->Body = '
    <h2>✅ Gmail SMTP Test Successful!</h2>
    <p>This email was sent using Gmail SMTP configuration.</p>
    <p><strong>Configuration Details:</strong></p>
    <ul>
        <li><strong>Gmail Account:</strong> fxgold.info@gmail.com</li>
        <li><strong>Gmail Password:</strong> FxGoldSupport123!@# (NOT used for SMTP)</li>
        <li><strong>Gmail App Password:</strong> svlwypaqdqlvvzqz (USED for SMTP)</li>
        <li><strong>Host:</strong> smtp.gmail.com</li>
        <li><strong>Port:</strong> 465 (SSL)</li>
        <li><strong>From:</strong> fxgold.info@gmail.com</li>
        <li><strong>Reply-To:</strong> support@fxgold.shop</li>
    </ul>
    <p>Your email system is working correctly! 🎉</p>
    ';
    
    if ($mail->send()) {
        echo "<div style='background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
        echo "<h3>✅ SUCCESS: Gmail SMTP Email Sent!</h3>";
        echo "<p>✅ Email sent successfully using Gmail SMTP!</p>";
        echo "<p>✅ Check your inbox: yeminthanriki@gmail.com</p>";
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
echo "<li><strong>📧 Gmail Account:</strong> fxgold.info@gmail.com</li>";
echo "<li><strong>🔑 Gmail Password:</strong> FxGoldSupport123!@# (for logging into Gmail)</li>";
echo "<li><strong>🔐 Gmail App Password:</strong> svlwypaqdqlvvzqz (for SMTP authentication)</li>";
echo "<li><strong>📤 From Address:</strong> fxgold.info@gmail.com (professional delivery)</li>";
echo "<li><strong>📧 Reply-To:</strong> support@fxgold.shop (users can reply to your cPanel email)</li>";
echo "<li><strong>🌐 Host:</strong> smtp.gmail.com</li>";
echo "<li><strong>🔌 Port:</strong> 465 (SSL)</li>";
echo "</ul>";
echo "</div>";

echo "<div style='background: #d1ecf1; color: #0c5460; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
echo "<h3>🔍 Important Distinction:</h3>";
echo "<ul>";
echo "<li><strong>Gmail Account Password (FxGoldSupport123!@#):</strong> Used to log into Gmail website/app</li>";
echo "<li><strong>Gmail App Password (svlwypaqdqlvvzqz):</strong> Used for SMTP authentication in applications</li>";
echo "<li><strong>SMTP uses the App Password, NOT the account password!</strong></li>";
echo "</ul>";
echo "</div>";
?>