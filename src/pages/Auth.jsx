<<<<<<< HEAD
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Mail,
  Phone,
  User,
} from 'lucide-react';
=======
﻿import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Phone, User, Mail, ArrowRight, Lock, Eye, EyeOff } from 'lucide-react';
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
import useAuthStore from '../store/useAuthStore';
import Button, { cn } from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
<<<<<<< HEAD
import Modal from '../components/ui/Modal';
import ThemeToggle from '../components/ui/ThemeToggle';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import AuthHeroVisual from '../components/auth/AuthHeroVisual';
import AuthGoldDustBackground from '../components/auth/AuthGoldDustBackground';
import authAtmosphereConfig from '../components/auth/authAtmosphereConfig';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../components/ui/Toast';
import useSystemStore from '../store/useSystemStore';
import { useTranslation } from 'react-i18next';
import {
  validateEmail,
  validateFullName,
  validateMobilePhone,
  validatePassword,
  validateUsername,
} from '../utils/validation';
import { COUNTRY_CATALOG } from '../data/countryCatalog';
import { getDefaultRouteForRole } from '../utils/authRoles';
import { getAccountAccessRoute, normalizeAccountStatus } from '../utils/accountStatus';
import brandIconImage from '../assets/logo.png';
=======
import { useLanguage } from '../context/LanguageContext';
import { validateUsername, validateEmail, validatePassword, validateFullName, validateMobilePhone } from '../utils/validation';
import { useToast } from '../components/ui/Toast';
import ThemeToggle from '../components/ui/ThemeToggle';
import useSystemStore from '../store/useSystemStore';
import Modal from '../components/ui/Modal';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import { buildWhatsAppLink } from '../utils/whatsapp';
import { COUNTRY_CATALOG } from '../data/countryCatalog';
import { getDefaultRouteForRole } from '../utils/authRoles';
import brandIconImage from '../assets/box_.png';
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41

const GoogleMark = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.2-1.9 2.9l3.1 2.4c1.8-1.7 2.9-4.1 2.9-7 0-.7-.1-1.4-.2-2H12z" />
    <path fill="#34A853" d="M12 22c2.7 0 5-0.9 6.7-2.6l-3.1-2.4c-.9.6-2 1-3.6 1-2.7 0-5-1.8-5.8-4.3l-3.2 2.5C4.7 19.6 8 22 12 22z" />
    <path fill="#4A90E2" d="M6.2 13.7c-.2-.6-.3-1.1-.3-1.7s.1-1.2.3-1.7L3 7.8C2.4 9 2 10.4 2 12s.4 3 1 4.2l3.2-2.5z" />
    <path fill="#FBBC05" d="M12 5c1.5 0 2.9.5 4 1.6l3-3C17 1.8 14.7 1 12 1 8 1 4.7 3.4 3 7.8l3.2 2.5C7 6.8 9.3 5 12 5z" />
  </svg>
);

