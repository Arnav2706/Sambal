import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, AlertTriangle, Play, Loader2, Sparkles,
  CloudRain, Thermometer, Wind, MapPin, CheckCircle, XCircle,
  RefreshCw, Wifi, WifiOff, ChevronDown, Search
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const PERSONAS  = ["food_delivery", "grocery", "ride_hailing", "logistics"];
const PLATFORMS = ["Swiggy", "Zomato", "Blinkit", "Rapido", "Uber", "Porter"];

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Search cities using Open-Meteo Geocoding API
async function geocodeCity(query) {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`
  );
  const data = await res.json();
  return (data.results || []).map(r => ({
    name: r.name,
    country: r.country,
    admin1: r.admin1, // state/province
    lat: r.latitude,
    lon: r.longitude,
  }));
}

// Reverse geocode GPS coords to city name using Nominatim
async function reverseGeocode(lat, lon) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
    { headers: { 'Accept-Language': 'en' } }
  );
  const data = await res.json();
  const addr = data.address || {};
  // Use city > town > village > county fallback
  const cityName = addr.city || addr.town || addr.village || addr.county || addr.state_district || addr.state || 'Unknown';
  return { cityName, lat: parseFloat(data.lat), lon: parseFloat(data.lon) };
}

export default function SambalAI() {
  const [loading, setLoading]         = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [result, setResult]           = useState(null);
  const [liveWeather, setLiveWeather] = useState(null);
  const [weatherError, setWeatherError] = useState(false);
  const [gpsStatus, setGpsStatus]     = useState('idle'); // idle, locating, verified, out_of_zone, denied
  const [gpsCity, setGpsCity]         = useState(null); // the city auto-detected from GPS
  const [liveTime, setLiveTime]       = useState(new Date());
  const [citySearch, setCitySearch]   = useState('');
  const [cityDropOpen, setCityDropOpen] = useState(false);
  const [cityResults, setCityResults] = useState([]);   // geocoded search results
  const [citySearching, setCitySearching] = useState(false);
  const [gpsCoords, setGpsCoords]     = useState(null); // {lat, lon} of user's GPS
  const [selectedCityCoords, setSelectedCityCoords] = useState(null); // {lat, lon} of chosen city
  const cityDropRef = useRef(null);
  const searchTimerRef = useRef(null);

  const [formData, setFormData] = useState({
    city:            'Mumbai',
    platform:        'Swiggy',
    persona:         'food_delivery',
    strike_severity: 0.0,
    zone_match:      true,
    test_mode:       false,
    manual_rain:     0,
    manual_heat:     30,
  });

  const update = (key, val) => setFormData(p => ({ ...p, [key]: val }));

  // Debounced geocoding search when user types in city dropdown
  useEffect(() => {
    if (!citySearch.trim() || citySearch.length < 2) {
      setCityResults([]);
      return;
    }
    clearTimeout(searchTimerRef.current);
    setCitySearching(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const results = await geocodeCity(citySearch);
        setCityResults(results);
      } catch {
        setCityResults([]);
      } finally {
        setCitySearching(false);
      }
    }, 400); // 400ms debounce
    return () => clearTimeout(searchTimerRef.current);
  }, [citySearch]);

  // Close city dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (cityDropRef.current && !cityDropRef.current.contains(e.target)) {
        setCityDropOpen(false);
        setCitySearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Live clock — ticks every second
  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch live weather whenever city changes
  useEffect(() => {
    fetchWeather(formData.city);
  }, [formData.city]);

  // Handle GPS location tracking + auto city detection (reverse geocoding)
  useEffect(() => {
    if (formData.test_mode) {
      setGpsStatus('idle');
      setGpsCity(null);
      setGpsCoords(null);
      return;
    }

    setGpsStatus('locating');
    if (!navigator.geolocation) {
      setGpsStatus('denied');
      update('zone_match', false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setGpsCoords({ lat: latitude, lon: longitude });

        try {
          // Reverse geocode to get real city name
          const { cityName } = await reverseGeocode(latitude, longitude);
          setGpsCity(cityName);
          // Auto-set city name and coords = GPS location itself (distance = 0)
          update('city', cityName);
          setSelectedCityCoords({ lat: latitude, lon: longitude });
          setGpsStatus('verified');
          update('zone_match', true);
        } catch {
          setGpsStatus('denied');
          setGpsCity(null);
          update('zone_match', false);
        }
      },
      (err) => {
        console.warn('GPS Error', err);
        setGpsStatus('denied');
        setGpsCity(null);
        setGpsCoords(null);
        update('zone_match', false);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }, [formData.test_mode]);

  // When user manually selects a city, re-evaluate zone_match against GPS coords
  useEffect(() => {
    if (formData.test_mode || gpsStatus === 'idle' || gpsStatus === 'locating' || gpsStatus === 'denied') return;
    if (!gpsCoords || !selectedCityCoords) return;
    const dist = getDistanceKm(gpsCoords.lat, gpsCoords.lon, selectedCityCoords.lat, selectedCityCoords.lon);
    if (dist <= 80) {
      setGpsStatus('verified');
      update('zone_match', true);
    } else {
      setGpsStatus('out_of_zone');
      update('zone_match', false);
    }
  }, [selectedCityCoords]);

  const fetchWeather = async (city) => {
    setWeatherLoading(true);
    setWeatherError(false);
    setLiveWeather(null);
    try {
      const url = new URL(`http://127.0.0.1:8000/api/weather/${city}`);
      if (gpsCoords && !formData.test_mode) {
        url.searchParams.append('lat', gpsCoords.lat);
        url.searchParams.append('lon', gpsCoords.lon);
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLiveWeather(data);
    } catch {
      setWeatherError(true);
    } finally {
      setWeatherLoading(false);
    }
  };

  const runAnalysis = async () => {
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        ...formData,
        strike_severity: Number(formData.strike_severity),
        manual_rain:     formData.test_mode ? Number(formData.manual_rain) : null,
        manual_heat:     formData.test_mode ? Number(formData.manual_heat) : null,
      };

      // Add GPS coords for precision if available and not in manual test mode
      if (gpsCoords && !formData.test_mode) {
        payload.lat = gpsCoords.lat;
        payload.lon = gpsCoords.lon;
      }

      const response = await fetch('http://127.0.0.1:8000/api/live-analysis', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.detail || `Server Error: ${response.status}`);
      }

      const data = await response.json();
      setTimeout(() => { setResult(data); setLoading(false); }, 1000);
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert(`Backend Error: ${err.message}\n\nCheck if the backend terminal shows any Python errors.`);
    }
  };

  const rainLevel = liveWeather
    ? liveWeather.rain_mm > 50 ? 'heavy' : liveWeather.rain_mm > 10 ? 'moderate' : liveWeather.rain_mm > 0 ? 'light' : 'none'
    : null;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-12 pt-16">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold tracking-wider uppercase mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SAMBAL AI v3.0 — Intelligent Income Protection</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">SAMBAL AI Engine</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Real-time weather is automatically fetched from Open-Meteo. Select your city and let the AI do the rest.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left: Inputs */}
          <div className="space-y-4">

            {/* Live Weather Card */}
            <Card className="border-slate-200 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {weatherLoading
                    ? <Loader2 className="w-4 h-4 text-white animate-spin"/>
                    : weatherError ? <WifiOff className="w-4 h-4 text-white/60"/> : <Wifi className="w-4 h-4 text-white"/>
                  }
                  <span className="text-white text-xs font-bold uppercase tracking-wider">
                    {weatherLoading ? 'Fetching Live Weather...' : weatherError ? 'Weather Unavailable' : `Live: ${formData.city}`}
                  </span>
                </div>
                <button onClick={() => fetchWeather(formData.city)}
                  className="text-white/70 hover:text-white transition">
                  <RefreshCw className="w-3.5 h-3.5"/>
                </button>
              </div>

              {liveWeather && (
                <div className="p-4 grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <CloudRain className={`w-5 h-5 mx-auto mb-1 ${
                      rainLevel === 'heavy' ? 'text-blue-600' :
                      rainLevel === 'moderate' ? 'text-blue-400' :
                      rainLevel === 'light' ? 'text-sky-400' : 'text-slate-300'
                    }`}/>
                    <p className="text-xl font-black text-slate-800">{liveWeather.rain_mm}</p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase">mm Rain</p>
                  </div>
                  <div className="text-center border-x border-slate-100">
                    <Thermometer className={`w-5 h-5 mx-auto mb-1 ${liveWeather.heat_index_c > 40 ? 'text-red-500' : 'text-orange-400'}`}/>
                    <p className="text-xl font-black text-slate-800">{liveWeather.heat_index_c}°</p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase">Heat Index</p>
                  </div>
                  <div className="text-center">
                    <Wind className="w-5 h-5 mx-auto mb-1 text-slate-400"/>
                    <p className="text-xl font-black text-slate-800 tabular-nums">
                      {liveTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase">Current IST</p>
                  </div>
                  <div className="col-span-3 text-[10px] text-slate-400 text-center pt-1 border-t border-slate-100">
                    Source: {liveWeather.source} · {liveWeather.fetched_at}
                  </div>
                </div>
              )}

              {weatherError && (
                <div className="p-4 text-center text-slate-400 text-sm">
                  Could not fetch weather. Check your internet connection.
                </div>
              )}
              {weatherLoading && !liveWeather && (
                <div className="p-4 text-center text-slate-400 text-sm">Loading...</div>
              )}
            </Card>

              {/* Simulation Mode Toggle Card */}
              <div className="mb-4 rounded-2xl border-2 border-dashed border-primary-100 bg-primary-50/30 p-4 transition-all hover:bg-primary-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${formData.test_mode ? 'bg-primary-900 text-white' : 'bg-white text-primary-900 border border-primary-100'}`}>
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Simulation Mode</p>
                      <p className="text-[10px] text-slate-500 font-medium">Bypass live data to test scenarios</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={formData.test_mode}
                    onClick={() => update('test_mode', !formData.test_mode)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.test_mode ? 'bg-primary-900' : 'bg-slate-200'}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out ${formData.test_mode ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                  </button>
                </div>
              </div>

            {/* Config Card */}
            <Card className="border-slate-200">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary-900"/>
                <h3 className="font-bold text-slate-800">{formData.test_mode ? 'Simulation Controls' : 'Worker Context'}</h3>
              </div>
              <CardContent className="p-5 space-y-6">

                {formData.test_mode && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Manual Rain */}
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                      <label className="flex justify-between items-center text-xs font-bold text-blue-700 uppercase tracking-widest mb-3">
                        <span className="flex items-center gap-1.5"><CloudRain className="w-4 h-4"/> Simulated Rain</span>
                        <span className="bg-blue-600 text-white px-2 py-0.5 rounded tabular-nums">{formData.manual_rain}mm</span>
                      </label>
                      <input type="range" min="0" max="160" step="1" className="w-full accent-blue-600"
                        value={formData.manual_rain} onChange={e => update('manual_rain', e.target.value)}/>
                      <div className="flex justify-between text-[9px] text-blue-400 font-bold mt-1 uppercase tracking-tighter">
                        <span>Dry</span>
                        <span>Moderate</span>
                        <span>Monsoon</span>
                        <span>Flood Alert</span>
                      </div>
                    </div>

                    {/* Manual Heat */}
                    <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
                      <label className="flex justify-between items-center text-xs font-bold text-orange-700 uppercase tracking-widest mb-3">
                        <span className="flex items-center gap-1.5"><Thermometer className="w-4 h-4"/> Simulated Heat</span>
                        <span className="bg-orange-600 text-white px-2 py-0.5 rounded tabular-nums">{formData.manual_heat}°C</span>
                      </label>
                      <input type="range" min="20" max="52" step="0.5" className="w-full accent-orange-600"
                        value={formData.manual_heat} onChange={e => update('manual_heat', e.target.value)}/>
                      <div className="flex justify-between text-[9px] text-orange-400 font-bold mt-1 uppercase tracking-tighter">
                        <span>Cool</span>
                        <span>Warm</span>
                        <span>Heatwave</span>
                        <span>Critical</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* City + Platform */}
                <div className="grid grid-cols-2 gap-3">
                  {/* City searchable dropdown */}
                  <div ref={cityDropRef} className="relative">
                    <label className="flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      <span>City</span>
                      {!formData.test_mode && gpsStatus === 'locating' && (
                        <span className="text-[9px] text-slate-400 font-normal normal-case flex items-center gap-1">
                          <Loader2 className="w-2.5 h-2.5 animate-spin"/> Auto-detecting
                        </span>
                      )}
                      {!formData.test_mode && gpsStatus === 'verified' && (
                        <span className="text-[9px] text-emerald-600 font-semibold normal-case flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5"/> GPS Auto-set
                        </span>
                      )}
                    </label>
                    <button
                      type="button"
                      onClick={() => { setCityDropOpen(v => !v); setCitySearch(''); }}
                      className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg px-3 py-2.5 text-sm flex items-center justify-between hover:border-slate-300 focus:outline-none focus:border-primary-500"
                    >
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400"/>
                        {formData.city}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${cityDropOpen ? 'rotate-180' : ''}`}/>
                    </button>
                    <AnimatePresence>
                      {cityDropOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.15 }}
                          className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
                        >
                          <div className="p-2 border-b border-slate-100">
                            <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-2 py-1.5">
                              <Search className="w-3.5 h-3.5 text-slate-400"/>
                              <input
                                autoFocus
                                type="text"
                                className="flex-1 text-sm bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                                placeholder="Search city..."
                                value={citySearch}
                                onChange={e => setCitySearch(e.target.value)}
                              />
                            </div>
                          </div>
                          <ul className="max-h-48 overflow-y-auto py-1">
                            {citySearching && (
                              <li className="px-3 py-3 text-sm text-slate-400 text-center flex items-center justify-center gap-2">
                                <Loader2 className="w-3.5 h-3.5 animate-spin"/> Searching...
                              </li>
                            )}
                            {!citySearching && citySearch.length >= 2 && cityResults.length === 0 && (
                              <li className="px-3 py-3 text-sm text-slate-400 text-center">No cities found</li>
                            )}
                            {!citySearching && citySearch.length < 2 && (
                              <li className="px-3 py-3 text-sm text-slate-400 text-center">Type to search any city...</li>
                            )}
                            {!citySearching && cityResults.map((c, i) => (
                              <li key={i}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    update('city', c.name);
                                    setSelectedCityCoords({ lat: c.lat, lon: c.lon });
                                    setCityDropOpen(false);
                                    setCitySearch('');
                                    setCityResults([]);
                                  }}
                                  className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-slate-50 transition ${
                                    formData.city === c.name ? 'text-primary-900 font-semibold bg-primary-50' : 'text-slate-700'
                                  }`}
                                >
                                  <MapPin className="w-3 h-3 text-slate-300 shrink-0"/>
                                  <span className="flex-1 min-w-0">
                                    <span className="block font-medium truncate">{c.name}</span>
                                    <span className="block text-[10px] text-slate-400 truncate">{[c.admin1, c.country].filter(Boolean).join(', ')}</span>
                                  </span>
                                  {formData.city === c.name && <CheckCircle className="w-3 h-3 text-primary-900 ml-auto shrink-0"/>}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Platform</label>
                    <select className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg px-3 py-2.5 text-sm"
                      value={formData.platform} onChange={e => update('platform', e.target.value)}>
                      {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                {/* Persona */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Worker Persona</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PERSONAS.map(p => (
                      <button key={p} onClick={() => update('persona', p)}
                        className={`text-xs font-semibold py-2 px-3 rounded-lg border transition ${formData.persona === p ? 'bg-primary-900 text-white border-primary-900' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-900'}`}>
                        {p.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Strike Severity — only manual input needed */}
                <div>
                  <label className="flex justify-between items-center text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-red-500"/> Strike Severity</span>
                    <span className="text-red-600 tabular-nums text-xs">{(Number(formData.strike_severity)*10).toFixed(1)} / 10</span>
                  </label>
                  <input type="range" min="0" max="1" step="0.1" className="w-full accent-red-600"
                    value={formData.strike_severity} onChange={e => update('strike_severity', e.target.value)}/>
                  <p className="text-[10px] text-slate-400 mt-1">Manually set — no reliable free API for city strikes</p>
                </div>

                {/* Zone Match */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex flex-1 items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-500 shrink-0"/>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Worker in Disruption Zone</p>
                        <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                          {!formData.test_mode && gpsCity
                            ? `GPS detected: ${gpsCity} — verified only for your actual location`
                            : "Worker's GPS overlaps with the area affected by rain/strike"}
                        </p>
                      </div>
                    </div>
                    {/* Toggle / Status */}
                    {formData.test_mode ? (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={formData.zone_match}
                        onClick={() => update('zone_match', !formData.zone_match)}
                        className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData.zone_match ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out ${formData.zone_match ? 'translate-x-7' : 'translate-x-0'}`}
                        />
                      </button>
                    ) : (
                      <div className="text-right pl-2">
                        {gpsStatus === 'locating' && <span className="text-xs font-bold text-slate-500 flex items-center gap-1 justify-end"><Loader2 className="w-3 h-3 animate-spin"/> Locating...</span>}
                        {gpsStatus === 'verified' && <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 justify-end"><CheckCircle className="w-3 h-3"/> Verified</span>}
                        {gpsStatus === 'out_of_zone' && <span className="text-xs font-bold text-rose-600 flex items-center gap-1 justify-end"><XCircle className="w-3 h-3"/> Out of Zone</span>}
                        {gpsStatus === 'denied' && <span className="text-xs font-bold text-rose-600 flex items-center gap-1 justify-end"><AlertTriangle className="w-3 h-3"/> GPS Denied</span>}
                      </div>
                    )}
                  </div>
                  {/* Context messages */}
                  {!formData.test_mode && gpsStatus === 'out_of_zone' && gpsCity && formData.city !== gpsCity && (
                    <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 text-[10px] text-amber-700 font-medium">
                      ⚠ Your GPS is in <strong>{gpsCity}</strong> — select it to get zone verified
                    </div>
                  )}
                  {!formData.test_mode && gpsStatus === 'out_of_zone' && formData.city === gpsCity && (
                    <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 text-[10px] text-amber-700 font-medium">
                      ⚠ Zone mismatch — you are more than 80km from {gpsCity}
                    </div>
                  )}
                  {!formData.test_mode && gpsStatus === 'denied' && (
                    <div className="px-4 py-2 bg-rose-50 border-t border-rose-100 text-[10px] text-rose-700 font-medium">
                      ⚠ Location access denied — enable GPS permissions to verify zone
                    </div>
                  )}
                  {formData.test_mode && !formData.zone_match && (
                    <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 text-[10px] text-amber-700 font-medium">
                      ⚠ Zone mismatch — payout will be rejected regardless of weather severity
                    </div>
                  )}
                </div>

                <Button onClick={runAnalysis} disabled={loading || weatherLoading}
                  className="w-full py-6 text-base font-bold bg-primary-950 hover:bg-black shadow-lg">
                  {loading
                    ? <><Loader2 className="w-5 h-5 mr-3 animate-spin"/> AI Analyzing...</>
                    : <><Play className="w-5 h-5 mr-2"/> Run Live AI Analysis</>}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right: Terminal Results */}
          <div className="flex flex-col">
            <Card className="flex-1 bg-gradient-to-br from-[#0B1528] to-[#040C1A] text-white border-none shadow-2xl relative overflow-hidden" style={{minHeight: '580px'}}>
              <div className="absolute top-0 left-0 right-0 h-10 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400/80"/>
                <div className="w-3 h-3 rounded-full bg-yellow-400/80"/>
                <div className="w-3 h-3 rounded-full bg-emerald-400/80"/>
                <span className="ml-4 text-[10px] font-mono text-slate-400 opacity-60">sambal-ai — Live Weather Mode</span>
              </div>

              <div className="pt-14 p-8 h-full flex flex-col justify-center">
                {!loading && !result && (
                  <div className="text-center opacity-40 py-20">
                    <Sparkles className="w-12 h-12 mx-auto mb-4"/>
                    <p className="font-mono text-sm">READY — WEATHER LOADED</p>
                    <p className="font-mono text-xs mt-2 opacity-60">Configure worker context and run analysis</p>
                  </div>
                )}

                {loading && (
                  <div className="font-mono space-y-3 text-sm opacity-80 py-10">
                    <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.3}}>&gt; Fetching live satellite weather feed...</motion.p>
                    <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.6}}>&gt; Verifying disruption signals via SAMBAL Intelligence...</motion.p>
                    <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.9}} className="text-accent-400">&gt; Finalizing payout components...</motion.p>
                  </div>
                )}

                <AnimatePresence>
                  {result && !loading && (
                    <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="space-y-5">

                      {/* Verdict */}
                      <div className="flex items-center gap-3">
                        {result.trigger_valid
                          ? <CheckCircle className="w-8 h-8 text-emerald-400 shrink-0"/>
                          : <XCircle    className="w-8 h-8 text-rose-400 shrink-0"/>}
                        <div>
                          <p className="text-[10px] font-mono text-slate-400">{result.model_version}</p>
                          <h2 className={`text-xl font-black ${result.trigger_valid ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {result.trigger_valid ? 'DISRUPTION VERIFIED' : 'NORMAL CONDITIONS'}
                          </h2>
                        </div>
                      </div>

                      {/* Live weather used */}
                      <div className="grid grid-cols-3 gap-2 bg-white/5 border border-white/10 rounded-xl p-3">
                        <div className="text-center">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Rain Used</p>
                          <p className="text-lg font-black text-blue-400">{result.live_rain_mm}mm</p>
                        </div>
                        <div className="text-center border-x border-white/10">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Heat Index</p>
                          <p className="text-lg font-black text-orange-400">{result.live_heat_index_c}°C</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Time</p>
                          <p className="text-lg font-black text-white">{result.hour_of_day.toString().padStart(2,'0')}:00</p>
                        </div>
                      </div>

                      {/* Payout */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Estimated Payout</p>
                        <p className={`text-3xl font-black ${result.estimated_payout_inr > 0 ? 'text-accent-400' : 'text-slate-500'}`}>
                          {result.estimated_payout_inr > 0 ? `₹${result.estimated_payout_inr}` : '₹0'}
                        </p>
                      </div>

                      {/* Risk factors */}
                      <ul className="space-y-2">
                        {result.risk_factors.map((f, i) => (
                          <li key={i} className="flex gap-2 items-start text-sm font-medium text-slate-200">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5"/> {f}
                          </li>
                        ))}
                      </ul>

                      {/* Reasoning */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">AI Reasoning</p>
                        <p className="text-sm text-slate-300 leading-relaxed italic">{result.ai_reasoning}</p>
                      </div>

                      {/* Source */}
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
                        <p className="text-[10px] font-mono text-slate-500">
                          ✦ {result.weather_source} · Fetched at {result.weather_fetched_at}
                        </p>
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </Layout>
  );
}
