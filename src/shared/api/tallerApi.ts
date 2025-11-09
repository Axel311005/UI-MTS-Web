import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_URL;

export const tallerApi = axios.create({
  baseURL: `${BASE_URL}/api`,
});

// Inject Authorization header if token exists
tallerApi.interceptors.request.use((config) => {
  try {
    // No agregar token solo para /auth/login
    const isLoginEndpoint = config.url?.includes('/auth/login');
    if (isLoginEndpoint) {
      return config;
    }

    // Para check-status y otros endpoints, agregar el token si existe
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

// Handle 401 errors silently for check-status (token expired is expected)
tallerApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si es un 401 en check-status, no hacer nada (es esperado si el token expiró)
    if (
      error.response?.status === 401 &&
      error.config?.url?.includes('/auth/check-status')
    ) {
      // Retornar el error para que checkAuthStatus lo maneje, pero sin loguear
      return Promise.reject(error);
    }

    // Para otros 401, limpiar sesión (sin redirigir - ProtectedRoute lo maneja)
    if (error.response?.status === 401) {
      const isLoginPage = window.location.pathname.includes('/auth/login');
      if (!isLoginPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Usar el store de auth si está disponible
        try {
          const { useAuthStore } = require('@/auth/store/auth.store');
          useAuthStore.getState().logout();
        } catch {}
        // NO redirigir aquí - ProtectedRoute manejará la redirección
      }
    }

    return Promise.reject(error);
  }
);
