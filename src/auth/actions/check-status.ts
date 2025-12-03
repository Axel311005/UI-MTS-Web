import { tallerApi } from '@/shared/api/tallerApi';
import type { CheckStatusResponse, AuthResponse } from '../types/auth.response';
import { clearTokenCache } from '@/shared/utils/tokenUtils';

export const checkAuthAction = async (): Promise<CheckStatusResponse> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No se encontró el token de autenticación');
  }

  try {
    const { data } = await tallerApi.get<CheckStatusResponse>(
      '/auth/check-status'
    );

    // Validar que la respuesta tenga los campos mínimos requeridos
    if (!data || typeof data !== 'object') {
      throw new Error('Respuesta inválida del servidor');
    }

    if (!data.id || !data.email || !Array.isArray(data.roles)) {
      throw new Error(
        'La respuesta del servidor no contiene los datos esperados'
      );
    }

    // Validar si el usuario está activo
    if (data.isActive === false) {
      throw new Error('Tu cuenta está desactivada. Contacta al administrador');
    }

    // Validar si el usuario está bloqueado
    if (data.blockedUntil) {
      const blockedUntil = new Date(data.blockedUntil);
      const now = new Date();
      if (blockedUntil > now) {
        const minutesLeft = Math.ceil(
          (blockedUntil.getTime() - now.getTime()) / 60000
        );
        throw new Error(
          `Tu cuenta está bloqueada temporalmente. Intenta nuevamente en ${minutesLeft} minuto(s)`
        );
      }
    }

    // Validar que haya roles
    if (!data.roles || data.roles.length === 0) {
      throw new Error('No se encontraron roles asignados a tu cuenta');
    }

    // Actualizar el token si el servidor devuelve uno nuevo
    if (data.token && data.token !== token) {
      localStorage.setItem('token', data.token);
      // Limpiar caché del token anterior
      clearTokenCache();
    }

    return data;
  } catch (error: any) {
    // Si es un error de validación que lanzamos nosotros, propagarlo
    if (
      (error instanceof Error && error.message.includes('cuenta')) ||
      error.message.includes('bloqueada')
    ) {
      throw error;
    }

    // Para otros errores, mejorar el mensaje
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      'No se pudo verificar el estado de autenticación';

    throw new Error(errorMessage);
  }
};

/**
 * Convierte CheckStatusResponse a AuthResponse para compatibilidad
 * Útil cuando necesitamos usar la respuesta de check-status como AuthResponse
 */
export const checkStatusToAuthResponse = (
  checkStatus: CheckStatusResponse
): AuthResponse => {
  return {
    id: checkStatus.id,
    email: checkStatus.email,
    roles: checkStatus.roles,
    token: checkStatus.token,
    isActive: checkStatus.isActive,
    empleado: checkStatus.empleado || {
      id: 0,
      primerNombre: null,
      primerApellido: null,
    },
    cliente: checkStatus.cliente || {
      idCliente: 0,
      primerNombre: null,
      primerApellido: null,
      ruc: '',
      esExonerado: false,
      porcentajeExonerado: '0',
      direccion: '',
      telefono: '',
      activo: 'ACTIVO',
      notas: '',
      fechaUltModif: null,
      fechaCreacion: new Date(),
    },
  };
};
