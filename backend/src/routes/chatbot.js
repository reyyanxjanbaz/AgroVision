const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const Crop = require('../models/Crop');
const supabase = require('../config/supabase');

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

    // Fetch real-time crop data
    let cropContext = "Current Market Data:\n";
    
    // Hardcoded fallback data (The "Website's Code" Source)
    const fallbackCrops = [
      { name: 'Wheat', current_price: 2200, unit: 'Quintal', price_change_24h: 1.2 },
      { name: 'Rice', current_price: 2800, unit: 'Quintal', price_change_24h: -0.5 },
      { name: 'Cotton', current_price: 6200, unit: 'Quintal', price_change_24h: 2.1 },
      { name: 'Sugarcane', current_price: 310, unit: 'Quintal', price_change_24h: 0.0 },
      { name: 'Corn', current_price: 1950, unit: 'Quintal', price_change_24h: 0.8 },
      { name: 'Soybeans', current_price: 4800, unit: 'Quintal', price_change_24h: -1.5 },
      { name: 'Potato', current_price: 1200, unit: 'Quintal', price_change_24h: -1.5 },
      { name: 'Tomato', current_price: 2500, unit: 'Quintal', price_change_24h: 5.4 }
    ];

    let adjustedCrops = [];

    try {
      const crops = await Crop.getAll();
      
      // Create a map of live crops for easy lookup
      const liveCropMap = new Map();
      if (crops && crops.length > 0) {
        crops.forEach(c => liveCropMap.set(c.name.toLowerCase(), c));
      }

      // Merge: Use live data if available, otherwise use fallback
      const mergedCrops = [...fallbackCrops];
      
      // Update fallback with live data if it exists
      mergedCrops.forEach((fc, index) => {
        const live = liveCropMap.get(fc.name.toLowerCase());
        if (live) {
          mergedCrops[index] = live; // Replace with live data
          liveCropMap.delete(fc.name.toLowerCase()); // Remove from map to avoid duplicates
        }
      });

      // Add any remaining live crops that weren't in fallback
      liveCropMap.forEach(live => mergedCrops.push(live));

      // Apply role-based pricing logic
      const userRole = context?.role || 'farmer';
      adjustedCrops = mergedCrops.map(c => {
        let price = c.current_price;
        let unit = c.unit || 'Quintal';
        
        if (userRole === 'customer') {
            // Convert Quintal to Kg and add 20% retail markup
            price = (price / 100) * 1.20;
            unit = 'Kg';
        }
        
        return {
            ...c,
            current_price: price,
            unit: unit
        };
      });

      // Generate the context string
      cropContext += adjustedCrops.map(c => 
        `- ${c.name}: ₹${c.current_price.toFixed(2)}/${c.unit} (${c.price_change_24h >= 0 ? '+' : ''}${c.price_change_24h}%)`
      ).join('\n');

    } catch (err) {
      console.error("Error fetching crops for chatbot:", err);
      // On error, just use the fallback list
      adjustedCrops = fallbackCrops; // Fallback doesn't have IDs, but that's fine
      cropContext += fallbackCrops.map(c => 
        `- ${c.name}: ₹${c.current_price}/${c.unit} (${c.price_change_24h >= 0 ? '+' : ''}${c.price_change_24h}%)`
      ).join('\n');
      cropContext += "\n(Note: Using system reference data due to database connection error)";
    }

    // Determine active crop from page context
    let activeCropContext = "";
    if (context?.page && context.page.startsWith('/crop/')) {
        const cropId = context.page.split('/crop/')[1];
        // Find crop by ID
        const activeCrop = adjustedCrops.find(c => String(c.id) === String(cropId));
        if (activeCrop) {
            activeCropContext = `\nUser is currently viewing the details for: **${activeCrop.name}**.\nIf the user asks "what is the price?" or "current price" without specifying a crop, refer to **${activeCrop.name}**'s price (₹${activeCrop.current_price.toFixed(2)}/${activeCrop.unit}).\n`;
        }
    }

    // Fetch latest market news
    let newsContext = "\nLatest Market News:\n";
    try {
      const { data: newsData } = await supabase
        .from('news')
        .select('title, summary, source')
        .order('published_date', { ascending: false })
        .limit(3);
      
      if (newsData && newsData.length > 0) {
        newsContext += newsData.map(n => `- ${n.title} (${n.source})`).join('\n');
      } else {
        newsContext += "No recent news available.";
      }
    } catch (err) {
      console.error("Error fetching news for chatbot:", err);
    }

    // Build context-aware system prompt
    let systemPrompt = `You are AgroVision AI Assistant, an expert agricultural advisor for the AgroVision platform.

Your capabilities:
- Provide accurate, real-time price information based on the data provided below.
- Explain market drivers (weather, supply/demand, policy, global trade).
- Summarize page content when asked.
- Help users navigate the app.

${cropContext}

${activeCropContext}

${newsContext}

General Market Knowledge:
- Prices are driven by: Weather conditions (monsoons, droughts), Input costs (fertilizers, fuel), Government policies (MSP, export bans), and Global demand.
- "Bullish" means prices are rising; "Bearish" means prices are falling.

Current User Context:
- User is on page: ${context?.page || 'unknown'}
- User role: ${context?.role || 'farmer'}

Instructions:
- If asked about a specific crop's price, ALWAYS use the "Current Market Data" provided above. Do not make up prices.
- If the crop is not in the list, say you don't have live data for it.
- If asked about market trends, use the "Latest Market News" and general knowledge.
- Be concise, professional, and helpful.
- Format currency as ₹ (INR).
- **IMPORTANT**: Use bold formatting for crop names and prices (e.g., **Wheat** is trading at **₹2200**).
`;

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