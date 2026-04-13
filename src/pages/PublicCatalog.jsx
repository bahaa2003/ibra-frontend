import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Layers3, Search, ShoppingBag, ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import apiClient from '../services/client';

/* ─── Copy ─────────────────────────────────────────────────────────────────── */

const getCopy = (lang = 'ar') =>
  lang === 'ar'
    ? {
        heroTitle: 'خدماتنا',
        heroSubtitle: 'تصفّح كل ما نقدمه من خدمات ومنتجات رقمية. سجّل الآن للحصول على الأسعار!',
        loginCta: 'سجل الدخول لرؤية الأسعار',
        loginBtn: 'تسجيل الدخول',
        registerBtn: 'إنشاء حساب',
        searchPlaceholder: 'ابحث عن خدمة...',
        noResults: 'لا توجد نتائج مطابقة',
        categories: 'الأقسام',
        allProducts: 'كل الخدمات',
        backToCategories: 'العودة للأقسام',
        back: 'رجوع',
        minQty: 'الحد الأدنى',
        maxQty: 'الحد الأقصى',
        emptyTitle: 'لا توجد خدمات متاحة حاليًا',
        emptyDescription: 'سيتم عرض الخدمات فور إضافتها.',
        subCategories: 'الأقسام الفرعية',
        products: 'المنتجات',
      }
    : {
        heroTitle: 'Our Services',
        heroSubtitle: 'Browse all the digital services we offer. Register now to see pricing!',
        loginCta: 'Login to view prices',
        loginBtn: 'Login',
        registerBtn: 'Create Account',
        searchPlaceholder: 'Search for a service...',
        noResults: 'No matching results',
        categories: 'Categories',
        allProducts: 'All Services',
        backToCategories: 'Back to Categories',
        back: 'Back',
        minQty: 'Min',
        maxQty: 'Max',
        emptyTitle: 'No services available yet',
        emptyDescription: 'Services will appear here once added.',
        subCategories: 'Sub-categories',
        products: 'Products',
      };

/* ─── Price Badge ──────────────────────────────────────────────────────────── */

const PriceBadge = ({ isArabic, onClick }) => (
  <button
    onClick={onClick}
    className="group inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-600 transition-all hover:from-amber-500/20 hover:to-orange-500/20 hover:border-amber-500/30 hover:shadow-sm"
  >
    <Lock className="h-3 w-3 transition-transform group-hover:scale-110" />
    <span>{isArabic ? 'سجل الدخول لرؤية الأسعار' : 'Login to view prices'}</span>
  </button>
);

/* ─── Category Card ────────────────────────────────────────────────────────── */

const PublicCategoryCard = ({ category, isArabic, hasChildren, onClick }) => (
  <button
    onClick={() => onClick(category._id || category.id)}
    className="group flex flex-col items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-center transition-all hover:border-[var(--color-primary)]/30 hover:shadow-lg hover:shadow-[var(--color-primary)]/5 hover:-translate-y-0.5"
  >
    {category.image ? (
      <img
        src={category.image}
        alt={isArabic ? category.nameAr || category.name : category.name}
        className="h-16 w-16 rounded-xl object-cover transition-transform group-hover:scale-105"
      />
    ) : (
      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-primary)]/5">
        <Layers3 className="h-7 w-7 text-[var(--color-primary)]" />
      </div>
    )}
    <span className="text-sm font-semibold text-[var(--color-text)] line-clamp-2">
      {isArabic ? category.nameAr || category.name : category.name}
    </span>
    {hasChildren && (
      <span className="inline-flex items-center gap-0.5 text-[10px] text-[var(--color-primary)] font-medium">
        {isArabic ? 'أقسام فرعية' : 'Sub-categories'}
        <ChevronRight className="h-3 w-3" />
      </span>
    )}
  </button>
);

/* ─── Product Card ─────────────────────────────────────────────────────────── */

