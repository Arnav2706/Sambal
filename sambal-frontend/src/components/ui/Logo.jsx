import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function Logo({ className = "" }) {
  return (
    <div className={`relative flex items-center justify-center w-9 h-9 shrink-0 ${className}`}>
      {/* Back rotated layer */}
      <div className="absolute inset-0 bg-accent-500 rounded-xl transform rotate-6 opacity-80 backdrop-blur-sm transition-transform duration-300 group-hover:rotate-12"></div>
      
      {/* Front main layer */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary-950 to-primary-800 rounded-xl transform rotate-0 shadow-[0_4px_12px_rgba(4,31,65,0.4)] border border-white/10 transition-transform duration-300 group-hover:scale-105"></div>
      
      {/* Glossy highlight */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/5 to-transparent rounded-xl pointer-events-none"></div>
      
      {/* Icon inside */}
      <div className="relative z-10 text-accent-400 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
        <ShieldCheck className="w-5 h-5 drop-shadow-md" strokeWidth={2.5} />
      </div>
    </div>
  );
}
