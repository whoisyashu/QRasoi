import axios from 'axios';
import { storageService } from './storage.service';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://qrasoi.onrender.com/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await storageService.getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await storageService.clearAll();
    }
    return Promise.reject(error.response?.data?.message || error.message || 'Network request failed');
  }
);
