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

// API functions
export const fetchCrops = async (query) => {
  const params = query ? { q: query } : {};
  const response = await api.get('/crops', { params });
  return response.data;
};

export const fetchCropDetails = async (cropId) => {
  const response = await api.get(`/crops/${cropId}`);
  return response.data;
};

export const fetchPriceHistory = async (cropId, params) => {
  const response = await api.get(`/crops/${cropId}/prices`, { params });
  return response.data;
};

export const fetchPrediction = async (cropId) => {
  const response = await api.get(`/crops/${cropId}/prediction`);
  return response.data;
};

export const fetchFactors = async (cropId) => {
  const response = await api.get(`/crops/${cropId}/factors`);
  return response.data;
};

export const fetchNews = async (cropId) => {
  const response = await api.get(`/crops/${cropId}/news`);
  return response.data;
};

export const sendChatMessage = async (message, context) => {
  const response = await api.post('/chatbot', { message, context });
  return response.data;
};

export const fetchWeather = async (region = 'default') => {
  const response = await api.get('/weather/current', { params: { region } });
  return response.data;
};

export const fetchWeatherForecast = async (region = 'default') => {
  const response = await api.get('/weather/forecast', { params: { region } });
  return response.data;
};

export default api;