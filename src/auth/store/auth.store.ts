import { create } from 'zustand';

import { loginAction } from '../actions/login.action';
import type { User } from '../types/user.response';

import { checkAuthAction } from '../actions/check-status';

type AuthStatus = 'authenticated' | 'not-authenticated' | 'checking';

type AuthState = {
  // Utils
  hasAnyRole(mapped: ('gerente' | 'vendedor')[]): boolean;
  // Properties
  user: User | null;
  token: string | null;
  authStatus: AuthStatus;

  // Getters
  isAdmin: () => boolean;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuthStatus: () => Promise<boolean>;
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  token: null,
  authStatus: 'checking',

  // Getters
  hasAnyRole: (mapped: ('gerente' | 'vendedor')[]) => {
    const rawRoles =
      (get().user as any)?.roles ?? (get().user as any)?.user?.roles ?? [];
    const roles = Array.isArray(rawRoles)
      ? rawRoles.map((r) => String(r).toLowerCase().trim())
      : [];
    return roles.some((role: string) =>
      mapped.includes(role as 'gerente' | 'vendedor')
    );
  },
  isAdmin: () => {
    const rawRoles =
      (get().user as any)?.roles ?? (get().user as any)?.user?.roles ?? [];
    const roles = Array.isArray(rawRoles)
      ? rawRoles.map((r) => String(r).toLowerCase().trim())
      : [];

    return roles.includes('gerente') || roles.includes('admin');
  },

  // Actions
  login: async (email: string, password: string) => {
    try {
      const data = await loginAction(email, password);
      localStorage.setItem('token', data.token);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));

      try {
        const ok = await get().checkAuthStatus();
        if (ok) return true;
      } catch {
        // ignore and fallback
      }

      // 3) Fallback to login payload if check-status is not available
      set({ user: data.user, token: data.token, authStatus: 'authenticated' });
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
      const data: any = await checkAuthAction();

      // Accept both shapes: { user, token } OR { id, email, roles, token }
      const resolvedToken: string | null =
        data?.token ?? localStorage.getItem('token');
      const resolvedUser: User | null = data?.user
        ? (data.user as User)
        : data?.id && data?.email
        ? {
            id: String(data.id),
            email: String(data.email),
            isActive: Boolean(data.isActive ?? true),
            roles: Array.isArray(data.roles)
              ? (data.roles as any[]).map((r) => String(r))
              : [],
          }
        : null;

      if (!resolvedToken || !resolvedUser) {
        throw new Error('Invalid check-status response');
      }

      // Persist to storage
      localStorage.setItem('token', resolvedToken);
      localStorage.setItem('user', JSON.stringify(resolvedUser));

      set({
        user: resolvedUser,
        token: resolvedToken,
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
