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
import Loader from '../components/ui/Loader';
import { useLanguage } from '../context/LanguageContext';
import { formatWalletAmount, formatWalletNumber } from '../utils/storefront';
import { normalizeMoneyAmount } from '../utils/money';
import {
  resolveOrderExecutionCurrency,
  resolveTopupExecutionCurrency,
  resolveWalletTransactionExecutionCurrency,
  resolveWalletTransactionOriginalCurrency,
} from '../utils/transactionCurrency';

const normalizeLookupKey = (value) => String(value || '').trim().toLowerCase();
const normalizeMatchText = (value) => String(value || '')
  .toLowerCase()
  .replace(/[_-]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const toFiniteNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toTimestamp = (value) => {
  const timestamp = new Date(value || 0).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const sortTransactionsByNewest = (left, right) => toTimestamp(right?.date) - toTimestamp(left?.date);

const buildLookupKeys = (...values) => Array.from(new Set(
  values
    .map((value) => normalizeLookupKey(value))
    .filter(Boolean)
));

const findLinkedRecord = (tx, lookupMap) => {
  if (!(lookupMap instanceof Map) || lookupMap.size === 0) return null;

  const keys = buildLookupKeys(
    tx?.sourceId,
    tx?.reference,
    tx?.referenceId,
    tx?.orderId,
    tx?.depositId,
    tx?.topupId,
    tx?.id,
    tx?._id
  );

  for (const key of keys) {
    const match = lookupMap.get(key);
    if (match) return match;
  }

  return null;
};

const buildOrderLookupMap = (items = []) => {
  const map = new Map();

  (Array.isArray(items) ? items : []).forEach((order) => {
    buildLookupKeys(
      order?.id,
      order?.orderNumber,
      order?.internalOrderNumber,
      order?.siteOrderNumber,
      order?.externalOrderId,
      order?.supplierOrderNumber
    ).forEach((key) => {
      if (!map.has(key)) map.set(key, order);
    });
  });

  return map;
};

const buildTopupLookupMap = (items = []) => {
  const map = new Map();

  (Array.isArray(items) ? items : []).forEach((topup) => {
    buildLookupKeys(
      topup?.id,
      topup?._id,
      topup?.reference,
      topup?.referenceId
    ).forEach((key) => {
      if (!map.has(key)) map.set(key, topup);
    });
  });

  return map;
};

const hasTextOverlap = (left, right) => Boolean(left && right && (
  left === right
  || left.includes(right)
  || right.includes(left)
));

const findBestRecordByAmountAndDate = (tx, records = [], {
  getAmount,
  getDate,
  getText,
}) => {
  const txAmount = Math.abs(toFiniteNumber(tx?.amount ?? tx?.value ?? tx?.signedAmount));
  if (txAmount <= 0) return null;

  const txDate = toTimestamp(tx?.createdAt || tx?.date);
  const txText = normalizeMatchText(tx?.description || tx?.note || tx?.reference || '');
  let bestRecord = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  (Array.isArray(records) ? records : []).forEach((record) => {
    const recordAmount = Math.abs(toFiniteNumber(getAmount(record)));
    const amountDiff = Math.abs(recordAmount - txAmount);
    if (amountDiff > 0.01) return;

    const recordDate = toTimestamp(getDate(record));
    const timeDiff = txDate && recordDate ? Math.abs(recordDate - txDate) : Number.MAX_SAFE_INTEGER;
    const recordText = normalizeMatchText(getText(record));
    const textMatched = hasTextOverlap(txText, recordText);

    if (!textMatched && timeDiff > 24 * 60 * 60 * 1000) {
      return;
    }

    const score = (textMatched ? 1_000_000_000 : 0) - timeDiff - (amountDiff * 1000);
    if (score > bestScore) {
      bestScore = score;
      bestRecord = record;
    }
  });

  return bestRecord;
};

const normalizeWalletTransactionType = (value) => {
  const token = String(value || '').trim().toLowerCase();

  if (['credit', 'deposit', 'topup', 'top_up'].includes(token)) {
    return 'deposit';
  }

  if (['debit', 'purchase', 'charge', 'deduct', 'deduction'].includes(token)) {
    return 'purchase';
  }

  if (['refund', 'reversal'].includes(token)) {
    return 'transfer';
  }

  if (['withdrawal', 'withdraw'].includes(token)) {
    return 'withdrawal';
  }

  return 'deposit';
};

const normalizeWalletStatus = (value) => {
  const token = String(value || '').trim().toLowerCase();

  if (['completed', 'approved', 'success'].includes(token)) {
    return 'completed';
  }

  if (['pending', 'processing', 'requested', 'under_review', 'queued'].includes(token)) {
    return 'pending';
  }

  if (['failed', 'rejected', 'denied', 'cancelled', 'canceled', 'refunded'].includes(token)) {
    return 'failed';
  }

  return 'completed';
};

const buildTransactionDedupKey = (transaction = {}) => {
  const amount = Math.abs(toFiniteNumber(transaction?.amount));
  const normalizedDate = String(transaction?.date || '').trim();
  const normalizedReference = String(
    transaction?.reference
    || transaction?.referenceId
    || transaction?.sourceId
    || transaction?.id
    || ''
  ).trim().toLowerCase();

  if (normalizedReference) {
    return `${transaction?.type || 'tx'}:${normalizedReference}:${amount}`;
  }

  return `${transaction?.type || 'tx'}:${amount}:${normalizedDate}:${normalizeLookupKey(transaction?.description)}`;
};

const mergeTransactions = (...groups) => {
  const seen = new Set();
  const merged = [];

  groups.flat().forEach((transaction) => {
    if (!transaction) return;
    const key = buildTransactionDedupKey(transaction);
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(transaction);
  });

  return merged.sort(sortTransactionsByNewest);
};

const Wallet = () => {
  const { dir } = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, refreshProfile, isAuthenticated } = useAuthStore();
  const { currencies, loadCurrencies } = useSystemStore();
  const userId = user?.id;
  const userCurrency = String(user?.currency || 'USD').toUpperCase();
  const balance = normalizeMoneyAmount(user?.coins || 0);

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

  const usdEquivalent = currencyRate > 0 ? normalizeMoneyAmount(balance / currencyRate) : balance;

  const [walletStats, setWalletStats] = useState(null);

  // Fetch real wallet stats from BE aggregation
  useEffect(() => {
    if (!isAuthenticated || !userId) {
      setWalletStats(null);
      return undefined;
    }

    let isActive = true;
    const request = apiClient.wallet?.getStats?.();

    if (!request || typeof request.then !== 'function') {
      if (isActive) setWalletStats(null);
      return () => {
        isActive = false;
      };
    }

    request
      .then((data) => {
        if (isActive) setWalletStats(data);
      })
      .catch(() => {
        if (isActive) setWalletStats(null);
      }); // graceful fallback

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, userId]);

  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(true);

  const stats = useMemo(
    () => ({
      totalDeposits: formatWalletAmount(
        walletStats?.totalDeposits
        ?? transactions.reduce((sum, tx) => (tx.amount > 0 ? sum + Math.abs(tx.amount) : sum), 0),
        userCurrency
      ),
      totalSpent: formatWalletAmount(
        walletStats?.totalSpent
        ?? Math.abs(transactions.reduce((sum, tx) => (tx.amount < 0 ? sum + tx.amount : sum), 0)),
        userCurrency
      ),
      netBalance: formatWalletAmount(walletStats?.netBalance ?? balance, userCurrency),
      totalTransactions: formatWalletNumber(walletStats?.totalTransactions ?? transactions.length),
    }),
    [balance, transactions, userCurrency, walletStats]
  );

  // Fetch real transactions from BE
  useEffect(() => {
    if (!isAuthenticated || !userId) {
      setTransactions([]);
      setTxLoading(false);
      return undefined;
    }

    let isActive = true;

    const fetchTransactions = async () => {
      setTxLoading(true);
      try {
        const [transactionsResult, ordersResult, topupsResult] = await Promise.allSettled([
          apiClient.wallet?.getTransactions?.(),
          apiClient.orders?.list?.(userId),
          apiClient.topups?.list?.(),
        ]);
        const res = transactionsResult.status === 'fulfilled' ? transactionsResult.value : [];
        const items = Array.isArray(res) ? res : (res?.transactions || res?.data || []);
        const relatedOrders = ordersResult.status === 'fulfilled'
          ? (Array.isArray(ordersResult.value) ? ordersResult.value : [])
          : [];
        const relatedTopups = topupsResult.status === 'fulfilled'
          ? (Array.isArray(topupsResult.value) ? topupsResult.value : []).filter(
              (entry) => String(entry?.userId || '') === String(userId || '')
            )
          : [];
        const orderLookup = buildOrderLookupMap(relatedOrders);
        const topupLookup = buildTopupLookupMap(relatedTopups);
        const mapped = items.map((tx) => {
          const feType = normalizeWalletTransactionType(tx.type || tx.kind || tx.transactionType);
          const rawAmount = Number(tx.amount ?? tx.value ?? 0);
          const signedAmount = tx.signedAmount !== undefined && tx.signedAmount !== null
            ? Number(tx.signedAmount)
            : (feType === 'purchase' || feType === 'withdrawal'
              ? -Math.abs(rawAmount)
              : Math.abs(rawAmount));
          const linkedOrder = tx.order
            || findLinkedRecord(tx, orderLookup)
            || findBestRecordByAmountAndDate(tx, relatedOrders, {
              getAmount: (record) => (
                record?.financialSnapshot?.finalAmountAtExecution
                ?? record?.priceCoins
                ?? record?.totalAmount
                ?? 0
              ),
              getDate: (record) => record?.createdAt || record?.date,
              getText: (record) => record?.productNameAr || record?.productName || record?.notes || '',
            });
          const linkedTopup = tx.topup
            || findLinkedRecord(tx, topupLookup)
            || findBestRecordByAmountAndDate(tx, relatedTopups, {
              getAmount: (record) => (
                record?.actualPaidAmount
                ?? record?.requestedAmount
                ?? record?.amount
                ?? 0
              ),
              getDate: (record) => record?.createdAt || record?.date,
              getText: (record) => record?.paymentChannel || record?.method || '',
            });
          const enrichedTx = {
            ...tx,
            ...(linkedOrder ? { order: linkedOrder } : {}),
            ...(linkedTopup ? { topup: linkedTopup } : {}),
          };

          return {
            id: tx._id || tx.id,
            type: feType,
            description: tx.description || feType,
            amount: signedAmount,
            currency: resolveWalletTransactionExecutionCurrency(enrichedTx, userCurrency),
            originalCurrency: resolveWalletTransactionOriginalCurrency(enrichedTx) || null,
            currentCurrency: userCurrency,
            status: normalizeWalletStatus(tx.status || 'completed'),
            date: tx.createdAt || tx.date,
            reference: (() => {
              const raw = tx.reference || tx.referenceId || tx.orderId || tx.depositId || tx.topupId || null;
              if (raw === null || raw === undefined) return null;
              if (typeof raw === 'string' || typeof raw === 'number') return String(raw);
              if (typeof raw === 'object') {
                const picked = raw?.reference || raw?.referenceId || raw?.orderNumber || raw?.siteOrderNumber || raw?._id || raw?.id || '';
                return picked ? String(picked) : null;
              }
              return String(raw);
            })(),
          };
        });
        const fallbackTransactions = mergeTransactions(
          relatedTopups.map((topup) => ({
            id: `topup-${topup?.id || topup?._id || Math.random()}`,
            type: 'deposit',
            description: topup?.paymentChannel || topup?.method || t('wallet.typeDeposit', { defaultValue: 'Deposit' }),
            amount: Math.abs(toFiniteNumber(
              topup?.actualPaidAmount
              ?? topup?.requestedAmount
              ?? topup?.amount
              ?? 0
            )),
            currency: resolveTopupExecutionCurrency(topup, userCurrency),
            originalCurrency: resolveTopupExecutionCurrency(topup, userCurrency),
            currentCurrency: userCurrency,
            status: normalizeWalletStatus(topup?.status || 'completed'),
            date: topup?.createdAt || topup?.date,
            reference: topup?.id || topup?._id || null,
          })),
          relatedOrders.map((order) => ({
            id: `order-${order?.id || order?._id || Math.random()}`,
            type: 'purchase',
            description: order?.productNameAr || order?.productName || order?.productId || t('wallet.typePurchase', { defaultValue: 'Purchase' }),
            amount: -Math.abs(toFiniteNumber(
              order?.financialSnapshot?.finalAmountAtExecution
              ?? order?.priceCoins
              ?? order?.totalAmount
              ?? 0
            )),
            currency: resolveOrderExecutionCurrency(order, userCurrency),
            originalCurrency: resolveOrderExecutionCurrency(order, userCurrency),
            currentCurrency: userCurrency,
            status: normalizeWalletStatus(order?.status || 'completed'),
            date: order?.createdAt || order?.date,
            reference: order?.siteOrderNumber || order?.orderNumber || order?.id || null,
          }))
        );

        if (isActive) {
          setTransactions(mergeTransactions(mapped, fallbackTransactions));
        }
      } catch {
        if (isActive) setTransactions([]);
      } finally {
        if (isActive) setTxLoading(false);
      }
    };
    fetchTransactions();

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, userCurrency, userId]);

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
      <div className="mx-auto max-w-7xl px-4 py-5 sm:py-6">
        <div className="mb-6 sm:mb-7">
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
          className="mb-4"
        >
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">{t('wallet.recentTransactions')}</h2>
        </motion.div>

        <FilterBar onFilterChange={handleFilterChange} />

        {txLoading ? (
          <div className="rounded-[1.2rem] border border-[color:rgb(var(--color-border-rgb)/0.82)] bg-[color:rgb(var(--color-card-rgb)/0.76)]">
            <Loader />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <EmptyTransactions onAddBalance={handleAddBalance} />
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction, index) => (
              <TransactionCard key={transaction.id} transaction={transaction} index={index} />
            ))}
          </div>
        )}

        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleAddBalance}
          className="sidebar-wallet-shimmer fixed bottom-5 left-5 z-50 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[#d3b171]/70 bg-[linear-gradient(145deg,rgba(93,72,33,0.2),rgba(246,215,148,0.78)_42%,rgba(255,251,236,0.98)_100%)] text-[#8c631f] shadow-[0_18px_28px_-18px_rgba(125,92,33,0.92)] transition-all before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_right,rgba(255,243,200,0.58),transparent_48%)] before:opacity-85 hover:-translate-y-0.5 hover:brightness-[1.03] sm:h-14 sm:w-14"
          aria-label={t('wallet.addBalance')}
        >
          <Plus className="relative z-10 h-5 w-5 drop-shadow-[0_1px_0_rgba(255,255,255,0.35)] sm:h-6 sm:w-6" />
        </motion.button>
      </div>
    </div>
  );
};

export default Wallet;
