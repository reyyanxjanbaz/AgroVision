import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import CropCard from '../components/CropCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchCrops } from '../services/api';
import { TrendingUp, Users, Database, Activity, ArrowUpRight } from 'lucide-react';

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
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');

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
            <span className="text-xs font-mono text-secondary uppercase tracking-widest">System Online</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-text-primary mb-2"
          >
            Market Intelligence
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-text-secondary max-w-xl"
          >
            Real-time predictive analytics for agricultural commodities.
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
        <StatCard 
          icon={Database} 
          label="Active Crops" 
          value={crops.length} 
          trend="+12%"
          color="primary"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Market Accuracy" 
          value="98.4%" 
          trend="+2.1%"
          color="secondary"
        />
        <StatCard 
          icon={Users} 
          label="Active Traders" 
          value="52.1K" 
          trend="+5.4%"
          color="accent"
        />
      </div>

      {/* Main Content */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Activity size={20} className="text-primary" />
            Live Market Data
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
