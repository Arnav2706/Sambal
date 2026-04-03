import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Input = forwardRef(({ className, label, error, name, helperText, ...props }, ref) => {
  return (
    <div className="w-full space-y-1.5 flex flex-col">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        ref={ref}
        className={cn(
          "w-full px-4 py-2.5 text-sm bg-white border rounded-lg shadow-sm transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500",
          "placeholder:text-slate-400",
          error ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : "border-slate-300",
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      {helperText && !error && <p className="text-sm text-slate-500">{helperText}</p>}
    </div>
  );
});

Input.displayName = "Input";
