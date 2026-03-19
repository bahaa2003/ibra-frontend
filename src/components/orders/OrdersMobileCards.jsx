import React from 'react';
import { Eye } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import OrderStatusBadge from './OrderStatusBadge';
import { formatOrderDateTime, formatOrderMoney } from '../../utils/orders';

const OrdersMobileCards = ({ orders, isArabic, currencies, onViewOrder }) => {
  const locale = isArabic ? 'ar-EG' : 'en-US';

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Card key={order.id} variant="flat" className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-16 w-16 overflow-hidden rounded-[1rem] border border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-card-rgb)/0.82)]">
              {order.productImage ? (
                <img src={order.productImage} alt={order.productName} loading="lazy" decoding="async" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--color-text)]">{order.productName}</p>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">#{order.orderNumber}</p>
                </div>
                <OrderStatusBadge status={order.status} isArabic={isArabic} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant={order.typeVariant}>{order.typeLabel}</Badge>
                {order.supplierName ? (
                  <Badge variant="secondary">{order.supplierName}</Badge>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-[1rem] border border-[color:rgb(var(--color-border-rgb)/0.78)] bg-[color:rgb(var(--color-card-rgb)/0.74)] p-3">
              <img
                src={order.customerAvatar}
                alt={order.customerName}
                loading="lazy"
                decoding="async"
                className="h-10 w-10 rounded-full border border-[color:rgb(var(--color-border-rgb)/0.9)] object-cover"
              />
              <div className="min-w-0">
                <p className="truncate font-medium text-[var(--color-text)]">{order.customerName}</p>
                <p className="truncate text-xs text-[var(--color-muted)]">{order.customerEmail || '-'}</p>
              </div>
            </div>

            <div className="rounded-[1rem] border border-[color:rgb(var(--color-border-rgb)/0.78)] bg-[color:rgb(var(--color-card-rgb)/0.74)] p-3">
              <p className="text-xs text-[var(--color-muted)]">{isArabic ? 'التاريخ' : 'Date'}</p>
              <p className="mt-1 font-medium text-[var(--color-text)]">{formatOrderDateTime(order.createdAt, locale)}</p>
            </div>

            <div className="rounded-[1rem] border border-[color:rgb(var(--color-border-rgb)/0.78)] bg-[color:rgb(var(--color-card-rgb)/0.74)] p-3">
              <p className="text-xs text-[var(--color-muted)]">{isArabic ? 'الإجمالي' : 'Total'}</p>
              <p className="mt-1 font-semibold text-[var(--color-text)]">{formatOrderMoney(order, currencies, locale)}</p>
            </div>

            <div className="rounded-[1rem] border border-[color:rgb(var(--color-border-rgb)/0.78)] bg-[color:rgb(var(--color-card-rgb)/0.74)] p-3">
              <p className="text-xs text-[var(--color-muted)]">{isArabic ? 'المورد' : 'Supplier'}</p>
              <p className="mt-1 font-medium text-[var(--color-text)]">
                {order.supplierName || (isArabic ? 'بدون مورد' : 'No supplier')}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <Button variant="secondary" className="w-full" onClick={() => onViewOrder(order)}>
              <Eye className="h-4 w-4" />
              <span>{isArabic ? 'عرض التفاصيل' : 'View details'}</span>
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default React.memo(OrdersMobileCards);
