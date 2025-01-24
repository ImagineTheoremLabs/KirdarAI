// src/services/scenarioService.js
class ScenarioService {
  async getScenarios() {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching scenarios with token:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5001/api/scenarios', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Scenarios response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch scenarios:', errorData);
        throw new Error(errorData.message || 'Failed to fetch scenarios');
      }

      const data = await response.json();
      console.log('Fetched scenarios:', data);
      return data;
    } catch (error) {
      console.error('Detailed error in getScenarios:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      throw error;
    }
  }
}

export default new ScenarioService();