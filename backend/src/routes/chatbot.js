const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1', // Support for GitHub Models
});

router.post('/', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build context-aware system prompt
    let systemPrompt = `You are AgroVision AI Assistant, a helpful assistant for an agricultural price prediction platform. 

Your capabilities:
- Explain crop prices and market trends
- Summarize page content when asked
- Answer questions about agricultural factors affecting prices
- Help users navigate the app
- Provide general agricultural advice

Current context:
- User is on page: ${context?.page || 'unknown'}
- User role: ${context?.role || 'farmer'}

Be concise, helpful, and friendly. If you don't know something, admit it. Never make up price data.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Default to GPT-4o, can be overridden by GitHub Models
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 1024,
    });

    const assistantMessage = response.choices[0].message.content;

    res.json({
      message: assistantMessage,
      success: true
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    
    // Fallback responses if API fails
    const fallbackResponses = {
      'summarize': 'This page shows detailed crop information including price history, predictions, and market factors.',
      'price': 'Crop prices are influenced by weather, demand, supply, and government policies. Check the factors section for more details.',
      'help': 'You can view different crops on the dashboard, click on any crop to see detailed price charts and predictions.',
    };

    const fallback = Object.entries(fallbackResponses).find(([key]) => 
      message.toLowerCase().includes(key)
    );

    res.json({
      message: fallback ? fallback[1] : 'I apologize, but I\'m having trouble processing your request right now. Please try again.',
      success: false
    });
  }
});

module.exports = router;