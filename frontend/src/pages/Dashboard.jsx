import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CropCard from '../components/CropCard';
import LoadingSpinner from '../components/LoadingSpinner';
import WeatherCropWidget from '../components/WeatherCropWidget';
import MarketFactorsSection from '../components/MarketFactorsSection';
import { fetchCrops } from '../services/api';
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
  ChevronDown,
  Search,
  Plus,
  Zap,
  BarChart2,
  Calendar,
  Bell,
  FileText
} from 'lucide-react';

// --- Components ---

const StatCard = ({ icon: Icon, label, value, trend, color, subtext, onClick }) => {
  const colorStyles = {
    primary: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900",
    secondary: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900",
    accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900",
  };

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-green-500 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2.5 rounded-xl ${colorStyles[color].split(' ')[0]} ${colorStyles[color].split(' ')[1]}`}>
          <Icon size={20} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs font-bold bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
            <ArrowUpRight size={14} className="text-green-500" />
            <span className="text-gray-600 dark:text-gray-300">{trend}</span>
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1 font-mono tracking-tight">{value}</div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 truncate">{subtext}</p>
      </div>
    </motion.div>
  );
};

const QuickAction = ({ icon: Icon, label, onClick, color = "blue" }) => (
  <button 
    onClick={onClick}
    className={`
      flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-dashed transition-all w-full
      hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-solid
      border-gray-200 dark:border-gray-700 
    `}
  >
    <div className={`p-2 rounded-full bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400`}>
      <Icon size={18} />
    </div>
    <span className="text-xs font-medium text-gray-600 dark:text-gray-300 text-center">{label}</span>
  </button>
);

const SearchFilterBar = ({ 
  searchTerm, 
  setSearchTerm, 
  filterCategory, 
  setFilterCategory, 
  categories, 
  onExport, 
  isExporting,
  count 
}) => {
  const { t } = useSettings();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 py-3 mb-6 -mx-4 px-4 md:px-0 md:mx-0 md:bg-transparent md:border-none md:static md:backdrop-blur-none transition-all">
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder={t('searchCrops') || "Search for crops..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm shadow-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {/* Category Filter */}
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`
                whitespace-nowrap px-4 py-2.5 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all
                ${filterCategory !== 'All' 
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm'}
              `}
            >
              <Filter size={16} />
              {filterCategory === 'All' ? t('allCategories') : filterCategory}
              <ChevronDown size={14} className={`transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden py-1"
                  >
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 mb-1">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('filterBy')}</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => {
                            setFilterCategory(cat);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                            filterCategory === cat ? 'text-primary font-medium bg-primary/5' : 'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {cat}
                          {filterCategory === cat && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Export Button */}
          <button 
            onClick={onExport}
            disabled={isExporting}
            aria-label={t('exportCSV')}
            className="whitespace-nowrap px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:border-primary/50 transition-all flex items-center gap-2 text-sm font-medium shadow-sm active:scale-95 duration-200"
          >
            {isExporting ? <Check size={16} className="text-green-500" /> : <Download size={16} />}
            <span className="hidden sm:inline">{t('exportCSV')}</span>
          </button>
        </div>
      </div>
      
      {/* Active Filters Display */}
      {(filterCategory !== 'All' || searchTerm) && (
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
          <span className="text-gray-400 font-medium">{count} results found</span>
          {filterCategory !== 'All' && (
            <span className="group flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary px-2 py-1 rounded-md cursor-pointer hover:bg-primary/20 transition-colors" onClick={() => setFilterCategory('All')}>
              Category: <span className="font-bold">{filterCategory}</span> 
              <span className="opacity-50 group-hover:opacity-100">×</span>
            </span>
          )}
          {searchTerm && (
            <span className="group flex items-center gap-1 bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" onClick={() => setSearchTerm('')}>
              Search: <span className="font-bold">"{searchTerm}"</span> 
              <span className="opacity-50 group-hover:opacity-100">×</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const { role } = useAuth();
  const { t } = useSettings();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState(query || '');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isExporting, setIsExporting] = useState(false);

  // --- Data Loading ---
  useEffect(() => {
    const loadCrops = async () => {
      try {
        setLoading(true);
        const data = await fetchCrops(); // Fetch all, we filter locally for smoother UX
        setCrops(data);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to refresh data.');
      } finally {
        setLoading(false);
      }
    };
    loadCrops();
  }, []);

  useEffect(() => {
    if (query) setSearchTerm(query);
  }, [query]);

  const filteredCrops = useMemo(() => {
    return crops.filter(crop => {
      const matchesSearch = crop.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            crop.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || crop.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [crops, searchTerm, filterCategory]);

  const categories = useMemo(() => ['All', ...new Set(crops.map(c => c.category))], [crops]);

  // --- User Role Configuration ---
  const roleConfig = {
    farmer: {
      stats: [
        { icon: Database, label: t('myCrops'), value: crops.length || "0", trend: "+2", color: "primary", subtext: "Active listings" },
        { icon: TrendingUp, label: t('avgPrice'), value: "₹2,450", trend: "+5%", color: "secondary", subtext: "Market average / quintal" },
        { icon: CloudRain, label: t('weatherRisk'), value: "Low", trend: "Safe", color: "accent", subtext: "Next 48 hours clear" }
      ],
      quickActions: [
         { label: t('addCrop'), icon: Plus, color: 'emerald' },
         { label: t('analytics'), icon: BarChart2, color: 'blue' },
         { label: t('schedule'), icon: Calendar, color: 'violet' },
         { label: t('marketing'), icon: Zap, color: 'amber' },
      ]
    },
    merchant: {
      stats: [
        { icon: ShoppingCart, label: t('pendingOrders'), value: "12", trend: "+3", color: "primary", subtext: "Needs attention" },
        { icon: Activity, label: t('marketVol'), value: "High", trend: "+12%", color: "secondary", subtext: "Price fluctuation" },
        { icon: Truck, label: t('logistics'), value: "Running", trend: "98%", color: "accent", subtext: "On time delivery" }
      ],
      quickActions: [
        { label: t('newOrder'), icon: Plus, color: 'emerald' },
        { label: t('track'), icon: Truck, color: 'blue' },
        { label: t('reports'), icon: FileText, color: 'violet' },
        { label: t('alerts'), icon: Bell, color: 'amber' },
      ]
    },
    customer: {
        stats: [
          { icon: ShoppingBag, label: t('cart'), value: "3 Items", trend: "₹450", color: "primary", subtext: t('readyCheckout') },
          { icon: Star, label: t('seasonalPicks'), value: "Mango", trend: "New", color: "secondary", subtext: t('bestPrice') },
          { icon: MapPin, label: t('nearestStore'), value: "2.4km", trend: "Open", color: "accent", subtext: "AgroVision Mart, Sector 4" }
        ],
        quickActions: [
            { label: t('shopNow'), icon: ShoppingCart, color: 'emerald' },
            { label: t('orders'), icon: ShoppingBag, color: 'blue' },
            { label: t('offers'), icon: Star, color: 'violet' },
            { label: t('support'), icon: Bell, color: 'amber' },
        ]
      }
  };
  
  // Safe fallback for custom roles or if user role is undefined
  const currentConfig = roleConfig[role] || roleConfig.farmer;

  // --- Handlers ---
  const handleExport = () => {
    setIsExporting(true);
    const headers = ['ID', 'Name', 'Category', 'Price', 'Unit', 'Change (24h)'];
    const rows = filteredCrops.map(c => [ c.id, c.name, c.category, c.current_price, c.unit, c.price_change_24h ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agrovision_data_${format(new Date(), 'yyyyMMdd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsExporting(false), 1000);
  };

  if (loading && crops.length === 0) return <LoadingSpinner message={t('initializingDashboard')} />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
          <Activity className="text-red-500" size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('systemError') || 'System Offline'}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
          {error} <br/>
          {t('checkConnection') || 'Please check your internet connection and try again.'}
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-600 transition-colors shadow-lg shadow-primary/20"
        >
          {t('retryConnection') || 'Retry Connection'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4 md:px-6">
      
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            {t('welcomeBack')}, {role.charAt(0).toUpperCase() + role.slice(1)}
            <span className="hidden md:inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20">
              {role}
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2 font-medium">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            {t('systemOnline')} • {format(new Date(), 'EEEE, d MMMM yyyy')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* --- LEFT COLUMN (Main Content) --- */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentConfig.stats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>

          {/* Market Data Area */}
          <div className="bg-white/50 dark:bg-gray-800/20 backdrop-blur-sm rounded-3xl md:p-1 border border-green-500">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Activity size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('marketLiveFeed')}</h2>
            </div>
            
            {/* Control Bar */}
            <SearchFilterBar 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              categories={categories}
              onExport={handleExport}
              isExporting={isExporting}
              count={filteredCrops.length}
            />

            {/* Grid */}
            <AnimatePresence mode="popLayout">
                {filteredCrops.length > 0 ? (
                <motion.div 
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                >
                    {filteredCrops.map(crop => (
                    <CropCard key={crop.id} crop={crop} compact={false} />
                    ))}
                </motion.div>
                ) : (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-green-500 text-center shadow-sm"
                >
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                        <Search size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No crops found</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mt-2">
                        Try adjusting your search terms or filters to find what you're looking for.
                    </p>
                    <button 
                        onClick={() => { setSearchTerm(''); setFilterCategory('All'); }}
                        className="mt-6 text-primary font-bold hover:underline"
                    >
                        Clear all filters
                    </button>
                </motion.div>
                )}
            </AnimatePresence>
          </div>
        </div>

        {/* --- RIGHT COLUMN (Sidebar & Insights) --- */}
        <div className="col-span-12 lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          
          {/* Quick Actions Panel */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-green-500 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="text-amber-500" size={18} />
              <h3 className="font-bold text-gray-900 dark:text-white">{t('quickActions')}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {currentConfig.quickActions?.map((action, i) => (
                <QuickAction key={i} {...action} onClick={() => console.log('Action:', action.label)} />
              )) || <p className="text-sm text-gray-400">No actions available</p>}
            </div>
          </section>

          {/* Weather Widget (Existing High Quality Component) */}
          <WeatherCropWidget crops={crops} />

          {/* Market Factors (Simplified/Compact View) */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-green-500 shadow-sm">
             <MarketFactorsSection compact={true} />
          </section>

          {/* Pro Tip / Insight Card */}
          <div className="bg-gradient-to-br from-primary to-emerald-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow border border-green-500">
            <div className="absolute top-0 right-0 p-12 bg-white/10 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3 bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm border border-white/10">
                <Star size={12} fill="currentColor" />
                {t('proTip') || "PRO TIP"}
              </div>
              <h3 className="text-lg font-bold mb-2">Maximize your yield</h3>
              <p className="text-sm text-white/90 leading-relaxed mb-4">
                Monitor the "Market Outlook" section below to time your harvest sales during peak price windows.
              </p>
              <button className="text-xs font-bold bg-white text-primary px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                View Reports
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
