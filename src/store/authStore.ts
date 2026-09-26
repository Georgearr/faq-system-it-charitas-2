import { create } from 'zustand';
import { User } from '@/types';
import { authService } from '@/services/authService';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithPhone: (phone: string, pass?: string) => Promise<{ challengeId?: string }>;
  loginWithGoogle: (credential: string) => Promise<void>;
  verifyEmail: (challengeId: string, code: string) => Promise<void>;
  verifyPhone: (challengeId: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;

  // Role helper accessors
  isGuest: () => boolean;
  isUser: () => boolean;
  isITStaff: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  error: null,

  initialize: async () => {
    try {
      set({ isLoading: true, error: null });
      const current = await authService.getCurrentUser();
      set({ user: current, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  loginWithEmail: async (email: string, pass: string) => {
    try {
      set({ isLoading: true, error: null });
      const res = await authService.loginWithEmail(email, pass);
      set({ user: res.user, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Login failed',
        isLoading: false,
      });
      throw err;
    }
  },

  loginWithPhone: async (phone: string, pass?: string) => {
    try {
      set({ isLoading: true, error: null });
      const res = await authService.loginWithPhone(phone, pass);
      if (res.auth) {
        set({ user: res.auth.user, isLoading: false });
      } else {
        set({ isLoading: false });
      }
      return { challengeId: res.challengeId };
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Phone login failed',
        isLoading: false,
      });
      throw err;
    }
  },

  loginWithGoogle: async (credential: string) => {
    try {
      set({ isLoading: true, error: null });
      const res = await authService.loginWithGoogle(credential);
      set({ user: res.user, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Google authentication failed',
        isLoading: false,
      });
      throw err;
    }
  },

  verifyEmail: async (challengeId: string, code: string) => {
    try {
      set({ isLoading: true, error: null });
      const res = await authService.verifyEmail(challengeId, code);
      set({ user: res.user, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Email verification failed',
        isLoading: false,
      });
      throw err;
    }
  },

  verifyPhone: async (challengeId: string, code: string) => {
    try {
      set({ isLoading: true, error: null });
      const res = await authService.verifyPhone(challengeId, code);
      set({ user: res.user, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Phone verification failed',
        isLoading: false,
      });
      throw err;
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await authService.logout();
      set({ user: null, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  setUser: (user: User | null) => set({ user }),
  clearError: () => set({ error: null }),

  isGuest: () => !get().user,
  isUser: () => !!get().user && (get().user?.role === 'user' || get().user?.role === 'it_staff' || get().user?.role === 'admin'),
  isITStaff: () => !!get().user && (get().user?.role === 'it_staff' || get().user?.role === 'admin'),
  isAdmin: () => !!get().user && get().user?.role === 'admin',
}));
