import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosError } from 'axios';

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
      const originalRequest = error.config as any;

      // Si es un 401 (token expirado o inválido)
      if (error.response?.status === 401) {
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

        // Si no hay request original, rechazar
        if (!originalRequest) {
          return Promise.reject(error);
        }

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
          // No se pudo renovar el token, limpiar sesión
          isRefreshing = false;
          processQueue(error, null);

          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Usar el store de auth si está disponible
          try {
            const { useAuthStore } = require('@/auth/store/auth.store');
            useAuthStore.getState().logout();
          } catch {
            // Si el store no está disponible, solo limpiar localStorage
          }
          
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }
  );
};

/**
 * Configura un interceptor de request para agregar el token de autorización
 */
export const setupAuthRequestInterceptor = (
  apiInstance: AxiosInstance,
  skipLoginEndpoint = false
) => {
  apiInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    try {
      // No agregar token solo para /auth/login si skipLoginEndpoint es true
      if (skipLoginEndpoint) {
        const isLoginEndpoint = config.url?.includes('/auth/login');
        if (isLoginEndpoint) {
          return config;
        }
      }

      // Para otros endpoints, agregar el token si existe
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers ?? {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch {
      // Error silencioso en interceptor
    }
    return config;
  });
};

