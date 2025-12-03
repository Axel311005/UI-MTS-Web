import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosError } from 'axios';
import {
  isTokenExpired,
  isPublicEndpoint,
  clearTokenCache,
  clearExpirationCache,
  updateExpirationCache,
  lastExpirationCheck,
  EXPIRATION_CHECK_CACHE_TTL,
} from '@/shared/utils/tokenUtils';

// Variable para evitar múltiples intentos simultáneos de renovación
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Intenta renovar el token silenciosamente
 * Usa axios directamente para evitar dependencias circulares
 */
const tryRefreshToken = async (): Promise<string | null> => {
  try {
    const BASE_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');
    
    if (!token) {
      return null;
    }

    // Usar axios directamente para evitar interceptores y dependencias circulares
    const { data } = await axios.get<{ token: string; isActive?: boolean; blockedUntil?: string | null }>(
      `${BASE_URL}/api/auth/check-status`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    // Validar que el usuario esté activo y no bloqueado
    if (data?.isActive === false) {
      // Usuario desactivado, no renovar token
      return null;
    }

    if (data?.blockedUntil) {
      const blockedUntil = new Date(data.blockedUntil);
      const now = new Date();
      if (blockedUntil > now) {
        // Usuario bloqueado, no renovar token
        return null;
      }
    }
    
    if (data?.token) {
      localStorage.setItem('token', data.token);
      return data.token;
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Configura un interceptor de respuesta para manejar errores 401 (token expirado)
 * Intenta renovar el token antes de sacar al usuario
 */
export const setup401ResponseInterceptor = (apiInstance: AxiosInstance) => {
  apiInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      // Detectar si la respuesta es HTML en lugar de JSON (error común)
      if (
        error.response?.data &&
        typeof error.response.data === 'string' &&
        error.response.data.trim().startsWith('<')
      ) {
        const htmlError = new Error(
          'El servidor devolvió una respuesta HTML en lugar de JSON. Esto puede indicar un problema con el servidor o la ruta.'
        );
        htmlError.name = 'HTMLResponseError';
        return Promise.reject(htmlError);
      }

      // Si el error es 401 (No autorizado)
      if (error.response?.status === 401) {
        const currentPath = window.location.pathname;
        const publicPaths = ['/login', '/auth/login', '/register', '/catalogo', '/'];

        // Verificar si estamos en una ruta pública
        const isPublicPath =
          publicPaths.includes(currentPath) ||
          currentPath.startsWith('/catalogo');

        // Si estamos en una ruta pública, NO limpiar el token ni hacer logout
        // Solo permitir que el error se propague normalmente
        if (isPublicPath) {
          return Promise.reject(error);
        }

        const originalRequest = error.config as any;
        const isCheckStatus = error.config?.url?.includes('/auth/check-status');
        const isLoginPage = window.location.pathname.includes('/auth/login');

        // Para check-status, solo retornar el error para que checkAuthStatus lo maneje
        if (isCheckStatus) {
          return Promise.reject(error);
        }

        // Si estamos en la página de login, no hacer nada
        if (isLoginPage) {
          return Promise.reject(error);
        }

        // Solo para rutas protegidas: permitir que el error se propague primero
        // para que los componentes puedan mostrar el mensaje de error
        const isProtectedPath =
          currentPath.startsWith('/admin') ||
          currentPath.startsWith('/carrito') ||
          currentPath.startsWith('/pedido');

        if (isProtectedPath) {
          // NO limpiar el token ni redirigir inmediatamente
          // Dejar que el componente maneje el error y muestre el mensaje
          // Solo limpiar y redirigir después de que el usuario vea el error
          // Esto se hace con un delay más largo para que el toast se muestre
          setTimeout(async () => {
            // Verificar si el token sigue siendo inválido antes de redirigir
            const token = localStorage.getItem('token');
            if (!token || isTokenExpired(token)) {
              localStorage.removeItem('token');
              clearTokenCache();
              clearExpirationCache();

              try {
                const { useAuthStore } = await import('@/auth/store/auth.store');
                useAuthStore.getState().logout();
              } catch (err) {
                // Si falla la importación, solo limpiar localStorage
              }

              window.location.href = '/auth/login';
            }
          }, 3000); // 3 segundos para que el usuario vea el error
        }

        // Intentar renovar el token si hay request original
        if (originalRequest && !isRefreshing) {
          // Si ya estamos intentando renovar el token, agregar a la cola
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                if (token && originalRequest.headers) {
                  originalRequest.headers['Authorization'] = `Bearer ${token}`;
                }
                return apiInstance(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          // Intentar renovar el token
          isRefreshing = true;
          const newToken = await tryRefreshToken();

          if (newToken) {
            // Token renovado exitosamente
            isRefreshing = false;
            processQueue(null, newToken);

            // Reintentar la petición original con el nuevo token
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            }
            return apiInstance(originalRequest);
          } else {
            // No se pudo renovar el token
            isRefreshing = false;
            processQueue(error, null);
          }
        }
      }

      return Promise.reject(error);
    }
  );
};

/**
 * Configura un interceptor de request para agregar el token de autorización
 * Verifica expiración del token antes de agregarlo
 */
export const setupAuthRequestInterceptor = (
  apiInstance: AxiosInstance,
  skipLoginEndpoint = false
) => {
  apiInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    try {
      const url = config.url || '';

      // Verificar si es un endpoint público (no requiere token)
      const isPublic = isPublicEndpoint(url);

      // Si es público, no agregar token
      if (isPublic) {
        return config;
      }

      // No agregar token solo para /auth/login si skipLoginEndpoint es true
      if (skipLoginEndpoint) {
        const isLoginEndpoint = config.url?.includes('/auth/login');
        if (isLoginEndpoint) {
          return config;
        }
      }

      // Para endpoints protegidos, agregar token si existe
      const token = localStorage.getItem('token');

      // Solo verificar expiración si es un endpoint protegido y hay token
      if (token && config.url) {
        const now = Date.now();

        // Usar caché de verificación para evitar decodificar en cada petición
        let isExpired = false;

        // Si el token cambió, limpiar el caché
        if (lastExpirationCheck && lastExpirationCheck.token !== token) {
          clearExpirationCache();
        }

        if (
          !lastExpirationCheck ||
          now - lastExpirationCheck.checkedAt > EXPIRATION_CHECK_CACHE_TTL
        ) {
          // Verificar expiración solo si el caché expiró o el token cambió
          isExpired = isTokenExpired(token);
          // Actualizar caché
          updateExpirationCache(token, isExpired, now);
        } else {
          // Usar resultado del caché
          isExpired = lastExpirationCheck.isExpired;
        }

        if (isExpired) {
          // Token vencido, limpiar cachés y redirigir
          localStorage.removeItem('token');
          clearTokenCache();
          clearExpirationCache();

          // Importar y usar el store de forma dinámica para evitar dependencias circulares
          (async () => {
            try {
              const { useAuthStore } = await import('@/auth/store/auth.store');
              useAuthStore.getState().logout();
            } catch (err) {
              // Error al limpiar store de autenticación
            }
            // Solo redirigir si no estamos ya en la página de login y estamos en el panel
            if (
              window.location.pathname.startsWith('/admin') &&
              window.location.pathname !== '/auth/login' &&
              window.location.pathname !== '/login'
            ) {
              window.location.href = '/auth/login';
            }
          })();

          // Rechazar la petición
          return Promise.reject(new Error('Token expirado'));
        }

        // Agregar token al header
        config.headers = config.headers ?? {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch {
      // Error silencioso en interceptor
    }
    return config;
  });
};

