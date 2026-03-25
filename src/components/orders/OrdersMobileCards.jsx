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
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
      {orders.map((order) => (
        <Card key={order.id} variant="flat" className="p-2.5 sm:p-3">
          <div className="mb-1.5 flex items-start justify-start [direction:ltr]">
            <OrderStatusBadge status={order.status} isArabic={isArabic} className="shrink-0" />
          </div>

          <div className="min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="line-clamp-2 text-[13px] font-semibold leading-5 text-[var(--color-text)]">
                {order.productName}
              </p>
              <p className="shrink-0 text-[10px] font-medium text-[var(--color-muted)]">
                {formatOrderDateTime(order.createdAt, locale)}
              </p>
            </div>
            <p className="mt-1 text-[13px] font-semibold text-[var(--color-text)]">
              {formatOrderMoney(order, currencies, locale)}
            </p>
          </div>

          <div className="mt-2 rounded-[0.9rem] border border-[color:rgb(var(--color-border-rgb)/0.72)] bg-[color:rgb(var(--color-card-rgb)/0.7)] px-2.5 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] text-[var(--color-muted)]">
                  {isArabic ? 'اسم المستخدم' : 'Customer name'}
                </p>
                <p className="mt-0.5 truncate text-[13px] font-medium text-[var(--color-text)]">
                  {order.customerName}
                </p>
              </div>
              <p className="shrink-0 text-[10px] text-[var(--color-text-secondary)]">
                #{order.siteOrderNumber || order.orderNumber}
              </p>
            </div>
            <p className="mt-0.5 truncate text-[10px] text-[var(--color-text-secondary)]">
              {order.customerEmail || '-'}
            </p>
          </div>

          {order.primaryIdentifierField ? (
            <div className="mt-1.5 flex items-center justify-between gap-2 rounded-[0.85rem] bg-[color:rgb(var(--color-surface-rgb)/0.52)] px-2.5 py-1.5">
              <p className="truncate text-[10px] text-[var(--color-text-secondary)]">
                {order.primaryIdentifierField.label}: <span className="font-medium text-[var(--color-text)]">{order.primaryIdentifierField.value}</span>
              </p>
            </div>
          ) : null}

          <div className="mt-2">
            <Button variant="secondary" className="h-8.5 w-full rounded-[0.85rem] text-[11px]" onClick={() => onViewOrder(order)}>
              <Eye className="h-3.5 w-3.5" />
              <span>{isArabic ? 'عرض التفاصيل' : 'View details'}</span>
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default React.memo(OrdersMobileCards);
