import { create } from 'zustand';
import { loginAction } from '../actions/login.action';
import { checkAuthAction } from '../actions/check-status';
import type { AuthResponse } from '../types/auth.response';

type AuthStatus = 'authenticated' | 'not-authenticated' | 'checking';

type AuthState = {
  // Utils
  hasAnyRole(mapped: ('gerente' | 'vendedor')[]): boolean;
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

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  token: null,
  authStatus: 'checking',

  // Getters
  hasAnyRole: (mapped: ('gerente' | 'vendedor')[]) => {
    const rawRoles = get().user?.roles ?? [];
    const roles = Array.isArray(rawRoles)
      ? rawRoles.map((r) => String(r).toLowerCase().trim())
      : [];
    return roles.some((role: string) =>
      mapped.includes(role as 'gerente' | 'vendedor')
    );
  },
  isAdmin: () => {
    const rawRoles = get().user?.roles ?? [];
    const roles = Array.isArray(rawRoles)
      ? rawRoles.map((r) => String(r).toLowerCase().trim())
      : [];

    return roles.includes('gerente') || roles.includes('admin');
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
      const data = await checkAuthAction();
      const newToken = (data as any)?.token ?? localStorage.getItem('token');
      if (!newToken) throw new Error('No token');

      // Refresh token, keep user from storage (do not take roles from check-status)
      localStorage.setItem('token', newToken);
      const storedUser = localStorage.getItem('user');
      const parsedUser: AuthUser | null = storedUser
        ? (() => {
            try {
              return JSON.parse(storedUser) as AuthUser;
            } catch {
              return null;
            }
          })()
        : null;

      set({
        user: parsedUser ?? get().user,
        token: newToken,
        authStatus: 'authenticated',
      });
      return true;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, authStatus: 'not-authenticated' });
      return false;
    }
  },
}));
