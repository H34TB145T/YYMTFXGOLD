<?php
// Debug email error - Check what's causing the 500 error
header('Content-Type: text/html; charset=UTF-8');

echo "<h1>🔍 Debug Email Error - 500 Internal Server Error</h1>";

// Test 1: Check if files exist
echo "<h2>📁 Step 1: Check File Existence</h2>";

$files = [
    'config/database.php',
    'emailConfig.php',
    'vendor/autoload.php'
];

foreach ($files as $file) {
    if (file_exists($file)) {
        echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "✅ File exists: $file";
        echo "</div>";
    } else {
        echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "❌ File missing: $file";
        echo "</div>";
    }
}

// Test 2: Check database connection
echo "<h2>🗄️ Step 2: Test Database Connection</h2>";
try {
    require_once 'config/database.php';
    echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "✅ Database connection successful";
    echo "</div>";
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "❌ Database error: " . $e->getMessage();
    echo "</div>";
}

// Test 3: Check PHPMailer
echo "<h2>📧 Step 3: Test PHPMailer</h2>";
try {
    if (file_exists('vendor/autoload.php')) {
        require_once 'vendor/autoload.php';
        echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "✅ PHPMailer autoload successful";
        echo "</div>";
        
        // Test PHPMailer class
        if (class_exists('PHPMailer\PHPMailer\PHPMailer')) {
            echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
            echo "✅ PHPMailer class available";
            echo "</div>";
        } else {
            echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
            echo "❌ PHPMailer class not found";
            echo "</div>";
        }
    } else {
        echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "❌ PHPMailer not installed - run 'composer install'";
        echo "</div>";
    }
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "❌ PHPMailer error: " . $e->getMessage();
    echo "</div>";
}

// Test 4: Check emailConfig.php
echo "<h2>⚙️ Step 4: Test Email Configuration</h2>";
try {
    require_once 'emailConfig.php';
    echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "✅ EmailConfig loaded successfully";
    echo "</div>";
    
    // Test EmailService class
    if (class_exists('EmailService')) {
        echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "✅ EmailService class available";
        echo "</div>";
        
        // Try to create EmailService instance
        try {
            $emailService = new EmailService();
            echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
            echo "✅ EmailService instance created successfully";
            echo "</div>";
        } catch (Exception $e) {
            echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
            echo "❌ EmailService creation failed: " . $e->getMessage();
            echo "</div>";
        }
    } else {
        echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "❌ EmailService class not found";
        echo "</div>";
    }
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "❌ EmailConfig error: " . $e->getMessage();
    echo "</div>";
}

// Test 5: Check OTP table
echo "<h2>🗃️ Step 5: Test OTP Table</h2>";
try {
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM otp_codes");
    $stmt->execute();
    $result = $stmt->fetch();
    
    echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "✅ OTP table accessible (count: " . $result['count'] . ")";
    echo "</div>";
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "❌ OTP table error: " . $e->getMessage();
    echo "</div>";
}

// Test 6: Simulate API call
echo "<h2>🧪 Step 6: Simulate API Call</h2>";
echo "<div style='background: #e2e3e5; color: #383d41; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
echo "<h3>🔍 To test the API:</h3>";
echo "<ol>";
echo "<li>Open browser F12 → Network tab</li>";
echo "<li>Try to register a user at: <a href='https://fxgold.shop/register'>https://fxgold.shop/register</a></li>";
echo "<li>Check the API response in Network tab</li>";
echo "<li>Look for specific error messages</li>";
echo "</ol>";
echo "</div>";

// Test 7: Check PHP error log
echo "<h2>📋 Step 7: Check PHP Error Log</h2>";
echo "<div style='background: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
echo "<h3>📝 Check Error Logs:</h3>";
echo "<ol>";
echo "<li>Go to cPanel → Error Logs</li>";
echo "<li>Look for recent PHP errors</li>";
echo "<li>Check for specific error messages related to PHPMailer or database</li>";
echo "<li>Share the exact error message for debugging</li>";
echo "</ol>";
echo "</div>";

echo "<hr>";
echo "<div style='background: #d1ecf1; color: #0c5460; padding: 15px; border-radius: 5px;'>";
echo "<h3>🎯 Next Steps:</h3>";
echo "<p>If all tests above show ✅, then the issue might be:</p>";
echo "<ul>";
echo "<li><strong>Missing PHPMailer:</strong> Run 'composer install' in cPanel Terminal</li>";
echo "<li><strong>File permissions:</strong> Check if files have correct permissions</li>";
echo "<li><strong>PHP version:</strong> Ensure PHP 7.4+ is being used</li>";
echo "<li><strong>Memory limit:</strong> Check if PHP memory limit is sufficient</li>";
echo "</ul>";
echo "</div>";
?>