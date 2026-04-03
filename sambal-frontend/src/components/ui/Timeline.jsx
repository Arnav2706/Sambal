import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CircleDashed, Circle, AlertCircle } from 'lucide-react';
import { cn } from './Button';

export function Timeline({ steps, activeStepIndex, isError = false }) {
  return (
    <div className="relative pl-4">
      {/* Vertical Track bg */}
      <div className="absolute left-[1.1875rem] top-4 bottom-4 w-[2px] bg-slate-100 rounded-full" />
      
      {/* Animated valid fill track */}
      <motion.div
        className="absolute left-[1.1875rem] top-4 w-[2px] bg-primary-500 origin-top rounded-full"
        initial={{ height: '0%' }}
        animate={{ height: `${(activeStepIndex / Math.max(1, steps.length - 1)) * 100}%` }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />

      <div className="space-y-8">
        {steps.map((step, index) => {
          const isCompleted = index < activeStepIndex;
          const isCurrent = index === activeStepIndex;
          const isPending = index > activeStepIndex;
          const isErrorStep = isError && isCurrent;

          return (
            <motion.div 
              key={index} 
              className="relative flex items-start"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: isPending ? 0.4 : 1, x: 0 }}
              transition={{ delay: index * 0.15, duration: 0.4 }}
            >
              {/* Icon Indicator */}
              <div className="relative z-10 flex items-center justify-center w-6 h-6 mr-4 bg-white">
                <AnimatePresence mode="wait">
                  {isCompleted ? (
                    <motion.div
                      key="completed"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shadow-sm"
                    >
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </motion.div>
                  ) : isErrorStep ? (
                    <motion.div
                      key="error"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-red-500 bg-white"
                    >
                      <AlertCircle className="w-5 h-5" />
                    </motion.div>
                  ) : isCurrent ? (
                    <motion.div
                      key="current"
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      className="text-primary-600 bg-white"
                    >
                      <CircleDashed className="w-5 h-5 animate-spin-slow" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="pending"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-slate-300 bg-white"
                    >
                      <Circle className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Content */}
              <div className="flex-1 pt-0.5">
                <motion.h4 
                  className={cn(
                    "text-sm font-semibold transition-colors",
                    isErrorStep ? "text-red-600" : isCompleted || isCurrent ? "text-slate-800" : "text-slate-400"
                  )}
                >
                  {step.title}
                </motion.h4>
                <AnimatePresence>
                  {step.description && (!isPending || isCurrent) && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="text-sm text-slate-500 mt-1 max-w-sm"
                    >
                      {step.description}
                    </motion.p>
                  )}
                </AnimatePresence>
                {/* AI specific badge / simulated loading line */}
                {isCurrent && step.aiValidation && !isErrorStep && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 flex items-center space-x-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md w-fit"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>AI Validation in Progress...</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
