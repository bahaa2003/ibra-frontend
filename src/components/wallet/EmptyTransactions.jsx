import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const EmptyTransactions = ({ onAddBalance }) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="text-center py-16"
    >
      <div className="relative mb-8">
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-400/20 to-pink-500/20 rounded-full flex items-center justify-center">
          <FileText className="w-12 h-12 text-gray-500 dark:text-gray-400" />
        </div>
        <div className="absolute top-2 right-8 w-4 h-4 bg-orange-400/30 rounded-full blur-sm" />
        <div className="absolute bottom-2 left-8 w-3 h-3 bg-pink-500/30 rounded-full blur-sm" />
      </div>

      <h3 className="text-gray-900 dark:text-white text-xl font-semibold mb-2">{t('wallet.noTransactionsYet')}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">{t('wallet.noTransactionsDescription')}</p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAddBalance}
        className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all flex items-center gap-2 mx-auto"
      >
        <Plus className="w-5 h-5" />
        {t('wallet.addBalanceNow')}
      </motion.button>
    </motion.div>
  );
};

export default EmptyTransactions;
