import api from './api';

export const travelService = {
  getTravelWeather: (destination, latitude, longitude, date) => {
    let url = `/travel/weather?latitude=${latitude}&longitude=${longitude}`;
    if (destination) url += `&destination=${encodeURIComponent(destination)}`;
    if (date) url += `&date=${encodeURIComponent(date)}`;
    return api.get(url);
  },
};
