import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  ThumbsUp, 
  ThumbsDown,
  ChevronRight,
  Leaf,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchWeatherRecommendations } from '../services/api';
import { useSettings } from '../context/SettingsContext';

// Fallback data when API is unavailable
const FALLBACK_DATA = {
  weather: { temperature: 28, condition: 'Partly Cloudy', humidity: 65 },
  favorable: [
    { cropName: 'Rice', cropKey: 'rice', score: 7.2, reason: 'Warm and humid conditions are ideal' },
    { cropName: 'Sugarcane', cropKey: 'sugarcane', score: 5.8, reason: 'Temperature suits growth phase' },
    { cropName: 'Maize', cropKey: 'maize', score: 4.1, reason: 'Moderate conditions favorable' }
  ],
  unfavorable: [
    { cropName: 'Wheat', cropKey: 'wheat', score: -3.5, reason: 'Prefers cooler temperatures' },
    { cropName: 'Potato', cropKey: 'potato', score: -2.8, reason: 'Heat may stress tuber formation' }
  ]
};

const WeatherCropWidget = ({ crops = [] }) => {
  const { t } = useSettings();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('favorable');

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const data = await fetchWeatherRecommendations();
      if (data && (data.favorable || data.unfavorable)) {
        setRecommendations(data);
      } else {
        // Use fallback if data is incomplete
        setRecommendations(FALLBACK_DATA);
      }
    } catch (err) {
      console.error('Error loading weather recommendations:', err);
      // Use fallback data on error
      setRecommendations(FALLBACK_DATA);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const getWeatherIcon = (condition) => {
    if (!condition) return <Cloud className="text-gray-400" size={24} />;
    const lower = condition.toLowerCase();
    if (lower.includes('sun') || lower.includes('clear')) {
      return <Sun className="text-amber-500" size={24} />;
    }
    if (lower.includes('rain') || lower.includes('shower')) {
      return <CloudRain className="text-blue-500" size={24} />;
    }
    return <Cloud className="text-gray-400" size={24} />;
  };

  // Find crop in list to get link
  const getCropLink = (cropKey) => {
    const crop = crops.find(c => 
      c.name.toLowerCase().includes(cropKey.toLowerCase()) ||
      cropKey.toLowerCase().includes(c.name.toLowerCase())
    );
    return crop ? `/crop/${crop.id}` : null;
  };

  if (loading) {
    return (
      <div className="glass-panel p-6 rounded-2xl animate-pulse dark:bg-gray-800 dark:border-gray-700">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl"></div>
          <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl"></div>
          <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Always show widget with either real or fallback data
  const data = recommendations || FALLBACK_DATA;
  const { weather, favorable = [], unfavorable = [] } = data;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 rounded-2xl overflow-hidden relative dark:bg-gray-800 border border-green-500"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-50" />
      
      {/* Header with current weather */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 border border-primary/20">
            <Sparkles className="text-primary" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-text-primary dark:text-white font-display">
              {t('weatherCropInsights')}
            </h3>
            <p className="text-xs text-text-secondary dark:text-gray-400">
              {t('basedOnCurrentConditions')}
            </p>
          </div>
        </div>
        
        {weather && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600">
            {getWeatherIcon(weather.condition)}
            <div className="text-right">
              <div className="text-sm font-bold text-text-primary dark:text-white font-mono">
                {weather.temperature}°C
              </div>
              <div className="text-[10px] text-text-muted dark:text-gray-400">{weather.condition}</div>
            </div>
          </div>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('favorable')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'favorable'
              ? 'bg-secondary/10 text-secondary border border-secondary/30 dark:bg-secondary/20'
              : 'bg-gray-50 dark:bg-gray-700 text-text-secondary dark:text-gray-400 border border-gray-100 dark:border-gray-600 hover:border-secondary/30'
          }`}
        >
          <ThumbsUp size={14} />
          {t('favorableCrops')}
        </button>
        <button
          onClick={() => setActiveTab('unfavorable')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'unfavorable'
              ? 'bg-danger/10 text-danger border border-danger/30 dark:bg-danger/20'
              : 'bg-gray-50 dark:bg-gray-700 text-text-secondary dark:text-gray-400 border border-gray-100 dark:border-gray-600 hover:border-danger/30'
          }`}
        >
          <ThumbsDown size={14} />
          {t('challengedCrops')}
        </button>
      </div>

      {/* Crop Recommendations */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === 'favorable' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: activeTab === 'favorable' ? 20 : -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-2"
        >
          {(activeTab === 'favorable' ? favorable : unfavorable).map((crop, index) => {
            const cropLink = getCropLink(crop.cropKey);
            const content = (
              <div 
                key={crop.cropKey || index}
                className={`p-3 rounded-xl border transition-all group ${
                  activeTab === 'favorable'
                    ? 'bg-secondary/5 border-secondary/20 hover:border-secondary/40 dark:bg-secondary/10'
                    : 'bg-danger/5 border-danger/20 hover:border-danger/40 dark:bg-danger/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      activeTab === 'favorable' 
                        ? 'bg-secondary/20 text-secondary' 
                        : 'bg-danger/20 text-danger'
                    }`}>
                      <Leaf size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-text-primary dark:text-white">
                        {crop.cropName}
                      </h4>
                      <p className="text-xs text-text-secondary dark:text-gray-400 line-clamp-1">
                        {crop.reason}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                      activeTab === 'favorable'
                        ? 'bg-secondary/20 text-secondary'
                        : 'bg-danger/20 text-danger'
                    }`}>
                      {crop.score > 0 ? '+' : ''}{crop.score?.toFixed?.(1) || crop.score}
                    </span>
                    {cropLink && (
                      <ChevronRight 
                        size={16} 
                        className="text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" 
                      />
                    )}
                  </div>
                </div>
              </div>
            );

            return cropLink ? (
              <Link key={crop.cropKey || index} to={cropLink}>
                {content}
              </Link>
            ) : (
              <div key={crop.cropKey || index}>{content}</div>
            );
          })}

          {(activeTab === 'favorable' ? favorable : unfavorable).length === 0 && (
            <div className="text-center py-6 text-text-muted">
              <AlertCircle size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t('noDataAvailable')}</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer tip */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <p className="text-[10px] text-text-muted dark:text-gray-500 flex items-start gap-2">
          <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
          {activeTab === 'favorable' 
            ? t('favorableTip')
            : t('challengedTip')
          }
        </p>
      </div>
    </motion.div>
  );
};

export default WeatherCropWidget;
