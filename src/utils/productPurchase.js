const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/g;

const FIELD_COPY = {
  playerId: { ar: 'معرف المستخدم', en: 'User ID' },
  uid: { ar: 'UID', en: 'UID' },
  email: { ar: 'البريد الإلكتروني', en: 'Email' },
  phone: { ar: 'رقم الهاتف', en: 'Phone Number' },
  username: { ar: 'اسم المستخدم', en: 'Username' },
  server: { ar: 'السيرفر', en: 'Server' },
  zone: { ar: 'المنطقة', en: 'Zone' },
};

export const getProductQuantityMeta = (product) => {
  const minQty = Math.max(Number(product?.minimumOrderQty || 1), 1);
  const stepQty = Math.max(Number(product?.stepQty || 1), 1);
  const rawMaxQty = Math.max(Number(product?.maximumOrderQty || minQty), minQty);
  const maxQty = minQty + Math.floor((rawMaxQty - minQty) / stepQty) * stepQty;

  return {
    minQty,
    maxQty: Math.max(maxQty, minQty),
    stepQty,
  };
};

export const clampProductQuantity = (value, product) => {
  const { minQty, maxQty, stepQty } = getProductQuantityMeta(product);
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return minQty;
  }

  const boundedValue = Math.min(maxQty, Math.max(minQty, Math.round(numericValue)));
  const steppedValue = minQty + Math.round((boundedValue - minQty) / stepQty) * stepQty;

  return Math.min(maxQty, Math.max(minQty, steppedValue));
};

export const sanitizeOrderFieldValue = (value, maxLength = 120) => String(value || '')
  .replace(CONTROL_CHARACTERS, ' ')
  .replace(/\s+/g, ' ')
  .slice(0, maxLength);

export const DYNAMIC_FIELD_TYPES = ['text', 'number', 'select'];

export const toSnakeCase = (value = '') => {
  const ascii = String(value || '')
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();

  return ascii || 'field';
};

export const normalizeDynamicFieldOptions = (options) => {
  if (Array.isArray(options)) {
    return [...new Set(options.map((option) => String(option || '').trim()).filter(Boolean))];
  }

  return [...new Set(String(options || '')
    .split(',')
    .map((option) => option.trim())
    .filter(Boolean))];
};

export const normalizeProductDynamicFields = (fields = []) => (
  Array.isArray(fields) ? fields : []
).map((field, index) => {
  const label = String(field?.label || '').trim();
  const name = toSnakeCase(field?.name || label || `field_${index + 1}`);
  const type = DYNAMIC_FIELD_TYPES.includes(String(field?.type || '').toLowerCase())
    ? String(field.type).toLowerCase()
    : 'text';

  return {
    name,
    label: label || name,
    type,
    required: field?.required !== false,
    options: type === 'select' ? normalizeDynamicFieldOptions(field?.options) : [],
    isActive: field?.isActive !== false,
  };
}).filter((field) => field.name && field.label);

export const resolveProductDynamicFields = (product) => normalizeProductDynamicFields(product?.dynamicFields)
  .filter((field) => field.isActive !== false);

export const resolveProductOrderFields = (product, language = 'ar') => {
  if (resolveProductDynamicFields(product).length > 0) {
    return [];
  }

  if (Array.isArray(product?.orderFields) && product.orderFields.length > 0) {
    const visibleFields = product.orderFields.filter((field) => field?.visible !== false);

    if (visibleFields.length === 0) return [];

    return visibleFields.map((field, index) => {
      const key = String(field?.name || field?.key || field?.id || `orderField_${index}`);
      const localizedLabel = language === 'ar'
        ? field?.labelAr || field?.placeholderAr
        : field?.label || field?.placeholder;

      return {
        key,
        label: localizedLabel || field?.label || field?.placeholder || key,
        placeholder: (language === 'ar' ? field?.placeholderAr : field?.placeholder) || field?.placeholder || '',
        type: ['email', 'number', 'text'].includes(String(field?.type || '').toLowerCase())
          ? String(field.type).toLowerCase()
          : 'text',
      };
    });
  }

  if (Array.isArray(product?.supplierFieldMappings) && product.supplierFieldMappings.length > 0) {
    const allowedFields = product.supplierFieldMappings
      .map((mapping) => String(mapping?.internalField || '').trim())
      .filter((field) => field && field !== 'quantity' && field !== 'externalProductId');

    if (allowedFields.length > 0) {
      return allowedFields.map((field) => ({
        key: field,
        label: FIELD_COPY[field]?.[language] || field,
        placeholder: '',
        type: field === 'email' ? 'email' : 'text',
      }));
    }
  }

  return [{
    key: 'playerId',
    label: FIELD_COPY.playerId[language] || FIELD_COPY.playerId.en,
    placeholder: '',
    type: 'text',
  }];
};
