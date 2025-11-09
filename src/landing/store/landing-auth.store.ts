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

      return {
        token: initToken,
        user: null,
        isAuthenticated: hasToken,
        setAuth: (token, user) => {
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
          }
          set({ token, user, isAuthenticated: true });
        },
        logout: () => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
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
