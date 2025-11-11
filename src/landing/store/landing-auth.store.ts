import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LandingAuthState {
  token: string | null;
  user: {
    id: number;
    email: string;
    clienteId?: number;
    nombre?: string;
  } | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: LandingAuthState['user']) => void;
  logout: () => void;
}

export const useLandingAuthStore = create<LandingAuthState>()(
  persist(
    (set) => {
      // Inicializar desde localStorage si existe
      const initToken =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const hasToken = !!initToken;

      // Intentar recuperar el usuario del localStorage si existe
      let initUser: LandingAuthState['user'] = null;
      if (typeof window !== 'undefined' && hasToken) {
        try {
          const userStr = localStorage.getItem('landing-user');
          if (userStr) {
            initUser = JSON.parse(userStr);
          }
        } catch {
          // Si hay error al parsear, mantener null
        }
      }

      return {
        token: initToken,
        user: initUser,
        isAuthenticated: hasToken && !!initUser,
        setAuth: (token, user) => {
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
            if (user) {
              localStorage.setItem('landing-user', JSON.stringify(user));
            }
          }
          set({ token, user, isAuthenticated: true });
        },
        logout: () => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('landing-user');
          }
          set({ token: null, user: null, isAuthenticated: false });
        },
      };
    },
    {
      name: 'landing-auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
