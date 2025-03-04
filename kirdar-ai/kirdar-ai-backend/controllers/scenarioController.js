// controllers/scenarioController.js

const OpenAI = require('openai');
const Scenario = require('../models/Scenario');
const ScenarioAssignment = require('../models/ScenarioAssignment');
const User = require('../models/User');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Default/seed scenarios array (with domain added for each scenario)
const defaultScenarios = [
  {
    domain: 'financial',
    title: "Portfolio Diversification Strategy",
    category: "Investment Planning",
    description: "A high-net-worth client seeks guidance on diversifying...",
    difficulty: "Intermediate",
    objectives: [
      "Assess current portfolio concentration risk",
      "Explain diversification principles",
      "Recommend optimal asset allocation",
      "Address concerns about potential return impact"
    ],
    estimatedTime: "20-25 min",
    iconType: "Target"
  },
  {
    domain: 'financial',
    title: "ESG Investment Integration",
    category: "Investment Planning",
    description: "A client wants to align their portfolio with environmental...",
    difficulty: "Advanced",
    objectives: [
      "Define ESG investment criteria",
      "Maintain portfolio diversification",
      "Monitor ESG impact and performance",
      "Balance values with returns"
    ],
    estimatedTime: "25-30 min",
    iconType: "Target"
  },
  // ... add ALL other scenarios here ...
];

// -----------------------------------------------------------------------------
// OLD (ORIGINAL) CONTROLLER FUNCTIONS
// -----------------------------------------------------------------------------

// @desc    Get all scenarios
// @route   GET /api/scenarios
// @access  Private
const getScenarios = async (req, res) => {
  try {
    console.log('Fetching scenarios...');
    const { domain } = req.query;

    let query = { isActive: true };
    if (domain) {
      query.domain = domain;
    }

    // If user is admin, return all active scenarios
    if (req.user.isAdmin) {
      let scenarios = await Scenario.find(query)
        .sort({ domain: 1, category: 1, difficulty: 1 });

      // If no scenarios exist for this domain, seed with defaults
      if (scenarios.length === 0 && domain) {
        console.log(`No scenarios found for domain ${domain}, generating...`);
        
        try {
          // Use the existing generateScenarios logic
          req.body = { domain }; // Set up the request body for generateScenarios
          
          // Create a mock response object to capture the result
          const mockRes = {
            json: (data) => {
              return data;
            },
            status: (code) => {
              return {
                json: (data) => {
                  console.error(`Error generating scenarios: ${code}`, data);
                  throw new Error(data.message || 'Error generating scenarios');
                }
              };
            }
          };
          
          const generatedScenarios = await generateScenariosForDomain(domain, req.user._id);
          return res.json(generatedScenarios);
        } catch (genError) {
          console.error(`Error generating scenarios for ${domain}:`, genError);
          return res.status(500).json({ 
            message: `Error generating scenarios for ${domain}`, 
            details: genError.message 
          });
        }
      }

      return res.json(scenarios);
    }

    // For trainees (non-admins), only return assigned + active scenarios
    const assignments = await ScenarioAssignment.find({
      userId: req.user._id,
      status: 'active'
    }).populate('scenarioId');

    const scenarios = assignments
      .map(assignment => assignment.scenarioId)
      .filter(scenario => scenario && scenario.isActive && (!domain || scenario.domain === domain));

    console.log(`Returning ${scenarios.length} assigned scenarios for trainee ${req.user._id}`);
    return res.json(scenarios);

  } catch (error) {
    console.error('Error in getScenarios:', error);
    res.status(500).json({ message: 'Error fetching scenarios', details: error.message });
  }
};

