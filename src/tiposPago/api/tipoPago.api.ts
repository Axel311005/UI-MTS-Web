import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_URL;

export const tipoPagoApi = axios.create({
  baseURL: `${BASE_URL}/api/tipo-pago`,
});
  