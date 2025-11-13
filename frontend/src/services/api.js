import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Prefer token from Zustand store (more up-to-date), fall back to localStorage
    const storeToken = useAuthStore.getState().token;
    const lsToken = localStorage.getItem('token');
    const token = storeToken || lsToken;

    console.log('🔐 [AXIOS REQUEST] CRITICAL DEBUG:', {
      url: config.url,
      method: config.method,
      tokenSource: storeToken ? 'zustand' : (lsToken ? 'localStorage' : 'none'),
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenFirst30: token ? token.substring(0, 30) + '...' : 'NULL',
      zustandState: useAuthStore.getState(),
      timestamp: new Date().toISOString()
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ [AXIOS] Authorization header SET:', `Bearer ${token.substring(0, 20)}...`);
      console.log('📋 [AXIOS] Full headers:', config.headers);
    } else {
      console.error('⚠️ [AXIOS] NO TOKEN AVAILABLE - Request will fail with 401!');
      console.error('🔍 [AXIOS] Zustand store state:', useAuthStore.getState());
      console.error('🔍 [AXIOS] localStorage keys:', Object.keys(localStorage));
    }
    return config;
  },
  (error) => {
    console.error('❌ [AXIOS REQUEST ERROR]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
