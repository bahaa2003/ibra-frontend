import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '../services/client';

const NOTIFICATIONS_CACHE_TTL = 30 * 1000;

let notificationsRequest = null;

const resolveNotificationId = (notification) => notification?._id || notification?.id || '';

const normalizeNotification = (notification = {}) => {
  const id = resolveNotificationId(notification)
    || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  return {
    ...notification,
    id,
    _id: undefined,
    title: notification.title || 'Notification',
    message: notification.message || '',
    type: notification.type || 'info',
    route: notification.route || '',
    entityType: notification.entityType || '',
    entityId: notification.entityId || '',
    metadata: notification.metadata && typeof notification.metadata === 'object'
      ? notification.metadata
      : {},
    createdAt: notification.createdAt || new Date().toISOString(),
    read: Boolean(notification.read ?? notification.isRead),
    isRead: Boolean(notification.isRead ?? notification.read),
  };
};

const countUnread = (notifications) => (
  Array.isArray(notifications)
    ? notifications.filter((item) => !item.read && !item.isRead).length
    : 0
);

const canUseNotificationsApi = () => Boolean(apiClient?.notifications);

const useNotificationStore = create(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      pagination: null,
      isLoading: false,
      error: null,
      lastLoadedAt: 0,

      fetchNotifications: async ({ page = 1, limit = 20, isRead, type, force = false } = {}) => {
        if (!canUseNotificationsApi()) {
          return get().notifications;
        }

        const hasFreshCache = (
          !force
          && Array.isArray(get().notifications)
          && get().notifications.length > 0
          && Date.now() - Number(get().lastLoadedAt || 0) < NOTIFICATIONS_CACHE_TTL
        );

        if (hasFreshCache) {
          return get().notifications;
        }

        if (notificationsRequest) {
          return notificationsRequest;
        }

        set({ isLoading: true, error: null });

        notificationsRequest = apiClient.notifications
          .list({ page, limit, isRead, type })
          .then((result) => {
            const nextNotifications = (result?.notifications || []).map(normalizeNotification);
            const nextUnreadCount = Number.isFinite(Number(result?.unreadCount))
              ? Number(result.unreadCount)
              : countUnread(nextNotifications);

            set({
              notifications: nextNotifications,
              unreadCount: nextUnreadCount,
              pagination: result?.pagination || null,
              isLoading: false,
              error: null,
              lastLoadedAt: Date.now(),
            });

            return nextNotifications;
          })
          .catch((error) => {
            set({
              isLoading: false,
              error: error?.message || 'Unable to load notifications',
            });
            throw error;
          })
          .finally(() => {
            notificationsRequest = null;
          });

        return notificationsRequest;
      },

      fetchUnreadCount: async () => {
        if (!apiClient?.notifications?.unreadCount) {
          return get().unreadCount;
        }

        try {
          const unreadCount = await apiClient.notifications.unreadCount();
          set({ unreadCount: Number(unreadCount) || 0, error: null });
          return Number(unreadCount) || 0;
        } catch (error) {
          set({ error: error?.message || 'Unable to load notification count' });
          throw error;
        }
      },

      addNotification: (payload) => {
        const next = normalizeNotification({
          ...payload,
          id: payload?.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          createdAt: payload?.createdAt || new Date().toISOString(),
          read: payload?.read ?? false,
        });

        set((state) => {
          const notifications = [next, ...state.notifications].slice(0, 30);
          return {
            notifications,
            unreadCount: countUnread(notifications),
          };
        });
      },

      markAllAsRead: async () => {
        const previousNotifications = get().notifications;
        const previousUnreadCount = get().unreadCount;

        set((state) => ({
          notifications: state.notifications.map((item) => ({
            ...item,
            read: true,
            isRead: true,
          })),
          unreadCount: 0,
          error: null,
        }));

        if (!apiClient?.notifications?.markAllAsRead) {
          return { modifiedCount: previousUnreadCount };
        }

        try {
          return await apiClient.notifications.markAllAsRead();
        } catch (error) {
          set({
            notifications: previousNotifications,
            unreadCount: previousUnreadCount,
            error: error?.message || 'Unable to mark notifications as read',
          });
          throw error;
        }
      },

      markAsRead: async (id) => {
        const notificationId = String(id || '').trim();
        if (!notificationId) return null;

        const previousNotifications = get().notifications;
        const previousUnreadCount = get().unreadCount;
        const target = previousNotifications.find((item) => item.id === notificationId);

        set((state) => {
          const notifications = state.notifications.map((item) => (
            item.id === notificationId
              ? { ...item, read: true, isRead: true }
              : item
          ));

          return {
            notifications,
            unreadCount: countUnread(notifications),
            error: null,
          };
        });

        const isLocalOnlyNotification = notificationId.startsWith('notif-');
        if (isLocalOnlyNotification || !apiClient?.notifications?.markAsRead) {
          return target ? { ...target, read: true, isRead: true } : null;
        }

        try {
          const updated = await apiClient.notifications.markAsRead(notificationId);
          const normalized = normalizeNotification(updated);
          set((state) => {
            const notifications = state.notifications.map((item) => (
              item.id === notificationId ? normalized : item
            ));

            return {
              notifications,
              unreadCount: countUnread(notifications),
            };
          });
          return normalized;
        } catch (error) {
          set({
            notifications: previousNotifications,
            unreadCount: previousUnreadCount,
            error: error?.message || 'Unable to mark notification as read',
          });
          throw error;
        }
      },

      clearNotifications: async () => {
        const previousNotifications = get().notifications;
        const previousUnreadCount = get().unreadCount;

        set((state) => {
          const notifications = state.notifications.filter((item) => !item.read && !item.isRead);
          return {
            notifications,
            unreadCount: countUnread(notifications),
            error: null,
          };
        });

        if (!apiClient?.notifications?.clearRead) {
          return { deletedCount: previousNotifications.length - get().notifications.length };
        }

        try {
          return await apiClient.notifications.clearRead();
        } catch (error) {
          set({
            notifications: previousNotifications,
            unreadCount: previousUnreadCount,
            error: error?.message || 'Unable to clear read notifications',
          });
          throw error;
        }
      },

      clearReadNotifications: async () => get().clearNotifications(),
    }),
    {
      name: 'notifications-storage',
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        pagination: state.pagination,
        lastLoadedAt: state.lastLoadedAt,
      }),
    }
  )
);

export default useNotificationStore;
