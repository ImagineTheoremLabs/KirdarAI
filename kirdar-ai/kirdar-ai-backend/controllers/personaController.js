// controllers/personaController.js
const Persona = require('../models/Persona');
const { DOMAIN_PROMPTS } = require('../config/domainPrompts');
const openai = require('../config/openai');

const generatePersonas = async (req, res) => {
  try {
    const { domain = 'financial', category, numPersonas = 1, description = '' } = req.body;
    
    // Validate domain is one of the allowed values
    const validDomains = ['financial', 'sales', 'medical', 'legal', 'counseling', 'education'];
    const validatedDomain = validDomains.includes(domain) ? domain : 'financial';
    
    if (numPersonas > 20) {
      throw new Error('Maximum number of personas (20) exceeded');
    }

    const domainConfig = DOMAIN_PROMPTS[validatedDomain] || DOMAIN_PROMPTS.financial;
    
    // Build domain-specific prompt
    const systemPrompt = `You are an expert ${domainConfig.role} that creates detailed ${domainConfig.client} personas. 
    ${description ? `Generate personas matching this description: "${description}"` : `Generate unique personas for ${category || validatedDomain} scenarios`}.
    Return response in valid JSON format.

Important Guidelines:
1. Each persona must be unique and realistic for ${category || validatedDomain}
2. Generate diverse characteristics appropriate for ${domainConfig.context}
3. Ensure proper JSON formatting
4. Knowledge level must be exactly "Basic", "Intermediate", or "Advanced"
5. Age must be between 18 and 80
6. Include specific, detailed goals and concerns related to ${domainConfig.topics}`;

    const userPrompt = `Create ${numPersonas} detailed ${domainConfig.client} personas for ${category || validatedDomain} scenarios in this exact JSON format:
{
  "personas": [
    {
      "name": "Full Name",
      "age": number,
      "knowledgeLevel": "Basic|Intermediate|Advanced",
      "goals": "specific goals related to ${domainConfig.topics}",
      "concerns": "specific ${domainConfig.concerns}",
      "domainFields": {
        ${getDomainSpecificFields(validatedDomain)}
      }
    }
  ]
}`;

    console.log(`Generating ${numPersonas} personas for domain: ${validatedDomain}, category: ${category || 'general'}`);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
      response_format: { type: "json_object" } // Ensure JSON response format
    });

    // Log the raw response for debugging
    console.log("OpenAI raw response content:", completion.choices[0].message.content);
    
    // Parse the response with error handling
    let generatedContent;
    try {
      const content = completion.choices[0].message.content.trim();
      generatedContent = JSON.parse(content);
      
      // Validate the response structure
      if (!generatedContent.personas || !Array.isArray(generatedContent.personas) || generatedContent.personas.length === 0) {
        throw new Error("Invalid response structure: missing personas array");
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      
      // Try to find JSON in the response (sometimes OpenAI adds explanatory text)
      const jsonMatch = completion.choices[0].message.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log("Found JSON portion in response");
        try {
          generatedContent = JSON.parse(jsonMatch[0]);
          
          // Validate the extracted JSON
          if (!generatedContent.personas || !Array.isArray(generatedContent.personas) || generatedContent.personas.length === 0) {
            throw new Error("Invalid response structure in extracted JSON: missing personas array");
          }
        } catch (extractError) {
          console.error("Error parsing extracted JSON:", extractError);
          throw new Error("Could not parse the AI response. Please try again.");
        }
      } else {
        throw new Error("Could not find valid JSON in the response");
      }
    }

    // Save personas to database
    // Ensure category is properly set - use the provided category or the domain as fallback
    const finalCategory = category || validatedDomain;
    
    const personasToSave = generatedContent.personas.map(persona => ({
      ...persona,
      domain: validatedDomain,
      category: finalCategory, // Use the finalized category
      createdBy: req.user._id,
      isActive: true
    }));

    console.log(`Generating ${numPersonas} personas with domain: ${validatedDomain}, category: ${finalCategory}`);

    const savedPersonas = await Persona.insertMany(personasToSave);
    res.json(savedPersonas);

  } catch (error) {
    console.error('Error generating personas:', error);
    res.status(500).json({ 
      message: 'Failed to generate personas',
      error: error.message 
    });
  }
};

// Helper function to get domain-specific fields
const getDomainSpecificFields = (domain) => {
  const fieldMap = {
    financial: `
      "income": "annual income with currency",
      "portfolio": "current investment details",
      "riskTolerance": "Low|Moderate|High"`,
    sales: `
      "budget": "spending capacity",
      "purchaseHistory": "relevant purchase history",
      "decisionTimeline": "expected purchase timeline"`,
    medical: `
      "healthHistory": "relevant medical history",
      "currentSymptoms": "present health concerns",
      "medications": "current medications"`,
    legal: `
      "caseType": "type of legal matter",
      "urgency": "case timeline/urgency",
      "priorLegalHistory": "relevant legal history"`,
    counseling: `
      "presentingIssue": "main reason for seeking therapy",
      "supportSystem": "available support network",
      "priorTherapy": "previous therapy experience"`,
    education: `
      "gradeLevel": "current educational level",
      "academicHistory": "academic background",
      "learningStyle": "preferred learning approach"`
  };
  
  return fieldMap[domain] || fieldMap.financial;
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