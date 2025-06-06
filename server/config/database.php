<?php
// Database configuration
$host = 'localhost';
$dbname = 'fxgold_trading'; // Your database name
$username = 'your_db_username'; // Your cPanel database username
$password = 'your_db_password'; // Your cPanel database password

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
?>