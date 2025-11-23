import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import CropCard from '../components/CropCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchCrops } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, 
  Users, 
  Database, 
  Activity, 
  ArrowUpRight, 
  CloudRain, 
  ShoppingCart, 
  Truck, 
  ShoppingBag, 
  Star, 
  MapPin 
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, trend, color }) => (
  <motion.div 
    whileHover={{ y: -2 }}
    className="glass-panel p-5 rounded-xl relative overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity text-${color}-500`}>
      <Icon size={64} />
    </div>
    <div className="flex items-start justify-between mb-4">
      <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-500`}>
        <Icon size={20} />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-xs font-medium text-secondary bg-secondary/10 px-2 py-1 rounded">
          <ArrowUpRight size={12} />
          {trend}
        </div>
      )}
    </div>
    <div>
      <h3 className="text-2xl font-bold text-text-primary font-mono mb-1">{value}</h3>
      <p className="text-xs text-text-secondary uppercase tracking-wider">{label}</p>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { role } = useAuth();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');

  const roleConfig = {
    farmer: {
      title: "Farm Management",
      subtitle: "Monitor market prices and optimize your harvest.",
      stats: [
        { icon: Database, label: "Active Crops", value: crops.length || "0", trend: "+12%", color: "primary" },
        { icon: TrendingUp, label: "Market Trends", value: "Bullish", trend: "High", color: "secondary" },
        { icon: CloudRain, label: "Weather", value: "24°C", trend: "Clear", color: "accent" }
      ]
    },
    merchant: {
      title: "Trading Desk",
      subtitle: "Track bulk prices and manage your supply chain.",
      stats: [
        { icon: ShoppingCart, label: "Active Orders", value: "8", trend: "+3", color: "primary" },
        { icon: TrendingUp, label: "Market Volatility", value: "Medium", trend: "-2%", color: "secondary" },
        { icon: Truck, label: "Logistics", value: "On Time", trend: "98%", color: "accent" }
      ]
    },
    customer: {
      title: "Fresh Market",
      subtitle: "Discover seasonal produce and best local prices.",
      stats: [
        { icon: ShoppingBag, label: "Cart", value: "3 Items", trend: "₹450", color: "primary" },
        { icon: Star, label: "Seasonal Picks", value: "Mango", trend: "New", color: "secondary" },
        { icon: MapPin, label: "Nearest Store", value: "2.4km", trend: "Open", color: "accent" }
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

  if (loading) return <LoadingSpinner message="Initializing System..." />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-4">
          <Activity className="text-danger" size={32} />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">System Error</h2>
        <p className="text-text-secondary mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8">
        <div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-2"
          >
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="text-xs font-mono text-secondary uppercase tracking-widest">System Online • {role.toUpperCase()} VIEW</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-text-primary mb-2"
          >
            {currentConfig.title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-text-secondary max-w-xl"
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
            <div className="text-xs text-text-secondary font-mono">LAST UPDATE</div>
            <div className="text-sm font-medium text-text-primary font-mono">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {currentConfig.stats.map((stat, index) => (
          <StatCard 
            key={index}
            icon={stat.icon} 
            label={stat.label} 
            value={stat.value} 
            trend={stat.trend}
            color={stat.color}
          />
        ))}
      </div>

      {/* Main Content */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Activity size={20} className="text-primary" />
            {role === 'customer' ? 'Fresh Arrivals' : 'Live Market Data'}
          </h2>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-text-secondary hover:text-text-primary transition-colors">
              Filter
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-text-secondary hover:text-text-primary transition-colors">
              Export
            </button>
          </div>
        </div>

        {crops.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-xl border-dashed border-2 border-gray-200">
            <p className="text-text-secondary">No market data available matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crops.map((crop, index) => (
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