const PublicProductCard = ({ product, isArabic, onLoginClick }) => (
  <div className="group flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden transition-all hover:border-[var(--color-primary)]/20 hover:shadow-md">
    {product.image ? (
      <div className="relative h-32 overflow-hidden bg-[var(--color-bg)]">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
    ) : (
      <div className="flex h-32 items-center justify-center bg-gradient-to-br from-[var(--color-primary)]/8 to-[var(--color-primary)]/3">
        <ShoppingBag className="h-10 w-10 text-[var(--color-primary)]/40" />
      </div>
    )}
    <div className="flex flex-1 flex-col gap-2 p-3">
      <h3 className="text-sm font-semibold text-[var(--color-text)] line-clamp-2 leading-snug">
        {product.name}
      </h3>
      {product.description && (
        <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">
          {product.description}
        </p>
      )}
      <div className="mt-auto flex items-center gap-2 text-[10px] text-[var(--color-text-secondary)]">
        <span>{isArabic ? 'الحد الأدنى' : 'Min'}: {product.minQty}</span>
        <span>·</span>
        <span>{isArabic ? 'الحد الأقصى' : 'Max'}: {product.maxQty}</span>
      </div>
      <PriceBadge isArabic={isArabic} onClick={onLoginClick} />
    </div>
  </div>
);

/* ─── Breadcrumb ───────────────────────────────────────────────────────────── */

const Breadcrumb = ({ trail, isArabic, onNavigate }) => (
  <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm">
    <button
      onClick={() => onNavigate(null)}
      className="text-[var(--color-primary)] hover:underline font-medium"
    >
      {isArabic ? 'الرئيسية' : 'Home'}
    </button>
    {trail.map((crumb) => (
      <span key={crumb._id || crumb.id} className="flex items-center gap-1">
        <ChevronRight className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
        <button
          onClick={() => onNavigate(crumb._id || crumb.id)}
          className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:underline transition-colors"
        >
          {isArabic ? crumb.nameAr || crumb.name : crumb.name}
        </button>
      </span>
    ))}
  </nav>
);

/* ─── Main Page ────────────────────────────────────────────────────────────── */

