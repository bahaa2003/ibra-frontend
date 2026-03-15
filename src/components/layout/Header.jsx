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

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { dir } = useLanguage();
  const { t } = useTranslation();
  const isRTL = dir === 'rtl';
  const walletValue = Number(user?.coins || 0);
  const walletDisplayValue = formatWalletAmount(walletValue, user?.currency || 'USD');

  return (
    <header className="sticky top-0 z-40 border-b border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-surface-rgb)/0.92)] backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[var(--shell-max-width)] items-center justify-between gap-3 px-4 py-3 md:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex min-w-0 items-center gap-3 rounded-full border border-[color:rgb(var(--color-border-rgb)/0.88)] bg-[color:rgb(var(--color-card-rgb)/0.72)] px-2.5 py-2 shadow-[var(--shadow-subtle)] transition-all hover:border-[color:rgb(var(--color-primary-rgb)/0.28)] hover:-translate-y-0.5"
        >
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.22)] bg-[color:rgb(var(--color-primary-rgb)/0.08)]">
            <img src={brandIconImage} alt="IBRA Store" className="h-full w-full object-cover" />
          </div>

          <div className="min-w-0 text-start">
            <img src={brandWordmarkImage} alt="IBRA" className="h-5 w-auto object-contain sm:h-6" />
            <p className="hidden truncate text-[11px] uppercase tracking-[0.18em] text-[var(--color-primary-soft)] sm:block">
              {isRTL ? 'هوية تجارة رقمية فاخرة' : 'Luxury Digital Store'}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {user && (
            <button
              type="button"
              onClick={() => navigate('/wallet')}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.2)] bg-[color:rgb(var(--color-primary-rgb)/0.08)] px-3 text-[var(--color-text)] shadow-[var(--shadow-subtle)] transition-all hover:-translate-y-0.5 hover:border-[color:rgb(var(--color-primary-rgb)/0.34)]"
              aria-label={t('header.wallet', { defaultValue: 'Wallet' })}
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color:rgb(var(--color-primary-rgb)/0.18)] text-[var(--color-primary)]">
                <Wallet className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold">
                {walletDisplayValue}
              </span>
            </button>
          )}

          <LanguageSwitcher variant="topbar" compact />
          <ThemeToggle compact />

          <button
            type="button"
            onClick={toggleSidebar}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:rgb(var(--color-border-rgb)/0.92)] bg-[color:rgb(var(--color-card-rgb)/0.9)] text-[var(--color-text)] shadow-[var(--shadow-subtle)] transition-all hover:-translate-y-0.5 hover:border-[color:rgb(var(--color-primary-rgb)/0.3)] hover:text-[var(--color-primary)]"
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
