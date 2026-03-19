import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, ShoppingCart, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { formatDateTime } from '../../utils/intl';
import { formatWalletAmount } from '../../utils/storefront';

const TransactionCard = ({ transaction, index }) => {
  const { dir } = useLanguage();
  const { t, i18n } = useTranslation();
  const isRTL = dir === 'rtl';
  const locale = String(i18n.resolvedLanguage || i18n.language || 'ar').toLowerCase().startsWith('en') ? 'en-US' : 'ar-EG';

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return ArrowDownLeft;
      case 'withdrawal':
        return ArrowUpRight;
      case 'transfer':
        return RefreshCw;
      case 'purchase':
        return ShoppingCart;
      default:
        return ArrowDownLeft;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'deposit':
        return 'from-green-400 to-green-600';
      case 'withdrawal':
        return 'from-red-400 to-red-600';
      case 'transfer':
        return 'from-blue-400 to-blue-600';
      case 'purchase':
        return 'from-purple-400 to-purple-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'failed':
        return XCircle;
      case 'pending':
      default:
        return Clock;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  const statusLabelKey = `wallet.status${transaction.status?.charAt(0)?.toUpperCase() || ''}${transaction.status?.slice(1) || ''}`;
  const transactionDescription =
    transaction.descriptionKey ? t(transaction.descriptionKey) : transaction.description || transaction.type;

  const Icon = getTransactionIcon(transaction.type);
  const StatusIcon = getStatusIcon(transaction.status);

  return (
    <motion.div
      initial={{ x: isRTL ? 50 : -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="cursor-pointer rounded-lg border border-gray-200/70 bg-white/80 p-3 backdrop-blur-xl transition-colors hover:bg-white dark:border-white/10 dark:bg-black/40 dark:hover:bg-black/50 sm:rounded-xl sm:p-4"
    >
      <div className={`flex items-center gap-3 sm:gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br ${getTransactionColor(transaction.type)} flex items-center justify-center sm:h-12 sm:w-12 sm:rounded-xl`}>
          <Icon className="h-5 w-5 text-white sm:h-6 sm:w-6" />
        </div>

        <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className={`mb-1 flex flex-col gap-1 ${isRTL ? 'items-end text-right' : 'items-start text-left'} sm:flex-row sm:items-center sm:justify-between`}>
            <h4 className="line-clamp-2 break-words text-[13px] font-semibold leading-5 text-gray-900 dark:text-white sm:text-sm">
              {transactionDescription}
            </h4>
            <div className={`inline-flex items-center gap-1 text-[11px] sm:text-xs ${getStatusColor(transaction.status)}`}>
              <StatusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>{t(statusLabelKey, { defaultValue: transaction.status })}</span>
            </div>
          </div>

          <div className={`flex flex-col gap-1 ${isRTL ? 'items-end text-right' : 'items-start text-left'} sm:flex-row sm:items-center sm:justify-between`}>
            <div className="text-[11px] text-gray-600 dark:text-gray-400 sm:text-xs">
              {formatDateTime(transaction.date, locale, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <div className={`whitespace-nowrap text-sm font-bold [direction:ltr] sm:text-base ${transaction.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatWalletAmount(transaction.amount, transaction.currency, { signed: true })}
            </div>
          </div>

          {transaction.reference && (
            <div className={`mt-1 text-[10px] text-gray-500 sm:text-xs ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('wallet.reference')}: {transaction.reference}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TransactionCard;
