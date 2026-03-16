import React, { Suspense, lazy, startTransition, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Layers3, Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import useMediaStore from '../store/useMediaStore';
import ProductSearchBar from '../components/products/ProductSearchBar';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import CatalogCard from '../components/products/CatalogCard';
import ProductCardSimple from '../components/products/ProductCardSimple';
import LoadingSkeleton from '../components/products/LoadingSkeleton';
import EmptyState from '../components/products/EmptyState';
import Loader from '../components/ui/Loader';
import {
  createStorefrontCategories,
  createStorefrontProducts,
  formatDisplayNumber,
  getStorefrontLanguage,
} from '../utils/storefront';

const ProductDetailsSheet = lazy(() => import('../components/products/ProductDetailsSheet'));

const getProductsPageCopy = (language = 'ar') => (
  language === 'ar'
    ? {
        pageKicker: 'تجربة تسوق أخف وأوضح',
        catalogsTitle: 'الكاتلوجات',
        catalogsDescription: 'ابدأ من القسم المناسب أو ابحث مباشرة عن المنتج، ثم أكمل الشراء داخل نفس التجربة.',
        categoryDescription: 'منتجات هذا الكاتلوج تظهر بشكل شبكي نظيف مع صورة واسم فقط لسرعة التصفح.',
        searchPlaceholder: 'ابحث عن منتج وسيظهر مباشرة أسفل البحث...',
        noResults: 'لا يوجد منتج مطابق',
        backToCatalogs: 'العودة إلى الكاتلوجات',
        backHome: 'العودة للرئيسية',
        catalogsBadge: 'الأقسام',
        productsBadge: 'منتج',
        categoryProductsTitle: 'منتجات الكاتلوج',
        emptyCatalogsTitle: 'لا توجد كاتلوجات جاهزة للعرض',
        emptyCatalogsDescription: 'عندما تتوفر أقسام مرتبطة بمنتجات ظاهرة في المتجر ستظهر هنا تلقائيًا.',
        emptyCategoryTitle: 'لا توجد منتجات داخل هذا الكاتلوج',
        emptyCategoryDescription: 'قد يكون هذا القسم فارغًا حاليًا أو أن منتجاته غير ظاهرة في المتجر.',
      }
    : {
        pageKicker: 'Lighter and clearer storefront',
        catalogsTitle: 'Catalogs',
        catalogsDescription: 'Start from the right collection or search directly for a product, then continue purchasing in the same flow.',
        categoryDescription: 'Products in this catalog use a clean visual grid with image and name only for faster browsing.',
        searchPlaceholder: 'Search for a product and get direct matches...',
        noResults: 'No matching product found',
        backToCatalogs: 'Back to catalogs',
        backHome: 'Back home',
        catalogsBadge: 'catalogs',
        productsBadge: 'products',
        categoryProductsTitle: 'Catalog products',
        emptyCatalogsTitle: 'No catalogs are ready to display',
        emptyCatalogsDescription: 'Collections linked to visible storefront products will appear here automatically.',
        emptyCategoryTitle: 'No products inside this catalog',
        emptyCategoryDescription: 'This collection may currently be empty or its products are hidden from the storefront.',
      }
);

const Products = () => {
  const user = useAuthStore((state) => state.user);
  const products = useMediaStore((state) => state.products);
  const categories = useMediaStore((state) => state.categories);
  const isLoading = useMediaStore((state) => state.isLoading);
  const loadProducts = useMediaStore((state) => state.loadProducts);
  const { i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState('');

  const language = getStorefrontLanguage(i18n);
  const isRTL = language === 'ar';
  const copy = useMemo(() => getProductsPageCopy(language), [language]);

  const activeCategoryParam = searchParams.get('category') || '';
  const activeProductId = searchParams.get('product') || '';

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const storefrontProducts = useMemo(
    () => createStorefrontProducts(products, { language, userGroup: user?.group || 'Normal' }),
    [language, products, user?.group]
  );

  const storefrontCategories = useMemo(
    () => createStorefrontCategories(categories, storefrontProducts, language)
      .filter((category) => category.id !== 'all' && category.count > 0),
    [categories, language, storefrontProducts]
  );

  const selectedProduct = useMemo(
    () => storefrontProducts.find((product) => product.id === activeProductId) || null,
    [activeProductId, storefrontProducts]
  );

  const currentCatalog = useMemo(() => {
    if (activeCategoryParam) {
      return storefrontCategories.find((category) => category.id === activeCategoryParam) || null;
    }

    if (selectedProduct) {
      return storefrontCategories.find((category) => category.id === selectedProduct.category) || null;
    }

    return null;
  }, [activeCategoryParam, selectedProduct, storefrontCategories]);

  const catalogProducts = useMemo(
    () => (
      currentCatalog
        ? storefrontProducts.filter((product) => String(product?.category || '').trim() === currentCatalog.id)
        : []
    ),
    [currentCatalog, storefrontProducts]
  );

  useEffect(() => {
    if (isLoading) return;

    const next = new URLSearchParams(searchParams);
    let shouldReplace = false;

    if (activeCategoryParam && !storefrontCategories.some((category) => category.id === activeCategoryParam)) {
      next.delete('category');
      shouldReplace = true;
    }

    if (activeProductId && !selectedProduct) {
      next.delete('product');
      shouldReplace = true;
    }

    if (shouldReplace) {
      startTransition(() => {
        setSearchParams(next, { replace: true });
      });
    }
  }, [
    activeCategoryParam,
    activeProductId,
    isLoading,
    searchParams,
    selectedProduct,
    setSearchParams,
    storefrontCategories,
  ]);

  const openCatalog = (catalogId) => {
    const next = new URLSearchParams(searchParams);
    next.set('category', catalogId);
    next.delete('product');
    setSearchInput('');

    startTransition(() => {
      setSearchParams(next);
    });
  };

  const resetToCatalogs = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('category');
    next.delete('product');
    setSearchInput('');

    startTransition(() => {
      setSearchParams(next);
    });
  };

  const openProduct = (product) => {
    const next = new URLSearchParams(searchParams);
    next.set('category', product.category);
    next.set('product', product.id);
    setSearchInput('');

    startTransition(() => {
      setSearchParams(next);
    });
  };

  const closeProduct = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('product');

    startTransition(() => {
      setSearchParams(next);
    });
  };

  const showInitialLoading = isLoading && storefrontProducts.length === 0 && storefrontCategories.length === 0;
  const heroTitle = currentCatalog ? currentCatalog.title : copy.catalogsTitle;
  const heroDescription = currentCatalog ? copy.categoryDescription : copy.catalogsDescription;
  const metricValue = currentCatalog ? catalogProducts.length : storefrontCategories.length;
  const metricLabel = currentCatalog ? copy.productsBadge : copy.catalogsBadge;

  return (
    <div className="space-y-6 pb-4">
      <section className="premium-card-premium p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <span className="section-kicker">{copy.pageKicker}</span>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="page-heading text-[clamp(2rem,4vw,3.3rem)]">{heroTitle}</h1>
                <Badge variant="premium">
                  {formatDisplayNumber(metricValue, language === 'ar' ? 'ar-EG' : 'en-US')} {metricLabel}
                </Badge>
              </div>
              <p className="page-subtitle max-w-3xl">{heroDescription}</p>
            </div>
          </div>

          <Link
            to="/dashboard"
            className="inline-flex h-11 items-center gap-2 self-start rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.2)] bg-[color:rgb(var(--color-primary-rgb)/0.08)] px-4 text-sm font-medium text-[var(--color-text)] transition-all hover:-translate-y-0.5 hover:border-[color:rgb(var(--color-primary-rgb)/0.36)] hover:text-[var(--color-primary-hover)]"
          >
            {copy.backHome}
            <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
          </Link>
        </div>

        <div className="mt-5 space-y-3">
          <ProductSearchBar
            products={storefrontProducts}
            language={language}
            value={searchInput}
            onChange={setSearchInput}
            onSelectProduct={openProduct}
            placeholder={copy.searchPlaceholder}
            noResultsLabel={copy.noResults}
          />

          {currentCatalog && (
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" size="sm" variant="secondary" onClick={resetToCatalogs}>
                {copy.backToCatalogs}
              </Button>
            </div>
          )}
        </div>
      </section>

      {showInitialLoading && (
        <LoadingSkeleton variant={currentCatalog ? 'products' : 'catalogs'} />
      )}

      {!showInitialLoading && currentCatalog && (
        <>
          <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr),minmax(260px,0.9fr)]">
            <div className="premium-card p-5 sm:p-6">
              <div className="flex h-full flex-col justify-between gap-5">
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.18)] bg-[color:rgb(var(--color-primary-rgb)/0.08)] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-[var(--color-primary)]">
                    <Layers3 className="h-3.5 w-3.5" />
                    {copy.categoryProductsTitle}
                  </span>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[var(--color-text)]">
                      {currentCatalog.title}
                    </h2>
                    <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
                      {currentCatalog.subtitle || copy.categoryDescription}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="premium">
                    {formatDisplayNumber(catalogProducts.length, language === 'ar' ? 'ar-EG' : 'en-US')} {copy.productsBadge}
                  </Badge>
                  <Button type="button" size="sm" variant="outline" onClick={resetToCatalogs}>
                    {copy.backToCatalogs}
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[1.9rem] border border-[color:rgb(var(--color-border-rgb)/0.88)] bg-[color:rgb(var(--color-card-rgb)/0.95)]">
              <img
                src={currentCatalog.image}
                alt={currentCatalog.title}
                loading="lazy"
                decoding="async"
                className="h-full min-h-[220px] w-full object-cover"
              />
            </div>
          </section>

          {catalogProducts.length > 0 ? (
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {catalogProducts.map((product) => (
                <ProductCardSimple
                  key={product.id}
                  product={product}
                  onOpen={openProduct}
                />
              ))}
            </section>
          ) : (
            <EmptyState
              icon={Layers3}
              title={copy.emptyCategoryTitle}
              description={copy.emptyCategoryDescription}
              actionLabel={copy.backToCatalogs}
              onAction={resetToCatalogs}
            />
          )}
        </>
      )}

      {!showInitialLoading && !currentCatalog && (
        storefrontCategories.length > 0 ? (
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {storefrontCategories.map((catalog) => (
              <CatalogCard
                key={catalog.id}
                catalog={catalog}
                isRTL={isRTL}
                onOpen={openCatalog}
              />
            ))}
          </section>
        ) : (
          <EmptyState
            icon={Search}
            title={copy.emptyCatalogsTitle}
            description={copy.emptyCatalogsDescription}
          />
        )
      )}

      {selectedProduct && (
        <Suspense
          fallback={(
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/72">
              <div className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-[#0d0d10] p-6">
                <Loader />
              </div>
            </div>
          )}
        >
          <ProductDetailsSheet
            product={selectedProduct}
            isOpen={Boolean(selectedProduct)}
            onClose={closeProduct}
          />
        </Suspense>
      )}
    </div>
  );
};

export default Products;
