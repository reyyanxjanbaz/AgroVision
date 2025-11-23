import React from 'react';
import { Sparkles } from 'lucide-react';

const PredictionCard = ({ prediction }) => {
  if (!prediction) return null;

  return (
    <div className="glass-card p-8 mb-8 bg-gradient-to-br from-primary/5 to-emerald-500/5 border-2 border-primary/20">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="text-primary" size={28} />
        <h2 className="text-2xl font-bold text-gray-900">AI-Powered Price Prediction</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <p className="text-gray-600 mb-2">Next Week Prediction</p>
          <p className="text-4xl font-bold text-primary">₹{prediction.nextWeek?.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-600 mb-2">Confidence Level</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${prediction.confidence}%` }}
              ></div>
            </div>
            <span className="text-2xl font-bold text-primary">{prediction.confidence}%</span>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-4">
        * Predictions are based on historical data, market trends, and AI algorithms. Not financial advice.
      </p>
    </div>
  );
};

export default PredictionCard;