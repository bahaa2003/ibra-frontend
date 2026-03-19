import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useAdminStore from './useAdminStore';
import apiClient from '../services/client';
import {
  getAccountAccessRoute,
  inferBlockedStatusFromError,
  isApprovedAccountStatus,
  normalizeAccountStatus,
} from '../utils/accountStatus';
import { getDefaultRouteForRole } from '../utils/authRoles';
import { formatAuthErrorMessage } from '../utils/authErrorMessages';
import { devLogger } from '../utils/devLogger';

const PROFILE_CACHE_TTL = 60 * 1000;
let profileRefreshRequest = null;

const buildAuthOutcome = (user) => {
  const status = normalizeAccountStatus(user?.status);
  return {
    ok: true,
    status,
    user: user || null,
    redirectTo: getAccountAccessRoute(status) || getDefaultRouteForRole(user?.role),
    canAccessApp: isApprovedAccountStatus(status),
  };
};

const buildBlockedOutcome = (status, user = null, error = null) => ({
  ok: false,
  status: normalizeAccountStatus(status),
  user,
  error,
  redirectTo: getAccountAccessRoute(status),
  canAccessApp: false,
});

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      blockedStatus: null,
      blockedUser: null,
      profileLastLoadedAt: 0,

      setBlockedAccess: (status, user = null) => {
        const normalizedStatus = normalizeAccountStatus(status);
        set({
          blockedStatus: normalizedStatus,
          blockedUser: user || null,
        });
        return buildBlockedOutcome(normalizedStatus, user);
      },

      clearBlockedAccess: () => {
        set({ blockedStatus: null, blockedUser: null });
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.auth.login(email, password);
          const outcome = buildAuthOutcome(response.user);

          set({
            user: response.user,
            token: response.token || null,
            isAuthenticated: true,
            isLoading: false,
            blockedStatus: outcome.canAccessApp ? null : outcome.status,
            blockedUser: outcome.canAccessApp ? null : response.user,
            profileLastLoadedAt: Date.now(),
          });

          return outcome;
        } catch (err) {
          const blockedStatus = inferBlockedStatusFromError(err);
          const formattedError = formatAuthErrorMessage(err, { action: 'login' });
          if (blockedStatus) {
            const blockedUser = email ? { email } : null;
            set({
              user: null,
              token: null,
              error: formattedError,
              isLoading: false,
              blockedStatus,
              blockedUser,
              isAuthenticated: false,
            });
            return buildBlockedOutcome(blockedStatus, blockedUser, formattedError);
          }

          set({
            user: null,
            token: null,
            error: formattedError,
            isLoading: false,
            isAuthenticated: false,
          });
          return { ok: false, error: formattedError };
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.auth.loginWithGoogle();
          const outcome = buildAuthOutcome(response.user);

          set({
            user: response.user,
            token: response.token || null,
            isAuthenticated: true,
            isLoading: false,
            blockedStatus: outcome.canAccessApp ? null : outcome.status,
            blockedUser: outcome.canAccessApp ? null : response.user,
            profileLastLoadedAt: Date.now(),
          });

          await useAdminStore.getState().loadUsers({ force: true });
          return outcome;
        } catch (err) {
          const blockedStatus = inferBlockedStatusFromError(err);
          const formattedError = formatAuthErrorMessage(err, { action: 'google' });
          if (blockedStatus) {
            set({
              user: null,
              token: null,
              error: formattedError,
              isLoading: false,
              blockedStatus,
              blockedUser: null,
              isAuthenticated: false,
            });
            return buildBlockedOutcome(blockedStatus, null, formattedError);
          }

          set({
            user: null,
            token: null,
            error: formattedError,
            isLoading: false,
            isAuthenticated: false,
          });
          return { ok: false, error: formattedError };
        }
      },

      signup: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.auth.register(userData);
          const status = normalizeAccountStatus(response?.user?.status);

          await useAdminStore.getState().loadUsers({ force: true });

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            blockedStatus: status,
            blockedUser: response?.user || {
              email: userData?.email,
              name: userData?.name || userData?.username,
            },
          });

          return {
            ok: true,
            status,
            user: response?.user || null,
            redirectTo: getAccountAccessRoute(status),
            canAccessApp: false,
          };
        } catch (err) {
          const formattedError = formatAuthErrorMessage(err, { action: 'register' });
          set({ error: formattedError, isLoading: false });
          return { ok: false, error: formattedError };
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          blockedStatus: null,
          blockedUser: null,
          profileLastLoadedAt: 0,
        });
      },

      updateUserSession: (updates) => {
        const { user } = get();
        if (user) {
          const nextUser = { ...user, ...updates };
          const nextStatus = normalizeAccountStatus(nextUser?.status);
          set({
            user: nextUser,
            blockedStatus: isApprovedAccountStatus(nextStatus) ? null : nextStatus,
            blockedUser: isApprovedAccountStatus(nextStatus) ? null : nextUser,
            profileLastLoadedAt: Date.now(),
          });
        }
      },

      refreshProfile: async ({ force = false } = {}) => {
        try {
          const currentState = get();
          const currentUserId = currentState.user?.id;
          if (!currentUserId) return null;

          const hasFreshProfile = (
            !force
            && currentState.user
            && (Date.now() - Number(currentState.profileLastLoadedAt || 0) < PROFILE_CACHE_TTL)
          );

          if (hasFreshProfile) {
            return currentState.user;
          }

          if (profileRefreshRequest) {
            return profileRefreshRequest;
          }

          profileRefreshRequest = apiClient.auth.getProfile(currentUserId)
            .then((profile) => {
              const nextStatus = normalizeAccountStatus(profile?.status);

              set((state) => ({
                user: { ...state.user, ...profile },
                blockedStatus: isApprovedAccountStatus(nextStatus) ? null : nextStatus,
                blockedUser: isApprovedAccountStatus(nextStatus) ? null : { ...state.user, ...profile },
                profileLastLoadedAt: Date.now(),
              }));

              return profile;
            })
            .catch((err) => {
              devLogger.warnUnlessBenign('[AuthStore] refreshProfile failed:', err, { once: true });
              return null;
            })
            .finally(() => {
              profileRefreshRequest = null;
            });

          return profileRefreshRequest;
        } catch (err) {
          devLogger.warnUnlessBenign('[AuthStore] refreshProfile failed:', err, { once: true });
          return null;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        blockedStatus: state.blockedStatus,
        blockedUser: state.blockedUser,
        profileLastLoadedAt: state.profileLastLoadedAt,
      }),
    }
  )
);

export default useAuthStore;
