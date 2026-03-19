import React from 'react';
import StatCard from './StatCard';

const StatsGrid = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={`stats-skeleton-${index}`}
            className="h-[110px] w-full animate-pulse rounded-[calc(var(--radius-xl)-4px)] border border-[color:rgb(var(--color-border-rgb)/0.82)] bg-[color:rgb(var(--color-card-rgb)/0.82)] sm:h-[156px] sm:rounded-[var(--radius-xl)]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
};

export default StatsGrid;
