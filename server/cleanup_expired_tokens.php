<?php
/**
 * Cleanup Script for Expired Tokens
 * 
 * This script should be run periodically via cron job to clean up:
 * - Expired remember tokens
 * - Expired OTP codes
 * - Old login attempts
 * 
 * Recommended cron schedule: Once per hour
 * Example cron entry: 0 * * * * php /path/to/public_html/cleanup_expired_tokens.php
 */

// Load database configuration
require_once 'config/database.php';

// Set error reporting
ini_set('display_errors', 0);
error_reporting(E_ALL);
ini_set('log_errors', 1);

// Log start of cleanup
error_log("Starting cleanup of expired tokens at " . date('Y-m-d H:i:s'));

try {
    // Delete expired remember tokens
    $stmt = $pdo->prepare("DELETE FROM remember_tokens WHERE expires_at < NOW()");
    $stmt->execute();
    $rememberTokensDeleted = $stmt->rowCount();
    error_log("Deleted $rememberTokensDeleted expired remember tokens");
    
    // Delete expired OTP codes
    $stmt = $pdo->prepare("DELETE FROM otp_codes WHERE expires_at < NOW()");
    $stmt->execute();
    $otpCodesDeleted = $stmt->rowCount();
    error_log("Deleted $otpCodesDeleted expired OTP codes");
    
    // Delete old login attempts (older than 24 hours)
    $stmt = $pdo->prepare("DELETE FROM login_attempts WHERE attempt_time < DATE_SUB(NOW(), INTERVAL 24 HOUR)");
    $stmt->execute();
    $loginAttemptsDeleted = $stmt->rowCount();
    error_log("Deleted $loginAttemptsDeleted old login attempts");
    
    // Log successful cleanup
    error_log("Cleanup completed successfully at " . date('Y-m-d H:i:s'));
    
    echo "Cleanup completed successfully.\n";
    echo "- Deleted $rememberTokensDeleted expired remember tokens\n";
    echo "- Deleted $otpCodesDeleted expired OTP codes\n";
    echo "- Deleted $loginAttemptsDeleted old login attempts\n";
    
} catch (Exception $e) {
    error_log("Error during cleanup: " . $e->getMessage());
    echo "Error during cleanup: " . $e->getMessage() . "\n";
}