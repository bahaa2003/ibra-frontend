/**
 * realApi.js — Real HTTP API provider
 *
 * Replaces mockApi.js when VITE_DATA_PROVIDER=real.
 * All methods conform to the same interface contract as mockApi so that
 * Zustand stores work without modification.
 *
 * BE responses are wrapped in: { success, message, data }
 * Adapter helpers unwrap responses and normalise field names
 * (_id → id, uppercase roles/statuses → lowercase, etc.)
 */

import axios from 'axios';

// ─── Axios instance ──────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const http = axios.create({
  baseURL: API_BASE,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Token helpers ───────────────────────────────────────────────────────────

const getStoredToken = () => {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token || null;
  } catch {
    return null;
  }
};

const setStoredToken = (token) => {
  try {
    const raw = localStorage.getItem('auth-storage');
    const parsed = raw ? JSON.parse(raw) : { state: {} };
    parsed.state = { ...parsed.state, token };
    localStorage.setItem('auth-storage', JSON.stringify(parsed));
  } catch { /* ignore */ }
};

// ─── Request interceptor: attach JWT ─────────────────────────────────────────

http.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: unwrap envelope ───────────────────────────────────

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Network error';
    const wrapped = new Error(msg);
    wrapped.status = error.response?.status;
    wrapped.code = error.response?.data?.code;
    return Promise.reject(wrapped);
  }
);

// ─── Adapter / Mapper utilities ──────────────────────────────────────────────

/** Unwrap the standard BE envelope: { success, data } → data */
const unwrap = (res) => res.data?.data ?? res.data;

