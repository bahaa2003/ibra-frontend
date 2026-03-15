import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const AnnouncementTicker = ({ items, durationMs = 7000, ariaLabel, direction = 'ltr' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!items?.length) return undefined;

    const timer = window.setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, durationMs);

    return () => window.clearTimeout(timer);
  }, [currentIndex, durationMs, items]);

  if (!items?.length) return null;

  const activeItem = items[currentIndex];
  const startPosition = direction === 'rtl' ? '100%' : '-100%';
  const endPosition = direction === 'rtl' ? '-100%' : '100%';

  return (
    <section aria-label={ariaLabel} className="relative h-11 overflow-hidden">
      <motion.div
        key={activeItem.id}
        initial={{ left: startPosition }}
        animate={{ left: endPosition }}
        transition={{ duration: durationMs / 1000, ease: 'linear' }}
        className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap"
      >
        <span className="inline-flex items-center gap-2 px-1 text-sm font-semibold text-[var(--color-text)] sm:text-base">
          <span aria-hidden="true" className="text-base leading-none">🔥</span>
          <span>{activeItem.text}</span>
          <span aria-hidden="true" className="text-base leading-none">🔥</span>
        </span>
      </motion.div>
    </section>
  );
};

export default AnnouncementTicker;
