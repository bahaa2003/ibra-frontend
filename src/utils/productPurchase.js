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

export const resolveProductOrderFields = (product, language = 'ar') => {
  if (Array.isArray(product?.orderFields) && product.orderFields.length > 0) {
    return product.orderFields.map((field, index) => {
      const key = String(field?.name || field?.key || field?.id || `orderField_${index}`);
      const localizedLabel = language === 'ar'
        ? field?.labelAr || field?.placeholderAr
        : field?.label || field?.placeholder;

      return {
        key,
        label: localizedLabel || field?.label || field?.placeholder || key,
        placeholder: (language === 'ar' ? field?.placeholderAr : field?.placeholder) || field?.placeholder || '',
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
      }));
    }
  }

  return [{
    key: 'playerId',
    label: FIELD_COPY.playerId[language] || FIELD_COPY.playerId.en,
    placeholder: '',
  }];
};
