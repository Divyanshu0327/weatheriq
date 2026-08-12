import React from 'react';
import { useWeather } from '../../context/WeatherContext';
import { Sun, CloudRain, Calendar, Droplets } from 'lucide-react';

const ForecastList = ({ dailyList = [] }) => {
  const { convertTemp } = useWeather();

  if (!dailyList || dailyList.length === 0) return null;

  return (
    <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-bold text-slate-900 font-heading">7–10 Day Forecast</h3>
      </div>

      <div className="space-y-3">
        {dailyList.map((item, idx) => {
          const dateObj = new Date(item.date);
          const dayName = idx === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          const dateFormatted = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          return (
            <div
              key={idx}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition"
            >
              <div className="w-28">
                <p className="text-sm font-bold text-slate-800">{dayName}</p>
                <p className="text-xs text-slate-500">{dateFormatted}</p>
              </div>

              <div className="flex items-center gap-2">
                {item.rainProbability > 40 ? (
                  <CloudRain className="w-6 h-6 text-blue-500" />
                ) : (
                  <Sun className="w-6 h-6 text-amber-500" />
                )}
                <div className="flex items-center gap-1 text-xs font-semibold text-blue-600">
                  <Droplets className="w-3.5 h-3.5" />
                  <span>{Math.round(item.rainProbability)}%</span>
                </div>
              </div>

              {/* Temperature Bar */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500">{convertTemp(item.minTemperature)}</span>
                <div className="w-20 md:w-28 h-2 bg-slate-200 rounded-full overflow-hidden flex">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-amber-400 w-full rounded-full" />
                </div>
                <span className="text-sm font-extrabold text-slate-800">{convertTemp(item.maxTemperature)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ForecastList;
