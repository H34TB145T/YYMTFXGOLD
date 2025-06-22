<?php
// Check what database drivers are available on your server
header('Content-Type: text/html; charset=UTF-8');

echo "<h1>🔍 Database Driver Check</h1>";

echo "<h2>📋 Available PHP Extensions:</h2>";

// Check PDO
if (extension_loaded('pdo')) {
    echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "✅ PDO extension is loaded";
    echo "</div>";
    
    // Check PDO drivers
    $drivers = PDO::getAvailableDrivers();
    echo "<div style='background: #e2e3e5; color: #383d41; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "<strong>Available PDO drivers:</strong><br>";
    foreach ($drivers as $driver) {
        echo "- $driver<br>";
    }
    echo "</div>";
    
    if (in_array('mysql', $drivers)) {
        echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "✅ PDO MySQL driver is available";
        echo "</div>";
    } else {
        echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "❌ PDO MySQL driver is NOT available";
        echo "</div>";
    }
} else {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "❌ PDO extension is NOT loaded";
    echo "</div>";
}

// Check MySQLi
if (extension_loaded('mysqli')) {
    echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "✅ MySQLi extension is loaded";
    echo "</div>";
} else {
    echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "❌ MySQLi extension is NOT loaded";
    echo "</div>";
}

// Check MySQL (old)
if (extension_loaded('mysql')) {
    echo "<div style='background: #fff3cd; color: #856404; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
    echo "⚠️ Old MySQL extension is loaded (deprecated)";
    echo "</div>";
}

echo "<h2>🧪 Test Database Connection:</h2>";

// Test connection with your credentials
$host = 'localhost';
$dbname = 'zpjhpszw_fxgold';
$username = 'zpjhpszw_fxgold_admin';
$password = 'Fxgold_admin123!@#';

// Try PDO first
if (extension_loaded('pdo') && in_array('mysql', PDO::getAvailableDrivers())) {
    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "✅ PDO connection successful!";
        echo "</div>";
        
        // Test query
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
        $result = $stmt->fetch();
        echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "✅ Database query successful (users count: " . $result['count'] . ")";
        echo "</div>";
        
    } catch (Exception $e) {
        echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "❌ PDO connection failed: " . $e->getMessage();
        echo "</div>";
    }
}

// Try MySQLi as fallback
if (extension_loaded('mysqli')) {
    try {
        $mysqli = new mysqli($host, $username, $password, $dbname);
        
        if ($mysqli->connect_error) {
            throw new Exception($mysqli->connect_error);
        }
        
        echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "✅ MySQLi connection successful!";
        echo "</div>";
        
        // Test query
        $result = $mysqli->query("SELECT COUNT(*) as count FROM users");
        $row = $result->fetch_assoc();
        echo "<div style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "✅ MySQLi query successful (users count: " . $row['count'] . ")";
        echo "</div>";
        
        $mysqli->close();
        
    } catch (Exception $e) {
        echo "<div style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 5px 0;'>";
        echo "❌ MySQLi connection failed: " . $e->getMessage();
        echo "</div>";
    }
}

echo "<hr>";
echo "<div style='background: #d1ecf1; color: #0c5460; padding: 15px; border-radius: 5px;'>";
echo "<h3>📋 Recommendation:</h3>";
if (extension_loaded('pdo') && in_array('mysql', PDO::getAvailableDrivers())) {
    echo "✅ Use PDO for database connections (recommended)";
} elseif (extension_loaded('mysqli')) {
    echo "⚠️ Use MySQLi as fallback (PDO not available)";
} else {
    echo "❌ Contact your hosting provider to enable MySQL database extensions";
}
echo "</div>";
?>