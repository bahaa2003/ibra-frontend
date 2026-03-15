import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useLanguage } from '../../context/LanguageContext';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { dir } = useLanguage();
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

  const isHomePage = location.pathname === '/dashboard' || location.pathname === '/manager/dashboard';

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-transparent text-[var(--color-text)]">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isMobile={isMobile}
      />

      <div
        className="min-h-screen transition-all duration-300"
        style={{ [dir === 'rtl' ? 'marginRight' : 'marginLeft']: !isMobile ? (isSidebarOpen ? '288px' : '88px') : '0' }}
      >
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

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

        <main className={`overflow-x-hidden px-4 py-5 md:px-6 md:py-6 lg:px-8 lg:py-8 ${location.pathname === '/dashboard' ? 'scrollbar-hide' : ''}`}>
          <div className="mx-auto w-full max-w-[var(--shell-max-width)] animate-[page-fade-in_0.35s_ease-out]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
