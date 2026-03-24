import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useLanguage } from '../../context/LanguageContext';
import useAuthStore from '../../store/useAuthStore';
import { getDefaultRouteForRole, isAdminRole } from '../../utils/authRoles';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { dir } = useLanguage();
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
  const shellOffset = !isMobile ? (isSidebarOpen ? '288px' : '88px') : '0';

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

    if (isAdmin && !isAdminWallet) {
      navigate('/admin/dashboard');
      return;
    }

    navigate(getDefaultRouteForRole(user?.role));
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-transparent text-[var(--color-text)]">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isMobile={isMobile}
      />

      <div
        className="min-h-screen min-w-0 max-w-full transition-all duration-300"
        style={{ [dir === 'rtl' ? 'marginRight' : 'marginLeft']: shellOffset }}
      >
        <div
          className="fixed top-0 z-40 transition-all duration-300"
          style={{
            [dir === 'rtl' ? 'right' : 'left']: shellOffset,
            [dir === 'rtl' ? 'left' : 'right']: '0',
          }}
        >
          <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        </div>
        <div className="h-[4.5rem] sm:h-[4.75rem]" aria-hidden="true" />

        {!isHomePage && (
          <div className="mx-auto mt-4 max-w-[var(--shell-max-width)] px-4 md:px-6 lg:px-8">
            <button
              type="button"
              onClick={handleGoBack}
              className="inline-flex items-center gap-2 rounded-full border border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-card-rgb)/0.9)] px-4 py-2 text-sm font-semibold text-[var(--color-text)] shadow-[var(--shadow-subtle)] transition-colors hover:border-[color:rgb(var(--color-primary-rgb)/0.28)] hover:text-[var(--color-primary)]"
              aria-label={dir === 'rtl' ? 'رجوع' : 'Back'}
            >
              {dir === 'rtl' ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
              <span>{dir === 'rtl' ? 'رجوع' : 'Back'}</span>
            </button>
          </div>
        )}

        <main className={`min-w-0 overflow-x-hidden px-3 py-5 sm:px-4 md:px-6 md:py-6 lg:px-8 lg:py-8 ${isHomePage ? 'scrollbar-hide' : ''}`}>
          <div className="mx-auto w-full min-w-0 max-w-[var(--shell-max-width)] animate-[page-fade-in_0.35s_ease-out]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
