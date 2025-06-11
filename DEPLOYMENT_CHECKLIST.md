# 🚀 FxGold Trading Platform - Deployment Checklist

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ **Server Requirements**
- [ ] PHP 7.4+ installed
- [ ] MySQL/MariaDB database available
- [ ] SSL certificate installed (HTTPS)
- [ ] Email server configured
- [ ] Composer available
- [ ] File permissions set correctly

### ✅ **Files to Configure Manually**

#### 1. **Database Configuration**
**File: `server/config/database.php`**
```php
$host = 'localhost';
$dbname = 'YOUR_ACTUAL_DATABASE_NAME';     // ⚠️ UPDATE THIS
$username = 'YOUR_CPANEL_DB_USERNAME';     // ⚠️ UPDATE THIS
$password = 'YOUR_CPANEL_DB_PASSWORD';     // ⚠️ UPDATE THIS
```

#### 2. **Email Configuration** 
**File: `server/emailConfig.php`**
```php
const SMTP_PASSWORD = 'YOUR_EMAIL_PASSWORD'; // ⚠️ UPDATE THIS
```

#### 3. **API Configuration**
**File: `src/config/api.ts`**
```typescript
BASE_URL: 'https://fxgold.shop/api'  // ⚠️ UPDATE TO YOUR DOMAIN
```

#### 4. **Environment Variables**
**File: `server/.env`** (Copy from `.env.example`)
- Update all database credentials
- Set email password
- Generate JWT secret key
- Set your domain URL

## 🔧 **DEPLOYMENT STEPS**

### Step 1: Upload Backend Files
Upload to your cPanel `public_html`:
```
public_html/
├── api/
├── config/
├── emailConfig.php
├── composer.json
├── .htaccess
└── .env
```

### Step 2: Database Setup
1. Create database in cPanel MySQL
2. Import: `supabase/migrations/20250604183715_quick_bird.sql`
3. Import: `supabase/migrations/20250606090856_floral_tower.sql`

### Step 3: Install Dependencies
```bash
composer install
```

### Step 4: Build & Upload Frontend
```bash
npm run build
```
Upload `dist/` contents to domain root.

### Step 5: Configure Email
1. Create `no-reply@fxgold.shop` in cPanel
2. Update SMTP password in config files
3. Test email delivery

## 🛡️ **SECURITY CHECKLIST**

### ✅ **File Permissions**
```bash
chmod 644 *.php
chmod 755 api/
chmod 600 .env
chmod 644 config/*.php
```

### ✅ **Security Headers**
- [x] HTTPS enforcement
- [x] XSS protection
- [x] CSRF protection
- [x] Content security policy
- [x] Sensitive file protection

### ✅ **Database Security**
- [x] Prepared statements (SQL injection prevention)
- [x] Password hashing (bcrypt)
- [x] Input validation
- [x] Rate limiting

## 🧪 **TESTING CHECKLIST**

### ✅ **Authentication Flow**
- [ ] User registration
- [ ] Email verification (check spam folder)
- [ ] Login functionality
- [ ] Password reset
- [ ] 2FA setup and verification

### ✅ **Trading Features**
- [ ] Cryptocurrency price display
- [ ] Order placement
- [ ] Transaction history
- [ ] Portfolio management

### ✅ **Email System**
- [ ] Registration emails delivered
- [ ] Password reset emails delivered
- [ ] 2FA codes delivered
- [ ] Email templates display correctly

## 🚨 **COMMON ISSUES & SOLUTIONS**

### Email Not Sending
1. Check cPanel email logs
2. Verify SMTP credentials
3. Check spam folders
4. Test with simple PHP mail script

### Database Connection Failed
1. Verify database credentials
2. Check if database exists
3. Ensure user has proper permissions
4. Test connection with simple PHP script

### API Not Working
1. Check PHP error logs
2. Verify file permissions
3. Test CORS headers
4. Check .htaccess configuration

### Frontend Not Loading
1. Verify build process completed
2. Check file upload to correct directory
3. Verify HTTPS configuration
4. Check browser console for errors

## 📊 **MONITORING & MAINTENANCE**

### Daily Checks
- [ ] Monitor error logs
- [ ] Check email delivery status
- [ ] Verify site accessibility

### Weekly Tasks
- [ ] Clean expired OTP codes
- [ ] Review user registrations
- [ ] Check database performance

### Monthly Tasks
- [ ] Database backup
- [ ] Security updates
- [ ] Performance optimization
- [ ] SSL certificate renewal check

## 🔗 **Important URLs to Test**

After deployment, test these URLs:
- `https://fxgold.shop` - Main website
- `https://fxgold.shop/api/auth.php` - API endpoint
- `https://fxgold.shop/register` - Registration page
- `https://fxgold.shop/login` - Login page

## 📞 **Support Resources**

### Technical Issues
- **Hosting**: Contact your cPanel provider
- **Email**: Check cPanel email configuration
- **SSL**: Verify certificate installation
- **Database**: Check MySQL connection settings

### Development Issues
- Check PHP error logs in cPanel
- Review browser console for JavaScript errors
- Verify API responses with network tab
- Test email delivery with mail logs

---

**⚠️ CRITICAL REMINDER**: Update all placeholder values with your actual credentials before going live!