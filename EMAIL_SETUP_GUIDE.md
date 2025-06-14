# 📧 Email Verification Setup Guide for FxGold Trading Platform

## 🚀 **Quick Setup Instructions**

### **Step 1: Enable Email Verification**
In your `server/emailConfig.php` file, change this line:
```php
const EMAIL_ENABLED = true; // Set to true to enable email verification
```

### **Step 2: Configure Email Settings**
Choose one of these options:

#### **Option A: Gmail SMTP (Recommended)**
1. **Create Gmail App Password:**
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Enable 2-Factor Authentication
   - Go to Security → App passwords
   - Generate password for "Mail"

2. **Update emailConfig.php:**
   ```php
   const SMTP_HOST = 'smtp.gmail.com';
   const SMTP_PORT = 587;
   const SMTP_USERNAME = 'your-gmail@gmail.com';
   const SMTP_PASSWORD = 'your-16-digit-app-password';
   const SMTP_ENCRYPTION = 'tls';
   ```

#### **Option B: cPanel Email**
1. **Create email in cPanel:**
   - Create: `no-reply@fxgold.shop`
   - Set strong password

2. **Update emailConfig.php:**
   ```php
   const SMTP_HOST = 'mail.fxgold.shop';
   const SMTP_PORT = 587;
   const SMTP_USERNAME = 'no-reply@fxgold.shop';
   const SMTP_PASSWORD = 'your-email-password';
   const SMTP_ENCRYPTION = 'tls';
   ```

### **Step 3: Install PHPMailer**
Run in your server directory:
```bash
composer install
```

### **Step 4: Test Email System**
1. Register a new user
2. Check if verification email is received
3. Test the verification process

## 📋 **Features Added**

### ✅ **Email Verification System**
- **Beautiful HTML email templates** with professional design
- **6-digit OTP codes** with expiration (10 minutes)
- **Resend functionality** with rate limiting
- **Mobile-responsive** email templates
- **Security tips** and instructions included

### ✅ **Enhanced Registration Process**
- **Email format validation**
- **Password strength indicator** (5 levels)
- **Real-time password matching**
- **Username validation** (minimum 3 characters)
- **Professional UI** with icons and animations

### ✅ **Improved Login System**
- **Email verification check** before login
- **2FA integration** with email codes
- **Better error handling** and user feedback
- **Password visibility toggle**
- **Responsive design** improvements

### ✅ **Email Templates Include:**
- **Welcome message** with branding
- **Step-by-step instructions**
- **Security warnings** and tips
- **Professional styling** with gradients
- **Mobile-friendly** responsive design
- **Expiration timers** and urgency indicators

## 🔧 **Configuration Options**

### **Email Settings**
```php
// OTP Configuration
const OTP_LENGTH = 6;                    // 6-digit codes
const OTP_EXPIRY_MINUTES = 10;          // 10 minutes for verification
const OTP_2FA_EXPIRY_MINUTES = 5;       // 5 minutes for 2FA

// Email Branding
const FROM_EMAIL = 'noreply@fxgold.shop';
const FROM_NAME = 'FxGold Trading';
const REPLY_TO = 'support@fxgold.shop';
```

### **Frontend Features**
- **Auto-redirect** to verification page after registration
- **Timer countdown** showing code expiration
- **Resend button** with cooldown period
- **Input validation** for OTP format
- **Loading states** and animations
- **Error handling** with helpful messages

## 🛡️ **Security Features**

### **OTP Security**
- ✅ **Automatic expiration** (10 minutes)
- ✅ **One-time use** codes
- ✅ **Rate limiting** for resend requests
- ✅ **Secure random generation**
- ✅ **Database cleanup** of expired codes

### **Email Security**
- ✅ **SMTP encryption** (TLS/SSL)
- ✅ **Professional templates** prevent spam
- ✅ **Clear sender identification**
- ✅ **Security warnings** in emails
- ✅ **No sensitive data** in email content

## 🎨 **Email Template Features**

### **Professional Design**
- **Gradient headers** with brand colors
- **Responsive layout** for all devices
- **Clear typography** and spacing
- **Security icons** and visual cues
- **Call-to-action buttons** (future enhancement)

### **Content Sections**
- **Welcome message** with personalization
- **Clear instructions** with numbered steps
- **Security warnings** and best practices
- **Contact information** for support
- **Professional footer** with branding

## 🚨 **Troubleshooting**

### **Email Not Sending**
1. Check SMTP credentials in `emailConfig.php`
2. Verify Gmail app password (if using Gmail)
3. Check server error logs
4. Test with simple PHP mail script
5. Verify firewall/port settings

### **Users Not Receiving Emails**
1. Check spam/junk folders
2. Verify email address format
3. Test with different email providers
4. Check email server reputation
5. Review email content for spam triggers

### **OTP Not Working**
1. Check database connection
2. Verify OTP table exists
3. Check system time/timezone
4. Review OTP expiration settings
5. Test with manual OTP verification

## 📞 **Support**

If you need help with email setup:
1. **Check server error logs** in cPanel
2. **Test SMTP connection** manually
3. **Verify database tables** are created
4. **Contact hosting provider** for email issues
5. **Review email delivery logs**

---

## 🎉 **Your Platform Now Includes:**

✅ **Professional email verification system**  
✅ **Beautiful, responsive email templates**  
✅ **Enhanced security with OTP codes**  
✅ **Improved user registration experience**  
✅ **Mobile-friendly verification process**  
✅ **Comprehensive error handling**  
✅ **Rate limiting and security features**  

**Ready to provide a professional user experience! 🚀**