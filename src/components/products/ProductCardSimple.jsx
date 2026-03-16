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
    className="group text-start [content-visibility:auto] [contain-intrinsic-size:320px]"
    aria-label={product.displayName}
  >
    <article className="h-full rounded-[1.7rem] border border-[color:rgb(var(--color-border-rgb)/0.88)] bg-[color:rgb(var(--color-card-rgb)/0.95)] p-3 shadow-[var(--shadow-subtle)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:rgb(var(--color-primary-rgb)/0.22)]">
      <div className="overflow-hidden rounded-[1.35rem] bg-[color:rgb(var(--color-surface-rgb)/0.96)]">
        <img
          src={product.image}
          alt={product.displayName}
          loading="lazy"
          decoding="async"
          className={cn(
            'aspect-[4/5] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]',
            !product.storefrontStatus?.isPurchasable && 'grayscale-[0.18]'
          )}
        />
      </div>

      <div className="px-1 pt-3">
        {showCategory && categoryLabel && (
          <span className="mb-2 inline-flex max-w-full truncate rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.18)] bg-[color:rgb(var(--color-primary-rgb)/0.08)] px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-[var(--color-primary)]">
            {categoryLabel}
          </span>
        )}

        <h3 className="line-clamp-2 text-sm font-semibold leading-6 text-[var(--color-text)] sm:text-base">
          {product.displayName}
        </h3>
      </div>
    </article>
  </button>
));

ProductCardSimple.displayName = 'ProductCardSimple';

export default ProductCardSimple;
