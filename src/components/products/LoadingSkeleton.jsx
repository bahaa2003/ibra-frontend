import React from 'react';
import { cn } from '../ui/Button';

const layoutByVariant = {
  catalogs: 'grid grid-cols-2 gap-3 sm:grid-cols-3',
  products: 'grid grid-cols-2 gap-3 sm:grid-cols-3',
  search: 'grid grid-cols-2 gap-3 sm:grid-cols-3',
};

const cardByVariant = {
  catalogs: (
    <div className="space-y-3">
      <div className="aspect-[4/5] rounded-[1.75rem] bg-[color:rgb(var(--color-card-rgb)/0.92)]" />
      <div className="h-4 w-3/4 rounded-full bg-[color:rgb(var(--color-card-rgb)/0.92)]" />
    </div>
  ),
  products: (
    <div className="space-y-3">
      <div className="aspect-[4/5] rounded-[1.5rem] bg-[color:rgb(var(--color-card-rgb)/0.92)]" />
      <div className="h-4 w-4/5 rounded-full bg-[color:rgb(var(--color-card-rgb)/0.92)]" />
    </div>
  ),
  search: (
    <div className="space-y-3">
      <div className="aspect-[4/5] rounded-[1.5rem] bg-[color:rgb(var(--color-card-rgb)/0.92)]" />
      <div className="h-3.5 w-1/3 rounded-full bg-[color:rgb(var(--color-card-rgb)/0.92)]" />
      <div className="h-4 w-4/5 rounded-full bg-[color:rgb(var(--color-card-rgb)/0.92)]" />
    </div>
  ),
};

const LoadingSkeleton = ({ variant = 'products', count = 6, className }) => (
  <div className={cn(layoutByVariant[variant] || layoutByVariant.products, 'animate-pulse', className)}>
    {Array.from({ length: count }, (_, index) => (
      <div
        key={`${variant}-${index}`}
        className="rounded-[1.9rem] border border-[color:rgb(var(--color-border-rgb)/0.72)] bg-[color:rgb(var(--color-surface-rgb)/0.72)] p-3"
      >
        {cardByVariant[variant] || cardByVariant.products}
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;
