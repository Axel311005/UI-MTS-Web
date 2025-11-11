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
    // Manejar errores específicos del backend (bloqueo de cuenta, intentos fallidos, etc.)
    if (error.response?.status === 401) {
      // El backend puede devolver mensajes específicos sobre bloqueo o intentos fallidos
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Credenciales incorrectas';
      throw new Error(errorMessage);
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
