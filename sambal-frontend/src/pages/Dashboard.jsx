import React from 'react';
import { motion } from 'framer-motion';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShieldCheck, CloudLightning, Calendar, ChevronRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="space-y-8 max-w-6xl mx-auto w-full">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Hello, Ramesh</h1>
            <p className="text-slate-500">Your AI income protection is active in Koramangala.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/claims/form')}>
            File Manual Claim
          </Button>
        </div>

        {/* Top Cards (Staggered Animation) */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } }
          }}
        >
          {/* Active Policy Card */}
          <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}>
            <Card className="h-full bg-gradient-to-br from-primary-600 to-primary-800 text-white border-0">
              <CardContent className="p-6 h-full flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -right-12 -top-12 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="relative z-10 flex justify-between items-start mb-8">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-100 text-xs font-semibold mb-3 border border-emerald-500/30">
                      <ShieldCheck className="w-3.5 h-3.5" /> Active Coverage
                    </div>
                    <h2 className="text-3xl font-bold">₹1,200</h2>
                    <p className="text-primary-100 text-sm">Protected Daily Income</p>
                  </div>
                </div>
                <div className="relative z-10 flex items-center justify-between text-sm text-primary-100 border-t border-primary-500/30 pt-4 mt-auto">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Auto-renews in 4 days
                  </div>
                  <span className="font-semibold text-white">₹45/wk</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Alert Card */}
          <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}>
            <Card className="h-full">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div className="flex items-center gap-2 text-amber-600 mb-4 font-medium">
                  <CloudLightning className="w-5 h-5" /> Local Weather Alert
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Heavy Rain Expected</h3>
                <p className="text-sm text-slate-600 mb-4">
                  AI forecasts 80% chance of severe water-logging in your primary zone between 4 PM and 8 PM today.
                </p>
                <div className="mt-auto">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">System Status</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-medium text-slate-700">Monitoring actively</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Statistics Card */}
          <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}>
            <Card className="h-full">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex items-center gap-2 text-primary-600 mb-6 font-medium">
                  <Activity className="w-5 h-5" /> Quick Stats
                </div>
                <div className="space-y-4 mt-auto">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 text-sm">Protected Weeks</span>
                    <span className="font-semibold text-slate-800">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 text-sm">Automatic Payouts</span>
                    <span className="font-semibold text-slate-800">₹2,400</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <span className="text-sm text-emerald-600 font-medium">AI Premium Savings</span>
                    <span className="font-semibold text-emerald-700 font-mono">₹144 total</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Claims History */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
               <CardTitle>Recent Activity</CardTitle>
               <Button variant="ghost" size="sm" className="hidden sm:flex" onClick={() => navigate('/claims')}>
                 View all <ChevronRight className="w-4 h-4 ml-1" />
               </Button>
            </CardHeader>
            <div className="divide-y divide-slate-100">
               {[
                 { event: "Automated AI Payout (Heavy Rain)", date: "August 14, 2026", amount: "+₹1200", status: "Credited" },
                 { event: "Weekly Premium Auto-deduct", date: "August 10, 2026", amount: "-₹45", status: "Success" }
               ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-6 hover:bg-slate-50 transition-colors">
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.amount.startsWith('+') ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                           {item.amount.startsWith('+') ? <Zap className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                        </div>
                        <div>
                           <p className="font-semibold text-slate-800">{item.event}</p>
                           <p className="text-sm text-slate-500">{item.date}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className={`font-bold ${item.amount.startsWith('+') ? 'text-emerald-600' : 'text-slate-800'}`}>{item.amount}</p>
                        <p className="text-xs text-slate-500 font-medium">{item.status}</p>
                     </div>
                  </div>
               ))}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center sm:hidden">
               <Button variant="ghost" fullWidth onClick={() => navigate('/claims')}>View all activities</Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
