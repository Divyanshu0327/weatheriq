import React from 'react';
import { useWeather } from '../../context/WeatherContext';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Sunset,
  Sunrise,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

const getWeatherIcon = (condition = '', code = 0) => {
  const cond = condition.toLowerCase();
  if (cond.includes('thunder') || code >= 95) return <CloudLightning className="w-12 h-12 text-amber-500" />;
  if (cond.includes('rain') || cond.includes('drizzle') || code >= 51) return <CloudRain className="w-12 h-12 text-blue-500" />;
  if (cond.includes('partly') || cond.includes('mainly') || code === 1 || code === 2) return <CloudSun className="w-12 h-12 text-amber-400" />;
  if (cond.includes('cloud') || cond.includes('overcast') || code === 3) return <Cloud className="w-12 h-12 text-slate-400" />;
  return <Sun className="w-12 h-12 text-amber-500 animate-spin-slow" />;
};

const CurrentWeatherCard = ({ weather, locationName, country }) => {
  const { convertTemp } = useWeather();

  if (!weather) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 text-white p-6 md:p-8 shadow-xl shadow-blue-500/10">
      {/* Background Graphic Orbs */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Section: Temperature & Location */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-blue-100">
              Current Conditions
            </span>
            <span className="text-xs text-blue-200">Updated: {weather.timestamp ? weather.timestamp.substring(11, 16) : 'Now'}</span>
          </div>

          <h2 className="text-3xl font-extrabold text-white mt-2 font-heading">
            {locationName}{country ? `, ${country}` : ''}
          </h2>
          <p className="text-blue-100 text-sm font-medium">{weather.weatherCondition}</p>

          <div className="flex items-baseline gap-4 mt-4">
            <span className="text-6xl md:text-7xl font-extrabold tracking-tight font-heading">
              {convertTemp(weather.temperature)}
            </span>
            <span className="text-sm font-medium text-blue-100">
              Feels like <strong className="text-white text-base">{convertTemp(weather.apparentTemperature)}</strong>
            </span>
          </div>
        </div>

        {/* Right Section: Icon & Primary Metrics Pill */}
        <div className="flex flex-col items-start md:items-end gap-4">
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            {getWeatherIcon(weather.weatherCondition, weather.weatherCode)}
          </div>

          <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 px-3.5 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-xs">
              <Droplets className="w-4 h-4 text-blue-200" />
              <div>
                <p className="text-blue-200 text-[10px]">Humidity</p>
                <p className="font-bold">{weather.humidity}%</p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-xs">
              <Wind className="w-4 h-4 text-blue-200" />
              <div>
                <p className="text-blue-200 text-[10px]">Wind</p>
                <p className="font-bold">{weather.windSpeed} km/h</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Bottom Metrics */}
      <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="flex items-center gap-2.5">
          <Sunrise className="w-4 h-4 text-amber-300" />
          <div>
            <span className="text-blue-200 block text-[10px]">Sunrise</span>
            <span className="font-semibold text-white">{weather.sunrise ? weather.sunrise.substring(11, 16) : '--:--'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Sunset className="w-4 h-4 text-amber-400" />
          <div>
            <span className="text-blue-200 block text-[10px]">Sunset</span>
            <span className="font-semibold text-white">{weather.sunset ? weather.sunset.substring(11, 16) : '--:--'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Gauge className="w-4 h-4 text-blue-200" />
          <div>
            <span className="text-blue-200 block text-[10px]">Pressure</span>
            <span className="font-semibold text-white">{weather.pressure || 1013} hPa</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Eye className="w-4 h-4 text-blue-200" />
          <div>
            <span className="text-blue-200 block text-[10px]">Visibility</span>
            <span className="font-semibold text-white">
              {weather.visibility ? `${(weather.visibility / 1000).toFixed(1)} km` : '10 km'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeatherCard;
