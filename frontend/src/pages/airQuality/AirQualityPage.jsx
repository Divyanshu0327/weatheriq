import React, { useState, useEffect } from 'react';
import { useWeather } from '../../context/WeatherContext';
import { weatherService } from '../../services/weatherService';
import AirQualityCard from '../../components/cards/AirQualityCard';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ErrorState from '../../components/common/ErrorState';

const AirQualityPage = () => {
  const { activeLocation } = useWeather();
  const { latitude, longitude, city, country } = activeLocation;

  const [airQuality, setAirQuality] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAqi = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await weatherService.getAirQuality(latitude, longitude);
      if (res.success) setAirQuality(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load air quality metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAqi();
  }, [latitude, longitude]);

  if (loading) return <LoadingSkeleton type="card" count={1} />;
  if (error) return <ErrorState message={error} onRetry={fetchAqi} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
          Air Quality & Environmental Pollution — {city}{country ? `, ${country}` : ''}
        </h1>
        <p className="text-xs text-slate-500 mt-1">Real-time US AQI index and dangerous particulate matter breakdown</p>
      </div>

      <AirQualityCard airQuality={airQuality} />
    </div>
  );
};

export default AirQualityPage;
