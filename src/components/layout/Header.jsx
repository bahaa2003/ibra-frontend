import React from 'react';
import { Menu, Wallet } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../store/useAuthStore';
import { useLanguage } from '../../context/LanguageContext';
import ThemeToggle from '../ui/ThemeToggle';
import brandIconImage from '../../assets/logo.png';
import brandWordmarkImage from '../../assets/ibra.png';
import { formatWalletAmount } from '../../utils/storefront';
import { getDefaultRouteForRole, isAdminRole } from '../../utils/authRoles';

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
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
      className="w-full border-b border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-surface-rgb)/0.92)] backdrop-blur-2xl"
    >
      <div className="flex w-full items-start justify-between gap-2 px-3 py-1.5 [direction:ltr] sm:px-4 sm:py-2 md:px-6 lg:px-8">
        <div className="flex min-w-0 items-center">
          <button
            type="button"
            onClick={() => navigate(getDefaultRouteForRole(user?.role))}
            className={`flex min-w-0 max-w-[calc(100vw-11rem)] items-center gap-1.5 rounded-full border border-[color:rgb(var(--color-border-rgb)/0.88)] bg-[color:rgb(var(--color-card-rgb)/0.72)] px-1.5 py-1 shadow-[var(--shadow-subtle)] transition-all hover:border-[color:rgb(var(--color-primary-rgb)/0.28)] hover:-translate-y-0.5 sm:max-w-none sm:gap-2.5 sm:px-2.5 sm:py-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <div className="flex h-9.5 w-9.5 items-center justify-center overflow-hidden rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.22)] bg-[color:rgb(var(--color-primary-rgb)/0.08)] sm:h-10.5 sm:w-10.5">
              <img
                src={brandIconImage}
                alt="IBRA Store"
                loading="eager"
                decoding="async"
                className="h-[112%] w-[112%] translate-y-[9%] object-contain"
              />
            </div>

            <div className={`min-w-0 ${isRTL ? 'text-right' : 'text-start'}`}>
              <img
                src={brandWordmarkImage}
                alt="IBRA"
                loading="eager"
                decoding="async"
                className="h-3.5 w-auto max-w-[4.9rem] object-contain sm:h-5 sm:max-w-none"
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
