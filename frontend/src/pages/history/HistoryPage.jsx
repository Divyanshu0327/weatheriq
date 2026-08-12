import React, { useState, useEffect } from 'react';
import { historyService } from '../../services/historyService';
import { History, Filter, Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';

const HistoryPage = () => {
  const [city, setCity] = useState('Delhi');
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await historyService.getWeatherHistory(city);
      if (res.success && res.data) {
        setHistoryList(res.data);
      }
    } catch (err) {
      setHistoryList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [city]);

  const chartData = historyList.map((item) => ({
    time: item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
    temp: Math.round(item.temperature),
    humidity: Math.round(item.humidity),
    aqi: item.aqi || 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
            Weather History & Analytical Trends
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Historical observation records and temperature trend metrics</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Filter by city..."
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
            />
          </div>
        </div>
      </div>

      {loading && <LoadingSkeleton type="chart" count={1} />}

      {!loading && historyList.length === 0 && (
        <EmptyState
          title="No Historical Observations Recorded Yet"
          message="Observations will be automatically collected by scheduled jobs."
          icon={History}
        />
      )}

      {historyList.length > 0 && (
        <>
          {/* Chart */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 font-heading mb-4">Historical Temperature Trend — {city}</h3>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="temp" stroke="#2563eb" strokeWidth={3} dot={true} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Observations Table */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm overflow-x-auto">
            <h3 className="text-base font-bold text-slate-800 font-heading mb-4">Observation Records</h3>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">City</th>
                  <th className="pb-3">Temperature</th>
                  <th className="pb-3">Humidity</th>
                  <th className="pb-3">AQI</th>
                  <th className="pb-3">Condition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {historyList.map((row) => (
                  <tr key={row.id}>
                    <td className="py-3 font-mono">{new Date(row.timestamp).toLocaleString()}</td>
                    <td className="py-3 font-bold text-slate-900">{row.city}</td>
                    <td className="py-3 text-blue-600 font-bold">{row.temperature}°C</td>
                    <td className="py-3">{row.humidity}%</td>
                    <td className="py-3 font-bold">{row.aqi || '--'}</td>
                    <td className="py-3">{row.weatherCondition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default HistoryPage;
