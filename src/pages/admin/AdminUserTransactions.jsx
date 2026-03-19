import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Eye,
  PlusCircle,
  ReceiptText,
  ShoppingCart,
  Wallet,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAdminStore from '../../store/useAdminStore';
import useOrderStore from '../../store/useOrderStore';
import useTopupStore from '../../store/useTopupStore';
import useAuthStore from '../../store/useAuthStore';
import useSystemStore from '../../store/useSystemStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { useToast } from '../../components/ui/Toast';
import { formatDateTime, formatNumber, getNumericLocale } from '../../utils/intl';
import { formatCurrencyAmount } from '../../utils/pricing';
import { getOrderStatusMeta } from '../../utils/orders';

const asNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const topupStatusMeta = (status, isArabic) => {
  const token = String(status || '').trim().toLowerCase();
  if (['approved', 'completed', 'success'].includes(token)) {
    return { variant: 'success', label: isArabic ? 'مكتملة' : 'Completed' };
  }
  if (['pending', 'requested', 'processing', 'under_review'].includes(token)) {
    return { variant: 'warning', label: isArabic ? 'قيد التنفيذ' : 'In progress' };
  }
  return { variant: 'danger', label: isArabic ? 'غير مكتملة' : 'Incomplete' };
};

const SummaryCard = ({ icon: Icon, label, value, note }) => (
  <Card className="admin-premium-stat p-2 sm:p-3">
    <div className="flex items-start gap-1.5 sm:gap-2">
      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[0.65rem] border border-[color:rgb(var(--color-primary-rgb)/0.2)] bg-[color:rgb(var(--color-primary-rgb)/0.09)] text-[var(--color-primary)] sm:h-9 sm:w-9">
        <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] leading-tight text-[var(--color-text-secondary)] sm:text-xs">{label}</p>
        <p className="mt-0.5 text-sm font-semibold leading-tight text-[var(--color-text)] sm:text-xl">{value}</p>
        {note ? <p className="mt-0.5 text-[10px] text-[var(--color-muted)] sm:text-xs">{note}</p> : null}
      </div>
    </div>
  </Card>
);

