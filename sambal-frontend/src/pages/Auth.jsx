import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [step, setStep] = useState('phone'); // phone | otp
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (phone.length < 10) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
    }, 800);
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (otp.length < 4) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center w-full px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center text-white mx-auto shadow-md mb-4">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome to SAMBAL</h1>
            <p className="text-slate-500 mt-2">Secure your hard-earned income instantly.</p>
          </div>

          <Card>
            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                {step === 'phone' ? (
                  <motion.form
                    key="phone-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handlePhoneSubmit}
                    className="space-y-6"
                  >
                    <div>
                      <Input
                        label="Phone Number"
                        name="phone"
                        type="tel"
                        placeholder="Enter 10-digit number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <Button type="submit" fullWidth isLoading={isLoading} disabled={phone.length < 10}>
                      Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <p className="text-xs text-center text-slate-500">
                      By continuing, you agree to our Terms & Privacy Policy
                    </p>
                  </motion.form>
                ) : (
                  <motion.form
                    key="otp-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleOtpSubmit}
                    className="space-y-6"
                  >
                    <div>
                      <Input
                        label={`Enter OTP sent to +91 ${phone}`}
                        name="otp"
                        type="text"
                        placeholder="4 digit code"
                        maxLength={4}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="tracking-[0.5em] text-center font-mono text-xl"
                        autoFocus
                      />
                    </div>
                    <Button type="submit" fullWidth isLoading={isLoading} disabled={otp.length < 4}>
                      Verify & Log In
                    </Button>
                    <div className="text-center mt-4">
                       <button 
                         type="button" 
                         onClick={() => setStep('phone')}
                         className="text-sm text-primary-600 font-medium hover:underline"
                       >
                         Change phone number
                       </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
