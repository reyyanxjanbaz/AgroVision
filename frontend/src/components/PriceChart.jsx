import React, { useMemo, useState } from 'react';
import { 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Line,
  ComposedChart
} from 'recharts';
import { format } from 'date-fns';
import { RefreshCw, Download, TrendingUp, TrendingDown, ArrowRight, Check, Camera } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const PriceChart = ({ data, prediction, onRefresh, unit = 'Quintal' }) => {
  const { t } = useSettings();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isSnapshotTaken, setIsSnapshotTaken] = useState(false);
  
  const { chartData, currentPrice, predictedPrice, percentChange } = useMemo(() => {
    if (!data || data.length === 0) return { chartData: [], currentPrice: 0, predictedPrice: 0, percentChange: 0 };

    const historyData = data.map(item => ({
      date: item.date,
      timestamp: new Date(item.date).getTime(),
      historical: item.price,
      predicted: null,
      originalDate: item.date // Keep original for formatting
    })).sort((a, b) => a.timestamp - b.timestamp);

    const lastPoint = historyData[historyData.length - 1];
    const current = lastPoint.historical;
    
    let predicted = current;
    let change = 0;
    let finalChartData = [...historyData];

    if (prediction) {
      predicted = prediction.next3Days || current;
      change = ((predicted - current) / current) * 100;
      
      // Add the bridge point (last historical point is also start of prediction)
      // We modify the last point in place to have both values
      finalChartData[finalChartData.length - 1] = {
        ...lastPoint,
        predicted: current
      };

      // Add prediction point
      const predDate = prediction.prediction_date || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      finalChartData.push({
        date: predDate,
        timestamp: new Date(predDate).getTime(),
        historical: null,
        predicted: predicted,
        isPrediction: true
      });
    }

    return {
      chartData: finalChartData,
      currentPrice: current,
      predictedPrice: predicted,
      percentChange: change
    };
  }, [data, prediction]);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setTimeout(() => setIsRefreshing(false), 500); // Min duration for visual feedback
    }
  };

  const handleSnapshot = () => {
    const svg = document.querySelector('.recharts-surface');
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = svg.getBoundingClientRect().width * 2; // 2x for better resolution
      canvas.height = svg.getBoundingClientRect().height * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width / 2, canvas.height / 2);
      ctx.drawImage(img, 0, 0);
      
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = `chart_snapshot_${format(new Date(), 'yyyyMMdd_HHmmss')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setIsSnapshotTaken(true);
      setTimeout(() => setIsSnapshotTaken(false), 2000);
    };
    img.src = url;
  };

  const handleDownload = () => {
    if (!chartData || chartData.length === 0) return;

    // Create CSV content
    const headers = ['Date', 'Historical Price', 'Predicted Price', 'Type'];
    const rows = chartData.map(row => {
      const dateStr = row.originalDate ? format(new Date(row.originalDate), 'yyyy-MM-dd') : format(new Date(row.date), 'yyyy-MM-dd');
      const type = row.isPrediction ? 'Prediction' : 'Historical';
      return [
        dateStr,
        row.historical ? row.historical.toFixed(2) : '',
        row.predicted ? row.predicted.toFixed(2) : '',
        type
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `price_data_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 2000);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const isPred = payload[0].payload.isPrediction;
      return (
        <div className="bg-gray-900/90 backdrop-blur-sm p-3 rounded-lg border border-white/10 shadow-xl text-white">
          <p className="text-xs font-mono text-gray-400 mb-1">
            {label ? format(new Date(label), 'MMM dd, yyyy') : ''}
          </p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${entry.dataKey === 'predicted' ? 'bg-amber-500' : 'bg-green-500'}`} />
              <span className="text-sm font-medium">
                {entry.dataKey === 'predicted' ? t('forecast') : t('actual')}:
              </span>
              <span className="text-lg font-bold font-mono">
                ₹{entry.value?.toFixed(2)} <span className="text-xs font-normal">/{unit}</span>
              </span>
            </div>
          ))}
          {isPred && (
            <div className="mt-2 pt-2 border-t border-white/10 text-xs text-amber-400 flex items-center gap-1">
              <ActivityIcon size={12} /> {t('aiPrediction')}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-primary rounded-full" />
          <h3 className="font-bold text-text-primary dark:text-white">{t('priceTrend')}</h3>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors disabled:opacity-50" 
            title={t('refreshData')}
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={handleSnapshot}
            className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors flex items-center gap-1" 
            title={t('takeSnapshot')}
          >
            {isSnapshotTaken ? <Check size={16} className="text-green-600 dark:text-green-400" /> : <Camera size={16} />}
          </button>
          <button 
            onClick={handleDownload}
            className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors flex items-center gap-1" 
            title={t('downloadCSV')}
          >
            {isDownloaded ? <Check size={16} className="text-green-600 dark:text-green-400" /> : <Download size={16} />}
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 p-6 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16A34A" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#16A34A" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis 
              dataKey="timestamp"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(timestamp) => {
                try { return format(new Date(timestamp), 'MMM dd'); } catch (e) { return ''; }
              }}
              stroke="#94A3B8"
              style={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
              dy={10}
              tickCount={6}
            />
            <YAxis 
              domain={['auto', 'auto']}
              stroke="#94A3B8"
              style={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }}
              tickFormatter={(value) => `₹${value}`}
              tickLine={false}
              axisLine={false}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '4 4' }} />
            
            {/* Historical Line (Solid + Area) */}
            <Area
              type="monotone"
              dataKey="historical"
              stroke="#16A34A"
              strokeWidth={2}
              fill="url(#colorHistorical)"
              activeDot={{ r: 6, fill: '#16A34A', stroke: '#fff', strokeWidth: 2 }}
            />
            
            {/* Predicted Line (Dashed) */}
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: '#F59E0B', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#F59E0B', stroke: '#fff', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Summary */}
      <div className="bg-green-50/50 dark:bg-green-900/10 border-t border-green-100 dark:border-green-900/30 px-6 py-4 grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-text-secondary dark:text-gray-400 uppercase font-mono mb-1">{t('currentPrice')}</p>
          <p className="text-xl font-bold text-text-primary dark:text-white font-mono">
            ₹{currentPrice.toLocaleString()} <span className="text-sm text-text-secondary dark:text-gray-400">/{unit}</span>
          </p>
        </div>
        
        <div className="border-l border-green-200 dark:border-green-800 pl-4">
          <p className="text-xs text-text-secondary dark:text-gray-400 uppercase font-mono mb-1">{t('predicted7d')}</p>
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold text-amber-600 dark:text-amber-500 font-mono">
              ₹{predictedPrice.toLocaleString()} <span className="text-sm text-amber-600/70 dark:text-amber-500/70">/{unit}</span>
            </p>
            <ArrowRight size={14} className="text-amber-400" />
          </div>
        </div>

        <div className="border-l border-green-200 dark:border-green-800 pl-4">
          <p className="text-xs text-text-secondary dark:text-gray-400 uppercase font-mono mb-1">{t('expectedChange')}</p>
          <div className={`flex items-center gap-1 ${percentChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {percentChange >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            <span className="text-xl font-bold font-mono">{Math.abs(percentChange).toFixed(2)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper for tooltip
const ActivityIcon = ({ size, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

export default PriceChart;