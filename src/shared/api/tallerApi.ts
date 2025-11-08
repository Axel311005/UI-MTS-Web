import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_URL;

export const tallerApi = axios.create({
  baseURL: `${BASE_URL}/api`,
});

// Inject Authorization header if token exists
tallerApi.interceptors.request.use((config) => {
  try {
    // No agregar token para endpoints de autenticación
    const isAuthEndpoint =
      config.url?.includes('/auth/login') ||
      config.url?.includes('/auth/check-status');
    if (isAuthEndpoint) {
      return config;
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch {}
  return config;
});
