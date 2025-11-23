import React from 'react';
import { Cloud, Users, TrendingUp, FileText, DollarSign } from 'lucide-react';

const FactorCard = ({ factor }) => {
  const getFactorIcon = (type) => {
    switch(type) {
      case 'weather': return <Cloud size={24} className="text-blue-500" />;
      case 'demand': return <Users size={24} className="text-purple-500" />;
      case 'supply': return <TrendingUp size={24} className="text-green-500" />;
      case 'policy': return <FileText size={24} className="text-orange-500" />;
      default: return <DollarSign size={24} className="text-gray-500" />;
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-gray-100 rounded-xl">
          {getFactorIcon(factor.factor_type)}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1 capitalize">{factor.factor_type}</h3>
          <p className="text-gray-600 text-sm mb-2">{factor.description}</p>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            factor.impact_score > 0 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            Impact: {factor.impact_score > 0 ? '+' : ''}{factor.impact_score}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default FactorCard;