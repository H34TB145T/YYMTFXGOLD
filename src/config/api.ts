// API configuration for production
export const API_CONFIG = {
  // Updated to use your actual domain
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://fxgold.shop/api' 
    : 'http://localhost/api',
  
  ENDPOINTS: {
    AUTH: '/auth.php',
    USERS: '/users.php', 
    ORDERS: '/orders.php',
    CRYPTO: '/crypto.php'
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 10000,
  
  // Default headers
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// API utility functions
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...API_CONFIG.HEADERS,
      ...options.headers
    }
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};