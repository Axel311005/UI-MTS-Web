import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

export const landingVehiculoApi = axios.create({
  baseURL: `${BASE_URL}/api/vehiculo`,
});

landingVehiculoApi.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    console.log(
      '🔑 Vehiculo API - Token:',
      token ? 'Token encontrado' : 'Token NO encontrado'
    );
    console.log('🔑 Vehiculo API - URL:', config.url);
    if (token) {
      config.headers = config.headers ?? {};
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Vehiculo API - Header Authorization agregado');
    } else {
      console.warn('⚠️ Vehiculo API - No hay token disponible');
    }
  } catch (error) {
    console.error('❌ Error en interceptor de Vehiculo API:', error);
  }
  return config;
});
