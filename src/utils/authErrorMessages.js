import i18n from '../i18n';

const COPY = {
  loginGeneric: {
    ar: 'تعذر تسجيل الدخول الآن. يرجى المحاولة مرة أخرى.',
    en: 'Unable to sign in right now. Please try again.',
  },
  registerGeneric: {
    ar: 'تعذر إنشاء الحساب الآن. يرجى المحاولة مرة أخرى.',
    en: 'Unable to create the account right now. Please try again.',
  },
  googleGeneric: {
    ar: 'تعذر المتابعة عبر Google الآن. يرجى المحاولة مرة أخرى.',
    en: 'Unable to continue with Google right now. Please try again.',
  },
  invalidCredentials: {
    ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    en: 'Email or password is incorrect.',
  },
  accountNotFound: {
    ar: 'لا يوجد حساب مطابق لهذه البيانات.',
    en: 'No account matches these details.',
  },
  emailExists: {
    ar: 'هذا البريد الإلكتروني مستخدم بالفعل.',
    en: 'This email address is already in use.',
  },
  usernameExists: {
    ar: 'اسم المستخدم مستخدم بالفعل.',
    en: 'This username is already taken.',
  },
  invalidEmail: {
    ar: 'صيغة البريد الإلكتروني غير صحيحة.',
    en: 'The email address format is invalid.',
  },
  weakPassword: {
    ar: 'كلمة المرور لا تستوفي الشروط المطلوبة.',
    en: 'The password does not meet the required rules.',
  },
  pendingApproval: {
    ar: 'الحساب مسجل لكنه ما زال بانتظار موافقة الإدارة.',
    en: 'The account is registered but still waiting for admin approval.',
  },
  verifyEmail: {
    ar: 'يجب تأكيد البريد الإلكتروني قبل تسجيل الدخول.',
    en: 'You need to verify your email before signing in.',
  },
  accountRejected: {
    ar: 'تم تقييد هذا الحساب. يرجى التواصل مع الإدارة.',
    en: 'This account is restricted. Please contact the administrator.',
  },
  tooManyRequests: {
    ar: 'تمت عدة محاولات متتالية. انتظر قليلًا ثم أعد المحاولة.',
    en: 'Too many attempts were made. Please wait a moment and try again.',
  },
  network: {
    ar: 'تعذر الاتصال بالخادم. تحقق من الإنترنت ثم أعد المحاولة.',
    en: 'Could not reach the server. Check your connection and try again.',
  },
  server: {
    ar: 'حدث خطأ من جهة الخادم. يرجى المحاولة لاحقًا.',
    en: 'A server error occurred. Please try again later.',
  },
  emailRequired: {
    ar: 'البريد الإلكتروني مطلوب.',
    en: 'Email is required.',
  },
  passwordRequired: {
    ar: 'كلمة المرور مطلوبة.',
    en: 'Password is required.',
  },
};

const getLanguage = () => {
  const current = String(
    i18n.resolvedLanguage
      || i18n.language
      || (typeof window !== 'undefined' ? window.localStorage?.getItem('language') : '')
      || 'ar'
  ).toLowerCase();

  return current.startsWith('en') ? 'en' : 'ar';
};

const pick = (key) => COPY[key]?.[getLanguage()] || COPY.loginGeneric.ar;

const includesAny = (value, patterns) => patterns.some((pattern) => value.includes(pattern));

const cleanupMessage = (value) => String(value || '')
  .replace(/^request failed with status code \d+\s*/i, '')
  .replace(/[_-]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const looksArabic = (value) => /[\u0600-\u06FF]/.test(String(value || ''));

const withPeriod = (value) => {
  const normalized = String(value || '').trim();
  if (!normalized) return normalized;
  return /[.!?؟]$/.test(normalized) ? normalized : `${normalized}.`;
};

export const formatAuthErrorMessage = (error, { action = 'login' } = {}) => {
  const status = Number(error?.status || error?.response?.status || 0);
  const code = String(error?.code || error?.response?.data?.code || '').toLowerCase();
  const raw = String(
    error?.response?.data?.message
      || error?.response?.data?.error
      || error?.message
      || error
      || ''
  ).trim();
  const message = cleanupMessage(raw).toLowerCase();

  const genericKey = action === 'register'
    ? 'registerGeneric'
    : action === 'google'
      ? 'googleGeneric'
      : 'loginGeneric';

  if (!raw && !status && !code) return pick(genericKey);

  if (
    includesAny(message, ['network error', 'failed to fetch', 'load failed', 'timeout', 'timed out', 'socket hang up'])
    || includesAny(code, ['network_error', 'ecconnaborted', 'econnreset'])
  ) {
    return pick('network');
  }

  if (status >= 500) {
    return pick('server');
  }

  if (
    includesAny(code, ['email_exists', 'duplicate_email', 'user_exists'])
    || includesAny(message, ['email already registered', 'email already exists', 'user already exists', 'account already exists'])
  ) {
    return pick('emailExists');
  }

  if (
    includesAny(code, ['username_exists', 'duplicate_username'])
    || includesAny(message, ['username already exists', 'username already taken', 'username is taken'])
  ) {
    return pick('usernameExists');
  }

  if (includesAny(message, ['invalid email', 'email is invalid', 'must be a valid email'])) {
    return pick('invalidEmail');
  }

  if (includesAny(message, ['password must', 'password should', 'password too short', 'minimum 8', 'min 8'])) {
    return pick('weakPassword');
  }

  if (
    includesAny(message, ['verify your email', 'verify your email address', 'please verify your email', 'confirm your email', 'verification email'])
  ) {
    return pick('verifyEmail');
  }

  if (includesAny(message, ['pending approval', 'awaiting approval', 'under review', 'await admin approval'])) {
    return pick('pendingApproval');
  }

  if (includesAny(message, ['rejected', 'denied', 'access denied', 'blocked', 'disabled', 'forbidden'])) {
    return pick('accountRejected');
  }

  if (
    includesAny(message, ['invalid email or password', 'invalid credentials', 'wrong password', 'incorrect password'])
    || (status === 401 && action !== 'register')
  ) {
    return pick('invalidCredentials');
  }

  if (includesAny(message, ['user not found', 'account not found', 'no user found'])) {
    return pick('accountNotFound');
  }

  if (includesAny(message, ['too many requests', 'rate limit', 'too many attempts'])) {
    return pick('tooManyRequests');
  }

  if (message.includes('required')) {
    if (message.includes('email')) return pick('emailRequired');
    if (message.includes('password')) return pick('passwordRequired');
  }

  if (/request failed with status code \d+/i.test(raw)) {
    return pick(genericKey);
  }

  if (looksArabic(raw)) {
    return withPeriod(cleanupMessage(raw));
  }

  return getLanguage() === 'en'
    ? withPeriod(cleanupMessage(raw))
    : pick(genericKey);
};
