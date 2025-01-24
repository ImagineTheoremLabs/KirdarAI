// controllers/guestController.js
const GuestCode = require('../models/GuestCode');
const ChatService = require('../services/chatService');

// Validate guest access code
// controllers/guestController.js
// In guestController.js
const validateCode = async (req, res) => {
  try {
    console.log('Validating code:', req.body);
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Access code is required' });
    }

    // Find active code and populate assignments
    const guestCode = await GuestCode.findOne({ 
      code: code.toUpperCase(),
      status: 'active'
    })
    .populate('assignments.personas')
    .populate('assignments.scenarios');

    console.log('Found guest code:', guestCode);

    if (!guestCode) {
      return res.status(404).json({ message: 'Invalid or expired access code' });
    }

    // Update usage statistics
    guestCode.usageCount += 1;
    guestCode.lastUsed = new Date();
    await guestCode.save();

    // Structure the response data
    const responseData = {
      assignments: {
        personas: guestCode.assignments?.personas || [],
        scenarios: guestCode.assignments?.scenarios || []
      },
      features: {
        mentorEnabled: Boolean(guestCode.features?.mentorEnabled),
        evaluatorEnabled: Boolean(guestCode.features?.evaluatorEnabled)
      }
    };

    console.log('Sending response:', responseData);
    res.json(responseData);
  } catch (error) {
    console.error('Guest code validation error:', error);
    res.status(500).json({ message: 'Failed to validate access code' });
  }
};

// Handle chat for guest sessions
const handleChat = async (req, res) => {
  try {
    const { message, conversationHistory, type, context } = req.body;
    console.log('Received chat request:', { message, conversationHistory, type, context });

    if (!message || !type || !context?.data) {
      return res.status(400).json({ 
        message: 'Missing required fields: message, type, or context data' 
      });
    }

    const { data } = context;
    let systemPrompt;

    if (type === 'persona') {
      // For persona-type interactions, use the persona's details
      systemPrompt = `You are participating in the following scenario as a specific client:

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
1. Stay in character as the client throughout the scenario
2. Keep the scenario objectives in mind
3. Show appropriate financial knowledge level (${data.knowledgeLevel})
4. Express realistic concerns and questions
5. Respond naturally to the advisor's suggestions
6. Keep responses brief and focused (2-3 sentences maximum)

IMPORTANT GUIDELINES:
1. YOU are the CLIENT, the user is your FINANCIAL ADVISOR
2. Never break character or acknowledge being an AI
3. Keep responses focused on your specific financial situation
4. Express genuine concerns about ${data.concerns}
5. Ask relevant questions about your financial situation
6. Be concise - avoid long explanations or lists
7. Respond in a natural, conversational way

RESPONSE STYLE:
- Keep responses short and to the point
- Focus on one concern or question at a time
- Avoid lengthy explanations
- Use natural, conversational language
- Respond as if in a real client meeting
- Stay consistent with your profile details`;
    } else if (type === 'scenario') {
      // For scenario-type interactions
      systemPrompt = `You are participating in the following scenario:

SCENARIO CONTEXT:
Title: ${data.title}
Category: ${data.category}
Description: ${data.description}

OBJECTIVES:
${data.objectives ? data.objectives.map(obj => `- ${obj}`).join('\n') : ''}

KEY BEHAVIORS:
1. Stay in character as the client throughout the scenario
2. Keep the scenario objectives in mind
3. Show appropriate financial knowledge level
4. Express realistic concerns and questions
5. Respond naturally to the advisor's suggestions
6. Keep responses brief and focused (2-3 sentences maximum)

IMPORTANT GUIDELINES:
1. YOU are the CLIENT, the user is your FINANCIAL ADVISOR
2. Never break character or acknowledge being an AI
3. Keep responses focused on the scenario context
4. Express genuine concerns and emotions related to the situation
5. Ask relevant questions about your financial situation
6. Be concise - avoid long explanations or lists
7. Respond in a natural, conversational way

RESPONSE STYLE:
- Keep responses short and to the point
- Focus on one concern or question at a time
- Avoid lengthy explanations
- Use natural, conversational language
- Respond as if in a real client meeting`;
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(Array.isArray(conversationHistory) ? conversationHistory.filter(msg => msg.role !== 'system') : []),
      { role: 'user', content: message }
    ];

    console.log('Sending messages to ChatService:', messages);

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
    console.error('Guest chat error:', error);
    res.status(500).json({ 
      message: 'Failed to process chat request',
      error: error.message 
    });
  }
};

module.exports = {
  validateCode,
  handleChat
};