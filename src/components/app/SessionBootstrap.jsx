import { useEffect } from 'react';
import useAuthStore from '../../store/useAuthStore';
import useMediaStore from '../../store/useMediaStore';
import useGroupStore from '../../store/useGroupStore';
import useAdminStore from '../../store/useAdminStore';
import apiClient from '../../services/client';

const AUTH_FORCE_LOGOUT_EVENT = 'auth:force-logout';

const SessionBootstrap = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const userId = useAuthStore((state) => state.user?.id);
  const userRole = useAuthStore((state) => String(state.user?.role || '').toLowerCase());
  const refreshProfile = useAuthStore((state) => state.refreshProfile);
  const logout = useAuthStore((state) => state.logout);
  const loadProducts = useMediaStore((state) => state.loadProducts);
  const loadGroups = useGroupStore((state) => state.loadGroups);
  const loadUsers = useAdminStore((state) => state.loadUsers);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handler = (event) => {
      const reason = event?.detail?.reason;
      logout?.(reason);
    };

    window.addEventListener(AUTH_FORCE_LOGOUT_EVENT, handler);
    return () => window.removeEventListener(AUTH_FORCE_LOGOUT_EVENT, handler);
  }, [logout]);

  useEffect(() => {
    if (!isAuthenticated || !token || !userId) return undefined;

    let cancelled = false;

    const syncSession = async () => {
      try {
        await apiClient.auth.refreshSession?.();

        if (cancelled) return;

        await refreshProfile({ force: true });

        if (cancelled) return;

        await Promise.allSettled([
          loadProducts({ force: true }),
          userRole !== 'customer' ? loadGroups({ force: true }) : Promise.resolve(),
          userRole === 'admin' ? loadUsers({ force: true }) : Promise.resolve(),
        ]);
      } catch {
        // Non-blocking bootstrap.
      }
    };

    syncSession();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token, userId, userRole, refreshProfile, loadProducts, loadGroups, loadUsers]);

  return null;
};

export default SessionBootstrap;
