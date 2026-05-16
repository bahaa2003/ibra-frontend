import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  BellRing,
  CheckCheck,
  Clock3,
  Info,
  PackageCheck,
  Trash2,
  WalletCards,
} from 'lucide-react';
import useNotificationStore from '../../store/useNotificationStore';
import useAuthStore from '../../store/useAuthStore';

const typeStyles = {
  success: {
    icon: CheckCheck,
    className: 'bg-[color:rgb(var(--color-success-rgb)/0.13)] text-[var(--color-success)]',
  },
  warning: {
    icon: Info,
    className: 'bg-[color:rgb(var(--color-warning-rgb)/0.16)] text-[var(--color-warning)]',
  },
  error: {
    icon: Info,
    className: 'bg-[color:rgb(var(--color-error-rgb)/0.13)] text-[var(--color-error)]',
  },
  wallet: {
    icon: WalletCards,
    className: 'bg-[color:rgb(var(--color-primary-rgb)/0.13)] text-[var(--color-primary)]',
  },
  order: {
    icon: PackageCheck,
    className: 'bg-[color:rgb(var(--color-primary-rgb)/0.13)] text-[var(--color-primary)]',
  },
  info: {
    icon: BellRing,
    className: 'bg-[color:rgb(var(--color-primary-rgb)/0.12)] text-[var(--color-primary)]',
  },
};

const formatArabicTime = (createdAt) => {
  if (!createdAt) return 'الآن';

  const createdTime = new Date(createdAt).getTime();
  if (Number.isNaN(createdTime)) return 'الآن';

  const diffMinutes = Math.max(0, Math.floor((Date.now() - createdTime) / 60000));
  if (diffMinutes < 1) return 'الآن';
  if (diffMinutes < 60) return `منذ ${diffMinutes} د`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `منذ ${diffHours} س`;

  const diffDays = Math.floor(diffHours / 24);
  return `منذ ${diffDays} يوم`;
};

const extractKnownId = (text = '') => {
  const value = String(text || '');
  const patterns = [
    /(ord-[\w-]+)/i,
    /(topup-[\w-]+)/i,
    /(notif-[\w-]+)/i,
    /\b([a-f0-9]{24})\b/i,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1];
  }

  return '';
};

const resolveNotificationRoute = (notification, role) => {
  const normalizedRole = String(role || '').toLowerCase();
  const isAdmin = ['admin', 'super_admin', 'manager'].includes(normalizedRole);
  if (notification?.route && (isAdmin || !String(notification.route).startsWith('/admin'))) {
    return notification.route;
  }

  const entityType = String(notification?.entityType || notification?.type || '').toLowerCase();
  const entityId = String(notification?.entityId || '').trim()
    || extractKnownId(`${notification?.title || ''} ${notification?.message || ''}`);

  if (entityType.includes('order')) {
    return isAdmin
      ? `/admin/orders${entityId ? `?orderId=${encodeURIComponent(entityId)}` : ''}`
      : `/orders${entityId ? `?orderId=${encodeURIComponent(entityId)}` : ''}`;
  }

  if (entityType.includes('topup') || entityType.includes('wallet')) {
    return isAdmin
      ? `/admin/payments${entityId ? `?topupId=${encodeURIComponent(entityId)}` : ''}`
      : '/wallet';
  }

  if (entityType.includes('user')) {
    return isAdmin
      ? `/admin/users${entityId ? `?userId=${encodeURIComponent(entityId)}` : ''}`
      : '/account';
  }

  if (String(notification?.title || '').includes('حساب')) {
    return isAdmin ? '/admin/users' : '/account';
  }

  return isAdmin ? '/admin/dashboard' : '/dashboard';
};

