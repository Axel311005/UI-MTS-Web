import axios from 'axios';
import {
  setupAuthRequestInterceptor,
  setup401ResponseInterceptor,
} from '@/shared/api/axios-interceptors';

const BASE_URL = import.meta.env.VITE_API_URL;

export const RecepcionApi = axios.create({
  baseURL: `${BASE_URL}/api/recepcion`,
});

// Configurar interceptores de autenticación
setupAuthRequestInterceptor(RecepcionApi);
setup401ResponseInterceptor(RecepcionApi);
