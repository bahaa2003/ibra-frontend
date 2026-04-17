import React, { lazy, Suspense, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  ShieldCheck,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { textareaClassName } from '../../components/ui/Input';
import OrdersFiltersBar from '../../components/orders/OrdersFiltersBar';
import OrdersMobileCards from '../../components/orders/OrdersMobileCards';
import EmptyOrdersState from '../../components/orders/EmptyOrdersState';
import { useToast } from '../../components/ui/Toast';
import useOrderStore from '../../store/useOrderStore';
import useAdminStore from '../../store/useAdminStore';
import useMediaStore from '../../store/useMediaStore';
import useSystemStore from '../../store/useSystemStore';
import {
  filterOrders,
  enrichOrders,
  getManualOrderStatusLabel,
  summarizeOrders,
} from '../../utils/orders';
import { formatNumber } from '../../utils/intl';

const OrderDetailsDrawer = lazy(() => import('../../components/orders/OrderDetailsDrawer'));

const SummaryCard = ({ icon: Icon, label, value }) => (
  <Card className="admin-premium-stat p-2.5">
    <div className="flex items-start gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.8rem] border border-[color:rgb(var(--color-primary-rgb)/0.18)] bg-[color:rgb(var(--color-primary-rgb)/0.08)] text-[var(--color-primary)]">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-[var(--color-text-secondary)]">{label}</p>
        <p className="mt-0.5 text-lg font-semibold text-[var(--color-text)]">{value}</p>
      </div>
    </div>
  </Card>
);

/* ─── Pagination Bar ──────────────────────────────────────────────────────── */

const ROWS_OPTIONS = [20, 50, 100, 500];

/**
 * Build a smart page number list with ellipsis.
 * e.g. [1, 2, '…', 5, 6, 7, '…', 12, 13]
 */
const buildPageNumbers = (currentPage, totalPages) => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const pages = [];
  const addPage = (p) => {
    if (!pages.includes(p)) pages.push(p);
  };

  // Always show first 2
  addPage(1);
  addPage(2);

  // Show current ± 1
  if (currentPage - 1 > 2) pages.push('…');
  for (let i = Math.max(3, currentPage - 1); i <= Math.min(totalPages - 2, currentPage + 1); i++) {
    addPage(i);
  }

  // Always show last 2
  if (currentPage + 1 < totalPages - 1) pages.push('…');
  addPage(totalPages - 1);
  addPage(totalPages);

  return pages;
};

const PaginationBar = ({ page, totalPages, totalOrders, limit, onPageChange, onLimitChange, isArabic }) => {
  if (totalPages <= 0) return null;

  const pageNumbers = buildPageNumbers(page, totalPages);

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 sm:flex-row sm:justify-between">
      {/* Rows per page */}
      <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
        <span>{isArabic ? 'عدد الصفوف:' : 'Rows per page:'}</span>
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
        >
          {ROWS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <span className="text-xs opacity-60">
          ({isArabic ? `${totalOrders} طلب` : `${totalOrders} orders`})
        </span>
      </div>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover)] disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pageNumbers.map((p, idx) =>
          p === '…' ? (
            <span key={`ellipsis-${idx}`} className="px-1 text-sm text-[var(--color-text-secondary)]">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                p === page
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-sm'
                  : 'border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)]'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover)] disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

/* ─── Main Component ──────────────────────────────────────────────────────── */

