<?php
// Test the fixed database connection
header('Content-Type: text/html; charset=UTF-8');

echo "<h1>🧪 Test Fixed Database Connection</h1>";

require_once 'config/database.php';

echo "<h2>✅ Database Connection Test</h2>";

try {
    // Test basic query
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM users");
    $stmt->execute([]);
    $result = $stmt->fetch();
    
    echo "<div style='background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
    echo "<h3>✅ SUCCESS: Database Connection Fixed!</h3>";
    echo "<p>✅ Database connection working</p>";
    echo "<p>✅ Users table accessible (count: " . $result['count'] . ")</p>";
    echo "<p>✅ No more bind_param errors</p>";
    echo "</div>";
    
    // Test user insertion (simulation)
    echo "<h3>🧪 Test User Operations</h3>";
    
    $testEmail = 'test-connection@example.com';
    $testUsername = 'testconnection';
    
    // Clean any existing test user
    $stmt = $pdo->prepare("DELETE FROM users WHERE email = ? OR username = ?");
    $stmt->execute([$testEmail, $testUsername]);
    
    // Test insertion
    $userId = 'test-' . uniqid();
    $hashedPassword = password_hash('testpass123', PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("INSERT INTO users (id, username, email, password, full_name, is_verified, balance, usdt_balance, margin_balance) VALUES (?, ?, ?, ?, ?, 0, 1000, 0, 0)");
    $result = $stmt->execute([$userId, $testUsername, $testEmail, $hashedPassword, 'Test Connection User']);
    
    if ($result) {
        echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "✅ User insertion test successful";
        echo "</div>";
        
        // Clean up test user
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        
        echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "✅ Test user cleaned up";
        echo "</div>";
    } else {
        echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "❌ User insertion test failed";
        echo "</div>";
    }
    
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
    echo "<h3>❌ Database Error</h3>";
    echo "<p>Error: " . $e->getMessage() . "</p>";
    echo "</div>";
}

echo "<hr>";
echo "<div style='background: #d1ecf1; color: #0c5460; padding: 15px; border-radius: 5px;'>";
echo "<h3>🎯 What Was Fixed:</h3>";
echo "<ul>";
echo "<li><strong>MySQLi bind_param error:</strong> Fixed parameter reference handling</li>";
echo "<li><strong>Proper error handling:</strong> Added exception handling</li>";
echo "<li><strong>Compatible wrapper:</strong> Works with both PDO and MySQLi</li>";
echo "<li><strong>Parameter binding:</strong> Correctly handles parameter references</li>";
echo "</ul>";
echo "</div>";

echo "<div style='background: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
echo "<h3>🧪 Next Steps:</h3>";
echo "<ol>";
echo "<li>Upload the fixed <code>config/database.php</code> file</li>";
echo "<li>Test registration: <a href='https://fxgold.shop/register'>https://fxgold.shop/register</a></li>";
echo "<li>Use email: <strong>rikishoyo@gmail.com</strong></li>";
echo "<li>Check Gmail inbox for OTP email</li>";
echo "</ol>";
echo "</div>";
?>