import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import useSystemStore from '../store/useSystemStore';
import BalanceCard from '../components/wallet/BalanceCard';
import StatsCards from '../components/wallet/StatsCards';
import FilterBar from '../components/wallet/FilterBar';
import EmptyTransactions from '../components/wallet/EmptyTransactions';
import TransactionCard from '../components/wallet/TransactionCard';
import { useLanguage } from '../context/LanguageContext';
import { formatWalletAmount, formatWalletNumber } from '../utils/storefront';

const Wallet = () => {
  const { dir } = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuthStore();
  const { currencies, loadCurrencies } = useSystemStore();
  const userCurrency = String(user?.currency || 'USD').toUpperCase();
  const balance = Number(user?.coins || 0);

  // Fetch fresh profile on mount to bust Zustand persist cache (stale balance)
  useEffect(() => {
    if (refreshProfile) refreshProfile();
    if (loadCurrencies) loadCurrencies();
  }, [refreshProfile, loadCurrencies]);

  // Dynamic exchange rate from admin settings instead of hardcoded /50
  const currencyRate = useMemo(() => {
    const match = (currencies || []).find(
      (c) => String(c.code).toUpperCase() === userCurrency
    );
    return Number(match?.rate) || 1;
  }, [currencies, userCurrency]);

  const usdEquivalent = currencyRate > 0 ? Math.round(balance / currencyRate) : balance;

  const stats = useMemo(
    () => ({
      totalDeposits: formatWalletAmount(balance + 2750, userCurrency),
      totalSpent: formatWalletAmount(2750, userCurrency),
      netBalance: formatWalletAmount(balance, userCurrency),
      totalTransactions: formatWalletNumber(24)
    }),
    [balance, userCurrency]
  );

  const transactions = useMemo(
    () => [
      {
        id: '1',
        type: 'deposit',
        descriptionKey: 'wallet.typeDeposit',
        amount: 500,
        currency: userCurrency,
        status: 'completed',
        date: '2024-01-15T10:30:00Z',
        reference: 'TXN-001'
      },
      {
        id: '2',
        type: 'purchase',
        descriptionKey: 'wallet.typePurchase',
        amount: -325,
        currency: userCurrency,
        status: 'completed',
        date: '2024-01-14T15:45:00Z',
        reference: 'ORD-001'
      },
      {
        id: '3',
        type: 'transfer',
        descriptionKey: 'wallet.typeTransfer',
        amount: -200,
        currency: userCurrency,
        status: 'completed',
        date: '2024-01-13T09:20:00Z',
        reference: 'TRF-001'
      },
      {
        id: '4',
        type: 'deposit',
        descriptionKey: 'wallet.typeDeposit',
        amount: 1000,
        currency: userCurrency,
        status: 'pending',
        date: '2024-01-12T14:10:00Z',
        reference: 'TXN-002'
      }
    ],
    [userCurrency]
  );

  const [filteredTransactions, setFilteredTransactions] = useState(transactions);

  const handleFilterChange = (filters) => {
    let filtered = [...transactions];

    if (filters.period !== 'all') {
      const now = new Date();
      const periodMap = { today: 1, week: 7, month: 30, year: 365 };
      const days = periodMap[filters.period];
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((tx) => new Date(tx.date) >= cutoffDate);
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter((tx) => tx.type === filters.type);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter((tx) => tx.status === filters.status);
    }

    setFilteredTransactions(filtered);
  };

  const handleAddBalance = () => navigate('/wallet/add-balance');

  return (
    <div className="min-h-screen bg-transparent" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <BalanceCard
            balance={balance}
            currency={userCurrency}
            secondaryBalance={usdEquivalent}
            secondaryCurrency="USD"
            onAddBalance={handleAddBalance}
          />
        </div>

        <StatsCards stats={stats} />

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('wallet.recentTransactions')}</h2>
        </motion.div>

        <FilterBar onFilterChange={handleFilterChange} />

        {filteredTransactions.length === 0 ? (
          <EmptyTransactions onAddBalance={handleAddBalance} />
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction, index) => (
              <TransactionCard key={transaction.id} transaction={transaction} index={index} />
            ))}
          </div>
        )}

        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleAddBalance}
          className="fixed bottom-6 left-6 w-14 h-14 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:shadow-orange-500/25 transition-all z-50"
          aria-label={t('wallet.addBalance')}
        >
          <Plus className="w-6 h-6 text-white" />
        </motion.button>
      </div>
    </div>
  );
};

export default Wallet;
