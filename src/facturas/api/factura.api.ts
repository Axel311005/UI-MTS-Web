import axios from 'axios';
import {
  setupAuthRequestInterceptor,
  setup401ResponseInterceptor,
} from '@/shared/api/axios-interceptors';

const BASE_URL = import.meta.env.VITE_API_URL;

export const facturaApi = axios.create({
  baseURL: `${BASE_URL}/api/factura`,
});

// Configurar interceptores de autenticación
setupAuthRequestInterceptor(facturaApi);
setup401ResponseInterceptor(facturaApi);
