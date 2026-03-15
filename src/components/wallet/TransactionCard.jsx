import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, ShoppingCart, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
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
      className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-gray-200/70 dark:border-white/10 rounded-xl p-4 hover:bg-white dark:hover:bg-black/50 transition-colors cursor-pointer"
    >
      <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getTransactionColor(transaction.type)} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-6 h-6 text-white" />
        </div>

        <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className={`flex items-center justify-between mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h4 className="text-gray-900 dark:text-white font-semibold text-sm">{transactionDescription}</h4>
            <div className={`flex items-center gap-1 ${getStatusColor(transaction.status)}`}>
              <StatusIcon className="w-4 h-4" />
              <span className="text-xs">{t(statusLabelKey, { defaultValue: transaction.status })}</span>
            </div>
          </div>

          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="text-gray-600 dark:text-gray-400 text-xs">
              {new Date(transaction.date).toLocaleDateString(locale, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <div className={`font-bold ${transaction.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatWalletAmount(transaction.amount, transaction.currency, { signed: true })}
            </div>
          </div>

          {transaction.reference && (
            <div className="text-gray-500 text-xs mt-1">
              {t('wallet.reference')}: {transaction.reference}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TransactionCard;
