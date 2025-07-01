<?php
// Debug script to test login functionality
header('Content-Type: text/html; charset=UTF-8');

echo "<h1>🔍 Debug Login API</h1>";

// Include database and email configuration
require_once 'config/database.php';
require_once 'emailConfig.php';

// Initialize services
$emailService = new EmailService();
$otpManager = new OTPManager($pdo);

// Test user credentials
$testEmail = 'admin@fxgold.shop';
$testPassword = 'FxgoldAdmin123!@#';

echo "<h2>🧪 Testing Login API with Admin Credentials</h2>";
echo "<div style='background: #e2e3e5; color: #383d41; padding: 10px; border-radius: 5px; margin-bottom: 20px;'>";
echo "<strong>Test Credentials:</strong><br>";
echo "Email: $testEmail<br>";
echo "Password: $testPassword<br>";
echo "</div>";

// Test database connection
echo "<h3>Step 1: Testing Database Connection</h3>";
try {
    $stmt = $pdo->query("SELECT 1");
    echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin-bottom: 10px;'>";
    echo "✅ Database connection successful";
    echo "</div>";
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin-bottom: 10px;'>";
    echo "❌ Database connection failed: " . $e->getMessage();
    echo "</div>";
    exit;
}

// Check if admin user exists
echo "<h3>Step 2: Checking Admin User</h3>";
try {
    $stmt = $pdo->prepare("SELECT id, email, username, password, role FROM users WHERE email = ?");
    $stmt->execute([$testEmail]);
    $user = $stmt->fetch();
    
    if ($user) {
        echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin-bottom: 10px;'>";
        echo "✅ Admin user found:<br>";
        echo "ID: " . $user['id'] . "<br>";
        echo "Email: " . $user['email'] . "<br>";
        echo "Username: " . $user['username'] . "<br>";
        echo "Role: " . $user['role'] . "<br>";
        echo "</div>";
    } else {
        echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin-bottom: 10px;'>";
        echo "❌ Admin user not found";
        echo "</div>";
    }
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin-bottom: 10px;'>";
    echo "❌ Error checking admin user: " . $e->getMessage();
    echo "</div>";
}

// Test password verification
echo "<h3>Step 3: Testing Password Verification</h3>";
if (isset($user) && $user) {
    if (password_verify($testPassword, $user['password'])) {
        echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin-bottom: 10px;'>";
        echo "✅ Password verification successful";
        echo "</div>";
    } else {
        echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin-bottom: 10px;'>";
        echo "❌ Password verification failed";
        echo "</div>";
        
        // Update admin password for testing
        echo "<h4>Updating Admin Password</h4>";
        try {
            $hashedPassword = password_hash($testPassword, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE email = ?");
            if ($stmt->execute([$hashedPassword, $testEmail])) {
                echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin-bottom: 10px;'>";
                echo "✅ Admin password updated successfully";
                echo "</div>";
            } else {
                echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin-bottom: 10px;'>";
                echo "❌ Failed to update admin password";
                echo "</div>";
            }
        } catch (Exception $e) {
            echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin-bottom: 10px;'>";
            echo "❌ Error updating admin password: " . $e->getMessage();
            echo "</div>";
        }
    }
}

// Test manual login
echo "<h3>Step 4: Testing Manual Login Process</h3>";
try {
    if (isset($user) && $user) {
        // Update last login
        $stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $stmt->execute([$user['id']]);
        
        // Get complete user data
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$user['id']]);
        $completeUser = $stmt->fetch();
        
        if ($completeUser) {
            echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin-bottom: 10px;'>";
            echo "✅ User data retrieved successfully";
            echo "</div>";
            
            // Get user's assets
            $stmt = $pdo->prepare("SELECT * FROM crypto_assets WHERE user_id = ?");
            $stmt->execute([$user['id']]);
            $assets = $stmt->fetchAll();
            
            echo "<div style='background: #d1ecf1; color: #0c5460; padding: 10px; border-radius: 5px; margin-bottom: 10px;'>";
            echo "ℹ️ User has " . count($assets) . " crypto assets";
            echo "</div>";
            
            // Get user's transactions
            $stmt = $pdo->prepare("SELECT * FROM transactions WHERE user_id = ? LIMIT 5");
            $stmt->execute([$user['id']]);
            $transactions = $stmt->fetchAll();
            
            echo "<div style='background: #d1ecf1; color: #0c5460; padding: 10px; border-radius: 5px; margin-bottom: 10px;'>";
            echo "ℹ️ User has " . count($transactions) . " transactions";
            echo "</div>";
        } else {
            echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin-bottom: 10px;'>";
            echo "❌ Failed to retrieve complete user data";
            echo "</div>";
        }
    }
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin-bottom: 10px;'>";
    echo "❌ Error in manual login process: " . $e->getMessage();
    echo "</div>";
}

