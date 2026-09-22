import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useSystemStore from '../../store/useSystemStore';
import {
  Building2,
  ChevronLeft,
  Coins,
  Code,
  Copy,
  CreditCard,
  Home,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Package,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  User,
  UserCog,
  Users,
  Wallet
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../store/useAuthStore';
import { cn } from '../ui/Button';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import WalletSidebarCard from './WalletSidebarCard';
import LogoutConfirmDialog from '../auth/LogoutConfirmDialog';
import defaultBoyAvatar from '../../assets/default-boy-avatar.webp';
import { buildWhatsAppLink, getAdminWhatsAppNumber } from '../../utils/whatsapp';
import {
  ROLES,
  hasRequiredRole,
  normalizeRole,
  userHasAnyPermission,
} from '../../utils/authRoles';

const Sidebar = ({ isOpen, setIsOpen, isMobile }) => {
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = React.useState(false);
  const [copiedUserId, setCopiedUserId] = React.useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = React.useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { dir } = useLanguage();
  const { t } = useTranslation();

  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    setIsLogoutConfirmOpen(true);
  };

  const confirmLogout = () => {
    setIsLogoutConfirmOpen(false);
    logout();
    navigate('/auth');
  };

  const handleOpenMyAccount = () => {
    closeSidebarOnMobile();
    navigate('/account');
  };

  const displayUserId = String(user?.id || user?._id || user?.userId || '').trim();
  const userAvatarUrl = String(user?.avatar || '').trim();
  const isGeneratedPlaceholderAvatar = /(?:^|\.)ui-avatars\.com$/i.test((() => {
    try {
      return new URL(userAvatarUrl).hostname;
    } catch {
      return '';
    }
  })());
  const shouldShowAvatarImage = Boolean(userAvatarUrl) && !isGeneratedPlaceholderAvatar && !avatarLoadFailed;

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [user?.avatar]);

  const handleCopyUserId = async () => {
    if (!displayUserId) return;

    try {
      await navigator.clipboard?.writeText(displayUserId);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = displayUserId;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    setCopiedUserId(true);
    window.setTimeout(() => setCopiedUserId(false), 1400);
  };

  const handleContactClick = () => {
    const message = dir === 'rtl'
      ? 'مرحباً، أحتاج مساعدة من فريق IBRA Store'
      : 'Hello, I need help from the IBRA Store team';
    const href = buildWhatsAppLink({
      number: getAdminWhatsAppNumber(),
      message,
    });

    window.open(href, '_blank', 'noopener,noreferrer');
    closeSidebarOnMobile();
  };

  const navItems = [
    {
      icon: Home,
      label: t('header.home', { defaultValue: dir === 'rtl' ? 'الرئيسية' : 'Home' }),
      path: '/dashboard'
    },
    {
      icon: Wallet,
      label: t('sidebar.adminWallet', { defaultValue: dir === 'rtl' ? 'محفظة الأدمن' : 'Admin Wallet' }),
      path: '/admin/wallet',
      roles: ['admin', 'manager'],
      permissions: ['wallet.view']
    },
    {
      icon: LayoutDashboard,
      label: t('sidebar.adminDashboard', { defaultValue: dir === 'rtl' ? 'لوحة تحكم الأدمن' : 'Admin Dashboard' }),
      path: '/admin/dashboard',
      roles: ['admin', 'manager'],
      permissions: ['dashboard.view']
    },
    { icon: User, label: t('sidebar.myAccount', { defaultValue: 'حسابي' }), path: '/account', roles: ['admin', 'customer', 'manager'] },
    { icon: ShieldCheck, label: t('sidebar.accountProtection', { defaultValue: 'حماية الحساب' }), path: '/account-security', roles: ['admin', 'customer', 'manager'] },
    {
      icon: Code,
      label: t('sidebar.apiDevelopers', { defaultValue: dir === 'rtl' ? 'للمطورين (API)' : 'API & Developers' }),
      path: '/api-docs',
      roles: ['admin', 'customer', 'manager'],
      visible: () => user?.isApiEnabled === true,
    },
    { icon: Wallet, label: t('sidebar.wallet'), path: '/wallet', roles: ['customer', 'manager'] },
    {
      icon: ShoppingCart,
      label: t('header.orders', { defaultValue: dir === 'rtl' ? 'طلباتي' : 'My Orders' }),
      path: '/orders',
      roles: ['customer', 'manager']
    },
    { icon: Users, label: t('sidebar.users'), path: '/admin/users', roles: ['admin', 'manager'], permissions: ['users.view'] },
    { icon: UserCog, label: t('sidebar.supervisors'), path: '/admin/supervisors', roles: ['admin'] },
    { icon: Users, label: t('sidebar.groupsManager'), path: '/admin/groups', roles: ['admin', 'manager'], permissions: ['groups.manage'] },
    { icon: Package, label: t('sidebar.productsManager'), path: '/admin/products', roles: ['admin', 'manager'], permissions: ['products.view', 'products.manage'] },
    {
      icon: ShoppingCart,
      label: t('sidebar.ordersManager', { defaultValue: dir === 'rtl' ? 'إدارة الطلبات' : 'Orders Manager' }),
      path: '/admin/orders',
      roles: ['admin', 'manager'],
      permissions: ['orders.view']
    },
    { icon: Building2, label: t('sidebar.suppliersManager'), path: '/admin/suppliers', roles: ['admin', 'manager'], permissions: ['suppliers.manage'] },
    { icon: ShieldCheck, label: t('sidebar.paymentsManager'), path: '/admin/payments', roles: ['admin', 'manager'], permissions: ['topups.review'] },
    { icon: CreditCard, label: t('sidebar.paymentMethods'), path: '/admin/payment-methods', roles: ['admin'] },
    { icon: Coins, label: t('sidebar.currencies'), path: '/admin/currencies', roles: ['admin'] },
    {
      icon: Sparkles,
      label: t('sidebar.createdBy', { defaultValue: 'تم الإنشاء بواسطة' }),
      path: '/app/created-by',
      roles: ['customer', 'manager']
    },
    { icon: Settings, label: t('sidebar.settings'), path: '/settings', roles: ['admin', 'customer', 'manager'] },
    {
      icon: MessageCircle,
      label: t('sidebar.contactUs', { defaultValue: 'اتصل بنا' }),
      path: '#contact-us',
      roles: ['customer', 'manager'],
      isExternal: true,
      onClick: handleContactClick,
    }
  ];

  const filteredNavItems = navItems.filter((item) => (
    hasRequiredRole(user?.role || 'customer', item.roles)
    && userHasAnyPermission(user, item.permissions || [])
    && (typeof item.visible !== 'function' || item.visible())
  ));
  const showWalletCard = normalizeRole(user?.role) === ROLES.CUSTOMER && (isOpen || isMobile);

  return (
    <>
      <LogoutConfirmDialog
        open={isLogoutConfirmOpen}
        onConfirm={confirmLogout}
        onCancel={() => setIsLogoutConfirmOpen(false)}
      />

      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? 288 : isMobile ? 0 : 88,
          x: isMobile && !isOpen ? 288 : 0
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className={cn(
          'fixed right-3 top-3 z-50 flex h-[calc(100vh-1.5rem)] flex-col overflow-hidden rounded-[2rem] border border-[color:rgb(var(--color-primary-rgb)/0.18)] bg-[radial-gradient(circle_at_85%_0%,rgb(var(--color-primary-rgb)/0.12),transparent_28%),linear-gradient(180deg,rgb(var(--color-surface-rgb)/0.99),rgb(var(--color-card-rgb)/0.94))] shadow-[0_28px_80px_-34px_rgba(15,23,42,0.48),0_0_0_1px_rgb(var(--color-primary-rgb)/0.05)] ring-1 ring-inset ring-white/5 backdrop-blur-2xl',
          isMobile && !isOpen && 'hidden'
        )}
      >
        <div className="border-b border-[color:rgb(var(--color-primary-rgb)/0.12)] bg-[linear-gradient(135deg,rgb(var(--color-primary-rgb)/0.08),transparent_58%)] px-4 py-4">
          <div className="flex items-center justify-end">
            {!isMobile && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                  'inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[color:rgb(var(--color-border-rgb)/0.82)] bg-[color:rgb(var(--color-card-rgb)/0.88)] text-[var(--color-text-secondary)] transition-colors hover:border-[color:rgb(var(--color-primary-rgb)/0.28)] hover:text-[var(--color-primary)]',
                  !isOpen && 'mx-auto'
                )}
              >
                <ChevronLeft className={cn('h-5 w-5 transition-transform', (dir === 'rtl' ? isOpen : !isOpen) && 'rotate-180')} />
              </button>
            )}
          </div>

          {(isOpen || isMobile) && (
              <div className={cn('px-1', isMobile ? 'mt-0' : 'mt-3')}>
              <div className="relative py-1 before:absolute before:inset-y-1 before:start-0 before:w-px before:rounded-full before:bg-gradient-to-b before:from-transparent before:via-[var(--color-primary)] before:to-transparent before:opacity-70">
                <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenMyAccount}
                  className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2.5 py-1.5 text-right transition-all hover:bg-[color:rgb(var(--color-primary-rgb)/0.045)]"
                  aria-label={t('sidebar.myAccount', { defaultValue: 'حسابي' })}
                >
                  <span className="relative h-12 w-12 shrink-0 rounded-full p-[2px] ring-1 ring-[color:rgb(var(--color-primary-rgb)/0.38)] shadow-[0_0_20px_-10px_rgb(var(--color-primary-rgb)/0.9)]">
                    {shouldShowAvatarImage ? (
                      <img
                        src={user.avatar}
                        alt=""
                        aria-hidden="true"
                        onError={() => setAvatarLoadFailed(true)}
                        className="h-full w-full rounded-full object-cover transition-transform group-hover:scale-[1.04]"
                      />
                    ) : (
                      <img
                        src={defaultBoyAvatar}
                        alt=""
                        aria-hidden="true"
                        className="h-full w-full rounded-full object-cover transition-transform group-hover:scale-[1.04]"
                      />
                    )}
                    <span
                      className="absolute bottom-0 end-0 h-3.5 w-3.5 rounded-full border-[3px] border-[var(--color-card)] bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.85)]"
                      title={dir === 'rtl' ? 'متصل الآن' : 'Online now'}
                      aria-label={dir === 'rtl' ? 'متصل الآن' : 'Online now'}
                    />
                  </span>
                  <div className="min-w-0 flex-1 py-0.5">
                    <p
                      className="truncate text-base font-extrabold leading-5 tracking-tight text-[var(--color-text)] drop-shadow-[0_1px_8px_rgb(var(--color-primary-rgb)/0.12)]"
                      title={user?.name}
                    >
                      {user?.name}
                    </p>
                    <div className="mt-1.5 flex min-w-0 items-center gap-1.5" dir="ltr">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)] shadow-[0_0_8px_rgb(var(--color-primary-rgb)/0.7)]" />
                      <p
                        className="truncate text-xs font-semibold leading-4 text-[var(--color-text-secondary)]"
                        title={user?.email}
                      >
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[color:rgb(var(--color-error-rgb)/0.2)] bg-[color:rgb(var(--color-error-rgb)/0.08)] text-[var(--color-error)] transition-colors hover:bg-[color:rgb(var(--color-error-rgb)/0.14)]"
                  aria-label={t('common.logout')}
                >
                  <LogOut className="h-4 w-4" />
                </button>
                </div>
                {displayUserId && (
                  <button
                    type="button"
                    onClick={handleCopyUserId}
                    className="ms-[3.75rem] mt-1.5 flex max-w-[calc(100%-3.75rem)] items-center gap-2 border-t border-[color:rgb(var(--color-primary-rgb)/0.11)] pt-2 text-[9px] font-bold tracking-[0.04em] text-[var(--color-primary)] opacity-80 transition-all hover:opacity-100"
                    title={displayUserId}
                  >
                    <Copy className="h-3 w-3 shrink-0" />
                    <span className="truncate font-mono">
                      {copiedUserId ? (dir === 'rtl' ? 'تم النسخ' : 'Copied') : displayUserId}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
          {showWalletCard && (
            <WalletSidebarCard
              className="mb-4"
              isVisible={showWalletCard}
              onNavigate={closeSidebarOnMobile}
            />
          )}

          <div className="space-y-1.5">
            {filteredNavItems.map((item) => (
              item.isExternal ? (
                <button
                  key={item.path}
                  type="button"
                  onClick={item.onClick}
                  className={cn(
                    'group relative flex w-full items-center gap-3 rounded-[0.95rem] border border-transparent px-3 py-2.5 text-[var(--color-text-secondary)] transition-all hover:border-[color:rgb(var(--color-primary-rgb)/0.1)] hover:bg-[color:rgb(var(--color-primary-rgb)/0.075)] hover:text-[var(--color-text)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
                  )}
                >
                  <item.icon className={cn('h-5 w-5 shrink-0', !isOpen && 'mx-auto')} />
                  {isOpen && <span className="truncate text-sm font-medium">{item.label}</span>}
                  {!isOpen && (
                    <div
                      className={cn(
                        'pointer-events-none absolute whitespace-nowrap rounded-full border border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-card-rgb)/0.96)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] opacity-0 shadow-[var(--shadow-subtle)] transition-opacity group-hover:opacity-100',
                        dir === 'rtl' ? 'right-full mr-2' : 'left-full ml-2'
                      )}
                    >
                      {item.label}
                    </div>
                  )}
                </button>
              ) : (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeSidebarOnMobile}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center gap-3 rounded-[0.95rem] border px-3 py-2.5 transition-all duration-200',
                      isActive
                        ? 'border-[color:rgb(var(--color-primary-rgb)/0.2)] bg-[linear-gradient(135deg,rgb(var(--color-primary-rgb)/0.15),rgb(var(--color-primary-rgb)/0.055))] text-[var(--color-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_10px_24px_-22px_rgb(var(--color-primary-rgb)/0.8)]'
                        : 'border-transparent text-[var(--color-text-secondary)] hover:border-[color:rgb(var(--color-primary-rgb)/0.1)] hover:bg-[color:rgb(var(--color-primary-rgb)/0.075)] hover:text-[var(--color-text)]'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className={cn('absolute inset-y-2 w-[3px] rounded-full bg-[var(--color-primary)]', dir === 'rtl' ? 'right-0' : 'left-0')} />
                      )}
                      <item.icon className={cn('h-[1.15rem] w-[1.15rem] shrink-0 transition-transform group-hover:scale-105', !isOpen && 'mx-auto', isActive && 'text-[var(--color-primary)]')} />
                      {isOpen && <span className={cn('truncate text-[13px] font-semibold', isActive && 'text-[var(--color-text)]')}>{item.label}</span>}
                      {!isOpen && (
                        <div
                          className={cn(
                            'pointer-events-none absolute whitespace-nowrap rounded-full border border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-card-rgb)/0.96)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] opacity-0 shadow-[var(--shadow-subtle)] transition-opacity group-hover:opacity-100',
                            dir === 'rtl' ? 'right-full mr-2' : 'left-full ml-2'
                          )}
                        >
                          {item.label}
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              )
            ))}
          </div>
        </div>

        <div className="border-t border-[color:rgb(var(--color-primary-rgb)/0.12)] bg-[linear-gradient(180deg,transparent,rgb(var(--color-primary-rgb)/0.06))] p-4">
          {(isOpen || isMobile) && (
            <>
              <LanguageSwitcher
                variant="sidebar"
                className="mb-2 h-7 w-full justify-center text-[10px] [&_button]:min-h-0 [&_button]:py-1 [&_button]:text-[10px]"
              />
              <div className="text-center text-[10px] font-semibold tracking-wide text-[var(--color-muted)]" dir="ltr">
                IBRA Store© 2026
              </div>
            </>
          )}
          {(!isOpen && !isMobile) && (
          <div className={cn('flex items-center gap-3', !isOpen && 'justify-center')}>
            <button
              type="button"
              onClick={handleOpenMyAccount}
              className={cn(
                'group flex min-w-0 flex-1 items-center gap-3 rounded-[var(--radius-lg)] text-right transition-colors hover:bg-[color:rgb(var(--color-primary-rgb)/0.08)]',
                isOpen ? 'px-1.5 py-1.5' : 'max-w-[3.5rem] justify-center p-1'
              )}
              aria-label={t('sidebar.myAccount', { defaultValue: 'حسابي' })}
            >
              <span className="relative h-11 w-11 shrink-0">
                {shouldShowAvatarImage ? (
                  <img
                    src={user.avatar}
                    alt={user?.name || 'User'}
                    onError={() => setAvatarLoadFailed(true)}
                    className="h-11 w-11 rounded-full border-2 border-[color:rgb(var(--color-primary-rgb)/0.28)] object-cover transition-transform group-hover:scale-[1.03]"
                  />
                ) : (
                  <img
                    src={defaultBoyAvatar}
                    alt="Default cartoon boy avatar"
                    className="h-11 w-11 rounded-full border-2 border-[color:rgb(var(--color-primary-rgb)/0.28)] object-cover transition-transform group-hover:scale-[1.03]"
                  />
                )}
                <span
                  className="absolute bottom-0 end-0 h-3.5 w-3.5 rounded-full border-2 border-[var(--color-card)] bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.14),0_0_10px_rgba(16,185,129,0.8)]"
                  title={dir === 'rtl' ? 'متصل الآن' : 'Online now'}
                  aria-label={dir === 'rtl' ? 'متصل الآن' : 'Online now'}
                />
              </span>
              {isOpen && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--color-text)]">{user?.name}</p>
                  <p className="truncate text-xs text-[var(--color-muted)]">{user?.email}</p>
                </div>
              )}
            </button>
            {isOpen && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[color:rgb(var(--color-error-rgb)/0.2)] bg-[color:rgb(var(--color-error-rgb)/0.08)] text-[var(--color-error)] transition-colors hover:bg-[color:rgb(var(--color-error-rgb)/0.14)]"
                aria-label={t('common.logout')}
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
          )}
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
