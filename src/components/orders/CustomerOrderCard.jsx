import React from 'react';
import { Eye } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import OrderStatusBadge from './OrderStatusBadge';
import {
  formatOrderDateTime,
  formatOrderMoney,
  getCustomerOrderFeedback,
} from '../../utils/orders';

const CustomerOrderCard = ({ order, isArabic, currencies, onSelect }) => {
  const locale = isArabic ? 'ar-EG' : 'en-US';
  const feedback = getCustomerOrderFeedback(order, isArabic ? 'ar' : 'en');
  const orderNumber = order.siteOrderNumber || order.orderNumber;
  const dynamicFields = Array.isArray(order?.dynamicFields) ? order.dynamicFields : [];
  const primaryIdentifierField = order?.primaryIdentifierField || null;
  const secondaryFields = dynamicFields.filter((field) => field.key !== primaryIdentifierField?.key);
  const previewFields = primaryIdentifierField
    ? [primaryIdentifierField, ...secondaryFields.slice(0, 1)]
    : dynamicFields.slice(0, 2);
  const remainingFieldsCount = Math.max(0, (order?.dynamicFields?.length || 0) - previewFields.length);

  return (
    <Card
      variant="default"
      className="group relative overflow-hidden p-3 text-start transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:rgb(var(--color-primary-rgb)/0.36)] hover:shadow-[var(--shadow-medium)] sm:p-3.5"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,transparent,rgb(var(--color-primary-rgb)/0.58),transparent)] opacity-70" />

      <div className="flex items-start gap-3">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[1rem] border border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-card-rgb)/0.82)] sm:h-16 sm:w-16">
          {order.productImage ? (
            <img src={order.productImage} alt={order.productName} loading="lazy" decoding="async" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
          ) : <div className="h-full w-full bg-[color:rgb(var(--color-border-rgb)/0.18)]" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2.5">
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-semibold text-[var(--color-text)] sm:text-[15px]">{order.productName}</p>
              <div className="mt-1 inline-flex rounded-full border border-[color:rgb(var(--color-border-rgb)/0.84)] bg-[color:rgb(var(--color-card-rgb)/0.72)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-muted)]">
                <span>#{orderNumber}</span>
              </div>
            </div>

            <OrderStatusBadge status={order.status} isArabic={isArabic} className="px-2.5 py-1 text-[10px]" />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
            <div className="rounded-full border border-[color:rgb(var(--color-border-rgb)/0.82)] bg-[color:rgb(var(--color-card-rgb)/0.74)] px-2.5 py-1 text-[var(--color-text-secondary)]">
              {formatOrderDateTime(order.createdAt, locale)}
            </div>
            <div className="rounded-full border border-[color:rgb(var(--color-border-rgb)/0.82)] bg-[color:rgb(var(--color-card-rgb)/0.74)] px-2.5 py-1 font-semibold text-[var(--color-text)]">
              {formatOrderMoney(order, currencies, locale)}
            </div>
          </div>

          {previewFields.length ? (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {previewFields.map((field) => (
                <div
                  key={`${order.id}-${field.key}`}
                  className="inline-flex max-w-full items-center gap-1 rounded-full border border-[color:rgb(var(--color-border-rgb)/0.82)] bg-[color:rgb(var(--color-card-rgb)/0.74)] px-2.5 py-1 text-[10px] text-[var(--color-text-secondary)]"
                >
                  <span className="font-semibold text-[var(--color-text)]">{field.label}:</span>
                  <span className="truncate">{field.value}</span>
                </div>
              ))}
              {remainingFieldsCount > 0 ? (
                <div className="inline-flex items-center rounded-full border border-[color:rgb(var(--color-border-rgb)/0.82)] bg-[color:rgb(var(--color-card-rgb)/0.74)] px-2.5 py-1 text-[10px] font-medium text-[var(--color-muted)]">
                  {isArabic ? `+${remainingFieldsCount} بيانات أخرى` : `+${remainingFieldsCount} more`}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-3">
            <Button
              type="button"
              variant={feedback?.tone === 'success' ? 'primary' : 'secondary'}
              className="h-10 w-full rounded-[0.95rem] text-xs sm:text-sm"
              onClick={() => onSelect(order)}
            >
              <Eye className="h-4 w-4" />
              <span>{feedback?.actionLabel || (isArabic ? 'عرض التفاصيل' : 'View details')}</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CustomerOrderCard;
