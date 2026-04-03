import React from 'react';
import { motion } from 'framer-motion';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Check, X, Shield, Zap, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Plans() {
  const location = useLocation();
  const navigate = useNavigate();
  const { riskResult, formData } = location.state || {};

  const plans = [
    {
      id: 'basic',
      name: 'SAMBAL Basic',
      price: '₹0',
      period: '/month',
      icon: <AlertTriangle className="w-5 h-5 text-slate-400" />,
      color: 'slate',
      features: [
        { text: 'Alerts + AI insights', included: true },
        { text: '“Missed earnings” preview', included: true },
        { text: 'No payouts', included: false },
      ],
      buttonText: 'Start Free',
      popular: false
    },
    {
      id: 'plus',
      name: 'SAMBAL Plus',
      badge: '⭐ Main Plan',
      price: '₹109',
      period: '/month',
      icon: <Zap className="w-5 h-5 text-blue-500" />,
      color: 'blue',
      features: [
        { text: 'Real payouts enabled', included: true },
        { text: 'Max payout: ₹1,500/day', included: true },
        { text: 'Risk multiplier: up to 1.5x', included: true },
        { text: 'Faster payouts', included: true },
        { text: 'Priority AI monitoring', included: true },
      ],
      buttonText: 'Activate Plus',
      popular: true
    },
    {
      id: 'pro',
      name: 'SAMBAL Pro',
      price: '₹199',
      period: '/month',
      icon: <Sparkles className="w-5 h-5 text-purple-500" />,
      color: 'purple',
      features: [
        { text: 'Max payout: ₹2,500/day', included: true },
        { text: 'Risk multiplier: up to 2.0x', included: true },
        { text: 'Instant UPI payouts ⚡', included: true },
        { text: 'Advanced AI insights', included: true },
        { text: 'Early disruption alerts', included: true },
      ],
      buttonText: 'Go Pro',
      popular: false
    },
    {
      id: 'elite',
      name: 'SAMBAL Elite',
      price: '₹299',
      period: '/month',
      icon: <Shield className="w-5 h-5 text-amber-500" />,
      color: 'amber',
      features: [
        { text: 'Priority payouts (fastest)', included: true },
        { text: '“No earnings day” protection', included: true },
        { text: 'Custom AI tuning', included: true },
        { text: 'Premium support', included: true },
      ],
      buttonText: 'Join Elite',
      popular: false
    }
  ];

  return (
    <Layout>
      <div className="max-w-[1440px] mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold tracking-wider uppercase mb-6 border border-emerald-200">
            <Shield className="w-3.5 h-3.5" />
            <span>AI Risk Score Formulated</span>
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Choose Your Protection
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-slate-500 text-lg max-w-2xl mx-auto">
            {formData?.city ? `Based on your AI verification for ${formData.city}, we've unlocked the following tiers.` : "Select the plan that matches your earnings profile. Upgrade or downgrade anytime."}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`relative bg-white rounded-3xl border-2 flex flex-col p-6 transition-all duration-300 hover:-translate-y-2
                ${plan.popular ? 'border-primary-500 shadow-xl shadow-primary-500/10' : 'border-slate-100 shadow-sm hover:shadow-lg'}
              `}
            >
              {plan.popular && (
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                  <span className="bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest py-1.5 px-4 rounded-full shadow-md truncate">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6 flex items-center justify-between mt-2">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">{plan.name}</h3>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${plan.color}-50`}>
                  {plan.icon}
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline">
                  <span className="text-4xl font-black text-slate-900 tracking-tight">{plan.price}</span>
                  <span className="text-sm font-bold text-slate-400 ml-1">{plan.period}</span>
                </div>
              </div>

              <div className="flex flex-col gap-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    {feature.included ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-emerald-600" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                        <X className="w-3 h-3 text-slate-400" />
                      </div>
                    )}
                    <span className={`text-sm font-medium leading-tight ${feature.included ? 'text-slate-700' : 'text-slate-400'}`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <Button 
                variant={plan.popular ? 'primary' : 'outline'} 
                className={`w-full mt-auto rounded-xl py-6 font-bold ${plan.popular ? 'bg-primary-600 hover:bg-primary-700 text-white' : ''}`}
                onClick={() => navigate('/dashboard')}
              >
                {plan.buttonText}
              </Button>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
           <p className="text-slate-500 text-sm font-medium flex items-center justify-center gap-2">
             <Shield className="w-4 h-4 text-slate-400" /> Fully transparent. Processed securely by SAMBAL Disruption Engine.
           </p>
        </div>
      </div>
    </Layout>
  );
}
