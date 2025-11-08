import { tallerApi } from '@/shared/api/tallerApi';
import type { AuthResponse } from '../types/auth.response';

export const loginAction = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const { data } = await tallerApi.post('/auth/login', { email, password });
    return data;
  } catch (error: any) {
    // Manejar errores específicos
    if (error.response?.status === 401) {
      throw new Error('Credenciales incorrectas');
    }

    if (error.response?.status === 404) {
      throw new Error(
        'El endpoint de login no está disponible. Verifica que el backend esté corriendo.'
      );
    }

    if (
      error.code === 'ERR_NETWORK' ||
      error.message?.includes('Network Error')
    ) {
      throw new Error(
        'No se pudo conectar al servidor. Verifica que el backend esté corriendo.'
      );
    }

    // Re-lanzar el error original si no es uno de los casos anteriores
    throw error;
  }
};
