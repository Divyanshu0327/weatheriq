import api from './api';

export const subscriptionService = {
  getSubscriptions: () => api.get('/weather-subscriptions'),
  createSubscription: (data) => api.post('/weather-subscriptions', data),
  updateSubscription: (id, data) => api.put(`/weather-subscriptions/${id}`, data),
  deleteSubscription: (id) => api.delete(`/weather-subscriptions/${id}`),
  sendWeatherAlertsNow: () => api.post('/notifications/send-weather-alerts'),
};
