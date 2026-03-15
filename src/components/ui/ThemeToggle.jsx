import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from './Button';

const ThemeToggle = ({ className, compact = false }) => {
  const { isDark, toggleTheme } = useTheme();

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={cn(
          'inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-card-rgb)/0.92)] text-[var(--color-text)] shadow-[var(--shadow-subtle)] transition-all duration-200 hover:border-[color:rgb(var(--color-primary-rgb)/0.28)] hover:text-[var(--color-primary)] hover:-translate-y-0.5',
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
        'relative inline-flex h-11 w-[76px] items-center rounded-full border border-[color:rgb(var(--color-border-rgb)/0.9)] bg-[color:rgb(var(--color-card-rgb)/0.92)] px-1.5 shadow-[var(--shadow-subtle)] transition-all duration-200 hover:border-[color:rgb(var(--color-primary-rgb)/0.28)]',
        className
      )}
      aria-label="Toggle theme"
    >
      <span
        className={cn(
          'absolute inset-y-1.5 w-[34px] rounded-full bg-[var(--color-primary)] shadow-[var(--shadow-gold)] transition-all duration-300',
          isDark ? 'translate-x-[33px]' : 'translate-x-0'
        )}
      />
      <span className="relative z-10 flex w-full items-center justify-between px-0.5">
        <Sun className={cn('h-4 w-4 transition-colors', !isDark ? 'text-[var(--color-button-text)]' : 'text-[var(--color-muted)]')} />
        <Moon className={cn('h-4 w-4 transition-colors', isDark ? 'text-[var(--color-button-text)]' : 'text-[var(--color-muted)]')} />
      </span>
    </button>
  );
};

export default ThemeToggle;
