import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const CropCard = ({ crop }) => {
  const change = crop.price_change_24h || 0;
  const isPositive = change > 0;
  const isNeutral = change === 0;

  const TrendIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
  const trendColor = isNeutral ? 'text-gray-400' : isPositive ? 'text-green-500' : 'text-red-500';

  return (
    <Link to={`/crop/${crop.id}`} className="block">
      <div className="glass-card p-6 cursor-pointer group animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {crop.image_url ? (
              <img
                src={crop.image_url}
                alt={crop.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white text-2xl">
                🌾
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                {crop.name}
              </h3>
              <p className="text-gray-500 text-sm">{crop.category}</p>
            </div>
          </div>
          <TrendIcon className={`${trendColor} flex-shrink-0`} size={28} />
        </div>

        {/* Price */}
        <div className="flex items-end justify-between">
          <div>
          <span className="text-3xl font-bold text-gray-900">
              ₹{crop.current_price?.toFixed(2) || '0.00'}
            </span>
            <p className="text-xs text-gray-500 mt-1">{crop.unit || 'per quintal'}</p>
          </div>
          <div className="text-right">
            <span className={`text-lg font-semibold ${isNeutral ? 'text-gray-400' : isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{change.toFixed(2)}%
            </span>
            <p className="text-xs text-gray-500">24h change</p>
          </div>
        </div>

        {/* Mini Chart Preview (Optional) */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>7d: <span className={crop.price_change_7d >= 0 ? 'text-green-600' : 'text-red-600'}>
              {crop.price_change_7d >= 0 ? '+' : ''}{crop.price_change_7d?.toFixed(2)}%
            </span></span>
            <span className="text-primary font-medium group-hover:underline">View Details →</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CropCard;