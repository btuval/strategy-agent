import React from 'react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export function FlexibleChart({ config }) {
  const { chartType, title, xAxisKey, series, data } = config;

  const DEFAULT_COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'];

  const renderCommonAxis = () => (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
      <XAxis 
        dataKey={xAxisKey} 
        stroke="#94a3b8" 
        tickLine={false} 
        axisLine={false} 
        dy={10} 
        fontSize={12}
      />
      <YAxis 
        stroke="#94a3b8" 
        tickLine={false} 
        axisLine={false} 
        tickFormatter={(val) => val >= 1000 ? `${val/1000}k` : val}
        fontSize={12}
      />
      <Tooltip 
        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
        itemStyle={{ color: '#e2e8f0' }}
      />
      <Legend wrapperStyle={{ paddingTop: '20px' }} />
    </>
  );

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={data}>
            {renderCommonAxis()}
            {series.map((s, i) => (
              <Line 
                key={s.dataKey}
                type="monotone" 
                dataKey={s.dataKey} 
                name={s.name}
                stroke={s.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]} 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            <defs>
              {series.map((s, i) => (
                <linearGradient key={s.dataKey} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={s.color || DEFAULT_COLORS[i]} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={s.color || DEFAULT_COLORS[i]} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            {renderCommonAxis()}
            {series.map((s, i) => (
              <Area 
                key={s.dataKey}
                type="monotone" 
                dataKey={s.dataKey} 
                name={s.name}
                stroke={s.color || DEFAULT_COLORS[i]} 
                fill={`url(#grad-${i})`}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
            <Legend />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey={series[0].dataKey}
              nameKey={xAxisKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        );

      case 'bar':
      default:
        return (
          <BarChart data={data}>
            {renderCommonAxis()}
            {series.map((s, i) => (
              <Bar 
                key={s.dataKey} 
                dataKey={s.dataKey} 
                name={s.name}
                fill={s.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]} 
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );
    }
  };

  return (
    <div className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-6 my-4">
      <h3 className="text-white font-semibold text-lg mb-6">{title}</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}