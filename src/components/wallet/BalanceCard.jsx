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
      className="relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-pink-500/20 rounded-2xl" />

      <div className="relative bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-gray-200/70 dark:border-white/10 rounded-2xl p-6">
        <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold text-lg">{t('wallet.currentBalance')}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{t('wallet.balanceAvailable')}</p>
          </div>
        </div>

        <div className={`mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {primaryBalance}
          </div>
          {approxBalance && (
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              ~ {approxBalance}
            </div>
          )}
        </div>

        <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddBalance}
            className="flex-1 bg-gradient-to-r from-orange-400 to-pink-500 text-white py-2 px-4 rounded-lg font-medium text-sm hover:shadow-lg hover:shadow-orange-500/25 transition-all"
          >
            {t('wallet.addBalance')}
          </motion.button>
        </div>

        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-orange-400/10 to-pink-500/10 rounded-full blur-xl" />
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-pink-500/10 to-orange-400/10 rounded-full blur-xl" />
      </div>
    </motion.div>
  );
};

export default BalanceCard;
