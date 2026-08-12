import api from './api';

export const alertService = {
  getAlerts: () => api.get('/alerts'),
  createAlert: (data) => api.post('/alerts', data),
  updateAlert: (id, data) => api.put(`/alerts/${id}`, data),
  deleteAlert: (id) => api.delete(`/alerts/${id}`),
};
