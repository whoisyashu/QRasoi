import axios from 'axios';

// Support both VITE_API_URL and VITE_API_BASE_URL from environment variables
const rawUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';
const API_BASE_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject JWT Authorization Bearer Token into requests automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('qrasoi_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response error handler
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('API Client 401 Unauthorized response');
    }
    return Promise.reject(error);
  }
);