const AdminOrders = () => {
  const {
    adminOrders,
    adminPagination,
    adminOrdersLoading,
    loadAdminOrders,
    loadOrders,
    getOrderById,
    updateOrderStatus,
    syncOrderSupplierStatus,
  } = useOrderStore();
  const { users, loadUsers } = useAdminStore();
  const { products, loadProducts } = useMediaStore();
  const { currencies, loadCurrencies } = useSystemStore();
  const { addToast } = useToast();
  const { i18n } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');
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

  // ── Fetch orders with server-side pagination + date range ────────────────
  useEffect(() => {
    let isMounted = true;

    const loadPage = async () => {
      setIsLoading(true);

      await Promise.allSettled([
        Promise.resolve(loadAdminOrders({
          page,
          limit,
          startDate: appliedStartDate || undefined,
          endDate: appliedEndDate || undefined,
        })),
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
  }, [page, limit, appliedStartDate, appliedEndDate, loadAdminOrders, loadCurrencies, loadProducts, loadUsers]);

  // ── Date range handlers ──────────────────────────────────────────────────
  const handleApplyDateFilter = useCallback(() => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setPage(1);
  }, [startDate, endDate]);

  const handleClearDateFilter = useCallback(() => {
    setStartDate('');
    setEndDate('');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setPage(1);
  }, []);

  const hasDateFilter = Boolean(appliedStartDate || appliedEndDate);

  const enrichedOrders = useMemo(
    () => enrichOrders(adminOrders, { users, products, language: isArabic ? 'ar' : 'en' }),
    [adminOrders, users, products, isArabic]
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

  // ── Pagination handlers ──────────────────────────────────────────────────
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleLimitChange = useCallback((newLimit) => {
    setLimit(newLimit);
    setPage(1); // Reset to page 1 when changing rows per page
  }, []);

  // ── Rejection modal state ──────────────────────────────────────────────
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionText, setRejectionText] = useState('');
  const pendingRejectionRef = useRef(null); // { order, nextStatus }

  const confirmRejection = useCallback(() => {
    const reason = rejectionText.trim();
    if (!reason) {
      addToast(
        isArabic ? 'يجب إدخال سبب الرفض لتأكيد العملية.' : 'A rejection reason is required to proceed.',
        'warning'
      );
      return;
    }
    const { order, nextStatus } = pendingRejectionRef.current || {};
    if (!order || !nextStatus) return;

    setRejectionModalOpen(false);
    setRejectionText('');
    pendingRejectionRef.current = null;

    // Proceed with the status update
    executeStatusUpdate(order, nextStatus, reason);
  }, [rejectionText, isArabic, addToast]);

  const cancelRejection = useCallback(() => {
    setRejectionModalOpen(false);
    setRejectionText('');
    pendingRejectionRef.current = null;
  }, []);

  const handleUpdateStatus = useCallback(async (order, nextStatus) => {
    const nextStatusLabel = getManualOrderStatusLabel(nextStatus, isArabic ? 'ar' : 'en');
    const normalizedNext = String(nextStatus || '').toLowerCase();

    // ── Rejection → open the custom modal ────────────────────────────────
    if (['rejected', 'failed', 'denied', 'cancelled', 'canceled'].includes(normalizedNext)) {
      pendingRejectionRef.current = { order, nextStatus };
      setRejectionText('');
      setRejectionModalOpen(true);
      return;
    }

    // ── Non-rejection → standard confirmation ────────────────────────────
    const confirmationMessage = isArabic
      ? `هل تريد تحديث حالة هذا الطلب إلى "${nextStatusLabel}"؟`
      : `Do you want to update this order to "${nextStatusLabel}"?`;

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    executeStatusUpdate(order, nextStatus, null);
  }, [isArabic]);

  const executeStatusUpdate = useCallback(async (order, nextStatus, rejectionReason) => {
    const nextStatusLabel = getManualOrderStatusLabel(nextStatus, isArabic ? 'ar' : 'en');
    setActionOrderId(order.id);

    try {
      await updateOrderStatus(order.id, nextStatus, { ...order, rejectionReason });
      await Promise.allSettled([
        Promise.resolve(loadUsers()),
        Promise.resolve(loadAdminOrders({
          page,
          limit,
          startDate: appliedStartDate || undefined,
          endDate: appliedEndDate || undefined,
        })),
      ]);
      addToast(
        isArabic
          ? `تم تحديث حالة الطلب إلى ${nextStatusLabel}`
          : `Order status updated to ${nextStatusLabel}`,
        nextStatus === 'rejected' ? 'info' : 'success'
      );
    } catch (error) {
      addToast(error?.message || (isArabic ? 'تعذر تحديث حالة الطلب' : 'Unable to update order status'), 'error');
    } finally {
      setActionOrderId('');
    }
  }, [addToast, appliedEndDate, appliedStartDate, isArabic, limit, loadAdminOrders, loadUsers, page, updateOrderStatus]);

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

  const handleViewOrder = useCallback(async (order) => {
    setSelectedOrderId(order.id);

    try {
      await getOrderById(order.id);
    } catch (error) {
      addToast(error?.message || (isArabic ? 'تعذر تحميل تفاصيل الطلب' : 'Unable to load order details'), 'error');
    }
  }, [addToast, getOrderById, isArabic]);

  const handleCloseOrderDetails = useCallback(() => {
    setSelectedOrderId(null);
  }, []);

  return (
    <div className="min-w-0 space-y-4 pb-4 sm:space-y-5">
      <section className="admin-premium-hero relative overflow-hidden p-3">
        <div className="pointer-events-none absolute -top-20 right-8 h-40 w-40 rounded-full bg-[color:rgb(var(--color-primary-rgb)/0.18)] blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[color:rgb(var(--color-primary-rgb)/0.12)] blur-3xl" />

        <div className="relative min-w-0">
          <h1 className="page-heading max-w-3xl">
            {isArabic ? 'الطلبات' : 'Orders'}
          </h1>
        </div>

        <div className="relative mt-3 grid grid-cols-2 gap-2">
          <SummaryCard
            icon={ShoppingCart}
            label={isArabic ? 'إجمالي الطلبات' : 'Total orders'}
            value={formatCount(adminPagination.total || summary.total)}
          />
          <SummaryCard
            icon={Clock3}
            label={isArabic ? 'قيد التنفيذ' : 'In progress'}
            value={formatCount(summary.processing)}
          />
          <SummaryCard
            icon={ShieldCheck}
            label={isArabic ? 'يدوية تحتاج قرار' : 'Manual pending'}
            value={formatCount(summary.manualPending)}
          />
          <SummaryCard
            icon={CheckCircle2}
            label={isArabic ? 'مكتملة' : 'Completed'}
            value={formatCount(summary.completed)}
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
        helperText={null}
      />

      {/* ── Date Range Filter ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 sm:flex-row sm:items-center sm:gap-3">
        <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)]">
          <CalendarDays className="h-4 w-4" />
          <span>{isArabic ? 'نطاق التاريخ' : 'Date Range'}</span>
        </div>

        <div className="flex flex-1 flex-wrap items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] transition-colors"
            max={endDate || undefined}
          />
          <span className="text-xs text-[var(--color-text-secondary)]">{isArabic ? 'إلى' : 'to'}</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] transition-colors"
            min={startDate || undefined}
          />

          <button
            onClick={handleApplyDateFilter}
            disabled={!startDate && !endDate}
            className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isArabic ? 'تصفية' : 'Filter'}
          </button>

          {hasDateFilter && (
            <button
              onClick={handleClearDateFilter}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover)]"
            >
              <X className="h-3.5 w-3.5" />
              {isArabic ? 'مسح' : 'Clear'}
            </button>
          )}
        </div>
      </div>

      {filteredOrders.length ? (
        <OrdersMobileCards
          orders={filteredOrders}
          isArabic={isArabic}
          currencies={currencies}
          onViewOrder={handleViewOrder}
        />
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

      {/* ── Pagination Controls ──────────────────────────────────────────── */}
      <PaginationBar
        page={page}
        totalPages={adminPagination.pages || 0}
        totalOrders={adminPagination.total || 0}
        limit={limit}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        isArabic={isArabic}
      />

      {selectedOrder ? (
        <Suspense fallback={null}>
          <OrderDetailsDrawer
            isOpen={Boolean(selectedOrder)}
            onClose={handleCloseOrderDetails}
            order={selectedOrder}
            isArabic={isArabic}
            currencies={currencies}
            view="admin"
            onUpdateStatus={handleUpdateStatus}
            onSync={handleSync}
            isActionLoading={Boolean(selectedOrder && actionOrderId === selectedOrder.id)}
            isSyncing={Boolean(selectedOrder && syncingOrderId === selectedOrder.id)}
          />
        </Suspense>
      ) : null}

      {/* ── Rejection Reason Modal ────────────────────────────────────────── */}
      <Modal
        isOpen={rejectionModalOpen}
        onClose={cancelRejection}
        title={isArabic ? 'سبب رفض الطلب' : 'Order Rejection Reason'}
        className="z-[90]"
        footer={(
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="ghost" className="flex-1" onClick={cancelRejection}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="danger" className="flex-1" onClick={confirmRejection}>
              {isArabic ? 'تأكيد الرفض' : 'Confirm Rejection'}
            </Button>
          </div>
        )}
      >
        <div className="space-y-3">
          <p className="text-sm text-[var(--color-text-secondary)]">
            {isArabic
              ? 'يرجى كتابة السبب الذي سيظهر للعميل عند رفض الطلب.'
              : 'Please write the reason that will be shown to the customer when the order is rejected.'}
          </p>
          <textarea
            className={textareaClassName}
            value={rejectionText}
            onChange={(e) => setRejectionText(e.target.value)}
            placeholder={isArabic ? 'اكتب سبب الرفض هنا...' : 'Enter rejection reason here...'}
            autoFocus
            rows={4}
          />
        </div>
      </Modal>
    </div>
  );
};

export default AdminOrders;
