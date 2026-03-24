import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  DollarSign,
  Gamepad2,
  Package,
  ShieldCheck,
  ShoppingCart,
  TrendingUp,
  UserCog,
  Users,
  Wallet,
  Building2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useAdminStore from '../store/useAdminStore';
import useOrderStore from '../store/useOrderStore';
import useTopupStore from '../store/useTopupStore';
import useMediaStore from '../store/useMediaStore';
import useSystemStore from '../store/useSystemStore';
import apiClient from '../services/client';
import DashboardHeader from '../components/admin-dashboard/DashboardHeader';
import StatsGrid from '../components/admin-dashboard/StatsGrid';
import PendingApprovalsSection from '../components/admin-dashboard/PendingApprovalsSection';
import RecentOrdersSection from '../components/admin-dashboard/RecentOrdersSection';
import ManualTopupsSection from '../components/admin-dashboard/ManualTopupsSection';
import QuickActionsSection from '../components/admin-dashboard/QuickActionsSection';
import ActivityFeedSection from '../components/admin-dashboard/ActivityFeedSection';
import SupplierBalancesSection from '../components/admin-dashboard/SupplierBalancesSection';
import DashboardDateRangeFilter from '../components/admin-dashboard/DashboardDateRangeFilter';
import OrderDetailsDrawer from '../components/orders/OrderDetailsDrawer';
import Card from '../components/ui/Card';
import { formatDateTime, formatNumber, getNumericLocale } from '../utils/intl';
import { enrichOrders } from '../utils/orders';
import { getUserRegistrationDate, isApprovedAccountStatus, isPendingAccountStatus } from '../utils/accountStatus';

const PENDING_STATUSES = ['pending', 'requested', 'under_review', 'processing'];
const COMPLETED_STATUSES = ['completed', 'approved', 'success'];
const REJECTED_STATUSES = ['rejected', 'denied', 'cancelled', 'canceled'];
const DASHBOARD_DEFAULT_RANGE_DAYS = 30;

const asNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const byNewestDate = (left, right) => (
  new Date(right?.createdAt || right?.updatedAt || 0) - new Date(left?.createdAt || left?.updatedAt || 0)
);

const normalizeStatus = (status) => String(status || '').trim().toLowerCase();

const isPendingStatus = (status) => PENDING_STATUSES.includes(normalizeStatus(status));
const isCompletedStatus = (status) => COMPLETED_STATUSES.includes(normalizeStatus(status));
const isRejectedStatus = (status) => REJECTED_STATUSES.includes(normalizeStatus(status));
const isManualTopup = (topup) => String(topup?.type || '').trim().toLowerCase() !== 'game_topup';

