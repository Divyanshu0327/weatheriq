import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const PrecipitationChart = ({ hourlyList = [] }) => {
  if (!hourlyList || hourlyList.length === 0) return null;

  const chartData = hourlyList.slice(0, 24).map((item) => ({
    time: item.time ? item.time.substring(11, 16) : '',
    prob: Math.round(item.rainProbability),
  }));

  return (
    <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 font-heading">Rain Probability Timeline</h3>
          <p className="text-xs text-slate-500">Hourly Precipitation Likelihood (%)</p>
        </div>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
            />
            <Bar dataKey="prob" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PrecipitationChart;
