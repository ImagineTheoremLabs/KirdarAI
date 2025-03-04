// controllers/chatController.js

const ChatService = require('../services/chatService');
const OpenAI = require('openai');
const { generateSystemPrompt } = require('../config/domainPrompts');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Handles general chat interactions based on scenario or persona.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleChat = async (req, res) => {
  try {
    const { message, conversationHistory, type, context } = req.body;
    console.log('Received chat request:', { message, type, context: context?.data?.title || 'No context' });

    if (!message || !type || !context?.data) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields: message, type, or context data' 
      });
    }

    const { data } = context;
    const systemPrompt = type === 'scenario' 
      ? `You are a client in the following ${data.domain} scenario:

SCENARIO CONTEXT:
Title: ${data.title}
Category: ${data.category}
Description: ${data.description}

CLIENT PROFILE:
${data.clientProfile ? Object.entries(data.clientProfile)
  .map(([key, value]) => `${key}: ${value}`).join('\n') : ''}

OBJECTIVES:
${data.objectives ? data.objectives.map(obj => `- ${obj}`).join('\n') : ''}

IMPORTANT GUIDELINES:
1. Stay in character as a client seeking ${data.domain} advice
2. Express concerns relevant to the ${data.category} context
3. Ask questions specific to ${data.domain} matters
4. Never acknowledge being AI or simulated
5. Keep responses focused on the scenario context
6. Maintain consistent client perspective`
      : generateSystemPrompt(data.domain || 'financial', data, type === 'persona' ? 'client' : 'mentor');

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      temperature: 0.7
    });

    res.json({ 
      success: true,
      response: completion.choices[0].message.content 
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error processing chat',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Evaluates the chat conversation using OpenAI's API.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const evaluateChat = async (req, res) => {
  try {
    console.log('Starting chat evaluation...');
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid messages format:', messages);
      return res.status(400).json({ 
        success: false,
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
      res.json({
        success: true,
        ...evaluationResult
      });
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.log('Raw response:', rawContent);
      throw new Error('Failed to parse evaluation results');
    }

  } catch (error) {
    console.error('Detailed evaluation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error evaluating conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Fetches mentor suggestions from OpenAI's API.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMentorSuggestions = async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length < 2) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid request format. Messages array with system and user messages is required.' 
      });
    }

    console.log('Processing mentor request with messages count:', messages.length);

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
    console.log('Received mentor response');

    // Parse and validate the response
    try {
      const parsedResponse = JSON.parse(content);
      
      // Ensure the response has the required structure
      if (!parsedResponse.suggestions || !Array.isArray(parsedResponse.suggestions)) {
        throw new Error('Invalid response format from AI');
      }

      // Sanitize and format the response
      const sanitizedResponse = {
        success: true,
        suggestions: parsedResponse.suggestions.slice(0, 3).map(s => String(s)),
        warning: String(parsedResponse.warning || ''),
        tip: String(parsedResponse.tip || '')
      };

      res.json(sanitizedResponse);
      
    } catch (parseError) {
      console.error('Parse error:', parseError, 'Raw content:', content);
      res.status(500).json({ 
        success: false,
        message: 'Failed to parse AI response' 
      });
    }

  } catch (error) {
    console.error('Mentor API error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get mentor suggestions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  handleChat,
  evaluateChat,
  getMentorSuggestions
};