const shiftDateByDays = (inputDate, days) => {
  const nextDate = new Date(inputDate);
  nextDate.setHours(0, 0, 0, 0);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const toDateInputValue = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateInputValue = (value) => {
  const [year, month, day] = String(value || '').split('-').map(Number);
  if (!year || !month || !day) return null;
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getDateRangeBoundary = (value, { endOfDay = false } = {}) => {
  const parsed = parseDateInputValue(value);
  if (!parsed) return null;
  if (endOfDay) {
    parsed.setHours(23, 59, 59, 999);
  } else {
    parsed.setHours(0, 0, 0, 0);
  }
  return parsed;
};

const isDateWithinRange = (value, { startDate, endDate }) => {
  const hasRange = Boolean(startDate || endDate);
  if (!hasRange) return true;
  if (!value) return false;

  const itemDate = new Date(value);
  if (Number.isNaN(itemDate.getTime())) return false;

  const startBoundary = getDateRangeBoundary(startDate);
  const endBoundary = getDateRangeBoundary(endDate, { endOfDay: true });

  if (startBoundary && itemDate < startBoundary) return false;
  if (endBoundary && itemDate > endBoundary) return false;
  return true;
};

const getOrderDashboardDate = (order) => (
  order?.createdAt
  || order?.date
  || order?.updatedAt
  || null
);

const getTopupDashboardDate = (topup) => (
  topup?.createdAt
  || topup?.updatedAt
  || topup?.reviewedAt
  || null
);

const getProductDashboardDate = (product) => (
  product?.createdAt
  || product?.updatedAt
  || product?.publishedAt
  || product?.syncedAt
  || null
);

const getSnapshotCurrency = (snapshot = {}, fallbackCurrency = 'USD') => String(
  snapshot?.pricingSnapshot?.currency
  || snapshot?.originalCurrency
  || fallbackCurrency
  || 'USD'
).trim().toUpperCase();

const getOrderRevenueUsd = (order) => {
  const explicitRevenueUsd = order?.usdAmount
    ?? order?.totalRevenueUsd
    ?? order?.financialSnapshot?.usdAmount
    ?? order?.financialSnapshot?.pricingSnapshot?.usdAmount;

  if (explicitRevenueUsd !== undefined && explicitRevenueUsd !== null) {
    return asNumber(explicitRevenueUsd);
  }

  const snapshot = order?.financialSnapshot || {};
  const revenueAmount = asNumber(
    snapshot?.pricingSnapshot?.finalPrice
    ?? snapshot?.finalAmountAtExecution
    ?? order?.priceCoins
    ?? order?.totalAmount
  );
  const currency = getSnapshotCurrency(snapshot, order?.currency);
  const exchangeRate = asNumber(snapshot?.exchangeRateAtExecution || order?.rateSnapshot);

  if (currency === 'USD') return revenueAmount;
  if (exchangeRate > 0) return revenueAmount / exchangeRate;
  return revenueAmount;
};

const getOrderProfitUsd = (order) => {
  const explicitProfitUsd = order?.profitUsd ?? order?.financialSnapshot?.profitUsd;
  if (explicitProfitUsd !== undefined && explicitProfitUsd !== null) {
    return asNumber(explicitProfitUsd);
  }

  const snapshot = order?.financialSnapshot || {};
  const finalPrice = asNumber(
    snapshot?.pricingSnapshot?.finalPrice
    ?? snapshot?.finalAmountAtExecution
    ?? order?.priceCoins
    ?? order?.totalAmount
  );
  const basePrice = asNumber(
    snapshot?.pricingSnapshot?.basePrice
    ?? snapshot?.originalAmount
    ?? order?.unitPriceBase
  );
  const profitAmount = finalPrice - basePrice;
  const currency = getSnapshotCurrency(snapshot, order?.currency);
  const exchangeRate = asNumber(snapshot?.exchangeRateAtExecution || order?.rateSnapshot);

  if (currency === 'USD') return profitAmount;
  if (exchangeRate > 0) return profitAmount / exchangeRate;
  return profitAmount;
};

const formatRelativeProductName = (product, isArabic) => (
  product?.nameAr || product?.name || (isArabic ? 'منتج غير معروف' : 'Unknown product')
);

const getCurrencyRate = (currencies, currencyCode) => {
  const normalizedCode = String(currencyCode || 'USD').trim().toUpperCase();
  const matchedCurrency = (currencies || []).find(
    (entry) => String(entry?.code || '').trim().toUpperCase() === normalizedCode
  );
  return asNumber(matchedCurrency?.rate) || 1;
};

const extractSupplierBalanceSnapshot = (payload = {}) => {
  const raw = payload || {};
  const balanceNode = raw?.balance;
  const innerData = (typeof balanceNode === 'object' && balanceNode !== null) ? balanceNode : {};
  const deepData = (typeof innerData?.data === 'object' && innerData.data !== null) ? innerData.data : {};
  const balanceCandidate = (
    deepData?.user_balance
    ?? innerData?.balance
    ?? innerData?.user_balance
    ?? innerData?.remains
    ?? innerData?.credits
    ?? raw?.user_balance
    ?? raw?.availableBalance
    ?? raw?.remains
    ?? raw?.credits
    ?? (typeof balanceNode !== 'object' ? balanceNode : null)
  );
  const parsedBalance = Number(balanceCandidate);

  return {
    balance: Number.isFinite(parsedBalance) ? parsedBalance : null,
    rawBalance: balanceCandidate ?? null,
    currency: String(
      deepData?.user_currency
      ?? innerData?.currency
      ?? innerData?.user_currency
      ?? raw?.currency
      ?? raw?.balanceCurrency
      ?? ''
    ).trim().toUpperCase(),
  };
};

const getDefaultDashboardRange = () => {
  const today = shiftDateByDays(new Date(), 0);
  return {
    startDate: toDateInputValue(shiftDateByDays(today, -(DASHBOARD_DEFAULT_RANGE_DAYS - 1))),
    endDate: toDateInputValue(today),
  };
};

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const { users, loadUsers } = useAdminStore();
  const {
    orders,
    loadOrders,
    getOrderById,
    updateOrderStatus,
    syncOrderSupplierStatus,
  } = useOrderStore();
  const { topups, loadTopups, updateTopupStatus } = useTopupStore();
  const { products, categories, loadProducts } = useMediaStore();
  const { currencies, loadCurrencies } = useSystemStore();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => getDefaultDashboardRange().startDate);
  const [endDate, setEndDate] = useState(() => getDefaultDashboardRange().endDate);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false);
  const [loadingOrderActionId, setLoadingOrderActionId] = useState('');
  const [syncingOrderId, setSyncingOrderId] = useState('');
  const [approvingTopupId, setApprovingTopupId] = useState('');
  const [supplierBalances, setSupplierBalances] = useState([]);
  const [isLoadingSupplierBalances, setIsLoadingSupplierBalances] = useState(false);

  const isArabic = String(i18n.resolvedLanguage || i18n.language || 'ar').toLowerCase().startsWith('ar');
  const locale = getNumericLocale(isArabic ? 'ar-EG' : 'en-US');
  const todayInputValue = useMemo(() => toDateInputValue(new Date()), []);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      setIsLoading(true);

      await Promise.allSettled([
        Promise.resolve(loadUsers()),
        Promise.resolve(loadOrders()),
        Promise.resolve(loadTopups()),
        Promise.resolve(loadProducts()),
        Promise.resolve(loadCurrencies?.()),
      ]);

      if (isMounted) {
        setIsLoading(false);
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [loadCurrencies, loadOrders, loadProducts, loadTopups, loadUsers]);

  useEffect(() => {
    let isMounted = true;

    const loadSupplierBalances = async () => {
      setIsLoadingSupplierBalances(true);

      try {
        const suppliers = await apiClient.suppliers.list();
        const rows = Array.isArray(suppliers) ? suppliers : [];
        const results = await Promise.allSettled(
          rows.map((supplier) => apiClient.suppliers.getBalance(supplier.id))
        );

        if (!isMounted) return;

        const nextBalances = rows
          .map((supplier, index) => {
            const result = results[index];
            const snapshot = result?.status === 'fulfilled'
              ? extractSupplierBalanceSnapshot(result.value)
              : { balance: null, rawBalance: null, currency: '' };

            return {
              id: supplier.id,
              supplierName: supplier.supplierName || supplier.name || supplier.id,
              supplierCode: supplier.supplierCode || '',
              isActive: supplier.isActive !== false,
              balance: snapshot.balance,
              rawBalance: snapshot.rawBalance,
              currency: snapshot.currency,
            };
          })
          .sort((left, right) => {
            if (left.isActive !== right.isActive) return left.isActive ? -1 : 1;
            return String(left.supplierName || '').localeCompare(String(right.supplierName || ''), locale);
          });

        setSupplierBalances(nextBalances);
      } catch (_error) {
        if (!isMounted) return;
        setSupplierBalances([]);
      } finally {
        if (isMounted) {
          setIsLoadingSupplierBalances(false);
        }
      }
    };

    void loadSupplierBalances();

    return () => {
      isMounted = false;
    };
  }, [locale]);

  const applyDateRangeSelection = (nextStartDate, nextEndDate = nextStartDate) => {
    const normalizedStartDate = nextStartDate || '';
    const normalizedEndDate = nextEndDate || '';

    if (!normalizedStartDate && !normalizedEndDate) {
      setStartDate('');
      setEndDate('');
      return;
    }

    let orderedStartDate = normalizedStartDate;
    let orderedEndDate = normalizedEndDate || normalizedStartDate;

    if (orderedStartDate && orderedEndDate && orderedStartDate > orderedEndDate) {
      [orderedStartDate, orderedEndDate] = [orderedEndDate, orderedStartDate];
    }

    setStartDate(orderedStartDate);
    setEndDate(orderedEndDate);
  };

  const isSingleDayView = Boolean(startDate && endDate && startDate === endDate);

  const dateRange = useMemo(
    () => ({
      startDate: startDate || null,
      endDate: endDate || null,
    }),
    [endDate, startDate]
  );

  const filteredUsers = useMemo(
    () => (users || []).filter((entry) => isDateWithinRange(getUserRegistrationDate(entry), dateRange)),
    [dateRange, users]
  );

  const customerUsers = useMemo(
    () => filteredUsers.filter((entry) => String(entry?.role || '').trim().toLowerCase() === 'customer'),
    [filteredUsers]
  );

  const activeUsers = useMemo(
    () => customerUsers.filter((entry) => isApprovedAccountStatus(entry?.status)),
    [customerUsers]
  );

  const pendingApprovalUsers = useMemo(
    () => [...customerUsers]
      .filter((entry) => isPendingAccountStatus(entry?.status))
      .sort((left, right) => new Date(getUserRegistrationDate(right) || 0) - new Date(getUserRegistrationDate(left) || 0)),
    [customerUsers]
  );

  const enrichedOrders = useMemo(
    () => enrichOrders(orders, { users, products, language: isArabic ? 'ar' : 'en' }),
    [isArabic, orders, products, users]
  );

  const filteredOrders = useMemo(
    () => enrichedOrders.filter((entry) => isDateWithinRange(getOrderDashboardDate(entry), dateRange)),
    [dateRange, enrichedOrders]
  );

  const completedOrders = useMemo(
    () => filteredOrders.filter((entry) => isCompletedStatus(entry?.status)),
    [filteredOrders]
  );

  const pendingOrders = useMemo(
    () => filteredOrders.filter((entry) => isPendingStatus(entry?.status)),
    [filteredOrders]
  );

  const manualTopups = useMemo(
    () => (topups || []).filter((entry) => isManualTopup(entry)),
    [topups]
  );

  const filteredManualTopups = useMemo(
    () => manualTopups.filter((entry) => isDateWithinRange(getTopupDashboardDate(entry), dateRange)),
    [dateRange, manualTopups]
  );

  const pendingManualTopups = useMemo(
    () => filteredManualTopups.filter((entry) => isPendingStatus(entry?.status)),
    [filteredManualTopups]
  );

  const hasProductDateMetadata = useMemo(
    () => (products || []).some((entry) => Boolean(getProductDashboardDate(entry))),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const items = Array.isArray(products) ? products : [];
    if (!hasProductDateMetadata) return items;
    return items.filter((entry) => isDateWithinRange(getProductDashboardDate(entry), dateRange));
  }, [dateRange, hasProductDateMetadata, products]);

  const recentOrders = useMemo(
    () => [...filteredOrders].sort(byNewestDate).slice(0, 6),
    [filteredOrders]
  );

  const selectedOrder = useMemo(
    () => filteredOrders.find((entry) => entry.id === selectedOrderId)
      || enrichedOrders.find((entry) => entry.id === selectedOrderId)
      || null,
    [enrichedOrders, filteredOrders, selectedOrderId]
  );

  const recentManualTopups = useMemo(
    () => [...filteredManualTopups].sort(byNewestDate).slice(0, 6),
    [filteredManualTopups]
  );

  const totalRevenueUsd = useMemo(
    () => completedOrders.reduce((sum, entry) => sum + getOrderRevenueUsd(entry), 0),
    [completedOrders]
  );

  const totalProfitUsd = useMemo(
    () => completedOrders.reduce((sum, entry) => sum + getOrderProfitUsd(entry), 0),
    [completedOrders]
  );

  const totalWalletBalanceUsd = useMemo(
    () => customerUsers.reduce((sum, entry) => {
      const balance = asNumber(entry?.coins);
      const currencyRate = getCurrencyRate(currencies, entry?.currency);
      const usdEquivalent = currencyRate > 0 ? balance / currencyRate : balance;
      return sum + usdEquivalent;
    }, 0),
    [currencies, customerUsers]
  );

  const formatCount = (value) => formatNumber(asNumber(value), locale);
  const formatCoins = (value) => `${formatCount(value)} ${isArabic ? 'عملة' : 'coins'}`;
  const formatMoney = (value, currencyCode = 'USD') => {
    const currency = String(currencyCode || 'USD').toUpperCase();
    const amount = asNumber(value);

    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        numberingSystem: 'latn',
        maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
      }).format(amount);
    } catch (_error) {
      return `${formatCount(amount)} ${currency}`;
    }
  };

  const formatSupplierBalance = (entry) => {
    if (Number.isFinite(entry?.balance)) {
      const formatted = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
        numberingSystem: 'latn',
      }).format(entry.balance);

      return entry?.currency ? `${formatted} ${entry.currency}` : formatted;
    }

    if (entry?.rawBalance !== undefined && entry?.rawBalance !== null && String(entry.rawBalance).trim()) {
      return String(entry.rawBalance);
    }

    return isArabic ? 'غير متاح' : 'Unavailable';
  };

  const formatDate = (value) => {
    if (!value) {
      return isArabic ? 'غير متوفر' : 'Unavailable';
    }

    return formatDateTime(value, locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const currentDateLabel = useMemo(
    () => formatDateTime(new Date(), locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    [locale]
  );

  const formatRangeDate = (value) => {
    const parsed = parseDateInputValue(value);
    if (!parsed) {
      return isArabic ? 'غير محدد' : 'Not set';
    }

    return formatDateTime(parsed, locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const selectedRangeLabel = (() => {
    if (isSingleDayView && startDate) {
      return isArabic
        ? `عرض النتائج ليوم ${formatRangeDate(startDate)}`
        : `Showing results for ${formatRangeDate(startDate)}`;
    }

    if (startDate && endDate) {
      return isArabic
        ? `عرض النتائج من ${formatRangeDate(startDate)} إلى ${formatRangeDate(endDate)}`
        : `Showing results from ${formatRangeDate(startDate)} to ${formatRangeDate(endDate)}`;
    }

    if (startDate) {
      return isArabic
        ? `عرض النتائج بدءًا من ${formatRangeDate(startDate)}`
        : `Showing results starting from ${formatRangeDate(startDate)}`;
    }

    if (endDate) {
      return isArabic
        ? `عرض النتائج حتى ${formatRangeDate(endDate)}`
        : `Showing results up to ${formatRangeDate(endDate)}`;
    }

    return isArabic ? 'عرض كل البيانات المتاحة' : 'Showing all available data';
  })();

  const productMetricNote = hasProductDateMetadata
    ? (
      isArabic
        ? 'بحسب تاريخ إنشاء أو تحديث المنتج داخل الفترة المحددة'
        : 'Based on product create or update date within the selected range'
    )
    : (
      isArabic
        ? 'إجمالي المنتجات الحالية لأن السجلات لا تحتوي على طابع زمني كافٍ'
        : 'Current catalog total because product timestamps are unavailable'
    );

  const walletMetricNote = isArabic
    ? 'إجمالي أرصدة العملاء الحالية بالدولار حسب عملة كل عميل وسعر الصرف الحالي'
    : 'Current customer wallet balances converted to USD using each user currency and the current exchange rate';

  const supplierBalanceItems = useMemo(
    () => supplierBalances.map((entry) => ({
      ...entry,
      balanceLabel: formatSupplierBalance(entry),
    })),
    [isArabic, locale, supplierBalances]
  );

  const quickActions = useMemo(
    () => [
      {
        label: isArabic ? 'المتجر' : 'Store',
        description: isArabic
          ? 'فتح واجهة المتجر كما يراها العميل لمراجعة تجربة التصفح والشراء.'
          : 'Open the storefront exactly as customers see it to review browsing and purchase flow.',
        to: '/products',
        icon: Gamepad2,
      },
      {
        label: isArabic ? 'إضافة منتج جديد' : 'Add Product',
        description: isArabic
          ? 'إنشاء منتج جديد وربطه بالمورد أو التسعير الداخلي.'
          : 'Create a new product and connect it to supplier or local pricing.',
        to: '/admin/products',
        icon: Package,
      },
      {
        label: isArabic ? 'إضافة وسيلة دفع' : 'Add Payment Method',
        description: isArabic
          ? 'تحديث قنوات الدفع لتسهيل استقبال طلبات الشحن.'
          : 'Update payment channels for smoother topup collection.',
        to: '/admin/payment-methods',
        icon: CreditCard,
      },
      {
        label: isArabic ? 'إدارة الطلبات' : 'Manage Orders',
        description: isArabic
          ? 'مراجعة الطلبات الأخيرة ومتابعة حالتها التشغيلية.'
          : 'Review recent purchases and follow their operational status.',
        to: '/admin/orders',
        icon: ShoppingCart,
      },
      {
        label: isArabic ? 'إدارة المستخدمين' : 'Manage Users',
        description: isArabic
          ? 'مراجعة الحسابات والحالات والصلاحيات من مكان واحد.'
          : 'Review accounts, statuses, and permissions from one place.',
        to: '/admin/users',
        icon: Users,
      },
      {
        label: isArabic ? 'إدارة الموردين' : 'Manage Suppliers',
        description: isArabic
          ? 'تنظيم ربط الموردين ومتابعة التكاملات الخارجية.'
          : 'Organize suppliers and monitor external integrations.',
        to: '/admin/suppliers',
        icon: Building2,
      },
      {
        label: isArabic ? 'مراجعة طلبات الشحن' : 'Review Topups',
        description: isArabic
          ? 'الوصول السريع إلى طلبات الشحن اليدوي المعلقة.'
          : 'Jump straight into pending manual topup reviews.',
        to: '/admin/payments',
        icon: ArrowLeftRight,
      },
    ],
    [isArabic]
  );

  const stats = useMemo(
    () => [
      {
        title: isArabic ? 'صافي الأرباح (USD)' : 'Net Profit (USD)',
        value: formatMoney(totalProfitUsd, 'USD'),
        note: isArabic ? 'الأرباح من الطلبات المكتملة داخل الفترة المحددة' : 'Profit from completed orders in the selected range',
        icon: DollarSign,
      },
      {
        title: isArabic ? 'إجمالي الإيرادات (USD)' : 'Total Revenue (USD)',
        value: formatMoney(totalRevenueUsd, 'USD'),
        note: isArabic ? 'الإيرادات من الطلبات المكتملة داخل الفترة المحددة' : 'Revenue from completed orders in the selected range',
        icon: TrendingUp,
      },
      {
        title: isArabic ? 'إجمالي الطلبات' : 'Total Orders',
        value: formatCount(filteredOrders.length),
        note: isArabic ? 'كل الطلبات المطابقة للفترة الحالية' : 'All orders matching the current date range',
        icon: ShoppingCart,
      },
      {
        title: isArabic ? 'إجمالي المستخدمين' : 'Total Users',
        value: formatCount(filteredUsers.length),
        note: isArabic ? `${formatCount(activeUsers.length)} مستخدم مفعّل داخل الفترة` : `${formatCount(activeUsers.length)} approved users in range`,
        icon: Users,
      },
      {
        title: isArabic ? 'حسابات بانتظار التفعيل' : 'Pending account approvals',
        value: formatCount(pendingApprovalUsers.length),
        note: isArabic ? 'حسابات جديدة ما زالت بانتظار المراجعة' : 'New accounts still waiting for review',
        icon: UserCog,
      },
      {
        title: isArabic ? 'إجمالي المنتجات' : 'Total Products',
        value: formatCount(filteredProducts.length),
        note: productMetricNote,
        icon: Package,
      },
      {
        title: isArabic ? 'الطلبات المعلقة' : 'Pending Orders',
        value: formatCount(pendingOrders.length),
        note: isArabic ? 'طلبات تحتاج متابعة داخل الفترة الحالية' : 'Orders that still need follow-up in the current range',
        icon: Clock3,
      },
      {
        title: isArabic ? 'الطلبات المكتملة' : 'Completed Orders',
        value: formatCount(completedOrders.length),
        note: isArabic ? 'طلبات تم تنفيذها داخل الفترة المحددة' : 'Orders fulfilled inside the selected range',
        icon: CheckCircle2,
      },
      {
        title: isArabic ? 'طلبات الشحن اليدوي المعلقة' : 'Pending Manual Topups',
        value: formatCount(pendingManualTopups.length),
        note: isArabic ? 'طلبات شحن يدوي بانتظار المراجعة في الفترة الحالية' : 'Manual topup requests awaiting review in the current range',
        icon: ShieldCheck,
      },
      {
        title: isArabic ? 'إجمالي أرصدة المحافظ (USD)' : 'Total Wallet Balances (USD)',
        value: formatMoney(totalWalletBalanceUsd, 'USD'),
        note: walletMetricNote,
        icon: Wallet,
      },
    ],
    [
      activeUsers.length,
      completedOrders.length,
      filteredOrders.length,
      filteredProducts.length,
      filteredUsers.length,
      formatCount,
      formatMoney,
      isArabic,
      pendingApprovalUsers.length,
      pendingManualTopups.length,
      pendingOrders.length,
      productMetricNote,
      totalProfitUsd,
      totalRevenueUsd,
      totalWalletBalanceUsd,
      walletMetricNote,
    ]
  );

  const activityItems = useMemo(() => {
    const items = [];
    const newestCompletedOrder = [...completedOrders].sort(byNewestDate)[0];
    const newestPendingTopup = [...pendingManualTopups].sort(byNewestDate)[0];
    const newestRejectedOrder = [...filteredOrders.filter((entry) => isRejectedStatus(entry?.status))].sort(byNewestDate)[0];
    const newestProduct = [...filteredProducts].sort(byNewestDate)[0];

    if (newestCompletedOrder) {
      items.push({
        id: `completed-order-${newestCompletedOrder.id}`,
        icon: CheckCircle2,
        tone: 'success',
        status: newestCompletedOrder.status,
        title: isArabic ? 'اكتمل طلب جديد' : 'New order completed',
        description: isArabic
          ? `${newestCompletedOrder.userName || newestCompletedOrder.userId || 'عميل'} أنهى طلب ${newestCompletedOrder.productName || newestCompletedOrder.productId || ''}.`
          : `${newestCompletedOrder.userName || newestCompletedOrder.userId || 'A customer'} completed ${newestCompletedOrder.productName || newestCompletedOrder.productId || 'an order'}.`,
        timestamp: newestCompletedOrder.createdAt,
      });
    }

    if (newestPendingTopup) {
      items.push({
        id: `pending-topup-${newestPendingTopup.id}`,
        icon: CreditCard,
        tone: 'warning',
        status: newestPendingTopup.status,
        title: isArabic ? 'طلب شحن يدوي بانتظار المراجعة' : 'Manual topup waiting for review',
        description: isArabic
          ? `${newestPendingTopup.userName || newestPendingTopup.userId || 'مستخدم'} أرسل طلب شحن بقيمة ${formatMoney(newestPendingTopup.requestedAmount ?? newestPendingTopup.amount, newestPendingTopup.currencyCode)}.`
          : `${newestPendingTopup.userName || newestPendingTopup.userId || 'A user'} submitted a topup request for ${formatMoney(newestPendingTopup.requestedAmount ?? newestPendingTopup.amount, newestPendingTopup.currencyCode)}.`,
        timestamp: newestPendingTopup.createdAt,
      });
    }

    if (newestRejectedOrder) {
      items.push({
        id: `rejected-order-${newestRejectedOrder.id}`,
        icon: Clock3,
        tone: 'info',
        status: newestRejectedOrder.status,
        title: isArabic ? 'طلب يحتاج مراجعة' : 'Order needs attention',
        description: isArabic
          ? `هناك طلب بحالة ${normalizeStatus(newestRejectedOrder.status)} للمنتج ${newestRejectedOrder.productName || newestRejectedOrder.productId || ''}.`
          : `There is an order with status ${normalizeStatus(newestRejectedOrder.status)} for ${newestRejectedOrder.productName || newestRejectedOrder.productId || 'a product'}.`,
        timestamp: newestRejectedOrder.createdAt,
      });
    }

    if (newestProduct) {
      items.push({
        id: `product-snapshot-${newestProduct.id}`,
        icon: Package,
        tone: 'info',
        title: isArabic ? 'حالة الكاتالوج الحالية' : 'Current catalog snapshot',
        description: isArabic
          ? `إجمالي ${formatCount(filteredProducts.length)} منتج داخل نطاق العرض الحالي. آخر منتج ظاهر: ${formatRelativeProductName(newestProduct, true)}.`
          : `${formatCount(filteredProducts.length)} products are currently inside the selected range. Latest visible item: ${formatRelativeProductName(newestProduct, false)}.`,
        timestamp: newestProduct.updatedAt || newestProduct.createdAt || null,
      });
    }

    if (!items.length && customerUsers.length) {
      items.push({
        id: 'customer-snapshot',
        icon: UserCog,
        tone: 'info',
        title: isArabic ? 'ملخص المستخدمين' : 'Users snapshot',
        description: isArabic
          ? `يوجد حاليًا ${formatCount(customerUsers.length)} عميل و${formatCount(activeUsers.length)} منهم مفعّلون داخل الفترة المحددة.`
          : `There are currently ${formatCount(customerUsers.length)} customers and ${formatCount(activeUsers.length)} of them are approved in the selected range.`,
        timestamp: null,
      });
    }

    return items.slice(0, 4);
  }, [
    activeUsers.length,
    completedOrders,
    customerUsers.length,
    filteredOrders,
    filteredProducts,
    formatCount,
    formatMoney,
    isArabic,
    pendingManualTopups,
  ]);

  const handleViewOrderFromDashboard = async (order) => {
    const orderId = String(order?.id || '').trim();
    if (!orderId) return;

    setSelectedOrderId(orderId);
    setIsOrderDrawerOpen(true);

    try {
      await getOrderById(orderId);
    } catch (_error) {
      // Keep the existing order snapshot visible if fetching full details fails.
    }
  };

  const handleCloseOrderDrawer = () => {
    setIsOrderDrawerOpen(false);
    setSelectedOrderId('');
  };

  const handleDashboardOrderStatusUpdate = async (order, status) => {
    const orderId = String(order?.id || '').trim();
    if (!orderId) return;

    try {
      setLoadingOrderActionId(orderId);
      await updateOrderStatus(orderId, status, order);
    } finally {
      setLoadingOrderActionId('');
    }
  };

  const handleDashboardOrderSync = async (order) => {
    const orderId = String(order?.id || '').trim();
    if (!orderId) return;

    try {
      setSyncingOrderId(orderId);
      await syncOrderSupplierStatus(orderId);
    } finally {
      setSyncingOrderId('');
    }
  };

  const handleDashboardTopupApprove = async (topup) => {
    const topupId = String(topup?.id || '').trim();
    if (!topupId) return;

    try {
      setApprovingTopupId(topupId);
      const actualPaidAmount = asNumber(
        topup?.actualPaidAmount
        ?? topup?.requestedAmount
        ?? topup?.requestedCoins
        ?? topup?.amount
      );

      await updateTopupStatus(topupId, 'approved', {
        actualPaidAmount,
        currencyCode: topup?.currencyCode || 'USD',
        adminNote: '',
      });
    } finally {
      setApprovingTopupId('');
    }
  };

  return (
    <div className="min-w-0 space-y-4 pb-3 md:space-y-8 md:pb-4">
      <DashboardHeader
        isArabic={isArabic}
        userName={user?.name}
        currentDateLabel={currentDateLabel}
      />

      <Card variant="premium" className="overflow-visible p-4 sm:p-6">
        <DashboardDateRangeFilter
          isArabic={isArabic}
          formatRangeDate={formatRangeDate}
          todayInputValue={todayInputValue}
          startDate={startDate}
          endDate={endDate}
          onRangeChange={applyDateRangeSelection}
        />
      </Card>

      <StatsGrid stats={stats} isLoading={isLoading} />

      <div className="grid place-items-center gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)] xl:place-items-stretch xl:gap-6">
        <div className="w-full space-y-4 md:space-y-6">
          <PendingApprovalsSection
            users={pendingApprovalUsers}
            isArabic={isArabic}
            formatDate={formatDate}
          />
          <RecentOrdersSection
            orders={recentOrders}
            isArabic={isArabic}
            onViewOrder={handleViewOrderFromDashboard}
          />
          <ManualTopupsSection
            topups={recentManualTopups}
            pendingCount={pendingManualTopups.length}
            isArabic={isArabic}
            formatDate={formatDate}
            formatMoney={formatMoney}
            onApproveTopup={handleDashboardTopupApprove}
            approvingTopupId={approvingTopupId}
          />
        </div>

        <div className="w-full space-y-4 md:space-y-6">
          <QuickActionsSection actions={quickActions} isArabic={isArabic} />
          <SupplierBalancesSection
            items={supplierBalanceItems}
            isArabic={isArabic}
            isLoading={isLoadingSupplierBalances}
          />
          <ActivityFeedSection items={activityItems} isArabic={isArabic} formatDate={formatDate} />
        </div>
      </div>

      <OrderDetailsDrawer
        isOpen={isOrderDrawerOpen}
        onClose={handleCloseOrderDrawer}
        order={selectedOrder}
        isArabic={isArabic}
        currencies={currencies}
        view="admin"
        onUpdateStatus={handleDashboardOrderStatusUpdate}
        onSync={handleDashboardOrderSync}
        isActionLoading={loadingOrderActionId === selectedOrderId}
        isSyncing={syncingOrderId === selectedOrderId}
      />
    </div>
  );
};

export default AdminDashboard;
