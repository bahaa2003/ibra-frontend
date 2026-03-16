import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import useSystemStore from '../store/useSystemStore';
import apiClient from '../services/client';
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

  const [walletStats, setWalletStats] = useState(null);

  // Fetch real wallet stats from BE aggregation
  useEffect(() => {
    apiClient.wallet?.getStats?.()
      .then((data) => setWalletStats(data))
      .catch(() => setWalletStats(null)); // graceful fallback
  }, []);

  const stats = useMemo(
    () => ({
      totalDeposits: formatWalletAmount(walletStats?.totalDeposits ?? balance, userCurrency),
      totalSpent: formatWalletAmount(walletStats?.totalSpent ?? 0, userCurrency),
      netBalance: formatWalletAmount(walletStats?.netBalance ?? balance, userCurrency),
      totalTransactions: formatWalletNumber(walletStats?.totalTransactions ?? 0),
    }),
    [balance, userCurrency, walletStats]
  );

  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(true);

  // Fetch real transactions from BE
  useEffect(() => {
    const fetchTransactions = async () => {
      setTxLoading(true);
      try {
        const res = await apiClient.wallet?.getTransactions?.();
        const items = Array.isArray(res) ? res : (res?.transactions || res?.data || []);
        const mapped = items.map((tx) => {
          const typeMap = { CREDIT: 'deposit', DEBIT: 'purchase', REFUND: 'transfer' };
          const feType = typeMap[tx.type] || 'deposit';
          const signedAmount = feType === 'purchase' ? -Math.abs(tx.amount) : Math.abs(tx.amount);
          return {
            id: tx._id || tx.id,
            type: feType,
            description: tx.description || feType,
            amount: signedAmount,
            currency: userCurrency,
            status: (tx.status || 'completed').toLowerCase(),
            date: tx.createdAt || tx.date,
            reference: tx.reference || null,
          };
        });
        setTransactions(mapped);
      } catch {
        setTransactions([]);
      } finally {
        setTxLoading(false);
      }
    };
    fetchTransactions();
  }, [userCurrency]);

  const [filteredTransactions, setFilteredTransactions] = useState([]);

  // Sync filtered list when transactions change
  useEffect(() => {
    setFilteredTransactions(transactions);
  }, [transactions]);

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
