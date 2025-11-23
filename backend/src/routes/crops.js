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
    const data = await Crop.getById(req.params.id);
    res.json(data);
  } catch (error) {
    console.error('Error fetching crop:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET price history
router.get('/:id/prices', async (req, res) => {
  try {
    const { region } = req.query;
    
    let query = supabase
      .from('price_history')
      .select('*')
      .eq('crop_id', req.params.id)
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
    // Fetch recent price history
    const { data: priceHistory, error } = await supabase
      .from('price_history')
      .select('price, date')
      .eq('crop_id', req.params.id)
      .order('date', { ascending: false })
      .limit(30);

    if (error) throw error;

    if (!priceHistory || priceHistory.length === 0) {
      return res.json({
        nextWeek: null,
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
    const nextWeekPrediction = recentPrice * (1 + trend + randomFactor);
    const nextMonthPrediction = recentPrice * (1 + trend * 2 + randomFactor * 1.5);

    // Calculate confidence (based on data availability)
    const confidence = Math.min(95, 60 + (priceHistory.length / 30) * 35);

    res.json({
      nextWeek: parseFloat(nextWeekPrediction.toFixed(2)),
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
    const { data, error } = await supabase
      .from('factors')
      .select('*')
      .eq('crop_id', req.params.id)
      .order('date', { ascending: false })
      .limit(6);

    if (error) throw error;

    // If no factors in DB, generate sample ones
    if (!data || data.length === 0) {
      const sampleFactors = [
        {
          factor_type: 'weather',
          description: 'Favorable weather conditions supporting crop growth',
          impact_score: 8.5
        },
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
  console.log(`Fetching news for crop ID: ${req.params.id}`);
  try {
    // First check if we have news in DB
    const { data: dbNews } = await supabase
      .from('news')
      .select('*')
      .eq('crop_id', req.params.id)
      .order('published_date', { ascending: false })
      .limit(10);

    if (dbNews && dbNews.length > 0) {
      console.log('Returning news from DB');
      return res.json(dbNews);
    }

    // Fetch crop name for search
    console.log('Fetching crop details for news search...');
    const crop = await Crop.getById(req.params.id);

    if (!crop) {
      console.log('Crop not found, returning empty array');
      return res.json([]);
    }

    // Fetch from NewsAPI
    const newsApiKey = process.env.NEWS_API_KEY;
    let articles = [];

    if (newsApiKey) {
      try {
        console.log(`Fetching news from API for: ${crop.name}`);
        const response = await axios.get('https://newsapi.org/v2/everything', {
          params: {
            q: `"${crop.name}" AND (agriculture OR farming OR harvest OR commodity)`,
            searchIn: 'title,description',
            language: 'en',
            sortBy: 'publishedAt',
            pageSize: 10,
            apiKey: newsApiKey
          }
        });

        articles = response.data.articles.map(article => ({
          title: article.title,
          summary: article.description,
          url: article.url,
          image_url: article.urlToImage,
          published_date: article.publishedAt,
          source: article.source.name
        }));
      } catch (apiError) {
        console.error('News API Error:', apiError.message);
        // Continue to fallback
      }
    } else {
      console.warn('NEWS_API_KEY not set');
    }

    if (articles.length > 0) {
      console.log(`Found ${articles.length} articles from API`);
      return res.json(articles);
    }

    // Fallback sample news
    console.log('Returning sample news fallback');
    res.json([
      {
        title: 'Agricultural markets show positive trends',
        summary: 'Recent reports indicate favorable conditions for crop prices. Farmers are optimistic about the upcoming harvest season as weather patterns stabilize.',
        url: '#',
        image_url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
        source: 'Agriculture Today',
        published_date: new Date().toISOString()
      },
      {
        title: 'New sustainable farming techniques gain popularity',
        summary: 'Farmers across the region are adopting new sustainable practices to improve soil health and increase yield while reducing environmental impact.',
        url: '#',
        image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1932&q=80',
        source: 'Farming Weekly',
        published_date: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        title: 'Global demand for organic produce rises',
        summary: 'Export markets are seeing a surge in demand for organically grown produce, presenting new opportunities for local farmers.',
        url: '#',
        image_url: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80',
        source: 'Global Trade News',
        published_date: new Date(Date.now() - 86400000 * 5).toISOString()
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