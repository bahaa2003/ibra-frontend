import React from 'react';
import { Link } from 'react-router-dom';
import brandIconImage from '../../assets/box_.png';
import brandWordmarkImage from '../../assets/ibra.png';

const StoreFooter = ({ title, description, chips, copyright, metaLine }) => (
  <footer className="overflow-hidden rounded-[2rem] border border-[color:rgb(var(--color-border-rgb)/0.92)] bg-[color:rgb(var(--color-card-rgb)/0.96)] p-5 shadow-[var(--shadow-subtle)] sm:p-6">
    <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
      <div className="flex items-start gap-4">
        <div className="relative h-16 w-16 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgb(var(--color-primary-rgb)/0.56),rgb(var(--color-card-rgb)/0.98)_48%,rgb(var(--color-primary-rgb)/0.18))] p-[2px] shadow-[0_18px_40px_-24px_rgb(var(--color-primary-rgb)/0.75)]">
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.34)] bg-[linear-gradient(180deg,rgb(var(--color-card-rgb)/1),rgb(var(--color-surface-rgb)/0.94))]">
            <img
              src={brandIconImage}
              alt="IBRA"
              className="h-full w-full rounded-full object-cover [filter:contrast(1.08)_saturate(1.08)_drop-shadow(0_0_10px_rgb(var(--color-primary-rgb)/0.2))]"
            />
          </div>
          <span className="pointer-events-none absolute inset-[4px] rounded-full ring-1 ring-[color:rgb(var(--color-primary-rgb)/0.2)]" />
        </div>

        <div className="space-y-2">
          <img src={brandWordmarkImage} alt="IBRA" className="h-5 w-auto object-contain" />
          <h3 className="text-xl font-semibold text-[var(--color-text)]">{title}</h3>
          <p className="max-w-2xl text-sm leading-7 text-[var(--color-text-secondary)]">{description}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <Link
            key={chip.label}
            to={chip.to}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.2)] bg-[color:rgb(var(--color-primary-rgb)/0.07)] px-4 text-sm font-medium text-[var(--color-text)] transition-all hover:-translate-y-0.5 hover:border-[color:rgb(var(--color-primary-rgb)/0.36)] hover:text-[var(--color-primary-hover)]"
          >
            {chip.label}
          </Link>
        ))}
      </div>
    </div>

    <div className="soft-divider my-5" />

    <div className="flex flex-col gap-2 text-xs text-[var(--color-muted)] sm:flex-row sm:items-center sm:justify-between">
      <p>{copyright}</p>
      <p>{metaLine}</p>
    </div>
  </footer>
);

export default StoreFooter;
