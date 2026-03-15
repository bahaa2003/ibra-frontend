import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import useMediaStore from '../store/useMediaStore';
import useOrderStore from '../store/useOrderStore';
import SearchBar from '../components/ui/SearchBar';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import CategoryCard from '../components/home/CategoryCard';
import TopSellingCarousel from '../components/products/TopSellingCarousel';
import {
  createStorefrontCategories,
  createStorefrontProducts,
  filterStorefrontProducts,
  formatDisplayNumber,
  getCategoryDisplayTitle,
  getCurrencySymbol,
  getStorefrontLanguage,
} from '../utils/storefront';

const Products = () => {
  const { user } = useAuthStore();
  const { products, categories, loadProducts } = useMediaStore();
  const { orders, loadOrders } = useOrderStore();
  const { i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const language = getStorefrontLanguage(i18n);
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  const currencySymbol = getCurrencySymbol(user?.currency || 'USD');
  const isRTL = language === 'ar';
  const [searchTerm, setSearchTerm] = useState('');

  const activeCategory = searchParams.get('category') || 'all';

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, [loadOrders, loadProducts]);

  const storefrontProducts = useMemo(
    () => createStorefrontProducts(products, { language, userGroup: user?.group || 'Normal' }),
    [language, products, user?.group]
  );

  const storefrontCategories = useMemo(
    () => createStorefrontCategories(categories, storefrontProducts, language),
    [categories, storefrontProducts, language]
  );

  const visibleCategories = useMemo(
    () => storefrontCategories.filter((category) => category.id !== 'all'),
    [storefrontCategories]
  );

  const filteredProducts = useMemo(
    () => filterStorefrontProducts(storefrontProducts, { searchTerm, activeCategory, language }).map((product) => ({
      ...product,
      displayName: language === 'ar' ? product.nameAr || product.name : product.name,
      displayDescription: language === 'ar' ? product.descriptionAr || product.description : product.description,
      formattedPrice: `${currencySymbol} ${formatDisplayNumber(product.storefrontPrice, locale)}`,
    })),
    [activeCategory, currencySymbol, language, locale, searchTerm, storefrontProducts]
  );

  const productSalesCount = useMemo(() => {
    return (orders || []).reduce((accumulator, order) => {
      const status = String(order?.status || '').toLowerCase();
      if (!['approved', 'completed'].includes(status)) return accumulator;

      const productId = String(order?.productId || '').trim();
      if (!productId) return accumulator;

      accumulator[productId] = (accumulator[productId] || 0) + Number(order?.quantity || 1);
      return accumulator;
    }, {});
  }, [orders]);

  const topSellingProducts = useMemo(() => {
    const ranked = [...filteredProducts].sort((left, right) => {
      const leftCount = productSalesCount[left.id] || 0;
      const rightCount = productSalesCount[right.id] || 0;
      if (leftCount !== rightCount) return rightCount - leftCount;

      return String(left.displayName || '').localeCompare(String(right.displayName || ''), language === 'ar' ? 'ar' : 'en');
    });

    return ranked.slice(0, 5).map((product) => ({
      ...product,
      salesCount: productSalesCount[product.id] || 0,
    }));
  }, [filteredProducts, language, productSalesCount]);

  const setActiveCategory = (categoryId) => {
    const next = new URLSearchParams(searchParams);
    if (categoryId === 'all') next.delete('category');
    else next.set('category', categoryId);
    setSearchParams(next);
  };

  const clearCategoryFilter = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('category');
    setSearchParams(next);
  };

  return (
    <div className="space-y-6">
      <section className="premium-card-premium p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-primary-soft)]">
              {language === 'ar' ? 'كتالوج المتجر' : 'Store Catalog'}
            </p>
            <h1 className="text-3xl font-semibold text-[var(--color-text)]">
              {language === 'ar' ? 'تصفح جميع المنتجات' : 'Browse all products'}
            </h1>
          </div>

          <Link
            to="/dashboard"
            className="inline-flex h-11 items-center gap-2 self-start rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.2)] bg-[color:rgb(var(--color-primary-rgb)/0.08)] px-4 text-sm font-medium text-[var(--color-text)] transition-all hover:-translate-y-0.5 hover:border-[color:rgb(var(--color-primary-rgb)/0.36)] hover:text-[var(--color-primary-hover)]"
          >
            {language === 'ar' ? 'العودة للرئيسية' : 'Back home'}
            <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
          </Link>
        </div>

        <div className="mt-5">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={language === 'ar' ? 'ابحث عن منتج أو قسم...' : 'Search for a product or collection...'}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-text)]">
              {language === 'ar' ? 'الفئات' : 'Categories'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {activeCategory !== 'all' && (
              <Button type="button" variant="ghost" size="sm" onClick={clearCategoryFilter}>
                {language === 'ar' ? 'كل المنتجات' : 'All products'}
              </Button>
            )}
            <Badge variant="premium">{filteredProducts.length}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {visibleCategories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              active={category.id === activeCategory}
              activeLabel={language === 'ar' ? 'نشط' : 'Active'}
              index={index}
              onSelect={setActiveCategory}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-[var(--color-text)]">
            {language === 'ar' ? 'الأكثر مبيعًا' : 'Best Sellers'}
          </h2>
          <Badge variant="premium">{topSellingProducts.length}</Badge>
        </div>

        <TopSellingCarousel
          products={topSellingProducts}
          emptyTitle={language === 'ar' ? 'لا توجد منتجات رائجة بهذا الفلتر' : 'No top sellers for this filter'}
          emptyDescription={language === 'ar'
            ? 'جرّب قسمًا آخر أو امسح البحث لإظهار المنتجات الرائجة.'
            : 'Try another collection or clear the search to reveal top-selling products.'}
          categoryResolver={(product) => getCategoryDisplayTitle({ id: product.category }, language)}
          buyLabel={language === 'ar' ? 'اشتر الآن' : 'Buy now'}
          soldLabel={language === 'ar' ? 'طلب' : 'orders'}
          trendingLabel={language === 'ar' ? 'رائج' : 'Trending'}
          isRTL={isRTL}
        />
      </section>
    </div>
  );
};

export default Products;
