import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format, parseISO } from 'date-fns';

const PriceChart = ({ data, showArea = false }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-4 shadow-xl">
          <p className="text-sm font-semibold text-gray-900">
            {format(parseISO(payload[0].payload.date), 'PPP')}
          </p>
          <p className="text-2xl font-bold text-primary mt-1">
            ₹{payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  const ChartComponent = showArea ? AreaChart : LineChart;
  const DataComponent = showArea ? Area : Line;

  return (
    <div className="glass-card p-6 animate-fade-in">
      <ResponsiveContainer width="100%" height={400}>
        <ChartComponent data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(date) => format(parseISO(date), 'MMM dd')}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `₹${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <DataComponent
            type="monotone"
            dataKey="price"
            stroke="#10b981"
            strokeWidth={3}
            dot={false}
            fill={showArea ? "url(#colorPrice)" : undefined}
            activeDot={{ r: 6, fill: '#10b981' }}
          />
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;