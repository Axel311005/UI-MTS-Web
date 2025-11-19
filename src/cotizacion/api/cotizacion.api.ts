import axios from 'axios';
import {
  setupAuthRequestInterceptor,
  setup401ResponseInterceptor,
} from '@/shared/api/axios-interceptors';

const BASE_URL = import.meta.env.VITE_API_URL;

export const cotizacionApi = axios.create({
  baseURL: `${BASE_URL}/api/cotizacion`,
});

// Configurar interceptores de autenticación
setupAuthRequestInterceptor(cotizacionApi);
setup401ResponseInterceptor(cotizacionApi);

