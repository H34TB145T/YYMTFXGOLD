<?php
// Debug OTP verification process
header('Content-Type: text/html; charset=UTF-8');

echo "<h1>🔍 Debug OTP Verification Process</h1>";

require_once 'config/database.php';
require_once 'emailConfig.php';

$emailService = new EmailService();
$otpManager = new OTPManager($pdo);

// Test email and OTP
$testEmail = 'yeminthanriki@gmail.com';
$testOTP = '123456'; // Use a known OTP for testing

echo "<h2>📧 Test Data</h2>";
echo "<div style='background: #e2e3e5; color: #383d41; padding: 10px; border-radius: 5px;'>";
echo "<strong>Test Email:</strong> $testEmail<br>";
echo "<strong>Test OTP:</strong> $testOTP<br>";
echo "</div>";

echo "<h2>🗄️ Step 1: Check Current OTP Codes in Database</h2>";
try {
    $stmt = $pdo->prepare("SELECT * FROM otp_codes WHERE email = ? ORDER BY created_at DESC");
    $stmt->execute([$testEmail]);
    $otpCodes = $stmt->fetchAll();
    
    if ($otpCodes) {
        echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "<strong>✅ Found " . count($otpCodes) . " OTP codes for $testEmail:</strong><br>";
        foreach ($otpCodes as $code) {
            $isExpired = strtotime($code['expires_at']) < time() ? '❌ EXPIRED' : '✅ VALID';
            echo "- OTP: <strong>{$code['otp']}</strong> | Type: {$code['type']} | Expires: {$code['expires_at']} | Status: $isExpired<br>";
        }
        echo "</div>";
    } else {
        echo "<div style='background: #fff3cd; color: #856404; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "⚠️ No OTP codes found for $testEmail";
        echo "</div>";
    }
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px;'>";
    echo "❌ Database error: " . $e->getMessage();
    echo "</div>";
}

echo "<h2>🔧 Step 2: Generate and Store New OTP</h2>";
try {
    $newOTP = $emailService->generateOTP();
    $stored = $otpManager->storeOTP($testEmail, $newOTP, 'verification');
    
    if ($stored) {
        echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "✅ New OTP generated and stored: <strong>$newOTP</strong>";
        echo "</div>";
        
        // Verify the stored OTP immediately
        echo "<h3>🧪 Step 2.1: Immediate Verification Test</h3>";
        $verified = $otpManager->verifyOTP($testEmail, $newOTP, 'verification');
        
        if ($verified) {
            echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
            echo "✅ OTP verification successful with new OTP: $newOTP";
            echo "</div>";
        } else {
            echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
            echo "❌ OTP verification failed with new OTP: $newOTP";
            echo "</div>";
        }
    } else {
        echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "❌ Failed to store new OTP";
        echo "</div>";
    }
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px;'>";
    echo "❌ OTP generation error: " . $e->getMessage();
    echo "</div>";
}

echo "<h2>🔍 Step 3: Check Database After Verification</h2>";
try {
    $stmt = $pdo->prepare("SELECT * FROM otp_codes WHERE email = ? ORDER BY created_at DESC");
    $stmt->execute([$testEmail]);
    $otpCodesAfter = $stmt->fetchAll();
    
    if ($otpCodesAfter) {
        echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "<strong>✅ Found " . count($otpCodesAfter) . " OTP codes after verification:</strong><br>";
        foreach ($otpCodesAfter as $code) {
            $isExpired = strtotime($code['expires_at']) < time() ? '❌ EXPIRED' : '✅ VALID';
            echo "- OTP: <strong>{$code['otp']}</strong> | Type: {$code['type']} | Expires: {$code['expires_at']} | Status: $isExpired<br>";
        }
        echo "</div>";
    } else {
        echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "✅ No OTP codes found (correctly deleted after verification)";
        echo "</div>";
    }
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px;'>";
    echo "❌ Database error: " . $e->getMessage();
    echo "</div>";
}

echo "<h2>🧪 Step 4: Test API Verification Process</h2>";
echo "<div style='background: #d1ecf1; color: #0c5460; padding: 15px; border-radius: 5px;'>";
echo "<h3>🔍 To test the full API process:</h3>";
echo "<ol>";
echo "<li><strong>Register a new user</strong> at: <a href='https://fxgold.shop/register'>https://fxgold.shop/register</a></li>";
echo "<li><strong>Check your Gmail inbox</strong> for the OTP code</li>";
echo "<li><strong>Copy the exact OTP</strong> from the email</li>";
echo "<li><strong>Enter it in the verification page</strong></li>";
echo "<li><strong>Check browser F12 → Network tab</strong> for API responses</li>";
echo "</ol>";
echo "</div>";

echo "<h2>🔧 Step 5: Manual OTP Storage for Testing</h2>";
echo "<div style='background: #fff3cd; color: #856404; padding: 15px; border-radius: 5px;'>";
echo "<h3>📝 For immediate testing:</h3>";
echo "<p>I'll store a known OTP that you can use for testing:</p>";

try {
    $knownOTP = '999888';
    $stored = $otpManager->storeOTP($testEmail, $knownOTP, 'verification');
    
    if ($stored) {
        echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 10px 0;'>";
        echo "<strong>✅ Test OTP stored successfully!</strong><br>";
        echo "<strong>Email:</strong> $testEmail<br>";
        echo "<strong>OTP:</strong> $knownOTP<br>";
        echo "<strong>Type:</strong> verification<br>";
        echo "<strong>Valid for:</strong> 10 minutes<br>";
        echo "</div>";
        
        echo "<div style='background: #e2e3e5; color: #383d41; padding: 10px; border-radius: 5px; margin: 10px 0;'>";
        echo "<strong>🧪 Test Instructions:</strong><br>";
        echo "1. Go to: <a href='https://fxgold.shop/verify-email?email=" . urlencode($testEmail) . "'>Verification Page</a><br>";
        echo "2. Enter OTP: <strong>$knownOTP</strong><br>";
        echo "3. Click 'Verify Email'<br>";
        echo "4. Should work successfully!<br>";
        echo "</div>";
    } else {
        echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px;'>";
        echo "❌ Failed to store test OTP";
        echo "</div>";
    }
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px;'>";
    echo "❌ Test OTP storage error: " . $e->getMessage();
    echo "</div>";
}

echo "<hr>";
echo "<div style='background: #f8f9fa; color: #495057; padding: 15px; border-radius: 5px;'>";
echo "<h3>🎯 Summary</h3>";
echo "<p>This debug script helps identify OTP verification issues by:</p>";
echo "<ul>";
echo "<li>✅ Checking existing OTP codes in database</li>";
echo "<li>✅ Testing OTP generation and storage</li>";
echo "<li>✅ Testing immediate verification</li>";
echo "<li>✅ Providing a known OTP for testing</li>";
echo "</ul>";
echo "<p><strong>Use the test OTP above to verify the verification process works!</strong></p>";
echo "</div>";
?>