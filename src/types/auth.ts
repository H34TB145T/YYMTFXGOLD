// Authentication API response types
export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  requires2FA?: boolean;
  userId?: string;
  requiresVerification?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  fullName: string;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface Verify2FARequest {
  email: string;
  otp: string;
  userId: string;
  rememberMe?: boolean;
}

export interface Toggle2FARequest {
  userId: string;
  enable: boolean;
}

export interface UpdateUsernameRequest {
  userId: string;
  newUsername: string;
}

export interface ChangePasswordRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

// Session management types
export interface SessionData {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

export interface RememberToken {
  id: number;
  userId: string;
  token: string;
  selector: string;
  expiresAt: string;
  createdAt: string;
}

// Rate limiting types
export interface LoginAttempt {
  id: number;
  ipAddress: string;
  action: string;
  attemptTime: string;
}