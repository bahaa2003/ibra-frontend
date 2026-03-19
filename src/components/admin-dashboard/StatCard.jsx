import React from 'react';
import Card from '../ui/Card';

const StatCard = ({ title, value, note, icon: Icon }) => {
  return (
    <Card variant="elevated" className="relative w-full p-3 sm:p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(var(--color-primary-rgb),0.45),transparent)]" />
      <div className="flex items-start justify-between gap-2.5 text-start sm:gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)] sm:text-[11px] sm:tracking-[0.16em]">
            {title}
          </p>
          <p className="mt-2 truncate text-lg font-black leading-none tracking-[-0.03em] text-[var(--color-text)] sm:mt-4 sm:text-[2rem]">
            {value}
          </p>
          {note && (
            <p className="mt-2 hidden text-xs leading-6 text-[var(--color-text-secondary)] sm:mt-3 sm:block sm:text-sm">
              {note}
            </p>
          )}
        </div>

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[calc(var(--radius-md)-2px)] border border-[color:rgb(var(--color-primary-rgb)/0.24)] bg-[color:rgb(var(--color-primary-rgb)/0.1)] text-[var(--color-primary)] shadow-[var(--shadow-subtle)] sm:h-12 sm:w-12 sm:rounded-[var(--radius-md)]">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
