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
    whileHover={{ y: -5 }}
    className={cn(
      'group relative overflow-hidden rounded-[1.75rem] border bg-[color:rgb(var(--color-card-rgb)/0.96)] text-start shadow-[var(--shadow-subtle)] transition-all',
      active
        ? 'border-[color:rgb(var(--color-primary-rgb)/0.38)] shadow-[var(--shadow-medium)]'
        : 'border-[color:rgb(var(--color-border-rgb)/0.9)] hover:border-[color:rgb(var(--color-primary-rgb)/0.22)]'
    )}
  >
    <div className="relative aspect-[0.92] overflow-hidden">
      <img
        src={category.image}
        alt={category.title}
<<<<<<< HEAD
        loading="lazy"
        decoding="async"
        sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
=======
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
        className={cn(
          'h-full w-full object-cover transition-transform duration-500',
          category.id === 'all' ? 'scale-[0.72] object-contain p-6' : 'group-hover:scale-105'
        )}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,11,0.08)_0%,rgba(11,11,11,0.22)_36%,rgba(11,11,11,0.84)_100%)]" />
      {category.id === 'all' && <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.3),transparent_42%)]" />}

      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
        <span className="rounded-full border border-white/12 bg-black/28 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/78 backdrop-blur-md">
          {category.count}
        </span>
        {active && (
          <span className="rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.4)] bg-[color:rgb(var(--color-primary-rgb)/0.18)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-primary-hover)]">
            {activeLabel}
          </span>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="text-base font-semibold text-white sm:text-lg">{category.title}</h3>
        <p className="mt-1 text-xs leading-5 text-white/68">{category.subtitle}</p>
      </div>
    </div>
  </motion.button>
);

<<<<<<< HEAD
export default React.memo(CategoryCard);
=======
export default CategoryCard;
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
