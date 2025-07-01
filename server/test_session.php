<?php
// Test script to verify PHP session functionality

// Start session
session_start();

// Set session cookie parameters for better persistence
ini_set('session.cookie_lifetime', 86400 * 30); // 30 days
ini_set('session.gc_maxlifetime', 86400 * 30); // 30 days
ini_set('session.use_strict_mode', 1);
ini_set('session.use_cookies', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.cookie_samesite', 'Strict');

// Output HTML header
header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>PHP Session Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
        }
        .success {
            background-color: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        .error {
            background-color: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        .info {
            background-color: #d1ecf1;
            color: #0c5460;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        pre {
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
        }
        button {
            background-color: #4CAF50;
            color: white;
            padding: 10px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 10px;
        }
        button:hover {
            background-color: #45a049;
        }
        .button-red {
            background-color: #f44336;
        }
        .button-red:hover {
            background-color: #d32f2f;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>PHP Session Test</h1>
        
        <?php
        // Check if action is set
        if (isset($_GET['action'])) {
            $action = $_GET['action'];
            
            // Set session data
            if ($action === 'set') {
                $_SESSION['test_data'] = [
                    'user_id' => 'test-user-123',
                    'timestamp' => time(),
                    'random' => rand(1000, 9999)
                ];
                echo '<div class="success">Session data has been set!</div>';
            }
            
            // Clear session data
            if ($action === 'clear') {
                session_unset();
                session_destroy();
                echo '<div class="success">Session has been cleared!</div>';
            }
        }
        
        // Display session info
        echo '<div class="info">';
        echo '<h2>Session Information</h2>';
        echo '<p><strong>Session ID:</strong> ' . session_id() . '</p>';
        echo '<p><strong>Session Name:</strong> ' . session_name() . '</p>';
        echo '<p><strong>Session Status:</strong> ' . (session_status() === PHP_SESSION_ACTIVE ? 'Active' : 'Inactive') . '</p>';
        echo '<p><strong>Session Cookie Parameters:</strong></p>';
        echo '<pre>' . print_r(session_get_cookie_params(), true) . '</pre>';
        echo '</div>';
        
        // Display session data
        echo '<div class="info">';
        echo '<h2>Session Data</h2>';
        if (!empty($_SESSION)) {
            echo '<pre>' . print_r($_SESSION, true) . '</pre>';
        } else {
            echo '<p>No session data found.</p>';
        }
        echo '</div>';
        
        // Display cookies
        echo '<div class="info">';
        echo '<h2>Cookies</h2>';
        if (!empty($_COOKIE)) {
            echo '<pre>' . print_r($_COOKIE, true) . '</pre>';
        } else {
            echo '<p>No cookies found.</p>';
        }
        echo '</div>';
        ?>
        
        <h2>Actions</h2>
        <a href="?action=set"><button>Set Session Data</button></a>
        <a href="?action=clear"><button class="button-red">Clear Session</button></a>
        <a href="?"><button>Refresh Page</button></a>
        
        <div class="info" style="margin-top: 20px;">
            <h2>Testing Instructions</h2>
            <ol>
                <li>Click "Set Session Data" to create a test session</li>
                <li>Refresh the page to verify the session persists</li>
                <li>Close the browser and reopen to test session persistence</li>
                <li>Click "Clear Session" to remove the session data</li>
            </ol>
        </div>
    </div>
</body>
</html>