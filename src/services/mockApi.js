import { 
  mockUsers, 
  mockProducts, 
  mockCategories, 
  mockGroups, 
  mockOrders, 
  mockTopups, 
  mockCurrencies,
  mockSuppliers
} from '../data/mockData';
import { getDefaultWhatsAppNumber, normalizeWhatsAppNumber } from '../utils/whatsapp';
import { createDefaultPaymentGroups, normalizePaymentGroups } from '../utils/paymentSettings';

const DELAY = 800; // Simulated network latency in ms

// Helper to get simulated "Database" from LocalStorage
const getDB = (key, defaultData) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultData;
  } catch (error) {
    console.error(`Error reading ${key} from storage`, error);
    return defaultData;
  }
};

const saveDB = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to storage`, error);
  }
};

const resolveActor = (actor) => {
  if (!actor) return null;
  const users = getDB('admin-storage', { state: { users: mockUsers } }).state.users || mockUsers;
  return users.find((u) => u.id === actor.id) || null;
};

const ensureCanManageUser = (actor, targetUser, action = 'manage') => {
  if (!actor) throw new Error('Actor context is required');
  if (actor.role === 'admin') return true;

  if (actor.role === 'manager') {
    const forbidden = ['admin', 'manager'];
    if (forbidden.includes(targetUser.role)) {
      throw new Error(`Manager is not allowed to ${action} admins/managers`);
    }
    return true;
  }

  throw new Error('Insufficient permissions');
};

const ensureAdmin = (actor) => {
  if (!actor || actor.role !== 'admin') {
    throw new Error('Only admin can manage system currencies');
  }
};

const getGroupsDb = () => getDB('group-storage', { state: { groups: mockGroups } });

const getDefaultGroupName = () => {
  const groupDb = getGroupsDb();
  const groups = groupDb?.state?.groups || mockGroups;
  return groups[0]?.name || 'Standard';
};

const resolveGroupName = (groupInput) => {
  const raw = String(groupInput || '').trim();
  const groupDb = getGroupsDb();
  const groups = groupDb?.state?.groups || mockGroups;
  const normalized = raw.toLowerCase();

  const matched = groups.find((g) => {
    const idMatch = String(g.id) === raw;
    const nameMatch = String(g.name || '').toLowerCase() === normalized;
    const nameArMatch = String(g.nameAr || '').toLowerCase() === normalized;
    return idMatch || nameMatch || nameArMatch;
  });

  return matched?.name || getDefaultGroupName();
};

const toHex = (buffer) => {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
};

const hashPassword = async (plainText) => {
  const value = String(plainText || '');
  if (typeof crypto !== 'undefined' && crypto.subtle && typeof TextEncoder !== 'undefined') {
    const encoded = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', encoded);
    return toHex(digest);
  }

  // Fallback hash for older environments where SubtleCrypto is unavailable.
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }
  return `legacy-${Math.abs(hash)}`;
};

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, passwordHash, ...safeUser } = user;
  return safeUser;
};

const secureUsersInDb = async (db) => {
  const users = db?.state?.users || [];
  let changed = false;

  for (const user of users) {
    if (!user.passwordHash) {
      const seedUser = mockUsers.find(
        (u) => u.id === user.id || String(u.email || '').toLowerCase() === String(user.email || '').toLowerCase()
      );
      const sourcePassword = typeof user.password === 'string'
        ? user.password
        : (typeof seedUser?.password === 'string' ? seedUser.password : 'password123');
      user.passwordHash = await hashPassword(sourcePassword);
      changed = true;
    }

    if (Object.prototype.hasOwnProperty.call(user, 'password')) {
      delete user.password;
      changed = true;
    }
  }

  return changed;
};

const getSeedPasswordForUser = (user) => {
  if (!user) return null;
  const seedUser = mockUsers.find(
    (u) => u.id === user.id || String(u.email || '').toLowerCase() === String(user.email || '').toLowerCase()
  );
  return typeof seedUser?.password === 'string' ? seedUser.password : null;
};

const randomTempPassword = (length = 10) => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#';
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
};

const mockProviderCatalog = [
  {
    id: 'prov-alpha',
    name: 'Alpha Provider',
    products: [
      { id: 'alpha-pubg-60', name: 'PUBG UC 60', priceCoins: 52 },
      { id: 'alpha-netflix-1m', name: 'Netflix 1M', priceCoins: 230 },
      { id: 'alpha-spotify-1m', name: 'Spotify 1M', priceCoins: 108 },
    ],
  },
  {
    id: 'prov-beta',
    name: 'Beta Supplier',
    products: [
      { id: 'beta-freefire-100', name: 'FreeFire 100 Diamonds', priceCoins: 44 },
      { id: 'beta-itunes-10', name: 'iTunes 10$', priceCoins: 355 },
      { id: 'beta-netflix-1m', name: 'Netflix 1M', priceCoins: 238 },
    ],
  },
  {
    id: 'prov-gamma',
    name: 'Gamma Digital Hub',
    products: [
      { id: 'gamma-pubg-325', name: 'PUBG UC 325', priceCoins: 255 },
      { id: 'gamma-youtube-1m', name: 'YouTube Premium 1M', priceCoins: 122 },
      { id: 'gamma-disney-1m', name: 'Disney+ 1M', priceCoins: 141 },
    ],
  },
];

const getProviderProduct = (providerId, providerProductId) => {
  const provider = mockProviderCatalog.find((p) => p.id === providerId);
  if (!provider) return null;
  return provider.products.find((p) => p.id === providerProductId) || null;
};

const applyProviderPricing = (productData) => {
  const syncPrice = Boolean(productData?.syncPriceWithProvider);
  if (!syncPrice) {
    return {
      ...productData,
      basePriceCoins: Number(productData?.basePriceCoins || 0),
      manualPriceAdjustment: Number(productData?.manualPriceAdjustment || 0),
      minQty: Number(productData?.minQty || 1),
      maxQty: Number(productData?.maxQty || 999),
      displayOrder: Number(productData?.displayOrder || 0),
      providerQuantity: Number(productData?.providerQuantity || 0),
    };
  }

  const providerProduct = getProviderProduct(productData?.providerId, productData?.providerProductId);
  const syncedBase = Number(providerProduct?.priceCoins || 0);
  const manualDelta = Number(productData?.manualPriceAdjustment || 0);

  return {
    ...productData,
    basePriceCoins: syncedBase + manualDelta,
    syncedProviderBasePrice: syncedBase,
    manualPriceAdjustment: manualDelta,
    minQty: Number(productData?.minQty || 1),
    maxQty: Number(productData?.maxQty || 999),
    displayOrder: Number(productData?.displayOrder || 0),
    providerQuantity: Number(productData?.providerQuantity || 0),
  };
};

const SAFE_HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const SENSITIVE_KEYS = new Set([
  'apikey',
  'api_key',
  'secret',
  'token',
  'authorization',
  'password',
  'webhooksecret',
  'bearertoken',
]);

const maskSecret = (value) => {
  const raw = String(value || '');
  if (!raw) return '';
  if (raw.length <= 4) return '****';
  return `${raw.slice(0, 2)}****${raw.slice(-2)}`;
};

const maskHeaders = (headers = []) => {
  if (!Array.isArray(headers)) return [];
  return headers.map((h) => {
    const key = String(h?.key || '');
    const normalized = key.toLowerCase().replace(/[-_]/g, '');
    const shouldMask = [...SENSITIVE_KEYS].some((s) => normalized.includes(s.replace(/[-_]/g, '')));
    return {
      key,
      value: shouldMask ? maskSecret(h?.value) : String(h?.value || ''),
    };
  });
};

const sanitizeSupplierForUi = (supplier) => {
  if (!supplier) return null;
  return {
    ...supplier,
    apiKey: maskSecret(supplier.apiKey),
    apiSecret: maskSecret(supplier.apiSecret),
    bearerToken: maskSecret(supplier.bearerToken),
    password: maskSecret(supplier.password),
    webhookSecret: maskSecret(supplier.webhookSecret),
    customHeaders: maskHeaders(supplier.customHeaders),
  };
};

const getSuppliersDb = () => getDB('suppliers-storage', { state: { suppliers: mockSuppliers } });
const getAuditDb = () => getDB('audit-storage', { state: { logs: [] } });

const writeAuditLog = ({ actorId = 'system', action, supplierId = null, orderId = null, targetType = 'supplier', oldSummary = null, newSummary = null }) => {
  const db = getAuditDb();
  db.state.logs = [
    {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      actorId,
      action,
      supplierId,
      orderId,
      targetType,
      oldSummary,
      newSummary,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString(),
    },
    ...(db.state.logs || []),
  ];
  saveDB('audit-storage', db);
};

const isPrivateOrLocalHost = (hostname = '') => {
  const host = String(hostname || '').toLowerCase();
  if (!host) return true;
  if (['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(host)) return true;
  if (host.startsWith('10.')) return true;
  if (host.startsWith('192.168.')) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)) return true;
  if (host.endsWith('.local') || host.endsWith('.internal')) return true;
  return false;
};

const validateExternalUrl = (baseUrl) => {
  let parsed;
  try {
    parsed = new URL(String(baseUrl || '').trim());
  } catch {
    throw new Error('Invalid baseUrl');
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only http/https protocols are allowed');
  }
  if (isPrivateOrLocalHost(parsed.hostname)) {
    throw new Error('Blocked URL host (SSRF protection)');
  }
  return parsed.toString().replace(/\/+$/, '');
};

const ensureValidEndpoint = (endpoint, fieldName) => {
  const value = String(endpoint || '').trim();
  if (!value) return '';
  if (!value.startsWith('/')) {
    throw new Error(`${fieldName} must start with "/"`);
  }
  if (value.includes('://')) {
    throw new Error(`${fieldName} must be relative endpoint`);
  }
  return value;
};

const normalizeSupplierPayload = (payload = {}) => {
  const normalized = {
    ...payload,
    supplierName: String(payload.supplierName || '').trim(),
    supplierCode: String(payload.supplierCode || '').trim().toUpperCase(),
    supplierType: ['api', 'manual', 'hybrid'].includes(payload.supplierType) ? payload.supplierType : 'api',
    authType: ['none', 'api_key', 'bearer_token', 'basic_auth', 'custom_headers'].includes(payload.authType) ? payload.authType : 'none',
    requestMethod: SAFE_HTTP_METHODS.includes(String(payload.requestMethod || '').toUpperCase()) ? String(payload.requestMethod).toUpperCase() : 'POST',
    payloadFormat: ['json', 'form-data', 'x-www-form-urlencoded'].includes(payload.payloadFormat) ? payload.payloadFormat : 'json',
    responseFormat: ['json', 'text', 'custom'].includes(payload.responseFormat) ? payload.responseFormat : 'json',
    timeoutMs: Math.min(Math.max(Number(payload.timeoutMs || 8000), 1000), 30000),
    isActive: payload.isActive !== false,
    enableAutoFulfillment: payload.enableAutoFulfillment !== false,
    enableStatusSync: Boolean(payload.enableStatusSync),
    enableProductSync: Boolean(payload.enableProductSync),
    customHeaders: Array.isArray(payload.customHeaders) ? payload.customHeaders.map((h) => ({
      key: String(h?.key || '').trim(),
      value: String(h?.value || '').trim(),
    })).filter((h) => h.key) : [],
    supplierFieldMappings: Array.isArray(payload.supplierFieldMappings) ? payload.supplierFieldMappings.map((m) => ({
      internalField: String(m?.internalField || '').trim(),
      externalField: String(m?.externalField || '').trim(),
    })).filter((m) => m.internalField && m.externalField) : [],
    baseUrl: validateExternalUrl(payload.baseUrl),
    placeOrderEndpoint: ensureValidEndpoint(payload.placeOrderEndpoint, 'placeOrderEndpoint'),
    checkOrderStatusEndpoint: ensureValidEndpoint(payload.checkOrderStatusEndpoint, 'checkOrderStatusEndpoint'),
    getBalanceEndpoint: ensureValidEndpoint(payload.getBalanceEndpoint, 'getBalanceEndpoint'),
    getProductsEndpoint: ensureValidEndpoint(payload.getProductsEndpoint, 'getProductsEndpoint'),
    cancelOrderEndpoint: ensureValidEndpoint(payload.cancelOrderEndpoint, 'cancelOrderEndpoint'),
  };

  if (!normalized.supplierName) throw new Error('supplierName is required');
  if (!normalized.supplierCode) throw new Error('supplierCode is required');
  if (!normalized.baseUrl) throw new Error('baseUrl is required');
  return normalized;
};

const defaultPaymentSettings = {
  countryAccounts: [],
  instructions: 'ارفع صورة الإيصال وحدد المبلغ قبل إرسال الطلب.',
  whatsappNumber: getDefaultWhatsAppNumber(),
  paymentGroups: createDefaultPaymentGroups(),
};

// --- Mock API Service ---
const mockApi = {
  
  // --- Auth & Users ---
  auth: {
    login: async (email, password) => {
      await new Promise(resolve => setTimeout(resolve, DELAY));
      const db = getDB('admin-storage', { state: { users: mockUsers } });
      const users = db.state.users || mockUsers;
      const migrated = await secureUsersInDb(db);
      if (migrated) saveDB('admin-storage', db);

      const normalizedEmail = String(email || '').trim().toLowerCase();
      const candidateHash = await hashPassword(password);
      let user = users.find(
        (u) => String(u.email || '').toLowerCase() === normalizedEmail && u.passwordHash === candidateHash
      );

      // Self-heal old corrupted hashes created before migration fix.
      if (!user) {
        const emailUser = users.find((u) => String(u.email || '').toLowerCase() === normalizedEmail);
        const seedPassword = getSeedPasswordForUser(emailUser);
        if (emailUser && seedPassword && password === seedPassword) {
          emailUser.passwordHash = candidateHash;
          saveDB('admin-storage', db);
          user = emailUser;
        }
      }
      
      if (!user) throw new Error('Invalid email or password');

      // Security gate: only ACTIVE users are allowed to sign in.
      // This also blocks typo variants like "pendding" and any unknown status values.
      const normalizedStatus = String(user.status || '').trim().toLowerCase();
      if (normalizedStatus !== 'active') {
        if (['pending', 'pendding', 'requested'].includes(normalizedStatus)) {
          throw new Error('Account pending approval');
        }
        throw new Error('Account access denied');
      }
      
      return { user: sanitizeUser(user), token: 'mock-jwt-token-12345' };
    },

    loginWithGoogle: async () => {
      await new Promise(resolve => setTimeout(resolve, DELAY));
      const db = getDB('admin-storage', { state: { users: mockUsers } });
      const users = db.state.users || mockUsers;
      const migrated = await secureUsersInDb(db);
      if (migrated) saveDB('admin-storage', db);

      const googleEmail = 'google.user@ibrastore.app';
      let user = users.find((item) => String(item.email || '').toLowerCase() === googleEmail);

      if (!user) {
        user = {
          id: `u${Date.now()}`,
          name: 'Google User',
          username: `googleuser${Math.random().toString(36).slice(2, 6)}`,
          email: googleEmail,
          passwordHash: await hashPassword(`google-${Date.now()}`),
          role: 'customer',
          coins: 0,
          group: getDefaultGroupName(),
          status: 'active',
          country: 'US',
          currency: 'USD',
          phone: '+10000000000',
          joinDate: new Date().toISOString(),
          avatar: 'https://ui-avatars.com/api/?name=Google+User&background=ffffff&color=4285F4',
          authProvider: 'google',
        };

        db.state.users = [...users, user];
        saveDB('admin-storage', db);
      }

      return { user: sanitizeUser(user), token: 'mock-google-token-12345' };
    },
    
    register: async (userData) => {
      await new Promise(resolve => setTimeout(resolve, DELAY));
      const db = getDB('admin-storage', { state: { users: mockUsers } });
      const users = db.state.users || mockUsers;
      const migrated = await secureUsersInDb(db);
      if (migrated) saveDB('admin-storage', db);
      const normalizedEmail = String(userData.email || '').trim().toLowerCase();
      
      if (users.some(u => String(u.email || '').toLowerCase() === normalizedEmail)) throw new Error('Email already registered');
      
      const newUser = {
        id: `u${Date.now()}`,
        ...userData,
        email: normalizedEmail,
        passwordHash: await hashPassword(userData.password || ''),
        role: 'customer',
        coins: 0,
        group: resolveGroupName(userData.group),
        status: 'pending', // Default per requirements
        joinDate: new Date().toISOString(),
        avatar: `https://ui-avatars.com/api/?name=${userData.name || userData.username || 'User'}&background=random`
      };
      delete newUser.password;
      
      // Save to "Database"
      db.state.users = [...users, newUser];
      saveDB('admin-storage', db);
      
      return { user: sanitizeUser(newUser) };
    },
    
    getProfile: async (userId) => {
       await new Promise(resolve => setTimeout(resolve, DELAY));
       const db = getDB('admin-storage', { state: { users: mockUsers } });
       const users = db.state.users;
       const migrated = await secureUsersInDb(db);
       if (migrated) saveDB('admin-storage', db);
       const user = users.find(u => u.id === userId);
       if (!user) throw new Error('User not found');
       return sanitizeUser(user);
    }
  },

  // --- Products ---
  products: {
    list: async () => {
      await new Promise(resolve => setTimeout(resolve, DELAY));
      // Read from persisted store format or fallback
      const data = getDB('products-storage', { state: { products: mockProducts } });
      return data.state.products || mockProducts;
    },
    
    get: async (id) => {
      await new Promise(resolve => setTimeout(resolve, DELAY));
      const products = await mockApi.products.list();
      return products.find(p => p.id === id);
    },
    
    create: async (productData) => {
      await new Promise(resolve => setTimeout(resolve, DELAY));
      const db = getDB('products-storage', { state: { products: mockProducts } });
      const resolved = applyProviderPricing(productData);
      const newProduct = { ...resolved, id: `p${Date.now()}` };
      
      db.state.products = [...(db.state.products || []), newProduct];
      saveDB('products-storage', db);
      return newProduct;
    },
    
    update: async (id, updates) => {
      await new Promise(resolve => setTimeout(resolve, DELAY));
      const db = getDB('products-storage', { state: { products: mockProducts } });
      const index = db.state.products.findIndex(p => p.id === id);
      
      if (index === -1) throw new Error('Product not found');
      
      const merged = { ...db.state.products[index], ...updates };
      const updatedProduct = applyProviderPricing(merged);
      db.state.products[index] = updatedProduct;
      saveDB('products-storage', db);
      return updatedProduct;
    },
    
    delete: async (id) => {
      await new Promise(resolve => setTimeout(resolve, DELAY));
      const db = getDB('products-storage', { state: { products: mockProducts } });
      db.state.products = db.state.products.filter(p => p.id !== id);
      saveDB('products-storage', db);
      return { success: true };
    },

    listProviders: async () => {
      await new Promise(resolve => setTimeout(resolve, DELAY));
      return mockProviderCatalog.map((provider) => ({ id: provider.id, name: provider.name }));
    },

    listProviderProducts: async (providerId) => {
      await new Promise(resolve => setTimeout(resolve, DELAY));
      const provider = mockProviderCatalog.find((p) => p.id === providerId);
      if (!provider) return [];
      return provider.products;
    },

    getSyncedPrice: async (providerId, providerProductId) => {
      await new Promise(resolve => setTimeout(resolve, DELAY));
      const product = getProviderProduct(providerId, providerProductId);
      if (!product) throw new Error('Provider product not found');
      return { basePriceCoins: Number(product.priceCoins || 0) };
    }
  },

  // --- Categories ---
  categories: {
    list: async () => {
      await new Promise(resolve => setTimeout(resolve, DELAY));
      const data = getDB('products-storage', { state: { categories: mockCategories } });
      return data.state.categories || mockCategories;
    },
    
    create: async (categoryData) => {
      await new Promise(resolve => setTimeout(resolve, DELAY));
      const db = getDB('products-storage', { state: { categories: mockCategories } });
      const newCategory = { ...categoryData, id: categoryData.id || `cat-${Date.now()}` };
      
      db.state.categories = [...(db.state.categories || []), newCategory];
      saveDB('products-storage', db);
      return newCategory;
    },
    
    delete: async (id) => {
       await new Promise(resolve => setTimeout(resolve, DELAY));
       const db = getDB('products-storage', { state: { categories: mockCategories } });
       const deletedCategory = (db.state.categories || mockCategories).find((c) => c.id === id);
       db.state.categories = db.state.categories.filter(c => c.id !== id);
       db.state.products = (db.state.products || mockProducts).filter((p) => {
         const raw = String(p.category || '').trim();
         return raw !== id && raw !== deletedCategory?.name && raw !== deletedCategory?.nameAr;
       });
       saveDB('products-storage', db);
       return { success: true };
    }
  },

  // --- Suppliers ---
  suppliers: {
    list: async () => {
      await new Promise(resolve => setTimeout(resolve, DELAY));
      const db = getSuppliersDb();
      const productsDb = getDB('products-storage', { state: { products: mockProducts } });
      const products = productsDb.state.products || [];
      return (db.state.suppliers || []).map((s) => {
        const linkedProductsCount = products.filter((p) => p.supplierId === s.id).length;
        return sanitizeSupplierForUi({ ...s, linkedProductsCount });
      });
    },

    get: async (id) => {
      await new Promise(resolve => setTimeout(resolve, DELAY));
      const db = getSuppliersDb();
      const found = (db.state.suppliers || []).find((s) => s.id === id);
      if (!found) throw new Error('Supplier not found');
      return sanitizeSupplierForUi(found);
    },

    create: async (payload, actorContext) => {
      await new Promise(resolve => setTimeout(resolve, DELAY));
      const db = getSuppliersDb();
      const normalized = normalizeSupplierPayload(payload);
      const codeExists = (db.state.suppliers || []).some((s) => s.supplierCode === normalized.supplierCode);
      if (codeExists) throw new Error('supplierCode must be unique');
      const record = {
        id: `sup-${Date.now()}`,
        ...normalized,
        lastConnectionTestAt: null,
        lastConnectionTestStatus: 'not_tested',
        lastConnectionTestMessage: 'Not tested',
      };
      db.state.suppliers = [record, ...(db.state.suppliers || [])];
      saveDB('suppliers-storage', db);
      writeAuditLog({
        actorId: actorContext?.id || 'system',
        action: 'supplier_created',
        supplierId: record.id,
        targetType: 'supplier',
        newSummary: { supplierName: record.supplierName, supplierCode: record.supplierCode },
      });
      return sanitizeSupplierForUi(record);
    },

    update: async (id, payload, actorContext) => {
      await new Promise(resolve => setTimeout(resolve, DELAY));
      const db = getSuppliersDb();
      const idx = (db.state.suppliers || []).findIndex((s) => s.id === id);
      if (idx === -1) throw new Error('Supplier not found');
      const current = db.state.suppliers[idx];
      const normalized = normalizeSupplierPayload({ ...current, ...payload });
      const duplicate = (db.state.suppliers || []).some((s, i) => i !== idx && s.supplierCode === normalized.supplierCode);
      if (duplicate) throw new Error('supplierCode must be unique');
      const next = { ...current, ...normalized };
      db.state.suppliers[idx] = next;
      saveDB('suppliers-storage', db);
      writeAuditLog({
        actorId: actorContext?.id || 'system',
        action: 'supplier_updated',
        supplierId: id,
        targetType: 'supplier',
        oldSummary: { supplierName: current.supplierName, isActive: current.isActive },
        newSummary: { supplierName: next.supplierName, isActive: next.isActive },
      });
      return sanitizeSupplierForUi(next);
    },

    deactivate: async (id, actorContext) => {
      await new Promise(resolve => setTimeout(resolve, DELAY));
      const db = getSuppliersDb();
      const supplier = (db.state.suppliers || []).find((s) => s.id === id);
      if (!supplier) throw new Error('Supplier not found');
      supplier.isActive = false;
      saveDB('suppliers-storage', db);
      writeAuditLog({
        actorId: actorContext?.id || 'system',
        action: 'supplier_deactivated',
        supplierId: id,
        targetType: 'supplier',
      });
      return sanitizeSupplierForUi(supplier);
    },

    testConnection: async (id, actorContext) => {
      await new Promise(resolve => setTimeout(resolve, DELAY));
      const db = getSuppliersDb();
      const supplier = (db.state.suppliers || []).find((s) => s.id === id);
      if (!supplier) throw new Error('Supplier not found');
      try {
        validateExternalUrl(supplier.baseUrl);
      } catch (error) {
        supplier.lastConnectionTestAt = new Date().toISOString();
        supplier.lastConnectionTestStatus = 'failed';
        supplier.lastConnectionTestMessage = error.message;
        saveDB('suppliers-storage', db);
        writeAuditLog({ actorId: actorContext?.id || 'system', action: 'supplier_test_failed', supplierId: id, targetType: 'supplier', newSummary: { message: error.message } });
        return sanitizeSupplierForUi(supplier);
      }

      const method = String(supplier.requestMethod || 'POST').toUpperCase();
      const status = SAFE_HTTP_METHODS.includes(method) ? 'connected' : 'failed';
      const message = status === 'connected' ? 'Connection successful' : 'Invalid request method';
      supplier.lastConnectionTestAt = new Date().toISOString();
      supplier.lastConnectionTestStatus = status;
      supplier.lastConnectionTestMessage = message;
      saveDB('suppliers-storage', db);
      writeAuditLog({
        actorId: actorContext?.id || 'system',
        action: 'supplier_connection_tested',
        supplierId: id,
        targetType: 'supplier',
        newSummary: { status, message },
      });
      return sanitizeSupplierForUi(supplier);
    },

    syncProducts: async (id, actorContext) => {
      await new Promise(resolve => setTimeout(resolve, DELAY));
      const db = getSuppliersDb();
      const supplier = (db.state.suppliers || []).find((s) => s.id === id);
      if (!supplier) throw new Error('Supplier not found');
      const provider = mockProviderCatalog.find((p) => String(p.id || '').toLowerCase().includes(String(supplier.supplierCode || '').toLowerCase())) || mockProviderCatalog[0];
      const items = provider?.products || [];
      writeAuditLog({
        actorId: actorContext?.id || 'system',
        action: 'supplier_products_synced',
        supplierId: id,
        targetType: 'supplier',
        newSummary: { count: items.length },
      });
      return items.map((p) => ({
        externalProductId: p.id,
        externalProductName: p.name,
        supplierPrice: p.priceCoins,
      }));
    },
  },

  // --- Orders ---
  orders: {
    list: async (userId) => {
      await new Promise(resolve => setTimeout(resolve, DELAY));
      const db = getDB('order-storage', { state: { orders: mockOrders } });
      const allOrders = db.state.orders || mockOrders;
      
      if (userId) {
          return allOrders.filter(o => o.userId === userId);
      }
      return allOrders; // Admin sees all
    },
    
    create: async (orderData) => {
      await new Promise(resolve => setTimeout(resolve, DELAY));
      const db = getDB('order-storage', { state: { orders: mockOrders } });
      const existingOrders = db.state.orders || [];
      const idempotencyKey = String(orderData.idempotencyKey || '').trim();

      if (idempotencyKey) {
        const existing = existingOrders.find((o) => String(o.idempotencyKey || '') === idempotencyKey);
        if (existing) {
          return { order: existing };
        }
      }
      
      // Check User Balance (Transaction logic)
      const userDB = getDB('admin-storage', { state: { users: mockUsers } });
      const userIndex = userDB.state.users.findIndex(u => u.id === orderData.userId);
      
      if (userIndex === -1) throw new Error('User not found');
      const user = userDB.state.users[userIndex];
      
      if (user.coins < orderData.priceCoins) {
          throw new Error('Insufficient balance');
      }
      
      // Deduct Coins
      user.coins -= orderData.priceCoins;
      userDB.state.users[userIndex] = user;
      saveDB('admin-storage', userDB);
      
      // Create Order
      const newOrder = {
          id: `ord-${Date.now()}`,
          status: 'pending',
          createdAt: new Date().toISOString(),
          ...orderData,
          idempotencyKey: idempotencyKey || null,
          supplierId: null,
          supplierName: null,
          externalProductId: null,
          externalOrderId: null,
          externalStatus: null,
          supplierRequestSnapshot: null,
          supplierResponseSnapshot: null,
          supplierLastSyncAt: null,
          providerReferenceMessage: null,
          fulfillmentMode: 'manual',
      };

      // Auto fulfillment workflow
      const productsDb = getDB('products-storage', { state: { products: mockProducts } });
      const suppliersDb = getSuppliersDb();
      const product = (productsDb.state.products || []).find((p) => p.id === orderData.productId);
      const supplier = (suppliersDb.state.suppliers || []).find((s) => s.id === product?.supplierId);
      const canAutoFulfill = Boolean(
        product &&
        supplier &&
        supplier.isActive &&
        supplier.enableAutoFulfillment &&
        product.autoFulfillmentEnabled !== false &&
        product.externalProductId &&
        String(supplier.supplierType || '').toLowerCase() !== 'manual'
      );

      if (canAutoFulfill) {
        const mappings = Array.isArray(product.supplierFieldMappings) && product.supplierFieldMappings.length
          ? product.supplierFieldMappings
          : (Array.isArray(supplier.supplierFieldMappings) ? supplier.supplierFieldMappings : []);

        const internalSource = {
          orderReference: newOrder.id,
          externalProductId: product.externalProductId,
          quantity: Number(orderData.quantity || 1),
          playerId: String(orderData.playerId || ''),
          userId: String(orderData.userId || ''),
        };

        const payload = {};
        mappings.forEach((m) => {
          payload[m.externalField] = internalSource[m.internalField] ?? null;
        });
        if (!Object.keys(payload).length) {
          payload.externalProductId = product.externalProductId;
          payload.quantity = Number(orderData.quantity || 1);
          payload.playerId = String(orderData.playerId || '');
          payload.orderReference = newOrder.id;
        }

        // Simulated provider call (secured snapshot without credentials)
        const simulatedSuccess = Math.random() > 0.08;
        const externalId = `${supplier.supplierCode}-${Date.now()}`;
        const response = simulatedSuccess
          ? { success: true, message: 'Accepted', data: { orderId: externalId, status: 'pending' } }
          : { success: false, message: 'Provider rejected request', data: { status: 'failed' } };

        newOrder.supplierId = supplier.id;
        newOrder.supplierName = supplier.supplierName;
        newOrder.externalProductId = product.externalProductId;
        newOrder.externalOrderId = response?.data?.orderId || null;
        newOrder.externalStatus = response?.data?.status || (simulatedSuccess ? 'pending' : 'failed');
        newOrder.supplierRequestSnapshot = payload;
        newOrder.supplierResponseSnapshot = response;
        newOrder.supplierLastSyncAt = new Date().toISOString();
        newOrder.providerReferenceMessage = response?.message || '';
        newOrder.fulfillmentMode = 'auto';
        newOrder.status = simulatedSuccess ? 'processing' : 'failed';

        writeAuditLog({
          actorId: String(orderData.userId || 'system'),
          action: simulatedSuccess ? 'supplier_order_created' : 'supplier_order_failed',
          supplierId: supplier.id,
          orderId: newOrder.id,
          targetType: 'order',
          newSummary: { supplierName: supplier.supplierName, externalOrderId: newOrder.externalOrderId, status: newOrder.externalStatus },
        });
      }
      
      db.state.orders = [newOrder, ...(db.state.orders || [])];
      saveDB('order-storage', db);
      
      return { order: newOrder, updatedBalance: user.coins };
    },
    
    updateStatus: async (orderId, status) => {
       await new Promise(resolve => setTimeout(resolve, DELAY));
       const db = getDB('order-storage', { state: { orders: mockOrders } });
       const order = db.state.orders.find(o => o.id === orderId);
       
       if (order) {
           order.status = status;
           saveDB('order-storage', db);
       }
       return order;
    },

    syncSupplierStatus: async (orderId, actorContext) => {
      await new Promise(resolve => setTimeout(resolve, DELAY));
      const db = getDB('order-storage', { state: { orders: mockOrders } });
      const orders = db.state.orders || [];
      const order = orders.find((o) => o.id === orderId);
      if (!order || !order.supplierId || !order.externalOrderId) throw new Error('Order is not linked to supplier');

      const lifecycle = ['pending', 'processing', 'completed'];
      const current = String(order.externalStatus || 'pending').toLowerCase();
      const idx = Math.max(lifecycle.indexOf(current), 0);
      const next = lifecycle[Math.min(idx + 1, lifecycle.length - 1)];

      order.externalStatus = next;
      order.status = next === 'completed' ? 'completed' : (next === 'processing' ? 'processing' : 'pending');
      order.supplierLastSyncAt = new Date().toISOString();
      order.supplierResponseSnapshot = { success: true, data: { orderId: order.externalOrderId, status: next }, message: 'Synced' };

      saveDB('order-storage', db);
      writeAuditLog({
        actorId: actorContext?.id || 'system',
        action: 'supplier_status_sync',
        supplierId: order.supplierId,
        orderId: order.id,
        targetType: 'order',
        newSummary: { externalStatus: next },
      });
      return order;
    },
  },

  // --- Groups ---
  groups: {
    list: async () => {
       await new Promise(resolve => setTimeout(resolve, DELAY));
       const data = getDB('group-storage', { state: { groups: mockGroups } });
       return data.state.groups || mockGroups;
    },
     create: async (groupData) => {
       await new Promise(resolve => setTimeout(resolve, DELAY));
       const db = getDB('group-storage', { state: { groups: mockGroups } });
       const newGroup = { id: Date.now(), ...groupData };
       db.state.groups = [...(db.state.groups || []), newGroup];
       saveDB('group-storage', db);
       return newGroup;
     },
     update: async (id, updates) => {
       await new Promise(resolve => setTimeout(resolve, DELAY));
       const db = getDB('group-storage', { state: { groups: mockGroups } });
       db.state.groups = (db.state.groups || []).map((g) => (g.id === id ? { ...g, ...updates } : g));
       saveDB('group-storage', db);
       return db.state.groups.find((g) => g.id === id) || null;
     },
     delete: async (id) => {
       await new Promise(resolve => setTimeout(resolve, DELAY));
       const db = getDB('group-storage', { state: { groups: mockGroups } });
       db.state.groups = (db.state.groups || []).filter((g) => g.id !== id);
       saveDB('group-storage', db);
       return { success: true };
     },
  },
  
  // --- Admin User Management ---
  users: {
      list: async () => {
          await new Promise(resolve => setTimeout(resolve, DELAY));
          const data = getDB('admin-storage', { state: { users: mockUsers } });
        const migrated = await secureUsersInDb(data);
        if (migrated) saveDB('admin-storage', data);
        return (data.state.users || mockUsers).map(sanitizeUser);
      },
      
      updateStatus: async (userId, status, actorContext) => {
          await new Promise(resolve => setTimeout(resolve, DELAY));
          const db = getDB('admin-storage', { state: { users: mockUsers } });
          const migrated = await secureUsersInDb(db);
          if (migrated) saveDB('admin-storage', db);
          const actor = resolveActor(actorContext);
          const user = db.state.users.find(u => u.id === userId);
          if (!user) return null;
          ensureCanManageUser(actor, user, 'update status of');
          if (user) {
              user.status = status;
              saveDB('admin-storage', db);
          }
            return sanitizeUser(user);
      },
      
      addCoins: async (userId, amount, actorContext) => {
          await new Promise(resolve => setTimeout(resolve, DELAY));
          const db = getDB('admin-storage', { state: { users: mockUsers } });
          const migrated = await secureUsersInDb(db);
          if (migrated) saveDB('admin-storage', db);
          const actor = resolveActor(actorContext);
          const user = db.state.users.find(u => u.id === userId);
          if (!user) return null;

          // Customer can only deduct their own balance (purchase flow), never add credits.
          const isSelfDeduction = actor && actor.role === 'customer' && actor.id === userId && Number(amount) < 0;
          if (!isSelfDeduction) {
            ensureCanManageUser(actor, user, 'top up');
          }

          if (user) {
              user.coins = (user.coins || 0) + amount;
              saveDB('admin-storage', db);
          }
            return sanitizeUser(user);
          },

          updateGroup: async (userId, group, actorContext) => {
            await new Promise(resolve => setTimeout(resolve, DELAY));
            const db = getDB('admin-storage', { state: { users: mockUsers } });
          const migrated = await secureUsersInDb(db);
          if (migrated) saveDB('admin-storage', db);
          const actor = resolveActor(actorContext);
            const user = db.state.users.find(u => u.id === userId);
          if (!user) return null;
          ensureCanManageUser(actor, user, 'update group of');
            if (user) {
              user.group = resolveGroupName(group);
              saveDB('admin-storage', db);
            }
            return sanitizeUser(user);
        },

        updateRole: async (userId, role, actorContext) => {
          await new Promise(resolve => setTimeout(resolve, DELAY));
          const db = getDB('admin-storage', { state: { users: mockUsers } });
          const migrated = await secureUsersInDb(db);
          if (migrated) saveDB('admin-storage', db);
          const actor = resolveActor(actorContext);
          const user = db.state.users.find(u => u.id === userId);
          if (!user) return null;

          if (!actor || actor.role !== 'admin') {
          throw new Error('Only admin can change roles');
          }
          if (user.role === 'admin' && role !== 'admin') {
          throw new Error('Cannot demote an admin in mock security mode');
          }

          user.role = role;
          saveDB('admin-storage', db);
          return sanitizeUser(user);
        },

        updateCurrency: async (userId, currencyCode, actorContext) => {
          await new Promise(resolve => setTimeout(resolve, DELAY));
          const db = getDB('admin-storage', { state: { users: mockUsers } });
          const migrated = await secureUsersInDb(db);
          if (migrated) saveDB('admin-storage', db);
          const actor = resolveActor(actorContext);
          const user = db.state.users.find(u => u.id === userId);
          if (!user) return null;
          ensureCanManageUser(actor, user, 'update currency for');

          const code = String(currencyCode || '').trim().toUpperCase();
          if (!code) throw new Error('Currency code is required');

          const systemDb = getDB('system-storage', { state: { currencies: mockCurrencies } });
          const list = systemDb?.state?.currencies || mockCurrencies;
          const exists = list.some((item) => String(item.code || '').toUpperCase() === code);
          if (!exists) throw new Error('Currency is not allowed in system settings');

          user.currency = code;
          saveDB('admin-storage', db);
          return sanitizeUser(user);
        },

        delete: async (userId, actorContext) => {
          await new Promise(resolve => setTimeout(resolve, DELAY));
          const db = getDB('admin-storage', { state: { users: mockUsers } });
          const migrated = await secureUsersInDb(db);
          if (migrated) saveDB('admin-storage', db);
          const actor = resolveActor(actorContext);
          const target = db.state.users.find(u => u.id === userId);
          if (!target) return { success: false };

          ensureCanManageUser(actor, target, 'delete');
          if (target.role === 'admin') {
          throw new Error('Cannot delete admin accounts');
          }

          db.state.users = db.state.users.filter((u) => u.id !== userId);
          saveDB('admin-storage', db);
          return { success: true };
        },

        updateAvatar: async (userId, avatar, actorContext) => {
          await new Promise(resolve => setTimeout(resolve, DELAY));
          const db = getDB('admin-storage', { state: { users: mockUsers } });
          const migrated = await secureUsersInDb(db);
          if (migrated) saveDB('admin-storage', db);
          const actor = resolveActor(actorContext);
          const user = db.state.users.find(u => u.id === userId);
          if (!user) return null;

          // self-update is allowed for all roles
          const isSelf = actor && actor.id === userId;
          if (!isSelf) {
          ensureCanManageUser(actor, user, 'update avatar for');
          }

          user.avatar = avatar;
          saveDB('admin-storage', db);
            return sanitizeUser(user);
      },

      updateProfile: async (userId, updates, actorContext) => {
          await new Promise(resolve => setTimeout(resolve, DELAY));
          const db = getDB('admin-storage', { state: { users: mockUsers } });
          const migrated = await secureUsersInDb(db);
          if (migrated) saveDB('admin-storage', db);
          const actor = resolveActor(actorContext);
          const user = db.state.users.find(u => u.id === userId);
          if (!user) return null;

          const isSelf = actor && actor.id === userId;
          if (!isSelf) {
            ensureCanManageUser(actor, user, 'update profile for');
          }

          const nextName = typeof updates?.name === 'string' ? updates.name.trim() : user.name;
          const nextEmail = typeof updates?.email === 'string' ? updates.email.trim().toLowerCase() : user.email;
          const nextPassword = typeof updates?.password === 'string' ? updates.password : '';

          if (!nextName) {
            throw new Error('Name is required');
          }

          if (!nextEmail || !nextEmail.includes('@')) {
            throw new Error('A valid email is required');
          }

          const duplicate = db.state.users.find(
            (u) => u.id !== userId && String(u.email || '').toLowerCase() === nextEmail
          );
          if (duplicate) {
            throw new Error('Email already registered');
          }

          if (nextPassword && nextPassword.length < 6) {
            throw new Error('Password must be at least 6 characters');
          }

          user.name = nextName;
          user.email = nextEmail;
          if (nextPassword) {
            user.passwordHash = await hashPassword(nextPassword);
          }

          saveDB('admin-storage', db);
          return sanitizeUser(user);
      },

      resetPassword: async (userId, actorContext) => {
          await new Promise(resolve => setTimeout(resolve, DELAY));
          const db = getDB('admin-storage', { state: { users: mockUsers } });
          const migrated = await secureUsersInDb(db);
          if (migrated) saveDB('admin-storage', db);
          const actor = resolveActor(actorContext);
          const user = db.state.users.find((u) => u.id === userId);
          if (!user) return null;

          const isSelf = actor && actor.id === userId;
          if (!isSelf) {
            ensureCanManageUser(actor, user, 'reset password for');
          }

          const temporaryPassword = randomTempPassword(10);
          user.passwordHash = await hashPassword(temporaryPassword);
          saveDB('admin-storage', db);

          return {
            user: sanitizeUser(user),
            temporaryPassword,
          };
      }
  },

  // --- Topups ---
  topups: {
    list: async () => {
      await new Promise(resolve => setTimeout(resolve, DELAY));
      const data = getDB('topup-storage', { state: { topups: mockTopups } });
      return data.state.topups || mockTopups;
    },
    
    create: async (topupData) => {
        await new Promise(resolve => setTimeout(resolve, DELAY));
        const db = getDB('topup-storage', { state: { topups: mockTopups } });
      const amount = Number(topupData.requestedAmount ?? topupData.requestedCoins ?? topupData.amount ?? 0);
        const newTopup = {
            id: `top-${Date.now()}`,
            ...topupData,
            status: 'pending',
        createdAt: new Date().toISOString(),
        requestedAmount: amount,
        requestedCoins: amount,
        amount,
        currencyCode: String(topupData.currencyCode || 'USD').toUpperCase(),
        paymentChannel: topupData.paymentChannel || 'cash_wallet',
        proofImage: topupData.proofImage || '',
        transferCountryCode: String(topupData.transferCountryCode || '').toUpperCase(),
        transferCountryName: topupData.transferCountryName || '',
        };
        db.state.topups = [newTopup, ...(db.state.topups || [])];
        saveDB('topup-storage', db);
        return newTopup;
    },

    updateStatus: async (topupId, status, review = {}) => {
        await new Promise(resolve => setTimeout(resolve, DELAY));
        const db = getDB('topup-storage', { state: { topups: mockTopups } });
        const topupIndex = db.state.topups.findIndex(t => t.id === topupId);
        
        if (topupIndex === -1) throw new Error('Topup not found');
        
        const topup = db.state.topups[topupIndex];
        const previousStatus = topup.status;
        topup.status = status;
        topup.reviewedAt = new Date().toISOString();
        topup.adminNote = review?.adminNote || topup.adminNote || '';
        
        if (status === 'completed' || status === 'approved') {
             const currencyCode = String(review?.currencyCode || topup.currencyCode || 'USD').toUpperCase();
             const requested = Number(topup.requestedAmount ?? topup.requestedCoins ?? topup.amount ?? 0);
             const actual = Number(review?.actualPaidAmount ?? topup.actualPaidAmount ?? requested);

             topup.currencyCode = currencyCode;
             topup.actualPaidAmount = actual;

             const systemDb = getDB('system-storage', { state: { currencies: mockCurrencies } });
             const currencies = systemDb?.state?.currencies || mockCurrencies;
             const matchedCurrency = currencies.find((item) => String(item.code || '').toUpperCase() === currencyCode);
             const rate = Number(matchedCurrency?.rate || 1);
             const creditedCoins = Number((actual / (rate > 0 ? rate : 1)).toFixed(2));
             topup.creditedCoins = creditedCoins;

             // Add balance only once when entering approved/completed state.
             const wasApproved = previousStatus === 'approved' || previousStatus === 'completed';
             if (!wasApproved) {
               const userDB = getDB('admin-storage', { state: { users: mockUsers } });
               const user = userDB.state.users.find(u => u.id === topup.userId);
               if (user) {
                 user.coins = Number((Number(user.coins || 0) + creditedCoins).toFixed(2));
                 saveDB('admin-storage', userDB);
               }
             }
        }

        if (status === 'rejected' || status === 'denied') {
          topup.rejectedAt = new Date().toISOString();
        }
        
        db.state.topups[topupIndex] = topup;
        saveDB('topup-storage', db);
        return topup;
    },

    updateRequest: async (topupId, updates = {}) => {
        await new Promise(resolve => setTimeout(resolve, DELAY));
        const db = getDB('topup-storage', { state: { topups: mockTopups } });
        const topupIndex = db.state.topups.findIndex(t => t.id === topupId);

        if (topupIndex === -1) throw new Error('Topup not found');

        const topup = db.state.topups[topupIndex];
        const isPendingLike = topup.status === 'pending' || topup.status === 'requested';
        if (!isPendingLike) {
          throw new Error('Only pending requests can be edited');
        }

        const nextRequestedAmount = Number(
          updates?.requestedAmount ?? updates?.requestedCoins ?? updates?.amount ?? topup.requestedAmount ?? topup.requestedCoins ?? topup.amount ?? 0
        );

        if (!Number.isFinite(nextRequestedAmount) || nextRequestedAmount <= 0) {
          throw new Error('Requested amount must be a positive number');
        }

        topup.requestedAmount = nextRequestedAmount;
        topup.requestedCoins = nextRequestedAmount;
        topup.amount = nextRequestedAmount;
        topup.editedAt = new Date().toISOString();
        topup.adminNote = String(updates?.adminNote || topup.adminNote || '').trim();

        db.state.topups[topupIndex] = topup;
        saveDB('topup-storage', db);
        return topup;
    }
  },

  // --- System ---
  system: {
      currencies: async () => {
          await new Promise(resolve => setTimeout(resolve, DELAY));
          const db = getDB('system-storage', { state: { currencies: mockCurrencies } });
          const items = db.state.currencies || mockCurrencies;
          return [...items];
      },

      addCurrency: async (currencyData, actorContext) => {
          await new Promise(resolve => setTimeout(resolve, DELAY));
          const actor = resolveActor(actorContext);
          ensureAdmin(actor);

          const db = getDB('system-storage', { state: { currencies: mockCurrencies } });
          const currencies = db.state.currencies || mockCurrencies;
          const code = String(currencyData?.code || '').trim().toUpperCase();
          const name = String(currencyData?.name || '').trim();
          const symbol = String(currencyData?.symbol || '').trim();
          const rate = Number(currencyData?.rate);

          if (!code || !name || !symbol || Number.isNaN(rate) || rate <= 0) {
            throw new Error('Invalid currency payload');
          }

          if (currencies.some((item) => String(item.code || '').toUpperCase() === code)) {
            throw new Error('Currency code already exists');
          }

          const newCurrency = { code, name, symbol, rate };
          db.state.currencies = [...currencies, newCurrency];
          saveDB('system-storage', db);
          return newCurrency;
      },

      updateCurrency: async (code, updates, actorContext) => {
          await new Promise(resolve => setTimeout(resolve, DELAY));
          const actor = resolveActor(actorContext);
          ensureAdmin(actor);

          const db = getDB('system-storage', { state: { currencies: mockCurrencies } });
          const currencies = db.state.currencies || mockCurrencies;
          const normalizedCode = String(code || '').trim().toUpperCase();
          const index = currencies.findIndex((item) => String(item.code || '').toUpperCase() === normalizedCode);
          if (index === -1) throw new Error('Currency not found');

          const nextRate = updates?.rate !== undefined ? Number(updates.rate) : currencies[index].rate;
          if (Number.isNaN(nextRate) || nextRate <= 0) {
            throw new Error('Rate must be a positive number');
          }

          const updated = {
            ...currencies[index],
            name: updates?.name ? String(updates.name).trim() : currencies[index].name,
            symbol: updates?.symbol ? String(updates.symbol).trim() : currencies[index].symbol,
            rate: nextRate,
          };
          currencies[index] = updated;

          db.state.currencies = [...currencies];
          saveDB('system-storage', db);
          return updated;
      },

      deleteCurrency: async (code, actorContext) => {
          await new Promise(resolve => setTimeout(resolve, DELAY));
          const actor = resolveActor(actorContext);
          ensureAdmin(actor);

          const normalizedCode = String(code || '').trim().toUpperCase();
          if (normalizedCode === 'USD') {
            throw new Error('USD cannot be deleted');
          }

          const db = getDB('system-storage', { state: { currencies: mockCurrencies } });
          const currencies = db.state.currencies || mockCurrencies;
          db.state.currencies = currencies.filter((item) => String(item.code || '').toUpperCase() !== normalizedCode);
          saveDB('system-storage', db);
          return { success: true };
      },

      paymentSettings: async () => {
          await new Promise(resolve => setTimeout(resolve, DELAY));
          const db = getDB('system-storage', { state: { paymentSettings: defaultPaymentSettings } });
          const paymentSettings = db?.state?.paymentSettings || defaultPaymentSettings;
          const countryAccounts = Array.isArray(paymentSettings?.countryAccounts)
            ? paymentSettings.countryAccounts
            : [];
          const paymentGroups = normalizePaymentGroups(paymentSettings?.paymentGroups);
          return {
            ...defaultPaymentSettings,
            ...paymentSettings,
            countryAccounts,
            paymentGroups,
            whatsappNumber: paymentSettings?.whatsappNumber || getDefaultWhatsAppNumber(),
          };
      },

      updatePaymentSettings: async (settings, actorContext) => {
          await new Promise(resolve => setTimeout(resolve, DELAY));
          const actor = resolveActor(actorContext);
          ensureAdmin(actor);

          const db = getDB('system-storage', { state: { paymentSettings: defaultPaymentSettings } });
          const current = db?.state?.paymentSettings || defaultPaymentSettings;
          const currentAccounts = Array.isArray(current?.countryAccounts) ? current.countryAccounts : [];
          const incomingAccounts = Array.isArray(settings?.countryAccounts) ? settings.countryAccounts : currentAccounts;
          const currentGroups = normalizePaymentGroups(current?.paymentGroups);
          const incomingGroups = Array.isArray(settings?.paymentGroups) ? settings.paymentGroups : currentGroups;
          const normalizedAccounts = incomingAccounts
            .map((item) => ({
              countryCode: String(item?.countryCode || '').trim().toUpperCase(),
              countryName: String(item?.countryName || '').trim(),
              currencyCode: String(item?.currencyCode || '').trim().toUpperCase(),
              cashWalletNumber: String(item?.cashWalletNumber || '').trim(),
              bankAccountNumber: String(item?.bankAccountNumber || '').trim(),
              bankAccountName: String(item?.bankAccountName || '').trim(),
            }))
            .filter((item) => item.countryCode);
          const normalizedGroups = normalizePaymentGroups(incomingGroups);

          const next = {
            ...current,
            countryAccounts: normalizedAccounts,
            instructions: String(settings?.instructions ?? current?.instructions ?? '').trim(),
            whatsappNumber: normalizeWhatsAppNumber(
              settings?.whatsappNumber ?? current?.whatsappNumber ?? getDefaultWhatsAppNumber()
            ),
            paymentGroups: normalizedGroups,
          };

          db.state.paymentSettings = next;
          saveDB('system-storage', db);
          return next;
      }
  },

  audit: {
    list: async () => {
      await new Promise(resolve => setTimeout(resolve, DELAY));
      const db = getAuditDb();
      return db.state.logs || [];
    }
  }
};

export default mockApi;
