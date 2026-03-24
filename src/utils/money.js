const DEFAULT_MONEY_FRACTION_DIGITS = 6;
const FRACTION_EPSILON = 1e-9;

export const toFiniteMoneyNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const normalizeMoneyAmount = (value, fractionDigits = DEFAULT_MONEY_FRACTION_DIGITS) => {
  const safeValue = toFiniteMoneyNumber(value, 0);
  return Number(safeValue.toFixed(fractionDigits));
};

const getResolvedMoneyFractionDigits = (value, maxFractionDigits = DEFAULT_MONEY_FRACTION_DIGITS) => {
  const safeValue = Math.abs(toFiniteMoneyNumber(value, 0));
  const normalized = safeValue.toFixed(maxFractionDigits).replace(/0+$/, '').replace(/\.$/, '');
  const fractionPart = normalized.split('.')[1] || '';
  return fractionPart.length;
};

export const getMoneyFormatOptions = (
  value,
  {
    compact = false,
    maximumFractionDigits,
    minimumFractionDigits,
  } = {}
) => {
  const safeValue = Math.abs(toFiniteMoneyNumber(value, 0));
  const hasFraction = Math.abs(safeValue - Math.trunc(safeValue)) > FRACTION_EPSILON;
  const actualFractionDigits = hasFraction
    ? getResolvedMoneyFractionDigits(safeValue, DEFAULT_MONEY_FRACTION_DIGITS)
    : 0;

  const resolvedMaximumFractionDigits = Number.isInteger(maximumFractionDigits)
    ? maximumFractionDigits
    : (compact ? Math.min(Math.max(actualFractionDigits, 1), 2) : actualFractionDigits);

  const resolvedMinimumFractionDigits = Number.isInteger(minimumFractionDigits)
    ? minimumFractionDigits
    : (compact ? 0 : actualFractionDigits);

  return {
    maximumFractionDigits: resolvedMaximumFractionDigits,
    minimumFractionDigits: resolvedMinimumFractionDigits,
  };
};
