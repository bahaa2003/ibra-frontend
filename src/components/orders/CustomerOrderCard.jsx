import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { cn } from '../ui/Button';
import OrderStatusBadge from './OrderStatusBadge';
import { formatOrderDateTime, formatOrderMoney } from '../../utils/orders';

const CustomerOrderCard = ({ order, isArabic, currencies, onSelect }) => {
  const locale = isArabic ? 'ar-EG' : 'en-US';

  return (
    <button
      type="button"
      onClick={() => onSelect(order)}
      className="w-full text-start"
    >
      <Card
        variant="default"
        className="group relative overflow-hidden p-4 text-start transition-all duration-200 hover:-translate-y-1 hover:border-[color:rgb(var(--color-primary-rgb)/0.36)] hover:shadow-[var(--shadow-medium)] sm:p-5"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,transparent,rgb(var(--color-primary-rgb)/0.58),transparent)] opacity-70" />

        <div className="flex items-start gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[1.25rem] border border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-card-rgb)/0.82)]">
            {order.productImage ? (
              <img src={order.productImage} alt={order.productName} loading="lazy" decoding="async" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-[var(--color-text)]">{order.productName}</p>
                <p className="mt-1 text-xs text-[var(--color-muted)]">#{order.orderNumber}</p>
              </div>

              <div className="flex items-center gap-2">
                <OrderStatusBadge status={order.status} isArabic={isArabic} />
                {isArabic ? (
                  <ChevronLeft className="h-4 w-4 text-[var(--color-muted)] transition-transform duration-200 group-hover:-translate-x-1" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-[var(--color-muted)] transition-transform duration-200 group-hover:translate-x-1" />
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-[1rem] border border-[color:rgb(var(--color-border-rgb)/0.82)] bg-[color:rgb(var(--color-card-rgb)/0.74)] p-3">
                <p className="text-xs text-[var(--color-muted)]">{isArabic ? 'التاريخ' : 'Date'}</p>
                <p className="mt-1 font-medium text-[var(--color-text)]">{formatOrderDateTime(order.createdAt, locale)}</p>
              </div>

              <div className="rounded-[1rem] border border-[color:rgb(var(--color-border-rgb)/0.82)] bg-[color:rgb(var(--color-card-rgb)/0.74)] p-3">
                <p className="text-xs text-[var(--color-muted)]">{isArabic ? 'الإجمالي' : 'Total'}</p>
                <p className="mt-1 font-semibold text-[var(--color-text)]">{formatOrderMoney(order, currencies, locale)}</p>
              </div>

              <div className="rounded-[1rem] border border-[color:rgb(var(--color-border-rgb)/0.82)] bg-[color:rgb(var(--color-card-rgb)/0.74)] p-3">
                <p className="text-xs text-[var(--color-muted)]">{isArabic ? 'الكمية' : 'Quantity'}</p>
                <p className="mt-1 font-medium text-[var(--color-text)]">{order.quantity || 1}</p>
              </div>

              <div className="rounded-[1rem] border border-[color:rgb(var(--color-border-rgb)/0.82)] bg-[color:rgb(var(--color-card-rgb)/0.74)] p-3">
                <p className="text-xs text-[var(--color-muted)]">{isArabic ? 'النوع' : 'Type'}</p>
                <div className="mt-1">
                  <Badge variant={order.typeVariant} className={cn('px-2.5 py-1 text-[11px]')}>
                    {order.typeLabel}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </button>
  );
};

export default CustomerOrderCard;
