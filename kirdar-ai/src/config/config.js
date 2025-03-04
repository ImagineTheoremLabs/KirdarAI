// src/config/config.js

/**
 * Determine the API base URL with fallbacks
 * 1. Use environment variable if available
 * 2. Try HTTPS on EC2 instance
 * 3. Try HTTP on EC2 instance
 * 4. Use localhost for development
 */
const determineApiBaseUrl = () => {
  // Environment variable takes precedence
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // For local development
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5001/api';
  }
  
  // For production, try HTTPS first
  const ec2Domain = 'ec2-18-232-67-55.compute-1.amazonaws.com';
  
  // Check if we're already on the EC2 domain
  if (window.location.hostname === ec2Domain) {
    return `${window.location.protocol}//${ec2Domain}:5001/api`;
  }
  
  // Otherwise use the full URL with HTTPS
  return 'https://ec2-18-232-67-55.compute-1.amazonaws.com:5001/api';
};

const API_BASE_URL = determineApiBaseUrl();

// Export for direct use in components
export { API_BASE_URL };

// Standardized API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    ME: '/api/auth/me'
  },
  USER: {
    PROFILE: '/api/user/profile',
    QUESTIONNAIRE: '/api/user/questionnaire',
    PROGRESS: '/api/user/progress',
    SCENARIO: '/api/user/progress/scenario'
  },
  PERSONAS: {
    LIST: '/api/personas',
    GENERATE: '/api/personas/generate',
    BULK_CREATE: '/api/personas/bulk',
    DETAILS: (id) => `/api/personas/${id}`,
    UPDATE: (id) => `/api/personas/${id}`,
    DELETE: (id) => `/api/personas/${id}`,
    RESET: '/api/personas/reset',
    SEARCH: '/api/personas/search'
  },
  SCENARIOS: {
    LIST: '/api/scenarios',
    LIST_BY_DOMAIN: (domain) => `/api/scenarios?domain=${domain}`,
    DETAILS: (id) => `/api/scenarios/${id}`,
    CREATE: '/api/scenarios',
    UPDATE: (id) => `/api/scenarios/${id}`,
    DELETE: (id) => `/api/scenarios/${id}`
  },
  CHAT: {
    SEND: '/api/chat',
    EVALUATE: '/api/chat/evaluate',
    MENTOR: '/api/chat/mentor',
    HEALTH: '/api/chat/health'
  },
  GUEST: {
    CHAT: '/api/guest/chat',
    EVALUATE: '/api/guest/chat/evaluate',
    MENTOR: '/api/guest/chat/mentor',
    VALIDATE: '/api/guest/validate-code'
  },
  ADMIN: {
    USERS: '/api/admin/users',
    STATS: '/api/admin/stats'
  }
};

// Standard API request configuration
export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json'
  }
};

// Helper function to get auth headers
export const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

// Helper function to get guest headers
export const getGuestHeaders = (guestCode) => ({
  'Content-Type': 'application/json',
  'GuestCode': guestCode
});