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
      className="mb-3 rounded-[0.95rem] border border-gray-200/70 bg-white/80 p-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-black/40 sm:p-3"
    >
      <div className={`mb-2.5 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`wallet-accent-chip px-2.5 py-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Filter className="h-3.5 w-3.5 text-[#8c631f]" />
          <h3 className="text-[13px] font-semibold text-[#8a6528]">{t('wallet.filters')}</h3>
        </div>
      </div>

      <div className={`grid grid-cols-1 gap-2.5 md:grid-cols-3 ${isRTL ? 'text-right' : 'text-left'}`}>
        <div>
          <label className={`wallet-accent-chip mb-1.5 px-2.5 py-1 text-[10px] font-semibold ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Calendar className="h-3 w-3 text-[#8c631f]" />
            {t('wallet.period')}
          </label>
          <select
            value={filters.period}
            onChange={(e) => handleFilterChange('period', e.target.value)}
            className={`h-9 w-full rounded-[0.8rem] border border-gray-300 bg-white px-2.5 py-1.5 text-[13px] text-gray-900 transition-colors focus:border-orange-500 focus:outline-none dark:border-white/20 dark:bg-black/50 dark:text-white dark:focus:border-orange-400 ${isRTL ? 'text-right' : 'text-left'}`}
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={`wallet-accent-chip mb-1.5 px-2.5 py-1 text-[10px] font-semibold ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Tag className="h-3 w-3 text-[#8c631f]" />
            {t('wallet.type')}
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className={`h-9 w-full rounded-[0.8rem] border border-gray-300 bg-white px-2.5 py-1.5 text-[13px] text-gray-900 transition-colors focus:border-orange-500 focus:outline-none dark:border-white/20 dark:bg-black/50 dark:text-white dark:focus:border-orange-400 ${isRTL ? 'text-right' : 'text-left'}`}
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={`wallet-accent-chip mb-1.5 px-2.5 py-1 text-[10px] font-semibold ${isRTL ? 'flex-row-reverse' : ''}`}>
            <CheckCircle className="h-3 w-3 text-[#8c631f]" />
            {t('wallet.statusLabel')}
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={`h-9 w-full rounded-[0.8rem] border border-gray-300 bg-white px-2.5 py-1.5 text-[13px] text-gray-900 transition-colors focus:border-orange-500 focus:outline-none dark:border-white/20 dark:bg-black/50 dark:text-white dark:focus:border-orange-400 ${isRTL ? 'text-right' : 'text-left'}`}
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
