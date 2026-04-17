import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../ui/Button';

const CategoryCard = ({ category, active, activeLabel = 'Active', index, onSelect }) => (
  <motion.button
    type="button"
    onClick={() => onSelect(category.id)}
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05, duration: 0.28 }}
    whileHover={{ y: -3 }}
    className={cn(
      'group relative flex h-full flex-col overflow-hidden rounded-2xl bg-transparent text-start shadow-[0_18px_34px_-30px_rgba(15,23,42,0.34)] transition-all hover:z-10',
      active
        ? 'shadow-[0_20px_38px_-28px_rgba(212,175,55,0.24)]'
        : 'hover:shadow-[0_20px_38px_-30px_rgba(15,23,42,0.32)]'
    )}
  >
    <div className="relative aspect-[1.35] overflow-hidden rounded-2xl bg-transparent">
      <img
        src={category.image}
        alt={category.title}
        loading="lazy"
        decoding="async"
        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
        className={cn(
          'h-full w-full bg-transparent object-contain transition-transform duration-700',
          category.id === 'all' ? 'scale-[0.7] p-5' : 'scale-[1.01] group-hover:scale-[1.04]'
        )}
      />

      {category.id === 'all' && <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.18),transparent_46%)]" />}

      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2.5">
        <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-[0.16em] text-[var(--color-text-secondary)] drop-shadow-sm">
          {category.count}
        </span>
        {active && (
          <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-[0.16em] text-[var(--color-primary)] drop-shadow-sm">
            {activeLabel}
          </span>
        )}
      </div>
    </div>

    <div className="px-3 pb-4 pt-2 text-center">
      <h3 className="line-clamp-1 text-[13px] font-semibold leading-5 text-[var(--color-text)] sm:text-[15px]">
        {category.title}
      </h3>
    </div>
  </motion.button>
);

export default React.memo(CategoryCard);
