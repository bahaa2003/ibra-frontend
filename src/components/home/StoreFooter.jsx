import React from 'react';
import { Link } from 'react-router-dom';
import brandIconImage from '../../assets/logo.png';
import brandWordmarkImage from '../../assets/ibra.png';

const StoreFooter = ({
  title,
  description,
  chips = [],
  copyright,
  metaLine,
  signature,
}) => (
  <footer className="overflow-hidden rounded-[1.35rem] border border-[color:rgb(var(--color-border-rgb)/0.84)] bg-[color:rgb(var(--color-card-rgb)/0.93)] px-3.5 py-3.5 shadow-[var(--shadow-subtle)] sm:px-4 sm:py-4">
    <div className={`grid gap-3 ${chips.length ? 'lg:grid-cols-[1fr_auto] lg:items-center' : ''}`}>
      <div className="flex items-start gap-2.5">
        <div className="relative h-9 w-9 shrink-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgb(var(--color-primary-rgb)/0.56),rgb(var(--color-card-rgb)/0.98)_48%,rgb(var(--color-primary-rgb)/0.18))] p-[2px] shadow-[0_12px_24px_-18px_rgb(var(--color-primary-rgb)/0.68)] sm:h-10 sm:w-10">
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.34)] bg-[linear-gradient(180deg,rgb(var(--color-card-rgb)/1),rgb(var(--color-surface-rgb)/0.94))]">
            <img
              src={brandIconImage}
              alt="IBRA"
              loading="lazy"
              decoding="async"
              className="h-full w-full rounded-full object-contain p-1 [filter:contrast(1.08)_saturate(1.08)_drop-shadow(0_0_10px_rgb(var(--color-primary-rgb)/0.2))]"
            />
          </div>
          <span className="pointer-events-none absolute inset-[4px] rounded-full ring-1 ring-[color:rgb(var(--color-primary-rgb)/0.2)]" />
        </div>

        <div className="min-w-0 space-y-1">
          <img src={brandWordmarkImage} alt="IBRA" loading="lazy" decoding="async" className="h-4.5 w-auto max-w-full object-contain" />
          {title ? <h3 className="text-[0.95rem] font-semibold text-[var(--color-text)] sm:text-[1rem]">{title}</h3> : null}
          {description ? <p className="max-w-xl text-[0.76rem] leading-5 text-[var(--color-text-secondary)] sm:text-[0.78rem]">{description}</p> : null}
        </div>
      </div>

      {chips.length ? (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <Link
              key={chip.label}
              to={chip.to}
              className="inline-flex h-8 items-center justify-center rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.16)] bg-[color:rgb(var(--color-primary-rgb)/0.05)] px-3 text-[0.74rem] font-medium text-[var(--color-text)] transition-all hover:-translate-y-0.5 hover:border-[color:rgb(var(--color-primary-rgb)/0.28)] hover:text-[var(--color-primary-hover)]"
            >
              {chip.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>

    {(copyright || metaLine || signature) ? (
      <>
        <div className="soft-divider my-3" />

        <div className="space-y-2">
          <div className={`flex flex-col gap-2 text-[0.67rem] text-[var(--color-muted)] ${metaLine ? 'sm:flex-row sm:items-center sm:justify-between' : 'items-center text-center'}`}>
            {copyright ? (
              <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border border-[color:rgb(var(--color-primary-rgb)/0.14)] bg-[color:rgb(var(--color-primary-rgb)/0.04)] px-3.5 py-1.5 text-[0.7rem] text-[var(--color-text-secondary)] sm:px-4">
                {copyright}
              </div>
            ) : (
              <span />
            )}
            {metaLine ? <p className="leading-4.5">{metaLine}</p> : null}
          </div>

          {signature ? (
            <p className="text-[0.72rem] font-semibold tracking-[0.08em] text-[var(--color-text-secondary)]">
              {signature}
            </p>
          ) : null}
        </div>
      </>
    ) : null}
  </footer>
);

export default StoreFooter;
