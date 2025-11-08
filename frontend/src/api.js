import axios from 'axios';

const API = axios.create({ baseURL: process.env.VITE_API_URL || 'http://localhost:5000/api' });

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Basic response error handling (removed missing dependency for build)
API.interceptors.response.use(
  response => response,
  error => {
    // Log the error and propagate it so callers can handle it
    console.error('API response error:', error);
    return Promise.reject(error);
  }
);

export default API;
