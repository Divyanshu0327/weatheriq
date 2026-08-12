import React, { useState, useEffect } from 'react';
import { useWeather } from '../../context/WeatherContext';
import { weatherService } from '../../services/weatherService';
import CurrentWeatherCard from '../../components/weather/CurrentWeatherCard';
import WeatherIntelligenceCard from '../../components/weather/WeatherIntelligenceCard';
import HourlyTimeline from '../../components/weather/HourlyTimeline';
import ForecastList from '../../components/weather/ForecastList';
import AirQualityCard from '../../components/cards/AirQualityCard';
import TemperatureChart from '../../components/charts/TemperatureChart';
import PrecipitationChart from '../../components/charts/PrecipitationChart';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';

const DashboardPage = () => {
  const { activeLocation } = useWeather();
  const { latitude, longitude, city, country } = activeLocation;

  const [currentWeather, setCurrentWeather] = useState(null);
  const [hourlyData, setHourlyData] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [intelligence, setIntelligence] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [currentRes, hourlyRes, dailyRes, aqiRes, intelRes] = await Promise.all([
        weatherService.getCurrentWeather(latitude, longitude),
        weatherService.getHourlyWeather(latitude, longitude),
        weatherService.getDailyForecast(latitude, longitude),
        weatherService.getAirQuality(latitude, longitude),
        weatherService.getWeatherIntelligence(latitude, longitude),
      ]);

      if (currentRes.success) setCurrentWeather(currentRes.data);
      if (hourlyRes.success) setHourlyData(hourlyRes.data);
      if (dailyRes.success) setDailyData(dailyRes.data);
      if (aqiRes.success) setAirQuality(aqiRes.data);
      if (intelRes.success) setIntelligence(intelRes.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch weather dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [latitude, longitude]);

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" count={3} />
        <LoadingSkeleton type="chart" count={1} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchDashboardData} />;
  }

  return (
    <div className="space-y-6">
      {/* Current Weather Hero */}
      <CurrentWeatherCard
        weather={currentWeather}
        locationName={city}
        country={country}
      />

      {/* Grid: Intelligence & Air Quality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeatherIntelligenceCard intelligence={intelligence} />
        <AirQualityCard airQuality={airQuality} />
      </div>

      {/* 24-Hour Timeline */}
      <HourlyTimeline hourlyList={hourlyData?.hourlyList} />

      {/* Temperature & Precipitation Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TemperatureChart hourlyList={hourlyData?.hourlyList} />
        <PrecipitationChart hourlyList={hourlyData?.hourlyList} />
      </div>

      {/* 7-10 Day Forecast */}
      <ForecastList dailyList={dailyData?.dailyList} />
    </div>
  );
};

export default DashboardPage;
