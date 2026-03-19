const STATUS_ALIASES = {
  active: 'approved',
  approved: 'approved',
  complete: 'approved',
  completed: 'approved',
  pending: 'pending',
  requested: 'pending',
  under_review: 'pending',
  awaiting_approval: 'pending',
  rejected: 'rejected',
  denied: 'rejected',
  blocked: 'rejected',
  inactive: 'rejected',
};

const SIGNUP_METHOD_ALIASES = {
  google: 'google',
  oauth_google: 'google',
  email: 'email',
  password: 'email',
  credentials: 'email',
  manual: 'manual',
};

export const normalizeAccountStatus = (status) => {
  const value = String(status || '').trim().toLowerCase();
  return STATUS_ALIASES[value] || value || 'pending';
};

export const isApprovedAccountStatus = (status) => normalizeAccountStatus(status) === 'approved';
export const isPendingAccountStatus = (status) => normalizeAccountStatus(status) === 'pending';
export const isRejectedAccountStatus = (status) => normalizeAccountStatus(status) === 'rejected';

export const getAccountAccessRoute = (status) => {
  if (isPendingAccountStatus(status)) return '/account-pending';
  if (isRejectedAccountStatus(status)) return '/account-rejected';
  return null;
};

export const getAccountStatusBadgeVariant = (status) => {
  const normalized = normalizeAccountStatus(status);
  if (normalized === 'approved') return 'success';
  if (normalized === 'rejected') return 'danger';
  return 'warning';
};

export const getAccountStatusLabel = (status, isArabic = true) => {
  const normalized = normalizeAccountStatus(status);
  const labels = {
    approved: { ar: 'مفعّل', en: 'Approved' },
    pending: { ar: 'بانتظار التفعيل', en: 'Pending Approval' },
    rejected: { ar: 'مرفوض', en: 'Rejected' },
  };

  return labels[normalized]?.[isArabic ? 'ar' : 'en'] || status || (isArabic ? 'غير معروف' : 'Unknown');
};

export const normalizeSignupMethod = (method) => {
  const value = String(method || '').trim().toLowerCase();
  return SIGNUP_METHOD_ALIASES[value] || (value || 'email');
};

export const getSignupMethodLabel = (method, isArabic = true) => {
  const normalized = normalizeSignupMethod(method);
  const labels = {
    google: { ar: 'Google', en: 'Google' },
    email: { ar: 'بريد إلكتروني', en: 'Email' },
    manual: { ar: 'يدوي', en: 'Manual' },
  };

  return labels[normalized]?.[isArabic ? 'ar' : 'en'] || method || (isArabic ? 'غير معروف' : 'Unknown');
};

export const getUserRegistrationDate = (user) => (
  user?.createdAt
  || user?.joinDate
  || user?.registeredAt
  || user?.updatedAt
  || null
);

export const inferBlockedStatusFromError = (error) => {
  const message = String(error?.message || error || '').toLowerCase();
  if (!message) return null;

  if (message.includes('pending') || message.includes('approval') || message.includes('await')) {
    return 'pending';
  }

  if (
    message.includes('reject')
    || message.includes('denied')
    || message.includes('access denied')
    || message.includes('blocked')
  ) {
    return 'rejected';
  }

  return null;
};
