import React from 'react';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { formatWalletAmount } from '../../utils/storefront';

const BalanceCard = ({ balance, currency, secondaryBalance, secondaryCurrency, onAddBalance }) => {
  const { dir } = useLanguage();
  const { t } = useTranslation();
  const isRTL = dir === 'rtl';
  const primaryBalance = formatWalletAmount(balance, currency || 'USD');
  const approxBalance = Number.isFinite(Number(secondaryBalance))
    ? formatWalletAmount(secondaryBalance, secondaryCurrency || 'USD')
    : null;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="sidebar-wallet-shimmer relative isolate overflow-hidden rounded-[24px] border border-[#b98d3e]/55 bg-[linear-gradient(145deg,rgba(88,61,18,0.34),rgba(176,128,43,0.3)_42%,rgba(234,200,121,0.72)_100%)] p-4 shadow-[0_18px_38px_-24px_rgba(92,62,14,0.72)] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_right,rgba(255,243,200,0.28),transparent_45%)] before:opacity-80 sm:p-5"
    >
      <div className="relative z-10">
        <div className={`flex items-start justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold tracking-[0.18em] text-[#fff1c9]">
              {t('wallet.currentBalance')}
            </p>
            <p className="mt-0.5 text-xs text-[#fff4d4] sm:text-sm">{t('wallet.balanceAvailable')}</p>
          </div>

          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] border border-[#f1d089]/35 bg-[linear-gradient(180deg,rgba(255,239,194,0.34),rgba(189,133,35,0.3))] text-[#fff1c9] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] sm:h-11 sm:w-11">
            <Wallet className="h-5 w-5" />
          </span>
        </div>

        <div className={`mt-4 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className="text-[1.7rem] font-black tracking-[-0.04em] text-[#fff8e8] sm:text-[2.15rem]">
            {primaryBalance}
          </div>
          {approxBalance && (
            <div className="mt-1.5 inline-flex rounded-full border border-[#f1d089]/30 bg-[linear-gradient(180deg,rgba(255,239,194,0.16),rgba(189,133,35,0.2))] px-2.5 py-0.5 text-[11px] font-semibold text-[#fff1c9] sm:px-3 sm:py-1 sm:text-xs">
              ~ {approxBalance}
            </div>
          )}
        </div>

        <div className={`mt-4 flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddBalance}
            className="inline-flex min-h-10 flex-1 items-center justify-center rounded-[14px] border border-[#b88b36]/80 bg-[linear-gradient(180deg,#dcb76f,#bf8f35)] px-4 py-2 text-xs font-bold text-white shadow-[0_12px_24px_-18px_rgba(111,78,20,0.95)] transition-all hover:-translate-y-0.5 hover:brightness-[1.03] sm:min-h-11 sm:text-sm"
          >
            {t('wallet.addBalance')}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default BalanceCard;
