import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  Clock3,
  ShoppingCart,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Card from '../components/ui/Card';
import OrdersFiltersBar from '../components/orders/OrdersFiltersBar';
import CustomerOrderCard from '../components/orders/CustomerOrderCard';
import OrderDetailsDrawer from '../components/orders/OrderDetailsDrawer';
import EmptyOrdersState from '../components/orders/EmptyOrdersState';
import DashboardDateRangeFilter from '../components/admin-dashboard/DashboardDateRangeFilter';
import useAuthStore from '../store/useAuthStore';
import useOrderStore from '../store/useOrderStore';
import useMediaStore from '../store/useMediaStore';
import useSystemStore from '../store/useSystemStore';
import apiClient from '../services/client';
import { enrichOrders, summarizeOrders } from '../utils/orders';
import { formatNumber } from '../utils/intl';
import { formatCurrencyAmount } from '../utils/pricing';

const toDateInputValue = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const SummaryCard = ({ icon: Icon, label, value, note }) => (
  <Card variant="flat" className="p-2.5 sm:p-3">
    <div className="flex items-start gap-2">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.85rem] border border-[color:rgb(var(--color-primary-rgb)/0.16)] bg-[color:rgb(var(--color-primary-rgb)/0.07)] text-[var(--color-primary)]">
        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] leading-4 text-[var(--color-text-secondary)] sm:text-xs">{label}</p>
        <p className="mt-0.5 text-lg font-semibold leading-none text-[var(--color-text)] sm:text-xl">{value}</p>
        <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-[var(--color-muted)] sm:text-[11px]">{note}</p>
      </div>
    </div>
  </Card>
);

