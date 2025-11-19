import axios from 'axios';
import {
  setupAuthRequestInterceptor,
  setup401ResponseInterceptor,
} from './axios-interceptors';

const BASE_URL = import.meta.env.VITE_API_URL;

export const tallerApi = axios.create({
  baseURL: `${BASE_URL}/api`,
});

// Configurar interceptores de autenticación
// skipLoginEndpoint=true para no agregar token en /auth/login
setupAuthRequestInterceptor(tallerApi, true);
setup401ResponseInterceptor(tallerApi);
