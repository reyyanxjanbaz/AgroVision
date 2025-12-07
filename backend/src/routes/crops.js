const express = require('express');
const router = express.Router();
const Crop = require('../models/Crop');
const supabase = require('../config/supabase'); // Keep for other queries if needed
const axios = require('axios');

// GET all crops
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    const data = await Crop.getAll(q);
    res.json(data);
  } catch (error) {
    console.error('Error fetching crops:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single crop
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: 'Invalid crop ID format' });
    }

    const data = await Crop.getById(id);
    if (!data) {
      return res.status(404).json({ error: 'Crop not found' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching crop:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET price history
router.get('/:id/prices', async (req, res) => {
  try {
    const { id } = req.params;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: 'Invalid crop ID format' });
    }

    const { region } = req.query;
    
    let query = supabase
      .from('price_history')
      .select('*')
      .eq('crop_id', id)
      .order('date', { ascending: true });

    if (region && region !== 'all') {
      query = query.eq('region', region);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET prediction
router.get('/:id/prediction', async (req, res) => {
  try {
    const { id } = req.params;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: 'Invalid crop ID format' });
    }

    // Fetch recent price history
    const { data: priceHistory, error } = await supabase
      .from('price_history')
      .select('price, date')
      .eq('crop_id', id)
      .order('date', { ascending: false })
      .limit(30);

    if (error) throw error;

    if (!priceHistory || priceHistory.length === 0) {
      return res.json({
        next3Days: null,
        nextMonth: null,
        confidence: 0
      });
    }

    // Simple prediction algorithm
    const prices = priceHistory.map(p => p.price);
    const recentPrice = prices[0];
    
    // Calculate trend (simple moving average)
    const avgRecent = prices.slice(0, 7).reduce((a, b) => a + b, 0) / 7;
    const avgOlder = prices.slice(7, 14).reduce((a, b) => a + b, 0) / 7;
    const trend = (avgRecent - avgOlder) / avgOlder;

    // Add some randomness for demo (remove in production)
    const volatility = 0.05;
    const randomFactor = (Math.random() - 0.5) * volatility;

    // Predict
    // Trend is weekly, so scale for 3 days (approx 0.43 of a week)
    const next3DaysPrediction = recentPrice * (1 + (trend * (3/7)) + randomFactor);
    const nextMonthPrediction = recentPrice * (1 + trend * 2 + randomFactor * 1.5);

    // Calculate confidence (based on data availability)
    const confidence = Math.min(95, 60 + (priceHistory.length / 30) * 35);

    res.json({
      next3Days: parseFloat(next3DaysPrediction.toFixed(2)),
      nextMonth: parseFloat(nextMonthPrediction.toFixed(2)),
      confidence: Math.round(confidence),
      trend: trend > 0 ? 'upward' : 'downward'
    });
  } catch (error) {
    console.error('Error generating prediction:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET factors
router.get('/:id/factors', async (req, res) => {
  try {
    const { id } = req.params;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: 'Invalid crop ID format' });
    }

    const { data, error } = await supabase
      .from('factors')
      .select('*')
      .eq('crop_id', id)
      .order('date', { ascending: false })
      .limit(6);

    if (error) throw error;

    // If no factors in DB, generate sample ones
    if (!data || data.length === 0) {
      // Fetch real weather data to generate weather factor
      const weatherService = require('../services/weatherService');
      let weatherFactor = {
        factor_type: 'weather',
        description: 'Weather data unavailable',
        impact_score: 0
      };

      try {
        const weather = await weatherService.getCurrentWeather('default');
        const impact = weatherService.assessAgriculturalImpact(weather);
        weatherFactor = {
          factor_type: 'weather',
          description: `${weather.condition} conditions: ${impact.description}`,
          impact_score: impact.impactScore
        };
      } catch (err) {
        console.error('Weather service unavailable for factors:', err.message);
      }

      const sampleFactors = [
        weatherFactor,
        {
          factor_type: 'demand',
          description: 'Increased demand from export markets',
          impact_score: 12.3
        },
        {
          factor_type: 'supply',
          description: 'Lower supply due to reduced sowing area',
          impact_score: -7.2
        },
        {
          factor_type: 'policy',
          description: 'Government announces minimum support price increase',
          impact_score: 15.0
        }
      ];
      return res.json(sampleFactors);
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching factors:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET news
router.get('/:id/news', async (req, res) => {
  const { id } = req.params;
  console.log(`Fetching news for crop ID: ${id}`);
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return res.status(400).json({ error: 'Invalid crop ID format' });
  }

  // Helper to get fallback image based on crop name
  const getFallbackImage = (name) => {
    if (!name) return 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80';
    const lower = name.toLowerCase();
    if (lower.includes('cotton')) return 'https://cdn.britannica.com/18/156618-050-39339EA2/cotton-harvest-field-Texas.jpg';
    if (lower.includes('sugarcane')) return 'https://4.imimg.com/data4/QX/AP/MY-8729085/sugarcane-plant-1000x1000.jpg';
    if (lower.includes('soyabean') || lower.includes('soybean')) return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqnl0mDa36Zsd2B2rCkZ2ZGhvhcqV2hqU_2g&s';
    if (lower.includes('wheat')) return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80';
    if (lower.includes('rice')) return 'https://images.unsplash.com/photo-1536617621572-1d5f1e6269a0?auto=format&fit=crop&w=800&q=80';
    if (lower.includes('corn') || lower.includes('maize')) return 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80';
    if (lower.includes('potato')) return 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80';
    if (lower.includes('tomato')) return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80';
    return 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80'; // Generic agriculture
  };

  try {
    // 1. Try to get fresh news (last 24h) from DB
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: freshNews } = await supabase
      .from('news')
      .select('*')
      .eq('crop_id', id)
      .gte('published_date', twentyFourHoursAgo)
      .order('published_date', { ascending: false })
      .limit(10);

    if (freshNews && freshNews.length > 0) {
      console.log('Returning fresh news from DB');
      return res.json(freshNews);
    }

    // Fetch crop name for search
    console.log('Fetching crop details for news search...');
    const crop = await Crop.getById(id);

    if (!crop) {
      console.log('Crop not found, returning empty array');
      return res.json([]);
    }

    // 2. Fetch from NewsAPI
    const newsApiKey = process.env.NEWS_API_KEY;
    let articles = [];

    if (newsApiKey) {
      try {
        console.log(`Fetching news from API for: ${crop.name}`);
        const response = await axios.get('https://newsapi.org/v2/everything', {
          params: {
            q: `"${crop.name}" AND (agriculture OR farming OR harvest OR "crop prices" OR "agronomy")`,
            searchIn: 'title,description',
            language: 'en',
            sortBy: 'publishedAt',
            pageSize: 10,
            apiKey: newsApiKey
          }
        });

        articles = response.data.articles
          .filter(article => article.title && article.description) // Filter out empty articles
          .map(article => ({
            crop_id: id,
            title: article.title,
            summary: article.description,
            url: article.url,
            image_url: article.urlToImage || getFallbackImage(crop.name),
            source: article.source.name,
            published_date: article.publishedAt
          }));
          
      } catch (apiError) {
        console.error('News API Error:', apiError.message);
        // Continue to fallback
      }
    } else {
      console.warn('NEWS_API_KEY not set');
    }

    if (articles.length > 0) {
      console.log(`Found ${articles.length} articles from API. Saving to DB...`);
      
      // Save to DB
      const { error: insertError } = await supabase
        .from('news')
        .insert(articles);
        
      if (insertError) {
        console.error('Error saving news to DB:', insertError);
      }
      
      return res.json(articles);
    }

    // 3. If API failed, try to get ANY news from DB (even if old)
    const { data: anyNews } = await supabase
      .from('news')
      .select('*')
      .eq('crop_id', id)
      .order('published_date', { ascending: false })
      .limit(10);

    if (anyNews && anyNews.length > 0) {
      console.log('Returning older news from DB as fallback');
      return res.json(anyNews);
    }

    // 4. Fallback sample news
    console.log('Returning sample news fallback');
    res.json([
      {
        title: `Market outlook for ${crop.name} remains positive`,
        summary: `Recent analysis shows steady demand for ${crop.name} in both local and international markets. Farmers are advised to monitor weather conditions closely.`,
        url: '#',
        image_url: getFallbackImage(crop.name),
        source: 'AgroVision Insights',
        published_date: new Date().toISOString()
      },
      {
        title: 'Sustainable farming practices boost yield',
        summary: 'New studies confirm that crop rotation and organic fertilizers can significantly improve soil health and long-term productivity.',
        url: '#',
        image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1932&q=80',
        source: 'Farming Weekly',
        published_date: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ]);
  } catch (error) {
    console.error('Error fetching news:', error.message);
    // Return sample news on error
    res.json([
      {
        title: 'Agricultural markets show positive trends',
        summary: 'Recent reports indicate favorable conditions for crop prices. Farmers are optimistic about the upcoming harvest season as weather patterns stabilize.',
        url: '#',
        image_url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
        source: 'Agriculture Today',
        published_date: new Date().toISOString()
      }
    ]);
  }
});

module.exports = router;