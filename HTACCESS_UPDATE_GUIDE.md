# 🔧 How to Update Your .htaccess File

## 📍 **What is .htaccess?**

The `.htaccess` file is a configuration file for Apache web servers that controls how your website behaves. It's crucial for:
- URL rewriting (making your React app work properly)
- Setting proper MIME types for CSS/JS files
- Security headers
- CORS configuration for your API

---

## 🎯 **Method 1: Using cPanel File Manager (Recommended)**

### **Step 1: Access cPanel File Manager**
1. Login to your cPanel
2. Find and click **"File Manager"**
3. Navigate to `public_html/` directory

### **Step 2: Create/Edit .htaccess**
1. **If .htaccess doesn't exist:**
   - Click **"+ File"** button
   - Name it exactly: `.htaccess` (with the dot at the beginning)
   - Click **"Create New File"**

2. **If .htaccess already exists:**
   - Right-click on `.htaccess`
   - Select **"Edit"** or **"Code Edit"**

### **Step 3: Add the Configuration**
Copy and paste this complete `.htaccess` configuration:

```apache
# Enable rewrite engine
RewriteEngine On

# Handle React Router (SPA routing)
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-l
RewriteRule . /index.html [L]

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Set proper MIME types for assets
<IfModule mod_mime.c>
    AddType application/javascript .js
    AddType application/javascript .mjs
    AddType text/css .css
    AddType application/json .json
    AddType image/svg+xml .svg
    AddType image/x-icon .ico
</IfModule>

# Enable compression for assets
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE application/json
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    
    # CORS for API
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
</IfModule>

# Protect sensitive files
<Files ".env">
    Order allow,deny
    Deny from all
</Files>

<Files "composer.json">
    Order allow,deny
    Deny from all
</Files>

<Files "*.md">
    Order allow,deny
    Deny from all
</Files>
```

### **Step 4: Save the File**
1. Click **"Save Changes"** or **"Save"**
2. Close the editor

### **Step 5: Set Correct Permissions**
1. Right-click on `.htaccess`
2. Select **"Change Permissions"**
3. Set to **644** (or check: Owner: Read+Write, Group: Read, World: Read)
4. Click **"Change Permissions"**

---

## 🎯 **Method 2: Using FTP Client**

### **Step 1: Connect via FTP**
1. Use an FTP client (FileZilla, WinSCP, etc.)
2. Connect to your hosting server
3. Navigate to `public_html/` directory

### **Step 2: Create/Edit .htaccess**
1. **Create new file** named `.htaccess` on your local computer
2. **Copy the configuration** from Method 1 above
3. **Upload the file** to `public_html/` directory
4. **Set permissions** to 644

---

## 🎯 **Method 3: Using SSH (Advanced)**

If you have SSH access:

```bash
# Navigate to your web directory
cd /path/to/public_html/

# Create/edit .htaccess
nano .htaccess

# Paste the configuration, then save (Ctrl+X, Y, Enter)

# Set correct permissions
chmod 644 .htaccess
```

---

## ✅ **What This .htaccess Does**

### **🔧 Fixes Your Asset Loading Issues:**
- **MIME Types:** Ensures CSS/JS files are served with correct content types
- **React Router:** Makes your single-page app work with direct URLs
- **HTTPS:** Forces secure connections

### **🛡️ Security Features:**
- **File Protection:** Hides sensitive files like `.env`
- **Security Headers:** Prevents XSS and clickjacking
- **CORS:** Allows your frontend to communicate with your API

### **⚡ Performance:**
- **Compression:** Reduces file sizes for faster loading
- **Caching:** Improves load times for returning visitors

---

## 🧪 **Testing Your .htaccess**

After updating, test these URLs:

1. **Main site:** `https://fxgold.shop`
2. **Direct asset access:** `https://fxgold.shop/assets/index-ClO3yoql.js`
3. **API endpoint:** `https://fxgold.shop/api/auth.php`

### **Expected Results:**
- ✅ Main site loads without console errors
- ✅ Assets return CSS/JS content (not HTML)
- ✅ API returns JSON response

---

## 🚨 **Troubleshooting**

### **🔴 500 Internal Server Error**
**Cause:** Syntax error in .htaccess
**Solution:** 
1. Check for typos in the configuration
2. Remove the .htaccess temporarily to confirm it's the cause
3. Add sections one by one to identify the problematic part

### **🔴 Still Getting HTML Instead of CSS/JS**
**Cause:** Assets folder not uploaded correctly
**Solution:**
1. Verify `assets/` folder exists in `public_html/`
2. Check that CSS/JS files are actually in the assets folder
3. Re-upload the entire `dist/` folder contents

### **🔴 HTTPS Redirect Loop**
**Cause:** Conflicting HTTPS rules
**Solution:** Remove the HTTPS redirect section if your hosting already handles it

---

## 📋 **Quick Checklist**

After updating .htaccess:

- [ ] ✅ File saved as `.htaccess` (with dot at beginning)
- [ ] ✅ File located in `public_html/` directory
- [ ] ✅ File permissions set to 644
- [ ] ✅ No 500 errors when visiting your site
- [ ] ✅ Assets load correctly (check browser console)
- [ ] ✅ CSS styles applied to your website
- [ ] ✅ JavaScript functionality works

---

## 🎯 **Most Important Fix**

The **critical part** for your current issue is this section:

```apache
# Set proper MIME types for assets
<IfModule mod_mime.c>
    AddType application/javascript .js
    AddType text/css .css
</IfModule>
```

This tells your server to serve `.js` files as JavaScript and `.css` files as CSS, instead of serving them as HTML error pages.

---

**🚀 After updating your .htaccess file with this configuration, your React app should load perfectly!**