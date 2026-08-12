import api from './api';

export const cityService = {
  getSavedCities: () => api.get('/cities'),
  saveCity: (data) => api.post('/cities', data),
  setDefaultCity: (id) => api.put(`/cities/${id}/default`),
  deleteCity: (id) => api.delete(`/cities/${id}`),
};
