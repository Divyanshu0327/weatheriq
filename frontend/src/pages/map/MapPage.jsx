import React, { useState, useEffect } from 'react';
import { useWeather } from '../../context/WeatherContext';
import { weatherService } from '../../services/weatherService';
import WeatherMapComponent from '../../components/maps/WeatherMapComponent';

const MapPage = () => {
  const { activeLocation } = useWeather();
  const { latitude, longitude, city } = activeLocation;

  const [currentWeather, setCurrentWeather] = useState(null);

  useEffect(() => {
    weatherService.getCurrentWeather(latitude, longitude)
      .then((res) => res.success && setCurrentWeather(res.data))
      .catch(() => {});
  }, [latitude, longitude]);

  return (
    <div className="space-y-4 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
            Interactive Weather Map
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Explore temperature and weather conditions across regions</p>
        </div>
      </div>

      <div className="flex-1 w-full rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
        <WeatherMapComponent
          latitude={latitude}
          longitude={longitude}
          cityName={city}
          temperature={currentWeather?.temperature}
          condition={currentWeather?.weatherCondition}
        />
      </div>
    </div>
  );
};

export default MapPage;
