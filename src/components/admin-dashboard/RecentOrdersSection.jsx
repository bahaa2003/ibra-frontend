import React from 'react';
import { Package } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button, { cn } from '../ui/Button';
import EmptyState from './EmptyState';

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
const getOrderQuantity = (order) => {
  const quantity = Number(order?.quantity ?? order?.qty ?? 1);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
};

const RecentOrdersSection = ({
  orders,
  isArabic,
  onViewOrder = null,
}) => {
  return (
    <Card variant="elevated" className="mx-auto flex max-h-[23rem] w-[calc(100vw-1.5rem)] max-w-[42rem] flex-col overflow-hidden p-3 sm:w-full sm:p-4 xl:max-w-none">
      <div className={cn(
        'mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between',
        isArabic ? 'items-end text-right sm:flex-row-reverse' : 'items-start text-left'
      )}>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-[var(--color-text)] sm:text-lg">
            {isArabic ? 'آخر الطلبات' : 'Recent Orders'}
          </h2>
          <p className="mt-1 text-[11px] leading-5 text-[var(--color-text-secondary)] sm:text-xs">
            {isArabic
              ? 'عرض مختصر للعميل والمنتج والعدد فقط.'
              : 'A compact view with customer, product, and quantity only.'}
          </p>
        </div>
        <Badge variant="premium" className="shrink-0 text-[10px] sm:text-[11px]">
          {orders.length}
        </Badge>
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
        <div className="flex-1 overflow-y-auto pe-1">
          <div className="space-y-2">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-[var(--radius-lg)] border border-[color:rgb(var(--color-border-rgb)/0.84)] bg-[color:rgb(var(--color-card-rgb)/0.76)] px-2.5 py-2"
              >
                <div className={cn('flex items-start gap-2', isArabic && 'flex-row-reverse text-right')}>
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold text-[var(--color-text)]">
                      {getOrderCustomer(order)}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] text-[var(--color-text-secondary)]">
                      {getOrderProduct(order, isArabic)}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] text-[var(--color-muted)]">
                      {getOrderEmail(order, isArabic)}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-[color:rgb(var(--color-primary-rgb)/0.12)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-primary)]">
                    {isArabic ? `العدد ${getOrderQuantity(order)}` : `Qty ${getOrderQuantity(order)}`}
                  </span>
                </div>

                {onViewOrder ? (
                  <div className={cn('mt-1.5 flex', isArabic ? 'justify-start' : 'justify-end')}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 rounded-lg px-2 text-[10px]"
                      onClick={() => onViewOrder(order)}
                    >
                      {isArabic ? 'مراجعة الطلب' : 'Review order'}
                    </Button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default RecentOrdersSection;
