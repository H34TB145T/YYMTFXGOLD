<?php
// Debug script to identify issues with auth.php
header('Content-Type: text/html; charset=UTF-8');

echo "<h1>🔍 Debug Auth.php 500 Error</h1>";

// Test 1: Check if files exist
echo "<h2>📁 Step 1: Check File Existence</h2>";

$files = [
    'config/database.php',
    'emailConfig.php',
    'vendor/autoload.php',
    'api/auth.php'
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

// Test 2: Check PHP version
echo "<h2>🔧 Step 2: Check PHP Version</h2>";
echo "<div style='background: #d1ecf1; color: #0c5460; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
echo "PHP Version: " . phpversion();
echo "</div>";

// Test 3: Check database connection
echo "<h2>🗄️ Step 3: Test Database Connection</h2>";
try {
    require_once 'config/database.php';
    echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "✅ Database configuration loaded";
    echo "</div>";
    
    // Test if $pdo variable exists and is a PDO object
    if (isset($pdo) && $pdo instanceof PDO) {
        echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "✅ PDO connection established";
        echo "</div>";
        
        // Test a simple query
        try {
            $stmt = $pdo->query("SELECT 1");
            echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
            echo "✅ Database query successful";
            echo "</div>";
        } catch (Exception $e) {
            echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
            echo "❌ Database query error: " . $e->getMessage();
            echo "</div>";
        }
    } else {
        echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "❌ PDO connection not established";
        echo "</div>";
    }
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "❌ Database error: " . $e->getMessage();
    echo "</div>";
}

// Test 4: Check emailConfig.php
echo "<h2>📧 Step 4: Test Email Configuration</h2>";
try {
    require_once 'emailConfig.php';
    echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "✅ Email configuration loaded";
    echo "</div>";
    
    // Check if EmailService class exists
    if (class_exists('EmailService')) {
        echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "✅ EmailService class exists";
        echo "</div>";
        
        // Try to create an instance
        try {
            $emailService = new EmailService();
            echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
            echo "✅ EmailService instance created";
            echo "</div>";
        } catch (Exception $e) {
            echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
            echo "❌ EmailService instantiation error: " . $e->getMessage();
            echo "</div>";
        }
    } else {
        echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "❌ EmailService class not found";
        echo "</div>";
    }
    
    // Check if OTPManager class exists
    if (class_exists('OTPManager')) {
        echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "✅ OTPManager class exists";
        echo "</div>";
        
        // Try to create an instance
        try {
            if (isset($pdo)) {
                $otpManager = new OTPManager($pdo);
                echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
                echo "✅ OTPManager instance created";
                echo "</div>";
            } else {
                echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
                echo "❌ OTPManager not created: PDO not available";
                echo "</div>";
            }
        } catch (Exception $e) {
            echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
            echo "❌ OTPManager instantiation error: " . $e->getMessage();
            echo "</div>";
        }
    } else {
        echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "❌ OTPManager class not found";
        echo "</div>";
    }
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "❌ Email configuration error: " . $e->getMessage();
    echo "</div>";
}

// Test 5: Check PHPMailer
echo "<h2>📨 Step 5: Check PHPMailer</h2>";
try {
    if (file_exists('vendor/autoload.php')) {
        require_once 'vendor/autoload.php';
        echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "✅ Composer autoload exists";
        echo "</div>";
        
        if (class_exists('PHPMailer\\PHPMailer\\PHPMailer')) {
            echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
            echo "✅ PHPMailer class exists";
            echo "</div>";
        } else {
            echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
            echo "❌ PHPMailer class not found. Run 'composer install' to install PHPMailer.";
            echo "</div>";
        }
    } else {
        echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "❌ Composer autoload not found. Run 'composer install' in the root directory.";
        echo "</div>";
    }
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "❌ PHPMailer check error: " . $e->getMessage();
    echo "</div>";
}

// Test 6: Check auth.php content
echo "<h2>📝 Step 6: Check Auth.php Content</h2>";
try {
    $authPath = 'api/auth.php';
    if (file_exists($authPath)) {
        $authContent = file_get_contents($authPath);
        $firstLines = implode("\n", array_slice(explode("\n", $authContent), 0, 20));
        
        echo "<div style='background: #d1ecf1; color: #0c5460; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "<strong>First 20 lines of auth.php:</strong><br>";
        echo "<pre>" . htmlspecialchars($firstLines) . "...</pre>";
        echo "</div>";
        
        // Check for common issues
        $issues = [];
        
        if (strpos($authContent, 'ob_start') === false) {
            $issues[] = "Missing ob_start() at the beginning";
        }
        
        if (strpos($authContent, 'header(\'Content-Type: application/json\')') === false) {
            $issues[] = "Missing Content-Type header";
        }
        
        if (strpos($authContent, 'require_once') === false) {
            $issues[] = "Missing require_once statements for dependencies";
        }
        
        if (!empty($issues)) {
            echo "<div style='background: #fff3cd; color: #856404; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
            echo "<strong>Potential issues in auth.php:</strong><br>";
            echo "<ul>";
            foreach ($issues as $issue) {
                echo "<li>$issue</li>";
            }
            echo "</ul>";
            echo "</div>";
        } else {
            echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
            echo "✅ No obvious issues found in auth.php";
            echo "</div>";
        }
    } else {
        echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "❌ auth.php file not found at $authPath";
        echo "</div>";
    }
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "❌ Error checking auth.php: " . $e->getMessage();
    echo "</div>";
}

// Test 7: Check PHP error log
echo "<h2>📋 Step 7: Check PHP Error Log</h2>";
echo "<div style='background: #fff3cd; color: #856404; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
echo "<strong>How to check PHP error logs:</strong><br>";
echo "1. In cPanel, go to 'Error Log'<br>";
echo "2. Look for recent errors related to auth.php<br>";
echo "3. Common errors might include:<br>";
echo "   - Syntax errors<br>";
echo "   - Missing dependencies<br>";
echo "   - Database connection issues<br>";
echo "   - PHPMailer configuration problems<br>";
echo "</div>";

// Test 8: Test a simple API call
echo "<h2>🧪 Step 8: Test Simple API Call</h2>";
echo "<div style='background: #d1ecf1; color: #0c5460; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
echo "<strong>Test API with curl:</strong><br>";
echo "<pre>curl -X POST -H \"Content-Type: application/json\" -d '{\"action\":\"login\",\"email\":\"test@example.com\",\"password\":\"password\"}' https://fxgold.shop/api/auth.php</pre>";
echo "</div>";

// Test 9: Check for MySQLi vs PDO issues
echo "<h2>🔄 Step 9: Check Database Driver Compatibility</h2>";
try {
    echo "<div style='background: #d1ecf1; color: #0c5460; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "<strong>Available database drivers:</strong><br>";
    
    if (extension_loaded('pdo_mysql')) {
        echo "✅ PDO MySQL extension is available<br>";
    } else {
        echo "❌ PDO MySQL extension is NOT available<br>";
    }
    
    if (extension_loaded('mysqli')) {
        echo "✅ MySQLi extension is available<br>";
    } else {
        echo "❌ MySQLi extension is NOT available<br>";
    }
    
    echo "</div>";
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "❌ Error checking database drivers: " . $e->getMessage();
    echo "</div>";
}

echo "<hr>";
echo "<div style='background: #f8f9fa; color: #495057; padding: 15px; border-radius: 5px;'>";
echo "<h3>🎯 Next Steps:</h3>";
echo "<p>Based on the results above, here are the likely issues:</p>";
echo "<ol>";
echo "<li>Check if PHPMailer is installed correctly (run 'composer install')</li>";
echo "<li>Verify database connection parameters in config/database.php</li>";
echo "<li>Look for syntax errors in auth.php or emailConfig.php</li>";
echo "<li>Check PHP error logs for specific error messages</li>";
echo "<li>Ensure proper file paths in require_once statements</li>";
echo "<li>Verify that the database tables exist and have the correct structure</li>";
echo "</ol>";
echo "</div>";
?>