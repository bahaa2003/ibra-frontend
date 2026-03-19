import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, Package, RefreshCw, User, X } from 'lucide-react';
import Badge from '../ui/Badge';
import Button, { cn } from '../ui/Button';
import Card from '../ui/Card';
import OrderStatusBadge from './OrderStatusBadge';
import ManualOrderActions from './ManualOrderActions';
import {
  formatOrderDateTime,
  formatOrderMoney,
} from '../../utils/orders';

const DetailTile = ({ label, value }) => (
  <div className="rounded-[1rem] border border-[color:rgb(var(--color-border-rgb)/0.84)] bg-[color:rgb(var(--color-card-rgb)/0.8)] p-3">
    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]">{label}</p>
    <p className="mt-2 text-sm font-medium text-[var(--color-text)]">{value || '-'}</p>
  </div>
);

const OrderDetailsDrawer = ({
  isOpen,
  onClose,
  order,
  isArabic,
  currencies,
  view = 'admin',
  onAccept = () => {},
  onReject = () => {},
  onSync = () => {},
  isActionLoading = false,
  isSyncing = false,
}) => {
  const locale = isArabic ? 'ar-EG' : 'en-US';

  return (
    <AnimatePresence>
      {isOpen && order ? (
        <>
          <motion.button
            type="button"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/65 backdrop-blur-sm"
            aria-label={isArabic ? 'إغلاق' : 'Close'}
          />

          <div className="pointer-events-none fixed inset-0 z-[81] flex justify-end">
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              className="pointer-events-auto h-full w-full max-w-[42rem] border-s border-[color:rgb(var(--color-border-rgb)/0.92)] bg-[color:rgb(var(--color-surface-rgb)/0.98)] shadow-[var(--shadow-medium)]"
            >
              <div className="flex h-full flex-col">
                <div className="border-b border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-card-rgb)/0.76)] px-4 py-4 sm:px-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                        {isArabic ? 'تفاصيل الطلب' : 'Order details'}
                      </p>
                      <h2 className="mt-2 truncate text-xl font-semibold text-[var(--color-text)]">
                        #{order.orderNumber}
                      </h2>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <OrderStatusBadge status={order.status} isArabic={isArabic} />
                        <Badge variant={order.typeVariant}>{order.typeLabel}</Badge>
                        {order.rawStatusLabel ? (
                          <Badge variant="secondary">
                            {isArabic ? 'داخليًا' : 'Internal'}: {order.rawStatusLabel}
                          </Badge>
                        ) : null}
                      </div>
                    </div>

                    <Button variant="ghost" size="icon" onClick={onClose}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                  <div className="space-y-5">
                    <Card variant="premium" className="overflow-hidden p-4 sm:p-5">
                      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(240px,0.8fr)]">
                        <div className="flex items-start gap-4">
                          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[1.3rem] border border-[color:rgb(var(--color-border-rgb)/0.92)] bg-[color:rgb(var(--color-card-rgb)/0.82)]">
                            {order.productImage ? (
                              <img src={order.productImage} alt={order.productName} decoding="async" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[var(--color-muted)]">
                                <Package className="h-6 w-6" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-[var(--color-muted)]">{isArabic ? 'المنتج' : 'Product'}</p>
                            <h3 className="mt-1 text-lg font-semibold text-[var(--color-text)]">{order.productName}</h3>
                            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                              {isArabic ? 'إجمالي الطلب' : 'Order total'}
                            </p>
                            <p className="mt-1 text-2xl font-semibold text-[var(--color-text)]">
                              {formatOrderMoney(order, currencies, locale)}
                            </p>
                          </div>
                        </div>

                        {view === 'admin' ? (
                          <div className="rounded-[1.25rem] border border-[color:rgb(var(--color-border-rgb)/0.88)] bg-[color:rgb(var(--color-card-rgb)/0.78)] p-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={order.customerAvatar}
                                alt={order.customerName}
                                loading="lazy"
                                decoding="async"
                                referrerPolicy="no-referrer"
                                className="h-12 w-12 rounded-full border border-[color:rgb(var(--color-border-rgb)/0.9)] object-cover"
                              />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[var(--color-text)]">{order.customerName}</p>
                                <p className="truncate text-xs text-[var(--color-muted)]">{order.customerEmail || '-'}</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-[1.25rem] border border-[color:rgb(var(--color-border-rgb)/0.88)] bg-[color:rgb(var(--color-card-rgb)/0.78)] p-4">
                            <p className="text-sm text-[var(--color-muted)]">{isArabic ? 'نوع التنفيذ' : 'Fulfilment type'}</p>
                            <div className="mt-2">
                              <Badge variant={order.typeVariant}>{order.typeLabel}</Badge>
                            </div>
                            <p className="mt-3 text-xs leading-6 text-[var(--color-text-secondary)]">
                              {order.typeKey === 'manual'
                                ? (isArabic ? 'يتم تنفيذ هذا الطلب يدويًا من الإدارة.' : 'This order is handled manually by the admin team.')
                                : (isArabic ? 'هذا الطلب مرتبط بمورد خارجي ويتم تتبعه تلقائيًا.' : 'This order is linked to an external supplier and tracked automatically.')}
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <DetailTile
                        label={isArabic ? 'تاريخ الطلب' : 'Order date'}
                        value={formatOrderDateTime(order.createdAt, locale)}
                      />
                      <DetailTile
                        label={isArabic ? 'الكمية' : 'Quantity'}
                        value={order.quantity || 1}
                      />
                      <DetailTile
                        label={isArabic ? 'المورد' : 'Supplier'}
                        value={order.supplierName || (isArabic ? 'بدون مورد' : 'No supplier')}
                      />
                      <DetailTile
                        label={isArabic ? 'المرجع الخارجي' : 'External reference'}
                        value={order.externalOrderId || '-'}
                      />
                      <DetailTile
                        label={isArabic ? 'البريد الإلكتروني' : 'Email'}
                        value={order.customerEmail || '-'}
                      />
                      <DetailTile
                        label={isArabic ? 'رقم الطلب' : 'Order number'}
                        value={`#${order.orderNumber}`}
                      />
                    </div>

                    {order.dynamicFields.length ? (
                      <Card variant="flat" className="p-4">
                        <div className="mb-3">
                          <p className="text-sm font-semibold text-[var(--color-text)]">
                            {isArabic ? 'الحقول المدخلة من العميل' : 'Customer submitted fields'}
                          </p>
                          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                            {isArabic ? 'القيم التي تم إدخالها أثناء إنشاء الطلب.' : 'Values submitted when the order was created.'}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {order.dynamicFields.map((field) => (
                            <DetailTile key={`${order.id}-${field.key}`} label={field.label} value={field.value} />
                          ))}
                        </div>
                      </Card>
                    ) : null}

                    {order.notes ? (
                      <Card variant="flat" className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.18)] bg-[color:rgb(var(--color-primary-rgb)/0.08)] text-[var(--color-primary)]">
                            <Mail className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[var(--color-text)]">
                              {isArabic ? 'ملاحظات الطلب' : 'Order notes'}
                            </p>
                            <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">{order.notes}</p>
                          </div>
                        </div>
                      </Card>
                    ) : null}

                    {view === 'admin' && order.canSync ? (
                      <Card variant="flat" className="p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[var(--color-text)]">
                              {isArabic ? 'مزامنة حالة المورد' : 'Supplier status sync'}
                            </p>
                            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                              {isArabic
                                ? 'استخدم هذا الإجراء لجلب آخر حالة من المورد المرتبط بالطلب.'
                                : 'Use this action to fetch the latest state from the linked supplier.'}
                            </p>
                          </div>

                          <Button variant="secondary" onClick={() => onSync(order)} disabled={isSyncing}>
                            <RefreshCw className={cn('h-4 w-4', isSyncing && 'animate-spin')} />
                            <span>{isArabic ? 'مزامنة الآن' : 'Sync now'}</span>
                          </Button>
                        </div>
                      </Card>
                    ) : null}

                    {view === 'admin' && order.manualActionable ? (
                      <ManualOrderActions
                        order={order}
                        isArabic={isArabic}
                        isLoading={isActionLoading}
                        onAccept={onAccept}
                        onReject={onReject}
                      />
                    ) : null}

                    {view === 'admin' ? (
                      <Card variant="flat" className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-[color:rgb(var(--color-border-rgb)/0.86)] bg-[color:rgb(var(--color-card-rgb)/0.9)] text-[var(--color-text-secondary)]">
                            <User className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[var(--color-text)]">
                              {isArabic ? 'ملخص العميل' : 'Customer summary'}
                            </p>
                            <p className="mt-1 text-sm leading-7 text-[var(--color-text-secondary)]">
                              {isArabic
                                ? `${order.customerName} ${order.customerEmail ? `(${order.customerEmail})` : ''}`
                                : `${order.customerName}${order.customerEmail ? ` (${order.customerEmail})` : ''}`}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ) : null}
                  </div>
                </div>
              </div>
            </motion.aside>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );
};

export default OrderDetailsDrawer;
