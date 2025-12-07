const express = require('express');
const router = express.Router();
const { getCurrentWeather, getWeatherForecast, assessAgriculturalImpact } = require('../services/weatherService');

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

module.exports = router;
