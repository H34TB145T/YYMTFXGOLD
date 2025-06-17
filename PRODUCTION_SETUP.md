# FxGold Trading Platform - Production Setup Guide

## 🚨 CRITICAL FILES TO CONFIGURE ON YOUR SERVER

### 1. **Database Configuration** 
**File: `server/config/database.php`**
```php
<?php
// ✅ CONFIGURED WITH YOUR ACTUAL CREDENTIALS
$host = 'localhost';
$dbname = 'zpjhpszw_fxgold';           // ✅ YOUR DATABASE
$username = 'zpjhpszw_fxgold_admin';   // ✅ YOUR USERNAME
$password = 'Fxgold_admin123!@#';      // ✅ YOUR PASSWORD
```

### 2. **Email Configuration**
**File: `server/emailConfig.php`**
```php
// ✅ CONFIGURED WITH YOUR GMAIL CREDENTIALS
const SMTP_HOST = 'smtp.gmail.com';
const SMTP_USERNAME = 'fxgold.info@gmail.com';
const SMTP_PASSWORD = 'svlw ypaq dqlv vzqz'; // Gmail App Password
const WEBSITE_URL = 'https://fxgold.shop'; // ✅ YOUR DOMAIN
```

### 3. **Frontend API Configuration**
**File: `src/config/api.ts`**
```typescript
// ✅ CONFIGURED FOR YOUR DOMAIN
export const API_CONFIG = {
  BASE_URL: 'https://fxgold.shop/api', // ✅ YOUR DOMAIN
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
- [x] Email server (Gmail SMTP configured)
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
- [x] Professional email templates with fxgold.shop branding
- [x] Gmail SMTP configuration
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
1. ✅ Database configured: `zpjhpszw_fxgold`
2. ✅ Username: `zpjhpszw_fxgold_admin`
3. ✅ Password: `Fxgold_admin123!@#`
4. Import SQL file: `supabase/migrations/20250614033144_nameless_ocean.sql`
5. ✅ Admin credentials updated in database

### Step 3: Email Configuration
1. ✅ Gmail account configured: `fxgold.info@gmail.com`
2. ✅ App password configured: `svlw ypaq dqlv vzqz`
3. ✅ Email templates include fxgold.shop links

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
✅ All API calls configured to point to `https://fxgold.shop/api`

## 🛡️ SECURITY CONFIGURATIONS

### Admin Credentials
```
Email: admin@fxgold.shop
Password: FxgoldAdmin123!@#
Username: fxgoldadmin
Role: admin
```

### Database Connection Details
```
Host: localhost
Database: zpjhpszw_fxgold
Username: zpjhpszw_fxgold_admin
Password: Fxgold_admin123!@#
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
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# CORS Headers for fxgold.shop
Header set Access-Control-Allow-Origin "https://fxgold.shop"
Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
```

## 🔍 TESTING CHECKLIST

### Authentication Flow
- [ ] User registration with email verification
- [ ] Email OTP delivery to Gmail inbox
- [ ] Login with admin credentials: admin@fxgold.shop / FxgoldAdmin123!@#
- [ ] Password reset functionality
- [ ] 2FA authentication

### Database Connection
- [ ] Test connection with credentials: zpjhpszw_fxgold_admin / Fxgold_admin123!@#
- [ ] Verify database: zpjhpszw_fxgold exists
- [ ] Check admin user creation
- [ ] Test CRUD operations

### Email System
- [ ] Registration verification emails (check Gmail inbox)
- [ ] Password reset emails (check Gmail inbox)
- [ ] 2FA authentication emails (check Gmail inbox)
- [ ] All emails contain fxgold.shop links

### Website Access
- [ ] https://fxgold.shop loads correctly
- [ ] https://fxgold.shop/login accessible
- [ ] Admin login works with new credentials
- [ ] API endpoints respond correctly

## 🌐 IMPORTANT URLS TO TEST

After deployment, test these URLs:
- `https://fxgold.shop` - Main website ✅
- `https://fxgold.shop/api/auth.php` - API endpoint
- `https://fxgold.shop/login` - Login page
- `https://fxgold.shop/register` - Registration page

## 📧 EMAIL TESTING

Test email functionality:
1. Register new user account
2. Check Gmail inbox for verification email
3. Verify email contains fxgold.shop links
4. Test password reset flow
5. Test 2FA if enabled

## 🚨 PRODUCTION READY FEATURES

### ✅ **Configured & Ready:**
- ✅ Website URL: `https://fxgold.shop`
- ✅ Database: `zpjhpszw_fxgold`
- ✅ DB Username: `zpjhpszw_fxgold_admin`
- ✅ DB Password: `Fxgold_admin123!@#`
- ✅ Admin email: `admin@fxgold.shop`
- ✅ Admin password: `FxgoldAdmin123!@#`
- ✅ Gmail SMTP: `fxgold.info@gmail.com`
- ✅ Professional email templates
- ✅ All API endpoints configured
- ✅ Security features enabled

## 📞 SUPPORT CONTACTS

For technical issues during deployment:
- Database issues: ✅ Credentials verified and configured
- Email delivery: Verify Gmail SMTP settings
- SSL/HTTPS: Ensure certificate is installed for fxgold.shop
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

---

**✅ Your FxGold Trading Platform is production-ready with all database credentials configured! 🎉**

**Database Connection String:**
```
Host: localhost
Database: zpjhpszw_fxgold
Username: zpjhpszw_fxgold_admin
Password: Fxgold_admin123!@#
```