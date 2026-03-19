<<<<<<< HEAD
import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
=======
import React, { useDeferredValue, useMemo, useState } from 'react';
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
import { SearchX } from 'lucide-react';
import SearchBar from '../ui/SearchBar';
import { cn } from '../ui/Button';
import { filterStorefrontProducts, sanitizeStorefrontQuery } from '../../utils/storefront';

const ProductSearchBar = ({
  products = [],
  language = 'ar',
  value,
  onChange,
  onSelectProduct,
  placeholder,
  className,
  maxResults = 6,
  noResultsLabel,
  inputClassName,
<<<<<<< HEAD
  resetSignal = 0,
=======
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
}) => {
  const isControlled = typeof value === 'string';
  const [internalValue, setInternalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
<<<<<<< HEAD
  const [dropdownLayout, setDropdownLayout] = useState(null);
  const rootRef = useRef(null);
  const layoutFrameRef = useRef(0);
=======
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
  const searchValue = isControlled ? value : internalValue;
  const deferredQuery = useDeferredValue(searchValue);
  const normalizedQuery = sanitizeStorefrontQuery(deferredQuery);
  const isArabic = language === 'ar';

  const results = useMemo(() => {
    if (!normalizedQuery) return [];

    return filterStorefrontProducts(products, {
      searchTerm: normalizedQuery,
      activeCategory: 'all',
      language,
    }).slice(0, maxResults);
  }, [language, maxResults, normalizedQuery, products]);

  const updateValue = (nextValue) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }

    if (typeof onChange === 'function') {
      onChange(nextValue);
    }
  };

  const handleSelect = (product) => {
    updateValue('');
    setIsFocused(false);

    if (typeof onSelectProduct === 'function') {
      onSelectProduct(product);
    }
  };

  const handleBlur = () => {
    window.setTimeout(() => {
      setIsFocused(false);
    }, 120);
  };

  const showDropdown = isFocused && Boolean(normalizedQuery);

<<<<<<< HEAD
  const syncDropdownLayout = () => {
    if (!rootRef.current) return;

    const rect = rootRef.current.getBoundingClientRect();
    setDropdownLayout({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  };

  const scheduleDropdownLayoutSync = () => {
    if (layoutFrameRef.current) {
      window.cancelAnimationFrame(layoutFrameRef.current);
    }

    layoutFrameRef.current = window.requestAnimationFrame(() => {
      layoutFrameRef.current = 0;
      syncDropdownLayout();
    });
  };

  useEffect(() => {
    if (isControlled) return undefined;

    setInternalValue('');
    setIsFocused(false);
    return undefined;
  }, [isControlled, resetSignal]);

  useEffect(() => {
    if (!showDropdown) return undefined;

    scheduleDropdownLayoutSync();

    const handleLayoutUpdate = () => {
      scheduleDropdownLayoutSync();
    };

    window.addEventListener('resize', handleLayoutUpdate);
    window.addEventListener('scroll', handleLayoutUpdate, true);

    return () => {
      if (layoutFrameRef.current) {
        window.cancelAnimationFrame(layoutFrameRef.current);
        layoutFrameRef.current = 0;
      }
      window.removeEventListener('resize', handleLayoutUpdate);
      window.removeEventListener('scroll', handleLayoutUpdate, true);
    };
  }, [showDropdown, normalizedQuery, results.length]);

  return (
    <div ref={rootRef} className={cn('relative w-full', className)}>
=======
  return (
    <div className={cn('relative w-full', className)}>
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
      <SearchBar
        value={searchValue}
        onChange={updateValue}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && results.length > 0) {
            event.preventDefault();
            handleSelect(results[0]);
          }
        }}
        placeholder={placeholder}
<<<<<<< HEAD
        className={className}
        inputClassName={inputClassName}
      />

      {showDropdown && dropdownLayout && typeof document !== 'undefined' && createPortal(
        <div
          style={dropdownLayout || undefined}
          className="fixed z-[140] overflow-hidden rounded-[1.4rem] border border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-card-rgb)/0.98)] shadow-[0_30px_70px_-34px_rgba(15,23,42,0.55)] backdrop-blur-xl"
        >
=======
        className={inputClassName}
      />

      {showDropdown && (
        <div className="absolute inset-x-0 bottom-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-[1.4rem] border border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-card-rgb)/0.98)] shadow-[0_30px_70px_-34px_rgba(15,23,42,0.55)] backdrop-blur-xl">
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
          {results.length > 0 ? (
            <div className="max-h-[21rem] overflow-y-auto py-2">
              {results.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    handleSelect(product);
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-start transition-colors hover:bg-[color:rgb(var(--color-primary-rgb)/0.08)]"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[1rem] border border-[color:rgb(var(--color-border-rgb)/0.88)] bg-[color:rgb(var(--color-elevated-rgb)/0.88)]">
                    <img
                      src={product.image}
                      alt={product.displayName}
                      loading="lazy"
                      decoding="async"
<<<<<<< HEAD
                      sizes="56px"
=======
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                      {product.displayName}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-4 text-sm text-[var(--color-text-secondary)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:rgb(var(--color-border-rgb)/0.86)] bg-[color:rgb(var(--color-elevated-rgb)/0.88)] text-[var(--color-muted)]">
                <SearchX className="h-4 w-4" />
              </div>
              <p>{noResultsLabel || (isArabic ? 'لا توجد منتجات مطابقة' : 'No matching products found')}</p>
            </div>
          )}
<<<<<<< HEAD
        </div>,
        document.body
=======
        </div>
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
      )}
    </div>
  );
};

<<<<<<< HEAD
export default React.memo(ProductSearchBar);
=======
export default ProductSearchBar;
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
