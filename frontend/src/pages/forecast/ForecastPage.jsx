import React, { useState, useEffect } from 'react';
import { useWeather } from '../../context/WeatherContext';
import { weatherService } from '../../services/weatherService';
import ForecastList from '../../components/weather/ForecastList';
import HourlyTimeline from '../../components/weather/HourlyTimeline';
import TemperatureChart from '../../components/charts/TemperatureChart';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';

const ForecastPage = () => {
  const { activeLocation } = useWeather();
  const { latitude, longitude, city, country } = activeLocation;

  const [dailyData, setDailyData] = useState(null);
  const [hourlyData, setHourlyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dailyRes, hourlyRes] = await Promise.all([
        weatherService.getDailyForecast(latitude, longitude),
        weatherService.getHourlyWeather(latitude, longitude),
      ]);
      if (dailyRes.success) setDailyData(dailyRes.data);
      if (hourlyRes.success) setHourlyData(hourlyRes.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch forecast');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [latitude, longitude]);

  if (loading) return <LoadingSkeleton type="chart" count={2} />;
  if (error) return <ErrorState message={error} onRetry={fetchForecast} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
          Extended Weather Forecast — {city}{country ? `, ${country}` : ''}
        </h1>
        <p className="text-xs text-slate-500 mt-1">Multi-day precipitation and temperature trend analysis</p>
      </div>

      <TemperatureChart hourlyList={hourlyData?.hourlyList} />
      <HourlyTimeline hourlyList={hourlyData?.hourlyList} />
      <ForecastList dailyList={dailyData?.dailyList} />
    </div>
  );
};

export default ForecastPage;
