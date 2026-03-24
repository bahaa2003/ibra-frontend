import { formatNumber } from './intl';
import { getMoneyFormatOptions, normalizeMoneyAmount } from './money';
import useGroupStore from '../store/useGroupStore';

export const GROUP_MARKUPS = {
  Normal: 0.05, // 5% markup
  VIP: 0.02,    // 2% markup
  Reseller: 0,  // 0% markup
};

const toFinitePrice = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const calculateProductPrice = (product, userGroup = 'Normal', userGroupPercentage = null) => {
  let basePrice = Number(product.basePriceCoins ?? product.basePrice ?? 0);
  const serverMarkedUpUsd = toFinitePrice(product?.markedUpPriceUSD ?? product?.finalPrice);

  if (product.adminOverridePriceCoins !== null && product.adminOverridePriceCoins !== undefined) {
    basePrice = Number(product.adminOverridePriceCoins);
  }

  if (!Number.isFinite(basePrice) || basePrice <= 0) {
    if (serverMarkedUpUsd !== null) {
      return normalizeMoneyAmount(serverMarkedUpUsd);
    }
    basePrice = 0;
  }

  // 2. Apply group markup dynamically from the group store if available
  let markup = 0;

  if (userGroupPercentage !== null && userGroupPercentage !== undefined && Number.isFinite(Number(userGroupPercentage))) {
    markup = Number(userGroupPercentage) / 100;
  } else {
    const state = useGroupStore.getState();
    const groups = state.groups || [];

    // Find the exact group by name or id
    const dynamicGroup = groups.find((g) =>
      String(g.name).toLowerCase() === String(userGroup).toLowerCase() ||
      String(g.id) === String(userGroup)
    );

    if (dynamicGroup) {
      // In our logic, percentage could simply be '5' meaning 5%
      markup = (Number(dynamicGroup.percentage ?? dynamicGroup.discount ?? 0)) / 100;
    } else if (GROUP_MARKUPS[userGroup] !== undefined) {
      // Fallback to hardcoded markups if dynamic group not found
      markup = GROUP_MARKUPS[userGroup];
    }
  }

  const finalPrice = normalizeMoneyAmount(basePrice * (1 + markup));

  return finalPrice;
};

export const resolveProductUnitPrice = (
  product,
  currencyCode = 'USD',
  currencies = [],
  userGroup = 'Normal',
  userGroupPercentage = null
) => {
  const directDisplayPrice = toFinitePrice(product?.displayPrice);
  const normalizedCurrencyCode = String(currencyCode || 'USD').toUpperCase();

  const unitPriceBase = calculateProductPrice(product, userGroup, userGroupPercentage);
  const locallyComputedPrice = convertPriceByCurrency(unitPriceBase, normalizedCurrencyCode, currencies);

  if (Number.isFinite(locallyComputedPrice) && locallyComputedPrice > 0) {
    return locallyComputedPrice;
  }

  if (directDisplayPrice !== null) {
    return normalizeMoneyAmount(directDisplayPrice);
  }

  return 0;
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
  return normalizeMoneyAmount(amount * meta.rate);
};

export const formatCurrencyAmount = (amount, currencyCode = 'USD', currencies = [], locale = 'ar-EG', formatOptions = {}) => {
  const meta = getCurrencyMeta(currencyCode, currencies);
  const value = Number(amount || 0);
  const formatted = formatNumber(value, locale, getMoneyFormatOptions(value, formatOptions));

  return `${formatted} ${meta.symbol}`;
};
