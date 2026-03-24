import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import SearchBar from '../ui/SearchBar';
import { cn } from '../ui/Button';
import { selectClassName } from '../ui/Input';
import {
  createOrderDateOptions,
  createOrderSortOptions,
  createOrderStatusOptions,
  createOrderTypeOptions,
} from '../../utils/orders';

const FilterField = ({ label, value, onChange, options, compact = false }) => (
  <label className="min-w-0">
    <span className={cn(
      'block font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]',
      compact ? 'mb-1 text-[11px]' : 'mb-1.5 text-xs'
    )}>
      {label}
    </span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn(
        selectClassName,
        compact
          ? 'h-10 rounded-xl bg-[color:rgb(var(--color-card-rgb)/0.94)] px-3 text-xs'
          : 'h-12 rounded-[1.1rem] bg-[color:rgb(var(--color-card-rgb)/0.94)] px-4 text-sm'
      )}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

const OrdersFiltersBar = ({
  isArabic,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter = 'all',
  onTypeChange = () => {},
  dateFilter = 'all',
  onDateChange = () => {},
  sortOrder = 'newest',
  onSortChange = () => {},
  resultCount = 0,
  searchPlaceholder,
  helperText,
  showTypeFilter = true,
  showDateFilter = true,
  showSort = true,
  panelClassName = '',
  compact = false,
}) => {
  const language = isArabic ? 'ar' : 'en';
  const statusOptions = createOrderStatusOptions(language);
  const typeOptions = createOrderTypeOptions(language);
  const dateOptions = createOrderDateOptions(language);
  const sortOptions = createOrderSortOptions(language);

  return (
    <Card variant="default" className={cn(compact ? 'p-3 sm:p-4' : 'p-4 sm:p-5', panelClassName)}>
      <div className={cn('flex flex-col', compact ? 'gap-3' : 'gap-4')}>
        <div className={cn('flex flex-col xl:flex-row xl:items-center', compact ? 'gap-3' : 'gap-4')}>
          <div className="min-w-0 flex-1">
            <SearchBar
              value={searchTerm}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
              inputClassName={compact ? 'h-10 rounded-xl text-sm shadow-none focus:shadow-none' : ''}
            />
          </div>

          <div className={cn(
            'grid min-w-0 flex-1 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
            compact ? 'gap-2' : 'gap-3'
          )}>
            <FilterField
              label={isArabic ? 'الحالة' : 'Status'}
              value={statusFilter}
              onChange={onStatusChange}
              options={statusOptions}
              compact={compact}
            />

            {showTypeFilter ? (
              <FilterField
                label={isArabic ? 'النوع' : 'Type'}
                value={typeFilter}
                onChange={onTypeChange}
                options={typeOptions}
                compact={compact}
              />
            ) : null}

            {showDateFilter ? (
              <FilterField
                label={isArabic ? 'التاريخ' : 'Date'}
                value={dateFilter}
                onChange={onDateChange}
                options={dateOptions}
                compact={compact}
              />
            ) : null}

            {showSort ? (
              <FilterField
                label={isArabic ? 'الترتيب' : 'Sort'}
                value={sortOrder}
                onChange={onSortChange}
                options={sortOptions}
                compact={compact}
              />
            ) : null}
          </div>
        </div>

        <div className={cn('flex flex-wrap items-center', compact ? 'gap-1.5' : 'gap-2')}>
          <Badge variant="premium" className={compact ? 'px-2 py-0.5 text-[11px]' : ''}>
            {isArabic ? `${resultCount} نتيجة` : `${resultCount} results`}
          </Badge>
          {helperText !== null ? (
            <span className={cn('text-[var(--color-text-secondary)]', compact ? 'text-xs' : 'text-sm')}>
              {helperText || (isArabic
                ? 'ابحث بالمنتج، العميل، البريد الإلكتروني، أو رقم الطلب.'
                : 'Search by product, customer, email, or order number.')}
            </span>
          ) : null}
        </div>
      </div>
    </Card>
  );
};

export default OrdersFiltersBar;
