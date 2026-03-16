import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../ui/Toast';

const PaymentMethodCard = ({ method, onSelect, index }) => {
  const { dir } = useLanguage();
  const { t } = useTranslation();
  const { addToast } = useToast();
  const isRTL = dir === 'rtl';

  const IconComponent = method.icon;

  const handleCopyAccount = async (event) => {
    event.stopPropagation();
    const value = String(method.accountNumber || '').trim();
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      addToast(
        t('payments.copySuccess', { defaultValue: dir === 'rtl' ? 'تم نسخ الرقم' : 'Number copied' }),
        'success'
      );
    } catch (_error) {
      addToast(
        t('payments.copyFailed', { defaultValue: dir === 'rtl' ? 'تعذر نسخ الرقم' : 'Unable to copy number' }),
        'error'
      );
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group relative"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-100/50 via-sky-100/30 to-transparent blur-xl transition-all group-hover:blur-2xl dark:from-indigo-500/10 dark:via-sky-500/5" />

      <div
        className="relative cursor-pointer rounded-2xl border border-gray-200/80 bg-white/85 p-4 backdrop-blur-xl transition-all hover:border-indigo-300 sm:p-6 dark:border-gray-800 dark:bg-gray-900/75 dark:hover:border-indigo-500/45"
        onClick={() => onSelect(method)}
      >
        <div className={`mb-4 flex items-start justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex min-w-0 items-center gap-3 sm:gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${method.color} transition-transform group-hover:scale-110 sm:h-12 sm:w-12`}>
              <IconComponent className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-gray-900 sm:text-lg dark:text-white">{method.name}</h3>
              {method.description && (
                <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{method.description}</p>
              )}
            </div>
          </div>

          <div className={`flex shrink-0 items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {method.available === false && (
              <span className="rounded-full bg-red-500/20 px-2 py-1 text-xs text-red-400">{t('common.unavailable')}</span>
            )}
            <ArrowLeft className={`h-5 w-5 text-gray-400 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-300 ${isRTL ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {method.accountNumber && (
          <div className="mb-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50/90 p-4 dark:border-gray-800 dark:bg-gray-950/60">
              <div className={`mb-2 text-sm text-gray-600 dark:text-gray-300 ${isRTL ? 'text-right' : 'text-left'}`}>
                {method.instructions}
              </div>
              <button
                type="button"
                onClick={handleCopyAccount}
                className={`flex w-full flex-col items-start gap-2 rounded border border-gray-200 bg-white px-3 py-2 font-mono text-gray-900 transition-colors hover:border-indigo-300 hover:bg-indigo-50/60 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-100 dark:hover:border-indigo-500/40 dark:hover:bg-gray-900 ${
                  isRTL ? 'text-right' : 'text-left'
                }`}
              >
                <span className="w-full break-all text-sm sm:w-auto sm:max-w-[70%] sm:truncate">{method.accountNumber}</span>
                <span className={`inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-300 ${isRTL ? 'flex-row-reverse self-end sm:self-auto' : ''}`}>
                  <Copy className="h-3.5 w-3.5" />
                  <span>{t('payments.copyAccount', { defaultValue: dir === 'rtl' ? 'نسخ' : 'Copy' })}</span>
                </span>
              </button>
              {method.bankName && (
                <div className={`mt-2 text-xs text-gray-500 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {method.bankName}
                </div>
              )}
            </div>
          </div>
        )}

        <div className={`flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Lock className="h-3 w-3" />
          <span>{t('payments.securityProtected')}</span>
        </div>

        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-400/0 to-pink-500/0 transition-all group-hover:from-orange-400/5 group-hover:to-pink-500/5" />
      </div>
    </motion.div>
  );
};

export default PaymentMethodCard;
