import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { Card, CardContent } from '../components/ui/Card';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, ShieldCheck, Zap, Server, ChevronDown, Sparkles, Receipt, Laptop, ChevronUp, CloudRain, Thermometer, AlertTriangle } from 'lucide-react';

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

export default function Home() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = React.useState(0);

  return (
    <Layout withPadding={false}>
      {/* 1. Hero Section */}
      <section className="relative px-4 pt-32 pb-24 lg:pt-36 lg:pb-12 max-w-[1440px] mx-auto w-full min-h-[95vh] lg:min-h-[90vh] flex items-center overflow-visible bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10 px-4 sm:px-8 lg:px-12 w-full">
          
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="max-w-2xl text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold tracking-wider uppercase mb-8 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-POWERED PROTECTION</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
              Protect Your <br className="hidden sm:block" /> Income, <br />
              <span className="text-accent-500">Automatically.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-xl leading-relaxed">
              The first AI-powered safety net for India's gig economy. Get paid automatically when rain, heat, or strikes disrupt your work.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
               <Button size="lg" onClick={() => navigate('/onboarding')} className="w-full sm:w-auto px-8 bg-primary-900 hover:bg-primary-950 text-white rounded-lg">
                 Get Started (Free)
               </Button>
               <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8 bg-blue-100/50 text-primary-900 hover:bg-blue-100 font-semibold" onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}>
                 Watch Demo
               </Button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8 }} className="relative h-full min-h-[680px] w-full hidden lg:flex items-center justify-center z-10">
             <div className="relative w-[340px] h-[680px] bg-slate-100/50 rounded-[3rem] shadow-2xl flex items-center justify-center p-2.5 outline outline-1 outline-slate-200">
                {/* Simulated Phone (iPhone 17 layout) */}
                <div className="w-full h-full bg-white rounded-[2.5rem] border-[4px] border-slate-800 shadow-inner relative flex flex-col items-center overflow-hidden">
                   {/* Dynamic Island */}
                   <div className="w-24 h-7 bg-black rounded-full absolute top-2 z-50 flex items-center justify-center overflow-hidden shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.9)] absolute right-3"></div>
                      <div className="w-2 h-2 rounded-full bg-[#111] absolute left-3 opacity-80 shadow-inner"></div>
                   </div>
                   
                   {/* Status Bar */}
                   <div className="w-full flex justify-between items-center px-6 pt-3 pb-2 text-[10px] font-semibold text-slate-900 z-40 bg-white/80 backdrop-blur-md absolute top-0">
                      <span>9:41</span>
                      <div className="flex gap-1.5 items-center">
                         <Activity className="w-3.5 h-3.5" />
                      </div>
                   </div>

                   {/* Phone Content Mockup */}
                   <div className="flex-1 w-full pt-14 pb-6 px-4 bg-slate-50 flex flex-col overflow-y-auto hide-scrollbar">
                      
                      {/* Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Welcome back,</p>
                          <h4 className="text-lg font-bold text-slate-900">Ramesh K.</h4>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                           <img src="https://i.pravatar.cc/100?img=4" alt="profile" />
                        </div>
                      </div>

                      {/* Active Protection Card */}
                      <div className="w-full bg-gradient-to-br from-primary-900 to-primary-800 rounded-2xl p-5 mb-5 shadow-lg relative overflow-hidden text-white">
                         <div className="absolute -top-4 -right-4 p-4 opacity-10"><ShieldCheck className="w-24 h-24" /></div>
                         <div className="relative z-10">
                            <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider mb-2 inline-block shadow-sm">Active Protection</span>
                            <div className="text-3xl font-extrabold mt-2 mb-1">₹10,000</div>
                            <p className="text-[11px] text-blue-100/90 font-medium tracking-wide">Max daily payout limit</p>
                            <div className="mt-5 pt-4 border-t border-white/10 flex justify-between items-center text-sm">
                               <div className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-accent-400" /> <span className="font-medium text-blue-50 text-xs">AI Monitoring: ON</span></div>
                               <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] animate-pulse"></div>
                            </div>
                         </div>
                      </div>

                      {/* Recent Alerts */}
                      <h5 className="font-bold text-slate-900 mb-3 text-[13px] flex justify-between items-center px-1">
                         Recent Alerts
                         <span className="text-primary-600 text-xs font-semibold cursor-pointer py-1 px-2 rounded-md hover:bg-slate-100 transition">View All</span>
                      </h5>
                      <div className="space-y-3">
                         <div className="bg-white p-3.5 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex gap-3.5 items-center">
                            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0 shadow-inner">
                               <Zap className="w-5 h-5 fill-current" />
                            </div>
                            <div className="flex-1">
                               <p className="text-[13px] font-bold text-slate-900">Heavy Rain Detected</p>
                               <p className="text-[11px] text-slate-500 mt-0.5">Andheri East • Payout initiated</p>
                            </div>
                            <div className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100">+₹500</div>
                         </div>
                         <div className="bg-white p-3.5 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex gap-3.5 items-center opacity-80 hover:opacity-100 transition">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0 shadow-inner">
                               <Activity className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                               <p className="text-[13px] font-bold text-slate-900">Platform Outage</p>
                               <p className="text-[11px] text-slate-500 mt-0.5">Swiggy Servers Down</p>
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 uppercase tracking-wider">Monitoring</div>
                         </div>
                      </div>

                   </div>



                   {/* Home Indicator */}
                   <div className="w-32 h-1 bg-slate-800 rounded-full absolute bottom-2 z-50"></div>
                </div>
             </div>
          </motion.div>

        </div>
      </section>

      {/* 2. Stats Deck / Institutional Control */}
      <section className="py-24 bg-slate-50 w-full px-4 sm:px-6 lg:px-12 border-t border-b border-slate-100">
        <div className="max-w-[1440px] mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant} className="mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Institutional Control for the Gig Economy</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">SAMBAL provides platforms with the tools to manage large-scale workforce resilience and automated claim settlements.</p>
          </motion.div>
          
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
             {[
               { title: "Active Claims", val: "1,284", sub: "+12% from yesterday", icon: Receipt },
               { title: "Payout Volume", val: "₹4.2M", sub: "Current settlement cycle", icon: Activity },
               { title: "Platform Status", val: "99.9% Uptime", sub: "Real-time data synchronization", icon: Server, isSuccess: true }
             ].map((stat, i) => (
               <motion.div key={i} variants={fadeUpVariant}>
                 <Card className="h-full border border-slate-100 shadow-sm text-left">
                   <CardContent className="p-8">
                     <div className="flex justify-between items-start mb-6">
                        <p className="text-slate-500 font-medium">{stat.title}</p>
                        <stat.icon className={`w-5 h-5 ${stat.isSuccess ? 'text-emerald-500' : 'text-primary-900'}`} />
                     </div>
                     <h3 className="text-4xl font-bold text-slate-900 mb-2">{stat.val}</h3>
                     <p className={`text-sm font-medium ${stat.isSuccess ? 'text-emerald-600 flex items-center gap-1.5' : 'text-slate-500'}`}>
                       {stat.isSuccess && <span className="w-2 h-2 inline-block rounded-full bg-emerald-500"></span>}
                       {stat.sub}
                     </p>
                   </CardContent>
                 </Card>
               </motion.div>
             ))}
          </motion.div>
        </div>
      </section>

      {/* 3. Core Features horizontal cards */}
      <section className="py-24 bg-white w-full px-4 sm:px-6 lg:px-12">
        <div className="max-w-[1440px] mx-auto">
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
             <motion.div variants={fadeUpVariant}>
                <Card className="border border-slate-100 shadow-sm h-full hover:shadow-md transition">
                  <CardContent className="p-10">
                    <div className="w-12 h-12 rounded-xl bg-accent-50 text-accent-500 flex items-center justify-center mb-6">
                       <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Zero-Effort Claims</h3>
                    <p className="text-slate-600 leading-relaxed text-lg">AI detects disruptions and initiates payouts immediately. No paperwork, no wait times. Just protection.</p>
                  </CardContent>
                </Card>
             </motion.div>
             
             <motion.div variants={fadeUpVariant}>
                <Card className="border border-transparent bg-primary-900 text-white shadow-xl h-full transform md:-translate-y-4">
                  <CardContent className="p-10 relative overflow-hidden h-full flex flex-col justify-center">
                    <div className="absolute right-0 bottom-0 opacity-10">
                       {/* giant abstract icon or shape */}
                       <div className="w-48 h-48 border-[1rem] border-white rounded-3xl translate-x-12 translate-y-12"></div>
                    </div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center mb-6">
                         <Zap className="w-6 h-6 fill-current" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4">Instant Payouts</h3>
                      <p className="text-slate-300 leading-relaxed text-lg">Money in your bank in minutes via UPI. We ensure liquidity when you need it most, at the speed of light.</p>
                    </div>
                  </CardContent>
                </Card>
             </motion.div>

             <motion.div variants={fadeUpVariant}>
                <Card className="border border-slate-100 shadow-sm h-full hover:shadow-md transition">
                  <CardContent className="p-10">
                    <div className="w-12 h-12 rounded-xl bg-accent-50 text-accent-500 flex items-center justify-center mb-6">
                       <Activity className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Full Transparency</h3>
                    <p className="text-slate-600 leading-relaxed text-lg">Real-time monitoring and historical earnings analytics. Every ₹ is accounted for with detailed AI reasoning.</p>
                  </CardContent>
                </Card>
             </motion.div>
          </motion.div>
        </div>
      </section>



      {/* 5. Trust Section */}
      <section className="py-24 bg-white w-full px-4 sm:px-6 lg:px-12">
        <div className="max-w-[1440px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-blue-50/50 rounded-3xl p-8 lg:p-16 border border-blue-100 flex flex-col lg:flex-row gap-12 items-center"
          >
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                Built for India's Gig Economy.
              </h2>
              <p className="text-lg text-slate-600 max-w-xl">
                We've built SAMBAL to be the reliable partner you've always needed in the volatile world of gig work.
              </p>
              <ul className="space-y-4 pt-4">
                {[
                  "No manual forms or claims agents",
                  "99.9% disruption detection accuracy",
                  "₹0 monthly commitment for base plan"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-slate-800 font-medium">
                    <div className="w-6 h-6 rounded-full bg-primary-900 text-white flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex-1 grid grid-cols-2 gap-4 w-full">
              {/* Abstract Trust Image Grid matching mockup roughly */}
              <div className="h-40 bg-primary-900 shadow-inner rounded-xl overflow-hidden flex flex-col justify-end p-4 border border-slate-100 items-center">
                 <div className="text-white opacity-80 text-center font-bold text-3xl font-mono flex flex-col items-center">
                   <span>W</span>
                   <span className="text-xs tracking-widest mt-1">API WORK</span>
                 </div>
              </div>
              <div className="h-40 bg-slate-200 rounded-xl overflow-hidden shadow-inner border border-slate-100">
                 <img src="https://images.unsplash.com/photo-1542385262-ceaeb4bc43ea?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" alt="Workers" />
              </div>
              <div className="h-40 bg-slate-200 rounded-xl overflow-hidden shadow-inner border border-slate-100">
                 <img src="https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" alt="Growth" />
              </div>
              <div className="h-40 bg-slate-800 rounded-xl overflow-hidden shadow-inner border border-slate-100">
                 <img src="https://images.unsplash.com/photo-1581404172836-e63b652614b6?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover" alt="Speedometer" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="py-24 bg-white w-full px-4 sm:px-6 lg:px-12 border-t border-slate-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "How much does it cost?", a: "Our base protection plan is ₹0 per month. We take a tiny commission only when you earn protection payouts. Premium plans with higher coverage start at ₹45/month." },
              { q: "Which platforms do you support?", a: "We currently support all major Indian platforms including Swiggy, Zomato, Uber, Ola, Dunzo, and Zepto. Global platforms like Deliveroo and Grab are also available for international users." },
              { q: "Is my data secure?", a: "Absolutely. We use bank-grade 256-bit encryption. We only access the data points necessary for disruption monitoring and never share your earnings history with third parties." }
            ].map((faq, i) => (
              <div key={i} className="border border-slate-200 rounded-xl p-6 cursor-pointer hover:border-slate-300 transition" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-slate-900 text-lg">{faq.q}</h4>
                  {openFaq === i ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <p className="mt-4 text-slate-600 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-12 px-4 sm:px-6 lg:px-12">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Logo className="w-8 h-8 scale-90" />
            <span className="font-extrabold tracking-tight text-slate-900 text-lg">SAMBAL</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-slate-500">
             <Link to="/onboarding" className="hover:text-primary-900">Privacy</Link>
             <Link to="/onboarding" className="hover:text-primary-900">Terms</Link>
             <Link to="/onboarding" className="hover:text-primary-900">Support</Link>
             <Link to="/onboarding" className="hover:text-primary-900">Gig Rights</Link>
          </div>
          <div>
            <p className="text-xs text-slate-400">&copy; 2026 SAMBAL · Made in India <span className="ml-4">🌐 English</span></p>
          </div>
        </div>
      </footer>
    </Layout>
  );
}
