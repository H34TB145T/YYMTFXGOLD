# 🚀 FxGold Trading Platform - cPanel Upload Guide

## 📋 **Pre-Upload Checklist**

### ✅ **What You Have Ready:**
- ✅ Database: `zpjhpszw_fxgold`
- ✅ DB Username: `zpjhpszw_fxgold_admin`
- ✅ DB Password: `Fxgold_admin123!@#`
- ✅ Website URL: `https://fxgold.shop`
- ✅ Admin Email: `admin@fxgold.shop`
- ✅ Admin Password: `FxgoldAdmin123!@#`

---

## 🗂️ **STEP 1: Prepare Files for Upload**

### **Frontend Build Process:**
```bash
# In your local project directory
npm run build
```
This creates a `dist/` folder with your compiled frontend files.

### **Files to Upload to cPanel:**

#### **📁 Backend Files (Upload to `public_html/`):**
```
public_html/
├── api/
│   └── auth.php
├── config/
│   └── database.php
├── emailConfig.php
├── composer.json
├── .htaccess
└── .env (create from .env.example)
```

#### **📁 Frontend Files (Upload to `public_html/`):**
```
public_html/
├── index.html (from dist/)
├── assets/ (from dist/)
└── vite.svg (from dist/)
```

---

## 🗄️ **STEP 2: Database Setup**

### **2.1 Access phpMyAdmin:**
1. Login to your cPanel
2. Find and click **"phpMyAdmin"**
3. Select your database: `zpjhpszw_fxgold`

### **2.2 Import Database Schema:**
1. Click **"Import"** tab in phpMyAdmin
2. Click **"Choose File"**
3. Upload: `supabase/migrations/20250614033144_nameless_ocean.sql`
4. Click **"Go"** to import

### **2.3 Verify Database:**
After import, you should see these tables:
- ✅ `users` (with admin account)
- ✅ `crypto_assets`
- ✅ `transactions`
- ✅ `positions`
- ✅ `orders`
- ✅ `otp_codes`
- ✅ `admin_wallets`

---

## 📤 **STEP 3: Upload Backend Files**

### **3.1 Using cPanel File Manager:**

1. **Login to cPanel** → Click **"File Manager"**
2. **Navigate to** `public_html/`
3. **Create folders:**
   - `api/`
   - `config/`

### **3.2 Upload PHP Files:**

#### **Upload `server/api/auth.php`:**
- Go to `public_html/api/`
- Upload `auth.php`

#### **Upload `server/config/database.php`:**
- Go to `public_html/config/`
- Upload `database.php`

#### **Upload `server/emailConfig.php`:**
- Go to `public_html/`
- Upload `emailConfig.php`

#### **Upload `server/composer.json`:**
- Go to `public_html/`
- Upload `composer.json`

#### **Upload `server/.htaccess`:**
- Go to `public_html/`
- Upload `.htaccess`

### **3.3 Create .env File:**
1. In `public_html/`, create new file: `.env`
2. Copy content from `server/.env.example`
3. Update with your credentials:
```env
DB_HOST=localhost
DB_NAME=zpjhpszw_fxgold
DB_USER=zpjhpszw_fxgold_admin
DB_PASSWORD=Fxgold_admin123!@#

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=fxgold.info@gmail.com
SMTP_PASS=svlw ypaq dqlv vzqz

WEBSITE_URL=https://fxgold.shop
```

---

## 🌐 **STEP 4: Upload Frontend Files**

### **4.1 Build Your Frontend:**
```bash
npm run build
```

### **4.2 Upload dist/ Contents:**
1. **Extract all files** from your `dist/` folder
2. **Upload to** `public_html/` (root directory):
   - `index.html`
   - `assets/` folder (contains CSS, JS files)
   - `vite.svg`

### **4.3 File Structure Should Look Like:**
```
public_html/
├── index.html          ← Frontend
├── assets/             ← Frontend assets
├── vite.svg           ← Frontend
├── api/               ← Backend
│   └── auth.php
├── config/            ← Backend
│   └── database.php
├── emailConfig.php    ← Backend
├── composer.json      ← Backend
├── .htaccess         ← Backend
└── .env              ← Backend
```

