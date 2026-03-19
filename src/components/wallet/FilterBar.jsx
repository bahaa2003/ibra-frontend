import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Calendar, Tag, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';

const FilterBar = ({ onFilterChange }) => {
  const { dir } = useLanguage();
  const { t } = useTranslation();
  const isRTL = dir === 'rtl';

  const [filters, setFilters] = useState({
    period: 'all',
    type: 'all',
    status: 'all'
  });

  const handleFilterChange = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onFilterChange(next);
  };

  const periodOptions = [
    { value: 'all', label: t('wallet.all') },
    { value: 'today', label: t('wallet.today') },
    { value: 'week', label: t('wallet.week') },
    { value: 'month', label: t('wallet.month') },
    { value: 'year', label: t('wallet.year') }
  ];

  const typeOptions = [
    { value: 'all', label: t('wallet.allTypes') },
    { value: 'deposit', label: t('wallet.typeDeposit') },
    { value: 'withdrawal', label: t('wallet.typeWithdrawal') },
    { value: 'transfer', label: t('wallet.typeTransfer') },
    { value: 'purchase', label: t('wallet.typePurchase') }
  ];

  const statusOptions = [
    { value: 'all', label: t('wallet.allStatuses') },
    { value: 'completed', label: t('wallet.statusCompleted') },
    { value: 'pending', label: t('wallet.statusPending') },
    { value: 'failed', label: t('wallet.statusFailed') }
  ];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-gray-200/70 dark:border-white/10 rounded-xl p-4 mb-6"
    >
      <div className={`flex items-center gap-4 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Filter className="w-5 h-5 text-orange-500 dark:text-orange-400" />
        <h3 className="text-gray-900 dark:text-white font-semibold">{t('wallet.filters')}</h3>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${isRTL ? 'text-right' : 'text-left'}`}>
        <div>
          <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {t('wallet.period')}
          </label>
          <select
            value={filters.period}
            onChange={(e) => handleFilterChange('period', e.target.value)}
            className={`w-full bg-white dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 dark:focus:border-orange-400 transition-colors ${isRTL ? 'text-right' : 'text-left'}`}
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            {t('wallet.type')}
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className={`w-full bg-white dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 dark:focus:border-orange-400 transition-colors ${isRTL ? 'text-right' : 'text-left'}`}
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {t('wallet.statusLabel')}
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={`w-full bg-white dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 dark:focus:border-orange-400 transition-colors ${isRTL ? 'text-right' : 'text-left'}`}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </motion.div>
  );
};

export default FilterBar;
