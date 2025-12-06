import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const getCropImage = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes('cotton')) return 'https://cdn.britannica.com/18/156618-050-39339EA2/cotton-harvest-field-Texas.jpg';
  if (lower.includes('sugarcane')) return 'https://4.imimg.com/data4/QX/AP/MY-8729085/sugarcane-plant-1000x1000.jpg';
  if (lower.includes('soyabean') || lower.includes('soybean')) return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqnl0mDa36Zsd2B2rCkZ2ZGhvhcqV2hqU_2g&s';
  return null;
};

const CropCard = ({ crop }) => {
  const { role } = useAuth();
  const { t } = useSettings();
  const change = crop.price_change_24h || 0;
  const isPositive = change > 0;
  const isNeutral = change === 0;

  const TrendIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
  const trendColor = isNeutral ? 'text-text-muted' : isPositive ? 'text-secondary' : 'text-danger';

  const getPriceDisplay = () => {
    let price = crop.current_price || 0;
    let unit = crop.unit || 'Quintal';
    let label = 'MARKET PRICE';
    if (role === 'customer') {
      // Convert Quintal to Kg and add 20% retail markup
      price = (price / 100) * 1.20;
      unit = 'Kg';
      label = t('retail');
    } else if (role === 'merchant') {
      // Wholesale price (same as base for now)
      unit = 'Quintal';
      label = t('wholesale');
    } else {
      // Farmer price (Mandi price)
      unit = 'Quintal';
      label = t('marketPrice');
    }

    return {
      price: price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      unit: unit.toUpperCase(),
      label
    };
  };

  const { price: displayPrice, unit: displayUnit, label: displayLabel } = getPriceDisplay();

  return (
    <Link to={`/crop/${crop.id}`} className="block h-full">
      <div className="glass-panel glass-panel-hover p-5 rounded-xl h-full flex flex-col justify-between group relative overflow-hidden">
        {/* Tech decoration */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Header */}
        <div className="flex items-start justify-between mb-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={crop.image_url || getCropImage(crop.name) || `https://loremflickr.com/200/200/${crop.name},agriculture/all`}
                alt={crop.name}
                className="w-12 h-12 rounded-lg object-cover border border-gray-200 group-hover:border-primary/50 transition-colors"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${crop.name}&background=random&size=200`;
                }}
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-secondary rounded-full border-2 border-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary font-display tracking-tight group-hover:text-primary transition-colors">
                {t(crop.name.toLowerCase()) || crop.name}
              </h3>
              <p className="text-xs text-text-secondary font-mono uppercase tracking-wider">{crop.category}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded bg-gray-100 border border-gray-200 ${trendColor}`}>
            <TrendIcon size={14} />
            <span className="text-xs font-mono font-bold">{Math.abs(change).toFixed(2)}%</span>
          </div>
        </div>

        {/* Price Section */}
        <div className="space-y-1 mb-6 relative z-10">
          <div className="flex items-baseline gap-1">
            <span className="text-sm text-text-secondary font-mono">₹</span>
            <span className="text-3xl font-bold text-text-primary font-mono tracking-tight">
              {displayPrice}
            </span>
          </div>
          <p className="text-xs text-text-muted font-mono">{displayLabel} PER {displayUnit}</p>
        </div>

        {/* Footer / Action */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between relative z-10">
          <div className="flex flex-col">
            <span className="text-[10px] text-text-muted uppercase tracking-wider">7D Trend</span>
            <span className={`text-xs font-mono ${crop.price_change_7d >= 0 ? 'text-secondary' : 'text-danger'}`}>
              {crop.price_change_7d >= 0 ? '+' : ''}{crop.price_change_7d?.toFixed(2)}%
            </span>
          </div>
          
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-text-secondary group-hover:bg-primary group-hover:text-white transition-all duration-300 transform group-hover:translate-x-1">
            <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CropCard;