const Auth = () => {
  const fallbackCountries = useMemo(() => COUNTRY_CATALOG, []);
<<<<<<< HEAD
  const navigate = useNavigate();
  const location = useLocation();
  const oauthHandledRef = useRef(false);
  const reduceMotion = useReducedMotion();
  const { dir } = useLanguage();
  const { t } = useTranslation();
  const { addToast } = useToast();
  const {
    login,
    loginWithGoogle,
    signup,
    isLoading,
    error: storeError,
    isAuthenticated,
    user,
    blockedStatus,
  } = useAuthStore();
  const { currencies: systemCurrencies, loadCurrencies } = useSystemStore();

  const [isLogin, setIsLogin] = useState(true);
=======

  const navigate = useNavigate();
  const { login, loginWithGoogle, signup, isLoading, error: storeError } = useAuthStore();
  const { addToast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const { dir } = useLanguage();
  const { t } = useTranslation();
  
  // Form State
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('US');
  const [currency, setCurrency] = useState('USD');
  const [countries] = useState(COUNTRY_CATALOG);
<<<<<<< HEAD
  const [phoneCode, setPhoneCode] = useState('+1');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  const countryOptions = useMemo(() => {
    const source = countries.length ? countries : fallbackCountries;
    return [...source].sort((left, right) => (left?.name?.common || '').localeCompare(right?.name?.common || ''));
  }, [countries, fallbackCountries]);

  const selectedCountry = useMemo(
    () => countryOptions.find((item) => item.cca2 === country) || countryOptions[0],
    [country, countryOptions]
  );
=======
  const isCountriesLoading = false;
  const [phoneCode, setPhoneCode] = useState('+1');
  const [phone, setPhone] = useState('');
  const { currencies: systemCurrencies, paymentSettings, loadCurrencies, loadPaymentSettings } = useSystemStore();
  const [activationEmail, setActivationEmail] = useState('');
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const [errors, setErrors] = useState({});
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41

  const getDialCodes = (countryItem) => {
    const root = countryItem?.idd?.root || '';
    const suffixes = countryItem?.idd?.suffixes || [];
<<<<<<< HEAD
    if (!root && !suffixes.length) return [];
=======
    if (!root && suffixes.length === 0) return [];
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
    if (!suffixes.length) return [root];
    return suffixes.map((suffix) => `${root}${suffix}`);
  };

<<<<<<< HEAD
=======
  const countryOptions = useMemo(() => {
    const source = countries.length ? countries : fallbackCountries;
    return [...source].sort((a, b) => (a?.name?.common || '').localeCompare(b?.name?.common || ''));
  }, [countries, fallbackCountries]);

  const selectedCountry = useMemo(
    () => countryOptions.find((item) => item.cca2 === country) || countryOptions[0],
    [countryOptions, country]
  );

>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
  const dialCodeOptions = useMemo(() => {
    const map = new Map();
    countryOptions.forEach((countryItem) => {
      const countryName = countryItem?.name?.common || countryItem?.cca2;
      getDialCodes(countryItem).forEach((code) => {
        if (!code) return;
<<<<<<< HEAD
        map.set(`${code}-${countryItem.cca2}`, {
          code,
          label: `${code} (${countryName})`,
        });
      });
    });

    return Array.from(map.values()).sort((left, right) => left.code.localeCompare(right.code));
=======
        const key = `${code}-${countryItem.cca2}`;
        map.set(key, { code, label: `${code} (${countryName})` });
      });
    });
    return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
  }, [countryOptions]);

  const availableCurrencyOptions = useMemo(() => {
    const list = Array.isArray(systemCurrencies) ? systemCurrencies : [];
<<<<<<< HEAD
=======
    if (!list.length) return [];

>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
    const normalized = list.map((item) => ({
      code: item.code,
      label: `${item.code}${item.symbol ? ` (${item.symbol})` : ''}`,
    }));

    const usdIndex = normalized.findIndex((item) => item.code === 'USD');
    if (usdIndex > 0) {
      const [usd] = normalized.splice(usdIndex, 1);
      normalized.unshift(usd);
    }

    return normalized;
  }, [systemCurrencies]);

  useEffect(() => {
    loadCurrencies();
<<<<<<< HEAD
  }, [loadCurrencies]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reason = sessionStorage.getItem('auth:logout-reason');
    if (!reason) return;

    sessionStorage.removeItem('auth:logout-reason');
    if (reason === 'expired') {
      addToast(
        dir === 'rtl'
          ? 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى'
          : 'Session expired, please sign in again',
        'warning'
      );
    }
  }, [addToast, dir]);

  useEffect(() => {
    setCurrency((previous) => {
      if (availableCurrencyOptions.some((item) => item.code === previous)) {
        return previous;
      }

      return availableCurrencyOptions[0]?.code || '';
=======
    loadPaymentSettings();
  }, [loadCurrencies, loadPaymentSettings]);

  useEffect(() => {
    setCurrency((prev) => {
      const hasPrev = availableCurrencyOptions.some((item) => item.code === prev);
      if (hasPrev) return prev;
      const usd = availableCurrencyOptions.find((item) => item.code === 'USD');
      return usd ? usd.code : (availableCurrencyOptions[0]?.code || '');
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
    });
  }, [availableCurrencyOptions]);

  useEffect(() => {
    if (!selectedCountry) return;
    const preferredDialCode = getDialCodes(selectedCountry)[0];
    if (preferredDialCode) {
      setPhoneCode(preferredDialCode);
    }
  }, [selectedCountry]);

<<<<<<< HEAD
  useEffect(() => {
    if (location.search.includes('token=')) return;

    const normalizedStatus = normalizeAccountStatus(user?.status || blockedStatus);
    const blockedRoute = getAccountAccessRoute(normalizedStatus);

    if (blockedRoute && (isAuthenticated || blockedStatus)) {
      navigate(blockedRoute, { replace: true });
      return;
    }

    if (isAuthenticated && user) {
      navigate(getDefaultRouteForRole(user?.role), { replace: true });
    }
  }, [blockedStatus, isAuthenticated, location.search, navigate, user]);

  useEffect(() => {
    const token = new URLSearchParams(location.search).get('token');
    if (!token || oauthHandledRef.current) return;

    oauthHandledRef.current = true;

    const handleGoogleCallback = async () => {
      const result = await loginWithGoogle();

      if (result?.redirectTo) {
        if (result?.status === 'pending') {
          addToast('تم إنشاء حساب Google وهو الآن بانتظار موافقة الإدارة.', 'warning');
        } else if (result?.status === 'rejected') {
          addToast('هذا الحساب مرفوض حاليًا. يرجى التواصل مع الإدارة.', 'error');
        } else {
          addToast(
            t('auth.googleSuccess', {
              defaultValue: dir === 'rtl' ? 'تم تسجيل الدخول عبر Google' : 'Signed in with Google',
            }),
            'success'
          );
        }

        navigate(result.redirectTo, { replace: true });
        return;
      }

      oauthHandledRef.current = false;
    };

    handleGoogleCallback();
  }, [addToast, dir, location.search, loginWithGoogle, navigate, t]);

  const validateForm = () => {
    const nextErrors = {};
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError) nextErrors.email = emailError;
    if (passwordError) nextErrors.password = passwordError;

    if (!isLogin) {
      const nameError = validateFullName(name);
      const usernameError = validateUsername(username);
      const phoneError = validateMobilePhone(phone, phoneCode);

      if (nameError) nextErrors.name = nameError;
      if (usernameError) nextErrors.username = usernameError;
      if (phoneError) nextErrors.phone = phoneError;

      if (!confirmPassword) {
        nextErrors.confirmPassword = t('auth.passwordConfirmRequired');
      } else if (password !== confirmPassword) {
        nextErrors.confirmPassword = t('auth.passwordsDoNotMatch');
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const consumeAuthResult = (result, { source = 'email', mode = 'login' } = {}) => {
    if (!result) return;

    if (result.redirectTo) {
      if (result.status === 'pending') {
        addToast(
          source === 'google'
            ? 'تم إنشاء حساب Google وهو بانتظار تفعيل الإدارة.'
            : mode === 'signup'
              ? 'تم إنشاء الحساب وهو بانتظار موافقة الإدارة.'
              : 'هذا الحساب بانتظار موافقة الإدارة.',
          'warning'
        );
      } else if (result.status === 'rejected') {
        addToast('عذرًا، هذا الحساب مرفوض حاليًا. يرجى التواصل مع الإدارة.', 'error');
      } else if (result.canAccessApp && source === 'google') {
        addToast(
          t('auth.googleSuccess', {
            defaultValue: dir === 'rtl' ? 'تم تسجيل الدخول عبر Google' : 'Signed in with Google',
          }),
          'success'
        );
      }

      navigate(result.redirectTo, { replace: true });
      return;
    }

    if (result.ok && result.canAccessApp) {
      if (source === 'google') {
        addToast(
          t('auth.googleSuccess', {
            defaultValue: dir === 'rtl' ? 'تم تسجيل الدخول عبر Google' : 'Signed in with Google',
          }),
          'success'
        );
      }

      navigate(result.redirectTo || getDefaultRouteForRole(useAuthStore.getState().user?.role), { replace: true });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
=======
  const validateForm = () => {
    const newErrors = {};
    const emailErr = validateEmail(email);
    if (emailErr) newErrors.email = emailErr;

    const passErr = validatePassword(password);
    if (passErr) newErrors.password = passErr;

    if (!isLogin) {
      const nameErr = validateFullName(name);
      if (nameErr) newErrors.name = nameErr;

      const userErr = validateUsername(username);
      if (userErr) newErrors.username = userErr;

      const phoneErr = validateMobilePhone(phone, phoneCode);
      if (phoneErr) newErrors.phone = phoneErr;

      if (!confirmPassword) {
        newErrors.confirmPassword = t('auth.passwordConfirmRequired');
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = t('auth.passwordsDoNotMatch');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      addToast(t('auth.emailRequired'), 'error');
      return;
    }
    // simulate sending reset link
    addToast(t('auth.resetLinkSent'), 'success');
    setForgotModalOpen(false);
    setForgotEmail('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
    if (!validateForm()) return;

    if (!isLogin && !currency) {
      addToast(t('auth.noCurrenciesConfigured'), 'error');
      return;
    }
<<<<<<< HEAD

    const result = isLogin
      ? await login(email, password)
      : await signup({
          name,
          username,
          email,
          password,
          country,
          currency,
          signupMethod: 'email',
          phone: `${phoneCode}${phone}`,
        });

    consumeAuthResult(result, { source: 'email', mode: isLogin ? 'login' : 'signup' });
  };

  const handleGoogleAuth = async () => {
    const result = await loginWithGoogle();
    if (!result) return;
    consumeAuthResult(result, { source: 'google', mode: isLogin ? 'login' : 'signup' });
  };

  const handleForgotSubmit = (event) => {
    event.preventDefault();

    if (!forgotEmail) {
      addToast(t('auth.emailRequired'), 'error');
      return;
    }

    addToast(t('auth.resetLinkSent'), 'success');
    setForgotModalOpen(false);
    setForgotEmail('');
  };

  const toggleMode = () => {
    setIsLogin((previous) => !previous);
    setConfirmPassword('');
    setErrors({});
    useAuthStore.setState({ error: null, blockedStatus: null, blockedUser: null });
  };

  const authMode = isLogin ? 'login' : 'register';
  const authSelectClassName =
    'h-11 w-full rounded-[var(--radius-md)] border border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-card-rgb)/0.84)] px-4 text-sm text-[var(--color-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] outline-none transition-all duration-200 hover:border-[color:rgb(var(--color-primary-rgb)/0.22)] focus:border-[color:rgb(var(--color-primary-rgb)/0.42)] focus:bg-[color:rgb(var(--color-surface-rgb)/0.98)] focus:outline-none focus:ring-4 focus:ring-[color:rgb(var(--color-primary-rgb)/0.12)] disabled:cursor-not-allowed disabled:opacity-55';
  const authLinkClassName = 'font-semibold text-[var(--color-primary)] transition hover:text-[var(--color-primary-hover)]';
  const modeConfig = isLogin
    ? {
        heading: t('auth.welcomeBack'),
        description: t('auth.signInToAccount'),
        helper: t('auth.loginHelper', {
          defaultValue: dir === 'rtl'
            ? 'ادخل بسرعة لإدارة الطلبات، الرصيد، والخدمات الرقمية من نفس المكان.'
            : 'Sign in quickly to manage orders, balance, and digital services from one place.',
        }),
        pills: [
          t('auth.loginPillFast', {
            defaultValue: dir === 'rtl' ? 'دخول سريع' : 'Fast access',
          }),
          t('auth.loginPillSecure', {
            defaultValue: dir === 'rtl' ? 'جلسة آمنة' : 'Secure session',
          }),
          t('auth.loginPillLive', {
            defaultValue: dir === 'rtl' ? 'متابعة فورية' : 'Live updates',
          }),
        ],
      }
    : {
        heading: t('auth.register'),
        description: t('auth.joinToday'),
        helper: t('auth.registerHelper', {
          defaultValue: dir === 'rtl'
            ? 'أنشئ حسابك مرة واحدة، ثم أكمل بياناتك وانتظر موافقة الإدارة قبل البدء.'
            : 'Create your account once, complete your details, and wait for admin approval before getting started.',
        }),
        pills: [
          t('auth.registerPillProfile', {
            defaultValue: dir === 'rtl' ? 'إعداد الحساب' : 'Profile setup',
          }),
          t('auth.registerPillApproval', {
            defaultValue: dir === 'rtl' ? 'موافقة الإدارة' : 'Admin approval',
          }),
          t('auth.registerPillReady', {
            defaultValue: dir === 'rtl' ? 'جاهز للخدمات' : 'Service-ready',
          }),
        ],
      };

  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[linear-gradient(180deg,#fcf8ef_0%,#f5eedf_46%,#ece1ce_100%)] px-4 py-5 dark:bg-[linear-gradient(180deg,#0c0d11_0%,#07080b_42%,#040507_100%)] sm:px-6 lg:px-8">
      <AuthGoldDustBackground
        enabled={authAtmosphereConfig.enableGoldDust}
        desktopParticleCount={authAtmosphereConfig.desktopDustCount}
        mobileParticleCount={authAtmosphereConfig.mobileDustCount}
        showAmbientSparkles={authAtmosphereConfig.enableAmbientSparkles}
        desktopSparkleCount={authAtmosphereConfig.desktopSparkleCount}
        mobileSparkleCount={authAtmosphereConfig.mobileSparkleCount}
      />

      <div className="absolute left-1/2 top-2.5 z-20 -translate-x-1/2" data-auth-no-sparkle>
        <div className="flex items-center gap-1.5 rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.18)] bg-[rgba(255,250,241,0.74)] px-1.5 py-1.5 shadow-[0_18px_40px_-30px_rgba(23,23,23,0.26)] backdrop-blur-xl dark:bg-[rgba(12,14,18,0.74)] dark:shadow-[0_18px_40px_-30px_rgba(0,0,0,0.82)]">
          <LanguageSwitcher
            variant="glass"
            showIcon
            className="h-8 min-w-[4.6rem] gap-1.5 rounded-full px-2.5 py-1 text-[0.58rem] tracking-[0.12em] sm:h-9 sm:min-w-[5rem] sm:px-3 sm:text-[0.62rem]"
          />
          <ThemeToggle
            variant="glass"
            compact
            className="h-8 w-8 sm:h-9 sm:w-9"
          />
        </div>
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 gap-5 pt-14 sm:pt-16 lg:min-h-[calc(100vh-2rem)] lg:grid-cols-[minmax(0,1.08fr)_minmax(23rem,0.92fr)] lg:items-center lg:gap-8">
        <AuthHeroVisual mode={authMode} />

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className={cn(
            'w-full lg:justify-self-end',
            isLogin ? '-mt-3 sm:-mt-4 lg:-mt-6' : '-mt-1 sm:-mt-2 lg:-mt-4'
          )}
        >
          <div className="mb-3 grid grid-cols-2 gap-1.5 rounded-[1.1rem] border border-[color:rgb(var(--color-primary-rgb)/0.16)] bg-[color:rgb(var(--color-card-rgb)/0.76)] p-1 shadow-[0_18px_48px_-34px_rgba(23,23,23,0.22)] backdrop-blur-xl" data-auth-no-sparkle>
            {[
              { key: 'login', active: isLogin, label: t('auth.login'), onClick: () => !isLogin && toggleMode() },
              { key: 'register', active: !isLogin, label: t('auth.register'), onClick: () => isLogin && toggleMode() },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={item.onClick}
                className={cn(
                  'relative overflow-hidden rounded-[0.9rem] px-3 py-2 text-[0.82rem] font-semibold transition',
                  item.active
                    ? 'text-[var(--color-button-text)] shadow-[0_18px_36px_-26px_rgb(var(--color-primary-rgb)/0.55)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                )}
              >
                {item.active && (
                  <motion.span
                    layoutId="auth-mode-toggle"
                    className="absolute inset-0 rounded-[0.9rem] bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-soft)_48%,var(--color-primary-hover))]"
                    transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </button>
            ))}
          </div>

          <div className={cn('flex items-center text-start', isLogin ? 'mb-3 gap-2' : 'mb-4 gap-2.5')}>
            <div
              className={cn(
                'relative shrink-0 items-center justify-center',
                isLogin ? 'flex h-10 w-10 sm:h-11 sm:w-11' : 'flex h-12 w-12 sm:h-14 sm:w-14'
              )}
            >
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(243,222,155,0.68),rgba(212,175,55,0.18)_44%,transparent_72%)] blur-[10px]" />
              <div className="relative h-full w-full overflow-hidden rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.24)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(247,239,222,0.72))] p-1 shadow-[0_18px_42px_-32px_rgba(0,0,0,0.72)] dark:bg-[linear-gradient(180deg,rgba(22,24,29,0.95),rgba(10,11,14,0.9))]">
                <img
                  src={brandIconImage}
                  alt="IBRA Store"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
            </div>

            <div className="min-w-0">
              <span
                className={cn(
                  'inline-flex items-center rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.16)] bg-[color:rgb(var(--color-primary-rgb)/0.08)] font-semibold uppercase text-[var(--color-primary)]',
                  isLogin
                    ? 'px-2 py-0.5 text-[0.56rem] tracking-[0.14em]'
                    : 'px-2.5 py-0.5 text-[0.62rem] tracking-[0.18em]'
                )}
              >
                {isLogin ? t('auth.login') : t('auth.register')}
              </span>
              <h1
                className={cn(
                  'font-semibold tracking-[-0.03em] text-[var(--color-text)]',
                  isLogin ? 'mt-1.5 text-[1.12rem] sm:text-[1.24rem]' : 'mt-2 text-[1.45rem] sm:text-[1.65rem]'
                )}
              >
                {modeConfig.heading}
              </h1>
            </div>
          </div>

          <Card
            variant="premium"
            data-auth-no-sparkle
            className="space-y-6 border-[color:rgb(var(--color-primary-rgb)/0.18)] bg-[linear-gradient(180deg,rgb(var(--color-card-rgb)/0.98),rgb(var(--color-surface-rgb)/0.94))] p-5 shadow-[0_34px_84px_-42px_rgba(0,0,0,0.84)] sm:p-7 md:p-8"
          >
            {!isLogin && (
              <div className="rounded-[1.25rem] border border-[color:rgb(var(--color-primary-rgb)/0.16)] bg-[linear-gradient(180deg,rgba(212,175,55,0.14),rgba(212,175,55,0.06))] px-4 py-3 text-sm leading-7 text-[var(--color-text-secondary)]">
                {t('auth.pendingApprovalNotice', {
                  defaultValue: dir === 'rtl'
                    ? 'التسجيل الجديد يحتاج موافقة الإدارة قبل استخدام الحساب، سواء تم عبر البريد أو عبر Google.'
                    : 'New registrations require admin approval before the account can be used, whether created by email or Google.',
                })}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence initial={false}>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <Input
                      label={t('auth.fullName')}
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      icon={<User className="h-4 w-4" />}
                      error={errors.name}
                    />

                    <Input
                      label={t('auth.username')}
                      type="text"
                      placeholder="johndoe"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      icon={<User className="h-4 w-4" />}
                      error={errors.username}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
                          {t('auth.country')}
                        </label>
                        <div className="relative">
                          <select
                            value={country}
                            onChange={(event) => setCountry(event.target.value)}
                            className={cn(authSelectClassName, dir === 'rtl' ? 'pr-10' : 'pl-10')}
                          >
                            {countryOptions.map((item) => (
                              <option key={item.cca2} value={item.cca2}>
                                {item.name?.common || item.cca2}
                              </option>
                            ))}
                          </select>
                          <Globe className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)] ${dir === 'rtl' ? 'right-3' : 'left-3'}`} />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
                          {t('auth.currency')}
                        </label>
                        <select
                          value={currency}
                          onChange={(event) => setCurrency(event.target.value)}
                          disabled={!availableCurrencyOptions.length}
                          className={authSelectClassName}
                        >
                          {!availableCurrencyOptions.length && (
                            <option value="">{t('auth.noCurrenciesConfigured')}</option>
                          )}
                          {availableCurrencyOptions.map((item) => (
                            <option key={item.code} value={item.code}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                        {t('auth.phone')}
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <select
                          value={phoneCode}
                          onChange={(event) => setPhoneCode(event.target.value)}
                          className={cn(authSelectClassName, 'col-span-1 px-3')}
                        >
                          {dialCodeOptions.map((item) => (
                            <option key={`${item.code}-${item.label}`} value={item.code}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                        <Input
                          type="tel"
                          placeholder="555000000"
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                          icon={<Phone className="h-4 w-4" />}
                          error={errors.phone}
                          className="col-span-2"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

=======
    
    let success;
    if (isLogin) {
      success = await login(email, password);
    } else {
      success = await signup({
        name,
        username,
        email,
        password,
        country,
        currency,
        phone: `${phoneCode}${phone}`
      });
    }

    if (success) {
      if (!isLogin) {
          // Redirect to WhatsApp for activation
          const message = `Hello Admin, I have just registered.\nName: ${name}\nEmail: ${email}\nPlease activate my account.`;
          const whatsappUrl = buildWhatsAppLink({
            number: paymentSettings?.whatsappNumber,
            message,
          });
          window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

          setActivationEmail(email);
          setIsActivationModalOpen(true);
          setIsLogin(true); // Switch to login view
      } else {
          const loggedInUser = useAuthStore.getState().user;
          navigate(getDefaultRouteForRole(loggedInUser?.role));
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setConfirmPassword('');
    setErrors({});
    useAuthStore.setState({ error: null });
  };

  const handleGoogleAuth = async () => {
    const success = await loginWithGoogle();
    if (!success) return;

    addToast(
      t('auth.googleSuccess', { defaultValue: dir === 'rtl' ? 'تم تسجيل الدخول عبر Google' : 'Signed in with Google' }),
      'success'
    );

    const loggedInUser = useAuthStore.getState().user;
    navigate(getDefaultRouteForRole(loggedInUser?.role));
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef3f6] p-4 dark:bg-[#0d1622]">
      {/* Calm Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),transparent_46%),linear-gradient(180deg,rgba(234,241,245,0.96),rgba(244,247,248,0.98))] dark:bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_42%),linear-gradient(180deg,rgba(13,22,34,0.98),rgba(10,16,26,0.99))]"
          animate={{
            opacity: [0.95, 1, 0.95],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -top-24 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(167,186,205,0.28),transparent_68%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(59,130,246,0.14),transparent_70%)]"
          animate={{
            y: [0, 22, 0],
            scale: [1, 1.04, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-[-8rem] right-[-3rem] h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle,rgba(179,212,202,0.2),transparent_68%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(16,185,129,0.12),transparent_70%)]"
          animate={{
            y: [0, -18, 0],
            x: [0, -16, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
        <motion.div
          className="absolute left-[-10%] top-1/3 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.44),transparent_70%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(148,163,184,0.1),transparent_72%)]"
          animate={{
            x: [0, 16, 0],
            y: [0, 12, 0],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
        <motion.div
          className="absolute inset-y-0 left-[-35%] w-[55%] bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.3),transparent)] opacity-60 dark:opacity-10"
          animate={{
            x: ['0%', '210%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      <div className="absolute left-1/2 top-5 z-20 -translate-x-1/2">
        <div className="flex items-center gap-2 rounded-full border border-white/55 bg-white/70 px-2.5 py-2 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70">
          <LanguageSwitcher variant="glass" />
          <ThemeToggle variant="glass" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mx-auto w-full max-w-md pt-20"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative mx-auto mb-5 flex h-28 w-28 items-center justify-center"
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,230,180,0.9),rgba(246,190,74,0.3)_42%,transparent_72%)]"
              animate={{
                boxShadow: [
                  '0 0 18px rgba(245, 158, 11, 0.22), 0 0 34px rgba(245, 158, 11, 0.12)',
                  '0 0 32px rgba(245, 158, 11, 0.34), 0 0 56px rgba(245, 158, 11, 0.18)',
                  '0 0 18px rgba(245, 158, 11, 0.22), 0 0 34px rgba(245, 158, 11, 0.12)',
                ]
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              style={{
                filter: 'blur(14px)'
              }}
            />
            <div className="relative h-full w-full overflow-hidden rounded-full border border-white/70 bg-white/75 p-2 shadow-[0_26px_60px_-30px_rgba(15,23,42,0.38)] dark:border-white/10 dark:bg-slate-900/85">
              <motion.img
                src={brandIconImage}
                alt="Ibra Logo"
                className="relative h-full w-full rounded-full object-cover"
              />
              <motion.div
                className="absolute inset-y-0 left-[-45%] w-1/2 bg-[linear-gradient(115deg,transparent,rgba(255,255,255,0.85),transparent)] mix-blend-screen"
                animate={{ x: ['0%', '250%'] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'linear', repeatDelay: 1.2 }}
              />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl font-bold text-gray-900 dark:text-white"
          >
            {isLogin ? t('auth.welcomeBack') : t('auth.register')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-gray-500 dark:text-gray-400 mt-2"
          >
            {isLogin 
              ? t('auth.signInToAccount')
              : t('auth.joinToday')}
          </motion.p>
        </div>

        <Card className="p-6 md:p-8 space-y-6">
          {isLogin && activationEmail && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 px-4 py-3 text-sm dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300">
              <p className="font-semibold">{t('auth.activationSentTitle')}</p>
              <p className="mt-1 break-all">{activationEmail}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  {/* Full Name Input */}
                  <Input
                    label={t('auth.fullName')}
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    icon={<User className="w-4 h-4" />}
                    error={errors.name}
                  />

                  {/* Name Input */}
                  <Input
                    label={t('auth.username')}
                    type="text"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    icon={<User className="w-4 h-4" />}
                    error={errors.username}
                  />

                  {/* Country & Currency Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {t('auth.country')}
                      </label>
                      <div className="relative">
                        <select
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          disabled={isCountriesLoading}
                          className={cn(
                            "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white appearance-none",
                            dir === 'rtl' ? "pr-10" : "pl-10" // Make room for the icon
                          )}
                        >
                          {countryOptions.map((item) => (
                            <option key={item.cca2} value={item.cca2}>
                              {item.name?.common || item.cca2}
                            </option>
                          ))}
                        </select>
                        <Globe className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {t('auth.currency')}
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        disabled={!availableCurrencyOptions.length}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      >
                        {!availableCurrencyOptions.length && (
                          <option value="">{t('auth.noCurrenciesConfigured')}</option>
                        )}
                        {availableCurrencyOptions.map((item) => (
                          <option key={item.code} value={item.code}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Phone Input */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('auth.phone')}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={phoneCode}
                        onChange={(e) => setPhoneCode(e.target.value)}
                        className="col-span-1 rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      >
                        {dialCodeOptions.map((item) => (
                          <option key={`${item.code}-${item.label}`} value={item.code}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                      <Input
                        type="tel"
                        placeholder="555000000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        icon={<Phone className="w-4 h-4" />}
                        error={errors.phone}
                        className="col-span-2"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Input (Always visible) */}
            <div className="space-y-4">
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
              <Input
                label={t('auth.email')}
                type="email"
                placeholder="name@example.com"
                value={email}
<<<<<<< HEAD
                onChange={(event) => setEmail(event.target.value)}
                icon={<Mail className="h-4 w-4" />}
                error={errors.email}
              />

=======
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                error={errors.email}
              />

              {/* Password Input (Always visible) */}
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
              <Input
                label={t('auth.password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="********"
                value={password}
<<<<<<< HEAD
                onChange={(event) => setPassword(event.target.value)}
                icon={<Lock className="h-4 w-4" />}
                error={errors.password}
                suffix={(
                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="flex items-center justify-center p-1 text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
=======
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                error={errors.password}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center justify-center p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
              />

              {!isLogin && (
                <Input
                  label={t('auth.confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="********"
                  value={confirmPassword}
<<<<<<< HEAD
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  icon={<Lock className="h-4 w-4" />}
                  error={errors.confirmPassword}
                  suffix={(
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((previous) => !previous)}
                      className="flex items-center justify-center p-1 text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  )}
                />
              )}

              <AnimatePresence initial={false}>
                {storeError && (
                  <motion.div
                    key={storeError}
                    initial={{ opacity: 0, y: -8, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.99 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="relative overflow-hidden rounded-[1.15rem] border border-rose-200/75 bg-[linear-gradient(180deg,rgba(255,247,245,0.98),rgba(255,239,236,0.96))] px-4 py-3.5 shadow-[0_18px_44px_-34px_rgba(225,29,72,0.32)] dark:border-rose-900/45 dark:bg-[linear-gradient(180deg,rgba(47,16,24,0.84),rgba(26,11,16,0.72))] dark:shadow-[0_24px_54px_-34px_rgba(0,0,0,0.82)]"
                  >
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.58),transparent_56%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_56%)]" />
                    <div className="relative flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-rose-300/65 bg-white/80 text-rose-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] dark:border-rose-500/20 dark:bg-white/5 dark:text-rose-200">
                        <AlertCircle className="h-4.5 w-4.5" />
                      </span>

                      <div className="min-w-0">
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-rose-700/80 dark:text-rose-200/72">
                          {t('auth.errorNotice', {
                            defaultValue: dir === 'rtl' ? 'تنبيه تسجيل' : 'Sign-in notice',
                          })}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-rose-700 dark:text-rose-100/92">
                          {storeError}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading
                  ? (isLogin ? t('common.loading') : t('common.processing'))
                  : (isLogin ? t('auth.signIn') : t('auth.signUp'))}
                {!isLoading && <ArrowRight className={`h-4 w-4 ${dir === 'rtl' ? 'mr-1 rotate-180' : 'ml-1'}`} />}
              </Button>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.3)] to-transparent" />
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                    {t('auth.orContinueWith', {
                      defaultValue: dir === 'rtl' ? 'أو تابع باستخدام' : 'Or continue with',
                    })}
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[rgba(212,175,55,0.3)] to-transparent" />
                </div>

                <motion.button
                  type="button"
                  whileHover={reduceMotion ? undefined : { y: -2, scale: 1.01 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl border border-[color:rgb(var(--color-primary-rgb)/0.16)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,244,234,0.92))] px-4 py-3 text-sm font-semibold text-[var(--color-text)] shadow-[0_18px_42px_-26px_rgba(15,23,42,0.28)] transition-all hover:border-[color:rgb(var(--color-primary-rgb)/0.28)] hover:shadow-[0_24px_48px_-26px_rgba(212,175,55,0.26)] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[linear-gradient(180deg,rgba(17,19,26,0.96),rgba(9,10,13,0.92))]"
                >
                  <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                    <GoogleMark />
                  </span>
                  <span className="relative">
                    {t('auth.continueWithGoogle', {
                      defaultValue: dir === 'rtl' ? 'المتابعة عبر Google' : 'Continue with Google',
                    })}
                  </span>
                </motion.button>
              </div>

              <div className="mt-6 space-y-2 text-center">
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    className="w-full rounded-lg px-4 py-2 text-sm font-medium text-[var(--color-primary)] transition hover:bg-[color:rgb(var(--color-primary-rgb)/0.08)] hover:text-[var(--color-primary-hover)]"
                  >
                    {t('auth.forgotPassword')}
                  </button>
                )}

                <span className="block text-sm text-[var(--color-text-secondary)]">
                  {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className={authLinkClassName}
                  >
                    {isLogin ? t('auth.signUp') : t('auth.signIn')}
                  </button>
                </span>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>

      {isLogin && (
        <div className="relative z-10 mx-auto mt-4 w-full max-w-3xl" data-auth-no-sparkle>
          <div className="rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.14)] bg-[color:rgb(var(--color-card-rgb)/0.72)] px-3 py-2 text-center text-[0.67rem] leading-5 text-[var(--color-text-secondary)] shadow-[0_18px_46px_-36px_rgba(15,23,42,0.32)] backdrop-blur-xl sm:px-4 sm:text-xs sm:leading-6">
            {dir === 'rtl'
              ? 'بتسجيل الدخول إلى IBRA Store، فأنت تقر بأنك اطلعت على '
              : 'By signing in to IBRA Store, you acknowledge our '}
            <button
              type="button"
              onClick={() => setPrivacyModalOpen(true)}
              className="font-semibold text-[var(--color-primary)] underline underline-offset-4 transition hover:text-[var(--color-primary-hover)]"
            >
              {dir === 'rtl' ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </button>
            {dir === 'rtl'
              ? ' وتفهم كيفية استخدام البيانات اللازمة لحماية الحساب وتحسين الخدمة.'
              : ' and understand how the data required to secure your account and improve the service is used.'}
          </div>
        </div>
      )}

=======
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                  error={errors.confirmPassword}
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="focus:outline-none hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center justify-center p-1"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
              )}
            </div>

            {storeError && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-800">
                {storeError}
              </div>
            )}

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative"
            >
              {/* Glow Background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity"
                animate={{
                  opacity: isLoading ? 0.3 : 0,
                }}
                transition={{ duration: 0.3 }}
              />
              {/* Button */}
              <Button
                type="submit"
                className="group relative w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-500 dark:to-purple-600 dark:hover:from-indigo-600 dark:hover:to-purple-700 shadow-lg hover:shadow-2xl transition-all duration-300 glow-button overflow-hidden"
                disabled={isLoading}
              >
                <motion.div
                  className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10"
                  animate={{
                    x: isLoading ? [0, 100, 0] : 0,
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: isLoading ? Infinity : 0,
                    ease: "easeInOut",
                  }}
                />
                <span className="relative flex items-center justify-center">
                  {isLoading 
                    ? (isLogin ? t('common.loading') : t('common.processing'))
                    : (isLogin ? t('auth.signIn') : t('auth.signUp'))
                  }
                  {!isLoading && <ArrowRight className={`w-4 h-4 ${dir === 'rtl' ? 'mr-2' : 'ml-2'}`} />}
                </span>
              </Button>
            </motion.div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-gray-200 dark:via-gray-700 dark:to-gray-800" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
                  {t('auth.orContinueWith', { defaultValue: dir === 'rtl' ? 'أو تابع باستخدام' : 'Or continue with' })}
                </span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent via-gray-300 to-gray-200 dark:via-gray-700 dark:to-gray-800" />
              </div>

              <motion.button
                type="button"
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-[0_18px_42px_-26px_rgba(15,23,42,0.32)] transition-all hover:border-gray-300 hover:shadow-[0_24px_48px_-26px_rgba(15,23,42,0.38)] disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:hover:border-gray-600"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.65),transparent_55%)] opacity-70 dark:opacity-20" />
                <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                  <GoogleMark />
                </span>
                <span className="relative">
                  {t('auth.continueWithGoogle', { defaultValue: dir === 'rtl' ? 'المتابعة عبر Google' : 'Continue with Google' })}
                </span>
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center mt-6 space-y-2"
            >
              {/* Forgot password link appears on login view only */}
              {isLogin && (
                <motion.button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 py-2 px-4 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors font-medium"
                >
                  {t('auth.forgotPassword')}
                </motion.button>
              )}
              
              <span className="text-sm text-gray-500 dark:text-gray-400 block">
                {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
                {' '}
                <motion.button
                  type="button"
                  onClick={toggleMode}
                  whileHover={{ scale: 1.08, x: 2 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="relative font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all duration-300 inline-block px-1"
                >
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    {isLogin ? t('auth.signUp') : t('auth.signIn')}
                  </motion.span>
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400"
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              </span>
            </motion.div>
          </form>
        </Card>
      </motion.div>

      <Modal
        isOpen={isActivationModalOpen}
        onClose={() => setIsActivationModalOpen(false)}
        title={t('auth.activationTitle')}
        footer={
          <div className="flex justify-end">
            <Button onClick={() => setIsActivationModalOpen(false)}>{t('auth.activationDone')}</Button>
          </div>
        }
      >
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
          <p className="font-semibold text-base">{t('auth.activationSentTitle')}</p>
          <p className="break-all">{activationEmail}</p>
          <p className="text-gray-500 dark:text-gray-400">{t('auth.activationWhatsAppNote')}</p>
        </div>
      </Modal>

      {/* Forgot password modal */}
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title={t('auth.forgotPassword')}
<<<<<<< HEAD
        footer={(
          <div className="flex justify-end gap-2">
            <Button onClick={() => setForgotModalOpen(false)} variant="ghost">
              {t('common.cancel')}
            </Button>
            <Button onClick={handleForgotSubmit}>
              {t('common.confirm')}
            </Button>
          </div>
        )}
      >
        <form onSubmit={handleForgotSubmit} className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            {t('auth.forgotPasswordDesc')}
          </p>
          <Input
            label={t('auth.email')}
            type="email"
            placeholder="name@example.com"
            value={forgotEmail}
            onChange={(event) => setForgotEmail(event.target.value)}
            icon={<Mail className="h-4 w-4" />}
            autoFocus
          />
        </form>
      </Modal>

      <Modal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        title={dir === 'rtl' ? 'سياسة الخصوصية' : 'Privacy Policy'}
        footer={(
          <div className="flex justify-end">
            <Button onClick={() => setPrivacyModalOpen(false)}>
              {dir === 'rtl' ? 'إغلاق' : 'Close'}
            </Button>
          </div>
        )}
      >
        <div className="space-y-3 text-sm leading-7 text-[var(--color-text-secondary)]">
          <p>
            {dir === 'rtl'
              ? 'تحترم IBRA Store خصوصيتك، وتستخدم بيانات تسجيل الدخول وبيانات الجلسة والمعلومات الأمنية الأساسية بالقدر اللازم فقط لتوثيق الحساب، حمايته، ومنع إساءة الاستخدام.'
              : 'IBRA Store respects your privacy and uses sign-in details, session data, and essential security information only as needed to authenticate your account, protect it, and prevent misuse.'}
          </p>
          <p>
            {dir === 'rtl'
              ? 'قد تتم معالجة البيانات المرتبطة بالحساب لتحسين الاعتمادية، دعم تسجيل الدخول، متابعة الطلبات، وتقديم تجربة أكثر أمانًا واستقرارًا داخل المنصة.'
              : 'Account-related data may be processed to improve reliability, support sign-in, follow order activity, and provide a more secure and stable experience across the platform.'}
          </p>
          <p>
            {dir === 'rtl'
              ? 'باستمرارك في تسجيل الدخول، فإنك توافق على هذه المعالجة الأساسية ضمن حدود تشغيل الخدمة وسياسات الحماية المعمول بها داخل المنصة.'
              : 'By continuing to sign in, you agree to this essential processing within the scope of operating the service and the platform’s applicable protection policies.'}
          </p>
        </div>
      </Modal>
=======
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setForgotModalOpen(false)} variant="ghost">{t('common.cancel')}</Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={handleForgotSubmit} className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800">{t('common.confirm')}</Button>
            </motion.div>
          </div>
        }
      >
        <form onSubmit={handleForgotSubmit} className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('auth.forgotPasswordDesc')}
            </p>
            <Input
              label={t('auth.email')}
              type="email"
              placeholder="name@example.com"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              autoFocus
            />
          </motion.div>
        </form>
      </Modal>
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
    </div>
  );
};

export default Auth;
<<<<<<< HEAD
=======

>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
