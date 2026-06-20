import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Menu, Sparkles, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import ThemeToggle from './ui/ThemeToggle';
import logoImage from '../assets/logo-optimized.webp';
import brandWordmarkImage from '../assets/ibra.png';
import useAuthStore from '../store/useAuthStore';
import { getLogoTargetForRole } from '../utils/authRoles';

const Header = ({ user, onMenuClick, showUserInfo = true, onLoginClick }) => {
  const { user: authUser, isAuthenticated } = useAuthStore();
  const { dir } = useLanguage();
  const { t } = useTranslation();
  const isRTL = dir === 'rtl';
  const logoUser = user || authUser;
  const logoTargetPath = getLogoTargetForRole(logoUser?.role, isAuthenticated || Boolean(user));

  return (
    <>
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed inset-x-0 top-3 z-50 px-3 py-2 sm:px-4"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-[2rem] border border-[color:rgb(var(--color-border-rgb)/0.8)] bg-[linear-gradient(135deg,rgb(var(--color-surface-rgb)/0.94),rgb(var(--color-card-rgb)/0.86))] px-3 py-1.5 shadow-[var(--shadow-subtle)] ring-1 ring-[color:rgb(var(--color-primary-rgb)/0.1)] backdrop-blur-2xl [direction:ltr] sm:px-4">
        <Link to={logoTargetPath} className="flex min-w-0 shrink-0 items-center gap-2.5 text-[#3a2411] [direction:ltr] dark:text-white">
          <img src={logoImage} alt="IBRA Store" className="h-11 w-11 shrink-0 object-contain sm:h-12 sm:w-12" />
          <img
            src={brandWordmarkImage}
            alt="ibra"
            className="h-7.5 w-auto max-w-[8.25rem] object-contain sm:h-8 sm:max-w-[9.5rem]"
          />
        </Link>

        {/* Middle content and right actions */}
        <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
          {showUserInfo && (
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-10 h-10 rounded-full bg-[linear-gradient(135deg,#b9781f,#f0c66f_52%,#fff0bd)] p-0.5">
                <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : null}
                </div>
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h3 className="text-sm font-semibold text-[#3a2411] dark:text-white">{user?.name || t('common.user')}</h3>
                <p className="text-xs text-[#7a5a29]/70 dark:text-[#f7e8c8]/62">
                  {user?.role ? t(`roles.${user.role}`, { defaultValue: user.role }) : t('common.customer')}
                </p>
              </div>
            </motion.div>
          )}

          <Link
            to="/created-by"
            className="hidden h-10 items-center gap-2 rounded-full border border-[#d5ad57]/28 bg-white/54 px-3 text-sm font-semibold text-[#6e4519] shadow-[0_14px_30px_-24px_rgba(126,88,30,0.32)] transition-all hover:-translate-y-0.5 hover:border-[#b9781f]/38 hover:bg-[#fff7df] hover:text-[#3a2411] dark:border-[#f0c66f]/18 dark:bg-[#f0c66f]/8 dark:text-[#f8dfab] dark:shadow-[0_14px_30px_-22px_rgba(240,198,111,0.65)] dark:hover:border-[#f0c66f]/34 dark:hover:bg-[#f0c66f]/13 dark:hover:text-white sm:inline-flex"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isRTL ? 'تم الإنشاء بواسطة' : 'Created by'}</span>
          </Link>

          <ThemeToggle compact className="h-10 w-10 !border-[#d5ad57]/28 !bg-white/54 !text-[#6e4519] hover:!border-[#b9781f]/38 hover:!text-[#3a2411] dark:!border-[#f0c66f]/18 dark:!bg-[#f0c66f]/8 dark:!text-[#f8dfab] dark:hover:!border-[#f0c66f]/34 dark:hover:!text-white sm:h-11 sm:w-11" />

          <Link
            to="/auth?mode=login"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d5ad57]/28 bg-white/54 text-[#6e4519] shadow-[0_14px_30px_-24px_rgba(126,88,30,0.32)] transition-all hover:-translate-y-0.5 hover:border-[#b9781f]/38 hover:bg-[#fff7df] hover:text-[#3a2411] dark:border-[#f0c66f]/18 dark:bg-[#f0c66f]/8 dark:text-[#f8dfab] dark:shadow-[0_14px_30px_-22px_rgba(240,198,111,0.65)] dark:hover:border-[#f0c66f]/34 dark:hover:bg-[#f0c66f]/13 dark:hover:text-white sm:h-11 sm:w-11"
            title={isRTL ? 'تسجيل الدخول' : 'Login'}
            aria-label={isRTL ? 'تسجيل الدخول' : 'Login'}
          >
            <UserRound className="h-4.5 w-4.5" />
          </Link>

          {/* Menu with "الصفحة الرئيسية" label */}
          <motion.div 
            className="flex items-center gap-1"
            whileHover={{ scale: 1.05 }}
          >
            <span className="hidden text-sm font-medium text-[#6e4519]/78 dark:text-[#f7e8c8]/76 lg:inline">
              {isRTL ? 'الصفحة الرئيسية' : 'Home'}
            </span>
            <motion.button
              onClick={onMenuClick}
              className="rounded-full border border-[#d5ad57]/28 bg-white/54 p-2 text-[#6e4519] shadow-[0_14px_30px_-24px_rgba(126,88,30,0.32)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b9781f]/38 hover:bg-[#fff7df] hover:text-[#3a2411] dark:border-[#f0c66f]/18 dark:bg-[#f0c66f]/8 dark:text-[#f8dfab] dark:shadow-[0_14px_30px_-22px_rgba(240,198,111,0.65)] dark:hover:border-[#f0c66f]/34 dark:hover:bg-[#f0c66f]/13 dark:hover:text-white"
              whileTap={{ scale: 0.95 }}
              title={isRTL ? 'الصفحة الرئيسية' : 'Home'}
            >
              <Menu size={24} />
            </motion.button>
          </motion.div>

        </div>
      </div>
    </motion.header>
    <div className="h-[4.25rem] sm:h-[4.5rem]" aria-hidden="true" />
    </>
  );
};

export default Header;
