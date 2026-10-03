import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '../services/client';
import {
  getAccountAccessRoute,
  inferBlockedStatusFromError,
  isApprovedAccountStatus,
  normalizeAccountStatus,
} from '../utils/accountStatus';
import { getDefaultRouteForRole, normalizeAuthUser, userHasPermission } from '../utils/authRoles';
import { formatAuthErrorMessage } from '../utils/authErrorMessages';
import { devLogger } from '../utils/devLogger';

const PROFILE_CACHE_TTL = 60 * 1000;
let profileRefreshRequest = null;

const buildAuthOutcome = (user) => {
  const normalizedUser = normalizeAuthUser(user);
  const status = normalizeAccountStatus(normalizedUser?.status);
  const profileCompletionRequired = normalizedUser?.profileCompletionRequired === true;
  return {
    ok: true,
    status,
    user: normalizedUser,
    redirectTo: getAccountAccessRoute(status) || (profileCompletionRequired ? '/complete-phone' : getDefaultRouteForRole(normalizedUser?.role)),
    canAccessApp: isApprovedAccountStatus(status) && !profileCompletionRequired,
  };
};

const buildBlockedOutcome = (status, user = null, error = null) => {
  const normalizedStatus = normalizeAccountStatus(status);
  return {
    ok: false,
    status: normalizedStatus,
    user: normalizeAuthUser(user),
    error,
    redirectTo: getAccountAccessRoute(normalizedStatus),
    canAccessApp: false,
  };
};

