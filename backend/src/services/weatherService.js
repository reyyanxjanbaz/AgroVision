const axios = require('axios');

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_API_BASE_URL = 'http://api.weatherapi.com/v1';

// Default coordinates/queries for major agricultural regions in India
const DEFAULT_LOCATIONS = {
  punjab: { query: '30.7333,76.7794', name: 'Punjab' },
  maharashtra: { query: '19.7515,75.7139', name: 'Maharashtra' },
  karnataka: { query: '15.3173,75.7139', name: 'Karnataka' },
  'uttar pradesh': { query: '26.8467,80.9462', name: 'Uttar Pradesh' },
  default: { query: 'New Delhi', name: 'Delhi' }
};

/**
 * Fetch current weather data for a specific location using WeatherAPI.com
 * @param {string} region - Region name
 * @returns {Promise<Object>} Weather data
 */
const getCurrentWeather = async (region = 'default') => {
  try {
    if (!WEATHER_API_KEY || WEATHER_API_KEY === 'your_openweather_key_here') {
      throw new Error('Weather API key not configured');
    }

    const location = DEFAULT_LOCATIONS[region.toLowerCase()] || DEFAULT_LOCATIONS.default;
    
    const response = await axios.get(`${WEATHER_API_BASE_URL}/current.json`, {
      params: {
        key: WEATHER_API_KEY,
        q: location.query,
        aqi: 'no'
      }
    });

    const data = response.data;

    // Validate API response structure
    if (!data || !data.current || !data.location) {
      throw new Error('Invalid weather API response structure');
    }
    
    return {
      region: location.name,
      temperature: Math.round(data.current.temp_c),
      feelsLike: Math.round(data.current.feelslike_c),
      humidity: data.current.humidity,
      condition: data.current.condition?.text || 'Unknown',
      description: data.current.condition?.text || 'Unknown',
      windSpeed: data.current.wind_kph, // km/h
      pressure: data.current.pressure_mb,
      icon: data.current.condition?.icon ? `https:${data.current.condition.icon}` : null,
      timestamp: data.current.last_updated
    };
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    throw error;
  }
};

/**
 * Get weather forecast for next 5 days using WeatherAPI.com
 * @param {string} region - Region name
 * @returns {Promise<Array>} Forecast data
 */
const getWeatherForecast = async (region = 'default') => {
  try {
    if (!WEATHER_API_KEY || WEATHER_API_KEY === 'your_openweather_key_here') {
      throw new Error('Weather API key not configured');
    }

    const location = DEFAULT_LOCATIONS[region.toLowerCase()] || DEFAULT_LOCATIONS.default;
    
    const response = await axios.get(`${WEATHER_API_BASE_URL}/forecast.json`, {
      params: {
        key: WEATHER_API_KEY,
        q: location.query,
        days: 5,
        aqi: 'no',
        alerts: 'no'
      }
    });

    const data = response.data;

    // Validate API response structure
    if (!data || !data.forecast || !data.forecast.forecastday) {
      throw new Error('Invalid forecast API response structure');
    }

    const forecasts = data.forecast.forecastday.map(day => ({
      date: day.date,
      temperature: Math.round(day.day.avgtemp_c),
      condition: day.day.condition?.text || 'Unknown',
      description: day.day.condition?.text || 'Unknown',
      humidity: day.day.avghumidity,
      windSpeed: day.day.maxwind_kph,
      icon: day.day.condition?.icon ? `https:${day.day.condition.icon}` : null
    }));

    return {
      region: location.name,
      forecasts
    };
  } catch (error) {
    console.error('Error fetching weather forecast:', error.message);
    throw error;
  }
};

/**
 * Assess agricultural impact based on weather conditions
 * @param {Object} weather - Weather data
 * @returns {Object} Impact assessment
 */
const assessAgriculturalImpact = (weather) => {
  let impactScore = 0;
  let description = '';
  let recommendations = [];

  // Temperature assessment
  if (weather.temperature >= 20 && weather.temperature <= 30) {
    impactScore += 3;
    description += 'Optimal temperature for most crops. ';
    recommendations.push('Good conditions for planting');
  } else if (weather.temperature > 35) {
    impactScore -= 2;
    description += 'High temperatures may stress crops. ';
    recommendations.push('Ensure adequate irrigation');
  } else if (weather.temperature < 15) {
    impactScore -= 1;
    description += 'Cool temperatures may slow growth. ';
    recommendations.push('Monitor frost risk');
  }

  // Humidity assessment
  if (weather.humidity >= 60 && weather.humidity <= 80) {
    impactScore += 2;
    description += 'Humidity levels favorable. ';
  } else if (weather.humidity > 85) {
    impactScore -= 1;
    description += 'High humidity increases disease risk. ';
    recommendations.push('Monitor for fungal diseases');
  }

  // Weather condition assessment
  const condition = weather.condition.toLowerCase();
  if (condition.includes('sunny') || condition.includes('clear')) {
    impactScore += 1;
    description += 'Clear skies, good for photosynthesis. ';
  } else if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('shower')) {
    impactScore += 1;
    description += 'Rainfall beneficial for crops. ';
    recommendations.push('Check drainage systems');
  } else if (condition.includes('storm') || condition.includes('thunder')) {
    impactScore -= 3;
    description += 'Stormy weather may damage crops. ';
    recommendations.push('Take protective measures');
  } else if (condition.includes('cloud') || condition.includes('overcast')) {
    // Neutral impact for cloudy conditions: no significant positive or negative effect on crops
    description += 'Cloudy conditions. ';
  }

  return {
    impactScore: Math.max(-10, Math.min(10, impactScore)),
    description: description.trim(),
    recommendations,
    sentiment: impactScore > 2 ? 'positive' : impactScore < -1 ? 'negative' : 'neutral'
  };
};

module.exports = {
  getCurrentWeather,
  getWeatherForecast,
  assessAgriculturalImpact,
  DEFAULT_LOCATIONS
};
