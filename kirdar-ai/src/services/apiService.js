// src/services/apiService.js
import { API_BASE_URL, API_ENDPOINTS, API_CONFIG, getAuthHeaders, getGuestHeaders } from '../config/config';

/**
 * Centralized API service for handling all API requests
 */
class ApiService {
  // Track API connectivity status
  static isApiConnected = true;
  static connectionCheckInProgress = false;
  static connectionCheckTimeout = null;
  static initialized = false;
  static retryCount = 0;
  static maxRetries = 3;
  static retryDelay = 5000; // 5 seconds
  static healthEndpoints = [
    '/api/chat/health',
    '/api/health',
    '/health'
  ];
  
  // Alternative base URLs to try if the primary one fails
  static alternativeBaseUrls = [
    // Try HTTP if HTTPS fails (or vice versa)
    API_BASE_URL.replace('https://', 'http://'),
    API_BASE_URL.replace('http://', 'https://'),
    // Try without the /api suffix
    API_BASE_URL.replace('/api', ''),
    // Try different port
    API_BASE_URL.replace(':5001', ':5000'),
  ].filter(url => url !== API_BASE_URL); // Remove duplicates
  
  // Current active base URL
  static activeBaseUrl = API_BASE_URL;

  /**
   * Initialize the API service
   * @returns {Promise<void>}
   */
  static async init() {
    if (this.initialized) return;
    
    console.log('Initializing API Service...');
    await this.checkApiConnectivity();
    this.initialized = true;
    
    console.log(`API Service initialized. API is ${this.isApiConnected ? 'connected' : 'disconnected'}.`);
    console.log(`Active API Base URL: ${this.activeBaseUrl}`);
    
    // Set up periodic health checks
    this.scheduleHealthCheck();
  }

  /**
   * Schedule a health check to run periodically
   */
  static scheduleHealthCheck() {
    clearTimeout(this.connectionCheckTimeout);
    this.connectionCheckTimeout = setTimeout(() => {
      this.checkApiConnectivity()
        .then(() => this.scheduleHealthCheck())
        .catch(() => this.scheduleHealthCheck());
    }, 30000); // Check every 30 seconds
  }

  /**
   * Check if the API is reachable by trying multiple endpoints and URLs
   * @returns {Promise<boolean>} - Whether the API is reachable
   */
  static async checkApiConnectivity() {
    if (this.connectionCheckInProgress) {
      return this.isApiConnected;
    }

    this.connectionCheckInProgress = true;
    
    // First try with the active base URL
    const isConnected = await this.tryConnectWithBaseUrl(this.activeBaseUrl);
    
    // If not connected, try alternative base URLs
    if (!isConnected) {
      for (const alternativeUrl of this.alternativeBaseUrls) {
        console.log(`Trying alternative base URL: ${alternativeUrl}`);
        const connected = await this.tryConnectWithBaseUrl(alternativeUrl);
        if (connected) {
          // If this alternative works, make it the active URL
          this.activeBaseUrl = alternativeUrl;
          console.log(`Switched to working base URL: ${this.activeBaseUrl}`);
          this.isApiConnected = true;
          this.connectionCheckInProgress = false;
          
          // Emit an event that components can listen for
          window.dispatchEvent(new CustomEvent('api-connection-change', { 
            detail: { connected: true, baseUrl: this.activeBaseUrl } 
          }));
          
          return true;
        }
      }
    }
    
    this.connectionCheckInProgress = false;
    return this.isApiConnected;
  }
  
