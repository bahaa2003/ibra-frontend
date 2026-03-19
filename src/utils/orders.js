import { formatDateTime, formatNumber } from './intl';
import { formatCurrencyAmount } from './pricing';

const ORDER_STATUS_META = {
  completed: {
    variant: 'success',
    labelAr: 'مكتمل',
    labelEn: 'Completed',
    dotClassName: 'bg-[var(--color-success)]',
  },
  processing: {
    variant: 'warning',
    labelAr: 'قيد التنفيذ',
    labelEn: 'In progress',
    dotClassName: 'bg-[var(--color-warning)]',
  },
  incomplete: {
    variant: 'danger',
    labelAr: 'غير مكتمل',
    labelEn: 'Incomplete',
    dotClassName: 'bg-[var(--color-error)]',
  },
};

const ORDER_TYPE_META = {
  auto: {
    variant: 'info',
    labelAr: 'أوتوماتيكي',
    labelEn: 'Automatic',
  },
  manual: {
    variant: 'secondary',
    labelAr: 'يدوي',
    labelEn: 'Manual',
  },
};

const VISUAL_STATUS_ALIASES = {
  approved: 'completed',
  completed: 'completed',
  delivered: 'completed',
  success: 'completed',
  pending: 'processing',
  requested: 'processing',
  queued: 'processing',
  processing: 'processing',
  retry: 'processing',
  under_review: 'processing',
  canceled: 'incomplete',
  cancelled: 'incomplete',
  denied: 'incomplete',
  failed: 'incomplete',
  refunded: 'incomplete',
  rejected: 'incomplete',
};

const EXCLUDED_DYNAMIC_FIELDS = new Set([
  'externalproductid',
  'orderreference',
  'qty',
  'quantity',
  'service',
]);

const asNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toLower = (value) => String(value || '').trim().toLowerCase();

