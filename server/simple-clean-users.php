<?php
// Simple user cleanup without PDO dependency
header('Content-Type: text/html; charset=UTF-8');

echo "<h1>🧹 Simple Clean Test Users</h1>";

$host = 'localhost';
$dbname = 'zpjhpszw_fxgold';
$username = 'zpjhpszw_fxgold_admin';
$password = 'Fxgold_admin123!@#';

// Test emails to clean
$testEmails = [
    'rikishoyo@gmail.com',
    'yeminthanriki@gmail.com',
    'test@example.com'
];

// Try MySQLi connection (more compatible)
if (extension_loaded('mysqli')) {
    try {
        $mysqli = new mysqli($host, $username, $password, $dbname);
        
        if ($mysqli->connect_error) {
            throw new Exception("Connection failed: " . $mysqli->connect_error);
        }
        
        $mysqli->set_charset("utf8mb4");
        
        echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "✅ MySQLi connection successful";
        echo "</div>";
        
        foreach ($testEmails as $email) {
            // Delete user
            $stmt = $mysqli->prepare("DELETE FROM users WHERE email = ?");
            $stmt->bind_param('s', $email);
            $result = $stmt->execute();
            
            if ($result) {
                echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
                echo "✅ Cleaned user: $email";
                echo "</div>";
            }
            
            // Clean OTP codes
            $stmt = $mysqli->prepare("DELETE FROM otp_codes WHERE email = ?");
            $stmt->bind_param('s', $email);
            $stmt->execute();
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
        
        $mysqli->close();
        
    } catch (Exception $e) {
        echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px;'>";
        echo "❌ MySQLi Error: " . $e->getMessage();
        echo "</div>";
    }
} else {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px;'>";
    echo "❌ MySQLi extension not available";
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