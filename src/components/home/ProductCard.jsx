import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-react';
import { cn } from '../ui/Button';

const ProductCard = ({
  product,
  categoryLabel,
  priceLabel,
  buyLabel,
  secondaryLabel,
  secondaryTo,
  isRTL,
}) => {
  const productName = product.displayName;
  const productDescription = product.displayDescription;
  const status = product.storefrontStatus;

  return (
    <article className="product-led-card group flex h-full flex-col p-2 sm:p-4">
      <div className="relative overflow-hidden rounded-[1rem] sm:rounded-[1.5rem]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.18),transparent_52%)]" />
        <img
          src={product.image}
          alt={productName}
          className={cn(
            'aspect-[1.08] w-full object-cover transition-transform duration-500',
            status.isPurchasable ? 'group-hover:scale-105' : 'opacity-72'
          )}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,11,0.06)_0%,rgba(11,11,11,0.18)_48%,rgba(11,11,11,0.82)_100%)]" />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-1 p-2 sm:gap-2 sm:p-3">
          <span className="max-w-[60%] truncate rounded-full border border-white/12 bg-black/28 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em] text-white/76 backdrop-blur-md sm:px-2.5 sm:py-1 sm:text-[10px] sm:tracking-[0.14em]">
            {categoryLabel}
          </span>
          {status.badgeLabel && (
            <span className="rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.28)] bg-[color:rgb(var(--color-primary-rgb)/0.16)] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em] text-[var(--color-primary-hover)] sm:px-2.5 sm:py-1 sm:text-[10px] sm:tracking-[0.14em]">
              {status.badgeLabel}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-0.5 pt-2 sm:px-1 sm:pt-4">
        <div className="space-y-1 sm:space-y-2">
          <h3 className="line-clamp-2 text-xs font-semibold leading-5 text-[var(--color-text)] sm:text-lg sm:leading-7">{productName}</h3>
          <p className="hidden line-clamp-2 text-sm leading-6 text-[var(--color-text-secondary)] sm:block">
            {productDescription}
          </p>
        </div>

        <div className="mt-2 flex items-end justify-between gap-2 sm:mt-5 sm:gap-3">
          <div className="min-w-0">
            <p className="text-[8px] uppercase tracking-[0.08em] text-[var(--color-muted)] sm:text-[11px] sm:tracking-[0.18em]">{priceLabel}</p>
            <p className="mt-1 truncate text-sm font-semibold gold-gradient-text sm:mt-2 sm:text-2xl">{product.formattedPrice}</p>
          </div>

          <div className="hidden text-end text-xs text-[var(--color-text-secondary)] sm:block">
            <p>{status.helperText || product.secondaryLine}</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:mt-5 sm:grid-cols-2">
          {status.isPurchasable ? (
            <Link
              to={`/products/${product.id}`}
              aria-label={buyLabel}
              className="glow-button inline-flex h-9 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-soft)_48%,var(--color-primary-hover))] px-3 text-xs font-semibold text-[var(--color-button-text)] shadow-[var(--shadow-gold)] transition-all hover:-translate-y-0.5 sm:h-11 sm:px-4 sm:text-sm"
            >
              <ShoppingBag className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              <span className="hidden sm:inline">{buyLabel}</span>
            </Link>
          ) : (
            <span className="inline-flex h-9 items-center justify-center rounded-full border border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-elevated-rgb)/0.8)] px-3 text-[10px] font-semibold text-[var(--color-muted)] sm:h-11 sm:px-4 sm:text-sm">
              {status.badgeLabel}
            </span>
          )}

          <Link
            to={secondaryTo}
            className="hidden h-11 items-center justify-center gap-2 rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.28)] bg-transparent px-4 text-sm font-semibold text-[var(--color-text)] transition-all hover:-translate-y-0.5 hover:border-[color:rgb(var(--color-primary-rgb)/0.44)] hover:bg-[color:rgb(var(--color-primary-rgb)/0.08)] hover:text-[var(--color-primary-hover)] sm:inline-flex"
          >
            {secondaryLabel}
            {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
