import React from 'react';
import StatCard from './StatCard';

const StatsGrid = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
<<<<<<< HEAD
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={`stats-skeleton-${index}`}
            className="h-[110px] w-full animate-pulse rounded-[calc(var(--radius-xl)-4px)] border border-[color:rgb(var(--color-border-rgb)/0.82)] bg-[color:rgb(var(--color-card-rgb)/0.82)] sm:h-[156px] sm:rounded-[var(--radius-xl)]"
=======
      <div className="grid place-items-center gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:place-items-stretch">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={`stats-skeleton-${index}`}
            className="h-[156px] w-full max-w-[42rem] animate-pulse rounded-[var(--radius-xl)] border border-[color:rgb(var(--color-border-rgb)/0.82)] bg-[color:rgb(var(--color-card-rgb)/0.82)] xl:max-w-none"
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
          />
        ))}
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
=======
    <div className="grid place-items-center gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:place-items-stretch">
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
};

export default StatsGrid;
