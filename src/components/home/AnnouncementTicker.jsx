import React, { useEffect, useState } from 'react';

const prefersReducedMotion = () => (
  typeof window !== 'undefined'
  && typeof window.matchMedia === 'function'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches
);

const AnnouncementTicker = ({ items, durationMs = 7000, ariaLabel, direction = 'ltr' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(prefersReducedMotion);

  useEffect(() => {
    if (!items?.length) return undefined;

    const timer = window.setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, durationMs);

    return () => window.clearTimeout(timer);
  }, [currentIndex, durationMs, items]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setReduceMotion(media.matches);

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', handleChange);
    } else if (typeof media.addListener === 'function') {
      media.addListener(handleChange);
    }

    return () => {
      if (typeof media.removeEventListener === 'function') {
        media.removeEventListener('change', handleChange);
      } else if (typeof media.removeListener === 'function') {
        media.removeListener(handleChange);
      }
    };
  }, []);

  if (!items?.length) return null;

  const activeItem = items[currentIndex];
  const tickerClassName = direction === 'rtl' ? 'announcement-ticker-rtl' : 'announcement-ticker-ltr';

  return (
    <section aria-label={ariaLabel} dir={direction} className="px-0.5">
      <div className="announcement-float relative mx-auto max-w-4xl overflow-hidden rounded-[1.1rem] bg-transparent px-2 py-1.5 text-center shadow-none sm:px-3 sm:py-2">
        <div className="relative min-h-[2.8rem] overflow-hidden">
          <div
            key={activeItem.id}
            style={{ animationDuration: `${durationMs}ms` }}
            className={[
              'absolute top-1/2 -translate-y-1/2 whitespace-nowrap',
              reduceMotion ? 'left-1/2 -translate-x-1/2 opacity-100' : tickerClassName,
            ].join(' ')}
          >
            <p className="px-2 text-[13px] font-semibold leading-6 text-[var(--color-text)] sm:text-[15px] sm:leading-7">
              {activeItem.text}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnnouncementTicker;
