import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const getCropImage = (name) => {
  if (!name) return null;
  const lower = name.toLowerCase();
  if (lower.includes('cotton')) return 'https://cdn.pixabay.com/photo/2014/03/26/17/55/cotton-298925_1280.jpg';
  if (lower.includes('sugarcane')) return 'https://cdn.pixabay.com/photo/2016/10/25/12/26/sugar-cane-1768652_1280.jpg';
  if (lower.includes('soyabean') || lower.includes('soybean')) return 'https://cdn.pixabay.com/photo/2016/09/19/20/09/soy-1681284_1280.jpg';
  if (lower.includes('onion')) return 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&q=80&w=400';
  if (lower.includes('mustard')) return 'https://cdn.pixabay.com/photo/2014/05/27/18/05/rape-355608_1280.jpg';
  if (lower.includes('chickpea') || lower.includes('chana')) return 'https://cdn.pixabay.com/photo/2015/10/02/13/46/chickpeas-968393_1280.jpg';
  if (lower.includes('groundnut') || lower.includes('peanut')) return 'https://cdn.pixabay.com/photo/2016/08/25/11/49/peanuts-1619478_1280.jpg';
  if (lower.includes('barley')) return 'https://cdn.pixabay.com/photo/2015/07/03/17/37/barley-830606_1280.jpg';
  if (lower.includes('coffee')) return 'https://cdn.pixabay.com/photo/2016/03/30/21/59/coffee-beans-1291656_1280.jpg';
  return null;
};

const CropCard = ({ crop, featured }) => {
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
      <div className={`glass-panel glass-panel-hover p-6 rounded-3xl h-full flex flex-col justify-between group relative overflow-hidden border border-green-500 ${featured ? 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900' : ''}`}>
        {/* Tech decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full" />
        
        {/* Header */}
        <div className="flex items-start justify-between mb-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={crop.image_url || getCropImage(crop.name) || `https://loremflickr.com/200/200/${crop.name},agriculture/all`}
                alt={crop.name}
                className={`${featured ? 'w-16 h-16' : 'w-12 h-12'} rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform duration-500`}
                onError={(e) => {
                  e.target.onerror = null;
                  const fallback = getCropImage(crop.name);
                  if (fallback && e.target.src !== fallback) {
                    e.target.src = fallback;
                  } else {
                    e.target.src = `https://ui-avatars.com/api/?name=${crop.name}&background=random&size=200`;
                  }
                }}
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-secondary rounded-full border-2 border-white dark:border-gray-800" />
            </div>
            <div>
              <h3 className={`${featured ? 'text-2xl' : 'text-lg'} font-bold text-text-primary dark:text-white font-display tracking-tight group-hover:text-primary transition-colors`}>
                {t(crop.name.toLowerCase()) || crop.name}
              </h3>
              <p className="text-xs text-text-secondary dark:text-gray-400 font-mono uppercase tracking-wider">{crop.category}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 ${trendColor}`}>
            <TrendIcon size={14} />
            <span className="text-xs font-mono font-bold">{Math.abs(change).toFixed(2)}%</span>
          </div>
        </div>

        {/* Price Section */}
        <div className="space-y-1 mb-6 relative z-10">
          <div className="flex items-baseline gap-1">
            <span className="text-sm text-text-secondary dark:text-gray-400 font-mono">₹</span>
            <span className={`${featured ? 'text-5xl' : 'text-3xl'} font-bold text-text-primary dark:text-white font-mono tracking-tighter`}>
              {displayPrice}
            </span>
          </div>
          <p className="text-[10px] text-text-muted uppercase tracking-widest font-mono">{displayLabel} PER {displayUnit}</p>
        </div>

        {/* Footer / Action */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between relative z-10">
          <div className="flex flex-col">
            <span className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">7D Trend</span>
            <span className={`text-xs font-mono font-medium ${crop.price_change_7d >= 0 ? 'text-secondary' : 'text-danger'}`}>
              {crop.price_change_7d >= 0 ? '+' : ''}{crop.price_change_7d?.toFixed(2)}%
            </span>
          </div>
          
          <div className={`rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-text-secondary dark:text-gray-400 group-hover:bg-primary group-hover:text-white transition-all duration-500 transform group-hover:translate-x-1 ${featured ? 'w-12 h-12' : 'w-10 h-10'}`}>
            <ArrowRight size={featured ? 20 : 16} />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CropCard;