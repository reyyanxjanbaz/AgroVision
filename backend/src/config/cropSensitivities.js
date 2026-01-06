/**
 * Crop Sensitivity Profiles
 * 
 * Each crop has different sensitivities to various market factors.
 * Values range from -1 (negatively affected) to +1 (positively affected)
 * 
 * Factor Types:
 * - rain: Response to rainfall/precipitation
 * - temperature: Response to temperature changes
 * - humidity: Response to humidity levels
 * - demand: Sensitivity to demand fluctuations
 * - supply: Response to supply chain changes
 * - policy: Sensitivity to government policies
 * - global: Sensitivity to international markets
 */

const cropSensitivities = {
  // Rice thrives in wet conditions, paddy fields need standing water
  'rice': {
    name: 'Rice',
    rain: 0.9,           // Loves rain - paddy fields
    excessRain: 0.6,     // Even heavy rain is usually okay
    drought: -0.9,       // Very bad without water
    temperature: {
      hot: -0.3,         // Moderate heat stress
      optimal: 0.8,      // 25-35°C ideal
      cold: -0.7         // Frost kills rice
    },
    humidity: 0.7,       // High humidity preferred
    demand: 0.6,         // Staple food, stable demand
    supply: -0.5,        // Affected by supply disruptions
    policy: 0.8,         // Highly policy dependent (MSP, exports)
    global: 0.6,         // Export oriented
    seasonalPeak: ['kharif'],
    optimalConditions: 'Warm and wet conditions with standing water',
    vulnerabilities: ['drought', 'cold', 'pest infestation']
  },

  // Wheat prefers cool, dry conditions
  'wheat': {
    name: 'Wheat',
    rain: 0.3,           // Needs moderate rain
    excessRain: -0.7,    // Too much rain causes lodging/disease
    drought: -0.6,       // Moderate drought tolerance
    temperature: {
      hot: -0.8,         // Heat stress during grain filling
      optimal: 0.9,      // 15-25°C ideal
      cold: 0.4          // Tolerates cold well
    },
    humidity: -0.4,      // Prefers drier conditions
    demand: 0.7,         // Staple, high demand
    supply: -0.4,
    policy: 0.9,         // Heavily subsidized crop
    global: 0.7,         // Major export crop
    seasonalPeak: ['rabi'],
    optimalConditions: 'Cool and dry conditions during growth, mild at harvest',
    vulnerabilities: ['heat waves', 'excessive rain', 'rust disease']
  },

  // Cotton is very sensitive to rain during harvest
  'cotton': {
    name: 'Cotton',
    rain: 0.2,           // Moderate rain during growth
    excessRain: -0.9,    // Destroys fiber quality at harvest
    drought: -0.5,       // Needs irrigation
    temperature: {
      hot: 0.6,          // Likes warmth
      optimal: 0.8,      // 25-35°C ideal
      cold: -0.8         // Frost damages bolls
    },
    humidity: -0.6,      // High humidity causes boll rot
    demand: 0.8,         // Textile industry demand
    supply: -0.6,        // Global supply sensitive
    policy: 0.7,         // MSP and export policies
    global: 0.9,         // Heavily traded globally
    seasonalPeak: ['kharif'],
    optimalConditions: 'Warm and dry conditions, especially during boll opening',
    vulnerabilities: ['rain at harvest', 'bollworm', 'price volatility']
  },

  // Sugarcane needs lots of water but not waterlogging
  'sugarcane': {
    name: 'Sugarcane',
    rain: 0.7,           // Needs good rainfall
    excessRain: -0.3,    // Can handle some excess
    drought: -0.8,       // Very water intensive
    temperature: {
      hot: 0.7,          // Tropical crop, likes heat
      optimal: 0.9,      // 20-35°C ideal
      cold: -0.6         // Frost damages cane
    },
    humidity: 0.5,       // Tolerates high humidity
    demand: 0.5,         // Steady sugar demand
    supply: -0.3,        // Processing capacity dependent
    policy: 0.9,         // FRP and state policies
    global: 0.4,         // Mostly domestic
    seasonalPeak: ['year-round'],
    optimalConditions: 'Hot and humid with regular water supply',
    vulnerabilities: ['drought', 'water-logging', 'red rot disease']
  },

  // Potato prefers cool conditions
  'potato': {
    name: 'Potato',
    rain: 0.4,           // Moderate moisture needed
    excessRain: -0.8,    // Causes rot and disease
    drought: -0.6,       // Needs consistent moisture
    temperature: {
      hot: -0.9,         // Heat stress reduces tuber formation
      optimal: 0.9,      // 15-20°C ideal
      cold: 0.3          // Cool weather preferred
    },
    humidity: -0.5,      // High humidity causes blight
    demand: 0.6,         // Consistent food demand
    supply: -0.7,        // Highly perishable
    policy: 0.3,         // Less policy dependent
    global: 0.2,         // Mostly domestic
    seasonalPeak: ['rabi', 'kharif'],
    optimalConditions: 'Cool temperatures with consistent moisture',
    vulnerabilities: ['heat waves', 'late blight', 'storage losses']
  },

  // Tomato is highly weather sensitive
  'tomato': {
    name: 'Tomato',
    rain: 0.3,           // Moderate water needs
    excessRain: -0.9,    // Causes splitting and disease
    drought: -0.7,       // Water stress affects yield
    temperature: {
      hot: -0.6,         // Fruit set affected by heat
      optimal: 0.9,      // 20-30°C ideal
      cold: -0.8         // Frost kills plants
    },
    humidity: -0.7,      // High humidity causes disease
    demand: 0.7,         // High demand, price volatile
    supply: -0.9,        // Very perishable, supply sensitive
    policy: 0.2,         // Market driven
    global: 0.3,         // Mostly local
    seasonalPeak: ['rabi', 'summer'],
    optimalConditions: 'Warm days, cool nights, low humidity',
    vulnerabilities: ['rain at harvest', 'price crashes', 'transport losses']
  },

  // Soybean - moderate water needs
  'soyabean': {
    name: 'Soyabean',
    rain: 0.5,           // Moderate rain needed
    excessRain: -0.5,    // Can cause waterlogging
    drought: -0.7,       // Water stress at flowering critical
    temperature: {
      hot: -0.4,         // Some heat tolerance
      optimal: 0.8,      // 20-30°C ideal
      cold: -0.5         // Frost sensitive
    },
    humidity: 0.3,       // Moderate humidity okay
    demand: 0.8,         // Oil and feed demand
    supply: -0.5,
    policy: 0.6,         // MSP support
    global: 0.8,         // International price linked
    seasonalPeak: ['kharif'],
    optimalConditions: 'Warm temperatures with moderate rainfall',
    vulnerabilities: ['drought during flowering', 'rust', 'global price swings']
  },

  // Maize/Corn
  'maize': {
    name: 'Maize',
    rain: 0.5,
    excessRain: -0.6,
    drought: -0.8,       // Very drought sensitive at tasseling
    temperature: {
      hot: -0.5,
      optimal: 0.8,
      cold: -0.6
    },
    humidity: 0.2,
    demand: 0.7,
    supply: -0.5,
    policy: 0.5,
    global: 0.7,
    seasonalPeak: ['kharif', 'rabi'],
    optimalConditions: 'Warm temperatures with good moisture during growth',
    vulnerabilities: ['drought at tasseling', 'stem borer', 'aflatoxin']
  },

  // Default for unknown crops
  'default': {
    name: 'General Crop',
    rain: 0.4,
    excessRain: -0.5,
    drought: -0.6,
    temperature: {
      hot: -0.3,
      optimal: 0.7,
      cold: -0.4
    },
    humidity: 0.0,
    demand: 0.5,
    supply: -0.4,
    policy: 0.5,
    global: 0.4,
    seasonalPeak: ['varies'],
    optimalConditions: 'Moderate conditions',
    vulnerabilities: ['weather extremes', 'market volatility']
  }
};