// Helper function to generate scenarios for a domain
const generateScenariosForDomain = async (domain, userId) => {
  try {
    console.log(`Generating scenarios for domain: ${domain}`);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `You are an expert ${domain} training scenario creator. Your response must be valid JSON with the exact structure requested. Do not include any explanatory text outside the JSON.` 
        },
        { 
          role: "user", 
          content: `Generate 5 professional training scenarios for ${domain} practitioners.
            Each scenario should include:
            1. A title
            2. A detailed description
            3. Difficulty level (must be exactly one of: beginner, intermediate, or advanced)
            4. 3-4 specific learning objectives as an array of strings
            5. Estimated time in minutes (just the number)
            6. A category relevant to ${domain} practice
            
            Return in this exact JSON format:
            {
              "scenarios": [
                {
                  "title": "string",
                  "category": "string",
                  "description": "string",
                  "difficulty": "beginner",
                  "objectives": ["string", "string", "string"],
                  "estimatedTime": 30,
                  "keyPoints": ["string", "string"]
                }
              ]
            }
            
            IMPORTANT: 
            - The difficulty MUST be exactly one of: "beginner", "intermediate", or "advanced" (all lowercase)
            - The category field is required and must be a string
            - The objectives must be an array of strings
            - The estimatedTime should be a number (minutes)`
        }
      ],
      temperature: 0.8,
      response_format: { type: "json_object" } // Ensure JSON response format
    });

    // Log the raw response for debugging
    console.log("OpenAI raw response content:", completion.choices[0].message.content);
    
    // Parse the response
    const content = completion.choices[0].message.content.trim();
    let generatedContent;
    
    try {
      generatedContent = JSON.parse(content);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      
      // Try to find JSON in the response (sometimes OpenAI adds explanatory text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log("Found JSON portion in response");
        generatedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not find valid JSON in the response");
      }
    }

    // Validate that the response has the expected structure
    if (!generatedContent.scenarios || !Array.isArray(generatedContent.scenarios) || generatedContent.scenarios.length === 0) {
      throw new Error("Invalid response structure: missing scenarios array");
    }

    // Process and save the scenarios
    const scenariosToSave = generatedContent.scenarios.map(scenario => {
      // Ensure category is present
      const scenarioCategory = scenario.category || `${domain} General`;
      
      // Normalize difficulty to match enum values
      let normalizedDifficulty = 'intermediate'; // default
      if (scenario.difficulty) {
        const difficultyLower = scenario.difficulty.toLowerCase();
        if (difficultyLower.includes('begin') || difficultyLower.includes('basic') || difficultyLower.includes('easy')) {
          normalizedDifficulty = 'beginner';
        } else if (difficultyLower.includes('inter') || difficultyLower.includes('medium')) {
          normalizedDifficulty = 'intermediate';
        } else if (difficultyLower.includes('adv') || difficultyLower.includes('expert') || difficultyLower.includes('hard')) {
          normalizedDifficulty = 'advanced';
        }
      }

      // Ensure objectives is an array
      const objectives = Array.isArray(scenario.objectives) ? 
        scenario.objectives : 
        [scenario.objectives || 'Complete the scenario successfully'];

      // Ensure estimatedTime is a number
      let estimatedTime = 30; // default
      if (scenario.estimatedTime) {
        if (typeof scenario.estimatedTime === 'number') {
          estimatedTime = scenario.estimatedTime;
        } else if (typeof scenario.estimatedTime === 'string') {
          // Try to extract a number from the string (e.g., "30 minutes" -> 30)
          const timeMatch = scenario.estimatedTime.match(/\d+/);
          if (timeMatch) {
            estimatedTime = parseInt(timeMatch[0], 10);
          }
        }
      }

      // Ensure keyPoints is an array
      const keyPoints = Array.isArray(scenario.keyPoints) ?
        scenario.keyPoints :
        (scenario.keyPoints ? [scenario.keyPoints] : []);

      return {
        title: scenario.title || `${domain} Scenario`,
        domain,
        category: scenarioCategory,
        description: scenario.description || `A training scenario for ${domain} practitioners`,
        difficulty: normalizedDifficulty,
        objectives: objectives,
        estimatedTime: estimatedTime,
        keyPoints: keyPoints,
        createdBy: userId,
        isActive: true
      };
    });

    return await Scenario.insertMany(scenariosToSave);
  } catch (error) {
    console.error(`Error in generateScenariosForDomain for ${domain}:`, error);
    throw error;
  }
};

