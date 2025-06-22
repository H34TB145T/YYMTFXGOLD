<?php
// Clean test users from database
header('Content-Type: text/html; charset=UTF-8');

require_once 'config/database.php';

echo "<h1>🧹 Clean Test Users</h1>";

// List of test emails to clean
$testEmails = [
    'rikishoyo@gmail.com',
    'yeminthanriki@gmail.com',
    'test@example.com'
];

echo "<h2>📋 Cleaning Test Users</h2>";

try {
    foreach ($testEmails as $email) {
        // Delete user and related data
        $stmt = $pdo->prepare("DELETE FROM users WHERE email = ?");
        $result = $stmt->execute([$email]);
        
        if ($result) {
            echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
            echo "✅ Cleaned user: $email";
            echo "</div>";
        }
        
        // Clean OTP codes
        $stmt = $pdo->prepare("DELETE FROM otp_codes WHERE email = ?");
        $stmt->execute([$email]);
    }
    
    echo "<div style='background: #d1ecf1; color: #0c5460; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
    echo "<h3>✅ Database Cleaned Successfully!</h3>";
    echo "<p>You can now test registration with these emails:</p>";
    echo "<ul>";
    foreach ($testEmails as $email) {
        echo "<li>$email</li>";
    }
    echo "</ul>";
    echo "</div>";
    
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px;'>";
    echo "❌ Error cleaning database: " . $e->getMessage();
    echo "</div>";
}

echo "<hr>";
echo "<div style='background: #fff3cd; color: #856404; padding: 15px; border-radius: 5px;'>";
echo "<h3>🧪 Next Steps:</h3>";
echo "<ol>";
echo "<li>Go to: <a href='https://fxgold.shop/register'>https://fxgold.shop/register</a></li>";
echo "<li>Try registering with: <strong>rikishoyo@gmail.com</strong></li>";
echo "<li>Open browser F12 → Network tab to see API calls</li>";
echo "<li>Check Gmail inbox for OTP email</li>";
echo "</ol>";
echo "</div>";
?>