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

// Handle 401 errors - token expired or invalid
tallerApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si es un 401 (token expirado o inválido)
    if (error.response?.status === 401) {
      const isCheckStatus = error.config?.url?.includes('/auth/check-status');
      const isLoginPage = window.location.pathname.includes('/auth/login');
      
      // Para check-status, solo retornar el error para que checkAuthStatus lo maneje
      // checkAuthStatus decidirá si limpiar la sesión o mantenerla
      if (isCheckStatus) {
        return Promise.reject(error);
      }

      // Para otros endpoints con 401, el token está expirado
      // Limpiar sesión solo si no estamos en la página de login
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
