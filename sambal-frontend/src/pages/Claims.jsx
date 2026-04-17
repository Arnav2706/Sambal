import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  CheckCircle2, XCircle, AlertTriangle, ChevronLeft,
  Download, Shield, MapPin, CloudRain, Zap, CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

// ── Animated step indicator ───────────────────────────────────────────────────
function StepRow({ icon: Icon, title, subtitle, status, color = 'blue', children }) {
  const colors = {
    blue:   { ring: 'border-blue-400',   bg: 'bg-blue-50',   text: 'text-blue-600'   },
    green:  { ring: 'border-green-400',  bg: 'bg-green-50',  text: 'text-green-600'  },
    red:    { ring: 'border-red-400',    bg: 'bg-red-50',    text: 'text-red-600'    },
    orange: { ring: 'border-orange-400', bg: 'bg-orange-50', text: 'text-orange-600' },
    purple: { ring: 'border-purple-400', bg: 'bg-purple-50', text: 'text-purple-600' },
  };
  const c = colors[color] || colors.blue;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-start gap-4 p-4 rounded-xl border ${c.ring} ${c.bg}`}
    >
      <div className={`mt-0.5 rounded-full p-2 bg-white shadow-sm ${c.text}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className={`font-semibold text-sm ${c.text}`}>{title}</p>
          {status && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text} border ${c.ring}`}>
              {status}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5 leading-snug">{subtitle}</p>}
        {children}
      </div>
    </motion.div>
  );
}

// ── GPS Coherence visual ──────────────────────────────────────────────────────
function CoherenceGauge({ score }) {
  const pct   = Math.round(score * 100);
  const color = score > 0.85 ? '#10b981' : score > 0.70 ? '#f97316' : '#ef4444';
  const label = score > 0.85 ? 'PASS' : score > 0.70 ? 'CAUTION' : 'FAIL';
  return (
    <div className="flex items-center gap-3 mt-2">
      <div className="relative w-14 h-14">
        <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
          <circle
            cx="18" cy="18" r="15.9" fill="none"
            stroke={color} strokeWidth="3.5"
            strokeDasharray={`${pct} ${100 - pct}`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
          {pct}%
        </span>
      </div>
      <div>
        <p className="text-xs font-bold" style={{ color }}>{label}</p>
        <p className="text-xs text-slate-500">Coherence score</p>
      </div>
    </div>
  );
}

export default function Claims() {
  const [phase, setPhase]           = useState('trigger');   // trigger → fraud → payout → done
  const [claimResult, setClaimResult] = useState(null);
  const [payoutResult, setPayoutResult] = useState(null);
  const [error, setError]           = useState(null);
  const navigate                    = useNavigate();
  const { user }                    = useStore();
  const cityCoords                  = {
    Mumbai: { lat: 19.076, lon: 72.8777 },
    Delhi: { lat: 28.6139, lon: 77.209 },
    Bangalore: { lat: 12.9716, lon: 77.5946 },
    Chennai: { lat: 13.0827, lon: 80.2707 },
    Hyderabad: { lat: 17.385, lon: 78.4867 },
    Kolkata: { lat: 22.5726, lon: 88.3639 },
    Pune: { lat: 18.5204, lon: 73.8567 },
  };

  // ── Step 1 & 2: Trigger check + claim submission ──────────────────────────
  useEffect(() => {
    if (phase !== 'trigger') return;
    const run = async () => {
      try {
        const cityToFetch = user?.city || 'Chennai';
        const weatherRes  = await fetch(`http://127.0.0.1:8000/api/weather/${cityToFetch}`);
        const w           = await weatherRes.json();

        const cityPoint = cityCoords[cityToFetch] || cityCoords.Chennai;
        const res = await fetch('http://127.0.0.1:8000/api/claims/submit', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            worker_id:               user?.id || 'W-10442',
            trigger_id:              'T1 — Heavy Rain',
            rain_mm:                 w.rain_mm   || 65.4,
            heat_c:                  w.heat_index_c || 32,
            strike_severity:         0,
            gps_lat:                 cityPoint.lat,
            gps_lon:                 cityPoint.lon,
            platform_earnings_drop:  0.82,
            wind_kmh:                w.wind_kmh  || 45,
            aqi:                     w.aqi       || 180,
          }),
        });
        if (!res.ok) throw new Error('Claim submission failed');
        const data = await res.json();
        setClaimResult(data);
        setPhase('fraud');
      } catch (err) {
        setError(err.message);
      }
    };
    const t = setTimeout(run, 1800);
    return () => clearTimeout(t);
  }, [phase, user]);

  // ── Step 3: Advance fraud → payout ────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'fraud' || !claimResult) return;
    const t = setTimeout(() => setPhase('payout'), 2200);
    return () => clearTimeout(t);
  }, [phase, claimResult]);

  // ── Step 4: Initiate Razorpay payout ─────────────────────────────────────
  useEffect(() => {
    if (phase !== 'payout' || !claimResult) return;
    if (claimResult.status !== 'Auto-Approved') {
      setPhase('done');
      return;
    }
    const run = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/payout/initiate', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            claim_id:  claimResult.id,
            amount:    claimResult.amount,
            worker_id: claimResult.worker_id,
            upi_id:    'worker@paytm',
          }),
        });
        const data = await res.json();
        setPayoutResult(data);
        setPhase('done');
      } catch {
        setPhase('done');
      }
    };
    const t = setTimeout(run, 1500);
    return () => clearTimeout(t);
  }, [phase, claimResult]);

  // ── Render ────────────────────────────────────────────────────────────────
  const approved  = claimResult?.status === 'Auto-Approved';
  const rejected  = claimResult?.status === 'Rejected';
  return (
    <Layout>
      <div className="max-w-2xl mx-auto w-full px-4 pt-28 pb-16">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="mb-6 -ml-4 text-slate-500 hover:text-primary-900">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Button>

        <AnimatePresence mode="wait">
          {/* ── Processing phases ─────────────────────────────────────── */}
          {phase !== 'done' && (
            <motion.div key="processing" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">AI Claim Processing</h1>
                <p className="text-slate-500 text-sm mt-1">SAMBAL is running advanced fraud detection and parametric trigger analysis.</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600 shadow-sm">
                    5-step AI fraud engine
                  </span>
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700 shadow-sm">
                    {`City: ${user?.city || 'Chennai'}`}
                  </span>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 shadow-sm">
                    Instant UPI payout simulation
                  </span>
                </div>
              </div>

              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6 space-y-3">
                  {/* Step 1 — always shown */}
                  <StepRow
                    icon={CloudRain}
                    title="Step 1 — Parametric Trigger Analysis"
                    subtitle={claimResult
                      ? `XGBoost trigger classifier: ${claimResult.confidence}% confidence. Rain: ${claimResult.rain_mm ?? '—'}mm.`
                      : 'Evaluating weather data against trigger thresholds…'}
                    status={claimResult ? (claimResult.status !== 'Rejected' ? '✓ VALID' : '✗ BELOW THRESHOLD') : 'Running…'}
                    color={claimResult ? (claimResult.status !== 'Rejected' ? 'green' : 'red') : 'blue'}
                  />

                  {/* Step 2 — GPS Coherence (shown after claim returns) */}
                  {claimResult && (
                    <StepRow
                      icon={MapPin}
                      title="Step 2 — GPS Spoofing Detection"
                      subtitle={`Multi-signal location coherence analysis across GPS, cell tower, IP geolocation, and platform heartbeat.`}
                      status={claimResult.spoofing_detected ? '✗ SPOOF DETECTED' : '✓ COHERENT'}
                      color={claimResult.spoofing_detected ? 'red' : 'green'}
                    >
                      <CoherenceGauge score={claimResult.gps_coherence_score ?? 0.92} />
                    </StepRow>
                  )}

                  {/* Step 3 — Historical weather (shown after claim returns) */}
                  {claimResult && (
                    <StepRow
                      icon={Shield}
                      title="Step 3 — Historical Weather Baseline Check"
                      subtitle={`7-day historical avg: ${claimResult.historical_rain_baseline_mm ?? 2.0}mm. Claimed: ${claimResult.rain_mm ?? '—'}mm. ${claimResult.historical_weather_check ? 'Weather anomaly consistent with claim.' : 'Clear-weather week detected — fake claim flag raised.'}`}
                      status={claimResult.historical_weather_check ? '✓ PASS' : '✗ ANOMALY'}
                      color={claimResult.historical_weather_check ? 'green' : 'red'}
                    />
                  )}

                  {/* Step 4 — Isolation Forest (shown after fraud phase) */}
                  {(phase === 'payout' || phase === 'done' || phase === 'fraud') && claimResult && (
                    <StepRow
                      icon={Shield}
                      title="Step 4 — Isolation Forest Anomaly Detection"
                      subtitle={`Anomaly score: ${claimResult.isolation_forest_score ?? '—'} (30,000 training samples, contamination 7%). Fraud risk: ${claimResult.fraud_risk}.`}
                      status={claimResult.fraud_risk === 'Low' ? '✓ LOW RISK' : claimResult.fraud_risk === 'Medium' ? '⚠ MEDIUM' : '✗ HIGH RISK'}
                      color={claimResult.fraud_risk === 'Low' ? 'green' : claimResult.fraud_risk === 'Medium' ? 'orange' : 'red'}
                    />
                  )}

                  {/* Step 5 — Razorpay (shown during payout phase) */}
                  {phase === 'payout' && approved && (
                    <StepRow
                      icon={CreditCard}
                      title="Step 5 — Razorpay UPI Transfer"
                      subtitle="Initiating instant payout via Razorpay Test Mode..."
                      status="Processing..."
                      color="purple"
                    />
                  )}

                  {error && (
                    <div className="flex items-center gap-2 text-red-600 text-sm p-3 bg-red-50 rounded-lg border border-red-200">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>{error} — check that the backend is running on port 8000.</span>
                    </div>
                  )}

                  {claimResult && (
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 mt-2">
                      <p className="text-xs font-mono text-slate-400">ID: {claimResult.id}</p>
                      <p className="text-xs text-slate-500 mt-1 italic leading-relaxed">"{claimResult.ai_reasoning}"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ── Final result card ──────────────────────────────────────── */}
          {phase === 'done' && claimResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 180, damping: 22 }}
            >
              <Card className={`overflow-hidden border-0 ${
                approved ? 'bg-gradient-to-br from-white to-emerald-50'
                : rejected ? 'bg-gradient-to-br from-white to-red-50'
                : 'bg-gradient-to-br from-white to-orange-50'
              }`}>
                <CardContent className="p-8 flex flex-col items-center text-center">
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: 0.15, type: 'spring' }}
                    className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 shadow ${
                      approved ? 'bg-emerald-100 text-emerald-600'
                      : rejected ? 'bg-red-100 text-red-600'
                      : 'bg-orange-100 text-orange-600'
                    }`}
                  >
                    {approved ? <CheckCircle2 className="w-10 h-10" />
                    : rejected ? <XCircle className="w-10 h-10" />
                    : <AlertTriangle className="w-10 h-10" />}
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold text-slate-900 mb-1"
                  >
                    {approved ? 'Claim Approved' : rejected ? 'Claim Rejected' : 'Manual Review'}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-slate-500 text-sm mb-6"
                  >
                    {approved
                      ? `SAMBAL AI auto-approved your claim in ${claimResult.processing_time_ms}ms`
                      : rejected ? 'Conditions did not meet parametric trigger thresholds.'
                      : 'Elevated fraud risk detected. Admin review within 4 hours.'}
                  </motion.p>

                  {/* Razorpay receipt — only on approved */}
                  {approved && payoutResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="w-full bg-white border border-emerald-200 rounded-2xl p-5 mb-5 text-left shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-emerald-600" />
                          <span className="font-bold text-slate-800 text-sm">Razorpay Test Mode</span>
                        </div>
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                          {payoutResult.display_status || 'CREDITED TO BANK'}
                        </span>
                      </div>
                      <div className="mb-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                          UPI settlement simulation
                        </span>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                          Auto-approved by AI engine
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-y-2 text-xs">
                        <span className="text-slate-400">Amount</span>
                        <span className="font-bold text-emerald-700 text-base">₹{payoutResult.amount_inr}</span>
                        <span className="text-slate-400">Order ID</span>
                        <span className="font-mono text-slate-700">{payoutResult.order_id}</span>
                        <span className="text-slate-400">UTR Reference</span>
                        <span className="font-mono text-slate-700">{payoutResult.utr_reference}</span>
                        <span className="text-slate-400">Credited to</span>
                        <span className="text-slate-700">{payoutResult.credited_to}</span>
                        <span className="text-slate-400">UPI ID</span>
                        <span className="text-slate-700">{payoutResult.upi_id}</span>
                        <span className="text-slate-400">Settled at</span>
                        <span className="text-slate-700">{payoutResult.settled_at}</span>
                        <span className="text-slate-400">Claim ID</span>
                        <span className="font-mono text-slate-500">{payoutResult.claim_id}</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Fraud signals summary */}
                  {claimResult && (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="w-full grid grid-cols-3 gap-3 mb-6"
                    >
                      {[
                        {
                          label: 'GPS Coherence',
                          value: `${Math.round((claimResult.gps_coherence_score ?? 0.92) * 100)}%`,
                          ok: !claimResult.spoofing_detected,
                        },
                        {
                          label: 'Weather Check',
                          value: claimResult.historical_weather_check ? 'PASS' : 'FLAG',
                          ok: claimResult.historical_weather_check,
                        },
                        {
                          label: 'Fraud Risk',
                          value: claimResult.fraud_risk,
                          ok: claimResult.fraud_risk === 'Low',
                        },
                      ].map(({ label, value, ok }) => (
                        <div
                          key={label}
                          className={`rounded-xl p-3 text-center border ${ok ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}
                        >
                          <p className={`text-sm font-bold ${ok ? 'text-emerald-700' : 'text-red-700'}`}>{value}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* AI reasoning */}
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 0.65 }}
                    className="w-full bg-white/70 border border-slate-100 rounded-xl p-3 text-xs text-left italic text-slate-500 mb-6"
                  >
                    <strong className="not-italic text-slate-600">AI Reasoning: </strong>
                    {claimResult.ai_reasoning}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.75 }}
                    className="flex flex-col w-full gap-3"
                  >
                    <Button onClick={() => navigate('/dashboard')} fullWidth>
                      Return to Dashboard
                    </Button>
                    {approved && (
                      <Button variant="outline" fullWidth>
                        <Download className="w-4 h-4 mr-2" /> Download Receipt
                      </Button>
                    )}
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
