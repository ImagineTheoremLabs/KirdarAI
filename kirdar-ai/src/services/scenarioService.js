// src/services/scenarioService.js
import ApiService from './apiService';

class ScenarioService {
  /**
   * Get all scenarios
   * @returns {Promise<Array>} - List of scenarios
   */
  async getScenarios() {
    return ApiService.getScenarios();
  }

  /**
   * Get a scenario by ID
   * @param {string} id - Scenario ID
   * @returns {Promise<Object>} - The scenario
   */
  async getScenario(id) {
    return ApiService.getScenario(id);
  }

  /**
   * Create a new scenario
   * @param {Object} scenarioData - The scenario data
   * @returns {Promise<Object>} - The created scenario
   */
  async createScenario(scenarioData) {
    try {
      // Validate scenario data before sending
      const requiredFields = ['title', 'description', 'domain', 'category'];
      const missingFields = requiredFields.filter(field => !scenarioData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      return ApiService.createScenario(scenarioData);
    } catch (error) {
      console.error('Error creating scenario:', error);
      throw error;
    }
  }

  /**
   * Update a scenario
   * @param {string} id - Scenario ID
   * @param {Object} scenarioData - Updated scenario data
   * @returns {Promise<Object>} - The updated scenario
   */
  async updateScenario(id, scenarioData) {
    return ApiService.updateScenario(id, scenarioData);
  }

  /**
   * Delete a scenario
   * @param {string} id - Scenario ID
   * @returns {Promise<Object>} - Result of deletion
   */
  async deleteScenario(id) {
    return ApiService.deleteScenario(id);
  }
}

export default new ScenarioService();