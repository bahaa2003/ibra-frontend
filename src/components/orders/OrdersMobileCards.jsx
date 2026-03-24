import React from 'react';
import { Eye } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import OrderStatusBadge from './OrderStatusBadge';
import { formatOrderDateTime, formatOrderMoney } from '../../utils/orders';

const OrdersMobileCards = ({
  orders,
  isArabic,
  currencies,
  onViewOrder,
}) => {
  const locale = isArabic ? 'ar-EG' : 'en-US';

  return (
    <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
      {orders.map((order) => (
        <Card key={order.id} variant="flat" className="p-3 sm:p-3.5">
          <div className="mb-2 flex items-start justify-start [direction:ltr]">
            <OrderStatusBadge status={order.status} isArabic={isArabic} className="shrink-0" />
          </div>

          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-semibold text-[var(--color-text)]">
              {order.productName}
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
              {formatOrderMoney(order, currencies, locale)}
            </p>
          </div>

          <div className="mt-3 space-y-2">
            <div className="rounded-[0.95rem] border border-[color:rgb(var(--color-border-rgb)/0.76)] bg-[color:rgb(var(--color-card-rgb)/0.72)] px-3 py-2">
              <p className="text-[10px] text-[var(--color-muted)]">
                {isArabic ? 'اسم المستخدم' : 'Customer name'}
              </p>
              <p className="mt-1 truncate text-sm font-medium text-[var(--color-text)]">
                {order.customerName}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-[var(--color-text-secondary)]">
                {order.customerEmail || '-'}
              </p>
            </div>

            <div className="rounded-[0.95rem] border border-[color:rgb(var(--color-border-rgb)/0.76)] bg-[color:rgb(var(--color-card-rgb)/0.72)] px-3 py-2">
              <p className="text-[10px] text-[var(--color-muted)]">
                {isArabic ? 'التاريخ' : 'Date'}
              </p>
              <p className="mt-1 text-[13px] font-medium text-[var(--color-text)]">
                {formatOrderDateTime(order.createdAt, locale)}
              </p>
            </div>
          </div>

          <div className="mt-3">
            <Button variant="secondary" className="h-9 w-full rounded-[0.9rem] text-xs" onClick={() => onViewOrder(order)}>
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
