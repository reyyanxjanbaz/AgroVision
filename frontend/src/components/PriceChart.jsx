import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format, parseISO } from 'date-fns';

const PriceChart = ({ data, showArea = false }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-4 border border-primary/30 shadow-glow-green">
          <p className="text-xs font-mono text-text-secondary mb-1">
            {format(parseISO(payload[0].payload.date), 'PPP')}
          </p>
          <p className="text-xl font-bold text-primary font-mono">
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
    <div className="glass-panel p-6 animate-fade-in relative overflow-hidden">
      {/* Tech decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
      
      <ResponsiveContainer width="100%" height={400}>
        <ChartComponent data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#16A34A" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#16A34A" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis 
            dataKey="date" 
            tickFormatter={(date) => format(parseISO(date), 'MMM dd')}
            stroke="#94A3B8"
            style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#94A3B8"
            style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
            tickFormatter={(value) => `₹${value}`}
            tickLine={false}
            axisLine={false}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#16A34A', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <DataComponent
            type="monotone"
            dataKey="price"
            stroke="#16A34A"
            strokeWidth={2}
            dot={false}
            fill={showArea ? "url(#colorPrice)" : undefined}
            activeDot={{ r: 6, fill: '#16A34A', stroke: '#fff', strokeWidth: 2 }}
          />
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;