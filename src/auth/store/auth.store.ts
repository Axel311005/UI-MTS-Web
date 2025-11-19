import { create } from 'zustand';
import { loginAction } from '../actions/login.action';
import { checkAuthAction } from '../actions/check-status';
import type { AuthResponse } from '../types/auth.response';

type AuthStatus = 'authenticated' | 'not-authenticated' | 'checking';

// Roles permitidos para acceder al panel administrativo
export type PanelRole = 'gerente' | 'vendedor' | 'superuser';

type AuthState = {
  // Utils
  hasAnyRole(mapped: PanelRole[]): boolean;
  // Verifica si el usuario tiene un rol permitido para el panel
  hasPanelAccess: () => boolean;
  // Properties
  user: AuthUser | null;
  token: string | null;
  authStatus: AuthStatus;

  // Getters
  isAdmin: () => boolean;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuthStatus: () => Promise<boolean>;
};

type AuthUser = Omit<AuthResponse, 'token'>;

export const useAuthStore = create<AuthState>()((set, get) => {
  // Inicializar desde localStorage al crear el store
  // Confiar en el localStorage inicialmente para evitar carga innecesaria
  // Solo verificar con el servidor cuando sea realmente necesario (checkAuthStatus)
  let initialState: Pick<AuthState, 'user' | 'token' | 'authStatus'> = {
    user: null,
    token: null,
    authStatus: 'checking',
  };

  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as AuthUser;
        // Confiar en el localStorage inicialmente
        // El checkAuthStatus se llamará cuando sea necesario (ProtectedRoute, etc.)
        initialState = {
          user,
          token,
          authStatus: 'authenticated', // Confiar en localStorage inicialmente
        };
      } catch {
        // Si hay error al parsear, mantener checking
      }
    } else {
      // No hay token, establecer como no autenticado directamente
      initialState = {
        user: null,
        token: null,
        authStatus: 'not-authenticated',
      };
    }
  } catch {
    // Si hay error, mantener checking
  }

  return {
    ...initialState,

    // Getters
    hasAnyRole: (mapped: PanelRole[]) => {
      const rawRoles = get().user?.roles ?? [];
      const roles = Array.isArray(rawRoles)
        ? rawRoles.map((r) => String(r).toLowerCase().trim())
        : [];
      return roles.some((role: string) => mapped.includes(role as PanelRole));
    },
    hasPanelAccess: () => {
      const rawRoles = get().user?.roles ?? [];
      const roles = Array.isArray(rawRoles)
        ? rawRoles.map((r) => String(r).toLowerCase().trim())
        : [];
      // Solo gerente, vendedor y superuser pueden acceder al panel
      const allowedRoles: PanelRole[] = ['gerente', 'vendedor', 'superuser'];
      return roles.some((role: string) =>
        allowedRoles.includes(role as PanelRole)
      );
    },
    isAdmin: () => {
      const rawRoles = get().user?.roles ?? [];
      const roles = Array.isArray(rawRoles)
        ? rawRoles.map((r) => String(r).toLowerCase().trim())
        : [];

      return roles.includes('gerente') || roles.includes('superuser');
    },

    // Actions
    login: async (email: string, password: string) => {
      try {
        const data = await loginAction(email, password);
        const { token, ...user } = data as AuthResponse;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        set({ user, token, authStatus: 'authenticated' });
        return true;
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, authStatus: 'not-authenticated' });
        return false;
      }
    },

    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, authStatus: 'not-authenticated' });
    },

    checkAuthStatus: async () => {
      // Si ya está autenticado y hay token válido, no hacer check-status constantemente
      // Solo verificar si está en estado 'checking' (al inicio de la app o cuando sea necesario)
      const currentStatus = get().authStatus;
      const currentToken = get().token ?? localStorage.getItem('token');
      const currentUser =
        get().user ??
        (() => {
          try {
            const stored = localStorage.getItem('user');
            return stored ? JSON.parse(stored) : null;
          } catch {
            return null;
          }
        })();

      // Si ya está autenticado y tiene token/usuario, no verificar constantemente
      // El interceptor de respuesta manejará la renovación automática cuando sea necesario
      if (currentStatus === 'authenticated' && currentToken && currentUser) {
        // No hacer verificación constante - confiar en el token
        // El interceptor de respuesta se encargará de renovar si es necesario
        return true;
      }

      // Si está en 'checking' o no autenticado, hacer verificación completa
      try {
        // Obtener token y usuario actuales del store o localStorage
        const token = currentToken ?? localStorage.getItem('token');
        const user =
          currentUser ??
          (() => {
            try {
              const stored = localStorage.getItem('user');
              return stored ? JSON.parse(stored) : null;
            } catch {
              return null;
            }
          })();

        // Si no hay token, no intentar verificar
        if (!token) {
          set({ user: null, token: null, authStatus: 'not-authenticated' });
          return false;
        }

        // Intentar verificar el token con el servidor
        const checkStatusData = await checkAuthAction();
        const newToken = checkStatusData.token ?? token;

        // Actualizar token si hay uno nuevo
        if (newToken && newToken !== token) {
          localStorage.setItem('token', newToken);
        }

        // Actualizar el usuario con los datos de check-status
        // check-status devuelve roles actualizados, así que los usamos
        const updatedUser = {
          id: checkStatusData.id,
          email: checkStatusData.email,
          roles: checkStatusData.roles,
          isActive: checkStatusData.isActive,
          // Mantener empleado y cliente si existen en check-status, sino usar los del store
          empleado:
            checkStatusData.empleado ?? user?.empleado ?? currentUser?.empleado,
          cliente:
            checkStatusData.cliente ?? user?.cliente ?? currentUser?.cliente,
        };

        // Guardar usuario actualizado en localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));

        set({
          user: updatedUser,
          token: newToken,
          authStatus: 'authenticated',
        });
        return true;
      } catch (error: any) {
        // Si el error es 401 (token expirado o inválido), limpiar sesión completamente
        const isUnauthorized =
          error?.response?.status === 401 ||
          error?.status === 401 ||
          (error?.message && error.message.includes('401'));

        if (isUnauthorized) {
          // Token expirado o inválido - limpiar todo y forzar nuevo login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          set({ user: null, token: null, authStatus: 'not-authenticated' });
          return false;
        }

        // Para otros errores (red, servidor no disponible), verificar si hay datos válidos
        const token = get().token ?? localStorage.getItem('token');
        const user =
          get().user ??
          (() => {
            try {
              const stored = localStorage.getItem('user');
              return stored ? JSON.parse(stored) : null;
            } catch {
              return null;
            }
          })();

        // Solo limpiar si realmente no hay token o usuario
        if (!token || !user) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          set({ user: null, token: null, authStatus: 'not-authenticated' });
          return false;
        }

        // Si hay token y usuario pero el error no es de autenticación,
        // mantener la sesión (puede ser un error temporal de red)
        set({
          user,
          token,
          authStatus: 'authenticated',
        });
        return true;
      }
    },
  };
});