const buildVerificationRequiredOutcome = (user = null) => ({
  ok: true,
  status: normalizeAccountStatus('verification_required'),
  user,
  error: null,
  redirectTo: getAccountAccessRoute('verification_required'),
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
      twoFactorChallenge: null,
      googleProfileCompletionToken: null,
      profileLastLoadedAt: 0,

      hasPermission: (permission) => userHasPermission(get().user, permission),

      hasAnyPermission: (permissions = []) => (
        (Array.isArray(permissions) ? permissions : [permissions])
          .filter(Boolean)
          .some((permission) => userHasPermission(get().user, permission))
      ),

      hasAllPermissions: (permissions = []) => (
        (Array.isArray(permissions) ? permissions : [permissions])
          .filter(Boolean)
          .every((permission) => userHasPermission(get().user, permission))
      ),

      setBlockedAccess: (status, user = null) => {
        const normalizedStatus = normalizeAccountStatus(status);
        const normalizedUser = normalizeAuthUser(user);
        set({
          blockedStatus: normalizedStatus,
          blockedUser: normalizedUser,
        });
        return buildBlockedOutcome(normalizedStatus, normalizedUser);
      },

      clearBlockedAccess: () => {
        set({ blockedStatus: null, blockedUser: null });
      },

      login: async (email, password) => {
        set({
          isLoading: true,
          error: null,
          blockedStatus: null,
          blockedUser: null,
          twoFactorChallenge: null,
          googleProfileCompletionToken: null,
        });
        try {
          const response = await apiClient.auth.login(email, password);

          if (response?.requires2FA) {
            const challenge = {
              requires2FA: true,
              tempToken: response.tempToken,
              requestId: response.requestId,
              email: response.email || email,
            };

            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              blockedStatus: null,
              blockedUser: null,
              twoFactorChallenge: challenge,
              profileLastLoadedAt: 0,
            });

            return {
              ok: true,
              requires2FA: true,
              ...challenge,
              canAccessApp: false,
            };
          }

          const outcome = buildAuthOutcome(response.user);

          set({
            user: outcome.user,
            token: response.token || null,
            isAuthenticated: true,
            isLoading: false,
            blockedStatus: outcome.canAccessApp ? null : outcome.status,
            blockedUser: outcome.canAccessApp ? null : outcome.user,
            twoFactorChallenge: null,
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
              twoFactorChallenge: null,
              isAuthenticated: false,
              profileLastLoadedAt: 0,
            });
            return buildBlockedOutcome(blockedStatus, blockedUser, formattedError);
          }

          set({
            user: null,
            token: null,
            error: formattedError,
            isLoading: false,
            isAuthenticated: false,
            blockedStatus: null,
            blockedUser: null,
            twoFactorChallenge: null,
            profileLastLoadedAt: 0,
          });
          return { ok: false, error: formattedError };
        }
      },

      verifyTwoFactorChallenge: async (otp) => {
        const challenge = get().twoFactorChallenge;
        if (!challenge?.tempToken) {
          const message = 'Two-factor verification session is missing or expired.';
          set({ error: message, isLoading: false });
          return { ok: false, error: message };
        }

        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.auth.verify2FA({
            tempToken: challenge.tempToken,
            requestId: challenge.requestId,
            otp,
          });
          const outcome = buildAuthOutcome(response.user);

          set({
            user: outcome.user,
            token: response.token || null,
            isAuthenticated: true,
            isLoading: false,
            blockedStatus: outcome.canAccessApp ? null : outcome.status,
            blockedUser: outcome.canAccessApp ? null : outcome.user,
            twoFactorChallenge: null,
            profileLastLoadedAt: Date.now(),
          });

          return outcome;
        } catch (err) {
          const formattedError = formatAuthErrorMessage(err, { action: 'login' });
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

      clearTwoFactorChallenge: () => {
        set({
          twoFactorChallenge: null,
          isLoading: false,
          error: null,
        });
      },

      loginWithGoogle: async () => {
        set({
          isLoading: true,
          error: null,
          blockedStatus: null,
          blockedUser: null,
          twoFactorChallenge: null,
          googleProfileCompletionToken: null,
        });
        try {
          const response = await apiClient.auth.loginWithGoogle();
          if (response?.profileCompletionToken) {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              blockedStatus: null,
              blockedUser: null,
              twoFactorChallenge: null,
              googleProfileCompletionToken: response.profileCompletionToken,
              profileLastLoadedAt: 0,
            });
            return {
              ok: true,
              profileCompletionRequired: true,
              redirectTo: '/complete-phone?mode=google',
              canAccessApp: false,
            };
          }
          if (response?.redirectTo && !response?.user && !response?.token) {
            const callbackStatus = normalizeAccountStatus(response?.status);

            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              blockedStatus: callbackStatus || null,
              blockedUser: null,
              twoFactorChallenge: null,
              googleProfileCompletionToken: null,
              profileLastLoadedAt: 0,
            });

            return {
              ok: false,
              status: callbackStatus,
              user: null,
              error: null,
              redirectTo: response.redirectTo,
              canAccessApp: false,
            };
          }

          const outcome = buildAuthOutcome(response.user);

          set({
            user: outcome.user,
            token: response.token || null,
            isAuthenticated: true,
            isLoading: false,
            blockedStatus: outcome.canAccessApp ? null : outcome.status,
            blockedUser: outcome.canAccessApp ? null : outcome.user,
            twoFactorChallenge: null,
            googleProfileCompletionToken: null,
            profileLastLoadedAt: Date.now(),
          });

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
              twoFactorChallenge: null,
              googleProfileCompletionToken: null,
              isAuthenticated: false,
              profileLastLoadedAt: 0,
            });
            return buildBlockedOutcome(blockedStatus, null, formattedError);
          }

          set({
            user: null,
            token: null,
            error: formattedError,
            isLoading: false,
            isAuthenticated: false,
            blockedStatus: null,
            blockedUser: null,
            twoFactorChallenge: null,
            googleProfileCompletionToken: null,
            profileLastLoadedAt: 0,
          });
          return { ok: false, error: formattedError };
        }
      },

      signup: async (userData) => {
        set({
          isLoading: true,
          error: null,
          blockedStatus: null,
          blockedUser: null,
          twoFactorChallenge: null,
          googleProfileCompletionToken: null,
        });
        try {
          const response = await apiClient.auth.register(userData);
          const status = normalizeAccountStatus(response?.user?.status);
          const requiresEmailVerification = response?.user?.verified === false
            && String(response?.user?.signupMethod || userData?.signupMethod || 'email').toLowerCase() !== 'google';

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            blockedStatus: requiresEmailVerification ? 'verification_required' : status,
            blockedUser: normalizeAuthUser(response?.user || {
              email: userData?.email,
              name: userData?.name || userData?.username,
            }),
            twoFactorChallenge: null,
          });

          if (requiresEmailVerification) {
            return buildVerificationRequiredOutcome(response?.user || {
              email: userData?.email,
              name: userData?.name || userData?.username,
            });
          }

          return {
            ok: true,
            status,
            user: response?.user || null,
            redirectTo: getAccountAccessRoute(status),
            canAccessApp: false,
          };
        } catch (err) {
          const formattedError = formatAuthErrorMessage(err, { action: 'register' });
          set({
            error: formattedError,
            isLoading: false,
            blockedStatus: null,
            blockedUser: null,
            twoFactorChallenge: null,
          });
          return { ok: false, error: formattedError };
        }
      },

      completePhone: async (phone) => {
        set({ isLoading: true, error: null });
        try {
          const user = await apiClient.auth.completePhone(phone);
          const outcome = buildAuthOutcome(user);
          set({
            user: outcome.user,
            isLoading: false,
            blockedStatus: outcome.canAccessApp ? null : outcome.status,
            blockedUser: outcome.canAccessApp ? null : outcome.user,
            profileLastLoadedAt: Date.now(),
          });
          return outcome;
        } catch (err) {
          const error = formatAuthErrorMessage(err, { action: 'register' });
          set({ isLoading: false, error });
          return { ok: false, error };
        }
      },

      completeGooglePhone: async (phone) => {
        const completionToken = get().googleProfileCompletionToken;
        if (!completionToken) {
          return { ok: false, error: 'Your Google completion session has expired. Please sign in again.' };
        }

        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.auth.completeGoogleProfile({ completionToken, phone });
          const outcome = buildAuthOutcome(response.user);
          const isActiveSession = Boolean(response.token);
          set({
            user: isActiveSession ? outcome.user : null,
            token: response.token || null,
            isAuthenticated: isActiveSession,
            isLoading: false,
            blockedStatus: isActiveSession && outcome.canAccessApp ? null : outcome.status,
            blockedUser: isActiveSession && outcome.canAccessApp ? null : outcome.user,
            googleProfileCompletionToken: null,
            profileLastLoadedAt: isActiveSession ? Date.now() : 0,
          });
          return outcome;
        } catch (err) {
          const error = formatAuthErrorMessage(err, { action: 'google' });
          set({ isLoading: false, error });
          return { ok: false, error };
        }
      },

      logout: async () => {
        profileRefreshRequest = null;
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          blockedStatus: null,
          blockedUser: null,
          twoFactorChallenge: null,
          googleProfileCompletionToken: null,
          profileLastLoadedAt: 0,
        });

        try {
          await apiClient.auth.logout?.();
        } catch {
          // Frontend state reset above remains the primary guard.
        }
      },

      updateUserSession: (updates) => {
        const { user } = get();
        if (user) {
          const nextUser = normalizeAuthUser({ ...user, ...updates });
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
                user: normalizeAuthUser({ ...state.user, ...profile }),
                blockedStatus: isApprovedAccountStatus(nextStatus) ? null : nextStatus,
                blockedUser: isApprovedAccountStatus(nextStatus) ? null : normalizeAuthUser({ ...state.user, ...profile }),
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
        user: normalizeAuthUser(state.user),
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        blockedStatus: state.blockedStatus,
        blockedUser: state.blockedUser,
        profileLastLoadedAt: state.profileLastLoadedAt,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState || {}),
        user: normalizeAuthUser(persistedState?.user),
        blockedUser: normalizeAuthUser(persistedState?.blockedUser),
      }),
    }
  )
);

export default useAuthStore;
