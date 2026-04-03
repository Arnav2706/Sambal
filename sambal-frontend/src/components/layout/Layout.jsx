import React from 'react';
import { Navbar } from './Navbar';
import { motion } from 'framer-motion';

export function Layout({ children, withPadding = true }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />
      <main className={`flex-1 flex flex-col w-full ${withPadding ? 'pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' : ''}`}>
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.3 }}
           className="w-full flex-1 flex flex-col"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