/** Normalise a single user object from BE to FE shape */
const normaliseUser = (u) => {
  if (!u) return null;
  const id = u._id || u.id;

  // Flatten populated groupId: BE may return { _id, name, percentage } object
  const rawGroup = u.group || u.groupId;
  const groupName = typeof rawGroup === 'object' && rawGroup !== null
    ? (rawGroup.name || '')
    : (rawGroup || '');
  const groupId = typeof rawGroup === 'object' && rawGroup !== null
    ? (rawGroup._id || rawGroup.id || '')
    : (rawGroup || '');

  // Flatten populated currency ref if it were ever an object
  const rawCurrency = u.currency;
  const currency = typeof rawCurrency === 'object' && rawCurrency !== null
    ? (rawCurrency.code || rawCurrency._id || '')
    : (rawCurrency || '');

  return {
    ...u,
    id,
    _id: undefined,
    // FE expects lowercase role
    role: (u.role || 'customer').toLowerCase(),
    // FE expects lowercase status strings
    status: (u.status || 'pending').toLowerCase(),
    // FE uses "coins" for wallet balance
    coins: u.walletBalance ?? u.coins ?? 0,
    // Flattened group fields — never pass an object to React
    group: groupName,
    groupId: String(groupId),
    groupName,
    // Flattened currency
    currency,
    // joinDate aliasing
    joinDate: u.joinDate || u.createdAt,
    // ensure avatar
    avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=random`,
  };
};

/** Normalise an array of users */
const normaliseUsers = (arr) =>
  (Array.isArray(arr) ? arr : []).map(normaliseUser);

/** Normalise a group from BE to FE shape */
const normaliseGroup = (g) => {
  if (!g) return null;
  return {
    ...g,
    id: g._id || g.id,
    _id: undefined,
    name: g.name || '',
    // BE uses "percentage", FE uses "discount"
    discount: g.percentage ?? g.discount ?? 0,
    percentage: g.percentage ?? g.discount ?? 0,
    isActive: g.isActive !== false,
  };
};

/**
 * Normalise a product from BE to FE shape.
 *
 * BE model fields → FE useMediaStore fields:
 *   _id                → id
 *   isActive           → status ('active'/'inactive'), productStatus ('available'/'unavailable')
 *   minQty / maxQty    → minimumOrderQty / maximumOrderQty
 *   basePrice          → basePriceCoins (kept alongside basePrice for compat)
 *   provider (ObjId)   → supplierId
 *   providerProduct    → externalProductId, externalProductName
 *   markupType/Value   → supplierMarginType / supplierMarginValue
 *   pricingMode        → externalPricingMode
 */
const normaliseProduct = (p) => {
  if (!p) return null;
  const id = p._id || p.id;
  const isActive = p.isActive !== false;

  // Resolve populated provider reference
  const providerId = typeof p.provider === 'object' ? (p.provider?._id || p.provider?.id) : p.provider;
  // Resolve populated providerProduct reference
  const pp = typeof p.providerProduct === 'object' ? p.providerProduct : null;

  return {
    ...p,
    id,
    _id: undefined,
    // Status mapping
    status: isActive ? 'active' : 'inactive',
    productStatus: isActive ? 'available' : 'unavailable',
    isVisibleInStore: isActive,
    // Pricing
    basePriceCoins: p.basePrice ?? p.basePriceCoins ?? 0,
    basePrice: p.basePrice ?? 0,
    // Quantity
    minimumOrderQty: p.minQty ?? p.minimumOrderQty ?? 1,
    maximumOrderQty: p.maxQty ?? p.maximumOrderQty ?? 999,
    minQty: p.minQty ?? 1,
    maxQty: p.maxQty ?? 999,
    // Supplier/Provider mapping
    supplierId: providerId || p.supplierId || '',
    externalProductId: pp?.externalProductId || p.externalProductId || '',
    externalProductName: pp?.rawName || p.externalProductName || '',
    autoFulfillmentEnabled: (p.executionType === 'automatic'),
    // Markup → supplierMargin
    supplierMarginType: p.markupType || p.supplierMarginType || 'percentage',
    supplierMarginValue: p.markupValue ?? p.supplierMarginValue ?? 0,
    externalPricingMode: p.pricingMode === 'sync' ? 'use_supplier_price' : (p.externalPricingMode || 'use_local_price'),
    // Category stays as-is (string in both BE and FE)
    category: p.category || '',
  };
};

/**
 * Normalise an order from BE to FE shape.
 *
 * BE order model fields → FE useOrderStore fields:
 *   _id                → id
 *   status (UPPERCASE)  → status (lowercase)
 *   productId (populated) → productName, productId
 *   userId (populated)    → userName, userId
 *   totalPrice / chargedAmount → priceCoins
 *   basePriceSnapshot   → unitPriceBase
 *   finalPriceCharged   → unitPrice
 *   currency, rateSnapshot, usdAmount → financialSnapshot
 */
const normaliseOrder = (o) => {
  if (!o) return null;
  const id = o._id || o.id;

  // Resolve populated refs
  const product = typeof o.productId === 'object' ? o.productId : null;
  const user = typeof o.userId === 'object' ? o.userId : null;
  const productIdStr = product?._id || product?.id || o.productId;
  const userIdStr = user?._id || user?.id || o.userId;

  return {
    ...o,
    id,
    _id: undefined,
    // Core IDs
    productId: productIdStr,
    userId: userIdStr,
    // Resolved names from populated refs
    productName: product?.name || o.productName || '',
    userName: user?.name || o.userName || '',
    userEmail: user?.email || o.userEmail || '',
    // Status: BE uses UPPERCASE, FE uses lowercase
    status: (o.status || 'pending').toLowerCase(),
    // Pricing aliases for FE
    priceCoins: o.chargedAmount ?? o.totalPrice ?? o.priceCoins ?? 0,
    unitPriceBase: o.basePriceSnapshot ?? o.unitPriceBase ?? 0,
    unitPrice: o.finalPriceCharged ?? o.unitPrice ?? 0,
    quantity: o.quantity || 1,
    // Financial snapshot for FE store's deduction logic
    financialSnapshot: o.financialSnapshot || {
      originalCurrency: o.currency || 'USD',
      originalAmount: o.basePriceSnapshot || 0,
      exchangeRateAtExecution: o.rateSnapshot || 1,
      convertedAmountAtExecution: o.chargedAmount ?? o.totalPrice ?? 0,
      finalAmountAtExecution: o.chargedAmount ?? o.totalPrice ?? 0,
      pricingSnapshot: {
        basePrice: o.basePriceSnapshot || 0,
        groupDiscount: o.markupPercentageSnapshot || 0,
        unitPrice: o.finalPriceCharged || 0,
        finalPrice: o.chargedAmount ?? o.totalPrice ?? 0,
        currency: o.currency || 'USD',
      },
    },
    // Timestamps
    date: o.createdAt || o.date,
  };
};

/**
 * Normalise a deposit (BE) → topup (FE) shape.
 *
 * BE deposit model fields → FE useTopupStore fields:
 *   _id                   → id
 *   status (UPPERCASE)     → status (lowercase)
 *   amountRequested       → requestedAmount, requestedCoins, amount
 *   amountApproved        → actualPaidAmount, creditedCoins
 *   transferImageUrl      → proofImage
 *   transferredFromNumber → senderWalletNumber
 *   userId (populated)    → userId (string), userName
 *   reviewedBy (populated)→ reviewedBy (string), reviewerName
 */
const normaliseDeposit = (d) => {
  if (!d) return null;
  const id = d._id || d.id;

  // Resolve populated refs
  const user = typeof d.userId === 'object' ? d.userId : null;
  const reviewer = typeof d.reviewedBy === 'object' ? d.reviewedBy : null;
  const userIdStr = user?._id || user?.id || d.userId;
  const reviewerIdStr = reviewer?._id || reviewer?.id || d.reviewedBy;

  const status = (d.status || 'pending').toLowerCase();
  const amountRequested = d.amountRequested ?? d.requestedAmount ?? d.amount ?? 0;
  const amountApproved = d.amountApproved ?? d.actualPaidAmount ?? null;

  // Resolve proof image URL — prepend server origin for relative paths (e.g. /uploads/deposits/...)
  const rawProof = d.transferImageUrl || d.proofImage || '';
  const proofImage = rawProof && rawProof.startsWith('/') && !rawProof.startsWith('//')
    ? `${API_BASE.replace(/\/api\/?$/, '')}${rawProof}`
    : rawProof;

  return {
    ...d,
    id,
    _id: undefined,
    // Status
    status,
    // User info
    userId: userIdStr,
    userName: user?.name || d.userName || '',
    userEmail: user?.email || d.userEmail || '',
    // Reviewer info
    reviewedBy: reviewerIdStr || null,
    reviewerName: reviewer?.name || d.reviewerName || '',
    // Amount aliases (FE uses many field names for the same concept)
    requestedAmount: amountRequested,
    requestedCoins: amountRequested,
    amount: amountRequested,
    actualPaidAmount: amountApproved,
    creditedCoins: amountApproved || (status === 'approved' ? amountRequested : null),
    // Transfer proof
    proofImage,
    senderWalletNumber: d.transferredFromNumber || d.senderWalletNumber || '',
    // Timestamps
    createdAt: d.createdAt || d.date,
    reviewedAt: d.reviewedAt || null,
    // Financial snapshot for FE store's credit logic
    financialSnapshot: d.financialSnapshot || (status === 'approved' ? {
      originalCurrency: 'USD',
      originalAmount: amountApproved || amountRequested,
      exchangeRateAtExecution: 1,
      convertedAmountAtExecution: amountApproved || amountRequested,
      finalAmountAtExecution: amountApproved || amountRequested,
      pricingSnapshot: { baseRate: 1, fees: 0, discount: 0, finalRate: 1 },
      feesSnapshot: { processingFee: 0, transferFee: 0, totalFees: 0 },
    } : null),
  };
};

/**
 * Normalise a provider (BE) → supplier (FE) shape.
 *
 * BE provider model fields → FE AdminSuppliers fields:
 *   _id             → id
 *   name            → supplierName
 *   slug            → supplierCode
 *   baseUrl         → baseUrl
 *   apiToken        → bearerToken (and apiKey alias)
 *   apiKey (legacy)  → apiKey
 *   isActive        → isActive
 *   syncInterval    → syncInterval
 *   supportedFeatures → feature flags
 */
const normaliseProvider = (p) => {
  if (!p) return null;
  const id = p._id || p.id;
  const effectiveToken = p.apiToken || p.apiKey || '';

  return {
    ...p,
    id,
    _id: undefined,
    // Name & code
    supplierName: p.name || p.supplierName || '',
    supplierCode: p.slug || p.supplierCode || '',
    name: p.name || p.supplierName || '',
    // API config
    baseUrl: p.baseUrl || '',
    apiKey: effectiveToken,
    bearerToken: effectiveToken,
    authType: effectiveToken ? 'bearer_token' : 'none',
    supplierType: 'api',
    // Status
    isActive: p.isActive !== false,
    // Sync
    syncInterval: p.syncInterval ?? 60,
    supportedFeatures: p.supportedFeatures || [],
    enableAutoFulfillment: (p.supportedFeatures || []).includes('placeOrder'),
    enableStatusSync: (p.supportedFeatures || []).includes('checkOrder'),
    enableProductSync: (p.supportedFeatures || []).includes('fetchProducts'),
    // Connection test — always 'not_tested' from BE (no endpoint)
    lastConnectionTestStatus: p.lastConnectionTestStatus || 'not_tested',
    lastConnectionTestAt: p.lastConnectionTestAt || null,
    lastConnectionTestMessage: p.lastConnectionTestMessage || '',
    // Timestamps
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
};

/**
 * Reverse-map FE supplier payload → BE provider validation schema.
 *
 * BE create accepts: { name, slug, baseUrl, apiToken, isActive, syncInterval, supportedFeatures }
 * BE update accepts: same fields, all optional, .min(1)
 *
 * FE sends: { supplierName, supplierCode, baseUrl, apiKey, bearerToken,
 *             authType, supplierType, isActive, syncInterval,
 *             enableAutoFulfillment, enableStatusSync, enableProductSync, ... }
 */
const providerToBE = (fe) => {
  const body = {};

  // Name
  const name = fe.supplierName || fe.name;
  if (name !== undefined) body.name = name;

  // Slug
  const slug = fe.supplierCode || fe.slug;
  if (slug !== undefined) body.slug = slug;

  // Base URL
  if (fe.baseUrl !== undefined) body.baseUrl = fe.baseUrl;

  // API token: FE may store it in apiKey, bearerToken, or apiToken
  const token = fe.bearerToken || fe.apiKey || fe.apiToken;
  if (token !== undefined) body.apiToken = token;

  // Active status
  if (fe.isActive !== undefined) body.isActive = fe.isActive;

  // Sync interval
  if (fe.syncInterval !== undefined) body.syncInterval = Number(fe.syncInterval);

  // Supported features — synthesize from FE boolean flags
  if (fe.enableAutoFulfillment !== undefined || fe.enableStatusSync !== undefined || fe.enableProductSync !== undefined) {
    const features = [];
    if (fe.enableAutoFulfillment) features.push('placeOrder');
    if (fe.enableStatusSync) features.push('checkOrder', 'checkOrdersBatch');
    if (fe.enableProductSync) features.push('fetchProducts');
    body.supportedFeatures = features;
  } else if (fe.supportedFeatures !== undefined) {
    body.supportedFeatures = fe.supportedFeatures;
  }

  return body;
};

/**
 * Normalise a currency from BE to FE shape.
 *
 * BE currency model fields → FE fields:
 *   _id / code        → id (use code as primary key)
 *   code              → code
 *   name              → name
 *   symbol            → symbol
 *   platformRate      → rate (FE's primary rate field)
 *   marketRate        → marketRate
 *   markupPercentage  → markupPercentage
 *   isActive          → isActive
 *   lastUpdatedAt     → lastUpdatedAt
 *   effectiveRate (virtual) → effectiveRate
 *   spreadPercent (virtual) → spreadPercent
 */
const normaliseCurrency = (c) => {
  if (!c) return null;
  return {
    ...c,
    id: c._id || c.id || c.code,
    _id: undefined,
    code: c.code || '',
    name: c.name || c.code || '',
    symbol: c.symbol || '',
    // FE expects `rate` as the primary platform rate
    rate: c.platformRate ?? c.rate ?? 1,
    platformRate: c.platformRate ?? c.rate ?? 1,
    marketRate: c.marketRate ?? null,
    markupPercentage: c.markupPercentage ?? 0,
    effectiveRate: c.effectiveRate ?? c.platformRate ?? c.rate ?? 1,
    spreadPercent: c.spreadPercent ?? null,
    isActive: c.isActive !== false,
    lastUpdatedAt: c.lastUpdatedAt || c.updatedAt || null,
  };
};

/**
 * Normalise a category from BE to FE shape.
 *
 * BE category model fields → FE fields:
 *   _id         → id
 *   name        → name
 *   nameAr      → nameAr
 *   image       → image
 *   slug        → slug
 *   sortOrder   → sortOrder
 *   isActive    → isActive
 */
const normaliseCategory = (c) => {
  if (!c) return null;
  return {
    ...c,
    id: c._id || c.id,
    _id: undefined,
    name: c.name || '',
    nameAr: c.nameAr || '',
    image: c.image || '',
    slug: c.slug || '',
    sortOrder: c.sortOrder ?? 0,
    isActive: c.isActive !== false,
  };
};

/**
 * Reverse-map FE product fields → BE model fields for create / update.
 *
 * Only sends fields the BE updateProduct whitelist accepts:
 *   name, description, image, category, displayOrder, isActive,
 *   basePrice, minQty, maxQty, pricingMode, markupType, markupValue,
 *   executionType, orderFields, providerMapping
 */
const productToBE = (fe) => {
  const body = {};

  // Direct pass-through fields
  if (fe.name !== undefined) body.name = fe.name;
  if (fe.description !== undefined) body.description = fe.description;
  if (fe.image !== undefined) body.image = fe.image;
  if (fe.category !== undefined) body.category = fe.category;
  if (fe.displayOrder !== undefined) body.displayOrder = fe.displayOrder;
  if (fe.orderFields !== undefined) body.orderFields = fe.orderFields;

  // Pricing: FE uses basePriceCoins, BE uses basePrice
  if (fe.basePriceCoins !== undefined) body.basePrice = Number(fe.basePriceCoins);
  else if (fe.basePrice !== undefined) body.basePrice = Number(fe.basePrice);

  // Quantity: FE uses minimumOrderQty / maximumOrderQty, BE uses minQty / maxQty
  if (fe.minimumOrderQty !== undefined) body.minQty = Number(fe.minimumOrderQty);
  else if (fe.minQty !== undefined) body.minQty = Number(fe.minQty);

  if (fe.maximumOrderQty !== undefined) body.maxQty = Number(fe.maximumOrderQty);
  else if (fe.maxQty !== undefined) body.maxQty = Number(fe.maxQty);

  // Status: FE uses status 'active'/'inactive', BE uses isActive boolean
  if (fe.status !== undefined) body.isActive = fe.status === 'active';
  else if (fe.isActive !== undefined) body.isActive = fe.isActive;

  // Execution: FE uses autoFulfillmentEnabled, BE uses executionType
  if (fe.autoFulfillmentEnabled !== undefined) {
    body.executionType = fe.autoFulfillmentEnabled ? 'automatic' : 'manual';
  } else if (fe.executionType !== undefined) {
    body.executionType = fe.executionType;
  }

  // Markup: FE uses supplierMarginType/Value, BE uses markupType/Value
  if (fe.supplierMarginType !== undefined) body.markupType = fe.supplierMarginType;
  else if (fe.markupType !== undefined) body.markupType = fe.markupType;

  if (fe.supplierMarginValue !== undefined) body.markupValue = Number(fe.supplierMarginValue);
  else if (fe.markupValue !== undefined) body.markupValue = Number(fe.markupValue);

  // Pricing mode: FE uses externalPricingMode, BE uses pricingMode
  if (fe.externalPricingMode !== undefined) {
    body.pricingMode = fe.externalPricingMode === 'use_supplier_price' ? 'sync' : 'manual';
  } else if (fe.pricingMode !== undefined) {
    body.pricingMode = fe.pricingMode;
  }

  // Provider mapping (for auto-fulfilled products)
  if (fe.providerMapping !== undefined) body.providerMapping = fe.providerMapping;
  if (fe.supplierFieldMappings !== undefined) {
    // Convert array format [{key, providerKey}] → { key: providerKey } map
    if (Array.isArray(fe.supplierFieldMappings)) {
      body.providerMapping = {};
      fe.supplierFieldMappings.forEach((m) => {
        if (m.key && m.providerKey) body.providerMapping[m.key] = m.providerKey;
      });
    }
  }

  // Provider product linkage (for publish-from-provider flow)
  if (fe.providerProductId || fe.externalProductId) {
    body.providerProductId = fe.providerProductId || fe.externalProductId;
  }

  return body;
};

// ─── Determine if current user is admin ──────────────────────────────────────

const isAdmin = () => {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed?.state?.user?.role?.toLowerCase() === 'admin';
  } catch { return false; }
};

// ═════════════════════════════════════════════════════════════════════════════
// API Contract — same interface as mockApi
// ═════════════════════════════════════════════════════════════════════════════

const realApi = {

  // ── Auth ──────────────────────────────────────────────────────────────────
  auth: {
    login: async (email, password) => {
      const res = await http.post('/auth/login', { email, password });
      const data = unwrap(res);
      const user = normaliseUser(data.user);
      const token = data.token;
      // Persist token for subsequent requests
      setStoredToken(token);
      return { user, token };
    },

    loginWithGoogle: async () => {
      // Google OAuth uses redirect flow — open the BE endpoint in the browser.
      // The BE redirects back w/ ?token= in the URL.
      // This method is called from FE after capturing the token from the redirect.
      // We keep it compatible by parsing the token from the current URL if present.
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (!token) {
        // Initiate the redirect
        window.location.href = `${API_BASE}/auth/google`;
        // Return a promise that never resolves (page will redirect)
        return new Promise(() => { });
      }
      // Token captured from callback redirect — fetch profile
      setStoredToken(token);
      const res = await http.get('/users/me');
      const user = normaliseUser(unwrap(res));
      return { user, token };
    },

    register: async (userData) => {
      const res = await http.post('/auth/register', {
        name: userData.name || userData.username || '',
        email: userData.email,
        password: userData.password,
        username: userData.username || '',
        currency: userData.currency || 'USD',
        country: userData.country || '',
        phone: userData.phone || '',
      });
      const data = unwrap(res);
      const user = normaliseUser(data.user);
      return { user };
    },

    getProfile: async (_userId) => {
      // BE route: GET /api/me → me.getProfile (resolves user from JWT)
      const res = await http.get('/me');
      return normaliseUser(unwrap(res));
    },
  },

  // ── Products ─────────────────────────────────────────────────────────────
  products: {
    /**
     * GET /admin/products (admin) or GET /me/products (customer)
     *
     * Both use sendPaginated — products array in `data` directly.
     */
    list: async () => {
      const endpoint = isAdmin() ? '/admin/products' : '/me/products';
      const res = await http.get(endpoint);
      const data = unwrap(res);
      const products = Array.isArray(data) ? data : (data?.products || []);
      return products.map(normaliseProduct);
    },

    /**
     * GET /products/:id — sendSuccess(res, product).
     * Product is placed directly in data (no wrapping object).
     */
    get: async (id) => {
      const endpoint = isAdmin() ? `/products/${id}` : `/me/products/${id}`;
      const res = await http.get(endpoint);
      const data = unwrap(res);
      // sendSuccess puts the product directly in data (or inside data.product for admin catalog)
      return normaliseProduct(data?.product || data);
    },

    /**
     * POST /admin/products — manual product creation.
     *
     * Maps FE field names back to BE model field names.
     * BE accepts: { name, description, basePrice, minQty, maxQty, category,
     *               image, displayOrder, isActive, executionType, orderFields, providerMapping }
     */
    create: async (productData) => {
      const body = productToBE(productData);
      // Route to the correct endpoint based on provider linkage
      const hasProvider = Boolean(body.providerProductId);
      const url = hasProvider ? '/admin/products/from-provider' : '/admin/products';
      const res = await http.post(url, body);
      return normaliseProduct(unwrap(res));
    },

    /**
     * PATCH /admin/products/:id — update product.
     *
     * Maps FE field names back to BE-allowed update fields.
     */
    update: async (id, updates) => {
      const body = productToBE(updates);
      const res = await http.patch(`/admin/products/${id}`, body);
      return normaliseProduct(unwrap(res));
    },

    /**
     * "Delete" — BE uses toggle-status (no hard delete).
     * Admin catalog: PATCH /admin/products/:id/toggle
     */
    delete: async (id) => {
      await http.patch(`/admin/products/${id}/toggle`);
      return { success: true };
    },

    /**
     * GET /admin/providers — lightweight list for provider picker UI.
     */
    listProviders: async () => {
      const res = await http.get('/admin/providers');
      const data = unwrap(res);
      const providers = Array.isArray(data) ? data : (data?.providers || []);
      return providers.map((p) => ({
        id: p._id || p.id,
        name: p.name || p.supplierName || '',
      }));
    },

    /**
     * GET /admin/provider-products/:providerId — raw provider products.
     */
    listProviderProducts: async (providerId) => {
      const res = await http.get(`/admin/provider-products/${providerId}`);
      const data = unwrap(res);
      const items = Array.isArray(data) ? data : (data?.providerProducts || []);
      return items.map((pp) => ({
        ...pp,
        id: pp._id || pp.id,
        _id: undefined,
        // Human-readable name for dropdowns — fallback chain
        name: pp.translatedName || pp.rawName || pp.rawPayload?.product_name || pp.rawPayload?.product_name_translated || pp.externalProductId,
        // Ensure rawPrice is populated even if sync stored 0
        rawPrice: pp.rawPrice || pp.rawPayload?.product_price || 0,
      }));
    },

    /**
     * GET /admin/provider-products/item/:providerProductId/price
     * Fetches stored price data for a specific provider product.
     */
    getSyncedPrice: async (providerId, providerProductId) => {
      try {
        const res = await http.get(`/admin/provider-products/item/${providerProductId}/price`);
        const data = unwrap(res);
        return {
          basePriceCoins: data?.rawPrice ?? 0,
          found: data?.found ?? false,
          rawName: data?.rawName || '',
          provider: data?.provider || '',
        };
      } catch (err) {
        console.warn('[realApi] getSyncedPrice failed:', err.message);
        return { basePriceCoins: 0, found: false };
      }
    },
  },

  // ── Categories ───────────────────────────────────────────────────────────
  categories: {
    /**
     * GET /admin/categories → sendSuccess(res, { categories }, ...)
     */
    list: async () => {
      const raw = localStorage.getItem('auth-storage');
      const role = raw ? JSON.parse(raw)?.state?.user?.role?.toUpperCase() : 'CUSTOMER';
      if (role !== 'ADMIN') return []; // No public categories endpoint — skip for customers
      const res = await http.get('/admin/categories');
      const data = unwrap(res);
      const items = Array.isArray(data) ? data : (data?.categories || []);
      return items.map(normaliseCategory);
    },

    /**
     * GET /admin/categories/:id → sendSuccess(res, { category }, ...)
     */
    get: async (id) => {
      const res = await http.get(`/admin/categories/${id}`);
      return normaliseCategory(unwrap(res)?.category || unwrap(res));
    },

    /**
     * POST /admin/categories → sendCreated(res, { category }, ...)
     * BE Joi: { name (req), nameAr, image, sortOrder, isActive }
     */
    create: async (categoryData, _actorContext) => {
      const body = {
        name: categoryData.name,
        nameAr: categoryData.nameAr || null,
        image: categoryData.image || null,
        sortOrder: categoryData.sortOrder ?? 0,
        isActive: categoryData.isActive !== false,
      };
      const res = await http.post('/admin/categories', body);
      return normaliseCategory(unwrap(res)?.category || unwrap(res));
    },

    /**
     * PATCH /admin/categories/:id → sendSuccess(res, { category }, ...)
     */
    update: async (id, updates, _actorContext) => {
      const res = await http.patch(`/admin/categories/${id}`, updates);
      return normaliseCategory(unwrap(res)?.category || unwrap(res));
    },

    /**
     * PATCH /admin/categories/:id/toggle → toggle isActive
     */
    toggle: async (id, _actorContext) => {
      const res = await http.patch(`/admin/categories/${id}/toggle`);
      return normaliseCategory(unwrap(res)?.category || unwrap(res));
    },

    /**
     * DELETE /admin/categories/:id → hard delete + cascade product cleanup
     */
    delete: async (id, _actorContext) => {
      const res = await http.delete(`/admin/categories/${id}`);
      return unwrap(res);
    },
  },

  // ── Suppliers (BE calls them "providers") ────────────────────────────────
  suppliers: {
    /**
     * GET /admin/providers → sendSuccess(res, { providers }, ...)
     */
    list: async () => {
      const res = await http.get('/admin/providers');
      const data = unwrap(res);
      const providers = Array.isArray(data) ? data : (data?.providers || []);
      return providers.map(normaliseProvider);
    },

    /**
     * GET /admin/providers/:id → sendSuccess(res, { provider }, ...)
     */
    get: async (id) => {
      const res = await http.get(`/admin/providers/${id}`);
      return normaliseProvider(unwrap(res)?.provider || unwrap(res));
    },

    /**
     * POST /admin/providers → sendCreated(res, { provider }, ...)
     *
     * Uses providerToBE to translate FE supplier fields to BE schema.
     * BE Joi: { name (req), baseUrl (req), slug, apiToken, isActive, syncInterval, supportedFeatures }
     */
    create: async (payload, _actorContext) => {
      const body = providerToBE(payload);
      const res = await http.post('/providers', body);
      return normaliseProvider(unwrap(res)?.provider || unwrap(res));
    },

    /**
     * PATCH /admin/providers/:id → sendSuccess(res, { provider }, ...)
     *
     * Uses providerToBE to translate FE supplier fields to BE schema.
     * BE Joi: same fields as create, all optional, .min(1)
     */
    update: async (id, payload, _actorContext) => {
      const body = providerToBE(payload);
      const res = await http.patch(`/admin/providers/${id}`, body);
      return normaliseProvider(unwrap(res)?.provider || unwrap(res));
    },

    /**
     * PATCH /admin/providers/:id/toggle → toggles isActive
     */
    deactivate: async (id, _actorContext) => {
      const res = await http.patch(`/admin/providers/${id}/toggle`);
      return normaliseProvider(unwrap(res)?.provider || unwrap(res));
    },

    /**
     * POST /admin/providers/:id/test-connection
     * Pings the provider's API to verify credentials and connectivity.
     * Returns latency, success status, and test timestamp.
     */
    testConnection: async (id, _actorContext) => {
      try {
        const res = await http.post(`/admin/providers/${id}/test-connection`);
        const data = unwrap(res);
        return {
          lastConnectionTestAt: data?.testedAt || new Date().toISOString(),
          lastConnectionTestStatus: data?.success ? 'success' : 'failed',
          lastConnectionTestMessage: data?.message || 'Unknown',
          latencyMs: data?.latencyMs ?? null,
        };
      } catch (err) {
        return {
          lastConnectionTestAt: new Date().toISOString(),
          lastConnectionTestStatus: 'error',
          lastConnectionTestMessage: err?.response?.data?.message || err.message || 'Connection test failed',
          latencyMs: null,
        };
      }
    },

    /**
     * POST /admin/catalog/sync/:providerId → triggers product sync from provider
     */
    syncProducts: async (id, _actorContext) => {
      const res = await http.post(`/admin/catalog/sync/${id}`);
      const data = unwrap(res);
      return Array.isArray(data) ? data : (data?.products || data?.synced || []);
    },

    /**
     * GET /admin/providers/:id/balance → live provider balance
     */
    getBalance: async (id) => {
      const res = await http.get(`/admin/providers/${id}/balance`);
      return unwrap(res);
    },

    /**
     * GET /admin/providers/:id/products → live provider product list
     */
    getLiveProducts: async (id) => {
      const res = await http.get(`/admin/providers/${id}/products`);
      const data = unwrap(res);
      return Array.isArray(data) ? data : (data?.products || []);
    },

    /**
     * DELETE /admin/providers/:id → soft delete (sets deletedAt + isActive=false)
     */
    delete: async (id, _actorContext) => {
      const res = await http.delete(`/admin/providers/${id}`);
      return normaliseProvider(unwrap(res)?.provider || unwrap(res));
    },
  },

  // ── Users (Admin) ────────────────────────────────────────────────────────
  users: {
    /**
     * GET /admin/users → sendPaginated(res, users[], pagination)
     * unwrap() returns the users array directly from paginated envelope.
     */
    list: async () => {
      const res = await http.get('/admin/users');
      const data = unwrap(res);
      // sendPaginated puts the array as `data` directly
      const users = Array.isArray(data) ? data : (data?.users || []);
      return normaliseUsers(users);
    },

    /**
     * Map FE status strings to BE approve / reject / generic-update endpoints.
     *
     * BE response shape (single user): { success, data: { user } }
     */
    updateStatus: async (userId, status, _actorContext) => {
      const normalised = (status || '').toLowerCase();
      if (normalised === 'active' || normalised === 'approved') {
        const res = await http.patch(`/admin/users/${userId}/approve`);
        return normaliseUser(unwrap(res)?.user || unwrap(res));
      }
      if (normalised === 'denied' || normalised === 'rejected') {
        const res = await http.patch(`/admin/users/${userId}/reject`);
        return normaliseUser(unwrap(res)?.user || unwrap(res));
      }
      // Generic update for other status values (BE Joi accepts status: PENDING|ACTIVE|REJECTED)
      const res = await http.patch(`/admin/users/${userId}`, { status: status.toUpperCase() });
      return normaliseUser(unwrap(res)?.user || unwrap(res));
    },

    /**
     * Wallet operations: POST /admin/wallets/:userId/add | /deduct
     *
     * BE Joi schema: { amount: number (positive, required), reason: string (min 3, required) }
     * BE response: { success, data: { transaction } } — NOT a user object.
     *
     * Since the BE returns a transaction (not the updated user), we just return the
     * transaction and let useAdminStore handle the optimistic local state update.
     */
    addCoins: async (userId, amount, _actorContext) => {
      if (amount >= 0) {
        const res = await http.post(`/admin/wallets/${userId}/add`, {
          amount: Math.abs(amount),
          reason: 'Admin balance top-up',
        });
        return unwrap(res)?.transaction || unwrap(res);
      }
      const res = await http.post(`/admin/wallets/${userId}/deduct`, {
        amount: Math.abs(amount),
        reason: 'Admin balance deduction',
      });
      return unwrap(res)?.transaction || unwrap(res);
    },

    /**
     * Update user's group.
     *
     * BE Joi accepts: { groupId: ObjectId (24-hex) }
     * FE may pass a group ID string, a group object, or empty/null.
     * We extract the raw ObjectId and only send it if it's a valid 24-hex string.
     */
    updateGroup: async (userId, group, _actorContext) => {
      // Extract ID if group is an object { id, _id, name }
      let groupId = group;
      if (typeof group === 'object' && group !== null) {
        groupId = group.id || group._id || group.groupId || '';
      }
      groupId = String(groupId || '').trim();

      // If empty or not a valid ObjectId, send null to unassign
      const payload = groupId.length === 24 ? { groupId } : { groupId: null };
      const res = await http.patch(`/admin/users/${userId}`, payload);
      return normaliseUser(unwrap(res)?.user || unwrap(res));
    },

    /**
     * PATCH /admin/users/:id/role → update user's role.
     * BE Joi: { role: 'ADMIN' | 'CUSTOMER' }
     */
    updateRole: async (userId, role, _actorContext) => {
      const res = await http.patch(`/admin/users/${userId}/role`, { role: (role || '').toUpperCase() });
      return normaliseUser(unwrap(res)?.user || unwrap(res));
    },

    delete: async (userId, _actorContext) => {
      await http.delete(`/admin/users/${userId}`);
      return { success: true };
    },

    /**
     * PATCH /admin/users/:id/avatar → update user's avatar URL.
     * BE Joi: { avatar: string (URL) | null }
     */
    updateAvatar: async (userId, avatar, _actorContext) => {
      const res = await http.patch(`/admin/users/${userId}/avatar`, { avatar: avatar || null });
      return normaliseUser(unwrap(res)?.user || unwrap(res));
    },

    /**
     * Update user profile fields.
     *
     * BE Joi accepts: { name, email, groupId, status, verified }
     * We only send the fields that are in the BE schema.
     */
    updateProfile: async (userId, updates, _actorContext) => {
      const body = {};
      if (updates.name !== undefined) body.name = updates.name;
      if (updates.email !== undefined) body.email = updates.email;
      // Only include fields the BE schema allows
      if (updates.groupId !== undefined) body.groupId = updates.groupId;
      if (updates.verified !== undefined) body.verified = updates.verified;
      const res = await http.patch(`/admin/users/${userId}`, body);
      return normaliseUser(unwrap(res)?.user || unwrap(res));
    },

    /**
     * PATCH /admin/users/:id/currency → update user's wallet currency.
     * BE Joi: { currency: 'USD' | 'SAR' | ... (3-letter ISO 4217) }
     */
    updateCurrency: async (userId, currencyCode, _actorContext) => {
      const res = await http.patch(`/admin/users/${userId}/currency`, { currency: (currencyCode || '').toUpperCase() });
      return normaliseUser(unwrap(res)?.user || unwrap(res));
    },

    /**
     * POST /admin/users/:id/reset-password → reset user's password.
     * BE Joi: { password: string (min 8 chars) }
     *
     * Generates a secure temporary password, sends to BE which bcrypt-hashes it.
     * Returns the user + temporary password for the admin to communicate to the user.
     */
    resetPassword: async (userId, _actorContext) => {
      // Generate a temporary password (12 chars, alphanumeric)
      const tempPassword = Array.from(
        { length: 12 },
        () => 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'[Math.floor(Math.random() * 54)]
      ).join('');

      const res = await http.post(`/admin/users/${userId}/reset-password`, { password: tempPassword });
      const user = normaliseUser(unwrap(res)?.user || unwrap(res));
      return { user, temporaryPassword: tempPassword };
    },
  },

  // ── Groups ───────────────────────────────────────────────────────────────
  groups: {
    list: async () => {
      const res = await http.get('/admin/groups');
      const data = unwrap(res);
      const groups = Array.isArray(data) ? data : (data?.groups || []);
      return groups.map(normaliseGroup);
    },

    create: async (groupData) => {
      // Reverse-map: FE sends { name, discount }, BE Joi expects { name, percentage }
      const body = {
        name: groupData.name,
        percentage: groupData.discount ?? groupData.percentage ?? 0,
        isActive: groupData.isActive !== false,
      };
      const res = await http.post('/admin/groups', body);
      return normaliseGroup(unwrap(res)?.group || unwrap(res));
    },

    update: async (id, updates) => {
      // Reverse-map: FE sends { name, discount }, BE Joi expects { name, percentage }
      const body = {};
      if (updates.name !== undefined) body.name = updates.name;
      if (updates.discount !== undefined || updates.percentage !== undefined) {
        body.percentage = updates.discount ?? updates.percentage;
      }
      if (updates.isActive !== undefined) body.isActive = updates.isActive;
      const res = await http.patch(`/admin/groups/${id}`, body);
      return normaliseGroup(unwrap(res)?.group || unwrap(res));
    },

    delete: async (id) => {
      await http.delete(`/admin/groups/${id}`);
      return { success: true };
    },
  },

  // ── Orders ───────────────────────────────────────────────────────────────
  orders: {
    /**
     * GET /admin/orders (admin) or GET /me/orders (customer).
     * Both use sendPaginated — orders array in `data` directly.
     */
    list: async (_userId) => {
      const endpoint = isAdmin() ? '/admin/orders' : '/me/orders';
      const res = await http.get(endpoint);
      const data = unwrap(res);
      const orders = Array.isArray(data) ? data : (data?.orders || []);
      return orders.map(normaliseOrder);
    },

    /**
     * POST /me/orders — place a new order.
     *
     * BE accepts: { productId, quantity, orderFieldsValues }
     * FE sends a full orderWithSnapshot object.
     * We strip it down to only what the BE expects.
     */
    create: async (orderData) => {
      const body = {
        productId: orderData.productId,
        quantity: Number(orderData.quantity) || 1,
      };
      // Include dynamic order field values if present
      if (orderData.orderFieldsValues) {
        body.orderFieldsValues = orderData.orderFieldsValues;
      }
      const res = await http.post('/me/orders', body);
      const data = unwrap(res);
      return { order: normaliseOrder(data?.order || data) };
    },

    /**
     * Map FE status strings to BE admin action routes.
     *
     * BE has only two admin actions:
     *   POST /admin/orders/:id/retry  — re-submit FAILED order to provider
     *   POST /admin/orders/:id/refund — refund + mark as FAILED
     *
     * There is NO admin endpoint for manually marking as COMPLETED —
     * that's handled automatically by the provider fulfillment engine.
     *
     * FE status string → BE action:
     *   'failed' | 'rejected' | 'denied' | 'refunded'  → POST /admin/orders/:id/refund
     *   'processing' | 'retry' | 'pending'              → POST /admin/orders/:id/retry
     *   'completed' | 'approved'                        → POST /admin/orders/:id/complete
     */
    updateStatus: async (orderId, status) => {
      const normalised = (status || '').toLowerCase();
      let res;

      if (['failed', 'rejected', 'denied', 'refunded'].includes(normalised)) {
        // Refund action: marks order as FAILED and refunds wallet
        res = await http.post(`/admin/orders/${orderId}/refund`);
        return normaliseOrder(unwrap(res)?.order || unwrap(res));
      }

      if (['processing', 'retry', 'pending'].includes(normalised)) {
        // Retry action: re-submits FAILED order to provider
        res = await http.post(`/admin/orders/${orderId}/retry`);
        return normaliseOrder(unwrap(res)?.order || unwrap(res));
      }

      if (['completed', 'approved'].includes(normalised)) {
        // POST /admin/orders/:id/complete → manually mark order as COMPLETED
        res = await http.post(`/admin/orders/${orderId}/complete`);
        return normaliseOrder(unwrap(res)?.order || unwrap(res));
      }

      // Unknown status — fallback to retry
      console.warn(`[realApi] updateStatus: Unknown status '${status}' — attempting retry.`);
      res = await http.post(`/admin/orders/${orderId}/retry`);
      return normaliseOrder(unwrap(res)?.order || unwrap(res));
    },

    /**
     * POST /admin/orders/:id/sync-status
     * Fetches latest order status from the external provider and updates DB.
     */
    syncSupplierStatus: async (orderId, _actorContext) => {
      try {
        const res = await http.post(`/admin/orders/${orderId}/sync-status`);
        return normaliseOrder(unwrap(res)?.order || unwrap(res));
      } catch (err) {
        console.warn('[realApi] syncSupplierStatus failed:', err?.response?.data?.message || err.message);
        return null;
      }
    },
  },

  // ── Topups (BE: "deposits") ──────────────────────────────────────────────
  topups: {
    /**
     * GET /admin/deposits (admin) or GET /me/deposits (customer).
     * Both use sendPaginated — deposits array in `data` directly.
     */
 list: async () => {
      const endpoint = isAdmin() ? '/admin/deposits' : '/me/deposits';
      const res = await http.get(endpoint);
      const data = unwrap(res);
      const items = Array.isArray(data) ? data : (data?.deposits || []);
      return items.map(normaliseDeposit);
    },

    /**
     * POST /me/deposits — create a deposit request.
     *
     * BE expects multipart/form-data with:
     *   - amountRequested     (required, number)
     *   - transferredFromNumber (required, string)
     *   - screenshotProof     (file, required — multer field)
     *   OR transferImageUrl   (fallback URL string for JSON-only clients)
     *
     * FE sends: { amount/requestedAmount, senderWalletNumber, proofImage }
     * We map to the BE-expected shape.
     */
    create: async (topupData) => {
      const amount = Number(
        topupData.requestedAmount ?? topupData.requestedCoins ?? topupData.amount ?? 0
      );
      const senderNumber = topupData.senderWalletNumber || topupData.transferredFromNumber || 'N/A';
      const proofImage = topupData.proofImage || topupData.transferImageUrl || '';

      // If proofImage is a File/Blob, use FormData for multipart upload
      if (proofImage instanceof Blob) {
        const formData = new FormData();
        formData.append('amountRequested', amount);
        formData.append('transferredFromNumber', senderNumber);
        formData.append('screenshotProof', proofImage);
        const res = await http.post('/me/deposits', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return normaliseDeposit(unwrap(res));
      }

      // Otherwise send as JSON with transferImageUrl fallback
      const res = await http.post('/me/deposits', {
        amountRequested: amount,
        transferredFromNumber: senderNumber,
        transferImageUrl: proofImage || 'pending-upload',
      });
      return normaliseDeposit(unwrap(res));
    },

    /**
     * Map FE status strings to BE admin action routes.
     *
     * BE admin actions:
     *   PATCH /admin/deposits/:id/approve  — approve + credit wallet
     *     Body: { overrideAmount? } (optional)
     *   PATCH /admin/deposits/:id/reject   — reject
     *
     * FE calls: apiClient.topups.updateStatus(id, status, updatedTopup)
     *   The 3rd arg (updatedTopup) may contain:
     *     - actualPaidAmount (override amount from review)
     *     - financialSnapshot.originalAmount
     *
     * FE status → BE action:
     *   'approved' | 'completed' → PATCH /admin/deposits/:id/approve
     *   'rejected' | 'denied'   → PATCH /admin/deposits/:id/reject
     */
    updateStatus: async (topupId, status, reviewData) => {
      const normalised = (status || '').toLowerCase();
      let res;

      if (['approved', 'completed'].includes(normalised)) {
        // Build approve body with optional override
        const body = {};
        const override = reviewData?.actualPaidAmount
          ?? reviewData?.financialSnapshot?.originalAmount
          ?? null;
        if (override !== null && override !== undefined) {
          body.overrideAmount = Number(override);
        }
        res = await http.patch(`/admin/deposits/${topupId}/approve`, body);
        return normaliseDeposit(unwrap(res));
      }

      if (['rejected', 'denied', 'failed'].includes(normalised)) {
        res = await http.patch(`/admin/deposits/${topupId}/reject`);
        return normaliseDeposit(unwrap(res));
      }

      // Unknown status
      console.warn(`[realApi] topups.updateStatus: Unknown status '${status}'.`);
      return null;
    },

    /**
     * Map FE status strings to BE admin action routes.
     *
     * BE admin actions:
     *   PATCH /admin/deposits/:id/approve  — approve + credit wallet
     *     Body: { overrideAmount? } (optional)
     *   PATCH /admin/deposits/:id/reject   — reject
     *
     * FE calls: apiClient.topups.updateStatus(id, status, updatedTopup)
     *   The 3rd arg (updatedTopup) may contain:
     *     - actualPaidAmount (override amount from review)
     *     - financialSnapshot.originalAmount
     *
     * FE status → BE action:
     *   'approved' | 'completed' → PATCH /admin/deposits/:id/approve
     *   'rejected' | 'denied'   → PATCH /admin/deposits/:id/reject
     */
    updateStatus: async (topupId, status, reviewData) => {
      const normalised = (status || '').toLowerCase();
      let res;

      if (['approved', 'completed'].includes(normalised)) {
        // Build approve body with optional override
        const body = {};
        const override = reviewData?.actualPaidAmount
          ?? reviewData?.financialSnapshot?.originalAmount
          ?? null;
        if (override !== null && override !== undefined) {
          body.overrideAmount = Number(override);
        }
        res = await http.patch(`/admin/deposits/${topupId}/approve`, body);
        return normaliseDeposit(unwrap(res));
      }

      if (['rejected', 'denied', 'failed'].includes(normalised)) {
        res = await http.patch(`/admin/deposits/${topupId}/reject`);
        return normaliseDeposit(unwrap(res));
      }

      // Unknown status
      console.warn(`[realApi] topups.updateStatus: Unknown status '${status}'.`);
      return null;
    },

    /**
     * PATCH /admin/deposits/:id → update a PENDING deposit request.
     * BE only allows updates when status === PENDING.
     */
    updateRequest: async (topupId, updates) => {
      try {
        const body = {};
        if (updates.amountRequested !== undefined || updates.amount !== undefined) {
          body.amountRequested = updates.amountRequested ?? updates.amount;
        }
        if (updates.transferredFromNumber !== undefined || updates.senderNumber !== undefined) {
          body.transferredFromNumber = updates.transferredFromNumber ?? updates.senderNumber;
        }
        const res = await http.patch(`/admin/deposits/${topupId}`, body);
        const data = unwrap(res);
        return data?.deposit || data;
      } catch (err) {
        console.warn('[realApi] topups.updateRequest failed:', err?.response?.data?.message || err.message);
        return null;
      }
    },
  },

  // ── System (Currencies & Payment Settings) ──────────────────────────────
  system: {
    /**
     * Fetch currencies — tries public endpoint first (for registration page),
     * falls back to admin endpoint if authenticated.
     */
    currencies: async () => {
      try {
        // Try public endpoint first (no auth required — works on registration page)
        const publicRes = await http.get('/currencies/active');
        const publicData = unwrap(publicRes);
        const publicItems = Array.isArray(publicData) ? publicData : (publicData?.currencies || []);
        if (publicItems.length > 0) return publicItems.map(normaliseCurrency);
      } catch (_) {
        // Public endpoint may not exist on older BE — fall through
      }

      // Fall back to admin endpoint (requires authentication)
      try {
        const res = await http.get('/admin/currencies');
        const data = unwrap(res);
        const items = Array.isArray(data) ? data : (data?.currencies || []);
        return items.map(normaliseCurrency);
      } catch (_) {
        return [];
      }
    },

    /**
     * POST /admin/currencies → create a new currency.
     * BE Joi: { code (req), name (req), symbol (req), platformRate (req), marketRate, markupPercentage, isActive }
     */
    addCurrency: async (payload, _actorContext) => {
      const body = {
        code: payload.code,
        name: payload.name,
        symbol: payload.symbol,
        platformRate: payload.platformRate ?? payload.rate ?? 1,
        marketRate: payload.marketRate ?? null,
        markupPercentage: payload.markupPercentage ?? 0,
        isActive: payload.isActive !== false,
      };
      const res = await http.post('/admin/currencies', body);
      return normaliseCurrency(unwrap(res)?.currency || unwrap(res));
    },

    /**
     * PATCH /admin/currencies/:code → update currency fields.
     *
     * BE Joi: { platformRate (req), markupPercentage, isActive }
     * FE may send: { rate, platformRate, markupPercentage, isActive }
     */
    updateCurrency: async (code, updates, _actorContext) => {
      const body = {};
      // Map FE `rate` to BE `platformRate`
      const rate = updates.platformRate ?? updates.rate;
      if (rate !== undefined) body.platformRate = Number(rate);
      if (updates.markupPercentage !== undefined) body.markupPercentage = Number(updates.markupPercentage);
      if (updates.isActive !== undefined) body.isActive = updates.isActive;

      const res = await http.patch(`/admin/currencies/${code}`, body);
      return normaliseCurrency(unwrap(res)?.currency || unwrap(res));
    },

    /**
     * "Delete" a currency by deactivating it.
     * BE has no hard-delete endpoint — use PATCH with { isActive: false }.
     */
    deleteCurrency: async (code, _actorContext) => {
      const res = await http.patch(`/admin/currencies/${code}`, { isActive: false });
      return normaliseCurrency(unwrap(res)?.currency || unwrap(res));
    },

    /**
     * GET /admin/settings → array of { key, value } → structured FE object.
     *
     * Transforms the flat BE settings array into the FE payment settings shape:
     *   { countryAccounts, instructions, whatsappNumber, paymentGroups }
     */
    paymentSettings: async () => {
      const raw = localStorage.getItem('auth-storage');
      const role = raw ? JSON.parse(raw)?.state?.user?.role?.toUpperCase() : 'CUSTOMER';
      if (role !== 'ADMIN') {
        // No public settings endpoint — return defaults for customers
        return { countryAccounts: [], instructions: '', whatsappNumber: '', paymentGroups: [] };
      }
      const res = await http.get('/admin/settings');
      const data = unwrap(res);
      const settings = Array.isArray(data) ? data : (data?.settings || []);
      const find = (key) => settings.find((s) => s.key === key)?.value;
      return {
        countryAccounts: find('paymentCountryAccounts') || [],
        instructions: find('paymentInstructions') || '',
        whatsappNumber: find('whatsappNumber') || '',
        paymentGroups: find('paymentGroups') || [],
      };
    },

    /**
     * Update payment settings — dispatches multiple PATCH /admin/settings/:key.
     *
     * BE expects: PATCH /admin/settings/:key with body { value: <any> }
     * FE sends: { countryAccounts?, instructions?, whatsappNumber?, paymentGroups? }
     *
     * Maps each FE key to the corresponding BE setting key and dispatches
     * parallel PATCH requests for each changed value.
     */
    updatePaymentSettings: async (payload, _actorContext) => {
      const keyMap = {
        countryAccounts: 'paymentCountryAccounts',
        instructions: 'paymentInstructions',
        whatsappNumber: 'whatsappNumber',
        paymentGroups: 'paymentGroups',
      };
      const updates = Object.entries(keyMap)
        .filter(([feKey]) => payload[feKey] !== undefined)
        .map(([feKey, beKey]) => http.patch(`/admin/settings/${beKey}`, { value: payload[feKey] }));

      if (updates.length > 0) await Promise.all(updates);
      return payload;
    },

    /**
     * GET /admin/settings → return all settings as raw array.
     * Useful for admin settings pages that show all key-value pairs.
     */
    allSettings: async () => {
      const res = await http.get('/admin/settings');
      const data = unwrap(res);
      const settings = Array.isArray(data) ? data : (data?.settings || []);
      return settings.map((s) => ({ ...s, id: s._id || s.id || s.key, _id: undefined }));
    },

    /**
     * GET /admin/settings/:key → return a single setting.
     */
    getSetting: async (key) => {
      const res = await http.get(`/admin/settings/${key}`);
      const data = unwrap(res);
      return data?.setting || data;
    },

    /**
     * PATCH /admin/settings/:key → update a single setting.
     * BE Joi: { value: <any> (required) }
     */
    updateSetting: async (key, value, _actorContext) => {
      const res = await http.patch(`/admin/settings/${key}`, { value });
      const data = unwrap(res);
      return data?.setting || data;
    },
  },

  // ── Audit ────────────────────────────────────────────────────────────────
  audit: {
    /**
     * GET /admin/audit → paginated audit logs.
     *
     * BE route handler:
     *   const { entityType, entityId, page, limit } = req.query;
     *   getEntityAuditLogs(entityId, entityType, { page, limit })
     *
     * If entityType/entityId are undefined, Mongo query matches nothing
     * specific — effectively returns an empty set.
     * To get "all" logs, omit both params (BE won't throw).
     *
     * @param {Object} [filters] - optional filters
     * @param {string} [filters.entityType] - e.g. 'USER', 'ORDER', 'PROVIDER'
     * @param {string} [filters.entityId]   - specific entity ID
     * @param {number} [filters.page]       - page number
     * @param {number} [filters.limit]      - items per page
     */
    list: async (filters = {}) => {
      const params = {};
      if (filters.entityType) params.entityType = filters.entityType;
      if (filters.entityId) params.entityId = filters.entityId;
      params.page = filters.page || 1;
      params.limit = filters.limit || 50;

      const res = await http.get('/admin/audit', { params });
      const data = unwrap(res);
      const logs = Array.isArray(data) ? data : (data?.logs || []);
      return logs.map((l) => ({
        ...l,
        id: l._id || l.id,
        _id: undefined,
        // Resolve populated actor ref
        actorName: typeof l.actorId === 'object' ? l.actorId?.name : l.actorName || '',
        actorId: typeof l.actorId === 'object' ? (l.actorId?._id || l.actorId?.id) : l.actorId,
      }));
    },

    /**
     * GET /admin/audit/actor/:actorId → paginated logs for a specific admin.
     */
    actorLogs: async (actorId, { page = 1, limit = 50 } = {}) => {
      const res = await http.get(`/admin/audit/actor/${actorId}`, { params: { page, limit } });
      const data = unwrap(res);
      const logs = Array.isArray(data) ? data : (data?.logs || []);
      return logs.map((l) => ({
        ...l,
        id: l._id || l.id,
        _id: undefined,
      }));
    },
  },

  // ── Wallet ────────────────────────────────────────────────────────────────
  wallet: {
    /**
     * GET /wallet/stats — aggregated wallet stats for authenticated user.
     * Returns: { totalDeposits, totalSpent, totalRefunds, netBalance, totalTransactions }
     */
    getStats: async () => {
      const res = await http.get('/wallet/stats');
      return unwrap(res);
    },

    /**
     * GET /wallet/transactions — paginated transaction history for authenticated user.
     * Returns array of { _id, type, amount, status, description, reference, createdAt, ... }
     */
    getTransactions: async ({ page = 1, limit = 50 } = {}) => {
      const res = await http.get('/wallet/transactions', { params: { page, limit } });
      const data = unwrap(res);
      return Array.isArray(data) ? data : (data?.transactions || data?.data || []);
    },
  },
};

export default realApi;
