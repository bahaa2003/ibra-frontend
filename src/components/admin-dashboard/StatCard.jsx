import React from 'react';
import Card from '../ui/Card';

const StatCard = ({ title, value, note, icon: Icon }) => {
  return (
    <Card variant="elevated" className="relative w-[calc(100vw-1.5rem)] max-w-[42rem] p-4 sm:w-full sm:p-6 xl:max-w-none">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(var(--color-primary-rgb),0.45),transparent)]" />
      <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:justify-between sm:text-start">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)] sm:text-[11px]">
            {title}
          </p>
          <p className="mt-3 truncate text-2xl font-black tracking-[-0.03em] text-[var(--color-text)] sm:mt-4 sm:text-[2rem]">
            {value}
          </p>
          {note && (
            <p className="mt-2 text-xs leading-6 text-[var(--color-text-secondary)] sm:mt-3 sm:text-sm">
              {note}
            </p>
          )}
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[color:rgb(var(--color-primary-rgb)/0.24)] bg-[color:rgb(var(--color-primary-rgb)/0.1)] text-[var(--color-primary)] shadow-[var(--shadow-subtle)] sm:h-12 sm:w-12">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
