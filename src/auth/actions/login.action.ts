import { tallerApi } from '@/shared/api/tallerApi';
import type { AuthResponse } from '../types/auth.response';

export const loginAction = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const { data } = await tallerApi.post('/auth/login', { email, password });
    console.log(data);
    return data;
  } catch (error) {
    console.error('Login failed', error);
    throw error;
  }
};
