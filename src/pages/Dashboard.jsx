import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Sparkles } from 'lucide-react';
import Header from '../components/Header';
import useAuthStore from '../store/useAuthStore';
import useMediaStore from '../store/useMediaStore';
import useGroupStore from '../store/useGroupStore';
import HeroSlider from '../components/home/HeroSlider';
import AnnouncementTicker from '../components/home/AnnouncementTicker';
import CategoryCard from '../components/home/CategoryCard';
import ProductSearchBar from '../components/products/ProductSearchBar';
import StoreFooter from '../components/home/StoreFooter';
import buyCardsImage from '../assets/slide1-optimized.webp';
import chatAppsImage from '../assets/slide2-optimized.webp';
import gamesChargingImage from '../assets/slide3-optimized.webp';
import {
  createStorefrontCategories,
  createStorefrontProducts,
  getStorefrontLanguage,
} from '../utils/storefront';
import PublicSidebar from '../components/PublicSidebar';

const COMMUNITY_WHATSAPP_LINK = 'https://chat.whatsapp.com/FqEYPVChqXB7CFS7hbN5D8';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, refreshProfile } = useAuthStore();
  const { categories, products, loadProducts } = useMediaStore();
  const groupsLastLoadedAt = useGroupStore((state) => state.groupsLastLoadedAt);
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const language = getStorefrontLanguage(i18n);
  const showPublicHeader = location.pathname === '/';

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsSidebarOpen(false);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (refreshProfile) {
      refreshProfile();
    }
  }, [refreshProfile]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const heroSlides = useMemo(() => ([
    {
      id: 'hero-games',
      image: gamesChargingImage,
      alt: language === 'ar' ? 'صورة شحن ألعاب' : 'Game topup banner',
    },
    {
      id: 'hero-apps',
      image: chatAppsImage,
      alt: language === 'ar' ? 'صورة اشتراكات رقمية' : 'Digital subscriptions banner',
      href: COMMUNITY_WHATSAPP_LINK,
    },
    {
      id: 'hero-cards',
      image: buyCardsImage,
      alt: language === 'ar' ? 'صورة بطاقات رقمية' : 'Digital cards banner',
    },
  ]), [language]);

  const storefrontProducts = useMemo(
    () => createStorefrontProducts(products, {
      language,
      userGroup: user?.groupId || user?.group || 'Normal',
      userGroupPercentage: user?.groupPercentage ?? null,
    }),
    [groupsLastLoadedAt, language, products, user?.group, user?.groupId, user?.groupPercentage]
  );

  const storefrontCategories = useMemo(
    () => createStorefrontCategories(categories, storefrontProducts, language),
    [categories, storefrontProducts, language]
  );

  const visibleHomepageCategories = useMemo(
    () => storefrontCategories.filter((category) => {
      if (category.id === 'all') return false;
      // Strict root-only: parentCategory must be null/undefined/empty
      const p = category.parentCategory;
      if (!p) return true;
      if (typeof p === 'string' && !p.trim()) return true;
      return false;
    }),
    [storefrontCategories]
  );

  const tickerItems = useMemo(
    () => [
      {
        id: 'ticker-basmala',
        text: '꧁ بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ ꧂',
        durationMs: 9000,
      },
      {
        id: 'ticker-verse',
        text: '(رِجَالٌ لَّا تُلْهِيهِمْ تِجَارَةٌ وَلَا بَيْعٌ عَن ذِكْرِ اللَّهِ وَإِقَامِ الصَّلَاةِ وَإِيتَاءِ الزَّكَاةِ ۙ يَخَافُونَ يَوْمًا تَتَقَلَّبُ فِيهِ الْقُلُوبُ وَالْأَبْصَارُ )',
        durationMs: 16000,
      },
      {
        id: 'ticker-closing',
        text: '꧁صدق الله العظيم꧂',
        durationMs: 9000,
      }
    ],
    []
  );

  const handleCategorySelect = useCallback((categoryId) => {
    navigate(categoryId === 'all' ? '/products' : `/products?category=${encodeURIComponent(categoryId)}`);
  }, [navigate]);

  const handleProductSelect = useCallback((product) => {
    const next = new URLSearchParams();
    if (product?.category) {
      next.set('category', product.category);
    }
    next.set('request', product.id);
    navigate(`/products?${next.toString()}`);
  }, [navigate]);

  return (
    <div className={showPublicHeader ? 'flex min-h-screen bg-[radial-gradient(circle_at_top_right,rgb(var(--color-primary-rgb)/0.16),transparent_30%),linear-gradient(180deg,rgb(var(--color-surface-rgb))_0%,rgb(var(--color-bg-rgb))_48%,rgb(var(--color-card-rgb))_100%)] text-[var(--color-text)]' : 'flex min-h-screen'}>
      {showPublicHeader && (
        <PublicSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} isMobile={isMobile} />
      )}
      <div className={`min-w-0 flex-1 space-y-4 pb-5 sm:space-y-5 transition-all duration-300 lg:mr-[274px]`}>
        {showPublicHeader && (
          <Header
            user={user}
            showUserInfo={false}
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        )}

      <HeroSlider slides={heroSlides} />

      <section className="!mt-0 py-0">
        <AnnouncementTicker
          items={tickerItems}
          durationMs={5600}
          direction="ltr"
          ariaLabel={language === 'ar' ? 'بطاقة قرآنية متحركة' : 'Animated verse card'}
        />
      </section>

      <section id="categories" className="!mt-0 scroll-mt-28 space-y-3 sm:space-y-3.5">
        <div className="relative z-10 mx-auto flex w-full max-w-3xl justify-center px-1 sm:px-2">
          <ProductSearchBar
            products={storefrontProducts}
            language={language}
            onSelectProduct={handleProductSelect}
            forceIconRight
            placeholder={language === 'ar' ? 'بحث عن منتج..' : 'Search for a product..'}
            iconClassName="right-2.5 h-8 w-8 rounded-full border border-[#d5ad57]/35 bg-[linear-gradient(135deg,#fff8df,#e8c36d)] p-1.5 text-[#704915] shadow-[0_8px_20px_-10px_rgba(126,88,30,0.75)] dark:border-[#f0c66f]/35 dark:bg-[linear-gradient(135deg,rgba(240,198,111,0.24),rgba(185,120,31,0.16))] dark:text-[#f8dda0]"
            noResultsLabel={language === 'ar' ? 'لا يوجد منتج مطابق' : 'No matching product found'}
            className="mx-auto w-full"
            inputClassName={showPublicHeader
              ? 'h-12 rounded-full border-[#d5ad57]/45 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(255,247,218,0.78))] px-4 text-sm font-semibold text-[#3a2411] shadow-[0_18px_45px_-24px_rgba(126,88,30,0.42),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl placeholder:font-bold placeholder:text-[#3a2411] placeholder:opacity-100 focus:border-[#b9781f]/65 focus:bg-white focus:ring-0 focus:shadow-[0_0_0_3px_rgba(213,173,87,0.14),0_20px_48px_-25px_rgba(126,88,30,0.5)] dark:border-[#f0c66f]/28 dark:bg-[linear-gradient(135deg,rgba(25,20,12,0.92),rgba(240,198,111,0.09))] dark:text-[#fff7df] dark:placeholder:text-[#fff3ce] dark:placeholder:opacity-100 dark:focus:border-[#f0c66f]/62 dark:focus:bg-[#17130d] dark:focus:shadow-[0_0_0_3px_rgba(240,198,111,0.12),0_20px_48px_-25px_rgba(0,0,0,0.8)] sm:h-14 sm:text-base'
              : 'h-11 rounded-[1.25rem] border-[color:rgb(var(--color-border-rgb)/0.16)] bg-[color:rgb(var(--color-surface-rgb)/0.88)] px-4 text-sm shadow-[0_14px_34px_-30px_rgba(15,23,42,0.5)] backdrop-blur-sm focus:border-[#efc86f] focus:bg-[color:rgb(var(--color-surface-rgb)/0.96)] focus:ring-0 focus:shadow-[0_0_0_1px_rgba(239,200,111,0.58),0_0_14px_rgba(239,200,111,0.16),0_18px_38px_-30px_rgba(15,23,42,0.52)] sm:h-12 sm:rounded-[1.45rem] sm:text-[15px]'}
          />
        </div>

        <div className="relative z-0 grid grid-cols-2 gap-2 sm:gap-2.5 md:grid-cols-3 xl:grid-cols-4">
          {visibleHomepageCategories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              active={false}
              index={index}
              onSelect={handleCategorySelect}
            />
          ))}
        </div>
      </section>

      {showPublicHeader ? <StoreFooter
        hideBrand
        title="IBRA Store"
        description={language === 'ar'
          ? 'هذا هو الاختيار المناسب لك'
          : 'A calmer and cleaner mobile-first browsing experience.'}
        chips={[]}
        copyright={language === 'ar' ? (
          <>
            <span className="font-semibold tracking-[0.08em] text-[var(--color-text)]">IBRA Store</span>
            <span className="inline-flex h-1 w-1 rounded-full bg-[color:rgb(var(--color-primary-rgb)/0.55)]" />
            <span>© 2026</span>
            <span className="inline-flex h-1 w-1 rounded-full bg-[color:rgb(var(--color-primary-rgb)/0.55)]" />
            <span>جميع الحقوق محفوظة</span>
          </>
        ) : (
          <>
            <span className="font-semibold tracking-[0.08em] text-[var(--color-text)]">IBRA Store</span>
            <span className="inline-flex h-1 w-1 rounded-full bg-[color:rgb(var(--color-primary-rgb)/0.55)]" />
            <span>© 2026</span>
            <span className="inline-flex h-1 w-1 rounded-full bg-[color:rgb(var(--color-primary-rgb)/0.55)]" />
            <span>All rights reserved</span>
          </>
        )}
        metaLine=""
      /> : null}

      </div>
    </div>
  );
};

export default Dashboard;
