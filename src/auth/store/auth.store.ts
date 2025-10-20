import { create } from 'zustand';

import { loginAction } from '../actions/login.action';
import type { User } from '../types/user.response';

import { checkAuthAction } from '../actions/check-status';

type AuthStatus = 'authenticated' | 'not-authenticated' | 'checking';

type AuthState = {
  hasAnyRole(mapped: ("gerente" | "vendedor")[]): unknown;
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
  isAdmin: () => {
    const roles = get().user?.roles || [];
    return roles.includes('gerente');
  },

  // Actions
  login: async (email: string, password: string) => {
    try {
      const data = await loginAction(email, password);

      localStorage.setItem('token', data.token);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));

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
      const { user, token } = await checkAuthAction();
      // Persist to storage
      localStorage.setItem('token', token);
      if (user) localStorage.setItem('user', JSON.stringify(user));

      set({ user, token, authStatus: 'authenticated' });
      return true;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, authStatus: 'not-authenticated' });
      return false;
    }
  },
}));
