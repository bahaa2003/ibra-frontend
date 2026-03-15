import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useAdminStore from './useAdminStore';
import apiClient from '../services/client';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.auth.login(email, password);
          set({
            user: response.user,
            token: response.token || null,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (err) {
          set({ error: err.message, isLoading: false });
          return false;
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.auth.loginWithGoogle();
          set({
            user: response.user,
            token: response.token || null,
            isAuthenticated: true,
            isLoading: false,
          });
          await useAdminStore.getState().loadUsers();
          return true;
        } catch (err) {
          set({ error: err.message, isLoading: false });
          return false;
        }
      },

      signup: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          await apiClient.auth.register(userData);
          await useAdminStore.getState().loadUsers();

          set({ isLoading: false });
          return true;
        } catch (err) {
          set({ error: err.message, isLoading: false });
          return false;
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      // Helper to update local session if user data changes (e.g. coins)
      updateUserSession: (updates) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },

      // Re-fetch user profile from backend to bust persist cache
      refreshProfile: async () => {
        try {
          const profile = await apiClient.auth.getProfile();
          // Merge new profile data with existing user state (preserve token, etc.)
          set((state) => ({
            user: { ...state.user, ...profile }
          }));
        } catch (err) {
          console.error('[AuthStore] refreshProfile failed:', err?.response?.data || err.message);
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
