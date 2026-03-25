import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle,
  Clock,
  Copy,
  RefreshCw,
  ShoppingCart,
  XCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../ui/Toast';
import { formatDateTime } from '../../utils/intl';
import { formatWalletAmount } from '../../utils/storefront';

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

const getTransactionTone = (type) => {
  switch (type) {
    case 'deposit':
      return {
        cardClass: 'border-[#afd59b]/75 bg-[linear-gradient(145deg,rgba(80,137,43,0.08),rgba(242,251,237,0.94)_42%,rgba(255,255,255,0.96)_100%)] shadow-[0_16px_30px_-24px_rgba(61,122,40,0.28)]',
        iconClass: 'border-[#9ccc89]/65 bg-[linear-gradient(180deg,rgba(250,255,247,0.98),rgba(184,230,165,0.64))] text-[#3d7a28]',
        badgeClass: 'border-[#8fc87b]/60 bg-[#eef8e8]/90 text-[#427b31]',
        amountClass: 'text-[#2f7d3d]',
        glowClass: 'bg-[radial-gradient(circle_at_top_right,rgba(123,194,93,0.18),transparent_55%)]',
        railClass: 'bg-[#7bc25d]/70',
      };
    case 'withdrawal':
      return {
        cardClass: 'border-[#e2b0b0]/75 bg-[linear-gradient(145deg,rgba(173,64,64,0.08),rgba(254,244,244,0.94)_42%,rgba(255,255,255,0.96)_100%)] shadow-[0_16px_30px_-24px_rgba(156,54,54,0.22)]',
        iconClass: 'border-[#e4aaaa]/65 bg-[linear-gradient(180deg,rgba(255,249,249,0.98),rgba(240,181,181,0.62))] text-[#a14646]',
        badgeClass: 'border-[#de9f9f]/60 bg-[#fdf0f0]/90 text-[#a54848]',
        amountClass: 'text-[#a54848]',
        glowClass: 'bg-[radial-gradient(circle_at_top_right,rgba(226,132,132,0.16),transparent_55%)]',
        railClass: 'bg-[#dc8b8b]/70',
      };
    case 'transfer':
      return {
        cardClass: 'border-[#a9cde8]/75 bg-[linear-gradient(145deg,rgba(64,120,173,0.08),rgba(241,248,253,0.94)_42%,rgba(255,255,255,0.96)_100%)] shadow-[0_16px_30px_-24px_rgba(49,109,164,0.22)]',
        iconClass: 'border-[#9fc5e3]/65 bg-[linear-gradient(180deg,rgba(249,253,255,0.98),rgba(174,211,238,0.62))] text-[#2f6f9e]',
        badgeClass: 'border-[#96c1e1]/60 bg-[#eef7fd]/90 text-[#2e6e9d]',
        amountClass: 'text-[#2e6e9d]',
        glowClass: 'bg-[radial-gradient(circle_at_top_right,rgba(127,178,215,0.16),transparent_55%)]',
        railClass: 'bg-[#7fb2d7]/70',
      };
    case 'purchase':
      return {
        cardClass: 'border-[#d4bc86]/75 bg-[linear-gradient(145deg,rgba(93,72,33,0.12),rgba(246,215,148,0.12)_42%,rgba(255,251,236,0.96)_100%)] shadow-[0_16px_30px_-24px_rgba(125,92,33,0.26)]',
        iconClass: 'border-[#d8b36b]/65 bg-[linear-gradient(180deg,rgba(255,246,218,0.95),rgba(242,214,150,0.6))] text-[#8c631f]',
        badgeClass: 'border-[#d0b06e]/60 bg-[#fff8e8]/90 text-[#8a6528]',
        amountClass: 'text-[#8a6528]',
        glowClass: 'bg-[radial-gradient(circle_at_top_right,rgba(233,197,104,0.18),transparent_55%)]',
        railClass: 'bg-[#d0b06e]/70',
      };
    default:
      return {
        cardClass: 'border-[color:rgb(var(--color-border-rgb)/0.78)] bg-[color:rgb(var(--color-card-rgb)/0.92)] shadow-[0_16px_30px_-24px_rgba(15,23,42,0.18)]',
        iconClass: 'border-[color:rgb(var(--color-border-rgb)/0.82)] bg-[color:rgb(var(--color-elevated-rgb)/0.86)] text-[var(--color-text)]',
        badgeClass: 'border-[color:rgb(var(--color-border-rgb)/0.78)] bg-[color:rgb(var(--color-surface-rgb)/0.82)] text-[var(--color-text-secondary)]',
        amountClass: 'text-[var(--color-text)]',
        glowClass: 'bg-[radial-gradient(circle_at_top_right,rgba(148,163,184,0.12),transparent_55%)]',
        railClass: 'bg-[color:rgb(var(--color-border-rgb)/0.9)]',
      };
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

const getStatusTone = (status) => {
  switch (status) {
    case 'completed':
      return 'border-[#9ccc89]/55 bg-[#eef8e8]/88 text-[#427b31]';
    case 'failed':
      return 'border-[#de9f9f]/55 bg-[#fdf0f0]/88 text-[#a54848]';
    case 'pending':
    default:
      return 'border-[#d8c58b]/55 bg-[#fff8e6]/88 text-[#9a7a2d]';
  }
};

const TransactionCard = ({ transaction, index }) => {
  const { dir } = useLanguage();
  const { t, i18n } = useTranslation();
  const { addToast } = useToast();
  const isRTL = dir === 'rtl';
  const locale = String(i18n.resolvedLanguage || i18n.language || 'ar').toLowerCase().startsWith('en')
    ? 'en-US'
    : 'ar-EG';

  const statusLabelKey = `wallet.status${transaction.status?.charAt(0)?.toUpperCase() || ''}${transaction.status?.slice(1) || ''}`;
  const typeLabelKey = `wallet.type${transaction.type?.charAt(0)?.toUpperCase() || ''}${transaction.type?.slice(1) || ''}`;
  const rawDescription = transaction.descriptionKey
    ? t(transaction.descriptionKey)
    : (transaction.description ?? transaction.type);
  const transactionDescription = (() => {
    if (rawDescription === null || rawDescription === undefined) return '';
    if (typeof rawDescription === 'string' || typeof rawDescription === 'number') return String(rawDescription);
    if (typeof rawDescription === 'object') {
      const picked = rawDescription?.label || rawDescription?.title || rawDescription?.name || rawDescription?.text || '';
      return String(picked || '');
    }
    return String(rawDescription);
  })();
  const originalCurrency = String(transaction.originalCurrency || '').trim().toUpperCase();
  const currentCurrency = String(transaction.currentCurrency || '').trim().toUpperCase();
  const showOriginalCurrency = Boolean(originalCurrency) && originalCurrency !== currentCurrency;
  const hasBalanceSnapshot = transaction?.balanceBefore !== null
    && transaction?.balanceBefore !== undefined
    && transaction?.balanceAfter !== null
    && transaction?.balanceAfter !== undefined;

  const Icon = getTransactionIcon(transaction.type);
  const StatusIcon = getStatusIcon(transaction.status);
  const tone = getTransactionTone(transaction.type);

  const referenceText = (() => {
    const value = transaction?.reference;
    if (value === null || value === undefined) return '';
    if (typeof value === 'string' || typeof value === 'number') return String(value).trim();

    if (typeof value === 'object') {
      const candidate =
        value?.reference
        || value?.referenceId
        || value?.orderNumber
        || value?.siteOrderNumber
        || value?._id
        || value?.id
        || '';
      return String(candidate || '').trim();
    }

    return String(value).trim();
  })();

  const handleCopyReference = async () => {
    const value = referenceText;
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      addToast(t('wallet.transactionNumberCopied', { defaultValue: 'Transaction number copied' }), 'success');
    } catch (_error) {
      addToast(t('wallet.copyTransactionNumberFailed', { defaultValue: 'Unable to copy transaction number' }), 'error');
    }
  };

  return (
    <motion.div
      initial={{ x: isRTL ? 50 : -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`group relative isolate overflow-hidden rounded-[20px] border p-3 backdrop-blur-sm transition-all hover:-translate-y-0.5 sm:p-3.5 ${tone.cardClass}`}
    >
      <div className={`pointer-events-none absolute inset-0 ${tone.glowClass}`} />
      <div className={`pointer-events-none absolute inset-y-3 w-1 rounded-full ${tone.railClass} ${isRTL ? 'right-0' : 'left-0'}`} />

      <div className={`relative z-10 flex items-center gap-2.5 sm:gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] border sm:h-10 sm:w-10 sm:rounded-[16px] ${tone.iconClass}`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>

        <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className={`mb-1 flex flex-col gap-1 ${isRTL ? 'items-end text-right' : 'items-start text-left'} sm:flex-row sm:items-start sm:justify-between`}>
            <div className="min-w-0">
              <div className={`flex flex-wrap items-center gap-1.5 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                <h4 className="line-clamp-2 break-words text-[12px] font-semibold leading-5 text-[#433014] sm:text-[13px]">
                  {transactionDescription}
                </h4>
                <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tone.badgeClass}`}>
                  {t(typeLabelKey, { defaultValue: transaction.type })}
                </span>
              </div>
            </div>

            <div className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getStatusTone(transaction.status)}`}>
              <StatusIcon className="h-3 w-3" />
              <span>{t(statusLabelKey, { defaultValue: transaction.status })}</span>
            </div>
          </div>

          <div className={`flex flex-col gap-1 ${isRTL ? 'items-end text-right' : 'items-start text-left'} sm:flex-row sm:items-center sm:justify-between`}>
            <div className="text-[10px] text-[#8b7345] sm:text-[11px]">
              {formatDateTime(transaction.date, locale, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
            <div className={`whitespace-nowrap text-sm font-black [direction:ltr] ${tone.amountClass}`}>
              {formatWalletAmount(transaction.amount, transaction.currency, { signed: true })}
            </div>
          </div>

          <div className={`mt-1.5 flex flex-wrap items-center gap-1.5 ${isRTL ? 'justify-end' : 'justify-start'}`}>
            {hasBalanceSnapshot ? (
              <div className={`inline-flex items-center gap-1.5 rounded-full border border-white/55 bg-white/52 px-2 py-0.5 text-[10px] font-semibold ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-[#a54848] line-through">
                  {formatWalletAmount(transaction.balanceBefore, transaction.currency)}
                </span>
                <span className="text-[#8b7345]">→</span>
                <span className="text-[#2f7d3d]">
                  {formatWalletAmount(transaction.balanceAfter, transaction.currency)}
                </span>
              </div>
            ) : null}

            {referenceText && (
              <button
                type="button"
                onClick={handleCopyReference}
                className={`inline-flex items-center gap-1 rounded-full border border-white/55 bg-white/52 px-2 py-0.5 text-[10px] text-[#8b7345] transition-colors hover:border-[color:rgb(var(--color-primary-rgb)/0.28)] hover:text-[var(--color-primary)] ${isRTL ? 'text-right' : 'text-left'}`}
                title={t('wallet.copyTransactionNumber', { defaultValue: 'Copy transaction number' })}
              >
                <span>{t('wallet.reference')}: {referenceText}</span>
                <Copy className="h-3 w-3" />
              </button>
            )}

            {showOriginalCurrency && (
              <div className={`inline-flex rounded-full border border-[#ecd8ab]/70 bg-[#fff8e8]/92 px-2 py-0.5 text-[10px] font-medium text-[#8a6528] ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('wallet.executionCurrency', { defaultValue: 'Transaction currency at execution' })}: {originalCurrency}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TransactionCard;
