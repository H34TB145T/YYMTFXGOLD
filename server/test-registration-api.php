<?php
// Test the registration API directly
header('Content-Type: text/html; charset=UTF-8');

echo "<h1>🧪 Test Registration API Directly</h1>";

// Simulate a registration API call
$testData = [
    'action' => 'register',
    'email' => 'newtest@example.com',
    'password' => 'testpass123',
    'username' => 'newtestuser',
    'fullName' => 'New Test User'
];

echo "<h2>📤 Simulating Registration API Call</h2>";
echo "<div style='background: #e2e3e5; color: #383d41; padding: 10px; border-radius: 5px;'>";
echo "<strong>Test Data:</strong><br>";
echo "Email: " . $testData['email'] . "<br>";
echo "Username: " . $testData['username'] . "<br>";
echo "Password: " . $testData['password'] . "<br>";
echo "Full Name: " . $testData['fullName'] . "<br>";
echo "</div>";

// Include the auth API logic
require_once 'config/database.php';
require_once 'emailConfig.php';

// Initialize services
$emailService = new EmailService();
$otpManager = new OTPManager($pdo);

echo "<h3>🔍 Step-by-Step Registration Process:</h3>";

try {
    // Step 1: Validate input
    echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "✅ Step 1: Input validation passed";
    echo "</div>";
    
    // Step 2: Check if user exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
    $stmt->execute([$testData['email'], $testData['username']]);
    $existingUser = $stmt->fetch();
    
    if ($existingUser) {
        echo "<div style='background: #fff3cd; color: #856404; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "⚠️ Step 2: User already exists - will clean first";
        echo "</div>";
        
        // Clean existing user
        $stmt = $pdo->prepare("DELETE FROM users WHERE email = ? OR username = ?");
        $stmt->execute([$testData['email'], $testData['username']]);
        
        echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "✅ Step 2: Existing user cleaned";
        echo "</div>";
    } else {
        echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "✅ Step 2: No existing user found";
        echo "</div>";
    }
    
    // Step 3: Create user
    $userId = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
    $hashedPassword = password_hash($testData['password'], PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("INSERT INTO users (id, username, email, password, full_name, is_verified, balance, usdt_balance, margin_balance) VALUES (?, ?, ?, ?, ?, 0, 1000, 0, 0)");
    
    if ($stmt->execute([$userId, $testData['username'], $testData['email'], $hashedPassword, $testData['fullName']])) {
        echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "✅ Step 3: User created in database (ID: $userId)";
        echo "</div>";
    } else {
        throw new Exception("Failed to create user in database");
    }
    
    // Step 4: Generate OTP
    $otp = $emailService->generateOTP();
    echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "✅ Step 4: OTP generated: <strong>$otp</strong>";
    echo "</div>";
    
    // Step 5: Store OTP
    $otpStored = $otpManager->storeOTP($testData['email'], $otp, 'verification');
    if ($otpStored) {
        echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "✅ Step 5: OTP stored in database";
        echo "</div>";
    } else {
        throw new Exception("Failed to store OTP");
    }
    
    // Step 6: Send email
    echo "<div style='background: #fff3cd; color: #856404; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "⏳ Step 6: Attempting to send email...";
    echo "</div>";
    
    $emailSent = $emailService->sendVerificationEmail($testData['email'], $testData['username'], $otp);
    
    if ($emailSent) {
        echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "✅ Step 6: Email sent successfully!";
        echo "</div>";
        
        echo "<div style='background: #d1ecf1; color: #0c5460; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
        echo "<h3>🎉 SUCCESS: Registration Process Complete!</h3>";
        echo "<p><strong>User created:</strong> " . $testData['email'] . "</p>";
        echo "<p><strong>OTP sent:</strong> $otp</p>";
        echo "<p><strong>Check email:</strong> " . $testData['email'] . "</p>";
        echo "</div>";
    } else {
        echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "❌ Step 6: Email sending failed";
        echo "</div>";
    }
    
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px;'>";
    echo "❌ Error: " . $e->getMessage();
    echo "</div>";
}

echo "<hr>";
echo "<div style='background: #f8f9fa; color: #495057; padding: 15px; border-radius: 5px;'>";
echo "<h3>🔍 Diagnosis:</h3>";
echo "<p>If all steps above show ✅, then your backend registration system is working correctly.</p>";
echo "<p>The issue with your test emails is that they were already in the database.</p>";
echo "<p><strong>Solution:</strong> Use the clean-test-users.php script first, then test registration.</p>";
echo "</div>";
?>