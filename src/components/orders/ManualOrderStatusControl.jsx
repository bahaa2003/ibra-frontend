import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import Button, { cn } from '../ui/Button';
import {
  createManualOrderStatusOptions,
  getManualOrderStatusLabel,
  normalizeManualOrderStatus,
} from '../../utils/orders';

const ManualOrderStatusControl = ({
  order,
  isArabic,
  isLoading = false,
  onSubmit = () => {},
  compact = false,
  className = '',
}) => {
  const language = isArabic ? 'ar' : 'en';
  const [selectedStatus, setSelectedStatus] = useState(normalizeManualOrderStatus(order?.status));

  useEffect(() => {
    setSelectedStatus(normalizeManualOrderStatus(order?.status));
  }, [order?.id, order?.status]);

  const options = useMemo(
    () => createManualOrderStatusOptions(language),
    [language]
  );

  const currentStatus = normalizeManualOrderStatus(order?.status);
  const isDirty = selectedStatus !== currentStatus;

  return (
    <div className={cn(
      'flex min-w-0 flex-col gap-2',
      className
    )}>
      <div className="min-w-0">
        <span className={cn(
          'mb-1 block font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]',
          compact ? 'text-[10px]' : 'text-xs'
        )}>
          {isArabic ? 'الحالة اليدوية' : 'Manual status'}
        </span>
        <div className={cn('grid gap-2', compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2')}>
          {options.map((option) => {
            const isSelected = selectedStatus === option.value;
            return (
              <button
                key={option.value}
                type="button"
                disabled={isLoading}
                onClick={() => setSelectedStatus(option.value)}
                className={cn(
                  'w-full rounded-[0.9rem] border px-3 py-2.5 text-start transition-colors',
                  'disabled:cursor-not-allowed disabled:opacity-60',
                  isSelected
                    ? 'border-[color:rgb(var(--color-primary-rgb)/0.5)] bg-[color:rgb(var(--color-primary-rgb)/0.12)]'
                    : 'border-[color:rgb(var(--color-border-rgb)/0.85)] bg-[color:rgb(var(--color-card-rgb)/0.82)] hover:border-[color:rgb(var(--color-primary-rgb)/0.35)]'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-[var(--color-text)]">{option.label}</p>
                  {isSelected ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-primary)]" /> : null}
                </div>
                {option.description ? (
                  <p className="mt-1 text-[11px] leading-5 text-[var(--color-text-secondary)]">
                    {option.description}
                  </p>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <Button
        type="button"
        variant={selectedStatus === 'completed' ? 'primary' : selectedStatus === 'rejected' ? 'danger' : 'secondary'}
        className={cn(
          compact
            ? 'h-9 w-full shrink-0 rounded-lg px-3 text-xs sm:w-auto sm:min-w-[132px]'
            : 'h-11 w-full shrink-0 rounded-[1rem] px-4 sm:w-auto'
        )}
        disabled={isLoading || !isDirty}
        onClick={() => onSubmit(order, selectedStatus)}
      >
        <span>
          {compact
            ? (isArabic ? 'حفظ الحالة' : 'Save status')
            : (
              isArabic
                ? `تحديث إلى ${getManualOrderStatusLabel(selectedStatus, language)}`
                : `Update to ${getManualOrderStatusLabel(selectedStatus, language)}`
            )}
        </span>
      </Button>
    </div>
  );
};

export default React.memo(ManualOrderStatusControl);
