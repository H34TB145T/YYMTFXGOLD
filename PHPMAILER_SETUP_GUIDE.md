# 📧 PHPMailer Gmail SMTP Setup Guide for FxGold Trading Platform

## 🚀 **Quick Setup Instructions**

### **Step 1: Install PHPMailer**
In your server directory, run:
```bash
composer install
```

This will install PHPMailer automatically using your `composer.json` configuration.

### **Step 2: Gmail SMTP Configuration**
Your Gmail SMTP is already configured in `server/emailConfig.php`:

```php
// Gmail SMTP Configuration
const SMTP_HOST = 'smtp.gmail.com';
const SMTP_PORT = 587;
const SMTP_USERNAME = 'fxgold.info@gmail.com'; // Your Gmail account
const SMTP_PASSWORD = 'svlw ypaq dqlv vzqz'; // Your Gmail App Password
const SMTP_ENCRYPTION = 'tls';
```

### **Step 3: Enable Email Verification**
Email verification is **ENABLED** by default:
```php
const EMAIL_ENABLED = true; // PHPMailer email verification enabled
```

### **Step 4: Test Email System**
1. Register a new user on your website
2. Check the user's email inbox for verification code
3. Test the verification process

## 📋 **Features Included**

### ✅ **PHPMailer Integration**
- **Professional SMTP delivery** via Gmail
- **TLS encryption** for secure email transmission
- **UTF-8 character support** for international users
- **Error logging** for debugging
- **Automatic retry** mechanisms

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

## 🔧 **PHPMailer Configuration Details**

### **SMTP Settings**
```php
$this->mailer->isSMTP();
$this->mailer->Host = 'smtp.gmail.com';
$this->mailer->SMTPAuth = true;
$this->mailer->Username = 'fxgold.info@gmail.com';
$this->mailer->Password = 'svlw ypaq dqlv vzqz';
$this->mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
$this->mailer->Port = 587;
```

### **Email Branding**
```php
const FROM_EMAIL = 'fxgold.info@gmail.com';
const FROM_NAME = 'FxGold Trading';
const REPLY_TO = 'admin@fxgold.shop';
const WEBSITE_URL = 'https://fxgold.shop';
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
- ✅ **TLS encryption** (STARTTLS)
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
- **Call-to-action buttons**

### **Content Sections**
- **Welcome message** with personalization
- **Clear instructions** with numbered steps
- **Security warnings** and best practices
- **Contact information** for support
- **Professional footer** with branding

## 🚨 **Troubleshooting**

### **PHPMailer Not Sending Emails**
1. Check if PHPMailer is installed: `composer install`
2. Verify Gmail app password is correct
3. Check server error logs for PHPMailer errors
4. Ensure port 587 is open on your server
5. Verify TLS/STARTTLS is supported

### **Gmail SMTP Issues**
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password** (not regular password)
3. **Use App Password** in the configuration
4. **Check Gmail security settings**
5. **Verify "Less secure app access"** is not blocking

### **Users Not Receiving Emails**
1. Check spam/junk folders
2. Verify email address format
3. Test with different email providers
4. Check Gmail sending limits
5. Review email content for spam triggers

### **OTP Not Working**
1. Check database connection
2. Verify OTP table exists
3. Check system time/timezone
4. Review OTP expiration settings
5. Test with manual OTP verification

## 📞 **Support & Debugging**

### **Enable Debug Mode**
Uncomment this line in `emailConfig.php` for detailed SMTP debugging:
```php
$this->mailer->SMTPDebug = SMTP::DEBUG_SERVER;
```

### **Check Error Logs**
PHPMailer errors are logged to your server's error log. Check:
- cPanel Error Logs
- PHP error logs
- Server mail logs

### **Test SMTP Connection**
Create a simple test script to verify SMTP connectivity:
```php
<?php
require_once 'emailConfig.php';
$emailService = new EmailService();
$result = $emailService->sendVerificationEmail('test@example.com', 'Test User', '123456');
echo $result ? 'Email sent successfully!' : 'Email failed to send.';
?>
```

## 🎉 **Your Platform Now Includes:**

✅ **Professional PHPMailer email system**  
✅ **Gmail SMTP integration with your credentials**  
✅ **Beautiful, responsive email templates**  
✅ **Enhanced security with OTP codes**  
✅ **Improved user registration experience**  
✅ **Mobile-friendly verification process**  
✅ **Comprehensive error handling**  
✅ **Rate limiting and security features**  

**Ready to provide a professional email experience with PHPMailer! 🚀**

## 📧 **Email Examples**

### **Verification Email**
- Subject: "🔐 Verify Your FxGold Account - Action Required"
- Professional HTML template with OTP code
- Step-by-step verification instructions
- Security warnings and tips

### **Password Reset Email**
- Subject: "🔑 Reset Your FxGold Password - Secure Access Code"
- Secure reset code delivery
- Clear reset instructions
- Security best practices

### **2FA Email**
- Subject: "🔐 FxGold 2FA Verification Code - Secure Login"
- Quick login verification
- Time-sensitive security code
- Login attempt details

All emails are sent from your Gmail account (`fxgold.info@gmail.com`) with professional branding and security features!