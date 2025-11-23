import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { subDays, subMonths, subYears, format } from 'date-fns';
import PriceChart from '../components/PriceChart';
import LoadingSpinner from '../components/LoadingSpinner';
import PredictionCard from '../components/PredictionCard';
import FactorsList from '../components/FactorsList';
import { fetchCropDetails, fetchPriceHistory, fetchPrediction, fetchFactors, fetchNews } from '../services/api';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';

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

  if (loading) return <LoadingSpinner message="Loading crop details..." />;

  if (!crop) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-600">Crop not found</p>
        <Link to="/" className="btn-primary mt-4 inline-block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const filteredData = getFilteredData();
  const isPositive = crop.price_change_24h >= 0;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
        <ArrowLeft size={20} />
        <span>Back to Dashboard</span>
      </Link>

      {/* Header */}
      <div className="glass-card p-8 mb-8">
        <div className="flex items-start justify-between flex-wrap gap-6">
          <div className="flex items-center gap-4">
            {crop.image_url ? (
              <img src={crop.image_url} alt={crop.name} className="w-20 h-20 rounded-full border-4 border-primary/20" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white text-3xl">
                🌾
              </div>
            )}
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{crop.name}</h1>
              <p className="text-gray-600 mt-1">{crop.category}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-gray-900">
                ₹{crop.current_price?.toFixed(2)}
              </span>
              <span className={`text-2xl font-semibold flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                {isPositive ? '+' : ''}{crop.price_change_24h?.toFixed(2)}%
              </span>
            </div>
            <p className="text-gray-600 mt-2">{crop.unit}</p>
            <div className="flex gap-4 mt-3 text-sm">
              <span className={`${crop.price_change_7d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                7d: {crop.price_change_7d >= 0 ? '+' : ''}{crop.price_change_7d?.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-6 mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
            <div className="flex gap-2">
              {periods.map((period) => (
                <button
                  key={period.label}
                  onClick={() => setTimePeriod(period.label)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    timePeriod === period.label
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white/50 text-gray-700 hover:bg-white'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
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

      {/* Chart */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Price History</h2>
        {filteredData.length > 0 ? (
          <PriceChart data={filteredData} showArea={true} />
        ) : (
          <div className="glass-card p-12 text-center">
            <p className="text-gray-600">No price data available for selected period</p>
          </div>
        )}
      </div>

      {/* AI Prediction */}
      <PredictionCard prediction={prediction} />

      {/* Factors */}
      <FactorsList factors={factors} />

      {/* News */}
      {news.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Latest News</h2>
          <div className="space-y-4">
            {news.slice(0, 5).map((article, index) => (
              <a
                key={index}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-6 flex gap-4 hover:shadow-xl transition-all group"
              >
                {article.image_url && (
                  <img 
                    src={article.image_url} 
                    alt={article.title}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{article.summary}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{article.source}</span>
                    <span>•</span>
                    <span>{format(new Date(article.published_date), 'PPP')}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CropDetail;