import React, { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import useMediaStore from '../store/useMediaStore';
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
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const language = getStorefrontLanguage(i18n);
  const isRTL = language === 'ar';

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
    () => createStorefrontProducts(products, { language, userGroup: user?.group || 'Normal' }),
    [language, products, user?.group]
  );

  const storefrontCategories = useMemo(
    () => createStorefrontCategories(categories, storefrontProducts, language),
    [categories, storefrontProducts, language]
  );

  const visibleHomepageCategories = useMemo(
    () => storefrontCategories.filter((category) => category.id !== 'all'),
    [storefrontCategories]
  );

  const tickerItems = useMemo(
    () => [
      {
        id: 'ticker-welcome',
        text: language === 'ar' ? 'مرحبًا بك في IBRA' : 'Welcome to IBRA',
      },
      {
        id: 'ticker-price',
        text: language === 'ar' ? 'أسعار مناسبة كل يوم' : 'Fair prices every day',
      },
      {
        id: 'ticker-secure',
        text: language === 'ar' ? 'شراء آمن وتنفيذ سريع' : 'Secure checkout and fast delivery',
      }
    ],
    [language]
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
    <div className="space-y-6 pb-4">
      <HeroSlider slides={heroSlides} />

      <section className="py-1">
        <AnnouncementTicker
          items={tickerItems}
          durationMs={7000}
          direction="ltr"
          ariaLabel={language === 'ar' ? 'شريط ترحيبي متحرك' : 'Moving welcome strip'}
        />
      </section>

      <section id="categories" className="scroll-mt-28 space-y-4">
        <div className="premium-card w-full max-w-[360px] p-2 sm:max-w-[460px] sm:p-2.5">
          <div className="relative z-40">
            <ProductSearchBar
              products={storefrontProducts}
              language={language}
              onSelectProduct={handleProductSelect}
              placeholder={language === 'ar' ? 'ابحث عن منتج وسيظهر مباشرة أسفل البحث...' : 'Search for a product and get direct matches...'}
              noResultsLabel={language === 'ar' ? 'لا يوجد منتج مطابق' : 'No matching product found'}
              className="w-full"
              inputClassName="h-9 rounded-xl text-xs shadow-none sm:h-10 sm:text-sm"
            />
          </div>
        </div>

        <div className="relative z-0 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
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
        title={language === 'ar' ? 'تجربة تسوق رقمية أوضح' : 'A clearer digital shopping experience'}
        description={language === 'ar'
          ? 'أعدنا تنظيم الصفحة الرئيسية لتمنحك تنقلًا أسرع وقراءة أوضح، مع الحفاظ على الهوية الذهبية المميزة لـ IBRA.'
          : 'The homepage is now organized for faster navigation, clearer scanning, and better mobile comfort while keeping IBRA’s signature gold identity.'}
        chips={[
          { label: language === 'ar' ? 'المحفظة' : 'Wallet', to: '/wallet' },
          { label: language === 'ar' ? 'المنتجات' : 'Products', to: '/products' },
          { label: language === 'ar' ? 'الإعدادات' : 'Settings', to: '/settings' },
        ]}
        copyright={language === 'ar' ? '© 2026 IBRA Store. جميع الحقوق محفوظة.' : '© 2026 IBRA Store. All rights reserved.'}
        metaLine={language === 'ar' ? 'تنفيذ فوري • منتجات رقمية مختارة • دفع آمن' : 'Instant fulfilment • Curated digital goods • Secure checkout'}
      />
    </div>
  );
};

export default Dashboard;