/**
 * Get crop sensitivity profile by name
 * @param {string} cropName - Name of the crop
 * @returns {Object} Sensitivity profile
 */
const getCropSensitivity = (cropName) => {
  if (!cropName) return cropSensitivities.default;
  
  const normalizedName = cropName.toLowerCase().trim();
  
  // Handle variations
  if (normalizedName.includes('rice') || normalizedName.includes('basmati') || normalizedName.includes('paddy')) {
    return cropSensitivities.rice;
  }
  if (normalizedName.includes('soy') || normalizedName.includes('soya')) {
    return cropSensitivities.soyabean;
  }
  if (normalizedName.includes('corn') || normalizedName.includes('maize')) {
    return cropSensitivities.maize;
  }
  
  return cropSensitivities[normalizedName] || cropSensitivities.default;
};

/**
 * Calculate crop-specific impact from weather conditions
 * @param {string} cropName - Name of the crop
 * @param {Object} weather - Weather data
 * @returns {Object} Impact assessment with crop-specific adjustments
 */
const calculateWeatherImpact = (cropName, weather) => {
  const sensitivity = getCropSensitivity(cropName);
  let impactScore = 0;
  let details = [];
  let recommendations = [];

  // Temperature impact
  if (weather.temperature) {
    const temp = weather.temperature;
    if (temp > 35) {
      impactScore += sensitivity.temperature.hot * 10;
      if (sensitivity.temperature.hot < 0) {
        details.push(`High heat (${temp}°C) is stressful for ${sensitivity.name}`);
        recommendations.push('Consider irrigation during peak heat hours');
      } else {
        details.push(`Warm conditions (${temp}°C) favor ${sensitivity.name} growth`);
      }
    } else if (temp < 15) {
      impactScore += sensitivity.temperature.cold * 8;
      if (sensitivity.temperature.cold < 0) {
        details.push(`Cool temperatures (${temp}°C) may slow ${sensitivity.name} growth`);
        recommendations.push('Monitor for frost risk');
      } else {
        details.push(`Cool weather (${temp}°C) is beneficial for ${sensitivity.name}`);
      }
    } else {
      impactScore += sensitivity.temperature.optimal * 5;
      details.push(`Temperature (${temp}°C) is near optimal for ${sensitivity.name}`);
    }
  }

  // Rain/precipitation impact
  const condition = (weather.condition || '').toLowerCase();
  if (condition.includes('rain') || condition.includes('shower') || condition.includes('drizzle')) {
    if (condition.includes('heavy') || condition.includes('storm')) {
      impactScore += sensitivity.excessRain * 12;
      if (sensitivity.excessRain < -0.5) {
        details.push(`Heavy rainfall is detrimental to ${sensitivity.name}`);
        recommendations.push('Ensure proper drainage');
      } else {
        details.push(`${sensitivity.name} can handle heavy rainfall well`);
      }
    } else {
      impactScore += sensitivity.rain * 8;
      if (sensitivity.rain > 0.5) {
        details.push(`Rainfall is beneficial for ${sensitivity.name}`);
      } else if (sensitivity.rain < 0) {
        details.push(`Rain may not be ideal for ${sensitivity.name} at this stage`);
      }
    }
  } else if (condition.includes('sunny') || condition.includes('clear')) {
    // Check for potential drought conditions
    if (weather.humidity && weather.humidity < 30) {
      impactScore += sensitivity.drought * 6;
      if (sensitivity.drought < -0.6) {
        details.push(`Dry conditions require attention for ${sensitivity.name}`);
        recommendations.push('Monitor soil moisture levels');
      }
    }
  }

  // Humidity impact
  if (weather.humidity) {
    if (weather.humidity > 80) {
      impactScore += sensitivity.humidity * 5;
      if (sensitivity.humidity < 0) {
        details.push(`High humidity (${weather.humidity}%) increases disease risk`);
        recommendations.push('Monitor for fungal diseases');
      } else {
        details.push(`${sensitivity.name} thrives in humid conditions`);
      }
    }
  }

  return {
    cropName: sensitivity.name,
    impactScore: Math.round(Math.max(-10, Math.min(10, impactScore)) * 10) / 10,
    sentiment: impactScore > 2 ? 'positive' : impactScore < -2 ? 'negative' : 'neutral',
    details,
    recommendations,
    optimalConditions: sensitivity.optimalConditions,
    vulnerabilities: sensitivity.vulnerabilities
  };
};

