import React, { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import useMediaStore from '../store/useMediaStore';
import useGroupStore from '../store/useGroupStore';
import HeroSlider from '../components/home/HeroSlider';
import AnnouncementTicker from '../components/home/AnnouncementTicker';
import CategoryCard from '../components/home/CategoryCard';
import ProductSearchBar from '../components/products/ProductSearchBar';
import StoreFooter from '../components/home/StoreFooter';
import buyCardsImage from '../assets/buyCards.webp';
import chatAppsImage from '../assets/chatApps.webp';
import gamesChargingImage from '../assets/gamesCharging.webp';
import {
  createStorefrontCategories,
  createStorefrontProducts,
  getStorefrontLanguage,
} from '../utils/storefront';

const Dashboard = () => {
  const { user, refreshProfile } = useAuthStore();
  const { categories, products, loadProducts } = useMediaStore();
  const groupsLastLoadedAt = useGroupStore((state) => state.groupsLastLoadedAt);
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const language = getStorefrontLanguage(i18n);

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
        text: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
      },
      {
        id: 'ticker-verse',
        text: 'رِجَالٌ لَّا تُلْهِيهِمْ تِجَارَةٌ وَلَا بَيْعٌ عَن ذِكْرِ اللَّهِ',
      },
      {
        id: 'ticker-closing',
        text: 'صَدَقَ اللَّهُ العَظِيمُ',
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
    <div className="space-y-4 pb-5 sm:space-y-5">
      <HeroSlider slides={heroSlides} />

      <section className="py-1">
        <AnnouncementTicker
          items={tickerItems}
          durationMs={5600}
          direction="ltr"
          ariaLabel={language === 'ar' ? 'بطاقة قرآنية متحركة' : 'Animated verse card'}
        />
      </section>

      <section id="categories" className="scroll-mt-28 space-y-3 sm:space-y-3.5">
        <div className="relative z-10 mx-auto flex w-full max-w-5xl justify-center px-0.5 sm:px-2">
          <ProductSearchBar
            products={storefrontProducts}
            language={language}
            onSelectProduct={handleProductSelect}
            forceIconRight
            placeholder={language === 'ar' ? 'ابحث عن منتج وسيظهر مباشرة أسفل البحث...' : 'Search for a product and get direct matches...'}
            noResultsLabel={language === 'ar' ? 'لا يوجد منتج مطابق' : 'No matching product found'}
            className="mx-auto w-full"
            inputClassName="h-11 rounded-[1.25rem] border-[color:rgb(var(--color-border-rgb)/0.16)] bg-[color:rgb(var(--color-surface-rgb)/0.88)] px-4 text-sm shadow-[0_14px_34px_-30px_rgba(15,23,42,0.5)] backdrop-blur-sm focus:border-[#efc86f] focus:bg-[color:rgb(var(--color-surface-rgb)/0.96)] focus:ring-0 focus:shadow-[0_0_0_1px_rgba(239,200,111,0.58),0_0_14px_rgba(239,200,111,0.16),0_18px_38px_-30px_rgba(15,23,42,0.52)] sm:h-12 sm:rounded-[1.45rem] sm:text-[15px]"
          />
        </div>

        <div className="relative z-0 grid grid-cols-3 gap-2 sm:gap-2.5 md:grid-cols-3 xl:grid-cols-4">
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

      <StoreFooter
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
      />
    </div>
  );
};

export default Dashboard;
