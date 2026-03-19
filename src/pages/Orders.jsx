import React, { useEffect, useMemo, useState } from 'react';
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
  <Card variant="flat" className="p-4">
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] border border-[color:rgb(var(--color-primary-rgb)/0.18)] bg-[color:rgb(var(--color-primary-rgb)/0.08)] text-[var(--color-primary)]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-[var(--color-text-secondary)]">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-[var(--color-text)]">{value}</p>
        <p className="mt-1 text-xs text-[var(--color-muted)]">{note}</p>
      </div>
    </div>
  </Card>
);

const Orders = () => {
  const { user } = useAuthStore();
  const { orders, loadOrders } = useOrderStore();
  const { products, loadProducts } = useMediaStore();
  const { currencies, loadCurrencies } = useSystemStore();
  const { i18n } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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
    () => filterOrders(enrichedOrders, {
      searchTerm,
      statusFilter,
      typeFilter: 'all',
      dateFilter: 'all',
      sortOrder,
    }),
    [enrichedOrders, searchTerm, sortOrder, statusFilter]
  );

  const summary = useMemo(() => summarizeOrders(enrichedOrders), [enrichedOrders]);

  const selectedOrder = useMemo(
    () => enrichedOrders.find((order) => order.id === selectedOrderId) || null,
    [enrichedOrders, selectedOrderId]
  );

  const formatCount = (value) => formatNumber(value, locale);

  return (
    <div className="min-w-0 space-y-6 pb-4">
      <section className="premium-card relative overflow-hidden p-5 sm:p-6">
        <div className="pointer-events-none absolute -top-16 right-4 h-36 w-36 rounded-full bg-[color:rgb(var(--color-primary-rgb)/0.14)] blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-full bg-[color:rgb(var(--color-primary-rgb)/0.08)] blur-3xl" />

        <div className="relative min-w-0">
          <span className="section-kicker">
            {isArabic ? 'Orders Overview' : 'Orders Overview'}
          </span>
          <h1 className="page-heading mt-4 max-w-3xl">
            {isArabic ? 'طلباتي' : 'My Orders'}
          </h1>
          <p className="page-subtitle mt-3 max-w-3xl">
            {isArabic
              ? 'كل طلباتك في مكان واحد، مع حالة واضحة وتفاصيل منظمة تساعدك تتابع التنفيذ بسهولة من الهاتف أو الديسكتوب.'
              : 'All your orders in one place, with clear statuses and organized details that are easy to follow on mobile and desktop.'}
          </p>
        </div>

        <div className="relative mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        showTypeFilter={false}
        showDateFilter={false}
        resultCount={filteredOrders.length}
        searchPlaceholder={isArabic
          ? 'ابحث باسم المنتج أو رقم الطلب'
          : 'Search by product name or order number'}
        helperText={isArabic
          ? 'تظهر هنا طلباتك فقط، ويمكنك تصفيتها بسرعة حسب حالتها.'
          : 'Only your own orders appear here, and you can quickly filter them by status.'}
      />

      {filteredOrders.length ? (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <CustomerOrderCard
              key={order.id}
              order={order}
              isArabic={isArabic}
              currencies={currencies}
              onSelect={() => setSelectedOrderId(order.id)}
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
        onClose={() => setSelectedOrderId(null)}
        order={selectedOrder}
        isArabic={isArabic}
        currencies={currencies}
        view="customer"
      />
    </div>
  );
};

export default Orders;
