import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  CheckCircle2,
  Clock3,
  CreditCard,
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
import useAuthStore from '../store/useAuthStore';
import useAdminStore from '../store/useAdminStore';
import useOrderStore from '../store/useOrderStore';
import useTopupStore from '../store/useTopupStore';
import useMediaStore from '../store/useMediaStore';
import DashboardHeader from '../components/admin-dashboard/DashboardHeader';
import StatsGrid from '../components/admin-dashboard/StatsGrid';
import RecentOrdersSection from '../components/admin-dashboard/RecentOrdersSection';
import ManualTopupsSection from '../components/admin-dashboard/ManualTopupsSection';
import QuickActionsSection from '../components/admin-dashboard/QuickActionsSection';
import ActivityFeedSection from '../components/admin-dashboard/ActivityFeedSection';
import { formatDateTime, formatNumber, getNumericLocale } from '../utils/intl';

const PENDING_STATUSES = ['pending', 'requested', 'under_review', 'processing'];
const COMPLETED_STATUSES = ['completed', 'approved', 'success'];
const REJECTED_STATUSES = ['rejected', 'denied', 'cancelled', 'canceled'];

const asNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const byNewestDate = (left, right) => {
  return new Date(right?.createdAt || right?.updatedAt || 0) - new Date(left?.createdAt || left?.updatedAt || 0);
};

const normalizeStatus = (status) => String(status || '').trim().toLowerCase();

const isPendingStatus = (status) => PENDING_STATUSES.includes(normalizeStatus(status));
const isCompletedStatus = (status) => COMPLETED_STATUSES.includes(normalizeStatus(status));
const isRejectedStatus = (status) => REJECTED_STATUSES.includes(normalizeStatus(status));
const isManualTopup = (topup) => String(topup?.type || '').trim().toLowerCase() !== 'game_topup';

