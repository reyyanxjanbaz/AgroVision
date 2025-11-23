import React from 'react';
import { Cloud, Users, TrendingUp, FileText, DollarSign } from 'lucide-react';

const FactorCard = ({ factor }) => {
  const getFactorIcon = (type) => {
    switch(type) {
      case 'weather': return <Cloud size={20} className="text-primary" />;
      case 'demand': return <Users size={20} className="text-secondary" />;
      case 'supply': return <TrendingUp size={20} className="text-accent" />;
      case 'policy': return <FileText size={20} className="text-orange-400" />;
      default: return <DollarSign size={20} className="text-text-muted" />;
    }
  };

  const isPositive = factor.impact_score > 0;

  return (
    <div className="glass-panel p-4 hover:bg-gray-50 transition-colors group border border-gray-200 hover:border-primary/30">
      <div className="flex items-start gap-4">
        <div className="p-2.5 bg-white border border-gray-200 rounded-lg group-hover:border-primary/30 transition-colors">
          {getFactorIcon(factor.factor_type)}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-text-primary capitalize text-sm font-display tracking-wide">
              {factor.factor_type}
            </h3>
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
              isPositive 
                ? 'bg-secondary/10 border-secondary/20 text-secondary' 
                : 'bg-danger/10 border-danger/20 text-danger'
            }`}>
              {isPositive ? '+' : ''}{factor.impact_score}%
            </span>
          </div>
          <p className="text-text-secondary text-xs leading-relaxed">{factor.description}</p>
        </div>
      </div>
    </div>
  );
};

export default FactorCard;