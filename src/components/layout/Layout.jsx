import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import PublicSidebar from '../PublicSidebar';
import StoreFooter from '../home/StoreFooter';
import { useLanguage } from '../../context/LanguageContext';
import useAuthStore from '../../store/useAuthStore';
import { isAdminRole } from '../../utils/authRoles';
import {
  getDashboardPathForRole,
  getPreviousVisitedPath,
  isSidebarRootPath,
  registerVisitedPath,
} from '../../utils/navigation';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { dir, language } = useLanguage();
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  useEffect(() => {
    registerVisitedPath(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    document.body.dataset.sidebarOpen = String(isSidebarOpen);
    return () => {
      delete document.body.dataset.sidebarOpen;
    };
  }, [isSidebarOpen]);

  const isHomePage = [
    '/dashboard',
    '/manager/dashboard',
    '/admin/dashboard',
  ].includes(location.pathname);
  const isPublicProductsPage = location.pathname === '/products' && !user;

  if (isPublicProductsPage) {
    return <PublicProductsLayout />;
  }
  const shellOffset = !isMobile ? (isSidebarOpen ? '312px' : '112px') : '0';

  const handleGoBack = () => {
    const path = String(location.pathname || '');
    const isWalletTopupFlow = (
      path === '/wallet/add-balance'
      || path.startsWith('/wallet/payment-details/')
    );
    const openedFromSettings = Boolean(location?.state?.fromSettings);
    const isAdmin = isAdminRole(user?.role);
    const isAdminWallet = path === '/admin/wallet';

    if (isWalletTopupFlow) {
      navigate('/wallet');
      return;
    }

    if (openedFromSettings) {
      navigate('/settings');
      return;
    }

    if (isAdmin && isAdminWallet) {
      navigate('/dashboard');
      return;
    }

    if (isSidebarRootPath(path, user?.role)) {
      navigate(getDashboardPathForRole(user?.role));
      return;
    }

    const previousPath = getPreviousVisitedPath(path);
    if (previousPath) {
      navigate(previousPath);
      return;
    }

    if (isAdmin && !isAdminWallet) {
      navigate('/admin/dashboard');
      return;
    }

    navigate(getDashboardPathForRole(user?.role));
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-transparent text-[var(--color-text)]">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isMobile={isMobile}
      />

      <div
        className="flex min-h-screen min-w-0 max-w-full flex-col transition-all duration-300"
        style={{ marginRight: shellOffset }}
      >
        <div
          className="fixed top-0 z-40 transition-all duration-300"
          style={{
            right: shellOffset,
            left: '0',
          }}
        >
          <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        </div>
        <div className="h-[4.15rem] sm:h-[4.4rem]" aria-hidden="true" />

        {!isHomePage && (
          <div className="mt-3 flex w-full justify-start px-3 sm:px-4 md:px-6 lg:px-8">
            <button
              type="button"
              onClick={handleGoBack}
              className="group relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-amber-400/65 bg-[radial-gradient(circle_at_35%_30%,rgba(255,248,210,0.98),rgba(226,176,64,0.34)_48%,rgba(72,44,8,0.1))] text-amber-800 shadow-[0_0_0_1px_rgba(245,190,65,0.18),0_0_18px_rgba(245,190,65,0.42),0_10px_28px_-12px_rgba(120,75,10,0.75)] transition-all duration-200 hover:scale-105 hover:border-amber-300 hover:text-amber-950 hover:shadow-[0_0_0_3px_rgba(245,190,65,0.12),0_0_28px_rgba(245,190,65,0.65),0_14px_32px_-14px_rgba(120,75,10,0.8)] active:scale-95 dark:border-amber-300/55 dark:bg-[radial-gradient(circle_at_35%_30%,rgba(255,226,143,0.28),rgba(170,110,20,0.16)_48%,rgba(0,0,0,0.35))] dark:text-amber-200"
              aria-label={dir === 'rtl' ? 'رجوع' : 'Back'}
              title={dir === 'rtl' ? 'رجوع' : 'Back'}
            >
              <span className="pointer-events-none absolute inset-1 rounded-full border border-white/35 opacity-70" />
              {dir === 'rtl' ? <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-0.5" /> : <ArrowLeft className="relative z-10 h-5 w-5 transition-transform group-hover:-translate-x-0.5" />}
            </button>
          </div>
        )}

        <main className={`min-w-0 flex-1 overflow-x-hidden px-3 py-5 sm:px-4 md:px-6 md:py-6 lg:px-8 lg:py-8 ${isHomePage ? 'scrollbar-hide' : ''}`}>
          <div className="mx-auto w-full min-w-0 max-w-[var(--shell-max-width)] animate-[page-fade-in_0.35s_ease-out]">
            <Outlet />
          </div>
        </main>

        <div className="mt-auto px-3 pb-4 sm:px-4 md:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[var(--shell-max-width)]">
            <StoreFooter
              hideBrand
              title="IBRA Store"
              description={language === 'ar' ? 'هذا هو الاختيار المناسب لك' : 'Your trusted digital store.'}
              chips={[]}
              copyright={(
                <>
                  <span className="font-semibold tracking-[0.08em] text-[var(--color-text)]">IBRA Store</span>
                  <span className="inline-flex h-1 w-1 rounded-full bg-[color:rgb(var(--color-primary-rgb)/0.55)]" />
                  <span>© 2026</span>
                  <span className="inline-flex h-1 w-1 rounded-full bg-[color:rgb(var(--color-primary-rgb)/0.55)]" />
                  <span>{language === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}</span>
                </>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const PublicProductsLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { dir, language } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      setIsSidebarOpen(false);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_right,rgb(var(--color-primary-rgb)/0.16),transparent_30%),linear-gradient(180deg,rgb(var(--color-surface-rgb))_0%,rgb(var(--color-bg-rgb))_48%,rgb(var(--color-card-rgb))_100%)] text-[var(--color-text)]">
      <PublicSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} isMobile={isMobile} />
      <div className="flex-1 space-y-4 pb-5 sm:space-y-5">
        <Header showUserInfo={false} toggleSidebar={() => setIsSidebarOpen(true)} />
        <div className="flex w-full justify-end px-3 sm:px-4 md:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="group inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-amber-400/65 bg-[radial-gradient(circle_at_35%_30%,rgba(255,248,210,0.98),rgba(226,176,64,0.34)_48%,rgba(72,44,8,0.1))] text-amber-800 shadow-[0_0_0_1px_rgba(245,190,65,0.18),0_0_18px_rgba(245,190,65,0.42),0_10px_28px_-12px_rgba(120,75,10,0.75)] transition-all duration-200 hover:scale-105 hover:border-amber-300 hover:text-amber-950 active:scale-95 dark:border-amber-300/55 dark:bg-[radial-gradient(circle_at_35%_30%,rgba(255,226,143,0.28),rgba(170,110,20,0.16)_48%,rgba(0,0,0,0.35))] dark:text-amber-200"
            aria-label={dir === 'rtl' ? 'رجوع للرئيسية' : 'Back to home'}
            title={dir === 'rtl' ? 'رجوع للرئيسية' : 'Back to home'}
          >
            {dir === 'rtl' ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
          </button>
        </div>
        <main className="px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[var(--shell-max-width)] animate-[page-fade-in_0.35s_ease-out]">
            <Outlet />
          </div>
        </main>
        <div className="mt-auto px-3 pb-4 sm:px-4 md:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[var(--shell-max-width)]">
            <StoreFooter
              hideBrand
              title="IBRA Store"
              description={language === 'ar' ? 'هذا هو الاختيار المناسب لك' : 'A calmer and cleaner mobile-first browsing experience.'}
              chips={[]}
              copyright={language === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
              metaLine=""
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