const AdminUserTransactions = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { addToast } = useToast();
  const actor = useAuthStore((state) => state.user);
  const { users, loadUsers, updateUserCoins } = useAdminStore();
  const { orders, loadOrders } = useOrderStore();
  const { topups, loadTopups } = useTopupStore();
  const { currencies, loadCurrencies } = useSystemStore();

  const [isLoading, setIsLoading] = useState(true);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [targetBalance, setTargetBalance] = useState('');
  const [isBalanceUpdating, setIsBalanceUpdating] = useState(false);
  const [detailsItem, setDetailsItem] = useState(null);

  const isArabic = String(i18n.resolvedLanguage || i18n.language || 'ar').toLowerCase().startsWith('ar');
  const locale = getNumericLocale(isArabic ? 'ar-EG' : 'en-US');

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    Promise.allSettled([
      Promise.resolve(loadUsers({ force: true })),
      Promise.resolve(loadOrders(userId, { force: true })),
      Promise.resolve(loadTopups({ force: true })),
      Promise.resolve(loadCurrencies()),
    ]).finally(() => {
      if (active) setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, [loadCurrencies, loadOrders, loadTopups, loadUsers, userId]);

  const selectedUser = useMemo(
    () => (users || []).find((entry) => String(entry?.id) === String(userId)),
    [userId, users]
  );

  const userCurrencyCode = String(selectedUser?.currency || 'USD').toUpperCase();
  const currentBalance = asNumber(selectedUser?.coins);

  const formatMoney = (amount, currencyCode = userCurrencyCode) => {
    const safeAmount = asNumber(amount);
    return formatCurrencyAmount(safeAmount, String(currencyCode || userCurrencyCode).toUpperCase(), currencies, locale);
  };

  const formatSignedMoney = (amount, currencyCode = userCurrencyCode) => {
    const safeAmount = asNumber(amount);
    const sign = safeAmount > 0 ? '+' : safeAmount < 0 ? '-' : '';
    return `${sign}${formatMoney(Math.abs(safeAmount), currencyCode)}`;
  };

  const userOrders = useMemo(
    () => (orders || [])
      .filter((entry) => String(entry?.userId || '') === String(userId))
      .sort((a, b) => new Date(b?.createdAt || b?.date || 0) - new Date(a?.createdAt || a?.date || 0)),
    [orders, userId]
  );

  const userTopups = useMemo(
    () => (topups || [])
      .filter((entry) => String(entry?.userId || '') === String(userId))
      .sort((a, b) => new Date(b?.createdAt || b?.date || 0) - new Date(a?.createdAt || a?.date || 0)),
    [topups, userId]
  );

  const operations = useMemo(() => {
    const orderOps = userOrders.map((order) => {
      const amount = asNumber(
        order?.financialSnapshot?.finalAmountAtExecution
        ?? order?.priceCoins
        ?? order?.totalAmount
        ?? 0
      );
      return {
        id: `order-${order.id}`,
        source: 'order',
        sourceId: order.id,
        status: String(order?.status || '').toLowerCase(),
        date: order?.createdAt || order?.date,
        amount: -Math.abs(amount),
        currencyCode: order?.currencyCode || userCurrencyCode,
        title: isArabic ? 'طلب شراء' : 'Order purchase',
        subtitle: order?.productNameAr || order?.productName || order?.productId || '-',
        raw: order,
      };
    });

    const topupOps = userTopups.map((topup) => {
      const amount = asNumber(topup?.actualPaidAmount ?? topup?.requestedAmount ?? topup?.amount ?? 0);
      return {
        id: `topup-${topup.id}`,
        source: 'topup',
        sourceId: topup.id,
        status: String(topup?.status || '').toLowerCase(),
        date: topup?.createdAt || topup?.date,
        amount: amount,
        currencyCode: topup?.currencyCode || userCurrencyCode,
        title: isArabic ? 'عملية شحن رصيد' : 'Balance topup',
        subtitle: topup?.paymentChannel || topup?.method || '-',
        raw: topup,
      };
    });

    return [...orderOps, ...topupOps]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [isArabic, userCurrencyCode, userOrders, userTopups]);

  const handleBalanceUpdate = async (delta) => {
    if (!selectedUser) return;
    const safeDelta = asNumber(delta);
    if (!safeDelta) return;
    if (currentBalance + safeDelta < 0) {
      addToast('لا يمكن جعل الرصيد أقل من صفر.', 'error');
      return;
    }

    setIsBalanceUpdating(true);
    try {
      await updateUserCoins(selectedUser.id, safeDelta, actor);
      await loadUsers({ force: true });
      addToast(
        safeDelta > 0 ? 'تمت زيادة الرصيد بنجاح.' : 'تم خصم الرصيد بنجاح.',
        'success'
      );
    } catch (error) {
      addToast(error?.message || 'تعذر تحديث الرصيد.', 'error');
    } finally {
      setIsBalanceUpdating(false);
    }
  };

  const handleAddBalance = async () => {
    const amount = asNumber(adjustAmount);
    if (amount <= 0) {
      addToast('أدخل مبلغًا صحيحًا.', 'error');
      return;
    }
    await handleBalanceUpdate(amount);
    setAdjustAmount('');
  };

  const handleDeductBalance = async () => {
    const amount = asNumber(adjustAmount);
    if (amount <= 0) {
      addToast('أدخل مبلغًا صحيحًا.', 'error');
      return;
    }
    await handleBalanceUpdate(-amount);
    setAdjustAmount('');
  };

  const handleSetBalance = async () => {
    const target = asNumber(targetBalance);
    if (target < 0) {
      addToast('الرصيد المستهدف يجب أن يكون أكبر من أو يساوي صفر.', 'error');
      return;
    }
    const delta = target - currentBalance;
    if (delta === 0) {
      addToast('الرصيد الحالي مطابق للقيمة المطلوبة.', 'info');
      return;
    }
    await handleBalanceUpdate(delta);
    setTargetBalance('');
  };

  const renderOperationStatus = (item) => {
    if (item.source === 'order') {
      const statusMeta = getOrderStatusMeta(item.status, isArabic ? 'ar' : 'en');
      return <Badge variant={statusMeta.variant} className="px-2 py-0.5 text-[10px]">{statusMeta.label}</Badge>;
    }

    const statusMeta = topupStatusMeta(item.status, isArabic);
    return <Badge variant={statusMeta.variant} className="px-2 py-0.5 text-[10px]">{statusMeta.label}</Badge>;
  };

  return (
    <div className="min-w-0 space-y-2 sm:space-y-4">
      <section className="admin-premium-hero space-y-2 p-2 sm:space-y-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-3">
          <div>
            <h1 className="text-lg font-bold text-[var(--color-text)] sm:text-2xl">
              {isArabic ? 'معاملات الحساب' : 'Account Transactions'}
            </h1>
            <p className="mt-0.5 text-[11px] leading-4 text-[var(--color-text-secondary)] sm:text-sm">
              {isArabic ? 'عرض كل الطلبات والمعاملات المالية الخاصة بالمستخدم وإدارة رصيده.' : 'Review all user orders and financial operations with balance controls.'}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate('/admin/users')} className="h-8 gap-1 px-2 text-[11px] sm:h-10 sm:gap-2 sm:px-4 sm:text-sm">
            <ArrowLeft className="h-4 w-4" />
            {isArabic ? 'العودة للمستخدمين' : 'Back to users'}
          </Button>
        </div>

        {selectedUser ? (
          <div className="rounded-[var(--radius-xl)] border border-[color:rgb(var(--color-border-rgb)/0.82)] bg-[color:rgb(var(--color-card-rgb)/0.78)] p-2 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-3">
              <div>
                <p className="text-[13px] font-semibold text-[var(--color-text)] sm:text-base">{selectedUser.name}</p>
                <p className="text-[11px] text-[var(--color-text-secondary)] sm:text-sm">{selectedUser.email}</p>
                <p className="mt-0.5 text-[10px] text-[var(--color-muted)]">ID: {selectedUser.id}</p>
              </div>
              <Badge variant="info" className="px-2 py-0.5 text-[10px]">{selectedUser.currency || 'USD'}</Badge>
            </div>
          </div>
        ) : null}
      </section>

      {isLoading ? (
        <Card className="admin-premium-panel p-2 text-[11px] text-[var(--color-text-secondary)] sm:p-4 sm:text-sm">
          {isArabic ? 'جارٍ تحميل بيانات المستخدم والمعاملات...' : 'Loading user transactions...'}
        </Card>
      ) : null}

      {!isLoading && !selectedUser ? (
        <Card className="admin-premium-panel p-2 sm:p-4">
          <p className="text-[11px] text-[var(--color-text-secondary)] sm:text-sm">
            {isArabic ? 'لم يتم العثور على هذا المستخدم.' : 'User not found.'}
          </p>
        </Card>
      ) : null}

      {selectedUser ? (
        <>
      <div className="grid grid-cols-2 gap-1.5 sm:gap-3 xl:grid-cols-4">
        <SummaryCard icon={Wallet} label={isArabic ? 'الرصيد الحالي' : 'Current balance'} value={formatMoney(currentBalance)} />
        <SummaryCard icon={ShoppingCart} label={isArabic ? 'عدد الطلبات' : 'Orders count'} value={formatNumber(userOrders.length, locale)} />
        <SummaryCard icon={ReceiptText} label={isArabic ? 'عدد المعاملات' : 'Operations count'} value={formatNumber(operations.length, locale)} />
        <SummaryCard icon={CheckCircle2} label={isArabic ? 'عمليات الشحن' : 'Topups'} value={formatNumber(userTopups.length, locale)} />
      </div>

      <Card className="admin-premium-panel p-2 sm:p-4">
        <h2 className="mb-1.5 text-[13px] font-semibold text-[var(--color-text)] sm:mb-3 sm:text-base">{isArabic ? 'تعديل الرصيد' : 'Balance Controls'}</h2>
        <div className="grid gap-2 lg:grid-cols-2">
          <div className="rounded-[var(--radius-lg)] border border-[color:rgb(var(--color-border-rgb)/0.8)] p-2 sm:p-3">
            <p className="text-[11px] text-[var(--color-text-secondary)]">{isArabic ? 'زيادة / خصم' : 'Add / Deduct'}</p>
            <Input
              type="number"
              min="0"
              value={adjustAmount}
              onChange={(event) => setAdjustAmount(event.target.value)}
              placeholder={isArabic ? 'أدخل المبلغ' : 'Enter amount'}
              className="mt-1.5 h-9 px-2 py-1.5 text-xs sm:mt-2 sm:h-11 sm:px-4 sm:py-3 sm:text-sm"
            />
            <div className="mt-1.5 flex gap-1.5 sm:mt-2 sm:gap-2">
              <Button size="sm" onClick={handleAddBalance} disabled={isBalanceUpdating} className="h-8 flex-1 gap-1 px-2 text-[11px] sm:h-10 sm:gap-2 sm:px-4 sm:text-sm">
                <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {isArabic ? 'زيادة' : 'Add'}
              </Button>
              <Button size="sm" variant="danger" onClick={handleDeductBalance} disabled={isBalanceUpdating} className="h-8 flex-1 gap-1 px-2 text-[11px] sm:h-10 sm:gap-2 sm:px-4 sm:text-sm">
                <Clock3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {isArabic ? 'خصم' : 'Deduct'}
              </Button>
            </div>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[color:rgb(var(--color-border-rgb)/0.8)] p-2 sm:p-3">
            <p className="text-[11px] text-[var(--color-text-secondary)]">{isArabic ? 'تعيين رصيد محدد' : 'Set exact balance'}</p>
            <Input
              type="number"
              min="0"
              value={targetBalance}
              onChange={(event) => setTargetBalance(event.target.value)}
              placeholder={isArabic ? 'مثال: 500' : 'e.g. 500'}
              className="mt-1.5 h-9 px-2 py-1.5 text-xs sm:mt-2 sm:h-11 sm:px-4 sm:py-3 sm:text-sm"
            />
            <Button size="sm" variant="outline" onClick={handleSetBalance} disabled={isBalanceUpdating} className="mt-1.5 h-8 w-full gap-1 px-2 text-[11px] sm:mt-2 sm:h-10 sm:gap-2 sm:px-4 sm:text-sm">
              {isArabic ? 'تعيين الرصيد' : 'Set balance'}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="admin-premium-panel p-2 sm:p-4">
        <div className="mb-1.5 flex items-center justify-between gap-1.5 sm:mb-3 sm:gap-2">
          <h2 className="text-[13px] font-semibold text-[var(--color-text)] sm:text-base">{isArabic ? 'كل العمليات' : 'All operations'}</h2>
          <Badge variant="secondary" className="px-2 py-0.5 text-[10px]">{formatNumber(operations.length, locale)}</Badge>
        </div>

        <div className="space-y-1 lg:hidden">
          {operations.map((item) => (
            <div key={item.id} className="rounded-[var(--radius-lg)] border border-[color:rgb(var(--color-border-rgb)/0.74)] p-2">
              <div className="flex items-start justify-between gap-1.5">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[var(--color-text)]">{item.title}</p>
                  <p className="mt-0.5 truncate text-[11px] text-[var(--color-text-secondary)]">{item.subtitle}</p>
                </div>
                {renderOperationStatus(item)}
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-[var(--color-text-secondary)]">
                <span className="truncate pe-2">{formatDateTime(item.date, locale, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                <span className={`shrink-0 font-semibold ${item.amount >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
                  {formatSignedMoney(item.amount, item.currencyCode)}
                </span>
              </div>
              <Button size="sm" variant="outline" onClick={() => setDetailsItem(item)} className="mt-1.5 h-8 w-full gap-1 px-2 text-[11px] sm:mt-2 sm:h-10 sm:gap-2 sm:px-4 sm:text-sm">
                <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {isArabic ? 'عرض التفاصيل' : 'View details'}
              </Button>
            </div>
          ))}
        </div>

        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isArabic ? 'النوع' : 'Type'}</TableHead>
                <TableHead>{isArabic ? 'الوصف' : 'Description'}</TableHead>
                <TableHead className="text-center">{isArabic ? 'الحالة' : 'Status'}</TableHead>
                <TableHead className="text-center">{isArabic ? 'المبلغ' : 'Amount'}</TableHead>
                <TableHead className="text-center">{isArabic ? 'التاريخ' : 'Date'}</TableHead>
                <TableHead className="text-end">{isArabic ? 'التفاصيل' : 'Details'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operations.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.source === 'order' ? (isArabic ? 'طلب' : 'Order') : (isArabic ? 'شحن' : 'Topup')}</TableCell>
                  <TableCell>
                    <div className="font-medium text-[var(--color-text)]">{item.title}</div>
                    <div className="text-xs text-[var(--color-text-secondary)]">{item.subtitle}</div>
                  </TableCell>
                  <TableCell className="text-center">{renderOperationStatus(item)}</TableCell>
                  <TableCell className={`text-center font-semibold ${item.amount >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
                    {formatSignedMoney(item.amount, item.currencyCode)}
                  </TableCell>
                  <TableCell className="text-center text-xs text-[var(--color-text-secondary)]">
                    {formatDateTime(item.date, locale, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </TableCell>
                  <TableCell className="text-end">
                    <Button size="sm" variant="outline" onClick={() => setDetailsItem(item)}>
                      <Eye className="h-4 w-4" />
                      {isArabic ? 'عرض' : 'View'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
      </>
      ) : null}

      <Modal
        isOpen={Boolean(detailsItem)}
        onClose={() => setDetailsItem(null)}
        title={isArabic ? 'تفاصيل العملية' : 'Operation details'}
        size="lg"
      >
        {detailsItem ? (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[var(--radius-lg)] border border-[color:rgb(var(--color-border-rgb)/0.8)] p-3">
                <p className="text-xs text-[var(--color-text-secondary)]">{isArabic ? 'رقم العملية' : 'Operation ID'}</p>
                <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">#{detailsItem.sourceId}</p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[color:rgb(var(--color-border-rgb)/0.8)] p-3">
                <p className="text-xs text-[var(--color-text-secondary)]">{isArabic ? 'التاريخ' : 'Date'}</p>
                <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                  {formatDateTime(detailsItem.date, locale, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[color:rgb(var(--color-border-rgb)/0.8)] p-3">
                <p className="text-xs text-[var(--color-text-secondary)]">{isArabic ? 'المبلغ' : 'Amount'}</p>
                <p className={`mt-1 text-sm font-semibold ${detailsItem.amount >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
                  {formatSignedMoney(detailsItem.amount, detailsItem.currencyCode)}
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[color:rgb(var(--color-border-rgb)/0.8)] p-3">
                <p className="text-xs text-[var(--color-text-secondary)]">{isArabic ? 'نوع العملية' : 'Operation type'}</p>
                <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                  {detailsItem.source === 'order' ? (isArabic ? 'طلب شراء' : 'Order purchase') : (isArabic ? 'شحن رصيد' : 'Balance topup')}
                </p>
              </div>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[color:rgb(var(--color-border-rgb)/0.8)] p-3">
              {detailsItem.source === 'order' ? (
                <div className="space-y-2 text-sm text-[var(--color-text)]">
                  <p><span className="text-[var(--color-text-secondary)]">{isArabic ? 'المنتج:' : 'Product:'}</span> {detailsItem.raw?.productNameAr || detailsItem.raw?.productName || detailsItem.raw?.productId || '-'}</p>
                  <p><span className="text-[var(--color-text-secondary)]">{isArabic ? 'الكمية:' : 'Quantity:'}</span> {asNumber(detailsItem.raw?.quantity || 1)}</p>
                  <p><span className="text-[var(--color-text-secondary)]">{isArabic ? 'الحقول:' : 'Fields:'}</span> {JSON.stringify(detailsItem.raw?.orderFieldsValues || detailsItem.raw?.orderFields || {})}</p>
                </div>
              ) : (
                <div className="space-y-2 text-sm text-[var(--color-text)]">
                  <p><span className="text-[var(--color-text-secondary)]">{isArabic ? 'طريقة الدفع:' : 'Payment channel:'}</span> {detailsItem.raw?.paymentChannel || detailsItem.raw?.method || '-'}</p>
                  <p><span className="text-[var(--color-text-secondary)]">{isArabic ? 'المبلغ المطلوب:' : 'Requested amount:'}</span> {formatMoney(detailsItem.raw?.requestedAmount ?? detailsItem.raw?.amount ?? 0, detailsItem.raw?.currencyCode)}</p>
                  <p><span className="text-[var(--color-text-secondary)]">{isArabic ? 'المبلغ المعتمد:' : 'Approved amount:'}</span> {detailsItem.raw?.actualPaidAmount ? formatMoney(detailsItem.raw.actualPaidAmount, detailsItem.raw?.currencyCode) : '-'}</p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default AdminUserTransactions;
