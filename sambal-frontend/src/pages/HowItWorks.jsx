import React from 'react';
import { motion } from 'framer-motion';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Activity, ShieldCheck, Sparkles, CloudRain, Thermometer, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function HowItWorks() {
  const navigate = useNavigate();

  return (
    <Layout>
      <section className="py-28 w-full bg-slate-50 px-4 sm:px-6 lg:px-12 min-h-screen">
        <div className="max-w-[1440px] mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUpVariant} className="mb-20">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-bold tracking-wider uppercase mb-6 border border-primary-200 shadow-sm">
              <Sparkles className="w-4 h-4" />
              <span>POWERED BY SAMBAL AI</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">How it Works</h2>
            <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">Three steps to complete income peace of mind, driven by our proprietary real-time AI disruption engine.</p>
          </motion.div>
          
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24 text-center relative mb-24" variants={staggerContainer} initial="hidden" animate="visible">
             {/* Simple connecting line hidden on mobile */}
             <div className="hidden md:block absolute top-[2.5rem] left-[15%] right-[15%] h-[2px] bg-slate-200 z-0"></div>
             
             {[
               { id: "01", title: "Connect & Verify", desc: "Search for your city and link your platform ID. Our AI matches your location to historical and live disruption zones." },
               { id: "02", title: "AI Intelligence v3.0", desc: "SAMBAL monitors satellite precipitation, heat indexes, and strike alerts in real-time. No manual reports needed." },
               { id: "03", title: "Automated Release", desc: "Once a disruption crosses the threshold, our deterministic formula calculates and releases ₹100 - ₹2,500 instantly." }
             ].map((step, i) => (
               <motion.div key={i} variants={fadeUpVariant} className="relative z-10 flex flex-col items-center group">
                 <div className="w-20 h-20 rounded-2xl bg-white text-primary-600 border px-2 border-slate-100 flex items-center justify-center text-xl font-black mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all group-hover:bg-primary-600 group-hover:text-white group-hover:shadow-primary-600/20 group-hover:-translate-y-2">
                   {step.id}
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 mb-4 italic tracking-wide uppercase">{step.title}</h3>
                 <p className="text-slate-600 leading-relaxed max-w-[280px] text-base">{step.desc}</p>
               </motion.div>
             ))}
          </motion.div>

          {/* New Section: Trigger Thresholds & Payouts */}
          <div className="max-w-5xl mx-auto mb-16">
            <h3 className="text-3xl font-black text-slate-900 mb-10 text-center flex items-center justify-center gap-3">
              <ShieldCheck className="w-8 h-8 text-primary-600" />
              Trigger Thresholds & Payout Rates
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
              
              {/* Rain Card */}
              <div className="bg-white border-2 border-slate-100 p-8 rounded-3xl shadow-sm hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                  <CloudRain className="w-6 h-6" />
                </div>
                <h4 className="text-slate-900 font-black mb-2 uppercase text-sm tracking-widest">Moderate Rain</h4>
                <p className="text-4xl font-black text-slate-900 mb-2">30mm <span className="text-slate-400 text-base font-bold uppercase tracking-widest block mt-1">Disruption</span></p>
                <div className="h-1 w-16 bg-blue-500 mb-6 rounded-full" />
                <p className="text-sm text-slate-500 font-bold uppercase tracking-tight">Starts at ₹8 / mm (base)</p>
                <p className="text-sm text-blue-600 font-black uppercase tracking-tight mt-2 animate-pulse">Bonus: ₹20/mm above 80mm</p>
              </div>

              {/* Heat Card */}
              <div className="bg-white border-2 border-slate-100 p-8 rounded-3xl shadow-sm hover:border-orange-200 hover:shadow-xl hover:shadow-orange-900/5 transition-all">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
                  <Thermometer className="w-6 h-6" />
                </div>
                <h4 className="text-slate-900 font-black mb-2 uppercase text-sm tracking-widest">Extreme Heat</h4>
                <p className="text-4xl font-black text-slate-900 mb-2">38°C <span className="text-slate-400 text-base font-bold uppercase tracking-widest block mt-1">Heat Index</span></p>
                <div className="h-1 w-16 bg-orange-500 mb-6 rounded-full" />
                <p className="text-sm text-slate-500 font-bold uppercase tracking-tight">Rate: ₹50 / °C</p>
                <p className="text-sm text-orange-600 font-black uppercase tracking-tight mt-2">Health advisory verified</p>
              </div>

              {/* Strike Card */}
              <div className="bg-white border-2 border-slate-100 p-8 rounded-3xl shadow-sm hover:border-red-200 hover:shadow-xl hover:shadow-red-900/5 transition-all">
                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-6">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h4 className="text-slate-900 font-black mb-2 uppercase text-sm tracking-widest">Civic Strike</h4>
                <p className="text-4xl font-black text-slate-900 mb-2">0.3<span className="text-2xl text-slate-400">/1.0</span> <span className="text-slate-400 text-base font-bold uppercase tracking-widest block mt-1">Intensity</span></p>
                <div className="h-1 w-16 bg-red-500 mb-6 rounded-full" />
                <p className="text-sm text-slate-500 font-bold uppercase tracking-tight">Partial: ₹600 Base</p>
                <p className="text-sm text-red-600 font-black uppercase tracking-tight mt-2">Full: ₹1,500 Total</p>
              </div>

            </div>
          </div>

          {/* Policy Snapshot Card */}
          <div className="max-w-2xl mx-auto rounded-3xl bg-white border-2 border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 mb-20 flex flex-wrap justify-between items-center gap-8">
            <div className="flex items-center gap-4">
               <ShieldCheck className="w-8 h-8 text-primary-600 shrink-0" />
               <div className="text-left">
                 <p className="text-slate-900 font-black text-sm uppercase tracking-widest leading-none mb-2">SAMBAL Policy Window</p>
                 <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">Active Verification: 06:00 – 23:00 IST</p>
               </div>
            </div>
            <div className="flex gap-6">
               <div className="text-center">
                  <p className="text-primary-700 font-black text-2xl leading-none mb-1">₹100</p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Min Guarantee</p>
               </div>
               <div className="text-center border-l-2 border-slate-100 pl-6">
                  <p className="text-slate-900 font-black text-2xl leading-none mb-1">2.0X</p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Max Multiplier</p>
               </div>
            </div>
          </div>

          <motion.div initial="hidden" animate="visible" variants={fadeUpVariant}>
             <Button size="lg" className="px-10 py-6 text-lg font-black bg-slate-900 text-white hover:bg-slate-800 transition-all hover:scale-105 shadow-xl shadow-slate-900/10" onClick={() => navigate('/sambal-ai')}>
               <Activity className="w-6 h-6 mr-3 text-emerald-400" />
               Try the SAMBAL AI Engine Live
             </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
