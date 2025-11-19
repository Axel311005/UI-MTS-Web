import axios from 'axios';
import {
  setupAuthRequestInterceptor,
  setup401ResponseInterceptor,
} from '@/shared/api/axios-interceptors';

const BASE_URL = import.meta.env.VITE_API_URL;

export const ProformaApi = axios.create({
  baseURL: `${BASE_URL}/api/proforma`,
});

// Configurar interceptores de autenticación
setupAuthRequestInterceptor(ProformaApi);
setup401ResponseInterceptor(ProformaApi);
