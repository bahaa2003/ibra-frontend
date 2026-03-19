import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';

const StatsCard = ({ title, value, change, changeType, icon: Icon, delay = 0 }) => {
  const { dir } = useLanguage();
  const isRTL = dir === 'rtl';

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-gray-200/70 dark:border-white/10 rounded-xl p-4 hover:bg-white dark:hover:bg-black/50 transition-colors"
    >
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-gray-900 dark:text-white text-2xl font-bold">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {changeType === 'positive' ? (
                <TrendingUp className="w-3 h-3 text-green-500 dark:text-green-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500 dark:text-red-400" />
              )}
              <span className={`text-xs ${changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{change}</span>
            </div>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400/20 to-pink-500/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-orange-500 dark:text-orange-400" />
        </div>
      </div>
    </motion.div>
  );
};

const StatsCards = ({ stats }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatsCard
        title={t('wallet.totalDeposits')}
        value={stats.totalDeposits}
        change="+12%"
        changeType="positive"
        icon={TrendingUp}
        delay={0.3}
      />
      <StatsCard
        title={t('wallet.totalSpent')}
        value={stats.totalSpent}
        change="-8%"
        changeType="negative"
        icon={TrendingDown}
        delay={0.4}
      />
      <StatsCard
        title={t('wallet.netBalance')}
        value={stats.netBalance}
        change="+4%"
        changeType="positive"
        icon={DollarSign}
        delay={0.5}
      />
      <StatsCard
        title={t('wallet.totalTransactions')}
        value={stats.totalTransactions}
        icon={Activity}
        delay={0.6}
      />
    </div>
  );
};

export default StatsCards;
