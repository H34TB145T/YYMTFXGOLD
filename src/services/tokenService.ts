// Token expiration times
const TOKEN_EXPIRY = {
  DEFAULT: 24 * 60 * 60 * 1000, // 24 hours
  REMEMBER_ME: 30 * 24 * 60 * 60 * 1000 // 30 days
};

/**
 * Generate a JWT-like token with expiration
 */
export const generateToken = (userId: string, rememberMe = false): string => {
  const now = Date.now();
  const expiresIn = rememberMe ? TOKEN_EXPIRY.REMEMBER_ME : TOKEN_EXPIRY.DEFAULT;
  const expiresAt = now + expiresIn;
  
  const payload = {
    userId,
    iat: Math.floor(now / 1000),
    exp: Math.floor(expiresAt / 1000)
  };
  
  // Simple base64 encoding (not a real JWT, but similar structure)
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const encodedPayload = btoa(JSON.stringify(payload));
  const signature = btoa('signature'); // Not a real signature
  
  return `${header}.${encodedPayload}.${signature}`;
};

/**
 * Verify if a token is valid and not expired
 */
export const verifyToken = (token: string): { valid: boolean; userId?: string } => {
  try {
    // Split the token and get the payload
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false };
    }
    
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    // Check if token is expired
    if (payload.exp < now) {
      return { valid: false };
    }
    
    return { valid: true, userId: payload.userId };
  } catch (error) {
    console.error('Token verification error:', error);
    return { valid: false };
  }
};

/**
 * Store token in appropriate storage based on remember me preference
 */
export const storeToken = (token: string, rememberMe = false): void => {
  if (rememberMe) {
    localStorage.setItem('token', token);
    localStorage.setItem('persistentToken', token);
    sessionStorage.removeItem('token'); // Clear session storage to avoid conflicts
  } else {
    sessionStorage.setItem('token', token);
    localStorage.setItem('token', token);
    localStorage.removeItem('persistentToken'); // Clear persistent token to avoid conflicts
  }
};

/**
 * Get token from storage (checks both localStorage and sessionStorage)
 */
export const getToken = (): string | null => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

/**
 * Clear token from all storages
 */
export const clearToken = (): void => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  localStorage.removeItem('persistentToken');
};

/**
 * Get user ID from token
 */
export const getUserIdFromToken = (token: string): string | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId;
  } catch (error) {
    console.error('Error extracting user ID from token:', error);
    return null;
  }
};

/**
 * Refresh token if it's about to expire
 */
export const refreshTokenIfNeeded = (token: string, userId: string): string | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    
    // If token is going to expire in the next hour, refresh it
    if (payload.exp - now < 3600) {
      // Check if it was a remember-me token
      const isLongTerm = payload.exp - payload.iat > TOKEN_EXPIRY.DEFAULT / 1000;
      const newToken = generateToken(userId, isLongTerm);
      storeToken(newToken, isLongTerm);
      return newToken;
    }
    
    return token;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
};