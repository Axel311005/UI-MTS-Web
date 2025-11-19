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
        initialState = {
          user,
          token,
          authStatus: 'authenticated',
        };
      } catch {
        // Si hay error al parsear, mantener checking
      }
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
      // Solo verificar si está en estado 'checking' (al inicio de la app)
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

      // Si ya está autenticado y tiene token/usuario, mantener la sesión
      // Solo verificar con el servidor si está en estado 'checking' (inicio de app)
      if (currentStatus === 'authenticated' && currentToken && currentUser) {
        // Si ya está autenticado, solo intentar renovar el token silenciosamente
        // pero no cambiar el estado si falla (puede ser error de red)
        try {
          const data = await checkAuthAction();
          const newToken = (data as any)?.token ?? currentToken;

          // Si hay un nuevo token, actualizarlo
          if (newToken && newToken !== currentToken) {
            localStorage.setItem('token', newToken);
            set({ token: newToken });
          }

          return true;
        } catch (error: any) {
          // Si el error es 401 (token realmente expirado), limpiar sesión
          const isUnauthorized =
            error?.response?.status === 401 ||
            error?.status === 401 ||
            (error?.message && error.message.includes('401'));

          if (isUnauthorized) {
            // Token realmente expirado - limpiar todo
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            set({ user: null, token: null, authStatus: 'not-authenticated' });
            return false;
          }

          // Para otros errores (red, servidor), mantener la sesión
          // El usuario ya está autenticado y puede seguir trabajando
          return true;
        }
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
        const data = await checkAuthAction();
        const newToken = (data as any)?.token ?? token;

        // Actualizar token si hay uno nuevo
        if (newToken) {
          localStorage.setItem('token', newToken);
        }

        // Mantener el usuario del store/localStorage (no sobrescribir con check-status)
        // El check-status puede no devolver los roles completos
        set({
          user: user ?? currentUser, // Mantener usuario original con todos sus roles
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
