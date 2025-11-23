import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CropCard from '../components/CropCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchCrops } from '../services/api';
import { TrendingUp, Users, Database } from 'lucide-react';

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

  if (loading) return <LoadingSpinner message="Loading crops..." />;

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-red-500 text-xl mb-4">⚠️ {error}</div>
        <button onClick={() => window.location.reload()} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-primary via-emerald-600 to-blue-600 bg-clip-text text-transparent">
            Agricultural Intelligence
          </span>
          <br />
          <span className="text-gray-800">for Smarter Trading</span>
        </h1>
        <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Real-time crop prices powered by AI predictions and market insights. 
          Make informed decisions with data-driven analytics.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Database className="text-primary" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{crops.length}+</p>
            <p className="text-gray-600 text-sm">Crops Tracked</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
            <TrendingUp className="text-emerald-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">98%</p>
            <p className="text-gray-600 text-sm">Prediction Accuracy</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <Users className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">50K+</p>
            <p className="text-gray-600 text-sm">Active Users</p>
          </div>
        </div>
      </div>

      {/* Crops Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Market Overview</h2>
        {crops.length === 0 ? (
          <div className="text-center py-20 glass-card">
            <p className="text-gray-600 text-lg">No crops available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crops.map((crop, index) => (
              <div 
                key={crop.id} 
                style={{ animationDelay: `${index * 0.1}s` }}
                className="animate-slide-up"
              >
                <CropCard crop={crop} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;