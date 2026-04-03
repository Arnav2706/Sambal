import React from 'react';
import { cn } from './Button';

export function Table({ children, className }) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-slate-200">
      <table className={cn("w-full text-sm text-left", className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className }) {
  return (
    <thead className={cn("text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200", className)}>
      {children}
    </thead>
  );
}

export function TableRow({ children, className, ...props }) {
  return (
    <tr className={cn("bg-white border-b last:border-b-0 hover:bg-slate-50 transition-colors", className)} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className }) {
  return (
    <th className={cn("px-6 py-4 font-medium", className)}>
      {children}
    </th>
  );
}

export function TableCell({ children, className }) {
  return (
    <td className={cn("px-6 py-4", className)}>
      {children}
    </td>
  );
}
