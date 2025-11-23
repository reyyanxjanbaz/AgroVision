import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';

const CropCard = ({ crop }) => {
  const change = crop.price_change_24h || 0;
  const isPositive = change > 0;
  const isNeutral = change === 0;

  const TrendIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
  const trendColor = isNeutral ? 'text-text-muted' : isPositive ? 'text-secondary' : 'text-danger';

  return (
    <Link to={`/crop/${crop.id}`} className="block h-full">
      <div className="glass-panel glass-panel-hover p-5 rounded-xl h-full flex flex-col justify-between group relative overflow-hidden">
        {/* Tech decoration */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Header */}
        <div className="flex items-start justify-between mb-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              {crop.image_url ? (
                <img
                  src={crop.image_url}
                  alt={crop.name}
                  className="w-12 h-12 rounded-lg object-cover border border-primary/10 group-hover:border-primary/50 transition-colors"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-surfaceHighlight border border-primary/10 flex items-center justify-center text-xl group-hover:border-primary/50 transition-colors">
                  🌾
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-secondary rounded-full border-2 border-surface" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary font-display tracking-tight group-hover:text-primary transition-colors">
                {crop.name}
              </h3>
              <p className="text-xs text-text-secondary font-mono uppercase tracking-wider">{crop.category}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded bg-surfaceHighlight border border-primary/5 ${trendColor}`}>
            <TrendIcon size={14} />
            <span className="text-xs font-mono font-bold">{Math.abs(change).toFixed(2)}%</span>
          </div>
        </div>

        {/* Price Section */}
        <div className="space-y-1 mb-6 relative z-10">
          <div className="flex items-baseline gap-1">
            <span className="text-sm text-text-secondary font-mono">₹</span>
            <span className="text-3xl font-bold text-text-primary font-mono tracking-tight">
              {crop.current_price?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </span>
          </div>
          <p className="text-xs text-text-muted font-mono">PER {crop.unit?.toUpperCase() || 'QUINTAL'}</p>
        </div>

        {/* Footer / Action */}
        <div className="pt-4 border-t border-primary/5 flex items-center justify-between relative z-10">
          <div className="flex flex-col">
            <span className="text-[10px] text-text-muted uppercase tracking-wider">7D Trend</span>
            <span className={`text-xs font-mono ${crop.price_change_7d >= 0 ? 'text-secondary' : 'text-danger'}`}>
              {crop.price_change_7d >= 0 ? '+' : ''}{crop.price_change_7d?.toFixed(2)}%
            </span>
          </div>
          
          <div className="w-8 h-8 rounded-full bg-surfaceHighlight flex items-center justify-center text-text-secondary group-hover:bg-primary group-hover:text-white transition-all duration-300 transform group-hover:translate-x-1">
            <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CropCard;