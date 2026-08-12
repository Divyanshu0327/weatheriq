import React from 'react';
import { Activity, ShieldCheck, AlertCircle } from 'lucide-react';

const getAqiColor = (aqi = 0) => {
  if (aqi <= 50) return { bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200', light: 'bg-emerald-50' };
  if (aqi <= 100) return { bg: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-200', light: 'bg-amber-50' };
  if (aqi <= 150) return { bg: 'bg-orange-500', text: 'text-orange-700', border: 'border-orange-200', light: 'bg-orange-50' };
  if (aqi <= 200) return { bg: 'bg-rose-500', text: 'text-rose-700', border: 'border-rose-200', light: 'bg-rose-50' };
  return { bg: 'bg-purple-600', text: 'text-purple-700', border: 'border-purple-200', light: 'bg-purple-50' };
};

const AirQualityCard = ({ airQuality }) => {
  if (!airQuality) return null;

  const { aqi = 0, category = 'Good', healthRecommendation, pm2_5, pm10, no2, o3, co, so2 } = airQuality;
  const colors = getAqiColor(aqi);

  return (
    <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm card-hover">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">Air Quality Index (AQI)</h3>
            <p className="text-xs text-slate-500">Environmental Pollution Metrics</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.light} ${colors.text} border ${colors.border}`}>
          {category}
        </span>
      </div>

      {/* AQI Large Score Display */}
      <div className="flex items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/60 mb-4">
        <div className={`flex flex-col items-center justify-center w-24 h-24 rounded-2xl text-white font-extrabold text-3xl font-heading shadow-md ${colors.bg}`}>
          <span>{aqi}</span>
          <span className="text-[10px] font-semibold tracking-wider uppercase opacity-90">US AQI</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-800 mb-1">Health Impact Advice</p>
          <p className="text-xs text-slate-600 leading-relaxed">{healthRecommendation}</p>
        </div>
      </div>

      {/* Pollutants Breakdown Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
        {[
          { label: 'PM2.5', val: pm2_5 },
          { label: 'PM10', val: pm10 },
          { label: 'NO₂', val: no2 },
          { label: 'O₃', val: o3 },
          { label: 'CO', val: co },
          { label: 'SO₂', val: so2 },
        ].map((p, i) => (
          <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/50">
            <p className="text-[10px] font-bold text-slate-400 uppercase">{p.label}</p>
            <p className="text-sm font-extrabold text-slate-800 font-heading mt-0.5">
              {p.val !== undefined && p.val !== null ? p.val.toFixed(1) : '--'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AirQualityCard;
