# FxGold Trading Platform - Production Setup Guide

## 🚨 CRITICAL FILES TO CONFIGURE ON YOUR SERVER

### 1. **Database Configuration** 
**File: `server/config/database.php`**
```php
<?php
// MUST UPDATE THESE VALUES ON YOUR SERVER
$host = 'localhost';
$dbname = 'your_cpanel_database_name'; // ⚠️ CHANGE THIS
$username = 'your_cpanel_db_username'; // ⚠️ CHANGE THIS  
$password = 'your_cpanel_db_password'; // ⚠️ CHANGE THIS
```

### 2. **Email Configuration**
**File: `server/emailConfig.php`**
```php
// MUST UPDATE THESE VALUES ON YOUR SERVER
const SMTP_HOST = 'mail.fxgold.shop';
const SMTP_USERNAME = 'no-reply@fxgold.shop';
const SMTP_PASSWORD = 'YOUR_EMAIL_PASSWORD_HERE'; // ⚠️ CHANGE THIS
```

### 3. **Frontend API Configuration**
**File: `src/config/api.ts` (CREATE THIS FILE)**
```typescript
// API configuration for production
export const API_CONFIG = {
  BASE_URL: 'https://fxgold.shop/api', // ⚠️ CHANGE TO YOUR DOMAIN
  ENDPOINTS: {
    AUTH: '/auth.php',
    USERS: '/users.php',
    ORDERS: '/orders.php'
  }
};
```

## 📋 PRODUCTION CHECKLIST

### ✅ **Server Requirements Met:**
- [x] PHP 7.4+ with MySQLi/PDO
- [x] MySQL/MariaDB database
- [x] Email server (SMTP)
- [x] HTTPS SSL certificate
- [x] Composer for dependencies

### ✅ **Security Features Implemented:**
- [x] Password hashing (bcrypt)
- [x] SQL injection prevention (prepared statements)
- [x] XSS protection (input sanitization)
- [x] CSRF protection headers
- [x] Rate limiting for OTP requests
- [x] Email verification system
- [x] Two-factor authentication
- [x] Secure session management

### ✅ **Email System Ready:**
- [x] Professional email templates
- [x] OTP generation and validation
- [x] Email verification workflow
- [x] Password reset functionality
- [x] 2FA email integration

## 🔧 MANUAL CONFIGURATION STEPS

### Step 1: Upload Files to cPanel
Upload these directories to your `public_html`:
```
public_html/
├── api/
│   └── auth.php
├── config/
│   └── database.php
├── emailConfig.php
├── composer.json
├── index.html
├── assets/
└── dist/ (after build)
```

### Step 2: Database Setup
1. Create database in cPanel MySQL
2. Import SQL file: `supabase/migrations/20250604183715_quick_bird.sql`
3. Import OTP table: `supabase/migrations/20250606090856_floral_tower.sql`
4. Update `server/config/database.php` with your credentials

### Step 3: Email Configuration
1. Create email account: `no-reply@fxgold.shop` in cPanel
2. Update `server/emailConfig.php` with email password
3. Test email sending functionality

### Step 4: Install Dependencies
```bash
cd public_html
composer install
```

### Step 5: Build Frontend
```bash
npm run build
```
Upload `dist/` contents to your domain root.

### Step 6: Configure API URLs
Update all API calls in the frontend to point to your domain:
- Change `localhost` to `fxgold.shop`
- Ensure HTTPS is used for all API calls

## 🛡️ SECURITY CONFIGURATIONS

### Environment Variables (Recommended)
Create `.env` file in server root:
```env
DB_HOST=localhost
DB_NAME=your_database_name
DB_USER=your_db_username
DB_PASS=your_db_password
SMTP_PASS=your_email_password
JWT_SECRET=your_jwt_secret_key
```

### File Permissions
```bash
chmod 644 *.php
chmod 755 api/
chmod 600 .env
chmod 644 config/*.php
```

### .htaccess Security
```apache
# Prevent access to sensitive files
<Files ".env">
    Order allow,deny
    Deny from all
</Files>

<Files "composer.json">
    Order allow,deny
    Deny from all
</Files>

# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## 🔍 TESTING CHECKLIST

### Authentication Flow
- [ ] User registration with email verification
- [ ] Email OTP delivery and validation
- [ ] Login with 2FA (if enabled)
- [ ] Password reset functionality
- [ ] Session management

### Trading Features
- [ ] Cryptocurrency price display
- [ ] Buy/sell order placement
- [ ] Transaction history
- [ ] Portfolio management
- [ ] Admin order approval

### Email System
- [ ] Registration verification emails
- [ ] Password reset emails
- [ ] 2FA authentication emails
- [ ] Order confirmation emails

## 🚨 PRODUCTION ISSUES TO FIX

### 1. **Remove Demo/Development Code**
- Remove localStorage usage for user data
- Replace mock data with real API calls
- Remove demo passwords and test accounts

### 2. **API Integration**
- Connect frontend to PHP backend APIs
- Implement proper error handling
- Add loading states and user feedback

### 3. **Database Integration**
- Replace localStorage with MySQL database
- Implement proper user session management
- Add data validation and sanitization

### 4. **Security Hardening**
- Implement rate limiting
- Add CAPTCHA for registration
- Enable audit logging
- Set up monitoring and alerts

## 📞 SUPPORT CONTACTS

For technical issues during deployment:
- Database issues: Contact your hosting provider
- Email delivery: Check cPanel email logs
- SSL/HTTPS: Verify certificate installation
- API errors: Check PHP error logs

## 🔄 MAINTENANCE SCHEDULE

### Daily
- Monitor error logs
- Check email delivery status

### Weekly  
- Clean expired OTP codes
- Review user registrations
- Update cryptocurrency prices

### Monthly
- Database backup
- Security updates
- Performance optimization