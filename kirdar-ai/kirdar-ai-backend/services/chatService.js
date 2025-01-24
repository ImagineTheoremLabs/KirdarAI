// services/chatService.js
class ChatService {
  constructor() {
    this.endpoint = 'https://api.openai.com/v1/chat/completions';
    this.model = 'gpt-4o';
  }

  async getChatResponse(messages) {
    try {
      // Validate messages array
      if (!Array.isArray(messages) || messages.length === 0) {
        throw new Error('Invalid messages format');
      }

      // Ensure all messages have required properties
      const validatedMessages = messages.map(msg => ({
        role: msg.role,
        content: String(msg.content || '').trim() // Ensure content is string and non-empty
      })).filter(msg => msg.content); // Remove empty messages

      console.log('Sending request to ChatGPT:', {
        model: this.model,
        messages: validatedMessages
      });

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: validatedMessages,
          temperature: 0.7,
          max_tokens: 500,
          top_p: 0.9,
          frequency_penalty: 0.5,
          presence_penalty: 0.5
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenAI API error details:', errorData);
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from OpenAI');
      }

      console.log('Received response from OpenAI:', data.choices[0].message.content);
      return data.choices[0].message.content;

    } catch (error) {
      console.error('Error in getChatResponse:', error);
      throw error;
    }
  }
}

module.exports = new ChatService();