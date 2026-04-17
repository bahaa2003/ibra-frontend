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
    className="group relative isolate flex h-full w-full origin-center select-none flex-col border-0 bg-transparent p-0 text-center transition-transform duration-200 ease-out hover:z-10 motion-safe:hover:scale-[1.04] active:scale-[1.01]"
    aria-label={product.displayName}
  >
    <article className="relative flex h-full w-full flex-col">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl bg-white/0 transition-colors duration-200 group-active:bg-white/10"
      />

      <div className="mx-auto aspect-square w-full overflow-hidden rounded-2xl bg-transparent">
        <img
          src={product.image}
          alt={product.displayName}
          loading="lazy"
          decoding="async"
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 18vw"
          className={cn(
            'block h-full w-full bg-transparent object-contain object-center',
            !product.storefrontStatus?.isPurchasable && 'grayscale-[0.18]'
          )}
        />
      </div>

      <div className="mt-1.5 pb-4">
        {showCategory && categoryLabel && (
          <span className="mb-1.5 inline-flex max-w-full truncate rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.18)] bg-[color:rgb(var(--color-primary-rgb)/0.08)] px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-[var(--color-primary)]">
            {categoryLabel}
          </span>
        )}

        <h3 className="line-clamp-2 text-center text-[13px] font-semibold leading-5 text-[var(--color-text)] transition-colors duration-200 group-hover:text-[var(--color-primary)] group-active:text-[var(--color-primary)] sm:text-[14px]">
          {product.displayName}
        </h3>
      </div>
    </article>
  </button>
));

ProductCardSimple.displayName = 'ProductCardSimple';

export default ProductCardSimple;
