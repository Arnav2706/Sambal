import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent } from '../components/ui/Card';
import { Timeline } from '../components/ui/Timeline';
import { Button } from '../components/ui/Button';
import { CheckCircle2, ChevronLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  { title: "Event Detected", description: "AI detected 'Severe Water Logging' in Koramangala.", aiValidation: true },
  { title: "Zone Verfication", description: "Verified your presence in the affected zone based on work history.", aiValidation: true },
  { title: "Earnings Drop Confirmed", description: "Confirmed significant drop in expected daily earnings.", aiValidation: true },
  { title: "Claim Approved", description: "Policy terms met. Initiating instant payout of ₹1,200.", aiValidation: false },
  { title: "Payout Successful", description: "Money transferred to UPI ID: ramesh@oksbi", aiValidation: false }
];

export default function Claims() {
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();

  // Simulate automated AI claim progressing
  useEffect(() => {
    if (activeStep < STEPS.length) {
      const timer = setTimeout(() => {
        setActiveStep(prev => prev + 1);
      }, 2500); // 2.5s per step for a good demo show
      return () => clearTimeout(timer);
    }
  }, [activeStep]);

  const isSuccess = activeStep === STEPS.length;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto w-full px-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="mb-6 -ml-4 text-slate-500">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Button>

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Claim Processing</h1>
                <p className="text-slate-500">Our AI is currently assessing the weather disruption in your zone.</p>
              </div>
              <Card>
                <CardContent className="p-8">
                  <Timeline steps={STEPS} activeStepIndex={activeStep} />
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="mt-8"
            >
              <Card className="text-center overflow-hidden border-0 bg-gradient-to-br from-white to-emerald-50">
                <CardContent className="p-10 flex flex-col items-center">
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-sm"
                  >
                    <CheckCircle2 className="w-10 h-10" />
                  </motion.div>
                  <motion.h2 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-3xl font-bold text-slate-900 mb-2"
                  >
                    Claim Successful
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-slate-600 mb-8 max-w-sm"
                  >
                    Your automated payout of <span className="font-bold text-emerald-600">₹1,200</span> has been transferred to your registered UPI.
                  </motion.p>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-col w-full gap-3"
                  >
                    <Button onClick={() => navigate('/dashboard')} fullWidth>
                      Return to Dashboard
                    </Button>
                    <Button variant="outline" fullWidth>
                       <Download className="w-4 h-4 mr-2" /> Download Receipt
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