// Test API endpoint directly
echo "<h3>Step 5: Testing Login API Endpoint</h3>";
echo "<div style='background: #fff3cd; color: #856404; padding: 10px; border-radius: 5px; margin-bottom: 10px;'>";
echo "⚠️ This will simulate a direct API call to auth.php";
echo "</div>";

try {
    // Create a test request
    $testRequest = [
        'action' => 'login',
        'email' => $testEmail,
        'password' => $testPassword,
        'rememberMe' => false
    ];
    
    // Save the request for debugging
    file_put_contents('test_login_request.json', json_encode($testRequest, JSON_PRETTY_PRINT));
    
    echo "<div style='background: #d1ecf1; color: #0c5460; padding: 10px; border-radius: 5px; margin-bottom: 10px;'>";
    echo "ℹ️ Test request saved to test_login_request.json";
    echo "</div>";
    
    echo "<div style='background: #d1ecf1; color: #0c5460; padding: 10px; border-radius: 5px; margin-bottom: 10px;'>";
    echo "ℹ️ To test the API directly, use:<br>";
    echo "<code>curl -X POST -H 'Content-Type: application/json' -d @test_login_request.json https://fxgold.shop/api/auth.php</code>";
    echo "</div>";
} catch (Exception $e) {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin-bottom: 10px;'>";
    echo "❌ Error creating test request: " . $e->getMessage();
    echo "</div>";
}

// Provide next steps
echo "<hr>";
echo "<div style='background: #d1ecf1; color: #0c5460; padding: 15px; border-radius: 5px; margin-top: 20px;'>";
echo "<h3>🔍 Next Steps:</h3>";
echo "<ol>";
echo "<li>If all tests above show ✅, your backend is configured correctly</li>";
echo "<li>Try logging in at <a href='https://fxgold.shop/login'>https://fxgold.shop/login</a></li>";
echo "<li>Use the admin credentials: $testEmail / $testPassword</li>";
echo "<li>If login still fails, check browser console for specific errors</li>";
echo "<li>Verify that the frontend is making requests to the correct API endpoint</li>";
echo "</ol>";
echo "</div>";

// Add a direct login form for testing
echo "<hr>";
echo "<h3>🧪 Test Login Form</h3>";
echo "<form action='api/auth.php' method='post' style='background: #f8f9fa; padding: 20px; border-radius: 5px;'>";
echo "<input type='hidden' name='action' value='login'>";
echo "<div style='margin-bottom: 10px;'>";
echo "<label for='email' style='display: block; margin-bottom: 5px;'>Email:</label>";
echo "<input type='email' id='email' name='email' value='$testEmail' style='width: 100%; padding: 8px; border: 1px solid #ced4da; border-radius: 4px;'>";
echo "</div>";
echo "<div style='margin-bottom: 10px;'>";
echo "<label for='password' style='display: block; margin-bottom: 5px;'>Password:</label>";
echo "<input type='password' id='password' name='password' value='$testPassword' style='width: 100%; padding: 8px; border: 1px solid #ced4da; border-radius: 4px;'>";
echo "</div>";
echo "<div style='margin-bottom: 10px;'>";
echo "<label style='display: flex; align-items: center;'>";
echo "<input type='checkbox' name='rememberMe' value='1' style='margin-right: 5px;'> Remember Me";
echo "</label>";
echo "</div>";
echo "<button type='submit' style='background-color: #007bff; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer;'>Login</button>";
echo "</form>";
?>