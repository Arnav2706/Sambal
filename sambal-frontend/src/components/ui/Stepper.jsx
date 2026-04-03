import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from './Button';

export function Stepper({ steps, currentStep, className }) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full overflow-hidden" />
        
        <motion.div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-600 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={index} className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isCompleted ? '#2563eb' : isCurrent ? '#2563eb' : '#ffffff',
                  borderColor: isCompleted || isCurrent ? '#2563eb' : '#cbd5e1',
                  color: isCompleted || isCurrent ? '#ffffff' : '#64748b',
                  scale: isCurrent ? 1.1 : 1
                }}
                className={cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold mb-2 transition-colors duration-300",
                  isCompleted && "ring-2 ring-primary-100"
                )}
              >
                {isCompleted ? <Check className="w-4 h-4 text-white" /> : index + 1}
              </motion.div>
              <span className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full absolute -bottom-6 whitespace-nowrap",
                isCurrent ? "text-primary-700 bg-primary-50" : "text-slate-500"
              )}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
