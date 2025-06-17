<?php
// Database configuration - Updated with your actual credentials
$host = 'localhost';
$dbname = 'zpjhpszw_fxgold';
$username = 'zpjhpszw_fxgold_admin';
$password = 'Fxgold_admin123!@#';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
    // Update admin password if needed
    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE email = ? AND role = 'admin'");
    $newPasswordHash = password_hash('FxgoldAdmin123!@#', PASSWORD_DEFAULT);
    $stmt->execute([$newPasswordHash, 'admin@fxgold.shop']);
    
} catch(PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
?>