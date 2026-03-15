import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../ui/Button';

const HeroSlider = ({ slides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const hasMultipleSlides = (slides?.length || 0) > 1;

  useEffect(() => {
    if (!hasMultipleSlides) return undefined;

    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [hasMultipleSlides, slides]);

  if (!slides?.length) return null;

  const slide = slides[currentSlide];

  return (
    <section className="relative overflow-hidden rounded-[1.75rem] border border-[color:rgb(var(--color-primary-rgb)/0.18)] bg-[color:rgb(var(--color-card-rgb)/0.9)] shadow-[var(--shadow-medium)]">
      <div className="relative h-[12.5rem] sm:h-[14.5rem] lg:h-[16.5rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.01 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="absolute inset-0"
          >
            <img src={slide.image} alt={slide.alt || ''} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,11,0.04)_0%,rgba(11,11,11,0.1)_100%)]" />
          </motion.div>
        </AnimatePresence>
      </div>

      {hasMultipleSlides && (
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-2 px-4 pb-3">
          {slides.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrentSlide(index)}
              className={cn(
                'h-2.5 rounded-full transition-all duration-300',
                index === currentSlide
                  ? 'w-10 bg-[var(--color-primary)]'
                  : 'w-2.5 bg-white/28 hover:bg-white/44'
              )}
              aria-label={item.title}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSlider;
