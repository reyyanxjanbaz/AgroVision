import React from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';

const PredictionCard = ({ prediction, unit = 'Quintal' }) => {
  if (!prediction) return null;

  return (
    <div className="glass-panel p-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Sparkles size={80} className="text-primary" />
      </div>

      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
          <Sparkles className="text-primary" size={20} />
        </div>
        <h2 className="text-lg font-bold text-text-primary font-display tracking-wide">AI FORECAST</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 relative z-10">
        <div>
          <p className="text-text-secondary text-xs font-mono uppercase mb-1">Projected Price (7 Days)</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-text-primary font-mono tracking-tight">
              ₹{prediction.nextWeek?.toFixed(2)} <span className="text-sm text-text-secondary font-normal">/{unit}</span>
            </p>
            <span className="text-xs font-mono text-secondary bg-secondary/10 px-1.5 py-0.5 rounded border border-secondary/20">
              +2.4%
            </span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-2">
            <p className="text-text-secondary text-xs font-mono uppercase">Confidence Score</p>
            <span className="text-xl font-bold text-primary font-mono">{prediction.confidence}%</span>
          </div>
          <div className="h-2 bg-gray-100 border border-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary relative"
              style={{ width: `${prediction.confidence}%` }}
            >
              <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/50 shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2 items-start">
        <AlertCircle size={14} className="text-text-muted mt-0.5 flex-shrink-0" />
        <p className="text-[10px] text-text-muted leading-relaxed font-mono">
          AI model v2.4. Predictions based on historical volatility and market sentiment analysis.
        </p>
      </div>
    </div>
  );
};

export default PredictionCard;