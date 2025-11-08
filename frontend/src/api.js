import axios from 'axios';
import { handleAPIError } from './utils/errorHandling';

const API = axios.create({ baseURL: process.env.VITE_API_URL || 'http://localhost:5000/api' });

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralized response error handling
API.interceptors.response.use(
  response => response,
  error => {
    // Let handleAPIError throw a structured APIError or redirect on auth issues
    try {
      handleAPIError(error);
    } catch (e) {
      // Re-throw so callers can optionally catch the APIError
      throw e;
    }
  }
);

export default API;
