import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { subDays, format } from 'date-fns';
import PriceChart from '../components/PriceChart';
import LoadingSpinner from '../components/LoadingSpinner';
import PredictionCard from '../components/PredictionCard';
import FactorsList from '../components/FactorsList';
import CropWeatherImpact from '../components/CropWeatherImpact';
import { fetchCropDetails, fetchPriceHistory, refreshPriceHistory, fetchPrediction, fetchFactors, fetchNews } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { getCropImage } from '../utils/cropImages';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Layers, 
  Share2, 
  MapPin, 
  Info,
  ChevronRight,
  Newspaper,
  CloudSun,
  ExternalLink
} from 'lucide-react';

const MetricCard = ({ title, value, subValue, icon: Icon, trend, trendValue, color = "primary" }) => {
  const getColorClasses = (c) => {
    // Map of color names to tailwind classes if needed, or rely on simple interpolation for basics
    const colors = {
      primary: 'text-primary bg-primary/10',
      secondary: 'text-secondary bg-secondary/10',
      'amber-500': 'text-amber-500 bg-amber-500/10',
      'blue-500': 'text-blue-500 bg-blue-500/10',
    };
    return colors[c] || colors.primary;
  };

  return (
    <div className="glass-panel p-4 rounded-xl flex items-start justify-between relative overflow-hidden dark:bg-gray-800 hover:shadow-md transition-shadow">
      <div className="relative z-10">
        <p className="text-text-secondary dark:text-gray-400 text-xs font-mono uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-text-primary dark:text-white font-mono">{value}</h3>
        {subValue && <p className="text-xs text-text-secondary dark:text-gray-500 mt-1">{subValue}</p>}
      </div>
      <div className={`p-2.5 rounded-lg ${getColorClasses(color)}`}>
        <Icon size={20} />
      </div>
      {trend && (
        <div className={`absolute bottom-4 right-4 flex items-center gap-1 text-xs font-bold ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
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

  useEffect(() => {
    loadCropData();
  }, [loadCropData]);

  const handleRefreshPriceData = useCallback(async () => {
    try {
      const freshData = await refreshPriceHistory(id, region);
      setPriceHistory(freshData);
      const newPrediction = await fetchPrediction(id);
      setPrediction(newPrediction);
    } catch (err) {
      console.error('Error refreshing price data:', err);
    }
  }, [id, region]);

  if (loading) return <LoadingSpinner message={t('accessingDatabase')} />;

  if (!crop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Activity className="text-text-muted dark:text-gray-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-text-primary dark:text-white mb-2">{t('dataNotFound')}</h2>
        <Link to="/" className="btn-primary mt-4">{t('returnDashboard')}</Link>
      </div>
    );
  }

  // Data Processing
  const getFilteredData = () => {
    const period = periods.find(p => p.label === timePeriod);
    if (!period) return priceHistory;
    const cutoffDate = subDays(new Date(), period.days);
    return priceHistory.filter(item => new Date(item.date) >= cutoffDate);
  };

  const getPriceDisplay = () => {
    let price = crop.current_price || 0;
    let unit = crop.unit || 'Quintal';
    if (role === 'customer') {
      price = (price / 100) * 1.20;
      unit = 'Kg';
    }
    return {
      price: price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      unit: unit.toUpperCase()
    };
  };

  const { price: displayPrice, unit: displayUnit } = getPriceDisplay();
  const filteredData = getFilteredData();
  const isPositive = crop.price_change_24h >= 0;

  const adjustedHistory = filteredData.map(item => ({
    ...item,
    price: role === 'customer' ? (item.price / 100) * 1.20 : item.price
  }));

  const adjustedPrediction = prediction ? {
    ...prediction,
    next3Days: role === 'customer' ? (prediction.next3Days / 100) * 1.20 : prediction.next3Days
  } : null;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      {/* 1. Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-gray-400 mb-2">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-text-primary dark:text-white font-medium">{crop.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img 
                src={crop.image_url || getCropImage(crop.name)} 
                alt={crop.name} 
                className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-md"
                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${crop.name}&background=random` }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary dark:text-white font-display leading-none">{t(crop.name.toLowerCase()) || crop.name}</h1>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wide">
                  {crop.category}
                </span>
                <span className="text-text-secondary dark:text-gray-400 text-sm flex items-center gap-1">
                  <MapPin size={12} /> {t('allRegions')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            aria-label={t('selectRegion') || "Select Region"}
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:border-primary/50 focus:outline-none shadow-sm text-text-primary dark:text-white"
          >
            <option value="all">{t('allRegions')}</option>
            <option value="north">{t('north')}</option>
            <option value="south">{t('south')}</option>
            <option value="east">{t('east')}</option>
            <option value="west">{t('west')}</option>
          </select>
          <button className="p-2 text-text-secondary dark:text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors border border-transparent hover:border-primary/10">
            <Share2 size={20} />
          </button>
        </div>
      </header>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title={t('currentPrice')}
          value={`₹${displayPrice}`}
          subValue={`Per ${displayUnit}`}
          icon={Activity}
          trend={isPositive ? 'up' : 'down'}
          trendValue={`${Math.abs(crop.price_change_24h).toFixed(2)}%`}
          color="primary"
        />
        <MetricCard 
          title={t('forecast')}
          value={`₹${adjustedPrediction?.next3Days?.toFixed(2) || '---'}`}
          subValue={t('next3Days')}
          icon={TrendingUp}
          trend="up"
          trendValue={`${prediction?.confidence || 0}% Conf.`}
          color="secondary"
        />
        <MetricCard 
          title={t('volatility')}
          value={t('medium')}
          subValue="Market Stability"
          icon={Info}
          color="amber-500"
        />
        {role === 'farmer' ? (
          <MetricCard 
            title={t('weatherImpact')}
            value={t('favorable')}
            subValue="Growing Conditions"
            icon={CloudSun}
            color="blue-500"
          />
        ) : (
          <MetricCard 
            title={t('demandSupply')}
            value={t('balanced')}
            subValue="Market Status"
            icon={Layers}
            color="blue-500"
          />
        )}
      </div>

      {/* 3. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT MAIN COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Chart Section */}
          <div className="glass-panel p-6 rounded-2xl dark:bg-gray-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-text-primary dark:text-white flex items-center gap-2">
                  <Activity size={18} className="text-primary" />
                  {t('priceAnalysis')}
                </h3>
                <p className="text-sm text-text-secondary dark:text-gray-400 mt-1">
                  Historical price movements and prediction model
                </p>
              </div>
              <div className="flex bg-gray-100 dark:bg-gray-700/50 rounded-lg p-1">
                {periods.map((period) => (
                  <button
                    key={period.label}
                    onClick={() => setTimePeriod(period.label)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                      timePeriod === period.label
                      ? 'bg-white dark:bg-gray-600 text-primary shadow-sm'
                      : 'text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-white'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-[400px]">
              {adjustedHistory.length > 0 ? (
                <PriceChart 
                  data={adjustedHistory} 
                  prediction={adjustedPrediction} 
                  unit={displayUnit} 
                  onRefresh={handleRefreshPriceData} 
                />
              ) : (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-xl">
                  <p className="text-text-secondary dark:text-gray-400 font-medium">{t('noPriceData')}</p>
                </div>
              )}
            </div>
          </div>

          {/* News Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-text-primary dark:text-white flex items-center gap-2">
                <Newspaper size={20} className="text-primary" />
                {t('latestNews')}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {news.slice(0, 4).map((article, idx) => (
                <a 
                  key={idx} 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 hover:shadow-lg transition-all"
                >
                  {article.image_url && (
                    <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img src={article.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                  )}
                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] text-text-secondary dark:text-gray-400 uppercase tracking-wider mb-1">
                        <span className="font-bold text-primary">{article.source}</span>
                        <span>•</span>
                        <span>{format(new Date(article.published_date), 'MMM d')}</span>
                      </div>
                      <h4 className="font-bold text-text-primary dark:text-white text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                        {article.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                      {t('readAnalysis')} <ExternalLink size={12} />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6">
          
          {/* AI Prediction */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-text-secondary dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Layers size={14} /> {t('marketIntelligence')}
            </h3>
            <PredictionCard prediction={adjustedPrediction} unit={displayUnit} />
          </div>

          {/* Weather Impact (Farmer) */}
          {role === 'farmer' && (
            <div className="animate-in slide-in-from-right duration-500 delay-100">
              <CropWeatherImpact cropName={crop.name} />
            </div>
          )}

          {/* Market Drivers */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-text-secondary dark:text-gray-400 uppercase tracking-wider">
                  {t('keyDrivers')}
                </h3>
             </div>
             <div className="rounded-xl p-4">
              <FactorsList factors={factors} cropName={crop.name} />
             </div>
          </div>
          {/* Tip Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/90 to-primary text-white shadow-lg shadow-primary/20">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Info size={20} className="text-white" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">{t('didYouKnow')}</h4>
                <p className="text-sm text-white/90 leading-relaxed opacity-90">
                  {role === 'farmer' 
                    ? "Early sowing of this variety can prevent pest attacks by up to 15%."
                    : "Prices typically drop 3-4 months post-harvest. Plan your bulk purchases accordingly."
                  }
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CropDetail;
