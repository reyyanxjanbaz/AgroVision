import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  Thermometer, 
  Droplets, 
  Wind,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CheckCircle,
  Leaf,
  Info
} from 'lucide-react';
import { fetchCropWeatherImpact } from '../services/api';
import { useSettings } from '../context/SettingsContext';

const CropWeatherImpact = ({ cropName }) => {
  const { t } = useSettings();
  const [impactData, setImpactData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImpact = async () => {
      try {
        const data = await fetchCropWeatherImpact(cropName);
        setImpactData(data);
      } catch (err) {
        console.error('Error loading crop weather impact:', err);
      } finally {
        setLoading(false);
      }
    };

    if (cropName) {
      loadImpact();
    }
  }, [cropName]);

  const getWeatherIcon = (condition) => {
    if (!condition) return <Cloud className="text-gray-400" size={32} />;
    const lower = condition.toLowerCase();
    if (lower.includes('sun') || lower.includes('clear')) {
      return <Sun className="text-amber-500" size={32} />;
    }
    if (lower.includes('rain') || lower.includes('shower')) {
      return <CloudRain className="text-blue-500" size={32} />;
    }
    return <Cloud className="text-gray-400" size={32} />;
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment === 'positive') return 'text-secondary';
    if (sentiment === 'negative') return 'text-danger';
    return 'text-text-muted';
  };

  const getSentimentBg = (sentiment) => {
    if (sentiment === 'positive') return 'bg-secondary/10 border-secondary/30';
    if (sentiment === 'negative') return 'bg-danger/10 border-danger/30';
    return 'bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700';
  };

  if (loading) {
    return (
      <div className="glass-panel p-6 rounded-2xl animate-pulse dark:bg-gray-800">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
        <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded-xl"></div>
      </div>
    );
  }

  if (!impactData) return null;

  const { weather, impact } = impactData;
  const sentiment = impact.sentiment;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 rounded-2xl overflow-hidden relative dark:bg-gray-800 dark:border-gray-700"
    >
      {/* Background decoration based on sentiment */}
      <div className={`absolute top-0 right-0 w-40 h-40 rounded-bl-full opacity-20 ${
        sentiment === 'positive' ? 'bg-secondary' : sentiment === 'negative' ? 'bg-danger' : 'bg-gray-200'
      }`} />
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className={`p-2.5 rounded-xl border ${getSentimentBg(sentiment)}`}>
          <Leaf className={getSentimentColor(sentiment)} size={20} />
        </div>
        <div>
          <h3 className="font-bold text-text-primary dark:text-white font-display">
            {t('weatherImpactFor')} {impactData.cropName}
          </h3>
          <p className="text-xs text-text-secondary dark:text-gray-400">
            {t('currentConditions')}
          </p>
        </div>
      </div>

      {/* Current Weather Summary */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 mb-4">
        {getWeatherIcon(weather.condition)}
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Thermometer size={14} className="text-text-muted" />
              <span className="font-bold text-text-primary dark:text-white font-mono">
                {weather.temperature}°C
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Droplets size={14} className="text-text-muted" />
              <span className="font-bold text-text-primary dark:text-white font-mono">
                {weather.humidity}%
              </span>
            </div>
          </div>
          <p className="text-sm text-text-secondary dark:text-gray-400 mt-1">
            {weather.condition}
          </p>
        </div>
        
        {/* Impact Score */}
        <div className={`text-center px-4 py-2 rounded-xl border ${getSentimentBg(sentiment)}`}>
          <div className={`text-2xl font-bold font-mono ${getSentimentColor(sentiment)}`}>
            {impact.score > 0 ? '+' : ''}{impact.score}
          </div>
          <div className="text-[10px] font-bold uppercase text-text-muted">
            {t('impact')}
          </div>
        </div>
      </div>

      {/* Sentiment Indicator */}
      <div className={`flex items-center gap-3 p-3 rounded-xl border mb-4 ${getSentimentBg(sentiment)}`}>
        {sentiment === 'positive' ? (
          <ThumbsUp className="text-secondary" size={20} />
        ) : sentiment === 'negative' ? (
          <ThumbsDown className="text-danger" size={20} />
        ) : (
          <Info className="text-text-muted" size={20} />
        )}
        <div className="flex-1">
          <p className={`font-bold text-sm ${getSentimentColor(sentiment)}`}>
            {sentiment === 'positive' 
              ? t('beneficial') 
              : sentiment === 'negative' 
                ? t('challenging') 
                : t('neutral')
            } {t('conditions')}
          </p>
          {impact.details && impact.details[0] && (
            <p className="text-xs text-text-secondary dark:text-gray-400">
              {impact.details[0]}
            </p>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {impact.recommendations && impact.recommendations.length > 0 && (
        <div className="space-y-2 mb-4">
          <h4 className="text-xs font-bold text-text-secondary dark:text-gray-400 uppercase tracking-wider">
            {t('recommendations')}
          </h4>
          {impact.recommendations.map((rec, idx) => (
            <div 
              key={idx}
              className="flex items-start gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
            >
              <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-amber-800 dark:text-amber-300">{rec}</span>
            </div>
          ))}
        </div>
      )}

      {/* Optimal Conditions & Vulnerabilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
        {impact.optimalConditions && (
          <div className="p-3 rounded-xl bg-secondary/5 dark:bg-secondary/10 border border-secondary/20">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={14} className="text-secondary" />
              <span className="text-xs font-bold text-secondary uppercase">
                {t('optimalConditionsLabel')}
              </span>
            </div>
            <p className="text-xs text-text-secondary dark:text-gray-400">
              {impact.optimalConditions}
            </p>
          </div>
        )}
        
        {impact.vulnerabilities && impact.vulnerabilities.length > 0 && (
          <div className="p-3 rounded-xl bg-danger/5 dark:bg-danger/10 border border-danger/20">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={14} className="text-danger" />
              <span className="text-xs font-bold text-danger uppercase">
                {t('vulnerabilitiesLabel')}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {impact.vulnerabilities.map((v, idx) => (
                <span 
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-danger/10 text-danger font-medium"
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CropWeatherImpact;
