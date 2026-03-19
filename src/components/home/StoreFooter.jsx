import React from 'react';
import { Link } from 'react-router-dom';
<<<<<<< HEAD
import brandIconImage from '../../assets/logo.png';
=======
import brandIconImage from '../../assets/box_.png';
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
import brandWordmarkImage from '../../assets/ibra.png';

const StoreFooter = ({ title, description, chips, copyright, metaLine }) => (
  <footer className="overflow-hidden rounded-[2rem] border border-[color:rgb(var(--color-border-rgb)/0.92)] bg-[color:rgb(var(--color-card-rgb)/0.96)] p-5 shadow-[var(--shadow-subtle)] sm:p-6">
    <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
<<<<<<< HEAD
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="relative h-14 w-14 shrink-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgb(var(--color-primary-rgb)/0.56),rgb(var(--color-card-rgb)/0.98)_48%,rgb(var(--color-primary-rgb)/0.18))] p-[2px] shadow-[0_18px_40px_-24px_rgb(var(--color-primary-rgb)/0.75)] sm:h-16 sm:w-16">
=======
      <div className="flex items-start gap-4">
        <div className="relative h-16 w-16 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgb(var(--color-primary-rgb)/0.56),rgb(var(--color-card-rgb)/0.98)_48%,rgb(var(--color-primary-rgb)/0.18))] p-[2px] shadow-[0_18px_40px_-24px_rgb(var(--color-primary-rgb)/0.75)]">
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.34)] bg-[linear-gradient(180deg,rgb(var(--color-card-rgb)/1),rgb(var(--color-surface-rgb)/0.94))]">
            <img
              src={brandIconImage}
              alt="IBRA"
<<<<<<< HEAD
              loading="lazy"
              decoding="async"
              className="h-full w-full rounded-full object-contain p-1 [filter:contrast(1.08)_saturate(1.08)_drop-shadow(0_0_10px_rgb(var(--color-primary-rgb)/0.2))]"
=======
              className="h-full w-full rounded-full object-cover [filter:contrast(1.08)_saturate(1.08)_drop-shadow(0_0_10px_rgb(var(--color-primary-rgb)/0.2))]"
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
            />
          </div>
          <span className="pointer-events-none absolute inset-[4px] rounded-full ring-1 ring-[color:rgb(var(--color-primary-rgb)/0.2)]" />
        </div>

<<<<<<< HEAD
        <div className="min-w-0 space-y-2">
          <img src={brandWordmarkImage} alt="IBRA" loading="lazy" decoding="async" className="h-6 w-auto max-w-full object-contain sm:h-5" />
          <h3 className="text-lg font-semibold text-[var(--color-text)] sm:text-xl">{title}</h3>
=======
        <div className="space-y-2">
          <img src={brandWordmarkImage} alt="IBRA" className="h-5 w-auto object-contain" />
          <h3 className="text-xl font-semibold text-[var(--color-text)]">{title}</h3>
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
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
