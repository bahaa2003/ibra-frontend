import React from 'react';
import { CalendarDays, ShieldCheck } from 'lucide-react';
import { cn } from '../ui/Button';

const DashboardHeader = ({ isArabic, userName, currentDateLabel }) => {
  return (
    <section className="premium-card-premium relative mx-auto w-[calc(100vw-1.5rem)] max-w-[42rem] overflow-hidden p-4 sm:w-full sm:p-6 lg:max-w-none lg:p-8">
      <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(var(--color-primary-rgb),0.16),transparent_70%)]" />
      <div className="relative flex flex-col items-center gap-5 text-center lg:flex-row lg:items-end lg:justify-between lg:text-start">
        <div className="space-y-4">
          <span className={cn('section-kicker justify-center lg:justify-start', isArabic && 'lg:justify-end')}>
            <ShieldCheck className="h-3.5 w-3.5" />
            {isArabic ? 'لوحة القيادة الإدارية' : 'Admin control center'}
          </span>

          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-[-0.04em] text-[var(--color-text)] sm:text-4xl">
              {isArabic ? 'لوحة تحكم الإدارة' : 'Admin Dashboard'}
            </h1>
            <p className="mx-auto max-w-2xl text-xs leading-6 text-[var(--color-text-secondary)] sm:text-base lg:mx-0">
              {isArabic
                ? 'نظرة عامة سريعة على أداء المتجر، آخر الطلبات، الشحن اليدوي، والإجراءات الأساسية التي يحتاجها الأدمن يوميًا.'
                : 'A fast overview of store performance, recent orders, manual topups, and the actions admins use most often.'}
            </p>
          </div>
        </div>

        <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2 lg:max-w-none">
          <div className="rounded-[var(--radius-xl)] border border-[color:rgb(var(--color-border-rgb)/0.88)] bg-[color:rgb(var(--color-card-rgb)/0.82)] px-4 py-4 shadow-[var(--shadow-subtle)]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
              {isArabic ? 'مرحبًا بعودتك' : 'Welcome back'}
            </p>
            <p className="mt-3 text-lg font-bold text-[var(--color-text)]">
              {userName || (isArabic ? 'مشرف النظام' : 'Administrator')}
            </p>
          </div>

          <div className="rounded-[var(--radius-xl)] border border-[color:rgb(var(--color-border-rgb)/0.88)] bg-[color:rgb(var(--color-card-rgb)/0.82)] px-4 py-4 shadow-[var(--shadow-subtle)]">
            <div className="flex items-center gap-2 text-[var(--color-primary)]">
              <CalendarDays className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                {isArabic ? 'تاريخ اليوم' : 'Today'}
              </p>
            </div>
            <p className="mt-3 text-sm font-semibold text-[var(--color-text)] sm:text-base">
              {currentDateLabel}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardHeader;
