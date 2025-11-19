import axios from 'axios';
import {
  setupAuthRequestInterceptor,
  setup401ResponseInterceptor,
} from '@/shared/api/axios-interceptors';

const BASE_URL = import.meta.env.VITE_API_URL;

export const clienteApi = axios.create({
  baseURL: `${BASE_URL}/api/cliente`,
});

// Configurar interceptores de autenticación
setupAuthRequestInterceptor(clienteApi);
setup401ResponseInterceptor(clienteApi);
