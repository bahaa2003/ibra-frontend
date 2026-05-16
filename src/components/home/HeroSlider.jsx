import React, { useEffect, useState } from 'react';

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
  const slideMedia = (
    <>
      <img
        src={slide.image}
        alt={slide.alt || ''}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        sizes="100vw"
        className="h-full w-full object-contain sm:object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,11,0.04)_0%,rgba(11,11,11,0.1)_100%)]" />
    </>
  );

  return (
    <section className="relative overflow-hidden rounded-[1.45rem] border border-[color:rgb(var(--color-primary-rgb)/0.18)] bg-[color:rgb(var(--color-card-rgb)/0.9)] shadow-[var(--shadow-medium)]">
      <div className="relative aspect-[2.9/1] overflow-hidden rounded-[inherit] sm:h-[10rem] sm:aspect-auto lg:h-[11.5rem]">
        <div key={slide.id} className="hero-slide-enter absolute inset-0">
          {slide.href ? (
            <a
              href={slide.href}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 block rounded-[inherit]"
              aria-label={slide.alt || slide.title || ''}
            >
              {slideMedia}
            </a>
          ) : slideMedia}
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
