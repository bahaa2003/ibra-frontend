import React, { lazy, Suspense, startTransition, useCallback, useEffect, useMemo, useState } from 'react';
import { Layers3, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import useMediaStore from '../store/useMediaStore';
import useGroupStore from '../store/useGroupStore';
import useSystemStore from '../store/useSystemStore';
import ProductSearchBar from '../components/products/ProductSearchBar';
import CatalogCard from '../components/products/CatalogCard';
import ProductCardSimple from '../components/products/ProductCardSimple';
import LoadingSkeleton from '../components/products/LoadingSkeleton';
import EmptyState from '../components/products/EmptyState';
import {
  createStorefrontCategories,
  createStorefrontProducts,
  getStorefrontLanguage,
} from '../utils/storefront';

const ProductPurchaseSheet = lazy(() => import('../components/products/ProductPurchaseSheet'));

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
        emptyCategoryTitle: 'لا يوجد بها عناصر',
        emptyCategoryDescription: 'هذا القسم فارغ حاليًا، ويمكنك العودة لاختيار قسم آخر.',
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
        emptyCategoryTitle: 'There are no items in this category',
        emptyCategoryDescription: 'This category is currently empty, and you can return to choose another one.',
      }
);

const Products = () => {
  const user = useAuthStore((state) => state.user);
  const products = useMediaStore((state) => state.products);
  const categories = useMediaStore((state) => state.categories);
  const isLoading = useMediaStore((state) => state.isLoading);
  const loadProducts = useMediaStore((state) => state.loadProducts);
  const groupsLastLoadedAt = useGroupStore((state) => state.groupsLastLoadedAt);
  const loadCurrencies = useSystemStore((state) => state.loadCurrencies);
  const { i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchResetSignal, setSearchResetSignal] = useState(0);

  const language = getStorefrontLanguage(i18n);
  const isRTL = language === 'ar';
  const copy = useMemo(() => getProductsPageCopy(language), [language]);

  const activeCategoryParam = searchParams.get('category') || '';
  const activeRequestId = searchParams.get('request') || '';

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    let cancelled = false;

    const preloadPurchaseFlow = () => {
      if (cancelled) return;
      import('../components/products/ProductPurchaseSheet');
      loadCurrencies();
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(preloadPurchaseFlow, { timeout: 1400 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(idleId);
      };
    }

    const timeoutId = window.setTimeout(preloadPurchaseFlow, 900);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [loadCurrencies]);

  const storefrontProducts = useMemo(
    () => createStorefrontProducts(products, {
      language,
      userGroup: user?.groupId || user?.group || 'Normal',
      userGroupPercentage: user?.groupPercentage ?? null,
    }),
    [groupsLastLoadedAt, language, products, user?.group, user?.groupId, user?.groupPercentage]
  );

  const storefrontCategories = useMemo(
    () => createStorefrontCategories(categories, storefrontProducts, language)
      .filter((category) => category.id !== 'all'),
    [categories, language, storefrontProducts]
  );

  const selectedProduct = useMemo(
    () => storefrontProducts.find((product) => product.id === activeRequestId) || null,
    [activeRequestId, storefrontProducts]
  );

  const currentCatalog = useMemo(() => {
    if (!activeCategoryParam) return null;
    return storefrontCategories.find((category) => category.id === activeCategoryParam) || null;
  }, [activeCategoryParam, storefrontCategories]);

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

    if (activeRequestId && !selectedProduct) {
      next.delete('request');
      shouldReplace = true;
    }

    if (shouldReplace) {
      startTransition(() => {
        setSearchParams(next, { replace: true });
      });
    }
  }, [
    activeCategoryParam,
    activeRequestId,
    isLoading,
    searchParams,
    selectedProduct,
    setSearchParams,
    storefrontCategories,
  ]);

  const openCatalog = useCallback((catalogId) => {
    const next = new URLSearchParams(searchParams);
    next.set('category', catalogId);
    next.delete('request');
    setSearchResetSignal((value) => value + 1);

    startTransition(() => {
      setSearchParams(next);
    });
  }, [searchParams, setSearchParams]);

  const resetToCatalogs = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete('category');
    next.delete('request');
    setSearchResetSignal((value) => value + 1);

    startTransition(() => {
      setSearchParams(next);
    });
  }, [searchParams, setSearchParams]);

  const openProduct = useCallback((product) => {
    const next = new URLSearchParams(searchParams);
    next.set('request', product.id);

    startTransition(() => {
      setSearchParams(next);
    });
  }, [searchParams, setSearchParams]);

  const closeProduct = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete('request');

    startTransition(() => {
      setSearchParams(next);
    });
  }, [searchParams, setSearchParams]);

  const showInitialLoading = isLoading && storefrontProducts.length === 0 && storefrontCategories.length === 0;

  return (
    <div className="space-y-6 pb-4">
      <section className="border-0 bg-transparent p-0 shadow-none">
        <div className="mx-auto flex w-full max-w-5xl justify-center">
          <ProductSearchBar
            products={storefrontProducts}
            language={language}
            resetSignal={searchResetSignal}
            onSelectProduct={openProduct}
            placeholder={copy.searchPlaceholder}
            noResultsLabel={copy.noResults}
            className="mx-auto w-full"
            inputClassName="h-11 rounded-[1.35rem] border-[color:rgb(var(--color-border-rgb)/0.18)] bg-[color:rgb(var(--color-surface-rgb)/0.92)] text-sm shadow-[0_16px_40px_-32px_rgba(15,23,42,0.55)] focus:border-[#efc86f] focus:bg-[color:rgb(var(--color-surface-rgb)/0.98)] focus:ring-0 focus:shadow-[0_0_0_1px_rgba(239,200,111,0.68),0_0_16px_rgba(239,200,111,0.18),0_20px_40px_-34px_rgba(15,23,42,0.58)] sm:h-12 sm:rounded-[1.55rem]"
          />
        </div>
      </section>

      {showInitialLoading && (
        <LoadingSkeleton variant={currentCatalog ? 'products' : 'catalogs'} />
      )}

      {!showInitialLoading && currentCatalog && (
        <>
          {catalogProducts.length > 0 ? (
            <section className="grid grid-cols-3 gap-0">
              {catalogProducts.map((product) => (
                <ProductCardSimple key={product.id} product={product} onOpen={openProduct} />
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

      {selectedProduct ? (
        <Suspense fallback={<div className="fixed inset-0 z-[75] bg-black/18" />}>
          <ProductPurchaseSheet
            product={selectedProduct}
            isOpen={Boolean(selectedProduct)}
            onClose={closeProduct}
          />
        </Suspense>
      ) : null}
    </div>
  );
};

export default Products;
