// src/services/personaService.js
import ApiService from './apiService';

class PersonaService {
  /**
   * Generate personas based on a description
   * @param {string} description - Description to base personas on
   * @param {number} numPersonas - Number of personas to generate
   * @param {boolean} isNameOnly - Whether to generate only names
   * @returns {Promise<Array>} - The generated personas
   */
  async generatePersonas(description, numPersonas = 1, isNameOnly = false) {
    try {
      console.log('Starting batch persona generation:', { description, numPersonas, isNameOnly });
      
      if (numPersonas > 20) {
        throw new Error('Maximum number of personas exceeded (limit: 20)');
      }

      const personas = await ApiService.generatePersonas(description, numPersonas, isNameOnly);
      
      // Validate response data
      if (!Array.isArray(personas)) {
        console.error('Invalid response format:', personas);
        throw new Error('Invalid response format from server');
      }

      // Additional validation
      personas.forEach((persona, index) => {
        const requiredFields = ['name', 'age', 'income', 'portfolio', 'riskTolerance', 'goals', 'concerns', 'knowledgeLevel'];
        const missingFields = requiredFields.filter(field => !persona[field]);
        
        if (missingFields.length > 0) {
          throw new Error(`Persona ${index + 1} is missing required fields: ${missingFields.join(', ')}`);
        }

        // Validate field values
        if (typeof persona.age !== 'number' || persona.age < 25 || persona.age > 75) {
          throw new Error(`Invalid age in persona ${index + 1}`);
        }

        if (!['Low', 'Moderate', 'High'].includes(persona.riskTolerance)) {
          throw new Error(`Invalid risk tolerance in persona ${index + 1}`);
        }

        if (!['Basic', 'Intermediate', 'Advanced'].includes(persona.knowledgeLevel)) {
          throw new Error(`Invalid knowledge level in persona ${index + 1}`);
        }
      });

      console.log(`Successfully generated ${personas.length} personas`);
      return personas;
    } catch (error) {
      console.error('Error in generatePersonas:', error);
      throw error;
    }
  }

  /**
   * Create a single persona
   * @param {Object} personaData - The persona data
   * @returns {Promise<Object>} - The created persona
   */
  async createPersona(personaData) {
    try {
      // Validate persona data before sending
      const requiredFields = ['name', 'age', 'income', 'portfolio', 'riskTolerance', 'goals', 'concerns', 'knowledgeLevel'];
      const missingFields = requiredFields.filter(field => !personaData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const createdPersona = await ApiService.createPersona(personaData);
      console.log('Successfully created persona:', createdPersona);
      return createdPersona;
    } catch (error) {
      console.error('Error creating persona:', error);
      throw error;
    }
  }

  /**
   * Create multiple personas in bulk
   * @param {Array} personas - Array of persona data
   * @returns {Promise<Object>} - Results of bulk creation
   */
  async createBulkPersonas(personas) {
    try {
      const results = [];
      const errors = [];

      // Process personas in parallel but with a concurrency limit
      const batchSize = 5;
      for (let i = 0; i < personas.length; i += batchSize) {
        const batch = personas.slice(i, i + batchSize);
        const promises = batch.map(async (persona, index) => {
          try {
            const result = await this.createPersona(persona);
            results.push(result);
            return { success: true, data: result };
          } catch (error) {
            const errorInfo = {
              index: i + index,
              error: error.message,
              persona: persona
            };
            errors.push(errorInfo);
            return { success: false, error: errorInfo };
          }
        });

        await Promise.all(promises);
      }

      if (errors.length > 0) {
        console.warn('Some personas failed to create:', errors);
      }

      return {
        succeeded: results.length,
        failed: errors.length,
        errors: errors,
        personas: results
      };
    } catch (error) {
      console.error('Error in bulk persona creation:', error);
      throw error;
    }
  }

  /**
   * Get all personas
   * @returns {Promise<Array>} - List of personas
   */
  async getPersonas() {
    return ApiService.getPersonas();
  }

  /**
   * Get a persona by ID
   * @param {string} id - Persona ID
   * @returns {Promise<Object>} - The persona
   */
  async getPersona(id) {
    return ApiService.getPersona(id);
  }

  /**
   * Update a persona
   * @param {string} id - Persona ID
   * @param {Object} personaData - Updated persona data
   * @returns {Promise<Object>} - The updated persona
   */
  async updatePersona(id, personaData) {
    return ApiService.updatePersona(id, personaData);
  }

  /**
   * Delete a persona
   * @param {string} id - Persona ID
   * @returns {Promise<Object>} - Result of deletion
   */
  async deletePersona(id) {
    return ApiService.deletePersona(id);
  }
}

export default new PersonaService();