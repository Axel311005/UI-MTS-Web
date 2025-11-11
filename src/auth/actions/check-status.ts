import { tallerApi } from '@/shared/api/tallerApi';
import type { AuthResponse } from '../types/auth.response';

export const checkAuthAction = async (): Promise<AuthResponse> => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');

  const { data } = await tallerApi.get<AuthResponse>('/auth/check-status');

  // Solo actualizar el token si el servidor devuelve uno nuevo
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
};
