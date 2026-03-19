import React from 'react';
import { cn } from '../ui/Button';

const ProductCardSimple = React.memo(({
  product,
  categoryLabel,
  onOpen,
  showCategory = false,
}) => (
  <button
    type="button"
    onClick={() => onOpen(product)}
<<<<<<< HEAD
    className="group relative isolate block w-full origin-center select-none border-0 bg-transparent p-0 text-center transition-transform duration-200 ease-out motion-safe:hover:z-10 motion-safe:hover:scale-[1.12] active:scale-[1.01] [content-visibility:auto] [contain-intrinsic-size:260px]"
    aria-label={product.displayName}
  >
    <article className="relative h-full w-full">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl bg-white/0 transition-colors duration-200 group-active:bg-white/10"
      />

      <div className="mx-auto aspect-square w-[110%] max-w-none overflow-visible sm:w-[106%]">
=======
    className="group text-start [content-visibility:auto] [contain-intrinsic-size:320px]"
    aria-label={product.displayName}
  >
    <article className="h-full rounded-[1.7rem] border border-[color:rgb(var(--color-border-rgb)/0.88)] bg-[color:rgb(var(--color-card-rgb)/0.95)] p-3 shadow-[var(--shadow-subtle)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:rgb(var(--color-primary-rgb)/0.22)]">
      <div className="overflow-hidden rounded-[1.35rem] bg-[color:rgb(var(--color-surface-rgb)/0.96)]">
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
        <img
          src={product.image}
          alt={product.displayName}
          loading="lazy"
          decoding="async"
<<<<<<< HEAD
          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 22vw, 180px"
          className={cn(
            'block h-full w-full rounded-none object-contain object-center',
=======
          className={cn(
            'aspect-[4/5] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]',
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
            !product.storefrontStatus?.isPurchasable && 'grayscale-[0.18]'
          )}
        />
      </div>

<<<<<<< HEAD
      <div className="-mt-2 pt-0">
        {showCategory && categoryLabel && (
          <span className="mb-1.5 inline-flex max-w-full truncate rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.18)] bg-[color:rgb(var(--color-primary-rgb)/0.08)] px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-[var(--color-primary)]">
=======
      <div className="px-1 pt-3">
        {showCategory && categoryLabel && (
          <span className="mb-2 inline-flex max-w-full truncate rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.18)] bg-[color:rgb(var(--color-primary-rgb)/0.08)] px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-[var(--color-primary)]">
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
            {categoryLabel}
          </span>
        )}

<<<<<<< HEAD
        <h3 className="line-clamp-2 text-center text-[10px] font-semibold leading-4 text-[var(--color-text)] transition-colors duration-200 group-hover:text-[var(--color-primary)] group-active:text-[var(--color-primary)] sm:text-xs">
=======
        <h3 className="line-clamp-2 text-sm font-semibold leading-6 text-[var(--color-text)] sm:text-base">
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
          {product.displayName}
        </h3>
      </div>
    </article>
  </button>
));

ProductCardSimple.displayName = 'ProductCardSimple';

export default ProductCardSimple;
