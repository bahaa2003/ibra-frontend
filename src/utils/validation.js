
export const validateUsername = (username) => {
  if (!username) return 'اسم المستخدم مطلوب';
  if (username.length < 3) return 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'اسم المستخدم يجب أن يحتوي على أحرف أو أرقام أو شرطة سفلية فقط';
  return null;
};

export const validateEmail = (email) => {
  if (!email) return 'البريد الإلكتروني مطلوب';
  // Simple regex for email validation
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'البريد الإلكتروني غير صالح';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'كلمة المرور مطلوبة';
  if (password.length < 8) return 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
  if (!/[A-Z]/.test(password)) return 'كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل';
  if (!/[a-z]/.test(password)) return 'كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل';
  if (!/[0-9]/.test(password)) return 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل';
  return null;
};

export const validateFullName = (name) => {
  const value = String(name || '').trim();
  if (!value) return 'الاسم الكامل مطلوب';
  if (value.length < 3) return 'الاسم الكامل يجب أن يكون 3 أحرف على الأقل';
  if (!/^[A-Za-z\u0600-\u06FF]/.test(value)) {
    return 'الاسم الكامل يجب أن يبدأ بحرف';
  }
  return null;
};

export const validateMobilePhone = (phone, phoneCode = '') => {
  const code = String(phoneCode || '').trim();
  const value = String(phone || '').trim();
  if (!code) return 'مفتاح الدولة مطلوب';
  if (!value) return 'رقم الهاتف مطلوب';
  if (!/^\d+$/.test(value)) return 'رقم الهاتف يجب أن يحتوي على أرقام فقط';
  if (value.length < 6 || value.length > 14) {
    return 'رقم الهاتف يجب أن يكون بين 6 و14 رقمًا';
  }
  return null;
};

const normalizePhoneDigits = (value) => String(value || '')
  .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
  .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)));

export const validatePhone = (phone) => {
  const value = normalizePhoneDigits(phone).trim();
  if (!value) return 'Phone number is required';
  if (!/^[0-9+ ()-]+$/.test(value)) return 'Enter a valid phone number';
  const normalized = value.replace(/[\s()-]/g, '');
  if (!/^\+?\d+$/.test(normalized)) return 'Enter a valid phone number';
  const digits = normalized.startsWith('+') ? normalized.slice(1) : normalized;
  if (digits.length < 7 || digits.length > 15) return 'Phone number must contain 7 to 15 digits';
  return null;
};

export const validateGameId = (gameId) => {
  if (!gameId) return 'المعرف مطلوب';
  if (gameId.trim().length < 3) return 'المعرف قصير جدًا';
  return null;
};
