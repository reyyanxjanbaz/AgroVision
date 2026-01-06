const express = require('express');
const router = express.Router();
const { getCurrentWeather, getWeatherForecast, assessAgriculturalImpact } = require('../services/weatherService');
const { getCropRecommendations, calculateWeatherImpact } = require('../config/cropSensitivities');

// GET current weather for a region
router.get('/current', async (req, res) => {
  try {
    const { region } = req.query;
    const weather = await getCurrentWeather(region);
    const impact = assessAgriculturalImpact(weather);
    
    res.json({
      ...weather,
      impact
    });
  } catch (error) {
    console.error('Error fetching current weather:', error);
    const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message;
    res.status(500).json({ 
      error: message,
      fallback: {
        temperature: null,
        condition: 'Unavailable',
        description: 'Weather data temporarily unavailable',
        impact: {
          description: 'Impact data unavailable due to weather data error'
        }
      }
    });
  }
});

// GET weather forecast
router.get('/forecast', async (req, res) => {
  try {
    const { region } = req.query;
    const forecast = await getWeatherForecast(region);
    
    res.json(forecast);
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message;
    res.status(500).json({ 
      error: message,
      forecasts: []
    });
  }
});

// GET crop recommendations based on current weather
router.get('/recommendations', async (req, res) => {
  try {
    const { region } = req.query;
    const weather = await getCurrentWeather(region);
    
    // Get recommendations for all crops
    const recommendations = getCropRecommendations(weather);
    
    // Split into favorable and unfavorable
    const favorable = recommendations.filter(r => r.score > 0).slice(0, 3);
    const unfavorable = recommendations.filter(r => r.score < 0).slice(-3).reverse();
    
    res.json({
      weather: {
        temperature: weather.temperature,
        condition: weather.condition,
        humidity: weather.humidity
      },
      favorable,
      unfavorable,
      allRecommendations: recommendations
    });
  } catch (error) {
    console.error('Error getting crop recommendations:', error);
    res.status(500).json({ 
      error: error.message,
      favorable: [],
      unfavorable: []
    });
  }
});

// GET weather impact for a specific crop
router.get('/impact/:cropName', async (req, res) => {
  try {
    const { cropName } = req.params;
    const { region } = req.query;
    
    const weather = await getCurrentWeather(region);
    const impact = calculateWeatherImpact(cropName, weather);
    
    res.json({
      cropName: impact.cropName,
      weather: {
        temperature: weather.temperature,
        condition: weather.condition,
        humidity: weather.humidity
      },
      impact: {
        score: impact.impactScore,
        sentiment: impact.sentiment,
        details: impact.details,
        recommendations: impact.recommendations,
        optimalConditions: impact.optimalConditions,
        vulnerabilities: impact.vulnerabilities
      }
    });
  } catch (error) {
    console.error('Error calculating weather impact:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
