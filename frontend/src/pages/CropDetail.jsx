import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { subDays, format } from 'date-fns';
import { motion } from 'framer-motion';
import PriceChart from '../components/PriceChart';
import LoadingSpinner from '../components/LoadingSpinner';
import PredictionCard from '../components/PredictionCard';
import FactorsList from '../components/FactorsList';
import { fetchCropDetails, fetchPriceHistory, refreshPriceHistory, fetchPrediction, fetchFactors, fetchNews } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, ExternalLink, Activity, Layers } from 'lucide-react';

const getCropImage = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes('cotton')) return 'https://cdn.britannica.com/18/156618-050-39339EA2/cotton-harvest-field-Texas.jpg';
  if (lower.includes('sugarcane')) return 'https://4.imimg.com/data4/QX/AP/MY-8729085/sugarcane-plant-1000x1000.jpg';
  if (lower.includes('soyabean') || lower.includes('soybean')) return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqnl0mDa36Zsd2B2rCkZ2ZGhvhcqV2hqU_2g&s';
  return null;
};

const CropDetail = () => {
  const { id } = useParams();
  const { role } = useAuth();
  const { t } = useSettings();
  const [crop, setCrop] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [factors, setFactors] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('1M');
  const [region, setRegion] = useState('all');

  const periods = [
    { label: '1W', days: 7 },
    { label: '1M', days: 30 },
    { label: '3M', days: 90 },
    { label: '6M', days: 180 },
    { label: '1Y', days: 365 },
  ];

  const loadCropData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [cropData, historyData, predictionData, factorsData, newsData] = await Promise.all([
        fetchCropDetails(id),
        fetchPriceHistory(id, { region }),
        fetchPrediction(id),
        fetchFactors(id),
        fetchNews(id),
      ]);

      setCrop(cropData);
      setPriceHistory(historyData);
      setPrediction(predictionData);
      setFactors(factorsData);
      setNews(newsData);
    } catch (err) {
      console.error('Error loading crop data:', err);
    } finally {
      setLoading(false);
    }
  }, [id, region]);

  // Refresh price data with fresh simulated values
  const handleRefreshPriceData = useCallback(async () => {
    try {
      const freshData = await refreshPriceHistory(id, region);
      setPriceHistory(freshData);
      
      // Also refresh prediction based on new data
      const newPrediction = await fetchPrediction(id);
      setPrediction(newPrediction);
    } catch (err) {
      console.error('Error refreshing price data:', err);
    }
  }, [id, region]);

  useEffect(() => {
    loadCropData();
  }, [loadCropData]);

  const getFilteredData = () => {
    const period = periods.find(p => p.label === timePeriod);
    if (!period) return priceHistory;

    const cutoffDate = subDays(new Date(), period.days);
    return priceHistory.filter(item => new Date(item.date) >= cutoffDate);
  };

  const getPriceDisplay = () => {
    if (!crop) return { price: '0.00', unit: '' };
    
    let price = crop.current_price || 0;
    let unit = crop.unit || 'Quintal';

    if (role === 'customer') {
      // Convert Quintal to Kg and add 20% retail markup
      price = (price / 100) * 1.20;
      unit = 'Kg';
    } else if (role === 'merchant') {
      // Wholesale price
      unit = 'Quintal';
    } else {
      // Farmer price
      unit = 'Quintal';
    }

    return {
      price: price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      unit: unit.toUpperCase()
    };
  };

  const getFilteredNews = () => {
    if (!news.length) return [];
    return news.filter(article => !article.audience || article.audience.includes(role));
  };

  const getAdjustedPrediction = () => {
    if (!prediction) return null;
    let next3Days = prediction.next3Days;

    if (role === 'customer') {
      // Convert Quintal to Kg and add 20% retail markup
      next3Days = (next3Days / 100) * 1.20;
    }

    return {
      ...prediction,
      next3Days
    };
  };



  if (loading) return <LoadingSpinner message={t('accessingDatabase')} />;

  if (!crop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Activity className="text-text-muted dark:text-gray-500" size={32} />
        </div>
        <h2 className="text-xl font-bold text-text-primary dark:text-white mb-2">{t('dataNotFound')}</h2>
        <p className="text-text-secondary dark:text-gray-400 mb-6">{t('cropDataNotFound')}</p>
        <Link to="/" className="btn-primary">
          {t('returnDashboard')}
        </Link>
      </div>
    );
  }

  const filteredData = getFilteredData();
  const filteredNews = getFilteredNews();
  const { price: displayPrice, unit: displayUnit } = getPriceDisplay();
  const adjustedPrediction = getAdjustedPrediction();
  const isPositive = crop.price_change_24h >= 0;

  const adjustedHistory = filteredData.map(item => {
    let price = item.price;
    if (role === 'customer') {
      price = (price / 100) * 1.20;
    }
    return {
      ...item,
      price
    };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb */}
      <Link to="/" className="inline-flex items-center gap-2 text-text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors mb-4 group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-mono uppercase tracking-wider">{t('backToDashboard')}</span>
      </Link>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: Main Info + Chart + News */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Combined Main Info + Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 rounded-xl relative overflow-hidden flex flex-col dark:bg-gray-800 dark:border-gray-700"
          >
             {/* Background Decoration */}
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Activity size={200} className="text-primary" />
            </div>

            {/* Header: Image & Info */}
            <div className="flex flex-col sm:flex-row items-start gap-6 mb-8 relative z-10">
              <div className="relative flex-shrink-0">
                <img 
                  src={crop.image_url || getCropImage(crop.name) || `https://loremflickr.com/400/400/${crop.name},agriculture/all`} 
                  alt={crop.name} 
                  className="w-32 h-32 rounded-2xl border border-gray-200 dark:border-gray-600 object-cover shadow-lg"
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = `https://ui-avatars.com/api/?name=${crop.name}&background=random&size=400`;
                  }}
                />
                <div className="absolute -bottom-3 -right-3 bg-white dark:bg-gray-700 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-mono text-primary shadow-sm">
                  ID: {String(crop.id).substring(0, 4).toUpperCase()}
                </div>
              </div>
              
              <div className="flex-1 w-full">
                <div className="flex justify-between items-start">
                  <div>
                      <h1 className="text-4xl font-bold text-text-primary dark:text-white font-display mb-2">{t(crop.name.toLowerCase()) || crop.name}</h1>
                      <span className="px-3 py-1 rounded-full bg-primary/90 border border-primary text-white text-xs font-mono uppercase tracking-wide">
                      {crop.category}
                      </span>
                  </div>
                  {/* Price Display */}
                  <div className="text-right">
                      <div className="flex items-baseline justify-end gap-1">
                          <span className="text-lg text-text-secondary dark:text-gray-400 font-mono">₹</span>
                          <span className="text-4xl font-bold text-text-primary dark:text-white font-mono tracking-tight">
                          {displayPrice}
                          </span>
                      </div>
                      <p className="text-xs text-text-secondary dark:text-gray-400 font-mono mt-1">
                          {role === 'customer' ? t('retail') : role === 'merchant' ? t('wholesale') : t('marketPrice')} PER {displayUnit}
                      </p>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center gap-4">
                   <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                    isPositive 
                      ? 'bg-secondary/90 border-secondary text-white dark:bg-secondary dark:border-secondary' 
                      : 'bg-danger/90 border-danger text-white dark:bg-danger dark:border-danger'
                  }`}>
                    {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    <span className="font-mono font-bold text-lg">{Math.abs(crop.price_change_24h).toFixed(2)}%</span>
                    <span className="text-xs opacity-80 font-medium uppercase ml-1">{t('24hChange')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="border-t border-gray-100 dark:border-gray-700 pt-6 mt-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <h3 className="text-lg font-bold text-text-primary dark:text-white flex items-center gap-2">
                      <Activity size={18} className="text-primary" />
                      {t('priceAnalysis')}
                  </h3>
                  
                  <div className="flex gap-3">
                      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                      {periods.map((period) => (
                          <button
                          key={period.label}
                          onClick={() => setTimePeriod(period.label)}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                              timePeriod === period.label
                              ? 'bg-white dark:bg-gray-600 text-primary shadow-sm'
                              : 'text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-white'
                          }`}
                          >
                          {period.label}
                          </button>
                      ))}
                      </div>
                      <select
                          value={region}
                          onChange={(e) => setRegion(e.target.value)}
                          className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs text-text-primary dark:text-white focus:border-primary/50 focus:outline-none"
                      >
                          <option value="all">{t('allRegions')}</option>
                          <option value="north">{t('north')}</option>
                          <option value="south">{t('south')}</option>
                          <option value="east">{t('east')}</option>
                          <option value="west">{t('west')}</option>
                      </select>
                  </div>
              </div>

              <div className="w-full h-[300px] md:h-[500px]">
                  {adjustedHistory.length > 0 ? (
                  <PriceChart data={adjustedHistory} prediction={adjustedPrediction} unit={displayUnit} onRefresh={handleRefreshPriceData} />
                  ) : (
                  <div className="h-full flex items-center justify-center border border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
                      <p className="text-text-secondary dark:text-gray-400">{t('noPriceData')}</p>
                  </div>
                  )}
              </div>
            </div>
          </motion.div>

          {/* News Feed */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-text-primary dark:text-white flex items-center gap-2">
              <Calendar className="text-primary" size={20} />
              {role === 'customer' ? t('consumerInsights') : t('marketIntelligence')}
            </h2>
            
            {filteredNews.length > 0 ? (
              <div className="grid gap-4">
                {filteredNews.map((article, index) => (
                  <motion.a
                    key={index}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-panel p-0 rounded-xl overflow-hidden hover:shadow-lg transition-all group border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row h-auto sm:h-40 dark:bg-gray-800"
                  >
                    {article.image_url && (
                      <div className="sm:w-40 h-40 sm:h-full relative overflow-hidden flex-shrink-0">
                          <img 
                          src={article.image_url} 
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                      </div>
                    )}
                    <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
                      <div className="flex items-center gap-2 text-[10px] text-primary font-mono uppercase tracking-wider mb-1">
                          <span className="truncate">{article.source}</span>
                          <span>•</span>
                          <span>{format(new Date(article.published_date), 'MMM d')}</span>
                      </div>
                      <h3 className="text-base font-bold text-text-primary dark:text-white mb-2 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-text-secondary dark:text-gray-400 text-xs line-clamp-2 mb-2 leading-relaxed">
                          {article.summary}
                      </p>
                      <div className="flex items-center gap-1 text-xs font-medium text-primary mt-auto">
                          {t('readAnalysis')} <ExternalLink size={12} />
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            ) : (
              <div className="glass-panel p-8 text-center rounded-xl border-dashed border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-text-secondary dark:text-gray-400 text-sm">{t('noNews')}</p>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Market Summary + Drivers */}
        <div className="space-y-6">
          
          {/* Market Summary (Compact) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-5 rounded-xl flex flex-col dark:bg-gray-800 dark:border-gray-700"
          >
            <h3 className="text-text-secondary dark:text-gray-400 text-sm font-mono uppercase mb-4 flex items-center gap-2">
              <Activity size={14} /> {t('marketSummary')}
            </h3>
            
            <div className="space-y-4 flex-1">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
                  <div className="flex justify-between items-center mb-2">
                      <span className="text-text-muted dark:text-gray-400 text-sm">{t('7DayTrend')}</span>
                      <span className={`font-mono font-bold ${crop.price_change_7d >= 0 ? 'text-secondary' : 'text-danger'}`}>
                          {crop.price_change_7d >= 0 ? '+' : ''}{crop.price_change_7d?.toFixed(2)}%
                      </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 h-1.5 rounded-full overflow-hidden">
                      <div 
                          className={`h-full ${crop.price_change_7d >= 0 ? 'bg-secondary' : 'bg-danger'}`} 
                          style={{ width: `${Math.min(Math.abs(crop.price_change_7d) * 10, 100)}%` }}
                      />
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
                      <span className="text-text-muted dark:text-gray-400 text-xs uppercase block mb-1">{t('volume')}</span>
                      <span className="font-mono font-bold text-text-primary dark:text-white">{t('high')}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
                      <span className="text-text-muted dark:text-gray-400 text-xs uppercase block mb-1">{t('volatility')}</span>
                      <span className="font-mono font-bold text-accent">{t('medium')}</span>
                  </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                  <PredictionCard prediction={adjustedPrediction} unit={displayUnit} />
              </div>
            </div>
          </motion.div>

          {/* Market Drivers */}
          <div className="space-y-4">
              <h2 className="text-xl font-bold text-text-primary dark:text-white flex items-center gap-2">
                  <Layers className="text-primary" size={20} />
                  {t('marketDrivers')}
              </h2>
              <FactorsList factors={factors} />
              
              {role === 'customer' && (
                  <div className="glass-panel p-5 rounded-xl bg-gradient-to-br from-primary/5 to-transparent border-primary/10 dark:from-primary/10 dark:border-primary/20">
                      <h3 className="font-bold text-base text-text-primary dark:text-white mb-2">{t('didYouKnow')}</h3>
                      <p className="text-xs text-text-secondary dark:text-gray-400 leading-relaxed">
                          {t('seasonalTip')}
                      </p>
                  </div>
              )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CropDetail;