---

## ⚙️ **STEP 5: Install Dependencies**

### **5.1 Using cPanel Terminal (if available):**
```bash
cd public_html
composer install
```

### **5.2 Alternative - Manual Upload:**
If composer isn't available:
1. Run `composer install` locally
2. Upload the generated `vendor/` folder to `public_html/`

---

## 🔧 **STEP 6: Configure File Permissions**

### **Set Correct Permissions:**
```bash
# PHP files
chmod 644 *.php
chmod 644 api/*.php
chmod 644 config/*.php

# Directories
chmod 755 api/
chmod 755 config/
chmod 755 assets/

# Sensitive files
chmod 600 .env
```

---

## ✅ **STEP 7: Test Your Installation**

### **7.1 Test Website Access:**
- Visit: `https://fxgold.shop`
- Should load the homepage

### **7.2 Test Admin Login:**
- Go to: `https://fxgold.shop/login`
- Email: `admin@fxgold.shop`
- Password: `FxgoldAdmin123!@#`

### **7.3 Test API Endpoints:**
- Visit: `https://fxgold.shop/api/auth.php`
- Should return: `{"success":false,"message":"Method not allowed"}`

### **7.4 Test Database Connection:**
Create a test file `test-db.php` in `public_html/`:
```php
<?php
require_once 'config/database.php';
echo "Database connection successful!";
?>
```
Visit: `https://fxgold.shop/test-db.php`

---

## 🚨 **STEP 8: Security & Cleanup**

### **8.1 Remove Test Files:**
- Delete `test-db.php` after testing

### **8.2 Verify .htaccess Protection:**
Your `.htaccess` should protect sensitive files:
```apache
<Files ".env">
    Order allow,deny
    Deny from all
</Files>
```

### **8.3 SSL Certificate:**
- Ensure `https://fxgold.shop` has valid SSL
- All API calls should use HTTPS

---

## 📞 **STEP 9: Troubleshooting**

### **Common Issues:**

#### **🔴 Database Connection Failed:**
- Check credentials in `config/database.php`
- Verify database exists in cPanel MySQL
- Ensure user has proper permissions

#### **🔴 500 Internal Server Error:**
- Check PHP error logs in cPanel
- Verify file permissions
- Check `.htaccess` syntax

#### **🔴 API Not Working:**
- Ensure `api/` folder exists
- Check `auth.php` file permissions
- Verify CORS headers

#### **🔴 Frontend Not Loading:**
- Check if `index.html` is in root directory
- Verify `assets/` folder uploaded correctly
- Check browser console for errors

---

## 🎉 **STEP 10: Final Verification**

### **✅ Checklist:**
- [ ] Website loads: `https://fxgold.shop`
- [ ] Admin login works: `admin@fxgold.shop` / `FxgoldAdmin123!@#`
- [ ] User registration works
- [ ] Database connection successful
- [ ] API endpoints respond
- [ ] Trading features functional
- [ ] Email system configured

---

## 📋 **Quick Upload Summary**

### **What to Upload Where:**

#### **To `public_html/` (root):**
- All files from `dist/` folder (index.html, assets/, etc.)
- `emailConfig.php`
- `composer.json`
- `.htaccess`
- `.env` (create manually)

#### **To `public_html/api/`:**
- `auth.php`

#### **To `public_html/config/`:**
- `database.php`

#### **To phpMyAdmin:**
- `supabase/migrations/20250614033144_nameless_ocean.sql`

---

## 🔐 **Your Credentials Summary:**

```
Website: https://fxgold.shop
Admin Email: admin@fxgold.shop
Admin Password: FxgoldAdmin123!@#

Database: zpjhpszw_fxgold
DB Username: zpjhpszw_fxgold_admin
DB Password: Fxgold_admin123!@#

Gmail: fxgold.info@gmail.com
Gmail App Password: svlw ypaq dqlv vzqz
```

---

**🎉 Your FxGold Trading Platform is ready for production! 🚀**

Need help? Contact support or check the error logs in your cPanel.