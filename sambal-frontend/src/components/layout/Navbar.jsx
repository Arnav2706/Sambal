import React from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Menu, X, Search, Bell, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboard = location.pathname.includes('/dashboard') || location.pathname.includes('/claims') && location.pathname !== '/claims/form';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Logo & Main Links */}
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-3 group px-2">
              <Logo />
              <span className="font-extrabold text-[22px] tracking-tight text-slate-900">SAMBAL</span>
            </Link>

            <div className="hidden lg:flex items-center space-x-6">
              <NavLink to="/onboarding" className="text-slate-600 hover:text-primary-900 font-medium text-sm transition py-2 border-b-2 border-transparent hover:border-primary-900">For Workers</NavLink>
              <NavLink to="/admin" className="text-slate-600 hover:text-primary-900 font-medium text-sm transition py-2 border-b-2 border-transparent hover:border-primary-900">For Admins</NavLink>
                <NavLink to="/sambal-ai" className="text-accent-500 hover:text-accent-600 font-bold flex items-center gap-1.5 text-sm transition py-2 border-b-2 border-transparent hover:border-accent-600"><Sparkles className="w-3.5 h-3.5"/> SAMBAL AI</NavLink>
                <NavLink to="/how-it-works" className="text-slate-600 hover:text-primary-900 font-medium text-sm transition py-2 border-b-2 border-transparent hover:border-primary-900">How it Works</NavLink>
                <NavLink to="/plans" className="text-slate-600 hover:text-primary-900 font-medium text-sm transition py-2 border-b-2 border-transparent hover:border-primary-900">See Plans</NavLink>
              </div>
            </div>


          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isDashboard ? (
               <div className="flex items-center gap-4">
                 <button className="text-slate-500 hover:text-slate-800 transition">
                    <Bell className="w-5 h-5" />
                 </button>
                 <Link to="/dashboard" className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-primary-900 transition ml-2">
                   My Profile
                 </Link>
               </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" className="text-slate-600 font-medium hover:bg-slate-50" onClick={() => navigate('/auth')}>Login</Button>
                <Button variant="primary" onClick={() => navigate('/auth')}>Sign Up</Button>
                <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer transition ml-2">
                   <Bell className="w-4 h-4" />
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-500 hover:text-slate-700 p-2">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 flex flex-col space-y-4">
               <Link to="/onboarding" onClick={() => setIsOpen(false)} className="text-slate-600 font-medium">For Workers</Link>
               <Link to="/admin" onClick={() => setIsOpen(false)} className="text-slate-600 font-medium">For Admins</Link>
               <Link to="/sambal-ai" onClick={() => setIsOpen(false)} className="text-accent-500 font-bold flex items-center gap-2"><Sparkles className="w-4 h-4"/> SAMBAL AI</Link>
               <a href="#how-it-works" onClick={() => setIsOpen(false)} className="text-slate-600 font-medium">How it Works</a>
               <div className="h-px bg-slate-100 my-2"></div>
               <Link to="/auth" onClick={() => setIsOpen(false)} className="text-primary-900 font-medium">Login</Link>
               <Link to="/auth" onClick={() => setIsOpen(false)} className="text-primary-900 font-medium">Sign Up</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
