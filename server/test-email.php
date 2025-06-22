<?php
require_once 'vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Test cPanel SMTP settings
$mail = new PHPMailer(true);

try {
    // Enable verbose debug output
    $mail->SMTPDebug = SMTP::DEBUG_SERVER;
    $mail->isSMTP();
    
    // Try different configurations
    echo "<h2>Testing cPanel SMTP Configuration</h2>";
    
    // Configuration 1: SSL on port 465
    echo "<h3>Test 1: SSL on port 465</h3>";
    $mail->Host = 'ps04.zwhhosting.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'support@fxgold.shop';
    $mail->Password = 'FxGoldSupport123!@#'; // Replace with actual password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port = 465;
    
    $mail->setFrom('support@fxgold.shop', 'FxGold Trading Support');
    $mail->addAddress('yeminthanriki@gmail.com'); // Replace with your test email
    $mail->isHTML(true);
    $mail->Subject = 'Test Email from FxGold';
    $mail->Body = 'This is a test email to verify SMTP configuration.';
    
    if ($mail->send()) {
        echo "<p style='color: green;'>✅ Email sent successfully with SSL on port 465!</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ SSL 465 failed: {$mail->ErrorInfo}</p>";
    
    // Try Configuration 2: TLS on port 587
    try {
        echo "<h3>Test 2: TLS on port 587</h3>";
        $mail->clearAddresses();
        $mail->Port = 587;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        
        $mail->addAddress('test@example.com'); // Replace with your test email
        
        if ($mail->send()) {
            echo "<p style='color: green;'>✅ Email sent successfully with TLS on port 587!</p>";
        }
        
    } catch (Exception $e2) {
        echo "<p style='color: red;'>❌ TLS 587 failed: {$mail->ErrorInfo}</p>";
        
        // Try Configuration 3: No encryption on port 25
        try {
            echo "<h3>Test 3: No encryption on port 25</h3>";
            $mail->clearAddresses();
            $mail->Port = 25;
            $mail->SMTPSecure = false;
            $mail->SMTPAuth = false; // Some servers don't require auth on port 25
            
            $mail->addAddress('test@example.com'); // Replace with your test email
            
            if ($mail->send()) {
                echo "<p style='color: green;'>✅ Email sent successfully on port 25!</p>";
            }
            
        } catch (Exception $e3) {
            echo "<p style='color: red;'>❌ Port 25 failed: {$mail->ErrorInfo}</p>";
            echo "<h3>❌ All cPanel SMTP tests failed!</h3>";
            echo "<p><strong>Recommendation:</strong> Use Gmail SMTP instead.</p>";
        }
    }
}
?>