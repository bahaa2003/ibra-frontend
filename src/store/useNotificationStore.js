import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useNotificationStore = create(
  persist(
    (set) => ({
      notifications: [],

      addNotification: (payload) => {
        const next = {
          id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          title: payload?.title || 'Notification',
          message: payload?.message || '',
          type: payload?.type || 'info',
          createdAt: new Date().toISOString(),
          read: false,
        };

        set((state) => ({
          notifications: [next, ...state.notifications].slice(0, 30),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((item) => ({ ...item, read: true })),
        }));
      },

      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'notifications-storage',
    }
  )
);

export default useNotificationStore;
