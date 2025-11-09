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

// API para detalle de cotizaciones
export const landingDetalleCotizacionApi = axios.create({
  baseURL: `${BASE_URL}/api/detalle-cotizacion`,
});

// Interceptores para agregar token si existe
[
  landingCotizacionApi,
  landingCitaApi,
  landingItemApi,
  landingSeguimientoApi,
  landingDetalleCotizacionApi,
].forEach((api) => {
  api.interceptors.request.use((config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers ?? {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      // Error silencioso en interceptor
    }
    return config;
  });
});
