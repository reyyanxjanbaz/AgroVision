import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// --- DUMMY DATA FOR OFFLINE MODE ---
const DUMMY_CROPS = [
  {
    id: 1,
    name: "Wheat",
    category: "Cereals",
    image_url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80",
    current_price: 2150,
    price_change_24h: 2.5,
    price_change_7d: 5.1,
    unit: "per quintal"
  },
  {
    id: 2,
    name: "Rice (Basmati)",
    category: "Cereals",
    image_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
    current_price: 3800,
    price_change_24h: -1.2,
    price_change_7d: 0.5,
    unit: "per quintal"
  },
  {
    id: 3,
    name: "Cotton",
    category: "Fibers",
    image_url: "https://images.unsplash.com/photo-1594040291028-236f6884d70c?auto=format&fit=crop&w=800&q=80",
    current_price: 6200,
    price_change_24h: 0.8,
    price_change_7d: -2.3,
    unit: "per quintal"
  },
  {
    id: 4,
    name: "Sugarcane",
    category: "Commercial",
    image_url: "https://images.unsplash.com/photo-1601599963565-b7b42c13c332?auto=format&fit=crop&w=800&q=80",
    current_price: 340,
    price_change_24h: 0.0,
    price_change_7d: 1.2,
    unit: "per quintal"
  },
  {
    id: 5,
    name: "Maize",
    category: "Cereals",
    image_url: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80",
    current_price: 1850,
    price_change_24h: 1.5,
    price_change_7d: 3.8,
    unit: "per quintal"
  },
  {
    id: 6,
    name: "Soybean",
    category: "Oilseeds",
    image_url: "https://images.unsplash.com/photo-1599940824399-b87987ce0799?auto=format&fit=crop&w=800&q=80",
    current_price: 4200,
    price_change_24h: -0.5,
    price_change_7d: -1.8,
    unit: "per quintal"
  }
];

const generatePriceHistory = (basePrice) => {
  const history = [];
  const today = new Date();
  let price = basePrice || 2000;
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    price = price + (Math.random() - 0.5) * 100;
    history.push({
      date: date.toISOString().split('T')[0],
      price: Math.max(100, price),
      region: 'North India'
    });
  }
  return history;
};

const DUMMY_PREDICTION = {
  nextWeek: 2250,
  confidence: 85,
  trend: 'up',
  prediction_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  factors: ['High demand expected', 'Favorable weather conditions']
};

const DUMMY_FACTORS = [
  { id: 1, factor_type: "weather", impact_score: 85, description: "Above average rainfall expected in key growing regions" },
  { id: 2, factor_type: "demand", impact_score: 65, description: "Increasing export demand from neighboring countries" },
  { id: 3, factor_type: "supply", impact_score: -30, description: "Rising transportation costs may affect final prices" }
];

const DUMMY_NEWS = [
  {
    id: 1,
    title: "Government Announces New MSP for Wheat",
    summary: "The central government has increased the Minimum Support Price for wheat by ₹150 per quintal for the upcoming season.",
    source: "AgriNews India",
    published_date: new Date().toISOString(),
    url: "#",
    image_url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: 2,
    title: "Monsoon Forecast Update",
    summary: "IMD predicts normal monsoon rainfall this year, which is good news for kharif crops.",
    source: "Weather Daily",
    published_date: new Date(Date.now() - 86400000).toISOString(),
    url: "#",
    image_url: "https://images.unsplash.com/photo-1530563885674-66db50a1af19?auto=format&fit=crop&w=200&q=80"
  }
];

// API functions
export const fetchCrops = async (query) => {
  // const params = query ? { q: query } : {};
  // const response = await api.get('/crops', { params });
  // return response.data;
  console.log('Using DUMMY data for fetchCrops');
  return new Promise(resolve => setTimeout(() => resolve(DUMMY_CROPS), 500));
};

export const fetchCropDetails = async (cropId) => {
  // const response = await api.get(`/crops/${cropId}`);
  // return response.data;
  console.log('Using DUMMY data for fetchCropDetails');
  const crop = DUMMY_CROPS.find(c => c.id == cropId) || DUMMY_CROPS[0];
  return new Promise(resolve => setTimeout(() => resolve(crop), 500));
};

export const fetchPriceHistory = async (cropId, params) => {
  // const response = await api.get(`/crops/${cropId}/prices`, { params });
  // return response.data;
  console.log('Using DUMMY data for fetchPriceHistory');
  const crop = DUMMY_CROPS.find(c => c.id == cropId) || DUMMY_CROPS[0];
  return new Promise(resolve => setTimeout(() => resolve(generatePriceHistory(crop.current_price)), 500));
};

export const fetchPrediction = async (cropId) => {
  // const response = await api.get(`/crops/${cropId}/prediction`);
  // return response.data;
  console.log('Using DUMMY data for fetchPrediction');
  return new Promise(resolve => setTimeout(() => resolve(DUMMY_PREDICTION), 500));
};

export const fetchFactors = async (cropId) => {
  // const response = await api.get(`/crops/${cropId}/factors`);
  // return response.data;
  console.log('Using DUMMY data for fetchFactors');
  return new Promise(resolve => setTimeout(() => resolve(DUMMY_FACTORS), 500));
};

export const fetchNews = async (cropId) => {
  // const response = await api.get(`/crops/${cropId}/news`);
  // return response.data;
  console.log('Using DUMMY data for fetchNews');
  return new Promise(resolve => setTimeout(() => resolve(DUMMY_NEWS), 500));
};

export const sendChatMessage = async (message, context) => {
  // const response = await api.post('/chatbot', { message, context });
  // return response.data;
  console.log('Using DUMMY data for sendChatMessage');
  return new Promise(resolve => setTimeout(() => resolve({ 
    response: "I'm currently in offline mode, but I can tell you that wheat prices are trending up due to seasonal demand." 
  }), 500));
};

export default api;