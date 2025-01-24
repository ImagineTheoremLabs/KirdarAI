// src/config/config.js
const API_BASE_URL = 'http://localhost:5001/api';

export const ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    ME: `${API_BASE_URL}/auth/me`
  },
  USER: {
    QUESTIONNAIRE: `${API_BASE_URL}/user/questionnaire`,
    PROGRESS: `${API_BASE_URL}/user/progress`,
    SCENARIO: `${API_BASE_URL}/user/progress/scenario`
  }
};

export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include'
};