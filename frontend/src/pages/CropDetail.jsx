import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { subDays, format } from 'date-fns';
import { motion } from 'framer-motion';
import PriceChart from '../components/PriceChart';
import LoadingSpinner from '../components/LoadingSpinner';
import PredictionCard from '../components/PredictionCard';
import FactorsList from '../components/FactorsList';
import { fetchCropDetails, fetchPriceHistory, fetchPrediction, fetchFactors, fetchNews } from '../services/api';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, MapPin, ExternalLink, Activity } from 'lucide-react';

const CropDetail = () => {
  const { id } = useParams();
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

  useEffect(() => {
    const loadCropData = async () => {
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
    };

    loadCropData();
  }, [id, region]);

  const getFilteredData = () => {
    const period = periods.find(p => p.label === timePeriod);
    if (!period) return priceHistory;

    const cutoffDate = subDays(new Date(), period.days);
    return priceHistory.filter(item => new Date(item.date) >= cutoffDate);
  };

  if (loading) return <LoadingSpinner message="Accessing Crop Database..." />;

  if (!crop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Activity className="text-text-muted" size={32} />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Data Not Found</h2>
        <p className="text-text-secondary mb-6">The requested crop data could not be retrieved.</p>
        <Link to="/" className="btn-primary">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const filteredData = getFilteredData();
  const isPositive = crop.price_change_24h >= 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb */}
      <Link to="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-2 group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-mono uppercase tracking-wider">Back to Dashboard</span>
      </Link>

      {/* Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 glass-panel p-8 rounded-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity size={120} className="text-primary" />
          </div>
          
          <div className="flex items-start gap-6 relative z-10">
            <div className="relative">
              {crop.image_url ? (
                <img src={crop.image_url} alt={crop.name} className="w-24 h-24 rounded-xl border border-gray-200 object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-4xl">
                  🌾
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 bg-white px-2 py-1 rounded border border-gray-200 text-xs font-mono text-primary">
                ID: {String(crop.id).substring(0, 4).toUpperCase()}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-text-primary font-display">{crop.name}</h1>
                <span className="px-2 py-1 rounded bg-primary/10 border border-primary/20 text-primary text-xs font-mono uppercase">
                  {crop.category}
                </span>
              </div>
              
              <div className="flex items-baseline gap-4 mt-4">
                <span className="text-5xl font-bold text-text-primary font-mono tracking-tight">
                  ₹{crop.current_price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-lg border ${
                  isPositive 
                    ? 'bg-secondary/10 border-secondary/20 text-secondary' 
                    : 'bg-danger/10 border-danger/20 text-danger'
                }`}>
                  {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span className="font-mono font-bold">{Math.abs(crop.price_change_24h).toFixed(2)}%</span>
                </div>
              </div>
              <p className="text-text-secondary font-mono text-sm mt-2">PER {crop.unit?.toUpperCase()}</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats / Prediction Placeholder */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6 rounded-xl flex flex-col justify-between"
        >
          <div>
            <h3 className="text-text-secondary text-sm font-mono uppercase mb-4">Market Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-text-muted text-sm">7 Day Trend</span>
                <span className={`font-mono ${crop.price_change_7d >= 0 ? 'text-secondary' : 'text-danger'}`}>
                  {crop.price_change_7d >= 0 ? '+' : ''}{crop.price_change_7d?.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-text-muted text-sm">Volume</span>
                <span className="font-mono text-text-primary">High</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-text-muted text-sm">Volatility</span>
                <span className="font-mono text-accent">Medium</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
             <PredictionCard prediction={prediction} />
          </div>
        </motion.div>
      </div>

      {/* Controls & Chart */}
      <div className="glass-panel p-6 rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Activity className="text-primary" size={20} />
            <h2 className="text-xl font-bold text-text-primary">Price Analysis</h2>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex bg-white rounded-lg p-1 border border-gray-200">
              {periods.map((period) => (
                <button
                  key={period.label}
                  onClick={() => setTimePeriod(period.label)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    timePeriod === period.label
                      ? 'bg-primary text-white shadow-lg'
                      : 'text-text-secondary hover:text-text-primary hover:bg-gray-100'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="pl-9 pr-8 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-text-primary focus:border-primary/50 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="all">All Regions</option>
                <option value="north">North India</option>
                <option value="south">South India</option>
                <option value="east">East India</option>
                <option value="west">West India</option>
              </select>
            </div>
          </div>
        </div>

        {filteredData.length > 0 ? (
          <PriceChart data={filteredData} showArea={true} />
        ) : (
          <div className="h-[400px] flex items-center justify-center border border-dashed border-gray-200 rounded-xl">
            <p className="text-text-secondary">No price data available for selected period</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Factors */}
        <div className="lg:col-span-2">
           <FactorsList factors={factors} />
        </div>

        {/* News Feed */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Calendar className="text-primary" size={20} />
            Market News
          </h2>
          {news.length > 0 ? (
            <div className="space-y-3">
              {news.slice(0, 5).map((article, index) => (
                <a
                  key={index}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-panel p-4 rounded-lg flex gap-3 hover:bg-gray-50 transition-all group border border-gray-200 hover:border-primary/30"
                >
                  {article.image_url && (
                    <img 
                      src={article.image_url} 
                      alt={article.title}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-text-primary text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-text-secondary font-mono">
                      <span>{article.source}</span>
                      <span>•</span>
                      <span>{format(new Date(article.published_date), 'MMM d')}</span>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-text-muted group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
                </a>
              ))}
            </div>
          ) : (
            <div className="glass-panel p-6 text-center rounded-xl">
              <p className="text-text-secondary text-sm">No recent news available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropDetail;