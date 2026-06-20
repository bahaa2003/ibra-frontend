import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Info, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from './ui/Button';
import { useLanguage } from '../context/LanguageContext';
import brandIconImage from '../assets/logo-optimized.webp';
import brandWordmarkImage from '../assets/ibra.png';
import useAuthStore from '../store/useAuthStore';
import { getLogoTargetForRole } from '../utils/authRoles';

const PublicSidebar = ({ isOpen, setIsOpen, isMobile }) => {
  const { user, isAuthenticated } = useAuthStore();
  const { dir } = useLanguage();
  const { t } = useTranslation();
  const isRTL = dir === 'rtl';
  const logoTargetPath = getLogoTargetForRole(user?.role, isAuthenticated);

  const navItems = [
    {
      icon: Home,
      label: t('header.home', { defaultValue: isRTL ? 'الصفحة الرئيسية' : 'Home' }),
      path: '/',
    },
    {
      icon: Sparkles,
      label: t('sidebar.createdBy', { defaultValue: isRTL ? 'تم الإنشاء بواسطة' : 'Created by' }),
      path: '/created-by',
    },
    {
      icon: Info,
      label: isRTL ? 'من نحن' : 'About us',
      path: '/about',
    },
  ];

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <motion.aside
        initial={false}
        animate={{
          width: isMobile ? (isOpen ? 250 : 0) : 250,
          x: isMobile && !isOpen ? 250 : 0,
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className={cn(
          'fixed right-3 top-3 z-[60] flex h-[calc(100vh-1.5rem)] flex-col overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,rgb(var(--color-surface-rgb)/0.98),rgb(var(--color-card-rgb)/0.92))] shadow-[var(--shadow-medium)] ring-1 ring-[color:rgb(var(--color-primary-rgb)/0.14)] backdrop-blur-2xl transition-all duration-300',
          'border border-[color:rgb(var(--color-border-rgb)/0.82)]',
          isMobile && !isOpen && 'hidden'
        )}
      >
        <div className="px-4 pb-2 pt-5">
          <NavLink
            to={logoTargetPath}
            onClick={() => isMobile && setIsOpen(false)}
            className="mb-5 flex items-center gap-3 rounded-[1.25rem] px-1 py-1 text-left [direction:ltr] transition-colors hover:bg-[#d5ad57]/10 dark:hover:bg-[#f0c66f]/8"
            aria-label="IBRA Store"
          >
            <img src={brandIconImage} alt="IBRA Store" className="h-16 w-16 shrink-0 object-contain" />
            <div className="min-w-0">
              <img src={brandWordmarkImage} alt="ibra" className="h-7 w-auto max-w-[7rem] object-contain" />
              <p className="mt-1 text-xs text-[#7a5a29]/62 dark:text-[#f8dfab]/58">
                {isRTL ? 'منصة رقمية' : 'Digital platform'}
              </p>
            </div>
          </NavLink>

          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7a5a29]/48 dark:text-[#f8dfab]/42">
            {isRTL ? 'القائمة' : 'Navigation'}
          </p>
        </div>

        <nav className="flex-1 px-3 pb-5">
          <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => isMobile && setIsOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-[1.35rem] px-4 py-3.5 transition-all duration-200',
                    'border border-transparent text-[#5a3818]/76 hover:border-[#d5ad57]/28 hover:bg-white/58 hover:text-[#3a2411] dark:text-[#f7e8c8]/72 dark:hover:border-[#f0c66f]/18 dark:hover:bg-[#f0c66f]/8 dark:hover:text-white',
                    isActive && 'border-[#d5ad57]/38 bg-[linear-gradient(135deg,rgba(213,173,87,0.24),rgba(255,255,255,0.58))] text-[#3a2411] shadow-[0_16px_34px_-26px_rgba(126,88,30,0.34)] dark:border-[#f0c66f]/30 dark:bg-[linear-gradient(135deg,rgba(240,198,111,0.18),rgba(255,255,255,0.055))] dark:text-white dark:shadow-[0_16px_34px_-22px_rgba(240,198,111,0.7)]'
                  )
                }
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#d5ad57]/14 text-[#6e4519]/82 transition-colors group-hover:bg-[#d5ad57]/22 group-hover:text-[#3a2411] dark:bg-[#f0c66f]/8 dark:text-[#f8dfab]/82 dark:group-hover:bg-[#f0c66f]/14 dark:group-hover:text-white">
                  <Icon size={20} />
                </span>
                <motion.span
                  initial={false}
                  animate={{ opacity: 1, x: 0 }}
                  className="min-w-0 text-sm font-medium"
                >
                  {item.label}
                </motion.span>
              </NavLink>
            );
          })}
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-[#d5ad57]/24 bg-white/50 p-4 dark:border-[#f0c66f]/14 dark:bg-[#f0c66f]/7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7a5a29]/48 dark:text-[#f8dfab]/42">
              {isRTL ? 'الحساب' : 'Account'}
            </p>
            <div className="mt-3 space-y-2">
              <NavLink
                to="/auth?mode=login"
                className="flex items-center justify-center rounded-[1.25rem] border border-[#d5ad57]/26 bg-white/54 px-4 py-3 text-sm font-medium text-[#6e4519] transition-all hover:border-[#b9781f]/34 hover:bg-[#fff7df] hover:text-[#3a2411] dark:border-[#f0c66f]/16 dark:bg-white/5 dark:text-[#f7e8c8] dark:hover:border-[#f0c66f]/28 dark:hover:bg-[#f0c66f]/8 dark:hover:text-white"
                onClick={() => isMobile && setIsOpen(false)}
              >
                {isRTL ? 'تسجيل دخول' : 'Login'}
              </NavLink>
              <NavLink
                to="/auth?mode=register"
                className="flex items-center justify-center rounded-[1.25rem] bg-[linear-gradient(135deg,#b9781f,#f0c66f_48%,#fff0bd)] px-4 py-3 text-sm font-semibold text-[#251609] shadow-[0_16px_34px_-18px_rgba(240,198,111,0.8)] transition-all hover:brightness-105"
                onClick={() => isMobile && setIsOpen(false)}
              >
                {isRTL ? 'إنشاء حساب' : 'Create Account'}
              </NavLink>
            </div>
          </div>

          {!isMobile && (
            <div className="mt-5 rounded-[1.5rem] border border-[#d5ad57]/24 bg-white/48 px-4 py-3 dark:border-[#f0c66f]/14 dark:bg-[#f0c66f]/7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7a5a29]/48 dark:text-[#f8dfab]/42">
                {isRTL ? 'معلومة سريعة' : 'Quick Note'}
              </p>
              <p className="mt-2 text-xs leading-5 text-[#6e4519]/62 dark:text-[#f7e8c8]/60">
                {isRTL ? 'اختيارات بسيطة وواضحة لسرعة الوصول.' : 'Simple, clear choices for faster access.'}
              </p>
            </div>
          )}
        </nav>

        {/* Toggle Button */}
        {!isMobile && (
          <div className="border-t border-[#d5ad57]/24 p-3 dark:border-[#f0c66f]/14">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex w-full items-center justify-center gap-2 rounded-[1.35rem] bg-white/50 px-3 py-3 text-sm font-medium text-[#6e4519]/72 transition-all hover:bg-[#fff7df] hover:text-[#3a2411] dark:bg-[#f0c66f]/8 dark:text-[#f7e8c8]/70 dark:hover:bg-[#f0c66f]/13 dark:hover:text-white"
            >
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                ⟨
              </motion.div>
              <span>{isOpen ? (isRTL ? 'طي القائمة' : 'Collapse') : (isRTL ? 'فتح القائمة' : 'Open')}</span>
            </button>
          </div>
        )}

      </motion.aside>
    </>
  );
};

export default PublicSidebar;