const formatRelativeProductName = (product, isArabic) => {
  return product?.nameAr || product?.name || (isArabic ? 'منتج غير معروف' : 'Unknown product');
};

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const { users, loadUsers } = useAdminStore();
  const { orders, loadOrders } = useOrderStore();
  const { topups, loadTopups } = useTopupStore();
  const { products, loadProducts } = useMediaStore();
  const { i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  const isArabic = String(i18n.resolvedLanguage || i18n.language || 'ar').toLowerCase().startsWith('ar');
  const locale = getNumericLocale(isArabic ? 'ar-EG' : 'en-US');

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      setIsLoading(true);

      await Promise.allSettled([
        Promise.resolve(loadUsers()),
        Promise.resolve(loadOrders()),
        Promise.resolve(loadTopups()),
        Promise.resolve(loadProducts()),
      ]);

      if (isMounted) {
        setIsLoading(false);
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [loadOrders, loadProducts, loadTopups, loadUsers]);

  const customerUsers = useMemo(
    () => (users || []).filter((entry) => String(entry?.role || '').trim().toLowerCase() === 'customer'),
    [users]
  );

  const activeUsers = useMemo(
    () => customerUsers.filter((entry) => String(entry?.status || '').trim().toLowerCase() === 'active'),
    [customerUsers]
  );

  const completedOrders = useMemo(
    () => (orders || []).filter((entry) => isCompletedStatus(entry?.status)),
    [orders]
  );

  const pendingOrders = useMemo(
    () => (orders || []).filter((entry) => isPendingStatus(entry?.status)),
    [orders]
  );

  const manualTopups = useMemo(
    () => (topups || []).filter((entry) => isManualTopup(entry)),
    [topups]
  );

  const pendingManualTopups = useMemo(
    () => manualTopups.filter((entry) => isPendingStatus(entry?.status)),
    [manualTopups]
  );

  const recentOrders = useMemo(
    () => [...(orders || [])].sort(byNewestDate).slice(0, 6),
    [orders]
  );

  const recentManualTopups = useMemo(
    () => [...manualTopups].sort(byNewestDate).slice(0, 6),
    [manualTopups]
  );

  const totalRevenue = useMemo(
    () => completedOrders.reduce((sum, entry) => (
      sum + asNumber(entry?.financialSnapshot?.finalAmountAtExecution ?? entry?.priceCoins ?? entry?.totalAmount)
    ), 0),
    [completedOrders]
  );

  const totalWalletBalance = useMemo(
    () => customerUsers.reduce((sum, entry) => sum + asNumber(entry?.coins), 0),
    [customerUsers]
  );

  const formatCount = (value) => formatNumber(asNumber(value), locale);
  const formatCoins = (value) => `${formatCount(value)} ${isArabic ? 'عملة' : 'coins'}`;
  const formatDollars = (value) => `${formatCount(value)} ${isArabic ? 'دولار' : 'USD'}`;
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

  const quickActions = useMemo(
    () => [
      {
        label: isArabic ? 'إضافة منتج جديد' : 'Add Product',
        description: isArabic ? 'إنشاء منتج جديد وربطه بالمورد أو التسعير الداخلي.' : 'Create a new product and connect it to supplier or local pricing.',
        to: '/admin/products',
        icon: Package,
      },
      {
        label: isArabic ? 'إضافة وسيلة دفع' : 'Add Payment Method',
        description: isArabic ? 'تحديث قنوات الدفع لتسهيل استقبال طلبات الشحن.' : 'Update payment channels for smoother topup collection.',
        to: '/admin/payment-methods',
        icon: CreditCard,
      },
      {
        label: isArabic ? 'إدارة الطلبات' : 'Manage Orders',
        description: isArabic ? 'مراجعة الطلبات الأخيرة ومتابعة حالتها التشغيلية.' : 'Review recent purchases and follow their operational status.',
        to: '/admin/payments',
        icon: ShoppingCart,
      },
      {
        label: isArabic ? 'إدارة المستخدمين' : 'Manage Users',
        description: isArabic ? 'مراجعة الحسابات، الحالات، والصلاحيات من مكان واحد.' : 'Review accounts, statuses, and permissions from one place.',
        to: '/admin/users',
        icon: Users,
      },
      {
        label: isArabic ? 'إدارة الموردين' : 'Manage Suppliers',
        description: isArabic ? 'تنظيم ربط الموردين ومتابعة التكاملات الخارجية.' : 'Organize suppliers and monitor external integrations.',
        to: '/admin/suppliers',
        icon: Building2,
      },
      {
        label: isArabic ? 'مراجعة طلبات الشحن' : 'Review Topups',
        description: isArabic ? 'الوصول السريع إلى طلبات الشحن اليدوي المعلقة.' : 'Jump straight into pending manual topup reviews.',
        to: '/admin/payments',
        icon: ArrowLeftRight,
      },
    ],
    [isArabic]
  );

  const stats = useMemo(
    () => [
      {
        title: isArabic ? 'إجمالي الأرباح' : 'Total Revenue',
        value: formatDollars(totalRevenue),
        note: isArabic ? 'محسوبة من الطلبات المكتملة فقط' : 'Calculated from completed orders only',
        icon: TrendingUp,
      },
      {
        title: isArabic ? 'إجمالي الطلبات' : 'Total Orders',
        value: formatCount((orders || []).length),
        note: isArabic ? 'كل الطلبات المسجلة داخل النظام' : 'All orders currently recorded in the system',
        icon: ShoppingCart,
      },
      {
        title: isArabic ? 'إجمالي المستخدمين' : 'Total Users',
        value: formatCount((users || []).length),
        note: isArabic ? `${formatCount(activeUsers.length)} مستخدم نشط` : `${formatCount(activeUsers.length)} active users`,
        icon: Users,
      },
      {
        title: isArabic ? 'إجمالي المنتجات' : 'Total Products',
        value: formatCount((products || []).length),
        note: isArabic ? 'كل المنتجات المتاحة للإدارة والربط' : 'All products available for management and syncing',
        icon: Package,
      },
      {
        title: isArabic ? 'الطلبات المعلقة' : 'Pending Orders',
        value: formatCount(pendingOrders.length),
        note: isArabic ? 'تحتاج متابعة تشغيلية أو مراجعة' : 'Require follow-up or operational review',
        icon: Clock3,
      },
      {
        title: isArabic ? 'الطلبات المكتملة' : 'Completed Orders',
        value: formatCount(completedOrders.length),
        note: isArabic ? 'تم تنفيذها بنجاح' : 'Successfully fulfilled',
        icon: CheckCircle2,
      },
      {
        title: isArabic ? 'طلبات الشحن اليدوي المعلقة' : 'Pending Manual Topups',
        value: formatCount(pendingManualTopups.length),
        note: isArabic ? 'أولوية للمراجعة السريعة' : 'Priority queue for quick review',
        icon: ShieldCheck,
      },
      {
        title: isArabic ? 'إجمالي أرصدة المحافظ' : 'Total Wallet Balances',
        value: formatCoins(totalWalletBalance),
        note: isArabic ? 'إجمالي الرصيد لدى حسابات العملاء' : 'Combined wallet balance across customer accounts',
        icon: Wallet,
      },
    ],
    [
      activeUsers.length,
      completedOrders.length,
      formatCount,
      isArabic,
      orders,
      pendingManualTopups.length,
      pendingOrders.length,
      products,
      totalRevenue,
      totalWalletBalance,
      users,
    ]
  );

  const activityItems = useMemo(() => {
    const items = [];
    const newestCompletedOrder = [...completedOrders].sort(byNewestDate)[0];
    const newestPendingTopup = [...pendingManualTopups].sort(byNewestDate)[0];
    const newestRejectedOrder = [...(orders || []).filter((entry) => isRejectedStatus(entry?.status))].sort(byNewestDate)[0];
    const newestProduct = [...(products || [])].sort(byNewestDate)[0];

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
        title: isArabic ? 'حالة الكاتلوج الحالية' : 'Current catalog snapshot',
        description: isArabic
          ? `إجمالي ${formatCount((products || []).length)} منتج داخل النظام. آخر منتج ظاهر: ${formatRelativeProductName(newestProduct, true)}.`
          : `${formatCount((products || []).length)} products are currently in the system. Latest visible item: ${formatRelativeProductName(newestProduct, false)}.`,
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
          ? `يوجد حاليًا ${formatCount(customerUsers.length)} عميل و${formatCount(activeUsers.length)} منهم نشطون.`
          : `There are currently ${formatCount(customerUsers.length)} customers and ${formatCount(activeUsers.length)} of them are active.`,
        timestamp: null,
      });
    }

    return items.slice(0, 4);
  }, [
    activeUsers.length,
    completedOrders,
    customerUsers.length,
    formatCount,
    formatMoney,
    isArabic,
    orders,
    pendingManualTopups,
    products,
  ]);

  return (
    <div className="min-w-0 space-y-6 pb-4 md:space-y-8">
      <DashboardHeader
        isArabic={isArabic}
        userName={user?.name}
        currentDateLabel={currentDateLabel}
      />

      <StatsGrid stats={stats} isLoading={isLoading} />

      <div className="grid place-items-center gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)] xl:place-items-stretch">
        <div className="w-full space-y-6">
          <RecentOrdersSection
            orders={recentOrders}
            isArabic={isArabic}
            formatDate={formatDate}
            formatAmount={formatCoins}
          />
          <ManualTopupsSection
            topups={recentManualTopups}
            pendingCount={pendingManualTopups.length}
            isArabic={isArabic}
            formatDate={formatDate}
            formatMoney={formatMoney}
          />
        </div>

        <div className="w-full space-y-6">
          <QuickActionsSection actions={quickActions} isArabic={isArabic} />
          <ActivityFeedSection items={activityItems} isArabic={isArabic} formatDate={formatDate} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
