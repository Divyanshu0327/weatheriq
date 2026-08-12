import api from './api';

export const weatherService = {
  searchLocations: (name) => api.get(`/locations/search?name=${encodeURIComponent(name)}`),
  getCurrentWeather: (lat, lon) => api.get(`/weather/current?latitude=${lat}&longitude=${lon}`),
  getHourlyWeather: (lat, lon) => api.get(`/weather/hourly?latitude=${lat}&longitude=${lon}`),
  getDailyForecast: (lat, lon) => api.get(`/weather/forecast?latitude=${lat}&longitude=${lon}`),
  getAirQuality: (lat, lon) => api.get(`/air-quality?latitude=${lat}&longitude=${lon}`),
  getWeatherIntelligence: (lat, lon) => api.get(`/weather/intelligence?latitude=${lat}&longitude=${lon}`),
};
