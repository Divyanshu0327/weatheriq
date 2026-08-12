import api from './api';

export const historyService = {
  getWeatherHistory: (city, startDate, endDate) => {
    let url = '/weather-history';
    const params = [];
    if (city) params.push(`city=${encodeURIComponent(city)}`);
    if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
    if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return api.get(url);
  },
};
