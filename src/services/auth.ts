import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';
import { sendVerificationEmail, sendPasswordResetEmail } from './email';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  is_verified: boolean;
}

export const register = async (
  email: string,
  password: string,
  fullName: string,
  phone: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Check if user exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return { success: false, message: 'Email already registered' };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = uuidv4();

    // Create user
    const userId = uuidv4();
    await db.execute(
      'INSERT INTO users (id, email, password, full_name, phone, verification_token) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, email, hashedPassword, fullName, phone, verificationToken]
    );

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    return { success: true, message: 'Registration successful. Please verify your email.' };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Registration failed' };
  }
};

export const login = async (
  email: string,
  password: string,
  ipAddress: string
): Promise<{ success: boolean; message: string; token?: string }> => {
  try {
    // Get user
    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    const user = Array.isArray(users) && users[0];

    if (!user) {
      return { success: false, message: 'Invalid credentials' };
    }

    // Check if account is locked
    if (user.login_attempts >= 5 && user.last_failed_login) {
      const lockoutTime = new Date(user.last_failed_login);
      lockoutTime.setMinutes(lockoutTime.getMinutes() + 15);
      if (new Date() < lockoutTime) {
        return { success: false, message: 'Account is locked. Please try again later.' };
      }
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Update failed login attempts
      await db.execute(
        'UPDATE users SET login_attempts = login_attempts + 1, last_failed_login = NOW() WHERE id = ?',
        [user.id]
      );
      return { success: false, message: 'Invalid credentials' };
    }

    // Check if email is verified
    if (!user.is_verified) {
      return { success: false, message: 'Please verify your email before logging in' };
    }

    // Reset login attempts and update last login
    await db.execute(
      'UPDATE users SET login_attempts = 0, last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Log successful login
    await db.execute(
      'INSERT INTO audit_logs (id, user_id, action, ip_address, details) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), user.id, 'login', ipAddress, JSON.stringify({ success: true })]
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return { success: true, message: 'Login successful', token };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Login failed' };
  }
};

export const verifyEmail = async (token: string): Promise<boolean> => {
  try {
    const [result] = await db.execute(
      'UPDATE users SET is_verified = true, verification_token = NULL WHERE verification_token = ?',
      [token]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Email verification error:', error);
    return false;
  }
};

export const requestPasswordReset = async (email: string): Promise<boolean> => {
  try {
    const [users] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    const user = Array.isArray(users) && users[0];

    if (!user) {
      return false;
    }

    const resetToken = uuidv4();
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1);

    await db.execute(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [resetToken, resetTokenExpires, user.id]
    );

    await sendPasswordResetEmail(email, resetToken);
    return true;
  } catch (error) {
    console.error('Password reset request error:', error);
    return false;
  }
};

export const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
  try {
    const [users] = await db.execute(
      'SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );
    const user = Array.isArray(users) && users[0];

    if (!user) {
      return false;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.execute(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    return true;
  } catch (error) {
    console.error('Password reset error:', error);
    return false;
  }
};