import React, { lazy, Suspense, useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  ShieldCheck,
  ShoppingCart,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Card from '../../components/ui/Card';
import OrdersFiltersBar from '../../components/orders/OrdersFiltersBar';
import OrdersTable from '../../components/orders/OrdersTable';
import OrdersMobileCards from '../../components/orders/OrdersMobileCards';
import EmptyOrdersState from '../../components/orders/EmptyOrdersState';
import { useToast } from '../../components/ui/Toast';
import useOrderStore from '../../store/useOrderStore';
import useAdminStore from '../../store/useAdminStore';
import useMediaStore from '../../store/useMediaStore';
import useSystemStore from '../../store/useSystemStore';
import { filterOrders, enrichOrders, summarizeOrders } from '../../utils/orders';
import { formatNumber } from '../../utils/intl';

const OrderDetailsDrawer = lazy(() => import('../../components/orders/OrderDetailsDrawer'));

const SummaryCard = ({ icon: Icon, label, value, note }) => (
  <Card className="admin-premium-stat p-3 sm:p-3.5">
    <div className="flex items-start gap-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.85rem] border border-[color:rgb(var(--color-primary-rgb)/0.18)] bg-[color:rgb(var(--color-primary-rgb)/0.08)] text-[var(--color-primary)] sm:h-10 sm:w-10">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-[var(--color-text-secondary)] sm:text-sm">{label}</p>
        <p className="mt-0.5 text-xl font-semibold text-[var(--color-text)] sm:text-2xl">{value}</p>
        <p className="mt-0.5 text-[11px] text-[var(--color-muted)] sm:text-xs">{note}</p>
      </div>
    </div>
  </Card>
);

const AdminOrders = () => {
  const { orders, loadOrders, updateOrderStatus, syncOrderSupplierStatus } = useOrderStore();
  const { users, loadUsers } = useAdminStore();
  const { products, loadProducts } = useMediaStore();
  const { currencies, loadCurrencies } = useSystemStore();
  const { addToast } = useToast();
  const { i18n } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [actionOrderId, setActionOrderId] = useState('');
  const [syncingOrderId, setSyncingOrderId] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const isArabic = String(i18n.resolvedLanguage || i18n.language || 'ar').toLowerCase().startsWith('ar');
  const locale = isArabic ? 'ar-EG' : 'en-US';

  useEffect(() => {
    let isMounted = true;

    const loadPage = async () => {
      setIsLoading(true);

      await Promise.allSettled([
        Promise.resolve(loadOrders()),
        Promise.resolve(loadUsers()),
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
  }, [loadCurrencies, loadOrders, loadProducts, loadUsers]);

  const enrichedOrders = useMemo(
    () => enrichOrders(orders, { users, products, language: isArabic ? 'ar' : 'en' }),
    [orders, users, products, isArabic]
  );

  const filteredOrders = useMemo(
    () => filterOrders(enrichedOrders, {
      searchTerm: deferredSearchTerm,
      statusFilter,
      typeFilter,
      dateFilter,
      sortOrder,
    }),
    [dateFilter, deferredSearchTerm, enrichedOrders, sortOrder, statusFilter, typeFilter]
  );

  const summary = useMemo(() => summarizeOrders(enrichedOrders), [enrichedOrders]);

  const selectedOrder = useMemo(
    () => enrichedOrders.find((order) => order.id === selectedOrderId) || null,
    [enrichedOrders, selectedOrderId]
  );

  const formatCount = (value) => formatNumber(value, locale);

  const handleAccept = useCallback(async (order, nextStatus) => {
    const confirmationMessage = nextStatus === 'completed'
      ? (isArabic ? 'هل تريد تأكيد اكتمال هذا الطلب؟' : 'Do you want to mark this order as completed?')
      : (isArabic ? 'هل تريد قبول هذا الطلب وبدء تنفيذه؟' : 'Do you want to accept this order and move it in progress?');

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    setActionOrderId(order.id);

    try {
      await updateOrderStatus(order.id, nextStatus);
      await loadUsers();
      addToast(
        nextStatus === 'completed'
          ? (isArabic ? 'تم تحديث الطلب إلى مكتمل' : 'Order marked as completed')
          : (isArabic ? 'تم قبول الطلب وهو الآن قيد التنفيذ' : 'Order accepted and moved in progress'),
        'success'
      );
    } catch (error) {
      addToast(error?.message || (isArabic ? 'تعذر تحديث حالة الطلب' : 'Unable to update order status'), 'error');
    } finally {
      setActionOrderId('');
    }
  }, [addToast, isArabic, loadUsers, updateOrderStatus]);

  const handleReject = useCallback(async (order) => {
    const confirmationMessage = isArabic
      ? 'هل تريد رفض هذا الطلب؟'
      : 'Do you want to reject this order?';

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    setActionOrderId(order.id);

    try {
      await updateOrderStatus(order.id, 'rejected');
      await loadUsers();
      addToast(
        isArabic ? 'تم رفض الطلب وإعادة ضبط حالته' : 'Order rejected successfully',
        'info'
      );
    } catch (error) {
      addToast(error?.message || (isArabic ? 'تعذر رفض الطلب' : 'Unable to reject order'), 'error');
    } finally {
      setActionOrderId('');
    }
  }, [addToast, isArabic, loadUsers, updateOrderStatus]);

  const handleSync = useCallback(async (order) => {
    setSyncingOrderId(order.id);

    try {
      const synced = await syncOrderSupplierStatus(order.id);
      addToast(
        synced
          ? (isArabic ? 'تمت مزامنة حالة المورد بنجاح' : 'Supplier status synced successfully')
          : (isArabic ? 'لا توجد بيانات جديدة للمزامنة' : 'No new supplier data was returned'),
        synced ? 'success' : 'info'
      );
    } catch (error) {
      addToast(error?.message || (isArabic ? 'تعذرت مزامنة حالة المورد' : 'Unable to sync supplier status'), 'error');
    } finally {
      setSyncingOrderId('');
    }
  }, [addToast, isArabic, syncOrderSupplierStatus]);

  const handleViewOrder = useCallback((order) => {
    setSelectedOrderId(order.id);
  }, []);

  const handleCloseOrderDetails = useCallback(() => {
    setSelectedOrderId(null);
  }, []);

  return (
    <div className="min-w-0 space-y-4 pb-4 sm:space-y-5">
      <section className="admin-premium-hero relative overflow-hidden p-4 sm:p-5">
        <div className="pointer-events-none absolute -top-20 right-8 h-40 w-40 rounded-full bg-[color:rgb(var(--color-primary-rgb)/0.18)] blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[color:rgb(var(--color-primary-rgb)/0.12)] blur-3xl" />

        <div className="relative min-w-0">
          <span className="section-kicker">
            {isArabic ? 'Order Control Center' : 'Order Control Center'}
          </span>
          <h1 className="page-heading mt-4 max-w-3xl">
            {isArabic ? 'الطلبات' : 'Orders'}
          </h1>
          <p className="page-subtitle mt-3 max-w-3xl">
            {isArabic
              ? 'لوحة مركزية لمراجعة جميع طلبات المتجر، متابعة حالتها، والتعامل مع الطلبات اليدوية بشكل واضح وسريع دون كسر الربط الحالي.'
              : 'A central workspace for reviewing all store orders, tracking their status, and handling manual requests without breaking the current backend flow.'}
          </p>
        </div>

        <div className="relative mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={ShoppingCart}
            label={isArabic ? 'إجمالي الطلبات' : 'Total orders'}
            value={formatCount(summary.total)}
            note={isArabic ? 'كل الطلبات المسجلة' : 'All recorded orders'}
          />
          <SummaryCard
            icon={Clock3}
            label={isArabic ? 'قيد التنفيذ' : 'In progress'}
            value={formatCount(summary.processing)}
            note={isArabic ? 'تحت المراجعة أو التنفيذ' : 'Currently being processed'}
          />
          <SummaryCard
            icon={ShieldCheck}
            label={isArabic ? 'يدوية تحتاج قرار' : 'Manual pending'}
            value={formatCount(summary.manualPending)}
            note={isArabic ? 'تنتظر قبول أو رفض' : 'Waiting for accept or reject'}
          />
          <SummaryCard
            icon={CheckCircle2}
            label={isArabic ? 'مكتملة' : 'Completed'}
            value={formatCount(summary.completed)}
            note={isArabic ? 'طلبات تم تنفيذها بنجاح' : 'Successfully fulfilled orders'}
          />
        </div>
      </section>

      <OrdersFiltersBar
        isArabic={isArabic}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        resultCount={filteredOrders.length}
        panelClassName="admin-premium-panel"
        compact
        searchPlaceholder={isArabic
          ? 'ابحث باسم المنتج، العميل، البريد الإلكتروني، أو رقم الطلب'
          : 'Search by product, customer, email, or order number'}
        helperText={isArabic
          ? 'يمكنك الفرز والفلترة حسب الحالة، النوع، التاريخ، أو تتبع طلب محدد من رقم الطلب.'
          : 'Filter by status, type, date, or jump directly to a specific order using its number.'}
      />

      {filteredOrders.length ? (
        <>
          <div className="xl:hidden">
            <OrdersMobileCards
              orders={filteredOrders}
              isArabic={isArabic}
              currencies={currencies}
              onViewOrder={handleViewOrder}
            />
          </div>

          <div className="hidden xl:block">
            <Card className="admin-premium-panel p-2.5">
              <OrdersTable
                orders={filteredOrders}
                isArabic={isArabic}
                currencies={currencies}
                onViewOrder={handleViewOrder}
              />
            </Card>
          </div>
        </>
      ) : (
        <EmptyOrdersState
          title={isLoading
            ? (isArabic ? 'جارٍ تحميل الطلبات' : 'Loading orders')
            : (isArabic ? 'لا توجد طلبات مطابقة' : 'No matching orders')}
          description={isLoading
            ? (isArabic ? 'نحمّل بيانات الطلبات الحالية من النظام.' : 'We are loading the current order data from the system.')
            : (isArabic
              ? 'جرّب تعديل البحث أو الفلاتر لعرض نتائج أخرى، أو انتظر حتى تصل طلبات جديدة.'
              : 'Try adjusting the search or filters, or wait for new orders to appear.')}
        />
      )}

      {selectedOrder ? (
        <Suspense fallback={null}>
          <OrderDetailsDrawer
            isOpen={Boolean(selectedOrder)}
            onClose={handleCloseOrderDetails}
            order={selectedOrder}
            isArabic={isArabic}
            currencies={currencies}
            view="admin"
            onAccept={handleAccept}
            onReject={handleReject}
            onSync={handleSync}
            isActionLoading={Boolean(selectedOrder && actionOrderId === selectedOrder.id)}
            isSyncing={Boolean(selectedOrder && syncingOrderId === selectedOrder.id)}
          />
        </Suspense>
      ) : null}
    </div>
  );
};

export default AdminOrders;
