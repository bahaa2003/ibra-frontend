import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import { cn } from '../ui/Button';

const QuickActionsSection = ({ actions, isArabic }) => {
  return (
    <Card variant="elevated" className="mx-auto w-[calc(100vw-1.5rem)] max-w-[42rem] p-4 sm:w-full sm:p-6 xl:max-w-none">
      <div className={cn('mb-4', isArabic ? 'text-right' : 'text-left')}>
        <h2 className="text-lg font-bold text-[var(--color-text)] sm:text-xl">
          {isArabic ? 'إجراءات سريعة' : 'Quick Actions'}
        </h2>
        <p className="mt-1.5 text-xs leading-6 text-[var(--color-text-secondary)] sm:text-sm">
          {isArabic
            ? 'اختصارات مباشرة للمهام الأكثر استخدامًا داخل لوحة الإدارة.'
            : 'Direct shortcuts to the admin tasks you use most often.'}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {actions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="group rounded-[var(--radius-xl)] border border-[color:rgb(var(--color-border-rgb)/0.86)] bg-[color:rgb(var(--color-card-rgb)/0.78)] p-3.5 shadow-[var(--shadow-subtle)] transition-all hover:-translate-y-0.5 hover:border-[color:rgb(var(--color-primary-rgb)/0.28)] hover:bg-[color:rgb(var(--color-primary-rgb)/0.08)] sm:p-4"
          >
            <div className={cn('flex items-start justify-between gap-3', isArabic && 'flex-row-reverse')}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[color:rgb(var(--color-primary-rgb)/0.2)] bg-[color:rgb(var(--color-primary-rgb)/0.08)] text-[var(--color-primary)] sm:h-11 sm:w-11">
                <action.icon className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--color-muted)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]" />
            </div>
            <div className={cn('mt-3', isArabic ? 'text-right' : 'text-left')}>
              <p className="text-sm font-semibold text-[var(--color-text)]">
                {action.label}
              </p>
              <p className="mt-1.5 text-xs leading-6 text-[var(--color-text-secondary)] sm:text-sm">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
};

export default QuickActionsSection;
