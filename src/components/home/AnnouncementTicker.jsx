import React, { useEffect, useState } from 'react';

const prefersReducedMotion = () => (
  typeof window !== 'undefined'
  && typeof window.matchMedia === 'function'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches
);

const AnnouncementTicker = ({ items, durationMs = 7000, ariaLabel, direction = 'ltr' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(prefersReducedMotion);
  const activeItem = items?.[currentIndex];
  const activeDurationMs = activeItem?.durationMs || durationMs;

  useEffect(() => {
    if (!items?.length) return undefined;

    const timer = window.setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, activeDurationMs);

    return () => window.clearTimeout(timer);
  }, [activeDurationMs, currentIndex, items]);

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

  const tickerClassName = direction === 'rtl' ? 'announcement-ticker-rtl' : 'announcement-ticker-ltr';

  return (
    <section aria-label={ariaLabel} dir={direction} className="px-0.5">
      <div className="announcement-float relative mx-auto max-w-4xl overflow-hidden rounded-[1.1rem] bg-transparent px-2 py-0 text-center shadow-none sm:px-3 sm:py-0">
        <div className="relative min-h-[2.4rem] overflow-hidden">
          <div
            key={activeItem.id}
            style={{ animationDuration: `${activeDurationMs}ms` }}
            className={[
              'absolute top-1/2 -translate-y-1/2 whitespace-nowrap',
              reduceMotion ? 'left-1/2 -translate-x-1/2 opacity-100' : tickerClassName,
            ].join(' ')}
          >
            <p className="px-2 font-['Traditional_Arabic','Amiri','Scheherazade_New',serif] text-[17px] font-bold leading-7 tracking-wide text-[var(--color-text)] sm:text-xl sm:leading-8">
              {Array.isArray(activeItem.words) ? (
                <span className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap sm:gap-2.5">
                  {activeItem.words.map((word) => <span key={word}>{word}</span>)}
                </span>
              ) : activeItem.text}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnnouncementTicker;
