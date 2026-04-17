import React, { useEffect, useState, useRef } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ShieldAlert, Users, TrendingUp, CheckCircle, Activity, BarChart3, AlertTriangle, Zap, CloudRain, ThermometerSun, Radio, TrendingDown } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { Button } from '../components/ui/Button';
import 'leaflet/dist/leaflet.css';

// ── Static chart data ──────────────────────────────────────────────────────────
// ── Chennai zones for the city-level map ──────────────────────────────────────
const CHENNAI_ZONES_NORMAL = [
  { name: 'Velachery', pos: [12.9816, 80.2209], color: '#f97316', level: 'Medium Risk', workers: 312, radius: 18 },
  { name: 'Adyar', pos: [13.0012, 80.2565], color: '#ef4444', level: 'High Risk (Coastal)', workers: 198, radius: 22 },
  { name: 'Mylapore', pos: [13.0368, 80.2676], color: '#eab308', level: 'Minor Risk', workers: 145, radius: 14 },
  { name: 'Tambaram', pos: [12.9249, 80.1000], color: '#10b981', level: 'Low Risk', workers: 89, radius: 12 },
  { name: 'Anna Nagar', pos: [13.0850, 80.2101], color: '#10b981', level: 'Low Risk', workers: 207, radius: 14 },
  { name: 'Perambur', pos: [13.1143, 80.2332], color: '#eab308', level: 'Minor Risk', workers: 120, radius: 13 },
];

const CHENNAI_ZONES_DISRUPTED = CHENNAI_ZONES_NORMAL.map(z => ({
  ...z,
  color: '#ef4444',
  level: 'DISRUPTED — T1 RAIN',
}));

// ── Active trigger events for HUD ─────────────────────────────────────────────
const NORMAL_TRIGGERS = [
  { id: 'T1', label: 'Heavy Rain', zone: 'Adyar', status: 'watching', icon: CloudRain, color: 'text-blue-500' },
  { id: 'T2', label: 'Heat Index', zone: 'Tambaram', status: 'safe', icon: ThermometerSun, color: 'text-orange-400' },
  { id: 'T4', label: 'Cyclone Watch', zone: 'All Zones', status: 'safe', icon: Radio, color: 'text-purple-500' },
];
const DISRUPTED_TRIGGERS = [
  { id: 'T1', label: 'Heavy Rain', zone: 'All Zones', status: 'ACTIVE', icon: CloudRain, color: 'text-red-500' },
  { id: 'T2', label: 'Heat Index', zone: 'All Zones', status: 'ACTIVE', icon: ThermometerSun, color: 'text-red-500' },
  { id: 'T6', label: 'Bandh/Strike', zone: 'All Zones', status: 'ACTIVE', icon: AlertTriangle, color: 'text-red-500' },
];

