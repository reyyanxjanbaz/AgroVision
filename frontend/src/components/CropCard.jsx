import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { getCropImage } from '../utils/cropImages';

const CropCard = ({ crop, featured }) => {
  const { role } = useAuth();
  const { t } = useSettings();
  const change = crop.price_change_24h || 0;
  const isPositive = change > 0;
  const isNeutral = change === 0;

  const getPriceDisplay = () => {
    let price = crop.current_price || 0;
    let unit = crop.unit || 'Quintal';
    let label = 'MARKET PRICE';
    if (role === 'customer') {
      price = (price / 100) * 1.20;
      unit = 'Kg';
      label = t('retail');
    } else if (role === 'merchant') {
      unit = 'Quintal';
      label = t('wholesale');
    } else {
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
  
  // Trend Styles
  const trendConfig = isPositive 
    ? { icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400', arrow: <ArrowUpRight size={14} /> }
    : isNeutral 
    ? { icon: Minus, color: 'text-gray-600 bg-gray-50 dark:bg-gray-700/50 dark:text-gray-400', arrow: <Minus size={14} /> }
    : { icon: TrendingDown, color: 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400', arrow: <ArrowDownRight size={14} /> };

  const TrendIcon = trendConfig.icon;

  return (
    <Link to={`/crop/${crop.id}`} className="block group relative w-full h-full">
      <div className={`
        relative h-full flex flex-col justify-between
        bg-white dark:bg-gray-800 rounded-3xl overflow-hidden
        border border-gray-100 dark:border-gray-700
        transition-all duration-300 ease-out origin-center
        hover:shadow-xl hover:border-primary/30 dark:hover:border-primary/30 hover:-translate-y-1
        ${featured ? 'ring-2 ring-primary/20 shadow-lg' : 'shadow-sm'}
      `}>
         
         {/* Hover Overlay */}
         <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

         <div className="p-5 flex flex-col h-full">
            {/* --- Top Row: Identity & Live Trend --- */}
            <div className="flex items-start justify-between mb-4">
               <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={crop.image_url || getCropImage(crop.name)}
                      alt={crop.name}
                      className="w-12 h-12 rounded-2xl object-cover shadow-sm bg-gray-50 dark:bg-gray-700 group-hover:scale-105 transition-transform duration-500"
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
                    {/* Live Indicator */}
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white dark:bg-gray-800 border-2 border-white dark:border-gray-800">
                             <span className="absolute inset-0.5 rounded-full bg-emerald-500"></span>
                        </span>
                    </span>
                  </div>

                  <div className="min-w-0">
                     <h3 className="font-bold text-gray-900 dark:text-white truncate pr-2 group-hover:text-primary transition-colors text-lg tracking-tight">
                        {t(crop.name.toLowerCase()) || crop.name}
                     </h3>
                     <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50">
                        {crop.category}
                     </span>
                  </div>
               </div>

               {/* Trend Badge */}
               <div className={`shrink-0 px-2 py-1 rounded-full flex items-center gap-1 ${trendConfig.color}`}>
                  <TrendIcon size={14} strokeWidth={2.5} />
                  <span className="text-xs font-bold font-mono">{Math.abs(change).toFixed(1)}%</span>
               </div>
            </div>

            {/* --- Middle Row: Price --- */}
            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                 <span className="text-lg text-gray-400 font-sans font-medium">₹</span>
                 <span className="text-3xl font-bold text-gray-900 dark:text-white font-mono tracking-tighter">
                   {displayPrice}
                 </span>
                 <span className="text-xs text-gray-500 font-medium ml-1">/ {displayUnit.toLowerCase()}</span>
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                 {displayLabel}
              </p>
            </div>

            {/* --- Bottom Row: Stats & Action --- */}
            <div className="mt-auto pt-4 border-t border-dashed border-gray-100 dark:border-gray-700 flex items-center justify-between">
               
               {/* 7D Performance */}
               <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">7D Performance</span>
                  <div className={`flex items-center gap-1 text-xs font-bold ${crop.price_change_7d >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                     {crop.price_change_7d >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                     {Math.abs(crop.price_change_7d || 0).toFixed(1)}%
                  </div>
               </div>

               {/* Action Button */}
               <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-400 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-all duration-300 transform group-hover:translate-x-1 shadow-sm">
                  <ArrowRight size={16} />
               </div>
            </div>
         </div>
      </div>
    </Link>
  );
};

export default CropCard;