import React, { useEffect, useMemo, useState } from 'react';
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
import useAuthStore from '../store/useAuthStore';
import useOrderStore from '../store/useOrderStore';
import useMediaStore from '../store/useMediaStore';
import useSystemStore from '../store/useSystemStore';
import { filterOrders, enrichOrders, summarizeOrders } from '../utils/orders';
import { formatNumber } from '../utils/intl';

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
  const { orders, loadOrders, getOrderById } = useOrderStore();
  const { products, loadProducts } = useMediaStore();
  const { currencies, loadCurrencies } = useSystemStore();
  const { i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const isArabic = String(i18n.resolvedLanguage || i18n.language || 'ar').toLowerCase().startsWith('ar');
  const locale = isArabic ? 'ar-EG' : 'en-US';

  useEffect(() => {
    let isMounted = true;

    const loadPage = async () => {
      setIsLoading(true);

      await Promise.allSettled([
        Promise.resolve(loadOrders(user?.id)),
        Promise.resolve(loadProducts()),
        Promise.resolve(loadCurrencies()),
      ]);

      if (isMounted) {
        setIsLoading(false);
      }
    };

    loadPage();

    return () => {
      isMounted = false;
    };
  }, [loadCurrencies, loadOrders, loadProducts, user?.id]);

  const enrichedOrders = useMemo(
    () => enrichOrders(orders, {
      users: user ? [user] : [],
      products,
      language: isArabic ? 'ar' : 'en',
    }),
    [orders, products, user, isArabic]
  );

  const filteredOrders = useMemo(
    () => {
      const baseFiltered = filterOrders(enrichedOrders, {
        searchTerm,
        statusFilter,
        typeFilter: 'all',
        dateFilter,
        sortOrder,
      });

      if (dateFilter !== 'custom') {
        return baseFiltered;
      }

      const startBoundary = customStartDate ? new Date(`${customStartDate}T00:00:00`) : null;
      const endBoundary = customEndDate ? new Date(`${customEndDate}T23:59:59.999`) : null;

      return baseFiltered.filter((order) => {
        const orderDate = new Date(order?.createdAt || 0);
        if (Number.isNaN(orderDate.getTime())) return false;
        if (startBoundary && orderDate < startBoundary) return false;
        if (endBoundary && orderDate > endBoundary) return false;
        return true;
      });
    },
    [customEndDate, customStartDate, dateFilter, enrichedOrders, searchTerm, sortOrder, statusFilter]
  );

  const summary = useMemo(() => summarizeOrders(enrichedOrders), [enrichedOrders]);

  const selectedOrder = useMemo(
    () => enrichedOrders.find((order) => order.id === selectedOrderId) || null,
    [enrichedOrders, selectedOrderId]
  );

  useEffect(() => {
    const orderIdFromQuery = String(searchParams.get('orderId') || '').trim();
    if (!orderIdFromQuery) return;

    setSelectedOrderId(orderIdFromQuery);
    void getOrderById(orderIdFromQuery, user?.id).catch(() => {});
  }, [getOrderById, searchParams, user?.id]);

  const formatCount = (value) => formatNumber(value, locale);

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
            value={formatCount(summary.total)}
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

      <OrdersFiltersBar
        isArabic={isArabic}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        showTypeFilter={false}
        showDateFilter
        resultCount={filteredOrders.length}
        searchPlaceholder={isArabic
          ? 'ابحث باسم المنتج أو رقم الطلب'
          : 'Search by product name or order number'}
        helperText={isArabic
          ? 'تظهر طلباتك حسب المدة التي تحددها فقط بدون حذف أي بيانات من النظام.'
          : 'Your orders are displayed by the selected period only, without deleting any data.'}
        customRange={dateFilter === 'custom' ? {
          startDate: customStartDate,
          endDate: customEndDate,
          onStartDateChange: setCustomStartDate,
          onEndDateChange: setCustomEndDate,
          helperText: isArabic
            ? 'فلترة إضافية مخصصة من تاريخ إلى تاريخ.'
            : 'Custom date filtering from one date to another.',
        } : null}
        compact
      />

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
                void getOrderById(order.id, user?.id).catch(() => {});
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
