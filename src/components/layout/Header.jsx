import React from 'react';
import { Menu, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../store/useAuthStore';
import { useLanguage } from '../../context/LanguageContext';
import ThemeToggle from '../ui/ThemeToggle';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import brandIconImage from '../../assets/box_.png';
import brandWordmarkImage from '../../assets/ibra.png';
import { formatWalletAmount } from '../../utils/storefront';
import { getDefaultRouteForRole } from '../../utils/authRoles';

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { dir } = useLanguage();
  const { t } = useTranslation();
  const isRTL = dir === 'rtl';
  const walletValue = Number(user?.coins || 0);
  const walletDisplayValue = formatWalletAmount(walletValue, user?.currency || 'USD');

  return (
    <header className="border-b border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-surface-rgb)/0.92)] backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[var(--shell-max-width)] items-center justify-between gap-2 px-3 py-2 sm:px-4 sm:py-3 md:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(getDefaultRouteForRole(user?.role))}
          className="flex min-w-0 max-w-[calc(100vw-11rem)] items-center gap-1.5 rounded-full border border-[color:rgb(var(--color-border-rgb)/0.88)] bg-[color:rgb(var(--color-card-rgb)/0.72)] px-1.5 py-1.5 shadow-[var(--shadow-subtle)] transition-all hover:border-[color:rgb(var(--color-primary-rgb)/0.28)] hover:-translate-y-0.5 sm:max-w-none sm:gap-3 sm:px-2.5 sm:py-2"
        >
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.22)] bg-[color:rgb(var(--color-primary-rgb)/0.08)] sm:h-11 sm:w-11">
            <img src={brandIconImage} alt="IBRA Store" className="h-full w-full object-cover" />
          </div>

          <div className="min-w-0 text-start">
            <img
              src={brandWordmarkImage}
              alt="IBRA"
              className="h-4 w-auto max-w-[5.5rem] object-contain sm:h-6 sm:max-w-none"
            />
            <p className="hidden truncate text-[11px] uppercase tracking-[0.18em] text-[var(--color-primary-soft)] sm:block">
              {isRTL ? 'هوية تجارة رقمية فاخرة' : 'Luxury Digital Store'}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1 sm:gap-2">
          {user?.role === 'customer' && (
            <button
              type="button"
              onClick={() => navigate('/wallet')}
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.2)] bg-[color:rgb(var(--color-primary-rgb)/0.08)] px-2 text-[var(--color-text)] shadow-[var(--shadow-subtle)] transition-all hover:-translate-y-0.5 hover:border-[color:rgb(var(--color-primary-rgb)/0.34)] sm:h-11 sm:gap-2 sm:px-3"
              aria-label={t('header.wallet', { defaultValue: 'Wallet' })}
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color:rgb(var(--color-primary-rgb)/0.18)] text-[var(--color-primary)] sm:h-7 sm:w-7">
                <Wallet className="h-4 w-4" />
              </span>
              <span className="hidden text-sm font-semibold sm:inline">
                {walletDisplayValue}
              </span>
            </button>
          )}

          <LanguageSwitcher
            variant="topbar"
            compact
            className="px-2.5 py-1.5 text-[11px] sm:px-3 sm:py-2 sm:text-xs"
          />
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
