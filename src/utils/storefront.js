import buyCardsImage from '../assets/buyCards.webp';
import chatAppsImage from '../assets/chatApps.webp';
import gamesChargingImage from '../assets/gamesCharging.webp';
import brandIconImage from '../assets/box_.png';
import { calculateProductPrice } from './pricing';
import { getProductStatus } from './productStatus';

const CATEGORY_DISPLAY_CONFIG = {
  all: {
    image: brandIconImage,
    titleAr: 'كل الأقسام',
    titleEn: 'All Collections',
    subtitleAr: 'واجهة فاخرة لجميع المنتجات',
    subtitleEn: 'Luxury storefront overview',
  },
  apps: {
    image: chatAppsImage,
    titleAr: 'تطبيقات مميزة',
    titleEn: 'Premium Apps',
    subtitleAr: 'اشتراكات وخدمات رقمية',
    subtitleEn: 'Subscriptions and services',
  },
  games: {
    image: gamesChargingImage,
    titleAr: 'شحن الألعاب',
    titleEn: 'Game Topups',
    subtitleAr: 'تنفيذ سريع وآمن',
    subtitleEn: 'Fast secure delivery',
  },
  cards: {
    image: buyCardsImage,
    titleAr: 'بطاقات رقمية',
    titleEn: 'Digital Cards',
    subtitleAr: 'بطاقات هدايا ومدفوعات',
    subtitleEn: 'Gift and payment cards',
  },
};

const categoryOrder = { all: 0, games: 1, apps: 2, cards: 3 };

export const getStorefrontLanguage = (i18n) =>
  String(i18n?.resolvedLanguage || i18n?.language || 'ar').toLowerCase().startsWith('en') ? 'en' : 'ar';

export const getCurrencySymbol = (currencyCode = 'USD') => {
  const currencySymbolMap = {
    USD: '$',
    EGP: '£',
    GBP: '£',
    EUR: '€',
    SAR: 'SAR',
    AED: 'AED',
  };

  return currencySymbolMap[String(currencyCode || 'USD').toUpperCase()] || String(currencyCode || 'USD').toUpperCase();
};

export const formatDisplayNumber = (value, locale = 'en-US', compact = false) => {
  const amount = Number(value || 0);

  return new Intl.NumberFormat(locale, {
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 0,
  }).format(amount);
};

export const formatWalletNumber = (value, compact = false) => formatDisplayNumber(value, 'en-US', compact);

export const formatWalletAmount = (value, currencyCode = 'USD', options = {}) => {
  const { compact = false, signed = false } = options;
  const amount = Number(value || 0);
  const normalizedCurrency = String(currencyCode || 'USD').toUpperCase();
  const sign = signed ? (amount > 0 ? '+' : amount < 0 ? '-' : '') : '';

  return `${sign}${normalizedCurrency} ${formatWalletNumber(Math.abs(amount), compact)}`;
};

export const getCategoryDisplayKey = (category) => {
  const raw = String(category?.id || '').trim().toLowerCase();
  if (CATEGORY_DISPLAY_CONFIG[raw]) return raw;

  const merged = `${category?.id || ''} ${category?.name || ''} ${category?.nameAr || ''}`.toLowerCase();
  if (merged.includes('app') || merged.includes('chat') || merged.includes('دردشة') || merged.includes('تطبيق')) return 'apps';
  if (merged.includes('game') || merged.includes('لعب') || merged.includes('ألعاب')) return 'games';
  if (merged.includes('card') || merged.includes('gift') || merged.includes('بطاق')) return 'cards';

  return raw || 'all';
};

const getCategoryDisplayConfig = (category) => CATEGORY_DISPLAY_CONFIG[getCategoryDisplayKey(category)] || CATEGORY_DISPLAY_CONFIG.all;

export const getCategoryDisplayImage = (category) => getCategoryDisplayConfig(category).image || category?.image || brandIconImage;

export const getCategoryDisplayTitle = (category, language = 'ar') => {
  const config = getCategoryDisplayConfig(category);
  if (category?.id === 'all') {
    return language === 'ar' ? config.titleAr : config.titleEn;
  }
  return language === 'ar' ? (category?.nameAr || config.titleAr || category?.name) : (category?.name || config.titleEn || category?.nameAr);
};

export const getCategoryDisplaySubtitle = (category, language = 'ar') => {
  const config = getCategoryDisplayConfig(category);
  return language === 'ar' ? config.subtitleAr : config.subtitleEn;
};

export const createStorefrontProducts = (products, { language = 'ar', userGroup = 'Normal' } = {}) => (
  Array.isArray(products) ? products : []
).map((product) => ({
  ...product,
  storefrontPrice: calculateProductPrice(product, userGroup),
  storefrontStatus: getProductStatus(product, language),
})).filter((product) => product.storefrontStatus.isVisible);

export const filterStorefrontProducts = (products, { searchTerm = '', activeCategory = 'all', language = 'ar' } = {}) => {
  const normalizedSearch = String(searchTerm || '').trim().toLowerCase();

  return (Array.isArray(products) ? products : []).filter((product) => {
    const matchesCategory = activeCategory === 'all' || String(product?.category || '').trim() === activeCategory;
    if (!matchesCategory) return false;

    if (!normalizedSearch) return true;

    const haystack = [
      product?.name,
      product?.nameAr,
      product?.description,
      product?.descriptionAr,
      getCategoryDisplayTitle({ id: product?.category }, language),
    ].join(' ').toLowerCase();

    return haystack.includes(normalizedSearch);
  });
};

export const createStorefrontCategories = (categories, products, language = 'ar') => {
  const safeProducts = Array.isArray(products) ? products : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  const overview = [
    {
      id: 'all',
      image: CATEGORY_DISPLAY_CONFIG.all.image,
      title: language === 'ar' ? CATEGORY_DISPLAY_CONFIG.all.titleAr : CATEGORY_DISPLAY_CONFIG.all.titleEn,
      subtitle: language === 'ar' ? CATEGORY_DISPLAY_CONFIG.all.subtitleAr : CATEGORY_DISPLAY_CONFIG.all.subtitleEn,
      count: safeProducts.length,
      tone: 'all',
    },
    ...safeCategories.map((category) => ({
      id: String(category?.id || '').trim(),
      image: getCategoryDisplayImage(category),
      title: getCategoryDisplayTitle(category, language),
      subtitle: getCategoryDisplaySubtitle(category, language),
      count: safeProducts.filter((product) => String(product?.category || '').trim() === String(category?.id || '').trim()).length,
      tone: getCategoryDisplayKey(category),
    })),
  ];

  return overview.sort((left, right) => (categoryOrder[left.tone] ?? 99) - (categoryOrder[right.tone] ?? 99));
};
