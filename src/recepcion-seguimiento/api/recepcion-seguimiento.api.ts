import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_URL;

export const RecepcionSeguimientoApi = axios.create({
  baseURL: `${BASE_URL}/api/recepcion-seguimiento`,
});

// Attach auth token if present
RecepcionSeguimientoApi.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any)['Authorization'] = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

