import React from 'react';
import { cn } from '../ui/Button';

const ProductCardSimple = React.memo(({
  product,
  categoryLabel,
  onOpen,
  showCategory = false,
}) => {
  const isPaused = (
    product?.storefrontStatus?.badge === 'paused'
    || product?.productStatus === 'paused'
    || product?.pauseSales
  );

  return (
    <button
      type="button"
      onClick={() => onOpen(product)}
      className={cn(
        'group relative isolate flex h-full w-full origin-center select-none flex-col border-0 bg-transparent p-0 text-center transition-transform duration-200 ease-out hover:z-10 active:scale-[1.01]',
        !isPaused && 'motion-safe:hover:scale-[1.04]'
      )}
      aria-label={product.displayName}
    >
      <article className="relative flex h-full w-full flex-col">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl bg-white/0 transition-colors duration-200 group-active:bg-white/10"
        />

        <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-2xl bg-transparent">
          <img
            src={product.image}
            alt={product.displayName}
            loading="lazy"
            decoding="async"
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 18vw"
            className={cn(
              'product-image-gold-trace block h-full w-full bg-transparent object-contain object-center transition duration-200',
              !product.storefrontStatus?.isPurchasable && 'grayscale-[0.18]',
              isPaused && 'brightness-[0.38] grayscale-[0.75] saturate-[0.45]'
            )}
          />
          {isPaused ? (
            <>
              <span className="pointer-events-none absolute inset-0 bg-black/42" aria-hidden="true" />
              <span className="pointer-events-none absolute left-[-14%] top-1/2 h-1.5 w-[128%] -translate-y-1/2 -rotate-[18deg] rounded-full bg-red-600 shadow-[0_0_16px_rgba(220,38,38,0.6)]" aria-hidden="true" />
            </>
          ) : null}
        </div>

        <div className="mt-1.5 pb-4">
          {showCategory && categoryLabel && (
            <span className="mb-1.5 inline-flex max-w-full truncate rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.18)] bg-[color:rgb(var(--color-primary-rgb)/0.08)] px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-[var(--color-primary)]">
              {categoryLabel}
            </span>
          )}

          <h3 className={cn(
            'line-clamp-2 text-center text-[13px] font-semibold leading-5 text-[var(--color-text)] transition-colors duration-200 group-hover:text-[var(--color-primary)] group-active:text-[var(--color-primary)] sm:text-[14px]',
            isPaused && 'text-red-500 line-through decoration-red-600 decoration-2 group-hover:text-red-500'
          )}>
            {product.displayName}
          </h3>
        </div>
      </article>
    </button>
  );
});

ProductCardSimple.displayName = 'ProductCardSimple';

export default ProductCardSimple;
