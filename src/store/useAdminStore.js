import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockUsers } from '../data/mockData';
import apiClient from '../services/client';
import useNotificationStore from './useNotificationStore';
<<<<<<< HEAD
import { normalizeAccountStatus } from '../utils/accountStatus';

const USERS_CACHE_TTL = 90 * 1000;
let usersRequest = null;
=======
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41

const useAdminStore = create(
  persist(
    (set, get) => ({
      users: mockUsers,
<<<<<<< HEAD
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
=======

      loadUsers: async () => {
        try {
          const users = await apiClient.users.list();
          set({ users: Array.isArray(users) ? users : mockUsers });
        } catch (_error) {
          set({ users: mockUsers });
        }
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
      },

      addUser: async (user) => {
        const created = await apiClient.auth.register(user);
        const nextUser = created?.user || user;
        set((state) => ({
          users: [...state.users, nextUser],
<<<<<<< HEAD
          usersLastLoadedAt: Date.now(),
=======
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
        }));
      },

      updateUserStatus: async (userId, status, actor = null) => {
<<<<<<< HEAD
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
=======
        await apiClient.users.updateStatus(userId, status, actor);
        const target = (get().users || []).find((u) => u.id === userId);
        set(state => ({
          users: state.users.map(u => u.id === userId ? { ...u, status } : u)
        }));

        if (status === 'active') {
          useNotificationStore.getState().addNotification({
            title: 'قبول مستخدم',
            message: `تم قبول حساب ${target?.name || userId}`,
            type: 'success',
          });
        } else if (status === 'denied') {
          useNotificationStore.getState().addNotification({
            title: 'رفض مستخدم',
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
            message: `تم رفض حساب ${target?.name || userId}`,
            type: 'warning',
          });
        }
<<<<<<< HEAD

        return updatedUser || { ...(target || {}), status: nextStatus };
=======
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
      },

      updateUserCoins: async (userId, amountToAdd, actor = null, onSelfUpdate = null) => {
        await apiClient.users.addCoins(userId, amountToAdd, actor);
<<<<<<< HEAD
        set((state) => ({
          users: state.users.map((entry) => (
            entry.id === userId ? { ...entry, coins: entry.coins + amountToAdd } : entry
          )),
          usersLastLoadedAt: Date.now(),
=======
        set(state => ({
          users: state.users.map(u =>
            u.id === userId ? { ...u, coins: u.coins + amountToAdd } : u
          )
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
        }));

        if (typeof onSelfUpdate === 'function') onSelfUpdate();
      },

      updateUserGroup: async (userId, newGroup, actor = null) => {
        await apiClient.users.updateGroup(userId, newGroup, actor);
<<<<<<< HEAD
        set((state) => ({
          users: state.users.map((entry) => (
            entry.id === userId ? { ...entry, group: newGroup } : entry
          )),
          usersLastLoadedAt: Date.now(),
=======
        set(state => ({
          users: state.users.map(u =>
            u.id === userId ? { ...u, group: newGroup } : u
          )
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
        }));
      },

      updateUserRole: async (userId, newRole, actor = null) => {
        await apiClient.users.updateRole(userId, newRole, actor);
<<<<<<< HEAD
        set((state) => ({
          users: state.users.map((entry) => (
            entry.id === userId ? { ...entry, role: newRole } : entry
          )),
          usersLastLoadedAt: Date.now(),
=======
        set(state => ({
          users: state.users.map(u => (u.id === userId ? { ...u, role: newRole } : u))
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
        }));
      },

      updateUserCurrency: async (userId, currencyCode, actor = null) => {
<<<<<<< HEAD
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
=======
        await apiClient.users.updateCurrency(userId, currencyCode, actor);
        set((state) => ({
          users: state.users.map((u) => (u.id === userId ? { ...u, currency: currencyCode } : u)),
        }));
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
      },

      deleteUser: async (userId, actor = null) => {
        await apiClient.users.delete(userId, actor);
<<<<<<< HEAD
        set((state) => ({
          users: state.users.filter((entry) => entry.id !== userId),
          usersLastLoadedAt: Date.now(),
=======
        set(state => ({
          users: state.users.filter((u) => u.id !== userId)
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
        }));
      },

      updateUserAvatar: async (userId, avatar, actor = null, onSelfUpdate = null) => {
        await apiClient.users.updateAvatar(userId, avatar, actor);
<<<<<<< HEAD
        set((state) => ({
          users: state.users.map((entry) => (
            entry.id === userId ? { ...entry, avatar } : entry
          )),
          usersLastLoadedAt: Date.now(),
=======
        set(state => ({
          users: state.users.map((u) => (u.id === userId ? { ...u, avatar } : u))
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
        }));

        if (typeof onSelfUpdate === 'function') onSelfUpdate();
      },

      updateUserProfile: async (userId, profileUpdates, actor = null, onSelfUpdate = null) => {
        const updatedUser = await apiClient.users.updateProfile(userId, profileUpdates, actor);
<<<<<<< HEAD
        set((state) => ({
          users: state.users.map((entry) => (
            entry.id === userId ? { ...entry, ...updatedUser } : entry
          )),
          usersLastLoadedAt: Date.now(),
=======
        set(state => ({
          users: state.users.map((u) => (u.id === userId ? { ...u, ...updatedUser } : u))
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
        }));

        if (typeof onSelfUpdate === 'function') onSelfUpdate(updatedUser);
      },

<<<<<<< HEAD
      resetUserPassword: async (userId, actor = null, password = '') => apiClient.users.resetPassword(userId, actor, password),
=======
      resetUserPassword: async (userId, actor = null) => {
        return apiClient.users.resetPassword(userId, actor);
      }
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
    }),
    {
      name: 'admin-ui-storage',
      getStorage: () => localStorage,
    }
  )
);

export default useAdminStore;
