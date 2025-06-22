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
    $mail->Username = 'fxgold.info@gmail.com';
    $mail->Password = 'svlwypaqdqlvvzqz'; // App password without spaces
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    
    $mail->setFrom('fxgold.info@gmail.com', 'FxGold Trading Support');
    $mail->addAddress('yeminthanriki@gmail.com'); // Replace with your test email
    $mail->addReplyTo('support@fxgold.shop', 'FxGold Support');
    
    $mail->isHTML(true);
    $mail->Subject = '🔐 FxGold Email Test - Gmail SMTP';
    $mail->Body = '
    <h2>✅ Gmail SMTP Test Successful!</h2>
    <p>This email was sent using Gmail SMTP configuration.</p>
    <p><strong>Configuration:</strong></p>
    <ul>
        <li>Host: smtp.gmail.com</li>
        <li>Port: 587 (TLS)</li>
        <li>From: fxgold.info@gmail.com</li>
        <li>Reply-To: support@fxgold.shop</li>
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

// Test cPanel SMTP (Alternative)
echo "<hr><h2>🔧 Testing cPanel SMTP (Alternative)</h2>";

$mail2 = new PHPMailer(true);

try {
    $mail2->SMTPDebug = SMTP::DEBUG_SERVER;
    $mail2->isSMTP();
    $mail2->Host = 'ps04.zwhhosting.com';
    $mail2->SMTPAuth = true;
    $mail2->Username = 'support@fxgold.shop';
    $mail2->Password = 'FxGoldSupport123!@#'; // Replace with actual password
    $mail2->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail2->Port = 465;
    
    $mail2->setFrom('support@fxgold.shop', 'FxGold Trading Support');
    $mail2->addAddress('yeminthanriki@gmail.com'); // Replace with your test email
    
    $mail2->isHTML(true);
    $mail2->Subject = '🔧 FxGold Email Test - cPanel SMTP';
    $mail2->Body = '
    <h2>🔧 cPanel SMTP Test</h2>
    <p>This email was sent using cPanel SMTP configuration.</p>
    <p><strong>Configuration:</strong></p>
    <ul>
        <li>Host: ps04.zwhhosting.com</li>
        <li>Port: 465 (SSL)</li>
        <li>From: support@fxgold.shop</li>
    </ul>
    ';
    
    if ($mail2->send()) {
        echo "<div style='background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
        echo "<h3>✅ SUCCESS: cPanel SMTP Email Sent!</h3>";
        echo "<p>✅ cPanel SMTP is working!</p>";
        echo "</div>";
    }
    
} catch (Exception $e) {
    echo "<div style='background: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
    echo "<h3>⚠️ cPanel SMTP Failed</h3>";
    echo "<p>Error: {$mail2->ErrorInfo}</p>";
    echo "<p><strong>This is normal if your hosting doesn't support SMTP.</strong></p>";
    echo "</div>";
}

echo "<hr>";
echo "<div style='background: #e2e3e5; color: #383d41; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
echo "<h3>📋 Recommendations:</h3>";
echo "<ul>";
echo "<li><strong>✅ Use Gmail SMTP</strong> - Most reliable and always works</li>";
echo "<li><strong>📧 From Address:</strong> fxgold.info@gmail.com (professional delivery)</li>";
echo "<li><strong>📧 Reply-To:</strong> support@fxgold.shop (users can reply to your cPanel email)</li>";
echo "<li><strong>🔐 App Password:</strong> svlwypaqdqlvvzqz (no spaces)</li>";
echo "</ul>";
echo "</div>";
?>