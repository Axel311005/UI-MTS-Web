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
      try {
        // Obtener token y usuario actuales del store o localStorage
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

        // Si no hay token, no intentar verificar
        if (!currentToken) {
          set({ user: null, token: null, authStatus: 'not-authenticated' });
          return false;
        }

        // Intentar verificar el token con el servidor
        const data = await checkAuthAction();
        const newToken = (data as any)?.token ?? currentToken;

        // Actualizar token si hay uno nuevo
        if (newToken) {
          localStorage.setItem('token', newToken);
        }

        // Mantener el usuario del store/localStorage (no sobrescribir con check-status)
        // El check-status puede no devolver los roles completos
        set({
          user: currentUser, // Mantener usuario original con todos sus roles
          token: newToken,
          authStatus: 'authenticated',
        });
        return true;
      } catch (error) {
        // Si falla check-status, NO limpiar si hay token y usuario válidos
        // Puede ser un error temporal de red o el servidor no disponible
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

        // Solo limpiar si realmente no hay token o usuario
        if (!currentToken || !currentUser) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          set({ user: null, token: null, authStatus: 'not-authenticated' });
          return false;
        }

        // Si hay token y usuario, mantener la sesión aunque check-status falle
        set({
          user: currentUser,
          token: currentToken,
          authStatus: 'authenticated',
        });
        return true; // Retornar true porque hay sesión válida en localStorage
      }
    },
  };
});
