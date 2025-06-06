# FxGold Trading Platform - Server Installation Guide

## Prerequisites
- cPanel hosting with PHP 7.4+ and MySQL
- Composer installed (or access to install it)
- Email account configured in cPanel (no-reply@fxgold.shop)

## Installation Steps

### 1. Upload Files to Your Server
Upload all files in the `server/` directory to your cPanel public_html folder:
```
public_html/
├── api/
│   └── auth.php
├── config/
│   └── database.php
├── emailConfig.php
├── composer.json
└── .htaccess (if needed)
```

### 2. Install Dependencies
In your cPanel File Manager or via SSH, run:
```bash
composer install
```

If Composer is not available, you can manually download PHPMailer:
1. Download PHPMailer from: https://github.com/PHPMailer/PHPMailer
2. Extract to `vendor/phpmailer/phpmailer/` directory

### 3. Configure Database
1. Update `config/database.php` with your actual database credentials:
```php
$host = 'localhost';
$dbname = 'your_actual_database_name';
$username = 'your_cpanel_db_username';
$password = 'your_cpanel_db_password';
```

2. Import the SQL file `20250604183715_quick_bird.sql` via phpMyAdmin
3. Run the additional OTP table migration `20250604200000_add_otp_table.sql`

### 4. Configure Email Settings
1. In cPanel, create email account: `no-reply@fxgold.shop`
2. Update `emailConfig.php` with your email password:
```php
const SMTP_PASSWORD = 'your_actual_email_password';
```

### 5. Set File Permissions
Ensure proper permissions:
```bash
chmod 644 *.php
chmod 755 api/
chmod 644 api/*.php
```

### 6. Test the Installation
1. Visit: `https://yourdomain.com/api/auth.php` (should return a method not allowed message)
2. Test email sending by registering a new user

## Email Configuration Details

### cPanel Email Setup
1. Go to cPanel → Email Accounts
2. Create: `no-reply@fxgold.shop`
3. Set a strong password
4. Note the incoming/outgoing mail server settings

### SMTP Settings
- **Host**: `mail.fxgold.shop`
- **Port**: `587` (TLS) or `465` (SSL)
- **Username**: `no-reply@fxgold.shop`
- **Password**: Your email account password
- **Encryption**: `TLS` (recommended)

## Security Considerations

### 1. Environment Variables
For production, consider using environment variables instead of hardcoded values:
```php
const SMTP_PASSWORD = $_ENV['SMTP_PASSWORD'] ?? 'fallback_password';
```

### 2. Rate Limiting
Implement rate limiting for OTP requests to prevent abuse:
```php
// Add to your auth.php
$stmt = $pdo->prepare("SELECT COUNT(*) FROM otp_codes WHERE email = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)");
$stmt->execute([$email]);
if ($stmt->fetchColumn() > 5) {
    // Too many requests
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => 'Too many requests']);
    return;
}
```

### 3. HTTPS
Ensure your domain uses HTTPS for all API calls.

### 4. Database Security
- Use strong database passwords
- Limit database user permissions
- Regular backups

## Troubleshooting

### Email Not Sending
1. Check cPanel email logs
2. Verify SMTP credentials
3. Test with a simple PHP mail script
4. Check spam folders

### Database Connection Issues
1. Verify database credentials
2. Check if database exists
3. Ensure user has proper permissions

### API Not Working
1. Check PHP error logs in cPanel
2. Verify file permissions
3. Test with simple PHP info script

## API Endpoints

### Registration
```
POST /api/auth.php
{
    "action": "register",
    "email": "user@example.com",
    "password": "password123",
    "username": "username",
    "fullName": "Full Name"
}
```

### Email Verification
```
POST /api/auth.php
{
    "action": "verify_email",
    "email": "user@example.com",
    "otp": "123456"
}
```

### Login
```
POST /api/auth.php
{
    "action": "login",
    "email": "user@example.com",
    "password": "password123"
}
```

### Forgot Password
```
POST /api/auth.php
{
    "action": "forgot_password",
    "email": "user@example.com"
}
```

### Reset Password
```
POST /api/auth.php
{
    "action": "reset_password",
    "email": "user@example.com",
    "otp": "123456",
    "newPassword": "newpassword123"
}
```

### 2FA Verification
```
POST /api/auth.php
{
    "action": "verify_2fa",
    "email": "user@example.com",
    "otp": "123456",
    "userId": "user-id"
}
```

## Maintenance

### Regular Tasks
1. Clean up expired OTPs (if automatic cleanup is not working)
2. Monitor email sending logs
3. Update dependencies regularly
4. Backup database regularly

### Monitoring
- Set up monitoring for email delivery
- Monitor API response times
- Check error logs regularly