import React from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const PredictionCard = ({ prediction, unit = 'Quintal' }) => {
  const { t } = useSettings();
  if (!prediction) return null;

  return (
    <div className="glass-panel p-6 relative overflow-hidden group dark:bg-gray-800 border border-green-500">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Sparkles size={80} className="text-primary" />
      </div>

      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div className="p-2 rounded-lg bg-primary/90 border border-primary dark:bg-primary dark:border-primary">
          <Sparkles className="text-white" size={20} />
        </div>
        <h2 className="text-lg font-bold text-text-primary dark:text-white font-display tracking-wide">{t('aiForecast')}</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 relative z-10">
        <div>
          <p className="text-text-secondary dark:text-gray-400 text-xs font-mono uppercase mb-1">{t('projectedPrice')}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-text-primary dark:text-white font-mono tracking-tight">
              ₹{prediction.next3Days?.toFixed(2)} <span className="text-sm text-text-secondary dark:text-gray-400 font-normal">/{unit}</span>
            </p>
            <span className="text-xs font-mono text-white bg-secondary/90 px-1.5 py-0.5 rounded border border-secondary dark:bg-secondary dark:border-secondary">
              +2.4%
            </span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-2">
            <p className="text-text-secondary dark:text-gray-400 text-xs font-mono uppercase">{t('confidenceScore')}</p>
            <span className="text-xl font-bold text-primary font-mono">{prediction.confidence}%</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary relative"
              style={{ width: `${prediction.confidence}%` }}
            >
              <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/50 shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2 items-start">
        <AlertCircle size={14} className="text-text-muted dark:text-gray-500 mt-0.5 flex-shrink-0" />
        <p className="text-[10px] text-text-muted leading-relaxed font-mono">
          AI model v2.4. Predictions based on historical volatility and market sentiment analysis.
        </p>
      </div>
    </div>
  );
};

export default PredictionCard;