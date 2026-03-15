import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../ui/Button';
import { useLanguage } from '../../context/LanguageContext';

const SettingsItem = ({
  icon: Icon,
  title,
  description,
  action,
  onClick,
  className,
  destructive = false
}) => {
  const { dir } = useLanguage();
  const Element = onClick ? 'button' : 'div';

  return (
    <Element
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'group flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-right transition-colors',
        onClick && 'hover:border-indigo-400/45 hover:bg-indigo-500/10',
        className
      )}
    >
      {Icon ? (
        <span
          className={cn(
            'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-200',
            destructive && 'text-rose-300'
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
      ) : null}

      <div className="flex-1">
        <p className={cn('text-sm font-semibold text-white', destructive && 'text-rose-200')}>{title}</p>
        {description ? (
          <p className={cn('mt-1 text-xs text-gray-300/85', destructive && 'text-rose-200/80')}>{description}</p>
        ) : null}
      </div>

      {action || onClick ? (
        <span className="inline-flex items-center gap-2 text-xs font-medium text-gray-300">
          {action || null}
          {onClick ? (
            dir === 'rtl' ? (
              <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            ) : (
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            )
          ) : null}
        </span>
      ) : null}
    </Element>
  );
};

export default SettingsItem;
