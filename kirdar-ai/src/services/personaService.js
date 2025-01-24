// src/services/personaService.js
class PersonaService {
  async generatePersonas(description, numPersonas = 1, isNameOnly = false) {
    try {
      console.log('Starting batch persona generation:', { description, numPersonas, isNameOnly });
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      if (numPersonas > 20) {
        throw new Error('Maximum number of personas exceeded (limit: 20)');
      }

      const response = await fetch('http://localhost:5001/api/personas/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description,
          numPersonas,
          isNameOnly
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const personas = await response.json();
      
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

  async createPersona(personaData) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Validate persona data before sending
      const requiredFields = ['name', 'age', 'income', 'portfolio', 'riskTolerance', 'goals', 'concerns', 'knowledgeLevel'];
      const missingFields = requiredFields.filter(field => !personaData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const response = await fetch('http://localhost:5001/api/personas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(personaData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create persona');
      }

      const createdPersona = await response.json();
      console.log('Successfully created persona:', createdPersona);
      return createdPersona;
    } catch (error) {
      console.error('Error creating persona:', error);
      throw error;
    }
  }

  async createBulkPersonas(personas) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

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
}

export default new PersonaService();