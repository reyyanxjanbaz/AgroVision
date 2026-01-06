import React from 'react';
import { Cloud, Users, TrendingUp, FileText, DollarSign, ThumbsUp, ThumbsDown, AlertTriangle, Sparkles } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const FactorCard = ({ factor, cropName }) => {
  const { t } = useSettings();

  const getFactorIcon = (type) => {
    switch(type) {
      case 'weather': return <Cloud size={20} className="text-primary" />;
      case 'demand': return <Users size={20} className="text-secondary" />;
      case 'supply': return <TrendingUp size={20} className="text-accent" />;
      case 'policy': return <FileText size={20} className="text-orange-400" />;
      default: return <DollarSign size={20} className="text-text-muted" />;
    }
  };

  // Check if we have crop-specific impact data
  const hasCropSpecificImpact = factor.crop_specific_impact && factor.crop_specific_impact.adjusted_score !== undefined;
  const cropImpact = factor.crop_specific_impact || {};
  
  // Use crop-specific score if available, otherwise use base impact
  const displayScore = hasCropSpecificImpact ? cropImpact.adjusted_score : factor.impact_score;
  const isPositive = displayScore > 0;
  const sentiment = cropImpact.sentiment || (isPositive ? 'positive' : 'negative');

  // Get sentiment indicator
  const getSentimentIndicator = () => {
    if (sentiment === 'positive') {
      return (
        <div className="flex items-center gap-1 text-secondary">
          <ThumbsUp size={12} />
          <span className="text-[9px] font-bold uppercase">{t('beneficial')}</span>
        </div>
      );
    } else if (sentiment === 'negative') {
      return (
        <div className="flex items-center gap-1 text-danger">
          <ThumbsDown size={12} />
          <span className="text-[9px] font-bold uppercase">{t('challenging')}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-text-muted">
        <span className="text-[9px] font-bold uppercase">{t('neutral')}</span>
      </div>
    );
  };

  return (
    <div className={`glass-panel p-4 transition-colors group border dark:bg-gray-800 ${
      hasCropSpecificImpact 
        ? sentiment === 'positive' 
          ? 'border-secondary/30 hover:border-secondary/50 bg-secondary/5 dark:border-secondary/20 dark:hover:border-secondary/40' 
          : sentiment === 'negative'
            ? 'border-danger/30 hover:border-danger/50 bg-danger/5 dark:border-danger/20 dark:hover:border-danger/40'
            : 'border-gray-200 hover:border-primary/30 dark:border-gray-700 dark:hover:border-primary/30'
        : 'border-gray-200 hover:border-primary/30 dark:border-gray-700 dark:hover:border-primary/30'
    }`}>
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-lg border transition-colors ${
          sentiment === 'positive' 
            ? 'bg-secondary/10 border-secondary/20 dark:bg-secondary/20 dark:border-secondary/30' 
            : sentiment === 'negative'
              ? 'bg-danger/10 border-danger/20 dark:bg-danger/20 dark:border-danger/30'
              : 'bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-600 group-hover:border-primary/30'
        }`}>
          {getFactorIcon(factor.factor_type)}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-text-primary dark:text-white capitalize text-sm font-display tracking-wide">
                {t(factor.factor_type)}
              </h3>
              {hasCropSpecificImpact && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 dark:bg-primary/20">
                  <Sparkles size={10} className="text-primary" />
                  <span className="text-[8px] font-bold text-primary uppercase">{t('cropSpecific')}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                isPositive 
                  ? 'bg-secondary/10 border-secondary/20 text-secondary dark:bg-secondary/20 dark:border-secondary/30' 
                  : 'bg-danger/10 border-danger/20 text-danger dark:bg-danger/20 dark:border-danger/30'
              }`}>
                {isPositive ? '+' : ''}{displayScore?.toFixed?.(1) || displayScore}%
              </span>
              {hasCropSpecificImpact && getSentimentIndicator()}
            </div>
          </div>
          
          {/* Base description */}
          <p className="text-text-secondary dark:text-gray-400 text-xs leading-relaxed">{t(factor.description)}</p>
          
          {/* Crop-specific message */}
          {cropImpact.crop_message && (
            <div className={`mt-2 pt-2 border-t ${
              sentiment === 'positive' 
                ? 'border-secondary/20' 
                : sentiment === 'negative' 
                  ? 'border-danger/20' 
                  : 'border-gray-100 dark:border-gray-700'
            }`}>
              <p className={`text-xs font-medium ${
                sentiment === 'positive' 
                  ? 'text-secondary' 
                  : sentiment === 'negative' 
                    ? 'text-danger' 
                    : 'text-text-secondary dark:text-gray-400'
              }`}>
                {cropImpact.crop_message}
              </p>
            </div>
          )}

          {/* Recommendations if available */}
          {cropImpact.recommendations && cropImpact.recommendations.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {cropImpact.recommendations.map((rec, idx) => (
                <span 
                  key={idx} 
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-[10px] font-medium border border-amber-200 dark:border-amber-800"
                >
                  <AlertTriangle size={10} />
                  {rec}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FactorCard;