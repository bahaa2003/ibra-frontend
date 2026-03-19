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
    className="group relative isolate block w-full origin-center select-none border-0 bg-transparent p-0 text-center transition-transform duration-200 ease-out motion-safe:hover:z-10 motion-safe:hover:scale-[1.12] active:scale-[1.01] [content-visibility:auto] [contain-intrinsic-size:260px]"
    aria-label={product.displayName}
  >
    <article className="relative h-full w-full">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl bg-white/0 transition-colors duration-200 group-active:bg-white/10"
      />

      <div className="mx-auto aspect-square w-[110%] max-w-none overflow-visible sm:w-[106%]">
        <img
          src={product.image}
          alt={product.displayName}
          loading="lazy"
          decoding="async"
          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 22vw, 180px"
          className={cn(
            'block h-full w-full rounded-none object-contain object-center',
            !product.storefrontStatus?.isPurchasable && 'grayscale-[0.18]'
          )}
        />
      </div>

      <div className="-mt-2 pt-0">
        {showCategory && categoryLabel && (
          <span className="mb-1.5 inline-flex max-w-full truncate rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.18)] bg-[color:rgb(var(--color-primary-rgb)/0.08)] px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-[var(--color-primary)]">
            {categoryLabel}
          </span>
        )}

        <h3 className="line-clamp-2 text-center text-[10px] font-semibold leading-4 text-[var(--color-text)] transition-colors duration-200 group-hover:text-[var(--color-primary)] group-active:text-[var(--color-primary)] sm:text-xs">
          {product.displayName}
        </h3>
      </div>
    </article>
  </button>
));

ProductCardSimple.displayName = 'ProductCardSimple';

export default ProductCardSimple;
