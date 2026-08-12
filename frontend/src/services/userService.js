import api from './api';

export const userService = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  updatePreferences: (data) => api.put('/users/preferences', data),
};