const Orders = () => {
  const { user } = useAuthStore();
  const { getPersonalOrderById } = useOrderStore();
  const { products, loadProducts } = useMediaStore();
  const { currencies, loadCurrencies } = useSystemStore();
  const { i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const userId = user?.id || user?._id || user?.userId;

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter] = useState('custom');
  const [customStartDate, setCustomStartDate] = useState(() => toDateInputValue(new Date()));
  const [customEndDate, setCustomEndDate] = useState(() => toDateInputValue(new Date()));
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [page, setPage] = useState(1);
  const deferredSearch = useDeferredValue(searchTerm);
  const ordersRequestVersion = useRef(0);

  const isArabic = String(i18n.resolvedLanguage || i18n.language || 'ar').toLowerCase().startsWith('ar');
  const locale = isArabic ? 'ar-EG' : 'en-US';

  useEffect(() => {
    const requestVersion = ++ordersRequestVersion.current;
    let active = true;
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      const result = await apiClient.orders.listMinePaginated({
        page,
        limit: 20,
        search: String(deferredSearch || '').trim(),
        status: statusFilter === 'all' ? undefined : statusFilter,
        from: customStartDate || undefined,
        to: customEndDate || undefined,
      }).catch(() => null);
      await Promise.allSettled([Promise.resolve(loadProducts()), Promise.resolve(loadCurrencies())]);
      if (!active || requestVersion !== ordersRequestVersion.current) return;
      setOrders(result?.orders || []);
      setPagination(result?.pagination || { page, limit: 20, total: 0, pages: 0 });
      setIsLoading(false);
    }, 300);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [customEndDate, customStartDate, deferredSearch, loadCurrencies, loadProducts, page, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [customEndDate, customStartDate, deferredSearch, statusFilter]);

  const enrichedOrders = useMemo(
    () => enrichOrders(orders, {
      users: user ? [user] : [],
      products,
      language: isArabic ? 'ar' : 'en',
    }),
    [orders, products, user, isArabic]
  );

  const filteredOrders = enrichedOrders;

  const summary = useMemo(() => summarizeOrders(enrichedOrders), [enrichedOrders]);
  const visiblePurchaseTotals = useMemo(() => {
    const totals = new Map();
    filteredOrders.forEach((order) => {
      const currencyCode = String(order?.currencyCode || user?.currency || 'USD').toUpperCase();
      const amount = Number(order?.amountValue || 0);
      totals.set(currencyCode, (totals.get(currencyCode) || 0) + (Number.isFinite(amount) ? amount : 0));
    });

    if (!totals.size) totals.set(String(user?.currency || 'USD').toUpperCase(), 0);
    return Array.from(totals, ([currencyCode, amount]) => ({ currencyCode, amount }));
  }, [filteredOrders, user?.currency]);

  const selectedOrder = useMemo(
    () => enrichedOrders.find((order) => order.id === selectedOrderId) || null,
    [enrichedOrders, selectedOrderId]
  );

  useEffect(() => {
    const orderIdFromQuery = String(searchParams.get('orderId') || '').trim();
    if (!orderIdFromQuery) return;

    setSelectedOrderId(orderIdFromQuery);
    void getPersonalOrderById(orderIdFromQuery, userId).catch(() => {});
  }, [getPersonalOrderById, searchParams, userId]);

  const formatCount = (value) => formatNumber(value, locale);
  const todayInputValue = toDateInputValue(new Date());
  const formatRangeDate = (value) => {
    if (!value) return '';
    const [year, month, day] = String(value).split('-').map(Number);
    const parsed = new Date(year, month - 1, day);
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(parsed);
  };
  const applyDateRangeSelection = (nextStartDate, nextEndDate = nextStartDate) => {
    let orderedStartDate = nextStartDate || '';
    let orderedEndDate = nextEndDate || nextStartDate || '';
    if (orderedStartDate && orderedEndDate && orderedStartDate > orderedEndDate) {
      [orderedStartDate, orderedEndDate] = [orderedEndDate, orderedStartDate];
    }
    setCustomStartDate(orderedStartDate);
    setCustomEndDate(orderedEndDate);
  };

  return (
    <div className="min-w-0 space-y-4 pb-3">
      <section className="premium-card relative overflow-hidden p-3 sm:p-4">
        <div className="pointer-events-none absolute -top-16 right-4 h-28 w-28 rounded-full bg-[color:rgb(var(--color-primary-rgb)/0.14)] blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-20 w-20 rounded-full bg-[color:rgb(var(--color-primary-rgb)/0.08)] blur-3xl" />

        <div className="relative min-w-0">
          <span className="section-kicker">
            {isArabic ? 'Orders Overview' : 'Orders Overview'}
          </span>
          <h1 className="page-heading mt-3 max-w-3xl">
            {isArabic ? 'طلباتي' : 'My Orders'}
          </h1>
          <p className="page-subtitle mt-2 max-w-3xl">
            {isArabic
              ? 'كل طلباتك في مكان واحد، مع حالة واضحة وتفاصيل منظمة تساعدك تتابع التنفيذ بسهولة من الهاتف أو الديسكتوب.'
              : 'All your orders in one place, with clear statuses and organized details that are easy to follow on mobile and desktop.'}
          </p>
        </div>

        <div className="relative mt-4 grid grid-cols-2 gap-2.5">
          <SummaryCard
            icon={ShoppingCart}
            label={isArabic ? 'إجمالي الطلبات' : 'Total orders'}
            value={formatCount(pagination.total)}
            note={isArabic ? 'طلباتك المسجلة فقط' : 'Only your own orders'}
          />
          <SummaryCard
            icon={Clock3}
            label={isArabic ? 'قيد التنفيذ' : 'In progress'}
            value={formatCount(summary.processing)}
            note={isArabic ? 'ما زالت تحت التنفيذ أو المراجعة' : 'Still in progress or under review'}
          />
          <SummaryCard
            icon={CheckCircle2}
            label={isArabic ? 'مكتملة' : 'Completed'}
            value={formatCount(summary.completed)}
            note={isArabic ? 'طلبات انتهى تنفيذها' : 'Orders that were fulfilled successfully'}
          />
        </div>
      </section>

      <Card variant="premium" className="overflow-visible p-3 sm:p-4">
        <p className="mb-2 text-xs font-bold text-[var(--color-text)]">
          {isArabic ? 'نطاق التاريخ' : 'Date range'}
        </p>
        <DashboardDateRangeFilter
          isArabic={isArabic}
          formatRangeDate={formatRangeDate}
          todayInputValue={todayInputValue}
          startDate={customStartDate}
          endDate={customEndDate}
          onRangeChange={applyDateRangeSelection}
          buttonClassName="w-full sm:w-auto"
        />
      </Card>

      <OrdersFiltersBar
        showStatusFilter={false}
        showTypeFilter={false}
        isArabic={isArabic}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={(value) => { setStatusFilter(value); setPage(1); }}
        dateFilter={dateFilter}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        showDateFilter={false}
        resultCount={filteredOrders.length}
        searchPlaceholder={isArabic
          ? 'ابحث باسم المنتج أو رقم الطلب'
          : 'Search by product name or order number'}
        helperText={isArabic
          ? 'تظهر طلباتك حسب المدة التي تحددها فقط بدون حذف أي بيانات من النظام.'
          : 'Your orders are displayed by the selected period only, without deleting any data.'}
        compact
      />

      <Card variant="premium" className="-mt-1 p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[color:rgb(var(--color-primary-rgb)/0.28)] bg-[color:rgb(var(--color-primary-rgb)/0.11)] text-[var(--color-primary)] shadow-[0_10px_24px_-16px_rgb(var(--color-primary-rgb)/0.8)]">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <p className="text-xs font-bold text-[var(--color-text)]">
              {isArabic ? 'قيمة مبلغ الشراء' : 'Purchase amount'}
            </p>
          </div>
          <div className="flex flex-wrap justify-end gap-1.5">
            {visiblePurchaseTotals.map(({ currencyCode, amount }) => (
              <span key={currencyCode} className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-extrabold text-emerald-700 shadow-[0_8px_22px_-16px_rgba(16,185,129,0.8)] dark:text-emerald-300">
                {formatCurrencyAmount(amount, currencyCode, currencies, locale)}
              </span>
            ))}
          </div>
        </div>
      </Card>

      {filteredOrders.length ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filteredOrders.map((order) => (
            <CustomerOrderCard
              key={order.id}
              order={order}
              isArabic={isArabic}
              currencies={currencies}
              onSelect={() => {
                setSelectedOrderId(order.id);
                const nextParams = new URLSearchParams(searchParams);
                nextParams.set('orderId', order.id);
                setSearchParams(nextParams, { replace: true });
                void getPersonalOrderById(order.id, userId).catch(() => {});
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyOrdersState
          title={isLoading
            ? (isArabic ? 'جارٍ تحميل الطلبات' : 'Loading orders')
            : (isArabic ? 'لا توجد طلبات حتى الآن' : 'No orders yet')}
          description={isLoading
            ? (isArabic ? 'نقوم بجلب طلباتك الحالية من النظام.' : 'We are fetching your current orders from the system.')
            : (isArabic
              ? 'عندما تنشئ طلبًا جديدًا سيظهر هنا مع حالته وتفاصيله كاملة.'
              : 'Once you place a new order, it will appear here with its status and details.')}
          actionLabel={isLoading ? '' : (isArabic ? 'تصفح المنتجات' : 'Browse products')}
          actionTo={isLoading ? '' : '/products'}
        />
      )}

      {pagination.pages > 1 ? (
        <div className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
          <button type="button" disabled={pagination.page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 disabled:opacity-40">{isArabic ? 'السابق' : 'Previous'}</button>
          <span>{isArabic ? `صفحة ${pagination.page} من ${pagination.pages}` : `Page ${pagination.page} of ${pagination.pages}`}</span>
          <button type="button" disabled={pagination.page >= pagination.pages} onClick={() => setPage((value) => Math.min(pagination.pages, value + 1))} className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 disabled:opacity-40">{isArabic ? 'التالي' : 'Next'}</button>
        </div>
      ) : null}

      <OrderDetailsDrawer
        isOpen={Boolean(selectedOrder)}
        onClose={() => {
          setSelectedOrderId(null);
          const nextParams = new URLSearchParams(searchParams);
          nextParams.delete('orderId');
          setSearchParams(nextParams, { replace: true });
        }}
        order={selectedOrder}
        isArabic={isArabic}
        currencies={currencies}
        view="customer"
      />
    </div>
  );
};

export default Orders;
