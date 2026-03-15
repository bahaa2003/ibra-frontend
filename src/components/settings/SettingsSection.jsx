import React from 'react';
import Card from '../ui/Card';
import { cn } from '../ui/Button';

const SettingsSection = ({ icon: Icon, title, description, children, className }) => {
  return (
    <Card
      className={cn(
        'rounded-2xl border border-white/10 bg-gray-950/35 p-5 backdrop-blur-md dark:border-white/10 dark:bg-gray-900/60',
        className
      )}
    >
      <div className="mb-4 flex items-start gap-3">
        {Icon && (
          <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-indigo-300">
            <Icon className="h-[18px] w-[18px]" />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-gray-300/85">{description}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">{children}</div>
    </Card>
  );
};

export default SettingsSection;
