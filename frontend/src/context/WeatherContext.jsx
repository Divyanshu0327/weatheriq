import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WeatherContext = createContext();

export const WeatherProvider = ({ children }) => {
  const { user } = useAuth();

  const [activeLocation, setActiveLocation] = useState({
    city: 'Delhi',
    country: 'India',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 'Asia/Kolkata',
  });

  const [temperatureUnit, setTemperatureUnit] = useState('CELSIUS'); // CELSIUS or FAHRENHEIT

  useEffect(() => {
    if (user?.temperatureUnit) {
      setTemperatureUnit(user.temperatureUnit);
    }
    if (user?.defaultCity) {
      setActiveLocation((prev) => ({
        ...prev,
        city: user.defaultCity,
      }));
    }
  }, [user]);

  const selectCity = (cityData) => {
    setActiveLocation({
      city: cityData.name || cityData.city,
      country: cityData.country || '',
      latitude: cityData.latitude,
      longitude: cityData.longitude,
      timezone: cityData.timezone || 'auto',
    });
  };

  const toggleUnit = () => {
    setTemperatureUnit((prev) => (prev === 'CELSIUS' ? 'FAHRENHEIT' : 'CELSIUS'));
  };

  const convertTemp = (celsiusVal) => {
    if (celsiusVal === undefined || celsiusVal === null) return '--';
    if (temperatureUnit === 'FAHRENHEIT') {
      const fahrenheit = (celsiusVal * 9) / 5 + 32;
      return `${Math.round(fahrenheit)}°F`;
    }
    return `${Math.round(celsiusVal)}°C`;
  };

  return (
    <WeatherContext.Provider
      value={{
        activeLocation,
        temperatureUnit,
        selectCity,
        setTemperatureUnit,
        toggleUnit,
        convertTemp,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => useContext(WeatherContext);
