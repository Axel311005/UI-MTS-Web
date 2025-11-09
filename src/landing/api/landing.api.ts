import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

// API para autenticación pública
export const landingAuthApi = axios.create({
  baseURL: `${BASE_URL}/api/auth`,
});

// API para cotizaciones públicas
export const landingCotizacionApi = axios.create({
  baseURL: `${BASE_URL}/api/cotizacion`,
});

// API para citas públicas
export const landingCitaApi = axios.create({
  baseURL: `${BASE_URL}/api`,
});

// Interceptor para citas (se maneja en el forEach más abajo, no duplicar)

// API para seguimiento público
export const landingSeguimientoApi = axios.create({
  baseURL: `${BASE_URL}/api/recepcion-seguimiento`,
});

// API para items cotizables
export const landingItemApi = axios.create({
  baseURL: `${BASE_URL}/api/item`,
});

// Interceptores para agregar token si existe
[
  landingCotizacionApi,
  landingCitaApi,
  landingItemApi,
  landingSeguimientoApi,
].forEach((api) => {
  api.interceptors.request.use((config) => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token en interceptor:', token ? 'Token encontrado' : 'Token NO encontrado');
      console.log('🔑 URL de la petición:', config.url);
      if (token) {
        config.headers = config.headers ?? {};
        config.headers['Authorization'] = `Bearer ${token}`;
        console.log('🔑 Header Authorization agregado');
      } else {
        console.warn('⚠️ No hay token disponible para la petición');
      }
    } catch (error) {
      console.error('❌ Error en interceptor:', error);
    }
    return config;
  });
});