  /**
   * Try to connect to the API using a specific base URL
   * @param {string} baseUrl - The base URL to try
   * @returns {Promise<boolean>} - Whether the connection was successful
   */
  static async tryConnectWithBaseUrl(baseUrl) {
    // Try each health endpoint until one succeeds
    for (const endpoint of this.healthEndpoints) {
      try {
        console.log(`Checking API connectivity with endpoint: ${baseUrl}${endpoint}`);
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: 'GET',
          headers: API_CONFIG.headers,
          // Short timeout to quickly detect connection issues
          signal: AbortSignal.timeout(3000)
        });
        
        if (response.ok) {
          this.isApiConnected = true;
          this.retryCount = 0;
          return true;
        }
      } catch (error) {
        console.warn(`API connectivity check failed for ${baseUrl}${endpoint}:`, error);
        // Continue to the next endpoint
      }
    }
    
    return false;
  }

  /**
   * Make a request to the API with automatic retry for connection issues
   * @param {string} endpoint - The API endpoint
   * @param {Object} options - Request options
   * @param {boolean} shouldRetry - Whether to retry on failure
   * @returns {Promise<any>} - The response data
   * @throws {Error} - If the request fails
   */
  static async request(endpoint, options = {}, shouldRetry = true) {
    try {
      const url = `${this.activeBaseUrl}${endpoint}`;
      console.log(`API Request: ${options.method || 'GET'} ${url}`);
      
      // If we've previously detected connectivity issues, check again before making the request
      if (!this.isApiConnected) {
        await this.checkApiConnectivity();
        if (!this.isApiConnected && this.retryCount >= this.maxRetries) {
          throw new Error('Unable to connect to the server after multiple attempts. Please check your internet connection or try again later.');
        }
      }
      
      let response;
      try {
        response = await fetch(url, {
          ...API_CONFIG,
          ...options,
          headers: {
            ...API_CONFIG.headers,
            ...options.headers,
          },
        });
      } catch (fetchError) {
        // Handle network errors like CORS, connection refused, etc.
        console.error('Network Error:', fetchError);
        
        // Mark API as disconnected
        this.isApiConnected = false;
        
        // Emit an event that components can listen for
        window.dispatchEvent(new CustomEvent('api-connection-change', { 
          detail: { connected: false } 
        }));
        
        // Try alternative base URLs before giving up
        if (shouldRetry) {
          for (const alternativeUrl of this.alternativeBaseUrls) {
            try {
              console.log(`Trying alternative base URL for request: ${alternativeUrl}`);
              const altUrl = `${alternativeUrl}${endpoint}`;
              
              response = await fetch(altUrl, {
                ...API_CONFIG,
        ...options,
        headers: {
                  ...API_CONFIG.headers,
          ...options.headers,
        },
      });

              // If successful, update the active base URL
              this.activeBaseUrl = alternativeUrl;
              this.isApiConnected = true;
              
              // Emit an event that components can listen for
              window.dispatchEvent(new CustomEvent('api-connection-change', { 
                detail: { connected: true, baseUrl: this.activeBaseUrl } 
              }));
              
              console.log(`Request succeeded with alternative base URL: ${this.activeBaseUrl}`);
              break;
            } catch (altError) {
              console.warn(`Alternative base URL failed: ${alternativeUrl}`, altError);
              // Continue to the next alternative
            }
          }
        }
        
        // If we still don't have a response, implement retry logic or throw error
        if (!response) {
          // Implement retry logic for connection errors
          if (shouldRetry && this.retryCount < this.maxRetries) {
            this.retryCount++;
            console.log(`Retrying request (${this.retryCount}/${this.maxRetries}) after ${this.retryDelay}ms...`);
            
            return new Promise((resolve, reject) => {
              setTimeout(() => {
                this.request(endpoint, options, shouldRetry)
                  .then(resolve)
                  .catch(reject);
              }, this.retryDelay);
            });
          }
          
          const error = new Error(
            fetchError.message === 'Failed to fetch' 
              ? 'Unable to connect to the server. Please check your internet connection or contact support.'
              : fetchError.message
          );
          error.status = 0;
          error.isConnectionError = true;
          throw error;
        }
      }

      // If we get here, we're connected
      if (!this.isApiConnected) {
        this.isApiConnected = true;
        this.retryCount = 0;
        
        // Emit an event that components can listen for
        window.dispatchEvent(new CustomEvent('api-connection-change', { 
          detail: { connected: true } 
        }));
      }

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
        try {
          // Try to parse as JSON anyway in case the content-type is wrong
          data = JSON.parse(data);
        } catch (e) {
          // Keep as text if it's not valid JSON
        }
      }

      if (!response.ok) {
        const error = new Error(
          typeof data === 'object' && data.message 
            ? data.message 
            : 'API request failed'
        );
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * Get the authentication token from localStorage
   * @returns {string|null} - The authentication token
   */
  static getToken() {
    return localStorage.getItem('token');
  }

  /**
   * Set the authentication token in localStorage
   * @param {string} token - The authentication token
   */
  static setToken(token) {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  /**
   * Check if the user is authenticated
   * @returns {boolean} - Whether the user is authenticated
   */
  static isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Make an authenticated request to the API
   * @param {string} endpoint - The API endpoint
   * @param {Object} options - Request options
   * @returns {Promise<any>} - The response data
   * @throws {Error} - If the user is not authenticated or the request fails
   */
  static async authenticatedRequest(endpoint, options = {}) {
    const token = this.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    return this.request(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /**
   * Make a guest request to the API
   * @param {string} endpoint - The API endpoint
   * @param {string} guestCode - The guest code
   * @param {Object} options - Request options
   * @returns {Promise<any>} - The response data
   * @throws {Error} - If the guest code is not provided or the request fails
   */
  static async guestRequest(endpoint, guestCode, options = {}) {
    if (!guestCode) {
      throw new Error('Guest code required');
    }

    return this.request(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        GuestCode: guestCode,
      },
    });
  }

  // Auth endpoints
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password
   * @param {string} userData.name - User's name
   * @returns {Promise<Object>} - Registration response
   */
  static async register(userData) {
    return this.request(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Log in a user
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User's email
   * @param {string} credentials.password - User's password
   * @returns {Promise<Object>} - Login response with token
   */
  static async login(credentials) {
    const response = await this.request(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  /**
   * Log out the current user
   * @returns {Promise<Object>} - Logout response
   */
  static async logout() {
    this.setToken(null);
    return { success: true };
  }

  /**
   * Get the current user's profile
   * @returns {Promise<Object>} - User profile data
   */
  static async getProfile() {
    return this.authenticatedRequest(API_ENDPOINTS.AUTH.ME);
  }

  // User endpoints
  /**
   * Update the current user's profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<Object>} - Updated profile
   */
  static async updateProfile(profileData) {
    return this.authenticatedRequest(API_ENDPOINTS.USER.PROFILE, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Persona endpoints
  /**
   * Get all personas for the current user
   * @returns {Promise<Array>} - List of personas
   */
  static async getPersonas() {
    return this.authenticatedRequest(API_ENDPOINTS.PERSONAS.LIST);
  }

  /**
   * Get a specific persona by ID
   * @param {string} id - Persona ID
   * @returns {Promise<Object>} - Persona details
   */
  static async getPersona(id) {
    return this.authenticatedRequest(API_ENDPOINTS.PERSONAS.DETAILS(id));
  }

  /**
   * Create a new persona
   * @param {Object} personaData - Persona data
   * @returns {Promise<Object>} - Created persona
   */
  static async createPersona(personaData) {
    return this.authenticatedRequest(API_ENDPOINTS.PERSONAS.LIST, {
      method: 'POST',
      body: JSON.stringify(personaData),
    });
  }

  /**
   * Update an existing persona
   * @param {string} id - Persona ID
   * @param {Object} personaData - Updated persona data
   * @returns {Promise<Object>} - Updated persona
   */
  static async updatePersona(id, personaData) {
    return this.authenticatedRequest(API_ENDPOINTS.PERSONAS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(personaData),
    });
  }

  /**
   * Delete a persona
   * @param {string} id - Persona ID
   * @returns {Promise<Object>} - Deletion response
   */
  static async deletePersona(id) {
    return this.authenticatedRequest(API_ENDPOINTS.PERSONAS.DELETE(id), {
      method: 'DELETE',
    });
  }

  /**
   * Generate personas using AI
   * @param {string} description - Description to base personas on
   * @param {number} numPersonas - Number of personas to generate
   * @param {boolean} isNameOnly - Whether to generate only names
   * @param {string} category - Category to assign to generated personas
   * @returns {Promise<Array>} - Generated personas
   */
  static async generatePersonas(description, numPersonas = 1, isNameOnly = false, category = null) {
    return this.authenticatedRequest(API_ENDPOINTS.PERSONAS.GENERATE, {
      method: 'POST',
      body: JSON.stringify({
        description,
        numPersonas,
        isNameOnly,
        category
      }),
    });
  }

  /**
   * Create multiple personas at once
   * @param {Array} personas - Array of persona objects
   * @returns {Promise<Object>} - Creation response
   */
  static async createBulkPersonas(personas) {
    return this.authenticatedRequest(API_ENDPOINTS.PERSONAS.BULK_CREATE, {
      method: 'POST',
      body: JSON.stringify({ personas }),
    });
  }

  /**
   * Reset personas to default
   * @returns {Promise<Object>} - Reset response
   */
  static async resetPersonas() {
    return this.authenticatedRequest(API_ENDPOINTS.PERSONAS.RESET, {
      method: 'POST',
    });
  }

  /**
   * Search for personas
   * @param {string} query - Search query
   * @returns {Promise<Array>} - Matching personas
   */
  static async searchPersonas(query) {
    return this.authenticatedRequest(`${API_ENDPOINTS.PERSONAS.SEARCH}?query=${encodeURIComponent(query)}`);
  }

  // Scenario endpoints
  /**
   * Get all scenarios
   * @returns {Promise<Array>} - List of all scenarios
   */
  static async getScenarios() {
    return this.authenticatedRequest(API_ENDPOINTS.SCENARIOS.LIST);
  }

  /**
   * Get scenarios filtered by domain
   * @param {string} domain - Domain to filter by
   * @returns {Promise<Array>} - List of scenarios in the specified domain
   */
  static async getScenariosByDomain(domain) {
    return this.authenticatedRequest(API_ENDPOINTS.SCENARIOS.LIST_BY_DOMAIN(domain));
  }

  /**
   * Get a specific scenario by ID
   * @param {string} id - Scenario ID
   * @returns {Promise<Object>} - Scenario details
   */
  static async getScenario(id) {
    return this.authenticatedRequest(API_ENDPOINTS.SCENARIOS.DETAILS(id));
  }

  /**
   * Create a new scenario
   * @param {Object} scenarioData - Scenario data
   * @returns {Promise<Object>} - Created scenario
   */
  static async createScenario(scenarioData) {
    return this.authenticatedRequest(API_ENDPOINTS.SCENARIOS.CREATE, {
      method: 'POST',
      body: JSON.stringify(scenarioData),
    });
  }

  /**
   * Update an existing scenario
   * @param {string} id - Scenario ID
   * @param {Object} scenarioData - Updated scenario data
   * @returns {Promise<Object>} - Updated scenario
   */
  static async updateScenario(id, scenarioData) {
    return this.authenticatedRequest(API_ENDPOINTS.SCENARIOS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(scenarioData),
    });
  }

  /**
   * Delete a scenario
   * @param {string} id - Scenario ID
   * @returns {Promise<Object>} - Deletion response
   */
  static async deleteScenario(id) {
    return this.authenticatedRequest(API_ENDPOINTS.SCENARIOS.DELETE(id), {
      method: 'DELETE',
    });
  }

  // Chat endpoints
  /**
   * Send a chat message as an authenticated user
   * @param {string} message - The message text to send
   * @param {Array} conversationHistory - Previous messages in the conversation
   * @param {string} type - The type of conversation (e.g., 'scenario', 'persona')
   * @param {Object} context - Additional context for the conversation
   * @returns {Promise<Object>} - The response from the API
   */
  static async sendChatMessage(message, conversationHistory, type, context) {
    return this.authenticatedRequest(API_ENDPOINTS.CHAT.SEND, {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversationHistory,
        type,
        context
      }),
    });
  }

  /**
   * Send a chat message as a guest user
   * @param {string} guestCode - The guest access code
   * @param {string} message - The message text to send
   * @param {Array} conversationHistory - Previous messages in the conversation
   * @param {string} type - The type of conversation (e.g., 'scenario', 'persona')
   * @param {Object} context - Additional context for the conversation
   * @returns {Promise<Object>} - The response from the API
   */
  static async sendGuestChatMessage(guestCode, message, conversationHistory, type, context) {
    return this.guestRequest(API_ENDPOINTS.GUEST.CHAT, guestCode, {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversationHistory,
        type,
        context
      }),
    });
  }

  /**
   * Request an evaluation of a chat conversation
   * @param {Array} messages - The messages to evaluate
   * @returns {Promise<Object>} - The evaluation results
   */
  static async evaluateChat(messages) {
    return this.authenticatedRequest(API_ENDPOINTS.CHAT.EVALUATE, {
      method: 'POST',
      body: JSON.stringify({ messages }),
    });
  }

  /**
   * Request an evaluation of a guest chat conversation
   * @param {string} guestCode - The guest access code
   * @param {Array} messages - The messages to evaluate
   * @returns {Promise<Object>} - The evaluation results
   */
  static async evaluateGuestChat(guestCode, messages) {
    return this.guestRequest(API_ENDPOINTS.GUEST.EVALUATE, guestCode, {
      method: 'POST',
      body: JSON.stringify({ messages }),
    });
  }

  /**
   * Get mentor suggestions for a chat conversation
   * @param {Array} messages - The messages to analyze
   * @returns {Promise<Object>} - The mentor suggestions
   */
  static async getMentorSuggestions(messages) {
    return this.authenticatedRequest(API_ENDPOINTS.CHAT.MENTOR, {
      method: 'POST',
      body: JSON.stringify({ messages }),
    });
  }

  /**
   * Get mentor suggestions for a guest chat conversation
   * @param {string} guestCode - The guest access code
   * @param {Array} messages - The messages to analyze
   * @returns {Promise<Object>} - The mentor suggestions
   */
  static async getGuestMentorSuggestions(guestCode, messages) {
    return this.guestRequest(API_ENDPOINTS.GUEST.MENTOR, guestCode, {
      method: 'POST',
      body: JSON.stringify({ messages }),
    });
  }

  /**
   * Check the health status of the chat service
   * @returns {Promise<Object>} - The health status
   */
  static async checkChatHealth() {
    return this.request(API_ENDPOINTS.CHAT.HEALTH);
  }

  /**
   * Validate a guest code
   * @param {string} guestCode - The guest code to validate
   * @returns {Promise<Object>} - The validation result
   */
  static async validateGuestCode(guestCode) {
    return this.request(API_ENDPOINTS.GUEST.VALIDATE, {
      method: 'POST',
      body: JSON.stringify({ code: guestCode }),
    });
  }
}

export default ApiService;