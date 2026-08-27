import React, { useState, useEffect } from 'react';
import { useWeather } from '../../context/WeatherContext';
import { historyService } from '../../services/historyService';
import { weatherService } from '../../services/weatherService';
import { History, Search, Calendar, Thermometer, Droplets, Wind, Activity, MapPin, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const HistoryPage = () => {
  const { activeLocation } = useWeather();
  const [city, setCity] = useState(activeLocation?.city || 'Delhi');
  const [searchInput, setSearchInput] = useState(activeLocation?.city || 'Delhi');
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Sync city when activeLocation changes
  useEffect(() => {
    if (activeLocation?.city) {
      setCity(activeLocation.city);
      setSearchInput(activeLocation.city);
    }
  }, [activeLocation]);

  // Fetch history for selected city
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await historyService.getWeatherHistory(city);
        if (res.success && res.data) {
          setHistoryList(res.data);
        } else {
          setHistoryList([]);
        }
      } catch (err) {
        setHistoryList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [city]);

  // City Search Handler
  const handleSearchChange = async (val) => {
    setSearchInput(val);
    if (!val.trim() || val.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await weatherService.searchLocations(val);
      if (res.success && res.data) {
        setSearchResults(res.data);
      }
    } catch (err) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCity = (res) => {
    setCity(res.name);
    setSearchInput(res.name);
    setSearchResults([]);
  };

  // Calculate summary metrics for previous week
  const avgTemp = historyList.length
    ? Math.round(historyList.reduce((acc, curr) => acc + curr.temperature, 0) / historyList.length)
    : '--';
  const avgHumidity = historyList.length
    ? Math.round(historyList.reduce((acc, curr) => acc + curr.humidity, 0) / historyList.length)
    : '--';
  const avgWind = historyList.length
    ? (historyList.reduce((acc, curr) => acc + curr.windSpeed, 0) / historyList.length).toFixed(1)
    : '--';
  const avgAqi = historyList.length
    ? Math.round(historyList.reduce((acc, curr) => acc + (curr.aqi || 0), 0) / historyList.length)
    : '--';

  const chartData = historyList.map((item) => {
    const d = item.timestamp ? new Date(item.timestamp) : new Date();
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      temp: Math.round(item.temperature),
      humidity: Math.round(item.humidity),
      aqi: item.aqi || 0,
      wind: item.windSpeed,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
              Previous Week Weather Report
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase">
              Past 7 Days
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Historical weather observations and trends for <span className="font-bold text-slate-700">{city}</span>
          </p>
        </div>

        {/* City Filter */}
        <div className="relative max-w-xs w-full">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search location for history..."
              className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 shadow-sm"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput('');
                  setSearchResults([]);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl py-1 max-h-48 overflow-y-auto">
              {searchResults.map((r) => (
                <button
                  key={`${r.id}-${r.latitude}`}
                  onClick={() => handleSelectCity(r)}
                  className="w-full px-4 py-2 text-left text-xs font-medium hover:bg-slate-50 text-slate-800 border-b border-slate-100 last:border-0"
                >
                  <span className="font-bold">{r.name}</span>, {r.country}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading && <LoadingSkeleton type="chart" count={1} />}

      {!loading && (
        <>
          {/* Summary Metric Cards for Previous Week */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">7-Day Avg Temp</span>
                  <span className="text-2xl font-extrabold text-slate-900 font-heading">{avgTemp}°C</span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">7-Day Avg Humidity</span>
                  <span className="text-2xl font-extrabold text-slate-900 font-heading">{avgHumidity}%</span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-2xl">
                  <Wind className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">7-Day Avg Wind</span>
                  <span className="text-2xl font-extrabold text-slate-900 font-heading">{avgWind} km/h</span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">7-Day Avg AQI</span>
                  <span className="text-2xl font-extrabold text-slate-900 font-heading">{avgAqi}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Temperature Trend Chart */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  Previous Week Temperature Curve ({city})
                </h3>
                <p className="text-xs text-slate-400">Daily average temperatures over past 7 calendar days</p>
              </div>
            </div>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} unit="°C" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px', border: 'none' }}
                  />
                  <Line type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Observations Table */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                Previous Week Detailed Weather Logs
              </h3>
              <span className="text-xs font-semibold text-slate-500">{historyList.length} records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">City</th>
                    <th className="pb-3">Temperature</th>
                    <th className="pb-3">Humidity</th>
                    <th className="pb-3">Wind Speed</th>
                    <th className="pb-3">AQI</th>
                    <th className="pb-3">Condition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {historyList.map((row, idx) => {
                    const d = row.timestamp ? new Date(row.timestamp) : new Date();
                    return (
                      <tr key={row.id || idx} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 font-semibold text-slate-800">
                          {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-3 font-bold text-slate-900">{row.city}</td>
                        <td className="py-3 text-blue-600 font-extrabold">{row.temperature}°C</td>
                        <td className="py-3 font-semibold">{row.humidity}%</td>
                        <td className="py-3">{row.windSpeed} km/h</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                            (row.aqi || 0) <= 50 ? 'bg-emerald-100 text-emerald-800' :
                            (row.aqi || 0) <= 100 ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            AQI {row.aqi || '--'}
                          </span>
                        </td>
                        <td className="py-3 font-medium text-slate-600">{row.weatherCondition}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HistoryPage;