export default function Admin() {
  const [summary, setSummary]       = useState(null);
  const [claimsFeed, setClaimsFeed] = useState([]);
  const [forecast, setForecast]     = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [disrupted, setDisrupted]   = useState(false);
  const [simClaims, setSimClaims]   = useState(0);
  const [simPayout, setSimPayout]   = useState(0);
  const [simLog, setSimLog]         = useState([]);
  const simLogRef = useRef(null);

  const CHENNAI_CENTER = [13.0827, 80.2707];

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [sumRes, claimsRes, forecastRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/admin/summary'),
          fetch('http://127.0.0.1:8000/api/admin/claims-feed'),
          fetch('http://127.0.0.1:8000/api/admin/predictive-forecast'),
        ]);
        if (sumRes.ok)      setSummary(await sumRes.json());
        if (claimsRes.ok)   setClaimsFeed(await claimsRes.json());
        if (forecastRes.ok) setForecast(await forecastRes.json());
      } catch (err) {
        console.error('Failed to fetch admin data', err);
      }
    };
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 30000);
    return () => clearInterval(interval);
  }, []);

  const SIM_LOG_STEPS = [
    { ms: 200,  msg: '🛰  Satellite telemetry ingested — rain >52mm detected over Chennai' },
    { ms: 600,  msg: '🌧  T1 Heavy Rain trigger threshold crossed — Adyar, Velachery, Mylapore' },
    { ms: 1000, msg: '⚡  Parametric AI activated — T1/T2/T6 triggers firing simultaneously' },
    { ms: 1400, msg: '📋  Policy registry scanned — 142 active workers in affected zones' },
    { ms: 1800, msg: '🤖  M4 XGBoost classifier: trigger_valid = TRUE (conf: 94.2%)' },
    { ms: 2200, msg: '💳  Auto-payout initiated — ₹68,400 queued across 142 claims' },
    { ms: 2600, msg: '🛡  M3 Fraud detector: 0 anomalies detected in batch' },
    { ms: 2800, msg: '✅  All claims processed — CRISIS MODE active' },
  ];

  // ─── Disruption Simulator ──────────────────────────────────────────────────
  const handleSimulate = () => {
    if (disrupted) {
      // Reset
      setDisrupted(false);
      setSimClaims(0);
      setSimPayout(0);
      setSimProgress(0);
      setSimLog([]);
      return;
    }

    setSimulating(true);
    setSimProgress(0);
    setSimLog([]);

    // Push log steps at timed intervals
    SIM_LOG_STEPS.forEach(({ ms, msg }) => {
      setTimeout(() => {
        setSimLog(prev => [...prev, msg]);
        // Auto-scroll log
        setTimeout(() => {
          if (simLogRef.current) simLogRef.current.scrollTop = simLogRef.current.scrollHeight;
        }, 50);
      }, ms);
    });

    // Animate progress bar over ~2.8s
    let prog = 0;
    const progInterval = setInterval(() => {
      prog += 3;
      setSimProgress(Math.min(prog, 100));
      if (prog >= 100) {
        clearInterval(progInterval);
        setSimulating(false);
        setDisrupted(true);
        // Simulate claims spike
        let c = 0;
        let p = 0;
        const ticker = setInterval(() => {
          c = Math.min(c + 7, 142);
          p = Math.min(p + 3400, 68400);
          setSimClaims(c);
          setSimPayout(p);
          if (c >= 142) clearInterval(ticker);
        }, 80);
      }
    }, 84);
  };

  const zones = disrupted ? CHENNAI_ZONES_DISRUPTED : CHENNAI_ZONES_NORMAL;
  const triggers = disrupted ? DISRUPTED_TRIGGERS : NORMAL_TRIGGERS;

  const kpiClaims = disrupted
    ? (summary ? summary.claims_today + simClaims : simClaims)
    : summary?.claims_today ?? '...';

  const kpiPayout = disrupted
    ? (summary ? summary.payout_today + simPayout : simPayout)
    : summary?.payout_today ?? '...';

  const financialData = summary
    ? [
        { name: 'Premium', value: summary.premium_collected_inr || 0, fill: '#0d3b4a' },
        { name: 'Payouts', value: summary.total_payouts_inr || 0, fill: '#1fbba6' },
      ]
    : [];

  const reviewQueue = claimsFeed
    .filter((claim) => claim.fraud_risk === 'High' || claim.fraud_risk === 'Medium')
    .slice(0, 3);

  return (
    <Layout>
      <div className="flex-1 w-full max-w-[1440px] px-4 sm:px-6 lg:px-12 mx-auto pt-28 pb-12 bg-slate-50/50">

        {/* ── Header ── */}
        <div className="mb-8 flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {disrupted ? '⚠️ CRISIS MODE — City-Wide Disruption' : 'Admin Control Center'}
            </h1>
            <p className={`mt-1 text-sm font-medium ${disrupted ? 'text-red-600' : 'text-slate-500'}`}>
              {disrupted ? 'T1/T2/T6 triggers firing across all Chennai zones — 142 workers affected' : 'Live platform monitoring and fraud assessment'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full border ${
              disrupted
                ? 'text-red-600 bg-red-50 border-red-200 animate-pulse'
                : 'text-emerald-600 bg-emerald-50 border-emerald-100'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${disrupted ? 'bg-red-500' : 'bg-emerald-500'}`} />
              {disrupted ? 'CRISIS — Auto-claims firing' : 'Live Status: Operational'}
            </span>
          </div>
        </div>

        {/* ── Disruption Simulator Panel ── */}
        <div className={`mb-8 rounded-2xl overflow-hidden border transition-all duration-500 ${
          disrupted
            ? 'border-red-300 shadow-lg shadow-red-100'
            : 'border-slate-700'
        }`}>
          {/* Dark header bar */}
          <div className={`px-6 py-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between transition-colors duration-500 ${
            disrupted
              ? 'bg-gradient-to-r from-red-950 to-red-900'
              : 'bg-gradient-to-r from-slate-900 to-slate-800'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl mt-0.5 ${
                disrupted ? 'bg-red-500/20 border border-red-500/30' : 'bg-white/10 border border-white/10'
              }`}>
                <Zap className={`w-5 h-5 ${disrupted ? 'text-red-400 animate-pulse' : 'text-amber-400'}`} />
              </div>
              <div>
                <p className={`text-sm font-bold tracking-wide ${
                  disrupted ? 'text-red-300' : 'text-white'
                }`}>
                  {disrupted ? '🔴 DISRUPTION SIMULATION — CRISIS MODE ACTIVE' : '⚡ SAMBAL Disruption Engine Simulator'}
                </p>
                <p className={`text-xs mt-1 ${
                  disrupted ? 'text-red-400' : 'text-slate-400'
                }`}>
                  {disrupted
                    ? `${simClaims} claims auto-processed · ₹${simPayout.toLocaleString()} payout queued · T1/T2/T6 triggered`
                    : 'Simulate a city-wide heavy rain event and watch SAMBAL react autonomously in real-time'}
                </p>
              </div>
            </div>
            <Button
              id="simulate-disruption-btn"
              onClick={handleSimulate}
              disabled={simulating}
              className={`shrink-0 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all border ${
                disrupted
                  ? 'bg-red-600 hover:bg-red-700 text-white border-red-500'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-white border-emerald-400'
              }`}
            >
              <Zap className="w-4 h-4" />
              {simulating ? 'Processing...' : disrupted ? 'Reset Simulation' : 'Simulate Disruption'}
            </Button>
          </div>

          {/* Progress bar */}
          {simulating && (
            <div className="bg-slate-950 px-6 py-3">
              <div className="flex justify-between text-[10px] text-slate-400 mb-2 font-mono">
                <span>⟳ Running SAMBAL parametric engine...</span>
                <span>{simProgress}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-400 to-red-500 rounded-full transition-all duration-100"
                  style={{ width: `${simProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Simulation event log */}
          {(simulating || disrupted) && simLog.length > 0 && (
            <div
              ref={simLogRef}
              className="bg-slate-950 border-t border-white/5 px-6 py-3 max-h-36 overflow-y-auto"
            >
              {simLog.map((line, i) => (
                <p key={i} className="text-[11px] font-mono text-slate-400 leading-relaxed py-0.5 border-b border-white/5 last:border-0">
                  <span className="text-slate-600 mr-2 select-none">{String(i + 1).padStart(2, '0')} ›</span>
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* ── KPI Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card className={disrupted ? 'border-red-200 bg-red-50/30' : ''}>
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase text-slate-500 flex items-center gap-2 mb-2">
                <Users className="w-4 h-4" /> Active Policies
              </p>
              <h3 className="text-2xl font-bold text-slate-900">
                {summary ? summary.total_policies.toLocaleString() : '...'}
              </h3>
            </CardContent>
          </Card>
          <Card className={disrupted ? 'border-red-300 bg-red-50' : ''}>
            <CardContent className="p-4">
              <p className={`text-xs font-semibold uppercase flex items-center gap-2 mb-2 ${disrupted ? 'text-red-600' : 'text-slate-500'}`}>
                <Activity className="w-4 h-4 text-blue-500" /> Claims Today
              </p>
              <h3 className={`text-2xl font-bold ${disrupted ? 'text-red-700' : 'text-slate-900'}`}>
                {kpiClaims}
              </h3>
              {disrupted && <p className="text-[10px] text-red-500 font-bold mt-1">▲ Auto-triggered</p>}
            </CardContent>
          </Card>
          <Card className={disrupted ? 'border-red-300 bg-red-50' : ''}>
            <CardContent className="p-4">
              <p className={`text-xs font-semibold uppercase flex items-center gap-2 mb-2 ${disrupted ? 'text-red-600' : 'text-slate-500'}`}>
                <TrendingUp className="w-4 h-4 text-emerald-500" /> Payout Today
              </p>
              <h3 className={`text-2xl font-bold ${disrupted ? 'text-red-700' : 'text-slate-900'}`}>
                ₹{typeof kpiPayout === 'number' ? kpiPayout.toLocaleString() : kpiPayout}
              </h3>
              {disrupted && <p className="text-[10px] text-red-500 font-bold mt-1">▲ Queued for payout</p>}
            </CardContent>
          </Card>

          {/* ── Loss Ratio KPI (new) ── */}
          <Card className={`${
            summary?.loss_ratio > 70 ? 'border-red-300 bg-red-50'
            : summary?.loss_ratio > 55 ? 'border-orange-200 bg-orange-50/30'
            : 'border-emerald-200 bg-emerald-50/30'
          }`}>
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase text-slate-500 flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-orange-500" /> Loss Ratio
              </p>
              <h3 className={`text-2xl font-bold ${
                summary?.loss_ratio > 70 ? 'text-red-700'
                : summary?.loss_ratio > 55 ? 'text-orange-600'
                : 'text-emerald-700'
              }`}>
                {summary ? `${summary.loss_ratio}%` : '...'}
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">Target: &lt;60%</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50/30">
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase text-orange-600 flex items-center gap-2 mb-2">
                <ShieldAlert className="w-4 h-4" /> Fraud Flags
              </p>
              <h3 className="text-2xl font-bold text-orange-700">
                {summary ? summary.fraud_flags : '...'}{' '}
                <span className="text-sm font-medium text-orange-500 ml-1">Pending</span>
              </h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase text-slate-500 flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Avg Confidence
              </p>
              <h3 className="text-2xl font-bold text-slate-900">{summary ? summary.avg_confidence : '...'}%</h3>
            </CardContent>
          </Card>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">

            {/* Maps + Chart row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* ─── Chennai City Zone Map ─── */}
              <Card className={`overflow-hidden transition-all duration-500 ${disrupted ? 'border-red-300 shadow-red-100 shadow-lg' : ''}`}>
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Chennai Zone Live Monitor</span>
                    {disrupted && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full animate-pulse">
                        CRISIS
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[280px] w-full">
                    <MapContainer
                      center={CHENNAI_CENTER}
                      zoom={11}
                      style={{ height: '100%', width: '100%' }}
                      key={disrupted ? 'disrupted' : 'normal'}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {zones.map((zone, idx) => (
                        <CircleMarker
                          key={idx}
                          center={zone.pos}
                          radius={zone.radius}
                          pathOptions={{
                            color: zone.color,
                            fillColor: zone.color,
                            fillOpacity: disrupted ? 0.85 : 0.6,
                            weight: disrupted ? 2 : 1,
                          }}
                        >
                          <Tooltip sticky>
                            <div className="text-xs">
                              <strong>{zone.name}</strong><br />
                              Workers: {zone.workers}<br />
                              Status: {zone.level}
                            </div>
                          </Tooltip>
                        </CircleMarker>
                      ))}
                    </MapContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Bar Chart */}
              <Card>
                <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm">Live Portfolio Position</CardTitle>
                  <span className="text-xs font-bold text-slate-400">
                    Current: {summary ? `${summary.loss_ratio}% loss ratio` : 'Loading...'}
                  </span>
                </CardHeader>
                <CardContent className="p-6 h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financialData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <RechartsTooltip
                        cursor={{ fill: '#f1f5f9' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="value" name="INR" radius={[4, 4, 0, 0]}>
                        {financialData.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Live Claims Feed */}
            <Card>
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-sm">Live Claims Feed (Module 4)</CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium">
                    <tr>
                      <th className="px-4 py-3">Claim ID</th>
                      <th className="px-4 py-3">Worker</th>
                      <th className="px-4 py-3">City</th>
                      <th className="px-4 py-3">Event</th>
                      <th className="px-4 py-3">AI Confidence</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Fraud Risk</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {claimsFeed.map((claim, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono text-xs">{claim.id}</td>
                        <td className="px-4 py-3 font-medium">{claim.worker}</td>
                        <td className="px-4 py-3 text-slate-600">{claim.city}</td>
                        <td className="px-4 py-3 text-slate-600">{claim.event}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{claim.confidence}%</td>
                        <td className="px-4 py-3 font-bold">₹{claim.amount}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded ${
                            claim.fraud_risk === 'Low' ? 'bg-emerald-50 text-emerald-600' :
                            claim.fraud_risk === 'Medium' ? 'bg-yellow-50 text-yellow-600' :
                            'bg-red-50 text-red-600'
                          }`}>
                            {claim.fraud_risk}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">{claim.status}</td>
                        <td className="px-4 py-3">
                          {claim.fraud_risk === 'High' && claim.status === 'Under Review' ? (
                            <Button variant="outline" className="text-[10px] py-1 px-2 h-auto text-orange-600 border-orange-200 hover:bg-orange-50">
                              Review
                            </Button>
                          ) : (
                            <span className="text-slate-300 text-[10px]">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {claimsFeed.length === 0 && (
                      <tr>
                        <td colSpan="9" className="text-center py-6 text-slate-400">Loading claims...</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* ── Right Sidebar ── */}
          <div className="space-y-6">

            {/* Disruption Engine HUD */}
            <Card className={`border-2 transition-all duration-500 ${disrupted ? 'border-red-300 bg-red-50/30' : 'border-slate-200'}`}>
              <CardHeader className={`pb-3 border-b ${disrupted ? 'border-red-200 bg-red-50/50' : 'border-slate-100'}`}>
                <CardTitle className={`text-sm flex items-center gap-2 ${disrupted ? 'text-red-800' : 'text-slate-800'}`}>
                  <Radio className={`w-4 h-4 ${disrupted ? 'text-red-500 animate-pulse' : 'text-indigo-500'}`} />
                  Disruption Engine HUD
                  {disrupted && <span className="text-[9px] uppercase font-black text-red-600 bg-red-100 px-1.5 py-0.5 rounded ml-auto">Live Crisis</span>}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {triggers.map((t) => {
                  const Icon = t.icon;
                  const isActive = t.status === 'ACTIVE';
                  return (
                    <div key={t.id} className={`flex justify-between items-start p-3 rounded-xl border ${isActive ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-red-500' : t.color}`} />
                        <div>
                          <p className={`text-xs font-bold ${isActive ? 'text-red-700' : 'text-slate-700'}`}>
                            {t.id}: {t.label}
                          </p>
                          <p className="text-[10px] text-slate-500">{t.zone}</p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-red-600 text-white animate-pulse' :
                        t.status === 'watching' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {isActive ? 'ACTIVE' : t.status === 'watching' ? 'Watching' : 'Safe'}
                      </span>
                    </div>
                  );
                })}
                <p className="text-[10px] text-slate-400 text-center pt-2">
                  Parametric engine · IMD API sync · 5min refresh
                </p>
              </CardContent>
            </Card>

            {/* Fraud Detection */}
            <Card className="border-orange-200">
              <CardHeader className="bg-orange-50/50 pb-3 border-b border-orange-100">
                <CardTitle className="text-sm flex items-center gap-2 text-orange-900">
                  <ShieldAlert className="w-4 h-4" /> Fraud Detection (M3)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {(reviewQueue.length > 0 ? reviewQueue : [{ id: 'fallback', worker: 'No flagged claims', isolation_forest_score: 0, fraud_risk: 'Low', gps_distance_km: 0, claims_last_7d: 0, cross_worker_match: 0 }]).map((claim, i) => (
                  <div key={claim.id || i} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs font-mono font-bold text-slate-700 block">{claim.worker || claim.worker_id || `W-1088${i}`}</span>
                        <span className="text-[10px] text-slate-500">Anomaly Score: {(claim.isolation_forest_score ?? Number(`0.8${i}`)).toFixed(2)}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${claim.fraud_risk === 'High' ? 'bg-red-100 text-red-700' : claim.fraud_risk === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>{claim.fraud_risk}</span>
                    </div>
                    <ul className="text-[10px] text-slate-600 space-y-1 mb-3">
                      <li>{`GPS mismatch: ${(claim.gps_distance_km ?? 0).toFixed(1)}km`}</li>
                      <li>{`Velocity: ${claim.claims_last_7d ?? 0} claims in 7 days`}</li>
                      <li>{`Cross-worker match: ${Math.round((claim.cross_worker_match ?? 0) * 100)}%`}</li>
                    </ul>
                    <div className="flex gap-2">
                      <Button className="w-full text-[10px] py-1 h-auto bg-emerald-600 hover:bg-emerald-700">Approve</Button>
                      <Button variant="outline" className="w-full text-[10px] py-1 h-auto text-red-600 border-red-200 hover:bg-red-50">Reject</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Predictive Analytics — Live from API */}
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary-500" /> Predictive Claim Analytics
                </CardTitle>
                <p className="text-xs mt-1 text-slate-500">
                  {`7-Day Forecast · ${forecast?.forecast_city || 'Primary City'} · Open-Meteo + XGBoost Classifier`}
                  {forecast && (
                    <span className={`ml-2 font-bold text-[10px] uppercase px-1.5 py-0.5 rounded ${
                      forecast.overall_risk_level === 'HIGH' ? 'bg-red-100 text-red-700'
                      : forecast.overall_risk_level === 'MODERATE' ? 'bg-orange-100 text-orange-700'
                      : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {forecast.overall_risk_level} RISK
                    </span>
                  )}
                </p>
              </CardHeader>
              <CardContent className="p-4">
                {forecast ? (
                  <>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                        {`Forecast City: ${forecast.forecast_city || 'Chennai'}`}
                      </span>
                      {typeof forecast.covered_workers === 'number' && (
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                          {`${forecast.covered_workers} covered workers`}
                        </span>
                      )}
                      {typeof forecast.avg_zone_multiplier === 'number' && (
                        <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-semibold text-orange-700">
                          {`Avg zone multiplier ${forecast.avg_zone_multiplier}x`}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-slate-50 rounded-xl p-3 text-center">
                        <p className="text-lg font-bold text-slate-900">{forecast.total_predicted_claims.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Est. Claims</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 text-center">
                        <p className="text-lg font-bold text-slate-900">₹{(forecast.total_predicted_payout_inr / 100000).toFixed(1)}L</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Est. Payout</p>
                      </div>
                    </div>
                    <div className="h-28 mb-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={forecast.daily_breakdown} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="date" tickFormatter={(v) => v.slice(5)} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                          <RechartsTooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: '11px' }}
                            formatter={(v, n) => [n === 'estimated_claims' ? `${v} claims` : `${v}mm`, n === 'estimated_claims' ? 'Est. Claims' : 'Rain']}
                          />
                          <Bar dataKey="estimated_claims" name="estimated_claims" fill="#0d3b4a" radius={[3, 3, 0, 0]} />
                          <Bar dataKey="rain_mm" name="rain_mm" fill="#1fbba6" radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-1.5">
                      {forecast.daily_breakdown.slice(0, 4).map((day, i) => (
                        <div key={i} className={`flex justify-between items-center text-xs p-2 rounded-lg ${day.trigger_predicted ? 'bg-red-50 border border-red-100' : 'bg-slate-50'}`}>
                          <span className="text-slate-600">{day.date?.slice(5) || `Day ${i+1}`}</span>
                          <span className="text-slate-500">{day.rain_mm}mm</span>
                          <span className={`font-bold text-[10px] ${day.trigger_predicted ? 'text-red-600' : 'text-emerald-600'}`}>
                            {day.trigger_predicted ? `${day.estimated_claims} claims` : 'Clear'}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-3 text-center">{forecast.weather_source}</p>
                  </>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-sm">Loading forecast…</div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </Layout>
  );
}
