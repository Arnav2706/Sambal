import { motion } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function Card({ className, children, hoverEffect = false, delay = 0, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={hoverEffect ? { y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' } : {}}
      className={cn(
        'bg-white rounded-xl shadow-soft border border-slate-100 overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ className, children }) {
  return <div className={cn('px-6 py-5 border-b border-slate-100', className)}>{children}</div>;
}

export function CardTitle({ className, children }) {
  return <h3 className={cn('text-lg font-semibold text-slate-900', className)}>{children}</h3>;
}

export function CardContent({ className, children }) {
  return <div className={cn('p-6', className)}>{children}</div>;
}

export function CardFooter({ className, children }) {
  return <div className={cn('px-6 py-4 bg-slate-50 border-t border-slate-100', className)}>{children}</div>;
}
