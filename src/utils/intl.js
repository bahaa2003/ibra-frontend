const EASTERN_ARABIC_DIGITS = {
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
};

const PERSIAN_DIGITS = {
  '۰': '0',
  '۱': '1',
  '۲': '2',
  '۳': '3',
  '۴': '4',
  '۵': '5',
  '۶': '6',
  '۷': '7',
  '۸': '8',
  '۹': '9',
};

const normalizeLocaleInput = (locale = 'en-US') => String(locale || 'en-US').toLowerCase();

const asFiniteNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const asValidDate = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatGroupedNumberString = (value) => {
  const rawValue = String(value ?? '').trim();
  if (!rawValue) return '';

  const sign = rawValue.startsWith('-') ? '-' : '';
  const unsignedValue = sign ? rawValue.slice(1) : rawValue;
  const [integerPart = '0', fractionPart = ''] = unsignedValue.split(/[.,]/);
  const groupedInteger = String(integerPart || '0').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return fractionPart ? `${sign}${groupedInteger},${fractionPart}` : `${sign}${groupedInteger}`;
};

export const toEnglishDigits = (value) => String(value ?? '')
  .replace(/[٠-٩]/g, (digit) => EASTERN_ARABIC_DIGITS[digit] || digit)
  .replace(/[۰-۹]/g, (digit) => PERSIAN_DIGITS[digit] || digit);

export const getNumericLocale = (locale = 'en-US') => (
  normalizeLocaleInput(locale).startsWith('ar') ? 'ar-EG-u-nu-latn' : 'en-US-u-nu-latn'
);

const formatNumberPartsWithDotGrouping = (parts = []) => {
  let output = '';
  let numericBuffer = '';

  const flushNumber = () => {
    if (!numericBuffer) return;
    output += formatGroupedNumberString(numericBuffer);
    numericBuffer = '';
  };

  parts.forEach((part) => {
    if (part.type === 'integer' || part.type === 'fraction' || part.type === 'minusSign') {
      numericBuffer += toEnglishDigits(part.value);
      return;
    }

    if (part.type === 'decimal') {
      numericBuffer += '.';
      return;
    }

    if (part.type === 'group') {
      return;
    }

    flushNumber();
    output += toEnglishDigits(part.value);
  });

  flushNumber();
  return output;
};

export const formatNumber = (value, locale = 'en-US', options = {}) => {
  const formatter = new Intl.NumberFormat(getNumericLocale(locale), {
    numberingSystem: 'latn',
    useGrouping: true,
    ...options,
  });

  return formatNumberPartsWithDotGrouping(formatter.formatToParts(asFiniteNumber(value)));
};

export const formatCurrencyNumber = (value, currencyCode = 'USD', locale = 'en-US', options = {}) => {
  const currency = String(currencyCode || 'USD').toUpperCase();

  try {
    const formatter = new Intl.NumberFormat(getNumericLocale(locale), {
      style: 'currency',
      currency,
      numberingSystem: 'latn',
      useGrouping: true,
      ...options,
    });

    return formatNumberPartsWithDotGrouping(formatter.formatToParts(asFiniteNumber(value)));
  } catch (_error) {
    return `${formatNumber(value, locale, options)} ${currency}`;
  }
};

export const formatDate = (value, locale = 'en-US', options = {}) => {
  const date = asValidDate(value);
  if (!date) return '';

  return toEnglishDigits(
    new Intl.DateTimeFormat(getNumericLocale(locale), {
      numberingSystem: 'latn',
      ...options,
    }).format(date)
  );
};

export const formatDateTime = (value, locale = 'en-US', options = {}) => formatDate(value, locale, options);

export const formatTime = (value, locale = 'en-US', options = {}) => {
  const date = asValidDate(value);
  if (!date) return '';

  return toEnglishDigits(
    new Intl.DateTimeFormat(getNumericLocale(locale), {
      numberingSystem: 'latn',
      hour: 'numeric',
      minute: '2-digit',
      ...options,
    }).format(date)
  );
};
