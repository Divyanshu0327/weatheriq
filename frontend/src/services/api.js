import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('weatheriq_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error & Unauthenticated Handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Clear token on 401 if unauthorized
        localStorage.removeItem('weatheriq_token');
        localStorage.removeItem('weatheriq_user');
      }
      return Promise.reject(error.response.data || { message: 'An API error occurred' });
    } else if (error.request) {
      return Promise.reject({ message: 'Network error. Backend server is unreachable.' });
    }
    return Promise.reject({ message: error.message || 'An unknown error occurred' });
  }
);

export default api;
