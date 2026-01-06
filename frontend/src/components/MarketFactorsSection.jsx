import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cloud, 
  Users, 
  TrendingUp, 
  FileText, 
  DollarSign,
  Newspaper,
  ChevronDown,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  TrendingDown
} from 'lucide-react';
import { fetchGlobalFactors } from '../services/api';
import { useSettings } from '../context/SettingsContext';

const MarketFactorCard = ({ factor, index }) => {
  const { t } = useSettings();
  
  const getFactorIcon = (type) => {
    switch(type) {
      case 'weather': return <Cloud size={20} className="text-blue-500" />;
      case 'demand': return <Users size={20} className="text-green-500" />;
      case 'supply': return <TrendingUp size={20} className="text-amber-500" />;
      case 'policy': return <FileText size={20} className="text-purple-500" />;
      case 'economic': return <DollarSign size={20} className="text-cyan-500" />;
      default: return <Newspaper size={20} className="text-gray-500" />;
    }
  };

  const getFactorColor = (type) => {
    switch(type) {
      case 'weather': return 'from-blue-500/10 to-blue-500/5 border-blue-500/20';
      case 'demand': return 'from-green-500/10 to-green-500/5 border-green-500/20';
      case 'supply': return 'from-amber-500/10 to-amber-500/5 border-amber-500/20';
      case 'policy': return 'from-purple-500/10 to-purple-500/5 border-purple-500/20';
      case 'economic': return 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20';
      default: return 'from-gray-500/10 to-gray-500/5 border-gray-500/20';
    }
  };

  const getIconBgColor = (type) => {
    switch(type) {
      case 'weather': return 'bg-blue-100 dark:bg-blue-900/30';
      case 'demand': return 'bg-green-100 dark:bg-green-900/30';
      case 'supply': return 'bg-amber-100 dark:bg-amber-900/30';
      case 'policy': return 'bg-purple-100 dark:bg-purple-900/30';
      case 'economic': return 'bg-cyan-100 dark:bg-cyan-900/30';
      default: return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  const isPositive = factor.impact_score > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`
        relative overflow-hidden rounded-xl border p-4 
        bg-gradient-to-br ${getFactorColor(factor.factor_type)}
        dark:bg-gray-800 dark:border-gray-700/50
        hover:shadow-md transition-all duration-300
      `}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`p-2.5 rounded-xl ${getIconBgColor(factor.factor_type)} flex-shrink-0`}>
          {getFactorIcon(factor.factor_type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-bold text-sm text-text-primary dark:text-white line-clamp-1">
              {factor.title}
            </h4>
            <div className={`
              flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold font-mono flex-shrink-0
              ${isPositive 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }
            `}>
              {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {isPositive ? '+' : ''}{factor.impact_score?.toFixed?.(1) || factor.impact_score}%
            </div>
          </div>
          
          <p className="text-xs text-text-secondary dark:text-gray-400 line-clamp-2">
            {factor.description}
          </p>

          {/* Type badge */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wide text-text-muted dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
              {t(factor.factor_type)}
            </span>
            {factor.details && factor.details.temperature && (
              <span className="text-[10px] text-text-muted dark:text-gray-500">
                {factor.details.temperature}°C • {factor.details.humidity}% humidity
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MarketFactorsSection = ({ compact = false }) => {
  const { t } = useSettings();
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fallback factors if API fails
  const FALLBACK_FACTORS = [
    {
      id: 'weather-fallback',
      factor_type: 'weather',
      title: 'Seasonal Weather Patterns',
      description: 'Current weather conditions are generally favorable for agricultural activities across most regions.',
      impact_score: 5.2,
    },
    {
      id: 'demand-fallback',
      factor_type: 'demand',
      title: 'Stable Market Demand',
      description: 'Consumer demand remains steady with slight uptick expected during upcoming festive season.',
      impact_score: 8.5,
    },
    {
      id: 'supply-fallback',
      factor_type: 'supply',
      title: 'Supply Chain Update',
      description: 'Supply levels normal across major crops. Some regional variations due to transportation logistics.',
      impact_score: -2.1,
    },
    {
      id: 'policy-fallback',
      factor_type: 'policy',
      title: 'Government Initiatives',
      description: 'New agricultural policies aimed at supporting farmers and stabilizing commodity prices.',
      impact_score: 12.0,
    }
  ];

  const loadFactors = async () => {
    try {
      setRefreshing(true);
      const data = await fetchGlobalFactors();
      if (data && data.length > 0) {
        setFactors(data);
      } else {
        setFactors(FALLBACK_FACTORS);
      }
    } catch (err) {
      console.error('Error loading global factors:', err);
      setFactors(FALLBACK_FACTORS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFactors();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 group"
        >
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 border border-primary/20">
            <Sparkles className="text-primary" size={18} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary dark:text-white flex items-center gap-2">
              {t('marketDrivers')}
              <span className="text-xs font-normal text-text-secondary dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                {factors.length} {t('factors')}
              </span>
            </h2>
            <p className="text-xs text-text-secondary dark:text-gray-400">
              {t('factorsAffectingPrices')}
            </p>
          </div>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="ml-2"
          >
            <ChevronDown size={18} className="text-text-muted group-hover:text-primary transition-colors" />
          </motion.div>
        </button>

        <button
          onClick={loadFactors}
          disabled={refreshing}
          className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                     text-text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-primary 
                     hover:border-primary/30 transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Factors Grid */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
              {factors.map((factor, index) => (
                <MarketFactorCard key={factor.id} factor={factor} index={index} />
              ))}
            </div>

            {/* Summary banner */}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10 dark:from-primary/10 dark:to-secondary/10">
              <div className="flex items-center gap-3">
                <AlertTriangle size={18} className="text-amber-500" />
                <p className="text-xs text-text-secondary dark:text-gray-400">
                  <span className="font-medium text-text-primary dark:text-white">{t('marketSummary')}:</span>{' '}
                  {t('marketSummaryText')}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarketFactorsSection;
