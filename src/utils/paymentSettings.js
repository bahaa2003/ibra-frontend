<<<<<<< HEAD
﻿const PAYMENT_METHOD_FIELDS = {
  mobile_wallet: ['amount'],
  bank_transfer: ['amount'],
  credit_card: ['amount', 'cardNumber', 'expiryDate', 'cvv'],
  paypal: ['amount'],
=======
const PAYMENT_METHOD_FIELDS = {
  mobile_wallet: ['amount', 'senderNumber', 'transactionId'],
  bank_transfer: ['amount', 'senderNumber', 'transactionId'],
  credit_card: ['amount', 'cardNumber', 'expiryDate', 'cvv'],
  paypal: ['amount', 'transactionId'],
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
};

const ALLOWED_METHOD_TYPES = Object.keys(PAYMENT_METHOD_FIELDS);

const slugifyToken = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const createPaymentEntityId = (prefix = 'item', value = '') => {
  const token = slugifyToken(value);
  const unique = Math.random().toString(36).slice(2, 7);
  return token ? `${prefix}-${token}-${unique}` : `${prefix}-${Date.now()}-${unique}`;
};

<<<<<<< HEAD
const normalizeFeePercent = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  const clamped = Math.min(100, Math.max(0, parsed));
  return Number(clamped.toFixed(2));
};

=======
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
export const getPaymentFieldsForType = (type = 'mobile_wallet') =>
  PAYMENT_METHOD_FIELDS[type] || PAYMENT_METHOD_FIELDS.mobile_wallet;

export const createDefaultPaymentGroups = () => [
  {
    id: 'egypt-transfer',
    name: 'تحويل مصر',
    description: 'فودافون كاش واتصالات كاش وأورنج كاش والتحويل البنكي',
    isActive: true,
    methods: [
      {
        id: 'vodafone',
        name: 'فودافون كاش',
        description: 'الدفع من خلال فودافون كاش',
        type: 'mobile_wallet',
        accountNumber: '01012345678',
<<<<<<< HEAD
        feePercent: 0,
        instructions: 'حوّل المبلغ ثم ارفع صورة الإيصال',
=======
        instructions: 'حوّل المبلغ ثم ارفع صورة الإيصال ورقم العملية.',
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
        isActive: true,
      },
      {
        id: 'etisalat',
        name: 'اتصالات كاش',
        description: 'الدفع من خلال اتصالات كاش',
        type: 'mobile_wallet',
        accountNumber: '01112345678',
<<<<<<< HEAD
        feePercent: 0,
        instructions: 'حوّل المبلغ ثم ارفع صورة الإيصال',
=======
        instructions: 'حوّل المبلغ ثم ارفع صورة الإيصال ورقم العملية.',
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
        isActive: true,
      },
      {
        id: 'orange',
        name: 'أورنج كاش',
        description: 'الدفع من خلال أورنج كاش',
        type: 'mobile_wallet',
        accountNumber: '01212345678',
<<<<<<< HEAD
        feePercent: 0,
        instructions: 'حوّل المبلغ ثم ارفع صورة الإيصال',
=======
        instructions: 'حوّل المبلغ ثم ارفع صورة الإيصال ورقم العملية.',
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
        isActive: true,
      },
      {
        id: 'bank',
        name: 'تحويل بنكي',
        description: 'الدفع من خلال التحويل البنكي',
        type: 'bank_transfer',
        accountNumber: 'EG123456789012345678901234567890',
        bankName: 'National Bank of Egypt',
<<<<<<< HEAD
        feePercent: 0,
=======
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
        instructions: 'حوّل المبلغ للحساب البنكي ثم ارفع صورة الإيصال.',
        isActive: true,
      },
    ],
  },
];

export const normalizePaymentMethod = (method = {}, index = 0) => {
  const type = ALLOWED_METHOD_TYPES.includes(method?.type) ? method.type : 'mobile_wallet';
  const name = String(method?.name || '').trim() || `Payment Method ${index + 1}`;
  const id = String(method?.id || '').trim() || createPaymentEntityId('method', name);
  const fields = Array.isArray(method?.fields) && method.fields.length
    ? method.fields.map((field) => String(field || '').trim()).filter(Boolean)
    : getPaymentFieldsForType(type);

  return {
    id,
    name,
    description: String(method?.description || '').trim(),
    type,
    accountNumber: String(method?.accountNumber || '').trim(),
    bankName: String(method?.bankName || '').trim(),
<<<<<<< HEAD
    feePercent: normalizeFeePercent(method?.feePercent),
    instructions: String(method?.instructions || '').trim(),
    image: String(method?.image || method?.imageUrl || method?.logo || '').trim(),
    imageName: String(method?.imageName || '').trim(),
=======
    instructions: String(method?.instructions || '').trim(),
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
    isActive: method?.isActive !== false,
    fields,
  };
};

export const normalizePaymentGroup = (group = {}, index = 0) => {
  const name = String(group?.name || '').trim() || `Payment Group ${index + 1}`;
  const id = String(group?.id || '').trim() || createPaymentEntityId('group', name);
  const methods = (Array.isArray(group?.methods) ? group.methods : [])
    .map((method, methodIndex) => normalizePaymentMethod(method, methodIndex))
    .filter((method) => method.name);

  return {
    id,
    name,
    description: String(group?.description || '').trim(),
    isActive: group?.isActive !== false,
    methods,
  };
};

export const normalizePaymentGroups = (groups, { fallbackToDefault = true } = {}) => {
  const source = Array.isArray(groups) ? groups : [];
  const normalized = source
    .map((group, index) => normalizePaymentGroup(group, index))
    .filter((group) => group.id && group.name);

  if (normalized.length) return normalized;
  return fallbackToDefault ? createDefaultPaymentGroups() : [];
};

export const getActivePaymentGroups = (settings) =>
  normalizePaymentGroups(settings?.paymentGroups).map((group) => ({
    ...group,
    methods: group.methods.filter((method) => method.isActive !== false),
  })).filter((group) => group.isActive !== false && group.methods.length > 0);

export const findPaymentMethodById = (settings, methodId) => {
  const targetId = String(methodId || '').trim();
  if (!targetId) return null;

  const groups = normalizePaymentGroups(settings?.paymentGroups);
  for (const group of groups) {
    if (group.isActive === false) continue;
    const method = group.methods.find((item) => item.id === targetId && item.isActive !== false);
    if (method) {
      return { group, method };
    }
  }

  return null;
};
<<<<<<< HEAD

=======
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
