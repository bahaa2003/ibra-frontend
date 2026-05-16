import apiClient from './client';

export const accountSecurityEndpoints = {
  sendCode: '/auth/2fa/generate',
  verifyCode: '/auth/2fa/enable',
  disableTwoFactor: '/auth/2fa/disable',
  securityStatus: '/users/me',
};

const createApiError = (code, message) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

const maskEmail = (email) => {
  const value = String(email || '').trim();
  const [name, domain] = value.split('@');
  if (!name || !domain) return value;
  if (name.length <= 2) return `${name[0] || '*'}***@${domain}`;
  return `${name.slice(0, 2)}***@${domain}`;
};

const normalizeCode = (value) => String(value || '').replace(/\D/g, '').slice(0, 6);

const readPersistedAuthUser = () => {
  if (typeof localStorage === 'undefined') return null;

  try {
    const raw = localStorage.getItem('auth-storage');
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.state?.user || null;
  } catch {
    return null;
  }
};

const getTwoFactorEnabled = (user) => Boolean(user?.isTwoFactorEnabled ?? user?.twoFactorEnabled);

const accountSecurityApi = {
  async getSecurityStatus(userId) {
    if (!userId) throw createApiError('INVALID_USER', 'Missing user identifier');

    const user = readPersistedAuthUser();
    return {
      twoFactorEnabled: getTwoFactorEnabled(user),
      emailVerified: Boolean(user?.verified ?? true),
    };
  },

  async sendEmailCode({ userId, email }) {
    if (!userId) throw createApiError('INVALID_USER', 'Missing user identifier');
    if (!email || !String(email).includes('@')) {
      throw createApiError('INVALID_EMAIL', 'A valid email is required to send OTP');
    }

    const response = await apiClient.auth.generate2FA();
    const requestId = response?.requestId || response?.tempToken || '';

    return {
      requestId,
      expiresIn: Number(response?.expiresIn || response?.expiresInSeconds || 600),
      maskedEmail: response?.maskedEmail || maskEmail(response?.email || email),
    };
  },

  async verifyEmailCode({ userId, requestId, code }) {
    if (!userId) throw createApiError('INVALID_USER', 'Missing user identifier');

    const otp = normalizeCode(code);
    if (otp.length !== 6) {
      throw createApiError('OTP_INVALID', 'Verification code must be 6 digits');
    }

    const response = await apiClient.auth.enable2FA({ requestId, otp });
    return {
      ...response,
      twoFactorEnabled: true,
    };
  },

  async disableTwoFactor({ userId, currentPassword }) {
    if (!userId) throw createApiError('INVALID_USER', 'Missing user identifier');
    if (!String(currentPassword || '').trim()) {
      throw createApiError('PASSWORD_REQUIRED', 'Current password is required');
    }

    const response = await apiClient.auth.disable2FA({ currentPassword });
    return {
      ...response,
      twoFactorEnabled: false,
    };
  },

  async regenerateApiToken({ userId }) {
    if (!userId) throw createApiError('INVALID_USER', 'Missing user identifier');
    if (!apiClient.users?.regenerateApiToken) {
      throw createApiError('API_TOKEN_UNAVAILABLE', 'API token regeneration is not available');
    }

    return apiClient.users.regenerateApiToken(userId, readPersistedAuthUser());
  },
};

export default accountSecurityApi;
