import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockUsers } from '../data/mockData';
import apiClient from '../services/client';
import useNotificationStore from './useNotificationStore';

const useAdminStore = create(
  persist(
    (set, get) => ({
      users: mockUsers,

      loadUsers: async () => {
        try {
          const users = await apiClient.users.list();
          set({ users: Array.isArray(users) ? users : mockUsers });
        } catch (_error) {
          set({ users: mockUsers });
        }
      },

      addUser: async (user) => {
        const created = await apiClient.auth.register(user);
        const nextUser = created?.user || user;
        set((state) => ({
          users: [...state.users, nextUser],
        }));
      },

      updateUserStatus: async (userId, status, actor = null) => {
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
            message: `تم رفض حساب ${target?.name || userId}`,
            type: 'warning',
          });
        }
      },

      updateUserCoins: async (userId, amountToAdd, actor = null, onSelfUpdate = null) => {
        await apiClient.users.addCoins(userId, amountToAdd, actor);
        set(state => ({
          users: state.users.map(u =>
            u.id === userId ? { ...u, coins: u.coins + amountToAdd } : u
          )
        }));

        if (typeof onSelfUpdate === 'function') onSelfUpdate();
      },

      updateUserGroup: async (userId, newGroup, actor = null) => {
        await apiClient.users.updateGroup(userId, newGroup, actor);
        set(state => ({
          users: state.users.map(u =>
            u.id === userId ? { ...u, group: newGroup } : u
          )
        }));
      },

      updateUserRole: async (userId, newRole, actor = null) => {
        await apiClient.users.updateRole(userId, newRole, actor);
        set(state => ({
          users: state.users.map(u => (u.id === userId ? { ...u, role: newRole } : u))
        }));
      },

      updateUserCurrency: async (userId, currencyCode, actor = null) => {
        await apiClient.users.updateCurrency(userId, currencyCode, actor);
        set((state) => ({
          users: state.users.map((u) => (u.id === userId ? { ...u, currency: currencyCode } : u)),
        }));
      },

      deleteUser: async (userId, actor = null) => {
        await apiClient.users.delete(userId, actor);
        set(state => ({
          users: state.users.filter((u) => u.id !== userId)
        }));
      },

      updateUserAvatar: async (userId, avatar, actor = null, onSelfUpdate = null) => {
        await apiClient.users.updateAvatar(userId, avatar, actor);
        set(state => ({
          users: state.users.map((u) => (u.id === userId ? { ...u, avatar } : u))
        }));

        if (typeof onSelfUpdate === 'function') onSelfUpdate();
      },

      updateUserProfile: async (userId, profileUpdates, actor = null, onSelfUpdate = null) => {
        const updatedUser = await apiClient.users.updateProfile(userId, profileUpdates, actor);
        set(state => ({
          users: state.users.map((u) => (u.id === userId ? { ...u, ...updatedUser } : u))
        }));

        if (typeof onSelfUpdate === 'function') onSelfUpdate(updatedUser);
      },

      resetUserPassword: async (userId, actor = null) => {
        return apiClient.users.resetPassword(userId, actor);
      }
    }),
    {
      name: 'admin-ui-storage',
      getStorage: () => localStorage,
    }
  )
);

export default useAdminStore;