const PublicCatalog = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const isArabic = String(i18n.resolvedLanguage || i18n.language || 'ar').toLowerCase().startsWith('ar');
  const copy = useMemo(() => getCopy(isArabic ? 'ar' : 'en'), [isArabic]);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentParentId, setCurrentParentId] = useState(null);

  // If authenticated, redirect to /products
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/products', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Fetch public catalog
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    apiClient.publicCatalog
      .fetch()
      .then((data) => {
        if (mounted) {
          setCategories(data.categories || []);
          setProducts(data.products || []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const handleLoginClick = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  // ── Hierarchy helpers ──────────────────────────────────────────────────

  /** Bulletproof parent ID extractor — handles string, ObjectId, populated object, undefined, empty string */
  const getParentId = useCallback((cat) => {
    if (!cat || !cat.parentCategory) return null;
    const p = cat.parentCategory;
    if (typeof p === 'object') return p._id || p.id || String(p) || null;
    if (typeof p === 'string') { const trimmed = p.trim(); return trimmed || null; }
    return String(p) || null;
  }, []);

  // Map of parentId → array of child categories
  const childrenMap = useMemo(() => {
    const map = new Map();
    for (const cat of categories) {
      const parentId = getParentId(cat);
      if (!map.has(parentId)) map.set(parentId, []);
      map.get(parentId).push(cat);
    }
    return map;
  }, [categories, getParentId]);

  // Check if a category has children
  const hasChildren = useCallback(
    (catId) => (childrenMap.get(catId) || []).length > 0,
    [childrenMap]
  );

  // Get categories at current level — direct filter with robust string comparison
  const currentCategories = useMemo(
    () => categories.filter((cat) => {
      const pid = getParentId(cat);
      if (currentParentId === null) return pid === null;
      return String(pid || '').trim() === String(currentParentId || '').trim();
    }),
    [categories, currentParentId, getParentId]
  );

  // Build breadcrumb trail
  const breadcrumbTrail = useMemo(() => {
    if (!currentParentId) return [];
    const catMap = new Map(categories.map((c) => [c._id || c.id, c]));
    const trail = [];
    let id = currentParentId;
    while (id) {
      const cat = catMap.get(id);
      if (!cat) break;
      trail.unshift(cat);
      id = getParentId(cat);
    }
    return trail;
  }, [categories, currentParentId]);

  // Get all descendant category IDs (recursive) for product filtering
  const getDescendantIds = useCallback((parentId) => {
    const ids = new Set();
    const queue = [parentId];
    while (queue.length > 0) {
      const id = queue.shift();
      const children = childrenMap.get(id) || [];
      for (const child of children) {
        ids.add(child._id || child.id);
        queue.push(child._id || child.id);
      }
    }
    return ids;
  }, [childrenMap]);

  // Products for current view
  const currentProducts = useMemo(() => {
    if (!currentParentId) return searchTerm ? products : [];
    // Show products belonging to this category or any descendant
    const relevantIds = new Set([currentParentId, ...getDescendantIds(currentParentId)]);
    return products.filter((p) => relevantIds.has(p.category));
  }, [currentParentId, getDescendantIds, products, searchTerm]);

  // Filter by search
  const filteredProducts = useMemo(() => {
    const source = searchTerm ? products : currentProducts;
    if (!searchTerm.trim()) return source;
    const q = searchTerm.toLowerCase();
    return source.filter(
      (p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
    );
  }, [currentProducts, products, searchTerm]);

  // Handle category click
  const handleCategoryClick = useCallback((catId) => {
    if (hasChildren(catId)) {
      setCurrentParentId(catId);
      setSearchTerm('');
    } else {
      setCurrentParentId(catId);
      setSearchTerm('');
    }
  }, [hasChildren]);

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-bg)] px-4 pb-8 pt-10">
        <div className="pointer-events-none absolute -top-24 right-8 h-48 w-48 rounded-full bg-[var(--color-primary)]/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-amber-500/8 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
            {copy.heroTitle}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--color-text-secondary)] sm:text-base">
            {copy.heroSubtitle}
          </p>

          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--color-primary)]/20 transition-all hover:shadow-xl hover:shadow-[var(--color-primary)]/30 hover:-translate-y-0.5"
            >
              {copy.loginBtn}
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2.5 text-sm font-semibold text-[var(--color-text)] transition-all hover:bg-[var(--color-hover)]"
            >
              {copy.registerBtn}
            </button>
          </div>
        </div>
      </section>

      {/* ── Search ────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-4xl px-4 pt-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={copy.searchPlaceholder}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-10 pr-4 text-sm text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-primary)]"
          />
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-[var(--color-surface)]" />
            ))}
          </div>
        ) : categories.length === 0 && products.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Layers3 className="h-12 w-12 text-[var(--color-text-secondary)]/40" />
            <h2 className="text-lg font-semibold text-[var(--color-text)]">{copy.emptyTitle}</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">{copy.emptyDescription}</p>
          </div>
        ) : (
          <>
            {/* Breadcrumb */}
            {currentParentId && (
              <Breadcrumb
                trail={breadcrumbTrail}
                isArabic={isArabic}
                onNavigate={setCurrentParentId}
              />
            )}

            {/* Sub-categories at current level */}
            {!searchTerm && currentCategories.length > 0 && (
              <>
                <h2 className="mb-3 text-lg font-bold text-[var(--color-text)]">
                  {currentParentId ? copy.subCategories : copy.categories}
                </h2>
                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {currentCategories.map((cat) => (
                    <PublicCategoryCard
                      key={cat._id || cat.id}
                      category={cat}
                      isArabic={isArabic}
                      hasChildren={hasChildren(cat._id || cat.id)}
                      onClick={handleCategoryClick}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Products */}
            {filteredProducts.length > 0 && (
              <>
                {!searchTerm && currentParentId && (
                  <h2 className="mb-3 text-lg font-bold text-[var(--color-text)]">
                    {copy.products}
                  </h2>
                )}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <PublicProductCard
                      key={product._id || product.id}
                      product={product}
                      isArabic={isArabic}
                      onLoginClick={handleLoginClick}
                    />
                  ))}
                </div>
              </>
            )}

            {/* No search results */}
            {searchTerm && filteredProducts.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <Search className="h-8 w-8 text-[var(--color-text-secondary)]/40" />
                <p className="text-sm text-[var(--color-text-secondary)]">{copy.noResults}</p>
              </div>
            )}

            {/* Back button when inside a category with no sub-cats and no products */}
            {!searchTerm && currentParentId && currentCategories.length === 0 && filteredProducts.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <Layers3 className="h-10 w-10 text-[var(--color-text-secondary)]/30" />
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {isArabic ? 'هذا القسم فارغ حاليًا' : 'This category is currently empty'}
                </p>
                <button
                  onClick={() => setCurrentParentId(null)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover)]"
                >
                  {isArabic ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                  {copy.backToCategories}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PublicCatalog;
