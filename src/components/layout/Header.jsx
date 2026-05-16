import React from 'react';
import { Menu, Wallet } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../store/useAuthStore';
import { useLanguage } from '../../context/LanguageContext';
import ThemeToggle from '../ui/ThemeToggle';
import NotificationBell from '../notifications/NotificationBell';
import brandIconImage from '../../assets/logo-optimized.webp';
import brandWordmarkImage from '../../assets/ibra.png';
import { formatWalletAmount } from '../../utils/storefront';
import { getDefaultRouteForRole, isAdminRole } from '../../utils/authRoles';

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const { dir } = useLanguage();
  const { t } = useTranslation();
  const isRTL = dir === 'rtl';
  const walletValue = Number(user?.coins || 0);
  const walletDisplayValue = formatWalletAmount(walletValue, user?.currency || 'USD');
  const isNegativeBalance = walletValue < 0;
  const isCustomer = String(user?.role || '').toLowerCase() === 'customer';
  const isAdminHomePage = isAdminRole(user?.role) && location.pathname === '/dashboard';
  const shouldShowHeaderWallet = isCustomer || isAdminHomePage;
  const walletTargetPath = isCustomer ? '/wallet' : '/admin/wallet';

  return (
    <header
      dir={isRTL ? 'rtl' : 'ltr'}
      className="w-full px-3 pt-3 sm:px-4 md:px-6 lg:px-8"
    >
      <div className="flex w-full items-center justify-between gap-2 rounded-[2rem] border border-[color:rgb(var(--color-border-rgb)/0.86)] bg-[linear-gradient(135deg,rgb(var(--color-surface-rgb)/0.96),rgb(var(--color-card-rgb)/0.88))] px-3 py-1.5 shadow-[var(--shadow-subtle)] ring-1 ring-[color:rgb(var(--color-primary-rgb)/0.08)] backdrop-blur-2xl [direction:ltr] sm:px-4 sm:py-2">
        <div className="flex min-w-0 items-center">
          <button
            type="button"
            onClick={() => navigate(getDefaultRouteForRole(user?.role))}
            className="flex min-w-0 max-w-[calc(100vw-15.5rem)] items-center gap-2 [direction:ltr] transition-all hover:-translate-y-0.5 sm:max-w-none sm:gap-2.5"
          >
            <img
              src={brandIconImage}
              alt="IBRA Store"
              loading="eager"
              decoding="async"
              className="h-11 w-11 shrink-0 object-contain sm:h-12 sm:w-12"
            />

            <div className="min-w-0 text-left">
              <img
                src={brandWordmarkImage}
                alt="IBRA"
                loading="eager"
                decoding="async"
                className="h-5.5 w-auto max-w-[7.25rem] object-contain sm:h-6.5 sm:max-w-[8.5rem]"
              />
              <p className="hidden truncate text-[11px] uppercase tracking-[0.18em] text-[var(--color-primary-soft)] sm:block">
                {isRTL ? 'هوية تجارة رقمية فاخرة' : 'Luxury Digital Store'}
              </p>
            </div>
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {shouldShowHeaderWallet && (
            <button
              type="button"
              onClick={() => navigate(walletTargetPath)}
              className="inline-flex h-8.5 items-center gap-1 rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.2)] bg-[color:rgb(var(--color-primary-rgb)/0.08)] px-1.5 text-[var(--color-text)] shadow-[var(--shadow-subtle)] transition-all hover:-translate-y-0.5 hover:border-[color:rgb(var(--color-primary-rgb)/0.34)] sm:h-10 sm:gap-1.5 sm:px-2.5"
              aria-label={isAdminHomePage ? (dir === 'rtl' ? 'محفظة الأدمن' : 'Admin wallet') : t('header.wallet', { defaultValue: 'Wallet' })}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[color:rgb(var(--color-primary-rgb)/0.18)] text-[var(--color-primary)] sm:h-6 sm:w-6">
                <Wallet className="h-3.5 w-3.5" />
              </span>
              <span className={`max-w-[5.6rem] truncate text-[11px] font-semibold sm:text-xs ${isNegativeBalance ? 'text-[#b42323]' : 'text-[var(--color-text)]'}`}>
                {walletDisplayValue}
              </span>
            </button>
          )}

          {isAuthenticated && <NotificationBell />}

          <ThemeToggle compact className="h-10 w-10 sm:h-11 sm:w-11" />

          <button
            type="button"
            onClick={toggleSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:rgb(var(--color-border-rgb)/0.92)] bg-[color:rgb(var(--color-card-rgb)/0.9)] text-[var(--color-text)] shadow-[var(--shadow-subtle)] transition-all hover:-translate-y-0.5 hover:border-[color:rgb(var(--color-primary-rgb)/0.3)] hover:text-[var(--color-primary)] sm:h-11 sm:w-11"
            aria-label={t('header.menu')}
          >
            <Menu className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
