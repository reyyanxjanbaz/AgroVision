const express = require('express');
const router = express.Router();
const Crop = require('../models/Crop');
const supabase = require('../config/supabase'); // Keep for other queries if needed
const axios = require('axios');
const { calculateWeatherImpact, adjustFactorImpact, getCropRecommendations } = require('../config/cropSensitivities');

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

// GET global market factors (for dashboard)
router.get('/factors/global', async (req, res) => {
  try {
    const weatherService = require('../services/weatherService');
    let currentWeather = null;
    
    try {
      currentWeather = await weatherService.getCurrentWeather('default');
    } catch (err) {
      console.error('Weather service unavailable:', err.message);
    }

    // Generate comprehensive market factors
    const factors = [];

    // Weather factor
    if (currentWeather) {
      const baseImpact = weatherService.assessAgriculturalImpact(currentWeather);
      factors.push({
        id: 'weather-global',
        factor_type: 'weather',
        title: `${currentWeather.condition} Weather Conditions`,
        description: baseImpact.description,
        impact_score: baseImpact.impactScore,
        date: new Date().toISOString(),
        details: {
          temperature: currentWeather.temperature,
          humidity: currentWeather.humidity,
          condition: currentWeather.condition
        }
      });
    }

    // Market demand factors
    factors.push({
      id: 'demand-export',
      factor_type: 'demand',
      title: 'Export Market Demand Rising',
      description: 'International buyers showing increased interest in Indian agricultural commodities. Export orders up 15% compared to last quarter.',
      impact_score: 12.5,
      date: new Date().toISOString()
    });

    factors.push({
      id: 'demand-domestic',
      factor_type: 'demand',
      title: 'Festival Season Approaching',
      description: 'Upcoming festivals expected to drive domestic demand for staple crops. Retail buyers stocking up in anticipation.',
      impact_score: 8.3,
      date: new Date().toISOString()
    });

    // Supply factors
    factors.push({
      id: 'supply-sowing',
      factor_type: 'supply',
      title: 'Sowing Area Updates',
      description: 'Mixed reports on sowing area - some regions report lower acreage due to delayed monsoons while others show normal coverage.',
      impact_score: -5.2,
      date: new Date().toISOString()
    });

    factors.push({
      id: 'supply-storage',
      factor_type: 'supply',
      title: 'Cold Storage Capacity',
      description: 'Government initiatives expanding cold storage facilities, helping reduce post-harvest losses and stabilize supply.',
      impact_score: 4.1,
      date: new Date().toISOString()
    });

    // Policy factors
    factors.push({
      id: 'policy-msp',
      factor_type: 'policy',
      title: 'MSP Revision Expected',
      description: 'Government considering revision of Minimum Support Price for major crops. Announcement expected within the coming weeks.',
      impact_score: 15.0,
      date: new Date().toISOString()
    });

    factors.push({
      id: 'policy-subsidy',
      factor_type: 'policy',
      title: 'Fertilizer Subsidy Update',
      description: 'New fertilizer subsidy scheme to reduce input costs for farmers. Expected to benefit small and marginal farmers significantly.',
      impact_score: 10.2,
      date: new Date().toISOString()
    });

    // Economic factors
    factors.push({
      id: 'economic-fuel',
      factor_type: 'economic',
      title: 'Fuel Price Impact',
      description: 'Recent fuel price fluctuations affecting transportation costs. Logistics expenses showing slight increase across supply chains.',
      impact_score: -3.8,
      date: new Date().toISOString()
    });

    res.json(factors);
  } catch (error) {
    console.error('Error fetching global factors:', error);
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

    const { region, refresh } = req.query;
    
    // If refresh is requested, generate fresh simulated data
    if (refresh === 'true') {
      // Get crop details first
      const crop = await Crop.getById(id);
      if (!crop) {
        return res.status(404).json({ error: 'Crop not found' });
      }

      // Generate 90 days of price data up to today
      const priceData = [];
      const basePrice = crop.current_price || 2000;
      let currentPrice = basePrice * 0.9;
      
      for (let i = 90; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Add realistic price movement
        const dailyChange = (Math.random() - 0.48) * (basePrice * 0.02); // Slight upward bias
        currentPrice = Math.max(basePrice * 0.7, Math.min(basePrice * 1.3, currentPrice + dailyChange));
        
        priceData.push({
          date: date.toISOString().split('T')[0],
          price: parseFloat(currentPrice.toFixed(2)),
          region: region || 'all'
        });
      }
      
      return res.json(priceData);
    }
    
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

    // If no data in DB, generate sample data
    if (!data || data.length === 0) {
      const crop = await Crop.getById(id);
      const basePrice = crop?.current_price || 2000;
      const priceData = [];
      let currentPrice = basePrice * 0.9;
      
      for (let i = 90; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const dailyChange = (Math.random() - 0.48) * (basePrice * 0.02);
        currentPrice = Math.max(basePrice * 0.7, Math.min(basePrice * 1.3, currentPrice + dailyChange));
        
        priceData.push({
          date: date.toISOString().split('T')[0],
          price: parseFloat(currentPrice.toFixed(2)),
          region: 'all'
        });
      }
      
      return res.json(priceData);
    }

    // Extend data to today if the last date in DB is older than today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastDataDate = new Date(data[data.length - 1].date);
    lastDataDate.setHours(0, 0, 0, 0);
    
    if (lastDataDate < today) {
      // Generate additional data points from last date to today
      const lastPrice = data[data.length - 1].price;
      const crop = await Crop.getById(id);
      const basePrice = crop?.current_price || lastPrice;
      let currentPrice = lastPrice;
      
      const daysDiff = Math.ceil((today - lastDataDate) / (1000 * 60 * 60 * 24));
      
      for (let i = 1; i <= daysDiff; i++) {
        const date = new Date(lastDataDate);
        date.setDate(date.getDate() + i);
        
        const dailyChange = (Math.random() - 0.48) * (basePrice * 0.015);
        currentPrice = Math.max(basePrice * 0.7, Math.min(basePrice * 1.3, currentPrice + dailyChange));
        
        data.push({
          date: date.toISOString().split('T')[0],
          price: parseFloat(currentPrice.toFixed(2)),
          region: region || 'all'
        });
      }
    }

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

    // Fetch crop details to get crop name for sensitivity calculations
    const crop = await Crop.getById(id);
    const cropName = crop?.name || 'default';

    const { data, error } = await supabase
      .from('factors')
      .select('*')
      .eq('crop_id', id)
      .order('date', { ascending: false })
      .limit(6);

    if (error) throw error;

    // Fetch current weather for weather-based factor adjustments
    const weatherService = require('../services/weatherService');
    let currentWeather = null;
    try {
      currentWeather = await weatherService.getCurrentWeather('default');
    } catch (err) {
      console.error('Weather service unavailable:', err.message);
    }

    // If no factors in DB, generate sample ones with crop-specific impacts
    if (!data || data.length === 0) {
      let weatherFactor = {
        factor_type: 'weather',
        description: 'Weather data unavailable',
        impact_score: 0,
        crop_specific_impact: null
      };

      if (currentWeather) {
        const weatherImpact = calculateWeatherImpact(cropName, currentWeather);
        const baseImpact = weatherService.assessAgriculturalImpact(currentWeather);
        
        weatherFactor = {
          factor_type: 'weather',
          description: `${currentWeather.condition} conditions: ${weatherImpact.details[0] || baseImpact.description}`,
          impact_score: baseImpact.impactScore,
          crop_specific_impact: {
            adjusted_score: weatherImpact.impactScore,
            sentiment: weatherImpact.sentiment,
            is_beneficial: weatherImpact.impactScore > 0,
            crop_message: weatherImpact.details[0],
            recommendations: weatherImpact.recommendations,
            vulnerabilities: weatherImpact.vulnerabilities
          }
        };
      }

      // Create sample factors with crop-specific adjustments
      const demandImpact = adjustFactorImpact(cropName, 'demand', 12.3);
      const supplyImpact = adjustFactorImpact(cropName, 'supply', -7.2);
      const policyImpact = adjustFactorImpact(cropName, 'policy', 15.0);

      const sampleFactors = [
        weatherFactor,
        {
          factor_type: 'demand',
          description: 'Increased demand from export markets',
          impact_score: 12.3,
          crop_specific_impact: {
            adjusted_score: demandImpact.adjustedScore,
            sentiment: demandImpact.sentiment,
            is_beneficial: demandImpact.adjustedScore > 0,
            crop_message: demandImpact.description || `${cropName} has ${demandImpact.adjustedScore > 8 ? 'high' : 'moderate'} demand sensitivity`
          }
        },
        {
          factor_type: 'supply',
          description: 'Lower supply due to reduced sowing area',
          impact_score: -7.2,
          crop_specific_impact: {
            adjusted_score: supplyImpact.adjustedScore,
            sentiment: supplyImpact.sentiment,
            is_beneficial: supplyImpact.adjustedScore > 0,
            crop_message: supplyImpact.description || `Supply constraints ${Math.abs(supplyImpact.adjustedScore) > 5 ? 'significantly' : 'moderately'} affect ${cropName}`
          }
        },
        {
          factor_type: 'policy',
          description: 'Government announces minimum support price increase',
          impact_score: 15.0,
          crop_specific_impact: {
            adjusted_score: policyImpact.adjustedScore,
            sentiment: policyImpact.sentiment,
            is_beneficial: policyImpact.adjustedScore > 0,
            crop_message: policyImpact.description
          }
        }
      ];
      return res.json(sampleFactors);
    }

    // Enhance existing factors with crop-specific impacts
    const enhancedFactors = data.map(factor => {
      const context = factor.factor_type === 'weather' && currentWeather 
        ? { weather: currentWeather } 
        : {};
      
      const adjustment = adjustFactorImpact(
        cropName, 
        factor.factor_type, 
        factor.impact_score,
        context
      );

      return {
        ...factor,
        crop_specific_impact: {
          adjusted_score: adjustment.adjustedScore,
          sentiment: adjustment.sentiment,
          is_beneficial: adjustment.adjustedScore > 0,
          crop_message: adjustment.description,
          recommendations: adjustment.recommendations
        }
      };
    });

    res.json(enhancedFactors);
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