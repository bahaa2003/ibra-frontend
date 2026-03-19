import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from './Button';

const variantStyles = {
  default: 'border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-card-rgb)/0.92)]',
  glass: 'border-white/50 bg-white/55 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/65',
};

const compactVariantStyles = {
  default: 'border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-card-rgb)/0.92)] text-[var(--color-text)]',
  glass: 'border-white/50 bg-white/55 text-slate-700 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/65 dark:text-slate-100',
};

const ThemeToggle = ({ className, compact = false, variant = 'default' }) => {
  const { isDark, toggleTheme } = useTheme();

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={cn(
          'inline-flex h-11 w-11 items-center justify-center rounded-full border shadow-[var(--shadow-subtle)] transition-all duration-200 hover:border-[color:rgb(var(--color-primary-rgb)/0.28)] hover:text-[var(--color-primary)] hover:-translate-y-0.5',
          compactVariantStyles[variant] || compactVariantStyles.default,
          className
        )}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'relative inline-flex h-11 w-[78px] items-center rounded-full border px-1.5 shadow-[var(--shadow-subtle)] transition-all duration-200 hover:border-[color:rgb(var(--color-primary-rgb)/0.28)]',
        variantStyles[variant] || variantStyles.default,
        className
      )}
      aria-label="Toggle theme"
    >
      <span
        className={cn(
          'absolute left-1.5 inset-y-1.5 w-[34px] rounded-full bg-[var(--color-primary)] shadow-[var(--shadow-gold)] transition-transform duration-300 ease-out',
          isDark ? 'translate-x-[34px]' : 'translate-x-0'
        )}
      />
      <span className="relative z-10 grid w-full grid-cols-2 items-center">
        <span className="flex justify-center">
          <Sun className={cn('h-4 w-4 transition-colors', !isDark ? 'text-[var(--color-button-text)]' : 'text-[var(--color-muted)]')} />
        </span>
        <span className="flex justify-center">
          <Moon className={cn('h-4 w-4 transition-colors', isDark ? 'text-[var(--color-button-text)]' : 'text-[var(--color-muted)]')} />
        </span>
      </span>
    </button>
  );
};

export default ThemeToggle;
