// controllers/chatController.js

const ChatService = require('../services/chatService');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Handles general chat interactions based on scenario or persona.
 */
const handleChat = async (req, res) => {
  try {
    const { message, conversationHistory, type, context } = req.body;
    console.log('Received chat request:', { message, conversationHistory, type, context });

    if (!message || !type || !context?.data) {
      return res.status(400).json({ 
        message: 'Missing required fields: message, type, or context data' 
      });
    }

    let systemPrompt;
    const { data } = context;

    // Different handling based on type
    if (type === 'persona') {
      // Validate persona fields
      const requiredFields = ['name', 'age', 'income', 'portfolio', 'riskTolerance', 'goals', 'concerns', 'knowledgeLevel'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `Missing required persona fields: ${missingFields.join(', ')}`
        });
      }

      systemPrompt = `You are simulating a client with the following profile:
      
CLIENT PROFILE:
Name: ${data.name}
Age: ${data.age}
Income: ${data.income}
Portfolio: ${data.portfolio}
Risk Tolerance: ${data.riskTolerance}
Goals: ${data.goals}
Concerns: ${data.concerns}
Knowledge Level: ${data.knowledgeLevel}

KEY BEHAVIORS:
1. Stay in character as ${data.name}, a client seeking financial advice
2. Respond to the financial advisor's questions and suggestions
3. Express your concerns about ${data.concerns}
4. Show financial knowledge matching your level (${data.knowledgeLevel})
5. Keep your goals in mind: ${data.goals}
6. Demonstrate your stated risk tolerance: ${data.riskTolerance}

IMPORTANT GUIDELINES:
1. YOU are the CLIENT, the user is your FINANCIAL ADVISOR
2. Never switch roles - always maintain your position as the client
3. Stay focused on your specific financial situation and goals
4. Express your personal concerns about your portfolio and financial future
5. Respond naturally to the advisor's suggestions`;

    } else if (type === 'scenario') {
      // Validate required scenario fields
      const requiredFields = ['title', 'category', 'description'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `Missing required scenario fields: ${missingFields.join(', ')}`
        });
      }

      // Create default client profile if none provided
      const clientProfile = data.clientProfile || {
        name: "Client",
        age: 45,
        income: "$100,000",
        portfolio: "Diversified portfolio",
        riskTolerance: "Moderate",
        goals: "Financial stability",
        concerns: "Market uncertainty",
        knowledgeLevel: "Intermediate"
      };

      const objectives = data.objectives || [];

      systemPrompt = `You are participating in a financial advisory scenario:

SCENARIO DETAILS:
Title: ${data.title}
Category: ${data.category}
Description: ${data.description}
${data.background ? `Background: ${data.background}\n` : ''}

CLIENT PROFILE:
Name: ${clientProfile.name}
Age: ${clientProfile.age}
Income: ${clientProfile.income}
Portfolio: ${clientProfile.portfolio}
Risk Tolerance: ${clientProfile.riskTolerance}
Goals: ${clientProfile.goals}
Concerns: ${clientProfile.concerns}
Knowledge Level: ${clientProfile.knowledgeLevel}

${objectives.length > 0 ? `OBJECTIVES:\n${objectives.map(obj => `- ${obj}`).join('\n')}\n` : ''}

KEY BEHAVIORS:
1. Stay in character as the client throughout the scenario
2. Keep the scenario objectives in mind
3. Show appropriate financial knowledge level
4. Express realistic concerns and questions
5. Respond naturally to the advisor's suggestions

IMPORTANT GUIDELINES:
1. YOU are the CLIENT, the user is your FINANCIAL ADVISOR
2. Never break character or acknowledge being an AI
3. Keep responses focused on the scenario context
4. Express genuine concerns and emotions related to the situation
5. Ask relevant questions about your financial situation`;
    } else {
      return res.status(400).json({ message: 'Invalid chat type' });
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(Array.isArray(conversationHistory) ? conversationHistory.filter(msg => msg.role !== 'system') : []),
      { role: 'user', content: message }
    ];

    console.log('Sending messages to ChatService:', { systemPrompt, message });

    try {
      const response = await ChatService.getChatResponse(messages);
      console.log('Received response from ChatService:', response);
      return res.json({ response });
    } catch (error) {
      console.error('Chat service error:', error);
      return res.status(500).json({ 
        message: 'Failed to get response from chat service',
        error: error.message 
      });
    }
  } catch (error) {
    console.error('Chat controller error:', error);
    res.status(500).json({ 
      message: 'Failed to process chat request',
      error: error.message 
    });
  }
};

/**
 * Evaluates the chat conversation using OpenAI's API.
 */
const evaluateChat = async (req, res) => {
  try {
    console.log('Starting chat evaluation...');
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid messages format:', messages);
      return res.status(400).json({ 
        message: 'Invalid request format. Messages array is required.' 
      });
    }

    console.log('Sending request to OpenAI...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000
    });

    console.log('Received response from OpenAI');
    
    // Get the raw response content
    const rawContent = completion.choices[0].message.content;
    
    // Clean up the response by removing markdown code blocks
    const cleanContent = rawContent
      .replace(/```json\n?/g, '') // Remove opening ```json
      .replace(/\n?```$/g, '')    // Remove closing ```
      .trim();                    // Remove any extra whitespace

    try {
      const evaluationResult = JSON.parse(cleanContent);
      
      // Validate the required fields
      if (!evaluationResult.scores || 
          !evaluationResult.strengths || 
          !evaluationResult.improvementAreas || 
          !evaluationResult.overallAssessment || 
          typeof evaluationResult.overallScore !== 'number') {
        throw new Error('Invalid evaluation result structure');
      }

      console.log('Successfully parsed evaluation result');
      res.json(evaluationResult);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.log('Raw response:', rawContent);
      throw new Error('Failed to parse evaluation results');
    }

  } catch (error) {
    console.error('Detailed evaluation error:', error);
    res.status(500).json({ 
      message: 'Error evaluating conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Fetches mentor suggestions from OpenAI's API.
 */
const getMentorSuggestions = async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length < 2) {
      return res.status(400).json({ 
        error: 'Invalid request format. Messages array with system and user messages is required.' 
      });
    }

    console.log('Processing mentor request with messages:', messages);

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        ...messages,
        {
          role: "assistant",
          content: `Please provide your response as a JSON object with exactly these fields:
{
  "suggestions": [string, string, string],  // Array of 3 specific improvement suggestions
  "warning": string,                        // Single most important compliance/regulatory warning if any, or empty string
  "tip": string                            // Single most valuable positive observation or communication tip
}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    console.log('Received mentor response:', content);

    // Parse and validate the response
    try {
      const parsedResponse = JSON.parse(content);
      
      // Ensure the response has the required structure
      if (!parsedResponse.suggestions || !Array.isArray(parsedResponse.suggestions)) {
        throw new Error('Invalid response format from AI');
      }

      // Sanitize and format the response
      const sanitizedResponse = {
        suggestions: parsedResponse.suggestions.slice(0, 3).map(s => String(s)),
        warning: String(parsedResponse.warning || ''),
        tip: String(parsedResponse.tip || '')
      };

      res.json(sanitizedResponse);
      
    } catch (parseError) {
      console.error('Parse error:', parseError, 'Raw content:', content);
      res.status(500).json({ error: 'Failed to parse AI response' });
    }

  } catch (error) {
    console.error('Mentor API error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to get mentor suggestions',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = {
  handleChat,
  evaluateChat,
  getMentorSuggestions
};