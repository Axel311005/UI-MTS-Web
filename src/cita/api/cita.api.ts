import axios from 'axios';
import {
  setupAuthRequestInterceptor,
  setup401ResponseInterceptor,
} from '@/shared/api/axios-interceptors';

const BASE_URL = import.meta.env.VITE_API_URL;

export const citaApi = axios.create({
  baseURL: `${BASE_URL}/api/cita`,
});

// Configurar interceptores de autenticación
setupAuthRequestInterceptor(citaApi);
setup401ResponseInterceptor(citaApi);

