# 🚀 Update Instructions for Email Fix

## 📦 **What You Need to Do:**

### **Step 1: Build Frontend (Optional but Recommended)**
```bash
npm run build
```
*This creates the latest `dist/` folder with any frontend updates*

### **Step 2: Upload Updated Backend Files**
Upload these **specific files** to your cPanel File Manager:

#### **📁 Upload to `public_html/`:**
- `server/emailConfig.php` ✅ **UPDATED** (fixed email configuration)
- `server/api/auth.php` ✅ **UPDATED** (improved API endpoints)
- `server/composer.json` ✅ **UPDATED** (PHPMailer dependency)

#### **📁 Upload to `public_html/` (if you ran npm build):**
- All contents of `dist/` folder (index.html, assets/, etc.)

### **Step 3: Install PHPMailer (if not done already)**
In cPanel Terminal or File Manager:
```bash
cd public_html
composer install
```

### **Step 4: Test the Email System**
1. **Test file:** Upload `server/test-working-email.php` to `public_html/`
2. **Visit:** `https://fxgold.shop/test-working-email.php`
3. **Check:** Should send real email to your Gmail

### **Step 5: Test User Registration**
1. **Go to:** `https://fxgold.shop/register`
2. **Register new user** with real email
3. **Check Gmail inbox** for OTP code
4. **Verify email** with received OTP

## 🔍 **What Was Fixed:**

### **Email Configuration:**
- ✅ **Port changed:** 587 → 465 (SSL)
- ✅ **Encryption:** TLS → SSL (SMTPS)
- ✅ **Configuration:** Matches your working test exactly
- ✅ **Professional branding:** FXGold Support
- ✅ **Reply-To:** support@fxgold.shop

### **API Improvements:**
- ✅ **Better error handling**
- ✅ **Proper OTP management**
- ✅ **Real PHPMailer integration**
- ✅ **Database integration**

## 🎯 **Expected Results:**

After uploading:
- ✅ **User registration** sends real OTP emails
- ✅ **Email verification** works with real codes
- ✅ **Password reset** sends real emails
- ✅ **2FA** sends real codes
- ✅ **Professional email templates**

## 🚨 **Important:**

**You ONLY need to upload the backend files** (PHP files). The frontend React code didn't change for this email fix.

**Optional:** Run `npm run build` and upload `dist/` contents if you want the latest frontend version.