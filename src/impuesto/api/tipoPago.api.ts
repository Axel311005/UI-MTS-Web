import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_URL;

export const tipoPagoApi = axios.create({
  baseURL: `${BASE_URL}/api/impuesto`,
});

tipoPagoApi.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch {}
  return config;
}); 