const NotificationBell = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const userRole = useAuthStore((state) => state.user?.role);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  const fetchUnreadCount = useNotificationStore((state) => state.fetchUnreadCount);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const clearNotifications = useNotificationStore((state) => state.clearNotifications);

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchNotifications({ limit: 20 }).catch(() => {});
    fetchUnreadCount().catch(() => {});
  }, [fetchNotifications, fetchUnreadCount, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !isOpen) return;

    fetchNotifications({ limit: 20, force: true }).catch(() => {});
  }, [fetchNotifications, isAuthenticated, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification) => {
    void markAsRead(notification.id).catch(() => {});
    setIsOpen(false);
    navigate(resolveNotificationRoute(notification, userRole));
  };

  return (
    <div ref={wrapperRef} className="relative [direction:rtl]">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="relative inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-[color:rgb(var(--color-border-rgb)/0.92)] bg-[color:rgb(var(--color-card-rgb)/0.9)] px-2.5 text-[var(--color-text)] shadow-[var(--shadow-subtle)] transition-all hover:-translate-y-0.5 hover:border-[color:rgb(var(--color-primary-rgb)/0.3)] hover:text-[var(--color-primary)] sm:h-11 sm:px-3"
        aria-label="الإشعارات"
        aria-expanded={isOpen}
      >
        {unreadCount > 0 ? <BellRing className="h-4.5 w-4.5" /> : <Bell className="h-4.5 w-4.5" />}
        <span className="hidden text-xs font-bold md:inline">الإشعارات</span>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-[color:rgb(var(--color-card-rgb)/0.95)] bg-[var(--color-error)] px-1 text-[10px] font-black leading-none text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-x-3 top-[4.75rem] z-50 overflow-hidden rounded-3xl border border-[color:rgb(var(--color-border-rgb)/0.92)] bg-[color:rgb(var(--color-card-rgb)/0.98)] shadow-[var(--shadow-medium)] ring-1 ring-[color:rgb(var(--color-primary-rgb)/0.08)] backdrop-blur-2xl sm:absolute sm:inset-x-auto sm:left-0 sm:top-[3.25rem] sm:w-[24rem]">
          <div className="border-b border-[color:rgb(var(--color-border-rgb)/0.72)] bg-[linear-gradient(135deg,rgb(var(--color-primary-rgb)/0.12),transparent)] px-4 py-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-sm font-black text-[var(--color-text)]">الإشعارات</h2>
                <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
                  هنا هتلاقي تحديثات الطلبات، شحن الرصيد، وحالة حسابك أول بأول.
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.2)] bg-[color:rgb(var(--color-primary-rgb)/0.1)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-primary)]">
                {unreadCount > 0 ? `${unreadCount} جديد` : 'لا يوجد جديد'}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  void markAllAsRead().catch(() => {});
                }}
                disabled={notifications.length === 0 || unreadCount === 0}
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[color:rgb(var(--color-border-rgb)/0.85)] bg-[color:rgb(var(--color-card-rgb)/0.72)] px-3 text-xs font-bold text-[var(--color-text)] transition-colors hover:border-[color:rgb(var(--color-primary-rgb)/0.32)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                تعليم الكل كمقروء
              </button>
              <button
                type="button"
                onClick={() => {
                  void clearNotifications().catch(() => {});
                }}
                disabled={notifications.length === 0}
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[color:rgb(var(--color-border-rgb)/0.85)] bg-[color:rgb(var(--color-card-rgb)/0.72)] px-3 text-xs font-bold text-[var(--color-text-secondary)] transition-colors hover:border-[color:rgb(var(--color-error-rgb)/0.35)] hover:text-[var(--color-error)] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Trash2 className="h-3.5 w-3.5" />
                مسح الكل
              </button>
            </div>
          </div>

          <div className="max-h-[min(28rem,calc(100vh-11rem))] overflow-y-auto p-2">
            {notifications.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color:rgb(var(--color-primary-rgb)/0.12)] text-[var(--color-primary)]">
                  <Bell className="h-5 w-5" />
                </span>
                <h3 className="mt-3 text-sm font-black text-[var(--color-text)]">مفيش إشعارات حالياً</h3>
                <p className="mt-2 text-xs leading-6 text-[var(--color-text-secondary)]">
                  أول ما يحصل تحديث مهم في طلباتك أو رصيدك، هيظهر هنا بشكل واضح.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {notifications.map((notification) => {
                  const typeStyle = typeStyles[notification.type] || typeStyles.info;
                  const NotificationIcon = typeStyle.icon;

                  return (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full rounded-2xl border px-3 py-3 text-start transition-colors hover:border-[color:rgb(var(--color-primary-rgb)/0.32)] hover:bg-[color:rgb(var(--color-primary-rgb)/0.08)] focus:outline-none focus:ring-2 focus:ring-[color:rgb(var(--color-primary-rgb)/0.28)] ${
                        notification.read
                          ? 'border-transparent bg-transparent'
                          : 'border-[color:rgb(var(--color-primary-rgb)/0.2)] bg-[color:rgb(var(--color-primary-rgb)/0.07)]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${typeStyle.className}`}>
                          <NotificationIcon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="line-clamp-2 text-sm font-black leading-5 text-[var(--color-text)]">
                              {notification.title || 'إشعار جديد'}
                            </h3>
                            {!notification.read && (
                              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--color-error)]" aria-label="غير مقروء" />
                            )}
                          </div>
                          {notification.message && (
                            <p className="mt-1 line-clamp-3 text-xs leading-5 text-[var(--color-text-secondary)]">
                              {notification.message}
                            </p>
                          )}
                          <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-muted)]">
                            <Clock3 className="h-3.5 w-3.5" />
                            {formatArabicTime(notification.createdAt)}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
