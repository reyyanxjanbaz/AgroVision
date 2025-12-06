import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CropCard from '../components/CropCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchCrops, fetchWeather } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { format } from 'date-fns';
import { 
  TrendingUp, 
  Database, 
  Activity, 
  ArrowUpRight, 
  CloudRain, 
  ShoppingCart, 
  Truck, 
  ShoppingBag, 
  Star, 
  MapPin,
  Filter,
  Download,
  Check,
  ChevronDown
} from 'lucide-react';

// Creative Stat Card with Sparkline and Modern Design
const CreativeStatCard = ({ icon: Icon, label, value, trend, color, subtext, onClick, isActive }) => {
  // Generate a random sparkline path for visual effect
  const sparklinePath = useMemo(() => {
    let path = "M 0 30";
    for (let i = 1; i <= 10; i++) {
      path += ` L ${i * 10} ${20 + Math.random() * 20}`;
    }
    return path;
  }, []);

  const colorClasses = {
    primary: "from-green-500/20 to-emerald-500/5 border-green-500/20 text-green-600 dark:from-green-500/10 dark:to-emerald-500/5 dark:border-green-500/10 dark:text-green-400",
    secondary: "from-amber-500/20 to-orange-500/5 border-amber-500/20 text-amber-600 dark:from-amber-500/10 dark:to-orange-500/5 dark:border-amber-500/10 dark:text-amber-400",
    accent: "from-blue-500/20 to-indigo-500/5 border-blue-500/20 text-blue-600 dark:from-blue-500/10 dark:to-indigo-500/5 dark:border-blue-500/10 dark:text-blue-400",
  };

  const iconBgClasses = {
    primary: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    secondary: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    accent: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  };

  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl border p-5 cursor-pointer transition-all duration-300
        bg-gradient-to-br ${colorClasses[color]}
        ${isActive ? 'ring-2 ring-offset-2 ring-primary shadow-lg dark:ring-offset-gray-900' : 'hover:shadow-md'}
      `}
    >
      {/* Background Decoration */}
      <div className="absolute -right-6 -top-6 opacity-10 rotate-12 dark:opacity-5">
        <Icon size={120} />
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2.5 rounded-xl ${iconBgClasses[color]} shadow-sm`}>
            <Icon size={22} />
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-xs font-bold bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
              <ArrowUpRight size={14} className={color === 'primary' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'} />
              {trend}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-3xl font-bold text-gray-800 dark:text-white font-mono tracking-tight mb-1">{value}</h3>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium truncate">{subtext}</p>
        </div>

        {/* Sparkline Decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-12 opacity-30 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 100 50" preserveAspectRatio="none">
            <path d={sparklinePath} fill="none" stroke="currentColor" strokeWidth="2" className={color === 'primary' ? 'text-green-500' : color === 'secondary' ? 'text-amber-500' : 'text-blue-500'} />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const { role } = useAuth();
  const { t } = useSettings();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  
  // Filter & Export State
  const [filterCategory, setFilterCategory] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [weather, setWeather] = useState(null);

  const roleConfig = {
    farmer: {
      title: t('farmManagement'),
      subtitle: t('monitorPrices'),
      stats: [
        { icon: Database, label: t('activeCrops'), value: crops.length || "0", trend: "+12%", color: "primary", subtext: t('totalCrops') },
        { icon: TrendingUp, label: t('marketTrends'), value: t('bullish'), trend: t('high'), color: "secondary", subtext: t('marketSentiment') },
        { icon: CloudRain, label: t('weather'), value: weather ? `${weather.temperature}°C` : t('loading'), trend: weather?.condition || "...", color: "accent", subtext: weather?.impact?.description || t('fetchingWeather') }
      ]
    },
    merchant: {
      title: t('tradingDesk'),
      subtitle: t('trackPrices'),
      stats: [
        { icon: ShoppingCart, label: t('activeOrders'), value: "8", trend: "+3", color: "primary", subtext: t('pendingShipments') },
        { icon: TrendingUp, label: t('marketVolatility'), value: t('medium'), trend: "-2%", color: "secondary", subtext: t('riskAssessment') },
        { icon: Truck, label: t('logistics'), value: t('onTime'), trend: "98%", color: "accent", subtext: t('deliveryPerformance') }
      ]
    },
    customer: {
      title: t('freshMarket'),
      subtitle: t('discoverProduce'),
      stats: [
        { icon: ShoppingBag, label: t('cart'), value: "3 Items", trend: "₹450", color: "primary", subtext: t('readyCheckout') },
        { icon: Star, label: t('seasonalPicks'), value: "Mango", trend: "New", color: "secondary", subtext: t('bestPrice') },
        { icon: MapPin, label: t('nearestStore'), value: "2.4km", trend: "Open", color: "accent", subtext: "AgroVision Mart, Sector 4" }
      ]
    }
  };

  const currentConfig = roleConfig[role] || roleConfig.farmer;

  useEffect(() => {
    const loadCrops = async () => {
      try {
        setLoading(true);
        const data = await fetchCrops(query);
        setCrops(data);
      } catch (err) {
        console.error('Error fetching crops:', err);
        setError('Failed to load crops. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadCrops();
  }, [query]);

  useEffect(() => {
    const loadWeather = async () => {
      try {
        const weatherData = await fetchWeather('default');
        setWeather(weatherData);
      } catch (err) {
        console.error('Error fetching weather:', err);
        // Use fallback if available, otherwise set default error state
        const fallback = err.response?.data?.fallback || {
          temperature: '--',
          condition: 'Unavailable',
          impact: { description: 'Weather service unavailable' }
        };
        setWeather(fallback);
      }
    };

    loadWeather();
  }, []);

  // Filter Logic
  const categories = ['All', ...new Set(crops.map(c => c.category))];
  const filteredCrops = filterCategory === 'All' 
    ? crops 
    : crops.filter(c => c.category === filterCategory);

  // Export Logic
  const handleExport = () => {
    setIsExporting(true);
    const headers = ['ID', 'Name', 'Category', 'Price', 'Unit', 'Change (24h)'];
    const rows = filteredCrops.map(c => [
      c.id,
      c.name,
      c.category,
      c.current_price,
      c.unit,
      c.price_change_24h
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `agrovision_market_data_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => setIsExporting(false), 1000);
  };

  if (loading) return <LoadingSpinner message={t('initializing')} />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-4">
          <Activity className="text-danger" size={32} />
        </div>
        <h2 className="text-xl font-bold text-text-primary dark:text-white mb-2">{t('systemError')}</h2>
        <p className="text-text-secondary dark:text-gray-400 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          {t('retryConnection')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 dark:border-gray-700 pb-8">
        <div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-2"
          >
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="text-xs font-mono text-secondary uppercase tracking-widest">{t('systemOnline')} • {role.toUpperCase()} {t('view')}</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-text-primary dark:text-white mb-2"
          >
            {currentConfig.title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-text-secondary dark:text-gray-400 max-w-xl"
          >
            {currentConfig.subtitle}
          </motion.p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3"
        >
          <div className="text-right">
            <div className="text-xs text-text-secondary dark:text-gray-400 font-mono">{t('lastUpdate')}</div>
            <div className="text-sm font-medium text-text-primary dark:text-white font-mono">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Grid - Redesigned */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {currentConfig.stats.map((stat, index) => (
          <CreativeStatCard 
            key={index}
            icon={stat.icon} 
            label={stat.label} 
            value={stat.value} 
            trend={stat.trend}
            color={stat.color}
            subtext={stat.subtext}
          />
        ))}
      </div>

      {/* Main Content */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-text-primary dark:text-white flex items-center gap-2">
            <Activity size={20} className="text-primary" />
            {role === 'customer' ? t('freshArrivals') : t('liveMarketData')}
            <span className="text-xs font-normal text-text-secondary dark:text-gray-400 ml-2 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
              {filteredCrops.length} {t('items')}
            </span>
          </h2>
          
          <div className="flex gap-2 relative">
            {/* Filter Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all ${
                  filterCategory !== 'All' 
                    ? 'bg-primary/10 border-primary text-primary dark:bg-primary/20 dark:text-primary-400' 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-white'
                }`}
              >
                <Filter size={14} />
                {filterCategory === 'All' ? t('filter') : filterCategory}
                <ChevronDown size={12} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden"
                  >
                    <div className="p-1">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => {
                            setFilterCategory(cat);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between ${
                            filterCategory === cat 
                              ? 'bg-primary/5 text-primary dark:bg-primary/20 dark:text-primary-400' 
                              : 'text-text-secondary dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {cat}
                          {filterCategory === cat && <Check size={12} />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Export Button */}
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:border-primary dark:hover:border-primary transition-all flex items-center gap-2"
            >
              {isExporting ? (
                <Check size={14} className="text-green-600 dark:text-green-400" />
              ) : (
                <Download size={14} />
              )}
              {t('export')}
            </button>
          </div>
        </div>

        {filteredCrops.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-xl border-dashed border-2 border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <Filter size={20} className="text-gray-400" />
            </div>
            <p className="text-text-primary dark:text-white font-medium">{t('noCropsFound')}</p>
            <p className="text-text-secondary dark:text-gray-400 text-sm mb-4">{t('adjustFilters')}</p>
            <button 
              onClick={() => setFilterCategory('All')}
              className="text-primary text-xs font-bold hover:underline"
            >
              {t('clearFilters')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCrops.map((crop, index) => (
              <motion.div
                key={crop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CropCard crop={crop} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