// @desc    Create new scenario
// @route   POST /api/scenarios
// @access  Private/Admin
const createScenario = async (req, res) => {
  try {
    // Validate domain (optional; adjust domains as needed)
    if (
      !req.body.domain ||
      !['financial', 'medical', 'legal', 'counseling', 'education'].includes(req.body.domain)
    ) {
      return res.status(400).json({ message: 'Invalid domain specified' });
    }

    console.log('Creating new scenario:', req.body);
    const scenario = new Scenario({
      ...req.body,
      createdBy: req.user._id
    });

    const savedScenario = await scenario.save();
    console.log('Created scenario:', savedScenario);
    res.status(201).json(savedScenario);
  } catch (error) {
    console.error('Error creating scenario:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update scenario
// @route   PUT /api/scenarios/:id
// @access  Private/Admin
const updateScenario = async (req, res) => {
  try {
    console.log('Updating scenario:', req.params.id);
    const scenario = await Scenario.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!scenario) {
      return res.status(404).json({ message: 'Scenario not found' });
    }

    console.log('Updated scenario:', scenario);
    res.json(scenario);
  } catch (error) {
    console.error('Error updating scenario:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete scenario (soft delete by setting isActive: false)
// @route   DELETE /api/scenarios/:id
// @access  Private/Admin
const deleteScenario = async (req, res) => {
  try {
    console.log('Deleting scenario:', req.params.id);
    const scenario = await Scenario.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!scenario) {
      return res.status(404).json({ message: 'Scenario not found' });
    }

    console.log('Deleted scenario (soft):', scenario._id);
    res.json({ message: 'Scenario deleted successfully' });
  } catch (error) {
    console.error('Error deleting scenario:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Reset scenarios to defaults
// @route   POST /api/scenarios/reset
// @access  Private/Admin
const resetScenarios = async (req, res) => {
  try {
    console.log('Starting scenarios reset...');

    // Delete all existing scenarios
    await Scenario.deleteMany({});
    console.log('Deleted existing scenarios');

    // Create default scenarios fresh
    const scenarios = await Scenario.insertMany(
      defaultScenarios.map(scenario => ({
        ...scenario,
        createdBy: req.user._id,
        isActive: true
      }))
    );

    console.log(`Created ${scenarios.length} new scenarios`);
    res.status(200).json({
      message: 'Database reset successful',
      scenarios
    });
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ message: 'Failed to reset database' });
  }
};

// -----------------------------------------------------------------------------
// NEW (OPENAI) CONTROLLER FUNCTIONS
// -----------------------------------------------------------------------------

// @desc    Generate scenarios via OpenAI for a given domain
// @route   POST /api/scenarios/generate
// @access  Private/Admin
const generateScenarios = async (req, res) => {
  try {
    const { domain, category, subCategory } = req.body;

    // Validate domain is provided
    if (!domain) {
      return res.status(400).json({ message: 'Domain is required' });
    }

    // Build context-specific prompt
    let prompt = `Generate 5 professional training scenarios for ${domain} practitioners`;
    
    if (category) {
      prompt += ` specifically for ${category}`;
      if (subCategory) {
        prompt += ` in the ${subCategory} sector`;
      }
    }

    prompt += `.\nEach scenario should be realistic and challenging, including:
    1. A title
    2. A detailed description of the client situation
    3. Difficulty level (must be exactly one of: beginner, intermediate, or advanced)
    4. 3-4 specific learning objectives as an array of strings
    5. Estimated time in minutes (just the number)
    6. Key points or client profile details as an array of strings

    Return them in this exact JSON format:
    {
      "scenarios": [
        {
          "title": "string",
          "category": "${category || domain + ' General'}",
          "description": "string",
          "difficulty": "intermediate",
          "objectives": ["string", "string", "string"],
          "estimatedTime": 30,
          "keyPoints": ["string", "string"]
        }
      ]
    }

    IMPORTANT: 
    - The difficulty MUST be exactly one of: "beginner", "intermediate", or "advanced" (all lowercase)
    - The category field is required and must be a string
    - The objectives must be an array of strings
    - The estimatedTime should be a number (minutes)`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `You are an expert ${domain} training scenario creator, specializing in ${category || domain} scenarios. Your response must be valid JSON with the exact structure requested. Do not include any explanatory text outside the JSON.` 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" } // Ensure JSON response format
    });

    try {
      // Log the raw response for debugging
      console.log("OpenAI raw response content:", completion.choices[0].message.content);
      
      // Check if the response starts with a valid JSON character
      const content = completion.choices[0].message.content.trim();
      let generatedContent;
      
      try {
        generatedContent = JSON.parse(content);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        
        // Try to find JSON in the response (sometimes OpenAI adds explanatory text)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          console.log("Found JSON portion in response");
          generatedContent = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not find valid JSON in the response");
        }
      }

      // Validate that the response has the expected structure
      if (!generatedContent.scenarios || !Array.isArray(generatedContent.scenarios) || generatedContent.scenarios.length === 0) {
        throw new Error("Invalid response structure: missing scenarios array");
      }

      // Save new scenarios in DB
      const scenariosToSave = generatedContent.scenarios.map(scenario => {
        // Ensure category is present - this was causing the validation error
        const scenarioCategory = scenario.category || `${domain} General`;
        
        // Normalize difficulty to match enum values - this was causing the validation error
        let normalizedDifficulty = 'intermediate'; // default
        if (scenario.difficulty) {
          const difficultyLower = scenario.difficulty.toLowerCase();
          if (difficultyLower.includes('begin') || difficultyLower.includes('basic') || difficultyLower.includes('easy')) {
            normalizedDifficulty = 'beginner';
          } else if (difficultyLower.includes('inter') || difficultyLower.includes('medium')) {
            normalizedDifficulty = 'intermediate';
          } else if (difficultyLower.includes('adv') || difficultyLower.includes('expert') || difficultyLower.includes('hard')) {
            normalizedDifficulty = 'advanced';
          }
        }

        // Ensure objectives is an array
        const objectives = Array.isArray(scenario.objectives) ? 
          scenario.objectives : 
          [scenario.objectives || 'Complete the scenario successfully'];

        // Ensure estimatedTime is a number
        let estimatedTime = 30; // default
        if (scenario.estimatedTime) {
          if (typeof scenario.estimatedTime === 'number') {
            estimatedTime = scenario.estimatedTime;
          } else if (typeof scenario.estimatedTime === 'string') {
            // Try to extract a number from the string (e.g., "30 minutes" -> 30)
            const timeMatch = scenario.estimatedTime.match(/\d+/);
            if (timeMatch) {
              estimatedTime = parseInt(timeMatch[0], 10);
            }
          }
        }

        // Ensure keyPoints is an array
        const keyPoints = Array.isArray(scenario.keyPoints) ?
          scenario.keyPoints :
          (scenario.keyPoints ? [scenario.keyPoints] : []);

        return {
          title: scenario.title || `${domain} Scenario`,
          domain,
          category: scenarioCategory,
          description: scenario.description || `A training scenario for ${domain} practitioners`,
          difficulty: normalizedDifficulty,
          objectives: objectives,
          estimatedTime: estimatedTime,
          keyPoints: keyPoints,
          createdBy: req.user._id,
          isActive: true
        };
      });

      const savedScenarios = await Scenario.insertMany(scenariosToSave);
      res.json(savedScenarios);
    } catch (error) {
      console.error("Error processing OpenAI response:", error);
      console.error("Response content:", completion.choices[0].message.content);
      
      // Provide more specific error message based on the error type
      let errorMessage = "Failed to generate scenarios. Please try again.";
      if (error.message.includes("Could not find valid JSON") || error.message.includes("Invalid response structure")) {
        errorMessage = "The AI returned an invalid response format. Please try again.";
      } else if (error.name === "SyntaxError") {
        errorMessage = "Failed to parse the AI response. Please try again.";
      } else if (error.name === "ValidationError") {
        errorMessage = "The generated scenarios did not meet validation requirements. Please try again with specific details: " + error.message;
      }
      
      res.status(500).json({ error: errorMessage, details: error.message });
    }
  } catch (error) {
    console.error('Error generating scenarios:', error);
    
    // Check if this is an OpenAI API error
    let errorMessage = "Failed to generate scenarios";
    let errorDetails = error.message;
    
    if (error.response) {
      // Log more details about the OpenAI API error
      console.error('OpenAI API error details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
      
      errorMessage += ` (OpenAI API error: ${error.response.status})`;
      if (error.response.data && error.response.data.error) {
        errorDetails = error.response.data.error.message || errorDetails;
      }
    }
    
    res.status(500).json({ message: errorMessage, details: errorDetails });
  }
};

// @desc    Refresh scenarios for a domain (deletes and regenerates)
// @route   POST /api/scenarios/refresh/:domain
// @access  Private/Admin
const refreshScenarios = async (req, res) => {
  try {
    const { domain } = req.params;

    // Delete existing scenarios for this domain
    await Scenario.deleteMany({ domain });

    // Reuse generateScenarios logic. We can artificially call it,
    // but we'll replicate the body param so it can read domain from req.body
    req.body.domain = domain;

    // Let's run generateScenarios inside our function
    const originalSend = res.send.bind(res); // or you can do something else
    let generatedResult;

    // Temporarily override res.send to capture the result from generateScenarios
    res.send = (data) => {
      generatedResult = data;
      return originalSend(data);
    };

    await generateScenarios(req, res);

    // Restore res.send
    res.send = originalSend;

    // If needed, you could return your own custom message:
    // But currently, generateScenarios will have already sent the newly generated scenarios
    // So an alternative approach would be:
    // res.json({ message: "Refreshed scenarios", data: generatedResult });

  } catch (error) {
    console.error('Error refreshing scenarios:', error);
    res.status(500).json({ message: 'Failed to refresh scenarios' });
  }
};

// -----------------------------------------------------------------------------
// EXPORTS
// -----------------------------------------------------------------------------
module.exports = {
  // Existing exports
  getScenarios,
  createScenario,
  updateScenario,
  deleteScenario,
  resetScenarios,
  defaultScenarios, // optional if you need it

  // New exports
  generateScenarios,
  refreshScenarios
};
