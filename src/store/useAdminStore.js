import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockUsers } from '../data/mockData';
import apiClient from '../services/client';
import useNotificationStore from './useNotificationStore';
import { normalizeAccountStatus } from '../utils/accountStatus';

const USERS_CACHE_TTL = 90 * 1000;
let usersRequest = null;

const useAdminStore = create(
  persist(
    (set, get) => ({
      users: mockUsers,
      usersLastLoadedAt: 0,
      isLoadingUsers: false,

      loadUsers: async ({ force = false } = {}) => {
        const { users, usersLastLoadedAt } = get();
        const hasUsers = Array.isArray(users) && users.length > 0;
        const hasFreshUsers = hasUsers && (Date.now() - Number(usersLastLoadedAt || 0) < USERS_CACHE_TTL);

        if (!force && hasFreshUsers) {
          return users;
        }

        if (usersRequest) {
          return usersRequest;
        }

        set({ isLoadingUsers: true });

        usersRequest = apiClient.users.list()
          .then((items) => {
            const nextUsers = Array.isArray(items) ? items : mockUsers;
            set({
              users: nextUsers,
              usersLastLoadedAt: Date.now(),
              isLoadingUsers: false,
            });
            return nextUsers;
          })
          .catch((_error) => {
            if (!hasUsers) {
              set({ users: mockUsers });
            }
            set({ isLoadingUsers: false });
            return get().users;
          })
          .finally(() => {
            usersRequest = null;
          });

        return usersRequest;
      },

      addUser: async (user) => {
        const created = await apiClient.auth.register(user);
        const nextUser = created?.user || user;
        set((state) => ({
          users: [...state.users, nextUser],
          usersLastLoadedAt: Date.now(),
        }));
      },

      updateUserStatus: async (userId, status, actor = null) => {
        const updatedUser = await apiClient.users.updateStatus(userId, status, actor);
        const target = (get().users || []).find((entry) => entry.id === userId);
        const nextStatus = normalizeAccountStatus(updatedUser?.status || status);

        set((state) => ({
          users: state.users.map((entry) => (
            entry.id === userId ? { ...entry, ...(updatedUser || {}), status: nextStatus } : entry
          )),
          usersLastLoadedAt: Date.now(),
        }));

        if (nextStatus === 'approved') {
          useNotificationStore.getState().addNotification({
            title: 'تمت الموافقة على الحساب',
            message: `تمت الموافقة على حساب ${target?.name || userId}`,
            type: 'success',
          });
        } else if (nextStatus === 'rejected') {
          useNotificationStore.getState().addNotification({
            title: 'تم رفض الحساب',
            message: `تم رفض حساب ${target?.name || userId}`,
            type: 'warning',
          });
        }

        return updatedUser || { ...(target || {}), status: nextStatus };
      },

      updateUserCoins: async (userId, amountToAdd, actor = null, onSelfUpdate = null) => {
        await apiClient.users.addCoins(userId, amountToAdd, actor);
        set((state) => ({
          users: state.users.map((entry) => (
            entry.id === userId ? { ...entry, coins: entry.coins + amountToAdd } : entry
          )),
          usersLastLoadedAt: Date.now(),
        }));

        if (typeof onSelfUpdate === 'function') onSelfUpdate();
      },

      updateUserGroup: async (userId, newGroup, actor = null) => {
        await apiClient.users.updateGroup(userId, newGroup, actor);
        set((state) => ({
          users: state.users.map((entry) => (
            entry.id === userId ? { ...entry, group: newGroup } : entry
          )),
          usersLastLoadedAt: Date.now(),
        }));
      },

      updateUserRole: async (userId, newRole, actor = null) => {
        await apiClient.users.updateRole(userId, newRole, actor);
        set((state) => ({
          users: state.users.map((entry) => (
            entry.id === userId ? { ...entry, role: newRole } : entry
          )),
          usersLastLoadedAt: Date.now(),
        }));
      },

      updateUserCurrency: async (userId, currencyCode, actor = null) => {
        // 1. Call the API — backend converts balance + returns updated user
        await apiClient.users.updateCurrency(userId, currencyCode, actor);

        // 2. Force re-fetch the entire users list from DB (bulletproof — no manual patching)
        await get().loadUsers({ force: true });

        // 3. If the updated user is the currently logged-in user,
        //    force re-fetch their profile so navbar/balance updates instantly.
        try {
          const useAuthStore = (await import('./useAuthStore')).default;
          const currentUser = useAuthStore.getState().user;
          if (currentUser && (currentUser.id === userId || currentUser._id === userId)) {
            await useAuthStore.getState().refreshProfile({ force: true });
          }
        } catch (_) { /* ignore if auth store unavailable */ }
      },

      deleteUser: async (userId, actor = null) => {
        await apiClient.users.delete(userId, actor);
        set((state) => ({
          users: state.users.filter((entry) => entry.id !== userId),
          usersLastLoadedAt: Date.now(),
        }));
      },

      updateUserAvatar: async (userId, avatar, actor = null, onSelfUpdate = null) => {
        await apiClient.users.updateAvatar(userId, avatar, actor);
        set((state) => ({
          users: state.users.map((entry) => (
            entry.id === userId ? { ...entry, avatar } : entry
          )),
          usersLastLoadedAt: Date.now(),
        }));

        if (typeof onSelfUpdate === 'function') onSelfUpdate();
      },

      updateUserProfile: async (userId, profileUpdates, actor = null, onSelfUpdate = null) => {
        const updatedUser = await apiClient.users.updateProfile(userId, profileUpdates, actor);
        set((state) => ({
          users: state.users.map((entry) => (
            entry.id === userId ? { ...entry, ...updatedUser } : entry
          )),
          usersLastLoadedAt: Date.now(),
        }));

        if (typeof onSelfUpdate === 'function') onSelfUpdate(updatedUser);
      },

      resetUserPassword: async (userId, actor = null, password = '') => apiClient.users.resetPassword(userId, actor, password),
    }),
    {
      name: 'admin-ui-storage',
      getStorage: () => localStorage,
    }
  )
);

export default useAdminStore;
