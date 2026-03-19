import React from 'react';
import { CreditCard } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { cn } from '../ui/Button';
import EmptyState from './EmptyState';
import StatusBadge from './StatusBadge';

const isPendingLike = (status) => ['pending', 'requested', 'under_review', 'processing'].includes(String(status || '').trim().toLowerCase());

const getTopupEmail = (topup, isArabic) => (
  topup?.userEmail
  || topup?.email
  || topup?.contactEmail
  || (isArabic ? 'لا يوجد بريد إلكتروني' : 'No email available')
);

const getTopupName = (topup, isArabic) => (
  topup?.userName
  || topup?.userId
  || (isArabic ? 'مستخدم غير معروف' : 'Unknown user')
);

const ManualTopupsSection = ({
  topups,
  pendingCount,
  isArabic,
  formatDate,
  formatMoney,
}) => {
  return (
    <Card variant="elevated" className="mx-auto w-[calc(100vw-1.5rem)] max-w-[42rem] p-4 sm:w-full sm:p-6 xl:max-w-none">
      <div className={cn(
        'mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between',
        isArabic ? 'items-end text-right sm:flex-row-reverse' : 'items-start text-left'
      )}>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-[var(--color-text)] sm:text-xl">
            {isArabic ? 'طلبات الشحن اليدوي' : 'Manual Topup Requests'}
          </h2>
          <p className="mt-1.5 text-xs leading-6 text-[var(--color-text-secondary)] sm:text-sm">
            {isArabic
              ? 'متابعة أحدث طلبات الشحن اليدوي مع إبراز الطلبات التي ما زالت بانتظار المراجعة.'
              : 'Track the latest manual wallet topups and highlight the ones still waiting for review.'}
          </p>
        </div>
        <Badge variant={pendingCount > 0 ? 'warning' : 'premium'} className="shrink-0 text-[10px] sm:text-[11px]">
          {isArabic ? `${pendingCount} معلّق` : `${pendingCount} pending`}
        </Badge>
      </div>

      {topups.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title={isArabic ? 'لا توجد طلبات شحن يدوي' : 'No manual topups yet'}
          description={isArabic
            ? 'ستظهر هنا الطلبات اليدوية فور إنشائها من المستخدمين.'
            : 'Manual topup requests will appear here as soon as users submit them.'}
        />
      ) : (
        <>
          <div className="space-y-3 lg:hidden">
            {topups.map((topup) => {
              const isPending = isPendingLike(topup.status);
              const amount = Number(topup.actualPaidAmount ?? topup.requestedAmount ?? topup.amount ?? 0);

              return (
                <article
                  key={topup.id}
                  className={`rounded-[var(--radius-xl)] border p-3.5 sm:p-4 ${
                    isPending
                      ? 'border-[color:rgb(var(--color-warning-rgb)/0.36)] bg-[color:rgb(var(--color-warning-rgb)/0.08)]'
                      : 'border-[color:rgb(var(--color-border-rgb)/0.85)] bg-[color:rgb(var(--color-card-rgb)/0.78)]'
                  }`}
                >
                  <div className={cn('flex items-start justify-between gap-3', isArabic && 'flex-row-reverse text-right')}>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                        {getTopupName(topup, isArabic)}
                      </p>
                      <p className="mt-1 truncate text-xs text-[var(--color-muted)]">
                        {getTopupEmail(topup, isArabic)}
                      </p>
                    </div>
                    <StatusBadge status={topup.status} isArabic={isArabic} />
                  </div>

                  <div className={cn('mt-3 grid grid-cols-1 gap-2.5 text-sm sm:grid-cols-2 sm:gap-3', isArabic && 'text-right')}>
                    <div>
                      <p className="text-[var(--color-muted)]">{isArabic ? 'المبلغ' : 'Amount'}</p>
                      <p className="mt-1 font-medium text-[var(--color-text)]">
                        {formatMoney(amount, topup.currencyCode)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[var(--color-muted)]">{isArabic ? 'وسيلة الدفع' : 'Payment method'}</p>
                      <p className="mt-1 font-medium text-[var(--color-text)]">
                        {topup.paymentChannel || topup.method || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[var(--color-muted)]">{isArabic ? 'الوقت' : 'Time'}</p>
                      <p className="mt-1 font-medium text-[var(--color-text)]">{formatDate(topup.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-muted)]">{isArabic ? 'العملة' : 'Currency'}</p>
                      <p className="mt-1 font-medium text-[var(--color-text)]">{topup.currencyCode || '-'}</p>
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
                  <TableHead>{isArabic ? 'البريد الإلكتروني' : 'Email'}</TableHead>
                  <TableHead>{isArabic ? 'المستخدم' : 'User'}</TableHead>
                  <TableHead>{isArabic ? 'المبلغ' : 'Amount'}</TableHead>
                  <TableHead>{isArabic ? 'وسيلة الدفع' : 'Payment method'}</TableHead>
                  <TableHead>{isArabic ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead>{isArabic ? 'الوقت' : 'Time'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topups.map((topup) => {
                  const amount = Number(topup.actualPaidAmount ?? topup.requestedAmount ?? topup.amount ?? 0);
                  const rowClassName = isPendingLike(topup.status)
                    ? 'bg-[color:rgb(var(--color-warning-rgb)/0.05)]'
                    : '';

                  return (
                    <TableRow key={topup.id} className={rowClassName}>
                      <TableCell className="font-medium text-[var(--color-text)]">{getTopupEmail(topup, isArabic)}</TableCell>
                      <TableCell>{getTopupName(topup, isArabic)}</TableCell>
                      <TableCell>{formatMoney(amount, topup.currencyCode)}</TableCell>
                      <TableCell>{topup.paymentChannel || topup.method || '-'}</TableCell>
                      <TableCell>
                        <StatusBadge status={topup.status} isArabic={isArabic} />
                      </TableCell>
                      <TableCell>{formatDate(topup.createdAt)}</TableCell>
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

export default ManualTopupsSection;
