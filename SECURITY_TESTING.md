# Security Testing Guide for FxGold Trading Platform

This guide provides instructions for testing the security features of the FxGold Trading Platform, particularly focusing on session management, authentication, and protection against common web vulnerabilities.

## 1. Session Management Testing

### Test PHP Session Persistence
1. Visit `https://fxgold.shop/test_session.php`
2. Click "Set Session Data" to create a test session
3. Refresh the page to verify the session persists
4. Close the browser and reopen to test session persistence
5. Verify the session ID and data are maintained

### Test Remember Me Functionality
1. Login to the platform with "Remember Me" checked
2. Close the browser completely
3. Reopen the browser and navigate to `https://fxgold.shop`
4. Verify you are still logged in
5. Check browser cookies to confirm `remember_token` cookie exists

### Test Session Timeout
1. Login to the platform
2. Wait for 30+ days (or modify session expiration for testing)
3. Verify the session has expired and you are redirected to login

## 2. Authentication Security Testing

### Test Password Reset Flow
1. Go to login page and click "Forgot your password?"
2. Enter your email address
3. Check your email for the reset code
4. Enter the code in the verification form
5. Set a new password
6. Verify you can login with the new password
7. Verify you cannot login with the old password

### Test Email Verification
1. Register a new account
2. Check your email for the verification code
3. Enter the code in the verification form
4. Verify you can now login with the new account
5. Try to login before verifying and confirm it's not allowed

### Test Two-Factor Authentication
1. Login to your account
2. Go to Profile > Security and enable 2FA
3. Verify you receive a setup code via email
4. Enter the code to complete 2FA setup
5. Logout and login again
6. Verify you are prompted for a 2FA code
7. Enter the code from your email
8. Verify you can access your account

## 3. Rate Limiting Testing

### Test Login Rate Limiting
1. Attempt to login with incorrect credentials 10+ times
2. Verify you receive a "Too many attempts" message
3. Wait an hour and try again
4. Verify you can attempt to login again

### Test Password Reset Rate Limiting
1. Request password reset for the same email 5+ times
2. Verify you receive a "Too many attempts" message
3. Wait an hour and try again
4. Verify you can request a password reset again

## 4. XSS Protection Testing

### Test Input Sanitization
1. Try entering HTML/JavaScript in form fields:
   ```
   <script>alert('XSS')</script>
   ```
2. Submit the form
3. Verify the input is properly sanitized or escaped

### Test Content Security Policy
1. Open browser developer tools
2. Go to Console tab
3. Try to execute JavaScript:
   ```javascript
   document.cookie
   ```
4. Verify CSP blocks access to sensitive information

## 5. CSRF Protection Testing

### Test Form Submissions
1. Login to the platform
2. Open a form (e.g., profile update)
3. Wait for a long time (session should still be valid)
4. Submit the form
5. Verify the action is completed successfully

## 6. Session Fixation Testing

### Test Session Regeneration
1. Login to the platform
2. Note your PHP session ID (from cookies)
3. Perform sensitive actions (change password, etc.)
4. Check if your session ID has changed
5. Verify old session ID is no longer valid

## 7. Remember Token Security

### Test Token Rotation
1. Login with "Remember Me" checked
2. Note the remember token value
3. Logout and login again with "Remember Me"
4. Verify the remember token has changed

### Test Token Expiration
1. Login with "Remember Me" checked
2. Manually modify the token's expiration in the database to a past date
3. Close and reopen the browser
4. Verify you are required to login again

## 8. Database Security Testing

### Test SQL Injection Protection
1. Try entering SQL injection payloads in login form:
   ```
   ' OR 1=1 --
   ```
2. Verify login fails and no database errors are exposed

## 9. API Security Testing

### Test API Authentication
1. Use tools like Postman to make API requests without authentication
2. Verify requests are rejected with appropriate error messages
3. Test with expired/invalid tokens
4. Verify proper error handling

## 10. Cleanup Script Testing

### Test Token Cleanup
1. Create multiple expired tokens in the database
2. Run the cleanup script: `php cleanup_expired_tokens.php`
3. Verify expired tokens are removed
4. Verify valid tokens remain untouched

## Reporting Security Issues

If you discover any security vulnerabilities during testing, please report them immediately to:

- **Email:** admin@fxgold.shop
- **Subject:** Security Vulnerability Report

Please provide detailed steps to reproduce the issue and any relevant information that could help address the vulnerability.