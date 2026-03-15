import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Phone, User, Mail, ArrowRight, Lock, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import Button, { cn } from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
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
import brandIconImage from '../assets/box_.png';

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

  const navigate = useNavigate();
  const { login, loginWithGoogle, signup, isLoading, error: storeError } = useAuthStore();
  const { addToast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const { dir } = useLanguage();
  const { t } = useTranslation();
  
  // Form State
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
  const isCountriesLoading = false;
  const [phoneCode, setPhoneCode] = useState('+1');
  const [phone, setPhone] = useState('');
  const { currencies: systemCurrencies, paymentSettings, loadCurrencies, loadPaymentSettings } = useSystemStore();
  const [activationEmail, setActivationEmail] = useState('');
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const [errors, setErrors] = useState({});

  const getDialCodes = (countryItem) => {
    const root = countryItem?.idd?.root || '';
    const suffixes = countryItem?.idd?.suffixes || [];
    if (!root && suffixes.length === 0) return [];
    if (!suffixes.length) return [root];
    return suffixes.map((suffix) => `${root}${suffix}`);
  };

  const countryOptions = useMemo(() => {
    const source = countries.length ? countries : fallbackCountries;
    return [...source].sort((a, b) => (a?.name?.common || '').localeCompare(b?.name?.common || ''));
  }, [countries, fallbackCountries]);

  const selectedCountry = useMemo(
    () => countryOptions.find((item) => item.cca2 === country) || countryOptions[0],
    [countryOptions, country]
  );

  const dialCodeOptions = useMemo(() => {
    const map = new Map();
    countryOptions.forEach((countryItem) => {
      const countryName = countryItem?.name?.common || countryItem?.cca2;
      getDialCodes(countryItem).forEach((code) => {
        if (!code) return;
        const key = `${code}-${countryItem.cca2}`;
        map.set(key, { code, label: `${code} (${countryName})` });
      });
    });
    return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
  }, [countryOptions]);

  const availableCurrencyOptions = useMemo(() => {
    const list = Array.isArray(systemCurrencies) ? systemCurrencies : [];
    if (!list.length) return [];

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
    loadPaymentSettings();
  }, [loadCurrencies, loadPaymentSettings]);

  useEffect(() => {
    setCurrency((prev) => {
      const hasPrev = availableCurrencyOptions.some((item) => item.code === prev);
      if (hasPrev) return prev;
      const usd = availableCurrencyOptions.find((item) => item.code === 'USD');
      return usd ? usd.code : (availableCurrencyOptions[0]?.code || '');
    });
  }, [availableCurrencyOptions]);

  useEffect(() => {
    if (!selectedCountry) return;
    const preferredDialCode = getDialCodes(selectedCountry)[0];
    if (preferredDialCode) {
      setPhoneCode(preferredDialCode);
    }
  }, [selectedCountry]);

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
    if (!validateForm()) return;

    if (!isLogin && !currency) {
      addToast(t('auth.noCurrenciesConfigured'), 'error');
      return;
    }
    
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
          if (loggedInUser?.role === 'admin') {
            navigate('/admin/payments');
          } else if (loggedInUser?.role === 'manager') {
            navigate('/manager/dashboard');
          } else {
            navigate('/dashboard');
          }
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
    if (loggedInUser?.role === 'admin') {
      navigate('/admin/payments');
    } else if (loggedInUser?.role === 'manager') {
      navigate('/manager/dashboard');
    } else {
      navigate('/dashboard');
    }
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
        <div className="flex items-center gap-2 rounded-full border border-white/55 bg-white/70 px-3 py-2 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70">
          <LanguageSwitcher variant="glass" />
          <ThemeToggle />
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
              <Input
                label={t('auth.email')}
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                error={errors.email}
              />

              {/* Password Input (Always visible) */}
              <Input
                label={t('auth.password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="********"
                value={password}
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
              />

              {!isLogin && (
                <Input
                  label={t('auth.confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="********"
                  value={confirmPassword}
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
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title={t('auth.forgotPassword')}
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
    </div>
  );
};

export default Auth;

