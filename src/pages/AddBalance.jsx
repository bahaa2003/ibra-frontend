import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, ChevronDown, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PaymentMethodCard from '../components/wallet/PaymentMethodCard';
import { useLanguage } from '../context/LanguageContext';
import useAuthStore from '../store/useAuthStore';
import useSystemStore from '../store/useSystemStore';
import { formatWalletAmount } from '../utils/storefront';
import { getActivePaymentGroups } from '../utils/paymentSettings';

const getMethodPresentation = (method) => {
  const token = `${method?.id || ''} ${method?.name || ''}`.toLowerCase();

  if (token.includes('vodafone')) {
    return { icon: Smartphone, color: 'from-red-500 to-pink-500' };
  }
  if (token.includes('etisalat')) {
    return { icon: Smartphone, color: 'from-green-500 to-teal-500' };
  }
  if (token.includes('orange')) {
    return { icon: Smartphone, color: 'from-orange-500 to-red-500' };
  }
  if (String(method?.type || '') === 'bank_transfer') {
    return { icon: Building2, color: 'from-blue-500 to-purple-500' };
  }

  return { icon: Smartphone, color: 'from-emerald-500 to-cyan-500' };
};

const isEgyptTransferGroup = (group) => {
  const groupToken = `${group?.id || ''} ${group?.name || ''}`.toLowerCase();
  if (groupToken.includes('egypt') || groupToken.includes('masr') || groupToken.includes('misr')) {
    return true;
  }

  const methodsToken = (Array.isArray(group?.methods) ? group.methods : [])
    .map((method) => `${method?.id || ''} ${method?.name || ''}`.toLowerCase())
    .join(' ');

  return ['vodafone', 'etisalat', 'orange'].some((token) => methodsToken.includes(token));
};

const CompactPaymentMethodTile = ({ method, presentation, onSelect, index }) => {
  const IconComponent = presentation.icon;
  const hasImage = Boolean(method?.image);

  return (
    <motion.button
      type="button"
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.28, delay: index * 0.03 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(method)}
      className="group flex flex-col items-center rounded-xl border border-gray-200/80 bg-white/85 p-2.5 text-center backdrop-blur-xl transition-all hover:border-indigo-300 hover:bg-white dark:border-gray-800 dark:bg-gray-900/75 dark:hover:border-indigo-500/45 dark:hover:bg-gray-900"
    >
      {hasImage ? (
        <img
          src={method.image}
          alt={method.name}
          className="h-11 w-11 rounded-lg border border-gray-200 object-cover transition-transform group-hover:scale-105 sm:h-12 sm:w-12 dark:border-gray-700"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br ${presentation.color} transition-transform group-hover:scale-105 sm:h-12 sm:w-12`}>
          <IconComponent className="h-5 w-5 text-white" />
        </div>
      )}
      <span className="mt-2 line-clamp-2 text-[11px] font-semibold leading-4 text-gray-800 dark:text-gray-100 sm:text-xs">
        {method.name}
      </span>
    </motion.button>
  );
};

const AddBalance = () => {
  const { dir } = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { paymentSettings, loadPaymentSettings } = useSystemStore();
  const isRTL = dir === 'rtl';

  const [openGroupId, setOpenGroupId] = useState(null);

  useEffect(() => {
    loadPaymentSettings();
  }, [loadPaymentSettings]);

  const currentBalance = Number(user?.coins || 0);
  const currentCurrency = String(user?.currency || 'USD').toUpperCase();
  const balanceDisplayValue = formatWalletAmount(currentBalance, currentCurrency);

  const paymentGroups = useMemo(
    () => getActivePaymentGroups(paymentSettings),
    [paymentSettings]
  );

  useEffect(() => {
    if (!paymentGroups.length) {
      setOpenGroupId(null);
      return;
    }

    setOpenGroupId((previous) => (
      paymentGroups.some((group) => group.id === previous) ? previous : paymentGroups[0].id
    ));
  }, [paymentGroups]);

  const handleMethodSelect = (method) => {
    navigate(`/wallet/payment-details/${method.id}`);
  };

  return (
    <div className="space-y-6" dir={dir}>
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">{t('wallet.addBalance')}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('payments.manualOnly')}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl border border-gray-200 bg-white/85 p-4 backdrop-blur-xl sm:p-6 dark:border-gray-800 dark:bg-gray-900/70"
        >
          <div className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('wallet.currentBalance')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {balanceDisplayValue}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="mb-6">
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">{t('payments.chooseMethod')}</h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">{t('payments.chooseMethodNote')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('payments.reviewWithin24')}</p>
          </div>

          <div className="space-y-4">
            {paymentGroups.map((group, index) => {
              const isOpen = openGroupId === group.id;

              return (
                <motion.div
                  key={group.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className="rounded-2xl border border-gray-200/80 bg-white/85 p-3 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/75"
                >
                  <button
                    type="button"
                    onClick={() => setOpenGroupId((previous) => (previous === group.id ? null : group.id))}
                    className="flex w-full flex-col items-start gap-4 rounded-xl px-3 py-3 text-start transition-colors hover:bg-gray-100/75 sm:flex-row sm:items-center sm:justify-between dark:hover:bg-gray-800/60"
                  >
                    <div className={`flex min-w-0 items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-gray-900 sm:text-lg dark:text-white">{group.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {group.description || (isRTL ? `يحتوي على ${group.methods.length} طرق دفع` : `Contains ${group.methods.length} payment methods`)}
                        </p>
                      </div>
                    </div>

                    <div className={`flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-start ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="rounded-full bg-[color:rgb(var(--color-primary-rgb)/0.1)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
                        {isRTL ? `${group.methods.length} وسائل` : `${group.methods.length} methods`}
                      </span>
                      <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className={`${isEgyptTransferGroup(group) ? 'grid grid-cols-3 gap-2 px-2 pb-2 pt-2 sm:gap-3' : 'grid gap-4 px-2 pb-2 pt-2 md:grid-cols-2'}`}>
                          {group.methods.map((method, methodIndex) => {
                            const presentation = getMethodPresentation(method);
                            const mappedMethod = {
                              ...method,
                              icon: presentation.icon,
                              color: presentation.color,
                              available: method.isActive !== false,
                              instructions: method.instructions || paymentSettings.instructions || t('payments.chooseMethod'),
                            };

                            if (isEgyptTransferGroup(group)) {
                              return (
                                <CompactPaymentMethodTile
                                  key={method.id}
                                  method={mappedMethod}
                                  presentation={presentation}
                                  onSelect={handleMethodSelect}
                                  index={methodIndex}
                                />
                              );
                            }

                            return (
                              <PaymentMethodCard
                                key={method.id}
                                method={mappedMethod}
                                onSelect={handleMethodSelect}
                                index={methodIndex}
                              />
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {!paymentGroups.length && (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 p-6 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-400">
                {isRTL ? 'لا توجد مجموعات دفع مفعلة حاليًا.' : 'No active payment groups are available right now.'}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="rounded-2xl border border-gray-200 bg-white/80 p-4 backdrop-blur-xl sm:p-6 dark:border-gray-800 dark:bg-gray-900/65"
        >
          <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">{t('payments.importantInfo')}</h3>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            {[t('payments.infoItem1'), t('payments.infoItem2'), t('payments.infoItem3')].map((item, idx) => (
              <div key={item} className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div
                  className={`mt-2 h-2 w-2 flex-shrink-0 rounded-full ${
                    idx === 0 ? 'bg-orange-400' : idx === 1 ? 'bg-pink-400' : 'bg-purple-400'
                  }`}
                />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AddBalance;
