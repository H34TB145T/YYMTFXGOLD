<?php
// Test session management
header('Content-Type: text/html; charset=UTF-8');

// Set session cookie parameters for better persistence
ini_set('session.cookie_lifetime', 86400 * 30); // 30 days
ini_set('session.gc_maxlifetime', 86400 * 30); // 30 days
session_start();

echo "<h1>🔍 Session Management Test</h1>";

// Check if session is working
if (!isset($_SESSION['test_count'])) {
    $_SESSION['test_count'] = 1;
    echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "✅ Session started successfully! This is your first visit.";
    echo "</div>";
} else {
    $_SESSION['test_count']++;
    echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "✅ Session is working! You've visited this page " . $_SESSION['test_count'] . " times.";
    echo "</div>";
}

// Set a test cookie
setcookie('test_cookie', 'cookie_value', time() + 86400 * 30, '/', '', false, false);

// Display session information
echo "<h2>📋 Session Information</h2>";
echo "<div style='background: #e2e3e5; color: #383d41; padding: 10px; border-radius: 5px;'>";
echo "<strong>Session ID:</strong> " . session_id() . "<br>";
echo "<strong>Session Name:</strong> " . session_name() . "<br>";
echo "<strong>Session Cookie Parameters:</strong><br>";
$params = session_get_cookie_params();
foreach ($params as $key => $value) {
    echo "- $key: " . (is_bool($value) ? ($value ? 'true' : 'false') : $value) . "<br>";
}
echo "</div>";

// Display cookies
echo "<h2>🍪 Cookies</h2>";
echo "<div style='background: #e2e3e5; color: #383d41; padding: 10px; border-radius: 5px;'>";
if (empty($_COOKIE)) {
    echo "No cookies found.";
} else {
    echo "<ul>";
    foreach ($_COOKIE as $name => $value) {
        echo "<li><strong>$name</strong>: " . (is_array($value) ? json_encode($value) : $value) . "</li>";
    }
    echo "</ul>";
}
echo "</div>";

// Display session data
echo "<h2>🗄️ Session Data</h2>";
echo "<div style='background: #e2e3e5; color: #383d41; padding: 10px; border-radius: 5px;'>";
if (empty($_SESSION)) {
    echo "No session data found.";
} else {
    echo "<ul>";
    foreach ($_SESSION as $name => $value) {
        echo "<li><strong>$name</strong>: " . (is_array($value) ? json_encode($value) : $value) . "</li>";
    }
    echo "</ul>";
}
echo "</div>";

// JavaScript to check cookies
echo "<h2>🔍 JavaScript Cookie Check</h2>";
echo "<div id='cookie-check' style='background: #e2e3e5; color: #383d41; padding: 10px; border-radius: 5px;'>";
echo "Loading...";
echo "</div>";

echo "<script>
document.getElementById('cookie-check').innerHTML = 'Cookies detected by JavaScript: <br><pre>' + document.cookie + '</pre>';
</script>";

// Instructions for testing
echo "<hr>";
echo "<div style='background: #d1ecf1; color: #0c5460; padding: 15px; border-radius: 5px;'>";
echo "<h3>🧪 How to Test Session Persistence:</h3>";
echo "<ol>";
echo "<li>Refresh this page - the visit count should increase</li>";
echo "<li>Close the browser and reopen it - the session should still be active</li>";
echo "<li>Check if PHPSESSID cookie exists in your browser</li>";
echo "<li>Try logging in to your application - you should stay logged in after refresh</li>";
echo "</ol>";
echo "</div>";

// Debug information
echo "<hr>";
echo "<div style='background: #fff3cd; color: #856404; padding: 15px; border-radius: 5px;'>";
echo "<h3>🔧 Debug Information:</h3>";
echo "<p>PHP Version: " . phpversion() . "</p>";
echo "<p>Session Save Path: " . session_save_path() . "</p>";
echo "<p>Session Module: " . (extension_loaded('session') ? 'Loaded' : 'Not Loaded') . "</p>";
echo "<p>Session Auto Start: " . (ini_get('session.auto_start') ? 'Enabled' : 'Disabled') . "</p>";
echo "<p>Session Use Cookies: " . (ini_get('session.use_cookies') ? 'Enabled' : 'Disabled') . "</p>";
echo "<p>Session Use Only Cookies: " . (ini_get('session.use_only_cookies') ? 'Enabled' : 'Disabled') . "</p>";
echo "<p>Session Cookie Lifetime: " . ini_get('session.cookie_lifetime') . " seconds</p>";
echo "<p>Session GC Maxlifetime: " . ini_get('session.gc_maxlifetime') . " seconds</p>";
echo "</div>";
?>