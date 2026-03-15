import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BalanceCard from '../../components/wallet/BalanceCard';
import StatsCards from '../../components/wallet/StatsCards';
import FilterBar from '../../components/wallet/FilterBar';
import EmptyTransactions from '../../components/wallet/EmptyTransactions';
import TransactionCard from '../../components/wallet/TransactionCard';
import { useLanguage } from '../../context/LanguageContext';

const Wallet = () => {
  const { dir } = useLanguage();
  const navigate = useNavigate();

  // Mock data - in real app, this would come from API
  const [balance] = useState(2500);
  const [stats] = useState({
    totalDeposits: '5,250 EGP',
    totalSpent: '2,750 EGP',
    netBalance: '2,500 EGP',
    totalTransactions: '24'
  });

  const [transactions] = useState([
    {
      id: '1',
      type: 'deposit',
      description: 'إيداع من خلال فودافون كاش',
      amount: 500,
      currency: 'EGP',
      status: 'completed',
      date: '2024-01-15T10:30:00Z',
      reference: 'TXN-001'
    },
    {
      id: '2',
      type: 'purchase',
      description: 'شراء PUBG Mobile UC',
      amount: -325,
      currency: 'EGP',
      status: 'completed',
      date: '2024-01-14T15:45:00Z',
      reference: 'ORD-001'
    },
    {
      id: '3',
      type: 'transfer',
      description: 'تحويل إلى صديق',
      amount: -200,
      currency: 'EGP',
      status: 'completed',
      date: '2024-01-13T09:20:00Z',
      reference: 'TRF-001'
    },
    {
      id: '4',
      type: 'deposit',
      description: 'إيداع من خلال البنك',
      amount: 1000,
      currency: 'EGP',
      status: 'pending',
      date: '2024-01-12T14:10:00Z',
      reference: 'TXN-002'
    }
  ]);

  const [filteredTransactions, setFilteredTransactions] = useState(transactions);

  const handleFilterChange = (filters) => {
    let filtered = [...transactions];

    if (filters.period !== 'all') {
      const now = new Date();
      const periodMap = {
        today: 1,
        week: 7,
        month: 30,
        year: 365
      };
      const days = periodMap[filters.period];
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(t => new Date(t.date) >= cutoffDate);
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(t => t.status === filters.status);
    }

    setFilteredTransactions(filtered);
  };

  const handleAddBalance = () => {
    navigate('/wallet/add-balance');
  };

  return (
    <div className="min-h-screen bg-transparent" dir={dir}>
      

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Balance Card */}
        <div className="mb-8">
          <BalanceCard
            balance={balance}
            currency="EGP"
            secondaryBalance={Math.round(balance / 50)}
            secondaryCurrency="USD"
            onAddBalance={handleAddBalance}
          />
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Transactions Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">المعاملات الأخيرة</h2>
        </motion.div>

        {/* Filter Bar */}
        <FilterBar onFilterChange={handleFilterChange} />

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <EmptyTransactions onAddBalance={handleAddBalance} />
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction, index) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                index={index}
              />
            ))}
          </div>
        )}

        {/* Floating Add Balance Button */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleAddBalance}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:shadow-orange-500/25 transition-all z-50"
        >
          <Plus className="w-6 h-6 text-white" />
        </motion.button>
      </div>
    </div>
  );
};

export default Wallet;


