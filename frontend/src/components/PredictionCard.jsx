import React from 'react';
import { Sparkles, TrendingUp, TrendingDown, AlertCircle, Cpu, Brain } from 'lucide-react';

const PredictionCard = ({ prediction }) => {
  if (!prediction) return null;

  const changePercent = prediction.change_7d ||
    (prediction.nextWeek && ((prediction.nextWeek / 100) * 2.4)); // fallback calculation
  const isPositive = changePercent >= 0;

  // Determine algorithm display name
  const algorithmName = prediction.ml_powered
    ? prediction.algorithm === 'lstm_neural_network'
      ? 'LSTM Neural Network'
      : 'Machine Learning'
    : 'Statistical Analysis';

  return (
    <div className="glass-panel p-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        {prediction.ml_powered ? <Brain size={80} className="text-primary" /> : <Sparkles size={80} className="text-primary" />}
      </div>

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            {prediction.ml_powered ? <Brain className="text-primary" size={20} /> : <Sparkles className="text-primary" size={20} />}
          </div>
          <h2 className="text-lg font-bold text-text-primary font-display tracking-wide">AI FORECAST</h2>
        </div>
        {prediction.ml_powered && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 border border-primary/30">
            <Cpu size={12} className="text-primary" />
            <span className="text-[9px] font-mono font-bold text-primary uppercase">ML Powered</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 relative z-10">
        <div>
          <p className="text-text-secondary text-xs font-mono uppercase mb-1">Projected Price (7 Days)</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-text-primary font-mono tracking-tight">
              ₹{prediction.nextWeek?.toFixed(2)}
            </p>
            {changePercent !== undefined && changePercent !== null && (
              <span className={`text-xs font-mono flex items-center gap-1 px-1.5 py-0.5 rounded border ${
                isPositive
                  ? 'text-secondary bg-secondary/10 border-secondary/20'
                  : 'text-red-600 bg-red-50 border-red-200'
              }`}>
                {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
              </span>
            )}
          </div>
        </div>

        {prediction.nextMonth && (
          <div>
            <p className="text-text-secondary text-xs font-mono uppercase mb-1">Projected Price (30 Days)</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-text-primary font-mono tracking-tight">
                ₹{prediction.nextMonth?.toFixed(2)}
              </p>
              {prediction.change_30d !== undefined && prediction.change_30d !== null && (
                <span className={`text-xs font-mono flex items-center gap-1 px-1.5 py-0.5 rounded border ${
                  prediction.change_30d >= 0
                    ? 'text-secondary bg-secondary/10 border-secondary/20'
                    : 'text-red-600 bg-red-50 border-red-200'
                }`}>
                  {prediction.change_30d >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {prediction.change_30d >= 0 ? '+' : ''}{prediction.change_30d.toFixed(2)}%
                </span>
              )}
            </div>
          </div>
        )}

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
          {prediction.ml_powered
            ? `${algorithmName} prediction. Trained on historical data with deep learning for accurate forecasting.`
            : 'Statistical model. For ML-powered predictions, ensure ML service is running.'
          }
        </p>
      </div>
    </div>
  );
};

export default PredictionCard;