import React from 'react';
import { Package } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { cn } from '../ui/Button';
import EmptyState from './EmptyState';
import StatusBadge from './StatusBadge';

<<<<<<< HEAD
const getOrderEmail = (order, isArabic) => (
  order?.userEmail
  || order?.email
  || order?.contactEmail
  || (isArabic ? 'لا يوجد بريد إلكتروني' : 'No email available')
);

const getOrderProduct = (order, isArabic) => (
  order?.productName
  || order?.productId
  || (isArabic ? 'منتج غير معروف' : 'Unknown product')
);

const getOrderCustomer = (order) => order?.userName || order?.userId || '-';

=======
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
const RecentOrdersSection = ({
  orders,
  isArabic,
  formatDate,
  formatAmount,
}) => {
  return (
    <Card variant="elevated" className="mx-auto w-[calc(100vw-1.5rem)] max-w-[42rem] p-4 sm:w-full sm:p-6 xl:max-w-none">
      <div className={cn(
        'mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between',
        isArabic ? 'items-end text-right sm:flex-row-reverse' : 'items-start text-left'
      )}>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-[var(--color-text)] sm:text-xl">
            {isArabic ? 'آخر الطلبات' : 'Recent Orders'}
          </h2>
          <p className="mt-1.5 text-xs leading-6 text-[var(--color-text-secondary)] sm:text-sm">
            {isArabic
              ? 'آخر الطلبات التي دخلت النظام مع حالة التنفيذ والمبلغ الأساسي.'
              : 'The newest orders in the system with status and primary amount details.'}
          </p>
        </div>
<<<<<<< HEAD
        <Badge variant="premium" className="shrink-0 text-[10px] sm:text-[11px]">
          {orders.length}
        </Badge>
=======
        <Badge variant="premium" className="shrink-0 text-[10px] sm:text-[11px]">{orders.length}</Badge>
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title={isArabic ? 'لا توجد طلبات حديثة' : 'No recent orders'}
          description={isArabic
            ? 'ستظهر هنا آخر الطلبات بمجرد بدء استقبال طلبات جديدة.'
            : 'The latest orders will appear here once new purchases start coming in.'}
        />
      ) : (
        <>
          <div className="space-y-3 lg:hidden">
            {orders.map((order) => {
              const amount = Number(
                order?.financialSnapshot?.finalAmountAtExecution
                ?? order?.priceCoins
                ?? order?.totalAmount
                ?? 0
              );

              return (
                <article
                  key={order.id}
                  className="rounded-[var(--radius-xl)] border border-[color:rgb(var(--color-border-rgb)/0.85)] bg-[color:rgb(var(--color-card-rgb)/0.78)] p-3.5 sm:p-4"
                >
                  <div className={cn('flex items-start justify-between gap-3', isArabic && 'flex-row-reverse text-right')}>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--color-text)]">
<<<<<<< HEAD
                        {getOrderProduct(order, isArabic)}
                      </p>
                      <p className="mt-1 truncate text-xs text-[var(--color-muted)]">
                        {getOrderEmail(order, isArabic)}
=======
                        {order.productName || order.productId || (isArabic ? 'منتج غير معروف' : 'Unknown product')}
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-muted)]">
                        #{order.id}
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                      </p>
                    </div>
                    <StatusBadge status={order.status} isArabic={isArabic} />
                  </div>

                  <div className={cn('mt-3 grid grid-cols-1 gap-2.5 text-sm sm:grid-cols-2 sm:gap-3', isArabic && 'text-right')}>
                    <div>
                      <p className="text-[var(--color-muted)]">{isArabic ? 'العميل' : 'Customer'}</p>
<<<<<<< HEAD
                      <p className="mt-1 font-medium text-[var(--color-text)]">{getOrderCustomer(order)}</p>
=======
                      <p className="mt-1 font-medium text-[var(--color-text)]">{order.userName || order.userId || '-'}</p>
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                    </div>
                    <div>
                      <p className="text-[var(--color-muted)]">{isArabic ? 'المبلغ' : 'Amount'}</p>
                      <p className="mt-1 font-medium text-[var(--color-text)]">{formatAmount(amount)}</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-muted)]">{isArabic ? 'التاريخ' : 'Date'}</p>
                      <p className="mt-1 font-medium text-[var(--color-text)]">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
<<<<<<< HEAD
                      <p className="text-[var(--color-muted)]">{isArabic ? 'المعرّف الخارجي' : 'External ID'}</p>
=======
                      <p className="text-[var(--color-muted)]">{isArabic ? 'المعرف الخارجي' : 'External ID'}</p>
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                      <p className="mt-1 truncate font-medium text-[var(--color-text)]">{order.externalOrderId || '-'}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
<<<<<<< HEAD
                  <TableHead>{isArabic ? 'البريد الإلكتروني' : 'Email'}</TableHead>
=======
                  <TableHead>{isArabic ? 'رقم الطلب' : 'Order ID'}</TableHead>
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                  <TableHead>{isArabic ? 'العميل' : 'Customer'}</TableHead>
                  <TableHead>{isArabic ? 'المنتج' : 'Product'}</TableHead>
                  <TableHead>{isArabic ? 'المبلغ' : 'Amount'}</TableHead>
                  <TableHead>{isArabic ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead>{isArabic ? 'التاريخ' : 'Date'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const amount = Number(
                    order?.financialSnapshot?.finalAmountAtExecution
                    ?? order?.priceCoins
                    ?? order?.totalAmount
                    ?? 0
                  );

                  return (
                    <TableRow key={order.id}>
<<<<<<< HEAD
                      <TableCell className="font-medium text-[var(--color-text)]">{getOrderEmail(order, isArabic)}</TableCell>
                      <TableCell>{getOrderCustomer(order)}</TableCell>
                      <TableCell className="font-medium text-[var(--color-text)]">
                        {getOrderProduct(order, isArabic)}
=======
                      <TableCell className="font-medium text-[var(--color-text)]">#{order.id}</TableCell>
                      <TableCell>{order.userName || order.userId || '-'}</TableCell>
                      <TableCell className="font-medium text-[var(--color-text)]">
                        {order.productName || order.productId || '-'}
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                      </TableCell>
                      <TableCell>{formatAmount(amount)}</TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} isArabic={isArabic} />
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </Card>
  );
};

export default RecentOrdersSection;
