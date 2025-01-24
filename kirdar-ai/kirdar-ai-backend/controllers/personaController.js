// controllers/personaController.js
const generatePersonas = async (req, res) => {
  try {
    console.log('Starting persona generation...');
    const { description, numPersonas = 1, isNameOnly = false } = req.body;

    // Validate request
    if (numPersonas > 20) {
      throw new Error('Maximum number of personas (20) exceeded');
    }

    if (!description) {
      throw new Error('Description is required');
    }

    

    // Define base prompts
    const baseSystemPrompt = isNameOnly
      ? `You are a financial services expert that creates detailed client personas. Generate variations of "${description}" as financial advisory clients. Use the exact name but create different realistic variations.`
      : `You are a financial services expert that creates detailed client personas. Generate unique client personas matching this description: "${description}". Each persona should have realistic characteristics for a financial advisory client.`;

    const systemPrompt = `${baseSystemPrompt}

Important Guidelines:
1. Each persona must be completely unique
2. Generate realistic and diverse characteristics
3. Ensure proper JSON formatting with no invalid characters
4. All numeric fields must be actual numbers (not strings)
5. Risk tolerance must be exactly "Low", "Moderate", or "High"
6. Knowledge level must be exactly "Basic", "Intermediate", or "Advanced"
7. Age must be between 25 and 75
8. Include specific, detailed goals and concerns`;

    const userPrompt = `Create a JSON object containing a "personas" array with ${numPersonas} detailed financial client personas.

Required exact format:
{
  "personas": [
    {
      "name": "${isNameOnly ? description : '[UNIQUE FULL NAME]'}",
      "age": [number between 25-75],
      "income": "[annual income with currency]",
      "portfolio": "[current investment/portfolio details]",
      "riskTolerance": "[Exactly one of: Low, Moderate, High]",
      "goals": "[specific financial goals]",
      "concerns": "[specific financial concerns]",
      "knowledgeLevel": "[Exactly one of: Basic, Intermediate, Advanced]"
    }
  ]
}

Ensure:
1. Each persona has ALL required fields
2. Age is a NUMBER (not a string)
3. Risk tolerance and knowledge level use exact specified values
4. No trailing commas in JSON
5. Generate ${numPersonas} UNIQUE personas`;

    console.log('Making request to OpenAI with prompts:', { systemPrompt, userPrompt });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Received response from OpenAI:', data.choices[0].message.content);

    // Parse and validate response
    let result;
    try {
      result = JSON.parse(data.choices[0].message.content);
      
      if (!result.personas || !Array.isArray(result.personas)) {
        throw new Error('Response is missing personas array');
      }

      // Validate number of personas
      if (result.personas.length !== numPersonas) {
        throw new Error(`Expected ${numPersonas} personas but got ${result.personas.length}`);
      }

      // Validate each persona
      result.personas.forEach((persona, index) => {
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

        // Ensure all string fields have content
        ['name', 'income', 'portfolio', 'goals', 'concerns'].forEach(field => {
          if (typeof persona[field] !== 'string' || !persona[field].trim()) {
            throw new Error(`Invalid or empty ${field} in persona ${index + 1}`);
          }
        });
      });

    } catch (parseError) {
      console.error('JSON parsing/validation error:', parseError);
      throw new Error('Failed to parse or validate OpenAI response: ' + parseError.message);
    }

    console.log('Successfully validated personas:', result.personas);
    res.json(result.personas);

  } catch (error) {
    console.error('Error in generatePersonas:', error);
    res.status(500).json({
      message: error.message || 'Failed to generate personas',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Allow batch creation of personas
const createBulkPersonas = async (req, res) => {
  try {
    const { personas } = req.body;
    
    if (!Array.isArray(personas)) {
      throw new Error('Invalid request format. Expected array of personas.');
    }

    if (personas.length > 20) {
      throw new Error('Cannot create more than 20 personas at once');
    }

    const results = await Promise.all(
      personas.map(async (personaData) => {
        try {
          const persona = new Persona({
            ...personaData,
            createdBy: req.user._id
          });
          await persona.save();
          return { success: true, data: persona };
        } catch (error) {
          return { success: false, error: error.message };
        }
      })
    );

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    res.json({
      message: `Created ${successful.length} personas, ${failed.length} failed`,
      successful: successful.map(r => r.data),
      failed: failed.map(r => r.error)
    });

  } catch (error) {
    console.error('Error in createBulkPersonas:', error);
    res.status(500).json({
      message: error.message || 'Failed to create personas',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const getPersonas = async (req, res) => {
  try {
    if (req.user.isAdmin) {
      // Admins see all personas
      const personas = await Persona.find({ isActive: true });
      return res.json(personas);
    }

    // For trainees, only return assigned personas
    const assignments = await PersonaAssignment.find({ 
      userId: req.user._id,
      status: 'active'
    }).populate('personaId');

    // Extract the personas from assignments and filter out any null values
    const personas = assignments
      .map(assignment => assignment.personaId)
      .filter(persona => persona);
    
    console.log(`Fetching personas for trainee ${req.user._id}, found ${personas.length} assigned personas`);
    res.json(personas);
  } catch (error) {
    console.error('Error fetching personas:', error);
    res.status(500).json({ message: 'Failed to fetch personas' });
  }
};

module.exports = { 
  generatePersonas,
  createBulkPersonas,
  getPersonas 
};