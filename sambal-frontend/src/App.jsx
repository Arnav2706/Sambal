import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

import Home from './pages/Home'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Claims from './pages/Claims'
import Admin from './pages/Admin'
import SambalAI from './pages/SambalAI'
import Plans from './pages/Plans'
import HowItWorks from './pages/HowItWorks'

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/claims/form" element={<Claims />} />
        <Route path="/claims" element={<Claims />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/sambal-ai" element={<SambalAI />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  )
}

export default App
