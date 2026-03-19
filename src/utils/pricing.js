import { formatNumber } from './intl';

export const GROUP_MARKUPS = {
  Normal: 0.05, // 5% markup
  VIP: 0.02,    // 2% markup
  Reseller: 0,  // 0% markup
};

export const calculateProductPrice = (product, userGroup = 'Normal') => {
  // 1. Check for admin override
  let basePrice = product.basePriceCoins;
  
  if (product.adminOverridePriceCoins !== null && product.adminOverridePriceCoins !== undefined) {
    basePrice = product.adminOverridePriceCoins;
  }

  // 2. Apply group markup
  const markup = GROUP_MARKUPS[userGroup] || 0;
  const finalPrice = Math.ceil(basePrice * (1 + markup));

  return finalPrice;
};

export const getCurrencyMeta = (currencyCode = 'USD', currencies = []) => {
  const normalizedCode = String(currencyCode || 'USD').toUpperCase();
  const found = (currencies || []).find(
    (item) => String(item?.code || '').toUpperCase() === normalizedCode
  );

  if (found) {
    return {
      code: normalizedCode,
      rate: Number(found.rate || 1) || 1,
      symbol: String(found.symbol || normalizedCode)
    };
  }

  return {
    code: normalizedCode,
    rate: 1,
    symbol: normalizedCode === 'USD' ? '$' : normalizedCode
  };
};

export const convertPriceByCurrency = (baseAmount, currencyCode = 'USD', currencies = []) => {
  const amount = Number(baseAmount || 0);
  const meta = getCurrencyMeta(currencyCode, currencies);
  return Number((amount * meta.rate).toFixed(2));
};

export const formatCurrencyAmount = (amount, currencyCode = 'USD', currencies = [], locale = 'ar-EG') => {
  const meta = getCurrencyMeta(currencyCode, currencies);
  const value = Number(amount || 0);
  const formatted = formatNumber(value, locale, {
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2
  });

  return `${formatted} ${meta.symbol}`;
};
