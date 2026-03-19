import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockProducts, mockCategories } from '../data/mockData';
import apiClient from '../services/client';

<<<<<<< HEAD
const PRODUCTS_CACHE_TTL = 5 * 60 * 1000;
let productsRequest = null;

=======
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
const asNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const resolveCategoryId = (value, categories) => {
  const raw = String(value || '').trim();
  const matched = (categories || []).find(
    (c) => c.id === raw || c.name === raw || c.nameAr === raw
  );
  return matched?.id || raw || categories?.[0]?.id || '';
};

<<<<<<< HEAD
const buildProductSearchIndex = (product = {}) => String([
  product?.name,
  product?.nameAr,
  product?.description,
  product?.descriptionAr,
  product?.externalProductName,
].join(' '))
  .replace(/[\u0000-\u001F\u007F]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

=======
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
const normalizeProductRecord = (product = {}, categories = mockCategories) => {
  const minimumOrderQty = asNumber(product.minimumOrderQty ?? product.minQty, 1);
  const maximumOrderQtyRaw = asNumber(product.maximumOrderQty ?? product.maxQty, 999);
  const maximumOrderQty = Math.max(maximumOrderQtyRaw, minimumOrderQty);
  const trackInventory = Boolean(product.trackInventory);
  const lowStockThreshold = asNumber(product.lowStockThreshold, 50);

  const normalized = {
    ...product,
    category: resolveCategoryId(product.category, categories),
    status: product.status || 'active',
    productStatus: product.productStatus || 'available',
    isVisibleInStore: product.isVisibleInStore !== false,
    showWhenUnavailable: Boolean(product.showWhenUnavailable),
    enableSchedule: Boolean(product.enableSchedule),
    scheduledStartAt: product.scheduledStartAt || null,
    scheduledEndAt: product.scheduledEndAt || null,
    scheduleVisibilityMode: product.scheduleVisibilityMode || 'hide',
    pauseSales: Boolean(product.pauseSales),
    pauseReason: product.pauseReason || '',
    internalNotes: product.internalNotes || '',
    minimumOrderQty,
    maximumOrderQty,
    stepQty: Math.max(asNumber(product.stepQty, 1), 1),
    trackInventory,
    stockQuantity: asNumber(product.stockQuantity, 999),
    lowStockThreshold: Math.max(lowStockThreshold, 0),
    hideWhenOutOfStock: Boolean(product.hideWhenOutOfStock),
    showOutOfStockLabel: product.showOutOfStockLabel !== false,
    supplierId: product.supplierId || '',
    externalProductId: product.externalProductId || '',
    externalProductName: product.externalProductName || '',
    autoFulfillmentEnabled: product.autoFulfillmentEnabled !== false,
    fallbackSupplierId: product.fallbackSupplierId || '',
    supplierFieldMappings: Array.isArray(product.supplierFieldMappings) ? product.supplierFieldMappings : [],
    externalPricingMode: product.externalPricingMode || 'use_local_price',
    supplierMarginType: product.supplierMarginType || 'fixed',
    supplierMarginValue: asNumber(product.supplierMarginValue, 0),
    supplierNotes: product.supplierNotes || '',
<<<<<<< HEAD
    searchIndex: product.searchIndex || buildProductSearchIndex(product),
=======
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
  };

  normalized.minQty = normalized.minimumOrderQty;
  normalized.maxQty = normalized.maximumOrderQty;

  if (!normalized.trackInventory) {
    normalized.stockQuantity = 999;
    normalized.lowStockThreshold = 0;
    normalized.hideWhenOutOfStock = false;
    normalized.showOutOfStockLabel = true;
  }

  // Final availability guard: when a product is marked "available",
  // recover conflicting flags that can silently keep it hidden/unbuyable.
  if (normalized.productStatus === 'available') {
    normalized.status = 'active';
    normalized.isVisibleInStore = true;
    normalized.showWhenUnavailable = false;
    normalized.pauseSales = false;
    normalized.pauseReason = '';

    if (normalized.trackInventory && normalized.stockQuantity <= 0) {
      normalized.stockQuantity = Math.max(1, normalized.lowStockThreshold || 1);
    }
  }

  return normalized;
};

const normalizeProducts = (products, categories = mockCategories) => {
<<<<<<< HEAD
  if (!Array.isArray(products)) {
=======
  if (!Array.isArray(products) || products.length === 0) {
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
    return mockProducts.map((p) => normalizeProductRecord(p, categories));
  }
  return products.map((p) => normalizeProductRecord(p, categories));
};

const useMediaStore = create(
  persist(
    (set, get) => ({
      products: normalizeProducts(mockProducts, mockCategories),
      categories: mockCategories,
      isLoading: false,
      error: null,
<<<<<<< HEAD
      lastLoadedAt: 0,
=======
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41

      resetProducts: () => {
        set({
          products: normalizeProducts(mockProducts, mockCategories),
<<<<<<< HEAD
          categories: mockCategories,
          lastLoadedAt: 0,
        });
      },

      loadProducts: ({ force = false } = {}) => {
        const state = get();
        const hasProducts = Array.isArray(state.products);
        const hasCategories = Array.isArray(state.categories) && state.categories.length > 0;
        const isFresh = hasProducts && hasCategories && (Date.now() - Number(state.lastLoadedAt || 0) < PRODUCTS_CACHE_TTL);

        if (!force && isFresh) {
          return Promise.resolve({
            products: state.products,
            categories: state.categories,
          });
        }

        if (productsRequest) {
          return productsRequest;
        }

        set({ isLoading: true, error: null });

        productsRequest = Promise.all([apiClient.products.list(), apiClient.categories.list()])
=======
          categories: mockCategories
        });
      },

      loadProducts: () => {
        set({ isLoading: true, error: null });
        return Promise.all([apiClient.products.list(), apiClient.categories.list()])
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
          .then(([products, categories]) => {
            const safeCategories = Array.isArray(categories) && categories.length
              ? categories
              : mockCategories;

            set({
              products: normalizeProducts(products, safeCategories),
              categories: safeCategories,
              isLoading: false,
              error: null,
<<<<<<< HEAD
              lastLoadedAt: Date.now(),
=======
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
            });
          })
          .catch((error) => {
            const { products, categories } = get();
<<<<<<< HEAD
            if (!Array.isArray(products)) {
=======
            if (!Array.isArray(products) || products.length === 0) {
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
              set({ products: normalizeProducts(mockProducts, categories || mockCategories) });
            }
            if (!Array.isArray(categories) || categories.length === 0) {
              set({ categories: mockCategories });
            }

            set({
              isLoading: false,
              error: error?.message || null,
            });
<<<<<<< HEAD
          })
          .finally(() => {
            productsRequest = null;
          });

        return productsRequest;
=======
          });
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
      },

      addProduct: async (product) => {
        const categories = get().categories || [];
        const newProduct = normalizeProductRecord(
          { ...product, id: product.id || `p${Date.now()}` },
          categories
        );

        const created = await apiClient.products.create(newProduct);
        set((state) => ({
<<<<<<< HEAD
          products: [...state.products, normalizeProductRecord(created || newProduct, state.categories)],
          lastLoadedAt: Date.now(),
=======
          products: [...state.products, normalizeProductRecord(created || newProduct, state.categories)]
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
        }));
        return created || newProduct;
      },

      updateProduct: async (id, updates) => {
        const categories = get().categories || [];
        const current = get().products.find((p) => p.id === id) || {};
        const safeUpdates = normalizeProductRecord(
          { ...current, ...updates, id },
          categories
        );

        const updated = await apiClient.products.update(id, safeUpdates);
        set((state) => ({
          products: state.products.map((p) => (
            p.id === id
              ? normalizeProductRecord(updated || safeUpdates, state.categories)
              : p
<<<<<<< HEAD
          )),
          lastLoadedAt: Date.now(),
=======
          ))
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
        }));
        return updated || safeUpdates;
      },

      deleteProduct: (id) => {
        apiClient.products.delete(id).then(() => {
          set((state) => ({
<<<<<<< HEAD
            products: state.products.filter((p) => p.id !== id),
            lastLoadedAt: Date.now(),
=======
            products: state.products.filter((p) => p.id !== id)
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
          }));
        });
      },

      // Category Actions
      addCategory: (category) => {
        const newCategory = {
          ...category,
          id: category.id || `c${Date.now()}`
        };
        apiClient.categories.create(newCategory).then((created) => {
          set((state) => ({
<<<<<<< HEAD
            categories: [...state.categories, created || newCategory],
            lastLoadedAt: Date.now(),
=======
            categories: [...state.categories, created || newCategory]
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
          }));
        });
      },
      
      deleteCategory: (id) => {
        apiClient.categories.delete(id).then(() => {
          set((state) => {
            const toDelete = state.categories.find((c) => c.id === id);
            const shouldDeleteProduct = (p) => {
              const raw = String(p.category || '').trim();
              if (!toDelete) return raw === id;
              return raw === id || raw === toDelete.name || raw === toDelete.nameAr;
            };

            return {
              categories: state.categories.filter((c) => c.id !== id),
              products: state.products.filter((p) => !shouldDeleteProduct(p)),
<<<<<<< HEAD
              lastLoadedAt: Date.now(),
=======
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
            };
          });
        });
      },

<<<<<<< HEAD
      fetchProducts: async () => get().loadProducts({ force: true })
=======
      fetchProducts: async () => {
        set({ isLoading: true });
        try {
          const data = await apiClient.products.list();
          const categories = get().categories || mockCategories;
          set({ products: normalizeProducts(data, categories), isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      }
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
    }),
    {
      name: 'products-storage',
      migrate: (persistedState) => {
        if (persistedState && persistedState.products) {
          const categories = Array.isArray(persistedState.categories) && persistedState.categories.length
            ? persistedState.categories
            : mockCategories;
          persistedState.products = normalizeProducts(persistedState.products, categories);
          persistedState.categories = categories;
        }
        return persistedState;
      }
    }
  )
);

export default useMediaStore;
