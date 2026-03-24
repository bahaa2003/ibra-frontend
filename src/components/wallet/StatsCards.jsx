import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';

const StatsCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  delay = 0,
  iconClass = 'text-orange-500 dark:text-orange-400',
  iconWrapClass = 'bg-gradient-to-br from-orange-400/20 to-pink-500/20',
  changeIconClass = '',
}) => {
  const { dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const changeToneClass = changeType === 'positive'
    ? 'text-[#3f7b2f]'
    : 'text-[#a24a4a]';

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      className="rounded-[1rem] border border-gray-200/70 bg-white/80 p-3 backdrop-blur-xl transition-colors hover:bg-white dark:border-white/10 dark:bg-black/40 dark:hover:bg-black/50 sm:p-3.5"
    >
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div>
          <p className="mb-0.5 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">{title}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white sm:text-[1.45rem]">{value}</p>
          {change && (
            <div className={`wallet-accent-chip mt-1.5 px-2 py-0.5 text-[10px] font-semibold sm:px-2.5 sm:py-1 sm:text-[11px] ${isRTL ? 'flex-row-reverse' : ''}`}>
              {changeType === 'positive' ? (
                <TrendingUp className={`h-3 w-3 ${changeIconClass || changeToneClass}`} />
              ) : (
                <TrendingDown className={`h-3 w-3 ${changeIconClass || changeToneClass}`} />
              )}
              <span className={changeToneClass}>{change}</span>
            </div>
          )}
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-[0.9rem] sm:h-10 sm:w-10 ${iconWrapClass}`}>
          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${iconClass}`} />
        </div>
      </div>
    </motion.div>
  );
};

const StatsCards = ({ stats }) => {
  const { t } = useTranslation();

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatsCard
        title={t('wallet.totalDeposits')}
        value={stats.totalDeposits}
        change="+12%"
        changeType="positive"
        icon={TrendingUp}
        iconClass="text-[#8c631f]"
        iconWrapClass="border border-[#d8b36b]/55 bg-[linear-gradient(180deg,rgba(255,246,218,0.95),rgba(242,214,150,0.6))]"
        changeIconClass="text-[#8c631f]"
        delay={0.3}
      />
      <StatsCard
        title={t('wallet.totalSpent')}
        value={stats.totalSpent}
        change="-8%"
        changeType="negative"
        icon={TrendingDown}
        iconClass="text-[#8c631f]"
        iconWrapClass="border border-[#d8b36b]/55 bg-[linear-gradient(180deg,rgba(255,246,218,0.95),rgba(242,214,150,0.6))]"
        changeIconClass="text-[#8c631f]"
        delay={0.4}
      />
      <StatsCard
        title={t('wallet.netBalance')}
        value={stats.netBalance}
        change="+4%"
        changeType="positive"
        icon={DollarSign}
        iconClass="text-[#8c631f]"
        iconWrapClass="border border-[#d8b36b]/55 bg-[linear-gradient(180deg,rgba(255,246,218,0.95),rgba(242,214,150,0.6))]"
        changeIconClass="text-[#8c631f]"
        delay={0.5}
      />
      <StatsCard
        title={t('wallet.totalTransactions')}
        value={stats.totalTransactions}
        icon={Activity}
        iconClass="text-[#8c631f]"
        iconWrapClass="border border-[#d8b36b]/55 bg-[linear-gradient(180deg,rgba(255,246,218,0.95),rgba(242,214,150,0.6))]"
        delay={0.6}
      />
    </div>
  );
};

export default StatsCards;
