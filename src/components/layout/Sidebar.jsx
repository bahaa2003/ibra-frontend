import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useSystemStore from '../../store/useSystemStore';
import {
  Building2,
  ChevronLeft,
  Coins,
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
import brandIconImage from '../../assets/logo.png';
import brandWordmarkImage from '../../assets/ibra.png';
import { buildWhatsAppLink, getAdminWhatsAppNumber } from '../../utils/whatsapp';
import { hasRequiredRole } from '../../utils/authRoles';

const Sidebar = ({ isOpen, setIsOpen, isMobile }) => {
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
    closeSidebarOnMobile();
    logout();
    navigate('/auth');
  };

  const handleOpenMyAccount = () => {
    closeSidebarOnMobile();
    navigate('/account');
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
      path: '/dashboard',
      roles: ['customer', 'admin']
    },
    {
      icon: Wallet,
      label: t('sidebar.adminWallet', { defaultValue: dir === 'rtl' ? 'محفظة الأدمن' : 'Admin Wallet' }),
      path: '/admin/wallet',
      roles: ['admin']
    },
    {
      icon: LayoutDashboard,
      label: t('sidebar.dashboard', { defaultValue: dir === 'rtl' ? 'لوحة التحكم' : 'Dashboard' }),
      path: '/manager/dashboard',
      roles: ['manager']
    },
    {
      icon: LayoutDashboard,
      label: t('sidebar.adminDashboard', { defaultValue: dir === 'rtl' ? 'لوحة تحكم الأدمن' : 'Admin Dashboard' }),
      path: '/admin/dashboard',
      roles: ['admin']
    },
    { icon: User, label: t('sidebar.myAccount', { defaultValue: 'حسابي' }), path: '/account', roles: ['admin', 'customer', 'manager'] },
    { icon: ShieldCheck, label: t('sidebar.accountProtection', { defaultValue: 'حماية الحساب' }), path: '/account-security', roles: ['admin', 'customer', 'manager'] },
    { icon: Wallet, label: t('sidebar.wallet'), path: '/wallet', roles: ['customer'] },
    {
      icon: ShoppingCart,
      label: t('header.orders', { defaultValue: dir === 'rtl' ? 'طلباتي' : 'My Orders' }),
      path: '/orders',
      roles: ['customer']
    },
    { icon: Users, label: t('sidebar.users'), path: '/admin/users', roles: ['admin'] },
    { icon: UserCog, label: t('sidebar.supervisors'), path: '/admin/supervisors', roles: ['admin'] },
    { icon: Users, label: t('sidebar.groupsManager'), path: '/admin/groups', roles: ['admin'] },
    { icon: Package, label: t('sidebar.productsManager'), path: '/admin/products', roles: ['admin'] },
    {
      icon: ShoppingCart,
      label: t('sidebar.ordersManager', { defaultValue: dir === 'rtl' ? 'إدارة الطلبات' : 'Orders Manager' }),
      path: '/admin/orders',
      roles: ['admin']
    },
    { icon: Building2, label: t('sidebar.suppliersManager'), path: '/admin/suppliers', roles: ['admin'] },
    { icon: ShieldCheck, label: t('sidebar.paymentsManager'), path: '/admin/payments', roles: ['admin'] },
    { icon: CreditCard, label: t('sidebar.paymentMethods'), path: '/admin/payment-methods', roles: ['admin'] },
    { icon: Coins, label: t('sidebar.currencies'), path: '/admin/currencies', roles: ['admin'] },
    {
      icon: Sparkles,
      label: t('sidebar.createdBy', { defaultValue: 'تم الإنشاء بواسطة' }),
      path: '/created-by',
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

  const filteredNavItems = navItems.filter((item) => hasRequiredRole(user?.role || 'customer', item.roles));
  const showWalletCard = String(user?.role || '').toLowerCase() === 'customer' && (isOpen || isMobile);

  return (
    <>
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
          x: isMobile && !isOpen ? (dir === 'rtl' ? 288 : -288) : 0
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className={cn(
          'fixed top-0 z-50 flex h-screen flex-col overflow-hidden border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-surface-rgb)/0.96)] shadow-[var(--shadow-medium)]',
          dir === 'rtl' ? 'right-0 border-l' : 'left-0 border-r',
          isMobile && !isOpen && 'hidden'
        )}
      >
        <div className="border-b border-[color:rgb(var(--color-border-rgb)/0.85)] px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            {(isOpen || isMobile) ? (
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-11 w-11 overflow-hidden rounded-[var(--radius-md)]">
                  <img src={brandIconImage} alt="IBRA Store" loading="eager" decoding="async" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <img src={brandWordmarkImage} alt="IBRA" loading="eager" decoding="async" className="h-5 w-auto object-contain sm:h-6" />
                  <p className="mt-1 truncate text-[11px] uppercase tracking-[0.18em] text-[var(--color-primary)]">
                    {dir === 'rtl' ? 'هوية فاخرة' : 'Luxury Identity'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mx-auto h-11 w-11 overflow-hidden rounded-[var(--radius-md)] border border-[color:rgb(var(--color-border-rgb)/0.85)] bg-[color:rgb(var(--color-card-rgb)/0.84)]">
                <img src={brandIconImage} alt="IBRA Store" loading="eager" decoding="async" className="h-full w-full object-cover" />
              </div>
            )}

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
            <div className="mt-4">
              <LanguageSwitcher variant="sidebar" className="w-full justify-center" />
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

          <div className="space-y-1">
            {filteredNavItems.map((item) => (
              item.isExternal ? (
                <button
                  key={item.path}
                  type="button"
                  onClick={item.onClick}
                  className={cn(
                    'group relative flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 text-[var(--color-text-secondary)] transition-all hover:bg-[color:rgb(var(--color-primary-rgb)/0.08)] hover:text-[var(--color-text)]'
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
                      'group relative flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 transition-all',
                      isActive
                        ? 'bg-[color:rgb(var(--color-primary-rgb)/0.12)] text-[var(--color-text)] shadow-[var(--shadow-subtle)]'
                        : 'text-[var(--color-text-secondary)] hover:bg-[color:rgb(var(--color-primary-rgb)/0.08)] hover:text-[var(--color-text)]'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className={cn('absolute inset-y-2 w-[3px] rounded-full bg-[var(--color-primary)]', dir === 'rtl' ? 'right-0' : 'left-0')} />
                      )}
                      <item.icon className={cn('h-5 w-5 shrink-0', !isOpen && 'mx-auto', isActive && 'text-[var(--color-primary)]')} />
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
                    </>
                  )}
                </NavLink>
              )
            ))}
          </div>
        </div>

        <div className="border-t border-[color:rgb(var(--color-border-rgb)/0.85)] bg-[color:rgb(var(--color-card-rgb)/0.64)] p-4">
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
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`}
                alt={user?.name}
                className="h-11 w-11 rounded-full border border-[color:rgb(var(--color-border-rgb)/0.9)] object-cover transition-transform group-hover:scale-[1.03]"
              />
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
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