/**
 * Get crop recommendations based on current weather
 * @param {Object} weather - Current weather conditions
 * @param {Array} availableCrops - List of crops to evaluate
 * @returns {Array} Sorted recommendations
 */
const getCropRecommendations = (weather, availableCrops = []) => {
  const crops = availableCrops.length > 0 
    ? availableCrops 
    : Object.keys(cropSensitivities).filter(k => k !== 'default');
  
  const recommendations = crops.map(cropName => {
    const impact = calculateWeatherImpact(cropName, weather);
    return {
      cropName: impact.cropName,
      cropKey: cropName,
      score: impact.impactScore,
      sentiment: impact.sentiment,
      reason: impact.details[0] || 'Weather conditions are moderate',
      optimalConditions: impact.optimalConditions
    };
  });

  // Sort by score descending (best crops first)
  return recommendations.sort((a, b) => b.score - a.score);
};

/**
 * Calculate factor impact based on crop sensitivity
 * @param {string} cropName - Name of the crop
 * @param {string} factorType - Type of factor (weather, demand, supply, policy)
 * @param {number} baseImpact - Base impact score
 * @param {Object} context - Additional context (weather conditions, etc.)
 * @returns {Object} Adjusted impact
 */
const adjustFactorImpact = (cropName, factorType, baseImpact, context = {}) => {
  const sensitivity = getCropSensitivity(cropName);
  let multiplier = 1;
  let customDescription = null;

  switch (factorType) {
    case 'weather':
      // Weather factors are complex, use full calculation
      if (context.weather) {
        const weatherImpact = calculateWeatherImpact(cropName, context.weather);
        return {
          adjustedScore: weatherImpact.impactScore,
          multiplier: weatherImpact.impactScore / (baseImpact || 1),
          description: weatherImpact.details[0],
          sentiment: weatherImpact.sentiment,
          cropSpecific: true,
          recommendations: weatherImpact.recommendations
        };
      }
      // Fallback: use rain sensitivity for general weather
      multiplier = baseImpact > 0 ? sensitivity.rain : sensitivity.excessRain;
      break;
    
    case 'demand':
      multiplier = sensitivity.demand;
      break;
    
    case 'supply':
      multiplier = sensitivity.supply;
      break;
    
    case 'policy':
      multiplier = sensitivity.policy;
      customDescription = sensitivity.policy > 0.7 
        ? `${sensitivity.name} is highly sensitive to policy changes`
        : `${sensitivity.name} has moderate policy sensitivity`;
      break;
    
    case 'global':
      multiplier = sensitivity.global;
      customDescription = sensitivity.global > 0.7
        ? `${sensitivity.name} prices are closely tied to international markets`
        : `${sensitivity.name} is primarily influenced by domestic markets`;
      break;
    
    default:
      multiplier = 0.5;
  }

  const adjustedScore = Math.round(baseImpact * multiplier * 10) / 10;
  
  return {
    adjustedScore,
    multiplier,
    description: customDescription,
    sentiment: adjustedScore > 2 ? 'positive' : adjustedScore < -2 ? 'negative' : 'neutral',
    cropSpecific: true
  };
};

module.exports = {
  cropSensitivities,
  getCropSensitivity,
  calculateWeatherImpact,
  getCropRecommendations,
  adjustFactorImpact
};