export const humanizeOrderToken = (value) => String(value || '')
  .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  .replace(/[_-]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

const buildFallbackAvatar = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=efe7d4&color=8a6a11`;

const getDateFilterThreshold = (dateFilter) => {
  const now = new Date();

  if (dateFilter === 'today') {
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    return startOfDay;
  }

  if (dateFilter === '7d') {
    const threshold = new Date(now);
    threshold.setDate(now.getDate() - 7);
    return threshold;
  }

  if (dateFilter === '30d') {
    const threshold = new Date(now);
    threshold.setDate(now.getDate() - 30);
    return threshold;
  }

  return null;
};

export const createOrderStatusOptions = (language = 'ar') => ([
  { value: 'all', label: language === 'ar' ? 'كل الحالات' : 'All statuses' },
  { value: 'completed', label: language === 'ar' ? 'مكتمل' : 'Completed' },
  { value: 'incomplete', label: language === 'ar' ? 'غير مكتمل' : 'Incomplete' },
  { value: 'processing', label: language === 'ar' ? 'قيد التنفيذ' : 'In progress' },
]);

export const createOrderTypeOptions = (language = 'ar') => ([
  { value: 'all', label: language === 'ar' ? 'كل الأنواع' : 'All types' },
  { value: 'auto', label: language === 'ar' ? 'أوتوماتيكي' : 'Automatic' },
  { value: 'manual', label: language === 'ar' ? 'يدوي' : 'Manual' },
]);

export const createOrderDateOptions = (language = 'ar') => ([
  { value: 'all', label: language === 'ar' ? 'كل الفترات' : 'All time' },
  { value: 'today', label: language === 'ar' ? 'اليوم' : 'Today' },
  { value: '7d', label: language === 'ar' ? 'آخر 7 أيام' : 'Last 7 days' },
  { value: '30d', label: language === 'ar' ? 'آخر 30 يوم' : 'Last 30 days' },
]);

export const createOrderSortOptions = (language = 'ar') => ([
  { value: 'newest', label: language === 'ar' ? 'الأحدث أولاً' : 'Newest first' },
  { value: 'oldest', label: language === 'ar' ? 'الأقدم أولاً' : 'Oldest first' },
]);

export const getVisualOrderStatus = (status) => {
  const normalized = toLower(status);
  return VISUAL_STATUS_ALIASES[normalized] || 'processing';
};

export const getOrderStatusMeta = (status, language = 'ar') => {
  const key = getVisualOrderStatus(status);
  const meta = ORDER_STATUS_META[key] || ORDER_STATUS_META.processing;

  return {
    key,
    variant: meta.variant,
    label: language === 'ar' ? meta.labelAr : meta.labelEn,
    dotClassName: meta.dotClassName,
  };
};

export const getOrderType = (order = {}) => {
  const mode = toLower(order?.fulfillmentMode || order?.executionType);

  if (mode === 'auto' || mode === 'automatic') {
    return 'auto';
  }

  if (mode === 'manual') {
    return 'manual';
  }

  return order?.supplierId ? 'auto' : 'manual';
};

export const getOrderTypeMeta = (order, language = 'ar') => {
  const key = getOrderType(order);
  const meta = ORDER_TYPE_META[key] || ORDER_TYPE_META.manual;

  return {
    key,
    variant: meta.variant,
    label: language === 'ar' ? meta.labelAr : meta.labelEn,
  };
};

export const getOrderAmountValue = (order = {}) => {
  const snapshotAmount = order?.financialSnapshot?.finalAmountAtExecution;
  const directAmount = order?.totalAmount ?? order?.priceCoins;
  const unitBasedAmount = asNumber(order?.unitPrice || order?.unitPriceBase) * asNumber(order?.quantity || 1);
  return asNumber(snapshotAmount ?? directAmount ?? unitBasedAmount);
};

export const getOrderCurrencyCode = (order = {}) => String(
  order?.currencyCode
    || order?.financialSnapshot?.pricingSnapshot?.currency
    || order?.financialSnapshot?.originalCurrency
    || 'USD'
).toUpperCase();

export const formatOrderMoney = (order, currencies = [], locale = 'ar-EG') => {
  const amount = getOrderAmountValue(order);
  const currencyCode = getOrderCurrencyCode(order);

  try {
    return formatCurrencyAmount(amount, currencyCode, currencies, locale);
  } catch (_error) {
    return `${formatNumber(amount, locale, { maximumFractionDigits: amount % 1 === 0 ? 0 : 2 })} ${currencyCode}`;
  }
};

export const formatOrderDateTime = (value, locale = 'ar-EG') => formatDateTime(value, locale, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export const getOrderDynamicFields = (order = {}) => {
  const candidates = [
    order?.orderFieldsValues,
    order?.orderFields,
    order?.supplierRequestSnapshot,
  ];

  const source = candidates.find((item) => item && typeof item === 'object' && !Array.isArray(item)) || {};

  return Object.entries(source)
    .filter(([key, value]) => {
      const normalizedKey = toLower(key).replace(/\s+/g, '');
      return (
        normalizedKey
        && !EXCLUDED_DYNAMIC_FIELDS.has(normalizedKey)
        && value !== undefined
        && value !== null
        && String(value).trim() !== ''
      );
    })
    .map(([key, value]) => ({
      key,
      label: humanizeOrderToken(key),
      value: String(value),
    }));
};

export const canSyncSupplierOrder = (order = {}) => Boolean(order?.supplierId && order?.externalOrderId);

export const isManualActionableOrder = (order = {}) => {
  const type = getOrderType(order);
  const statusKey = getVisualOrderStatus(order?.status);

  return type === 'manual' && !order?.supplierId && !['completed', 'incomplete'].includes(statusKey);
};

export const getManualOrderPrimaryAction = (order, language = 'ar') => {
  const statusKey = getVisualOrderStatus(order?.status);

  if (statusKey === 'processing') {
    return {
      label: language === 'ar' ? 'تأكيد الإكمال' : 'Mark completed',
      nextStatus: 'completed',
    };
  }

  return {
    label: language === 'ar' ? 'قبول الطلب' : 'Accept order',
    nextStatus: 'processing',
  };
};

export const enrichOrders = (orders, { users = [], products = [], language = 'ar' } = {}) => {
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  const userMap = new Map((Array.isArray(users) ? users : []).map((user) => [String(user?.id || ''), user]));
  const productMap = new Map((Array.isArray(products) ? products : []).map((product) => [String(product?.id || ''), product]));

  return (Array.isArray(orders) ? orders : []).map((order) => {
    const linkedUser = userMap.get(String(order?.userId || '')) || null;
    const linkedProduct = productMap.get(String(order?.productId || '')) || null;
    const hydratedOrder = {
      ...order,
      supplierId: order?.supplierId || linkedProduct?.supplierId || '',
      fulfillmentMode: order?.fulfillmentMode
        || (linkedProduct?.autoFulfillmentEnabled === false ? 'manual' : order?.fulfillmentMode)
        || '',
    };
    const statusMeta = getOrderStatusMeta(hydratedOrder?.status, language);
    const typeMeta = getOrderTypeMeta(hydratedOrder, language);
    const orderNumber = String(order?.id || order?.orderNumber || '').trim();
    const customerName = order?.userName
      || linkedUser?.name
      || (language === 'ar' ? 'عميل غير معروف' : 'Unknown customer');
    const customerEmail = order?.userEmail || linkedUser?.email || '';
    const productName = (
      language === 'ar'
        ? order?.productNameAr || linkedProduct?.nameAr || order?.productName || linkedProduct?.name
        : order?.productName || linkedProduct?.name || order?.productNameAr || linkedProduct?.nameAr
    ) || (language === 'ar' ? 'منتج غير معروف' : 'Unknown product');
    const createdAt = order?.createdAt || order?.date || order?.updatedAt || '';
    const amountValue = getOrderAmountValue(order);
    const currencyCode = getOrderCurrencyCode(order);
    const dynamicFields = getOrderDynamicFields(order);
    const notes = String(order?.notes || order?.adminNote || order?.providerReferenceMessage || '').trim();
    const supplierName = order?.supplierName || '';

    return {
      ...hydratedOrder,
      orderNumber,
      customerName,
      customerEmail,
      customerAvatar: order?.customerAvatar || linkedUser?.avatar || buildFallbackAvatar(customerName),
      productName,
      productImage: order?.productImage || linkedProduct?.image || '',
      productRecord: linkedProduct,
      userRecord: linkedUser,
      statusKey: statusMeta.key,
      statusLabel: statusMeta.label,
      statusVariant: statusMeta.variant,
      typeKey: typeMeta.key,
      typeLabel: typeMeta.label,
      typeVariant: typeMeta.variant,
      createdAt,
      amountValue,
      amountLabel: formatOrderMoney(order, [], locale),
      currencyCode,
      notes,
      supplierName,
      dynamicFields,
      canSync: canSyncSupplierOrder(hydratedOrder),
      manualActionable: isManualActionableOrder(hydratedOrder),
      rawStatusLabel: humanizeOrderToken(order?.status || ''),
      searchIndex: toLower([
        orderNumber,
        productName,
        order?.productName,
        order?.productNameAr,
        customerName,
        customerEmail,
        supplierName,
        notes,
        ...dynamicFields.flatMap((field) => [field.label, field.value]),
      ].join(' ')),
    };
  });
};

export const filterOrders = (orders, {
  searchTerm = '',
  statusFilter = 'all',
  typeFilter = 'all',
  dateFilter = 'all',
  sortOrder = 'newest',
} = {}) => {
  const normalizedSearchTerm = toLower(searchTerm);
  const threshold = getDateFilterThreshold(dateFilter);

  return [...(Array.isArray(orders) ? orders : [])]
    .filter((order) => {
      if (normalizedSearchTerm && !String(order?.searchIndex || '').includes(normalizedSearchTerm)) {
        return false;
      }

      if (statusFilter !== 'all' && order?.statusKey !== statusFilter) {
        return false;
      }

      if (typeFilter !== 'all' && order?.typeKey !== typeFilter) {
        return false;
      }

      if (threshold) {
        const orderDate = new Date(order?.createdAt || 0);
        if (Number.isNaN(orderDate.getTime()) || orderDate < threshold) {
          return false;
        }
      }

      return true;
    })
    .sort((left, right) => {
      const leftDate = new Date(left?.createdAt || 0).getTime();
      const rightDate = new Date(right?.createdAt || 0).getTime();

      if (sortOrder === 'oldest') {
        return leftDate - rightDate;
      }

      return rightDate - leftDate;
    });
};

export const summarizeOrders = (orders = []) => ({
  total: orders.length,
  completed: orders.filter((order) => order?.statusKey === 'completed').length,
  processing: orders.filter((order) => order?.statusKey === 'processing').length,
  incomplete: orders.filter((order) => order?.statusKey === 'incomplete').length,
  manualPending: orders.filter((order) => order?.manualActionable).length,
});
