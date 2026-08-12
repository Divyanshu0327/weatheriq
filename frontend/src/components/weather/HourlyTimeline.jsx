import React from 'react';
import { useWeather } from '../../context/WeatherContext';
import { Sun, CloudSun, CloudRain, Wind, Droplets } from 'lucide-react';

const HourlyTimeline = ({ hourlyList = [] }) => {
  const { convertTemp } = useWeather();

  if (!hourlyList || hourlyList.length === 0) return null;

  return (
    <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900 font-heading">24-Hour Timeline</h3>
        <span className="text-xs text-slate-500 font-medium">Scroll horizontally →</span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-slate-200">
        {hourlyList.slice(0, 24).map((item, idx) => {
          const timeFormatted = item.time ? item.time.substring(11, 16) : `${idx}:00`;
          const isHighRain = item.rainProbability >= 40;

          return (
            <div
              key={idx}
              className={`flex flex-col items-center justify-between p-4 rounded-2xl min-w-[100px] border transition-all ${
                idx === 0
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-slate-50 border-slate-200/60 hover:bg-white hover:shadow-md hover:border-slate-300'
              }`}
            >
              <span className={`text-xs font-semibold ${idx === 0 ? 'text-blue-100' : 'text-slate-500'}`}>
                {idx === 0 ? 'Now' : timeFormatted}
              </span>

              <div className="my-3">
                {item.rainProbability > 50 ? (
                  <CloudRain className={`w-8 h-8 ${idx === 0 ? 'text-blue-200' : 'text-blue-500'}`} />
                ) : (
                  <Sun className={`w-8 h-8 ${idx === 0 ? 'text-amber-300' : 'text-amber-500'}`} />
                )}
              </div>

              <span className={`text-base font-extrabold font-heading ${idx === 0 ? 'text-white' : 'text-slate-800'}`}>
                {convertTemp(item.temperature)}
              </span>

              <div className={`flex items-center gap-1 mt-2 text-[11px] font-medium ${
                idx === 0 ? 'text-blue-200' : isHighRain ? 'text-blue-600 font-bold' : 'text-slate-400'
              }`}>
                <Droplets className="w-3 h-3" />
                <span>{Math.round(item.rainProbability)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HourlyTimeline;
