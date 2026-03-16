import React from 'react';
import StatCard from './StatCard';

const StatsGrid = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid place-items-center gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:place-items-stretch">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={`stats-skeleton-${index}`}
            className="h-[156px] w-full max-w-[42rem] animate-pulse rounded-[var(--radius-xl)] border border-[color:rgb(var(--color-border-rgb)/0.82)] bg-[color:rgb(var(--color-card-rgb)/0.82)] xl:max-w-none"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid place-items-center gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:place-items-stretch">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
};

export default StatsGrid;
