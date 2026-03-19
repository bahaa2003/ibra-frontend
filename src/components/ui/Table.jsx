import React from 'react';
import { cn } from './Button';

const Table = ({ className, children, ...props }) => {
  return (
    <div className="min-w-0 max-w-full overflow-x-auto rounded-[var(--radius-lg)] border border-[color:rgb(var(--color-border-rgb)/0.82)] bg-[color:rgb(var(--color-card-rgb)/0.92)] [scrollbar-width:thin] [-webkit-overflow-scrolling:touch]">
      <table className={cn('w-full caption-bottom text-sm', className)} {...props}>
        {children}
      </table>
    </div>
  );
};

const TableHeader = ({ className, children, ...props }) => (
  <thead className={cn('[&_tr]:border-b border-[color:rgb(var(--color-border-rgb)/0.9)]', className)} {...props}>
    {children}
  </thead>
);

const TableBody = ({ className, children, ...props }) => (
  <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props}>
    {children}
  </tbody>
);

const TableRow = ({ className, children, ...props }) => (
  <tr
    className={cn(
      'border-b border-[color:rgb(var(--color-border-rgb)/0.85)] transition-colors hover:bg-[color:rgb(var(--color-primary-rgb)/0.06)] data-[state=selected]:bg-[color:rgb(var(--color-primary-rgb)/0.08)]',
      className
    )}
    {...props}
  >
    {children}
  </tr>
);

const TableHead = ({ className, children, ...props }) => (
  <th
    className={cn(
      'h-12 px-4 text-start align-middle text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)] [&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  >
    {children}
  </th>
);

const TableCell = ({ className, children, ...props }) => (
  <td
    className={cn('p-4 text-start align-middle text-[var(--color-text-secondary)] [&:has([role=checkbox])]:pr-0', className)}
    {...props}
  >
    {children}
  </td>
);

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
