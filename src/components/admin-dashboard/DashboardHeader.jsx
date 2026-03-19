import React from 'react';
import { CalendarDays, ShieldCheck } from 'lucide-react';
import { cn } from '../ui/Button';

const DashboardHeader = ({ isArabic, userName, currentDateLabel }) => {
  return (
<<<<<<< HEAD
    <section className="premium-card-premium relative mx-auto w-[calc(100vw-1.5rem)] max-w-[42rem] overflow-hidden p-3 sm:w-full sm:p-6 lg:max-w-none lg:p-8">
      <div className="absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_top,rgba(var(--color-primary-rgb),0.16),transparent_70%)] sm:h-24" />
      <div className="relative flex flex-col items-center gap-3.5 text-center sm:gap-5 lg:flex-row lg:items-end lg:justify-between lg:text-start">
        <div className="space-y-2.5 sm:space-y-4">
          <span className={cn('section-kicker justify-center text-[10px] sm:text-xs lg:justify-start', isArabic && 'lg:justify-end')}>
=======
    <section className="premium-card-premium relative mx-auto w-[calc(100vw-1.5rem)] max-w-[42rem] overflow-hidden p-4 sm:w-full sm:p-6 lg:max-w-none lg:p-8">
      <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(var(--color-primary-rgb),0.16),transparent_70%)]" />
      <div className="relative flex flex-col items-center gap-5 text-center lg:flex-row lg:items-end lg:justify-between lg:text-start">
        <div className="space-y-4">
          <span className={cn('section-kicker justify-center lg:justify-start', isArabic && 'lg:justify-end')}>
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
            <ShieldCheck className="h-3.5 w-3.5" />
            {isArabic ? 'لوحة القيادة الإدارية' : 'Admin control center'}
          </span>

<<<<<<< HEAD
          <div className="space-y-1.5 sm:space-y-2">
            <h1 className="text-xl font-black tracking-[-0.04em] text-[var(--color-text)] sm:text-4xl">
              {isArabic ? 'لوحة تحكم الإدارة' : 'Admin Dashboard'}
            </h1>
            <p className="mx-auto max-w-2xl text-[11px] leading-5 text-[var(--color-text-secondary)] sm:text-base sm:leading-6 lg:mx-0">
=======
          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-[-0.04em] text-[var(--color-text)] sm:text-4xl">
              {isArabic ? 'لوحة تحكم الإدارة' : 'Admin Dashboard'}
            </h1>
            <p className="mx-auto max-w-2xl text-xs leading-6 text-[var(--color-text-secondary)] sm:text-base lg:mx-0">
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
              {isArabic
                ? 'نظرة عامة سريعة على أداء المتجر، آخر الطلبات، الشحن اليدوي، والإجراءات الأساسية التي يحتاجها الأدمن يوميًا.'
                : 'A fast overview of store performance, recent orders, manual topups, and the actions admins use most often.'}
            </p>
          </div>
        </div>

<<<<<<< HEAD
        <div className="grid w-full max-w-2xl grid-cols-2 gap-2 sm:gap-3 lg:max-w-none">
          <div className="rounded-[calc(var(--radius-xl)-4px)] border border-[color:rgb(var(--color-border-rgb)/0.88)] bg-[color:rgb(var(--color-card-rgb)/0.82)] px-3 py-3 shadow-[var(--shadow-subtle)] sm:rounded-[var(--radius-xl)] sm:px-4 sm:py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)] sm:text-xs sm:tracking-[0.14em]">
              {isArabic ? 'مرحبًا بعودتك' : 'Welcome back'}
            </p>
            <p className="mt-2 text-sm font-bold leading-5 text-[var(--color-text)] sm:mt-3 sm:text-lg">
=======
        <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2 lg:max-w-none">
          <div className="rounded-[var(--radius-xl)] border border-[color:rgb(var(--color-border-rgb)/0.88)] bg-[color:rgb(var(--color-card-rgb)/0.82)] px-4 py-4 shadow-[var(--shadow-subtle)]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
              {isArabic ? 'مرحبًا بعودتك' : 'Welcome back'}
            </p>
            <p className="mt-3 text-lg font-bold text-[var(--color-text)]">
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
              {userName || (isArabic ? 'مشرف النظام' : 'Administrator')}
            </p>
          </div>

<<<<<<< HEAD
          <div className="rounded-[calc(var(--radius-xl)-4px)] border border-[color:rgb(var(--color-border-rgb)/0.88)] bg-[color:rgb(var(--color-card-rgb)/0.82)] px-3 py-3 shadow-[var(--shadow-subtle)] sm:rounded-[var(--radius-xl)] sm:px-4 sm:py-4">
            <div className="flex items-center gap-1.5 text-[var(--color-primary)] sm:gap-2">
              <CalendarDays className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)] sm:text-xs sm:tracking-[0.14em]">
                {isArabic ? 'تاريخ اليوم' : 'Today'}
              </p>
            </div>
            <p className="mt-2 text-[11px] font-semibold leading-5 text-[var(--color-text)] sm:mt-3 sm:text-base">
=======
          <div className="rounded-[var(--radius-xl)] border border-[color:rgb(var(--color-border-rgb)/0.88)] bg-[color:rgb(var(--color-card-rgb)/0.82)] px-4 py-4 shadow-[var(--shadow-subtle)]">
            <div className="flex items-center gap-2 text-[var(--color-primary)]">
              <CalendarDays className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                {isArabic ? 'تاريخ اليوم' : 'Today'}
              </p>
            </div>
            <p className="mt-3 text-sm font-semibold text-[var(--color-text)] sm:text-base">
>>>>>>> f0ed41c908b4d360ea4c89ff1cbbc1863d025b41
              {currentDateLabel}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardHeader;
