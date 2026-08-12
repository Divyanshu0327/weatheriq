import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const TemperatureChart = ({ hourlyList = [] }) => {
  if (!hourlyList || hourlyList.length === 0) return null;

  const chartData = hourlyList.slice(0, 24).map((item) => ({
    time: item.time ? item.time.substring(11, 16) : '',
    temp: Math.round(item.temperature),
    feels: Math.round(item.apparentTemperature),
  }));

  return (
    <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 font-heading">24-Hour Temperature Curve</h3>
          <p className="text-xs text-slate-500">Actual vs Feels Like Temperature</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-600"></span> Temp (°C)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-300"></span> Feels Like</span>
        </div>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
            />
            <Area type="monotone" dataKey="temp" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#tempGradient)" />
            <Area type="monotone" dataKey="feels" stroke="#a5b4fc" strokeWidth={2} strokeDasharray="3 3" fill="none" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TemperatureChart;
