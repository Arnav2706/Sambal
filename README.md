# 🌧️ Sambal
### AI-Powered Parametric Income Insurance for India's Gig Delivery Workers

*Sambhalna (संभालना) — to sustain, to hold up*

![Phase](https://img.shields.io/badge/DEVTrails_2026-Phase_1-black?style=for-the-badge)
![Coverage](https://img.shields.io/badge/Coverage-Loss_of_Income_Only-red?style=for-the-badge)
![Pricing](https://img.shields.io/badge/Pricing-Weekly_Model-orange?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-React_%2B_FastAPI_%2B_ML-blue?style=for-the-badge)

**Guidewire DEVTrails 2026 · Phase 1 Submission · The Zenithers · SRMIST Chennai**

---

## 📌 Table of Contents

- [The Problem](#the-problem)
- [Persona Focus](#persona-focus)
- [Real-World Scenarios](#real-world-scenarios)
- [Application Workflow](#application-workflow)
- [Weekly Premium Model](#weekly-premium-model)
- [Parametric Triggers](#parametric-triggers)
- [AI / ML Integration](#ai-ml-integration)
- [Tech Stack](#tech-stack)
- [Platform Choice: PWA](#platform-choice-pwa)
- [Development Plan](#development-plan)
- [Repository Structure](#repository-structure)
- [Team](#team)
- [Adversarial Defense & Anti-Spoofing Strategy](#adversarial-defense--anti-spoofing-strategy)
- [Business Viability](#business-viability)

---

## 🔴 The Problem

India has over **12 million platform-based delivery partners** working for Zomato, Swiggy, Amazon, and Flipkart. These workers earn ₹600–₹1,200 per day — entirely dependent on uninterrupted work hours. External events they cannot control can wipe out an entire week of earnings in hours.

| Metric | Reality |
|---|---|
| Gig delivery workers in India | 12 million+ |
| Monthly income lost to disruptions | 20 – 30% |
| Existing income protection available | **₹0** |

> **There is no safety net.** No insurance product covers the event of *simply being unable to work because the city shut down.* Health and accident schemes exist. Income protection from uncontrollable external events does not.

**Sambal** is an AI-enabled parametric income insurance platform that monitors external disruptions in real time, automatically validates income loss, and transfers compensation to a worker's UPI — without the worker filing a single form.

> ⚠️ **Coverage scope:** Sambal insures **lost income only.** Vehicle repairs, health, accidents, and medical bills are explicitly excluded per the problem statement constraints.

---

## 👥 Persona Focus

Sambal covers two delivery sub-categories on a single platform, with **separate risk models, trigger weights, and premium calculations** for each — because their exposure patterns differ structurally.

| | **Food Delivery Partners** | **E-commerce Delivery Partners** |
|---|---|---|
| **Platforms** | Zomato, Swiggy | Amazon, Flipkart |
| **Peak hours** | 12–2 PM, 7–10 PM | 9 AM – 6 PM |
| **Primary risk** | Rain, extreme heat, AQI spikes during peak windows | Route closures, curfews, bandhs, flood alerts |
| **Income exposure** | A rainstorm at 8 PM wipes out the highest-earning hour of the day | Warehouse access and road availability determine the entire workday |

---

## 🧑‍💼 Real-World Scenarios

### Scenario A — Food Delivery Partner, Chennai

> **Karthik Selvam, 31** · Swiggy · Velachery–Guindy corridor · ₹750/day average · 2 years on platform · sends money home to Tirunelveli fortnightly

**18 October 2024.** Cyclone Dana's outer bands bring 78mm of rainfall to Chennai within 3 hours. The Greater Chennai Corporation issues a Red Alert at 5:45 PM. Swiggy suspends deliveries citywide at 6:30 PM — right as the dinner rush peaks. Karthik had been online since noon and was counting on the next 3 hours for the bulk of his day's earnings.

**❌ Without Sambal:** Karthik loses ₹750 with no recourse. He still owes ₹180 in daily fuel costs and a ₹400 room rent instalment. He borrows from a co-worker.

**✅ With Sambal:** At 6:45 PM, the trigger engine detects the rainfall breach (>40mm/3hr) via OpenWeatherMap. GPS confirms Karthik is in the affected zone. Platform feed shows zero orders since 5:30 PM despite him being online. Fraud check passes. Claim auto-approved in **4 minutes**. ₹600 credited to his PhonePe UPI at **6:51 PM.**

> 📋 **Weekly Sambal premium: ₹38** — Standard tier, Zone 3 (Chennai coastal, moderate flood risk)

---

### Scenario B — E-commerce Delivery Partner, Hyderabad

> **Mohammed Saleem, 27** · Amazon · Old City–Malakpet, Hyderabad · ₹920/day average · 3 years on platform · sole earner, family of four

**12 February 2025.** A spontaneous bandh is called in Chandrayangutta over a demolition dispute. By 8:45 AM, Old City is blocked — autos, shops, and feeder warehouses are shuttered. Amazon generates zero delivery assignments for Saleem's pincode cluster. He is logged in and available but receives no work until 3 PM — losing 6 hours of prime delivery time.

**❌ Without Sambal:** Saleem loses ~₹600. Amazon does not compensate. There is no form to fill, no number to call. The loss is silent and total.

**✅ With Sambal:** At 9:15 AM, the social signal monitor picks up the bandh advisory. Platform mock confirms zero assignments to Saleem's zone. GPS: in zone, app: online. 34 other partners show identical inactivity — event is corroborated. Fraud check: clean. Claim auto-approved. ₹480 credited to Paytm UPI by **9:28 AM.**

> 📋 **Weekly Sambal premium: ₹44** — Standard tier, Zone 4 (Old City, elevated civil disruption history)

---

## ⚙️ Application Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                        WORKER ONBOARDING                        │
│  Sign up → Link Platform ID → Set Home Zone → Upload 3-month   │
│  earnings history → AI Risk Assessment → Policy Quote Issued    │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    WEEKLY POLICY ACTIVE                         │
│  Auto-renews every Monday via UPI micro-debit                   │
│  Worker sees: coverage status, weekly premium, payout history   │
└──────────────────────────────┬──────────────────────────────────┘
                               │
               ┌───────────────▼───────────────┐
               │   REAL-TIME TRIGGER MONITOR   │
               │  Weather API + Social Signals  │
               │  Polled every 15 minutes       │
               └───────────────┬───────────────┘
                               │ Threshold breached
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DUAL VALIDATION ENGINE                       │
│  ① External signal confirmed (weather / curfew / strike)        │
│  ② Worker GPS in zone + platform earnings drop > 70%            │
│  Both must pass — one signal alone never triggers a claim       │
└──────────────────────────────┬──────────────────────────────────┘
                               │ Both validated
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FRAUD DETECTION                             │
│  Isolation Forest anomaly check → GPS geofencing →              │
│  Duplicate claim guard → Cross-worker pattern analysis          │
│  → Risk scored:  Low / Medium → Auto-approve                    │
│                  High         → Manual review queue             │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PAYOUT PROCESSING                            │
│  Proportional payout = Daily avg × Payout rate × Hours lost     │
│  UPI transfer initiated → WhatsApp + in-app notification sent   │
│  Dashboard updated: "Earnings Protected ₹XXX ✓"                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💰 Weekly Premium Model

All premiums are structured on a **weekly basis** — matching the gig worker's typical earnings and settlement cycle. Policies auto-renew each Monday.

### Formula

```
Weekly Premium (₹) =
    Base Rate (by persona)
  × Zone Risk Multiplier
  × Seasonal Risk Factor
  × Coverage Tier Multiplier
  × (1 − Loyalty Discount)
```

### Coverage Tiers

| Tier | Weekly Premium | Coverage Cap | Payout Rate |
|---|---|---|---|
| 🔘 **Basic** | ₹22 – ₹32 | ₹2,500 / week | 65% of daily avg earnings |
| 🟠 **Standard** | ₹35 – ₹50 | ₹4,500 / week | 80% of daily avg earnings |
| 🔴 **Premium** | ₹55 – ₹75 | ₹7,000 / week | 92% of daily avg earnings |

### Dynamic Factors

| Factor | Values |
|---|---|
| **Base rate** | Food delivery: ₹18/week · E-commerce: ₹16/week |
| **Zone 1** (low risk — Pune suburbs, Bengaluru north) | ×0.85 |
| **Zone 2** (moderate — Delhi NCR outskirts, Hyderabad east) | ×1.00 |
| **Zone 3** (elevated — Chennai coastal, Mumbai eastern suburbs) | ×1.20 |
| **Zone 4** (high — Dharavi, Patna, Kolkata flood zones) | ×1.45 |
| **Monsoon** (June – September) | ×1.18 |
| **Summer peak** (April – May) | ×1.10 |
| **Off-season** (winter) | ×0.95 |
| **Loyalty (4+ consecutive weeks)** | −5% |
| **Loyalty (12+ consecutive weeks)** | −10% |
| **No claims in last 8 weeks** | −3% additional |

### Payout Calculation

```
Payout = Daily Avg Earnings (90-day rolling)
       × Payout Rate
       × (Hours Lost ÷ Avg Working Hours)
```

> Proportional, not binary. Losing 4 of 8 hours earns 50% of the daily payout — fairer and significantly more fraud-resistant than all-or-nothing flat-day claims.

Each week, the ML pricer ingests the 7-day forecast and adjusts the coming week's premium by ±15%, communicated to the worker **3 days before renewal** with a plain-language explanation.

---

## ⚡ Parametric Triggers

> **Dual validation is mandatory.** Every trigger requires both ① the external signal AND ② corroborating platform inactivity from the worker in that zone. Neither alone is sufficient.

| ID | Category | Event | Threshold | Personas |
|---|---|---|---|---|
| T1 | 🌧️ Environmental | Heavy rainfall | >35mm / 2 hours in worker's zone | Both |
| T2 | 🌡️ Environmental | Extreme heat | >44°C sustained 3+ hours | Food delivery (peak hours only) |
| T3 | 😷 Environmental | Severe AQI | >300 on CPCB scale (Severe) | Both |
| T4 | 🌊 Environmental | Flood / cyclone alert | IMD Red Alert in worker's district | Both |
| T5 | 🚨 Social | Curfew / Section 144 | Verified government advisory in zone | Both |
| T6 | ✊ Social | Strike / bandh | Regional signal + platform orders drop >75% | Both |

**Persona-specific weighting:**
- For food delivery partners, T1 and T2 are weighted more heavily during peak windows (12–2 PM, 7–10 PM). The same rainstorm at 3 AM has near-zero income impact; at 8 PM it destroys the highest-earning hour.
- For e-commerce partners, T5 and T6 carry higher weight since warehouse access and daytime route availability determine the entire working day.

---

## 🤖 AI / ML Integration

### Module 1 — Risk Profiler *(at onboarding)*

| | |
|---|---|
| **Model** | XGBoost Classifier |
| **Input features** | City tier, delivery zone, persona type, avg daily earnings, weekly working hours, month of onboarding |
| **Output** | Risk score 0–100 → mapped to Zone 1–4 → sets Zone Risk Multiplier |

### Module 2 — Dynamic Weekly Pricer

| | |
|---|---|
| **Model** | Gradient Boosting Regressor (retrained weekly) |
| **Input features** | 7-day rainfall + temperature + AQI forecast, civic event calendar, zone-level claim history, worker's quarterly claim count |
| **Output** | Premium adjustment factor ±15%, communicated 3 days before weekly renewal |

### Module 3 — Fraud Detection Engine

| | |
|---|---|
| **Model** | Isolation Forest (unsupervised anomaly detection) + Rule-based guard layer |
| **Signals checked** | GPS geofencing (Haversine), platform app login status, earnings drop >70% vs prior 4-week average, duplicate claim detection, velocity check (>2 claims/7 days → manual review), cross-worker pattern analysis |
| **Output** | Low / Medium → auto-approve · High → admin review queue |

### Module 4 — Parametric Trigger Classifier

| | |
|---|---|
| **Model** | Rule engine + ML confidence scoring layer |
| **Logic** | Signal ingested → threshold check → persona filter (peak-hour weighting) → geographic zone overlap check → output: Valid Trigger (True/False) + confidence score |
| **Key behaviour** | A rainfall event at 4 AM in a food delivery zone does not trigger a claim — no income was being generated at that hour |

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 18 + Vite | Core framework, fast builds, PWA support |
| TailwindCSS + shadcn/ui | Consistent, accessible component system |
| Recharts | Earnings and analytics charts |
| Zustand | Lightweight global state management |
| Vite PWA Plugin | Offline capability, home screen install |

### Backend

| Technology | Purpose |
|---|---|
| FastAPI (Python 3.11) | Async API, auto-generated docs, ML-friendly |
| Celery + Redis | Async trigger monitoring every 15 minutes |
| PostgreSQL | Relational DB for policies, claims, payouts |
| Redis | Response caching + claim deduplication locks |
| JWT + bcrypt | Stateless authentication |

### AI / ML

| Technology | Module |
|---|---|
| XGBoost | Risk profiler |
| scikit-learn Gradient Boosting | Dynamic weekly pricer |
| scikit-learn Isolation Forest | Fraud detection |
| Custom rule engine + scikit-learn | Trigger classifier |
| Pandas, NumPy | Data processing pipelines |

### External Integrations

| Integration | Provider | Mode |
|---|---|---|
| Weather data | OpenWeatherMap API (free tier) | Live |
| Flood / cyclone alerts | IMD public RSS feeds | Live |
| Social disruptions | Custom mock API (JSON) | Simulated |
| Platform earnings feed | Swiggy / Amazon partner API | Simulated mock |
| Payments | Razorpay test mode + UPI sandbox | Simulated |

### Infrastructure

| Component | Tool |
|---|---|
| Containerisation | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Backend deployment | Render (free tier) |
| Frontend deployment | Vercel |

---

## 📱 Platform Choice: PWA

**We chose a Progressive Web App over native mobile for three reasons grounded in who our users actually are:**

**1. Device reality of Indian delivery workers**
The majority of Zomato, Swiggy, and Amazon partners use entry-level Android devices (Redmi, Realme, Samsung M-series) with limited storage — mostly occupied by the delivery platform apps themselves. They will not install a dedicated insurance app. A PWA is delivered via WhatsApp link, installs to the home screen in one tap, and uses under 5MB.

**2. Distribution through existing trust channels**
No app store listing needed. A single WhatsApp message from a platform partner sends workers directly to the PWA. Zero acquisition friction, no Play Store review cycles. This is exactly how KreditBee and Slice scaled among gig workers.

**3. One codebase for worker + admin**
The admin dashboard — claim review, loss ratio monitoring, zone disruption maps — cannot reasonably live on mobile. A PWA delivers a mobile-optimised worker experience and a full desktop admin panel from the same React codebase, with no second app to maintain.

---

## 📅 Development Plan

### Phase 1 — Ideation & Foundation `Mar 4 – 20` ← *Current*

- [x] Problem research and persona definition
- [x] Weekly premium model designed and documented
- [x] Parametric trigger set defined with dual-validation logic
- [x] AI/ML module architecture planned
- [x] Tech stack and platform decision finalised
- [x] System architecture mapped
- [ ] Repository scaffolded (React + FastAPI skeleton committed)
- [ ] 2-minute strategy video recorded and uploaded

### Phase 2 — Automation & Protection `Mar 21 – Apr 4`

- [ ] Worker registration and onboarding flow (UI + API)
- [ ] Risk profiling ML model v1 integrated at onboarding
- [ ] Policy creation with live weekly premium calculation
- [ ] 4–5 parametric triggers wired to mock APIs (Celery jobs)
- [ ] Claims management — worker view + admin review queue
- [ ] Rule-based fraud detection v1
- [ ] Week-ahead dynamic premium adjustment logic

### Phase 3 — Scale & Optimise `Apr 5 – 17`

- [ ] Isolation Forest fraud detection model integrated
- [ ] Razorpay test mode payout simulation
- [ ] Worker dashboard: earnings protected, coverage status, payout history
- [ ] Admin dashboard: loss ratios, zone heatmap, predictive claim analytics
- [ ] End-to-end simulated disruption demo (trigger → claim → payout)
- [ ] 5-minute walkthrough video uploaded
- [ ] Final pitch deck (PDF)

---

## 📁 Repository Structure

```
sambal/
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── worker/          # Onboarding, Dashboard, Policy, Claims
│       │   └── admin/           # Analytics, Claim Review, Zone Map
│       ├── components/          # Shared UI components
│       ├── store/               # Zustand global state
│       └── hooks/               # API + data hooks
├── backend/
│   └── app/
│       ├── api/
│       │   ├── onboarding.py
│       │   ├── policy.py
│       │   ├── claims.py
│       │   └── payouts.py
│       ├── services/            # Business logic layer
│       ├── models/              # SQLAlchemy DB models
│       └── ml/
│           ├── risk_profiler.py       # XGBoost onboarding model
│           ├── dynamic_pricer.py      # Weekly premium adjustment
│           ├── fraud_detector.py      # Isolation Forest
│           └── trigger_classifier.py
├── workers/
│   └── trigger_monitor.py       # Celery: polls APIs every 15 min
├── data/
│   └── mock/
│       ├── weather_feed.json
│       ├── social_signals.json
│       └── platform_earnings.json
├── docker-compose.yml
└── README.md
```

---

## 👨‍💻 Team

**The Zenithers** — SRM Institute of Science and Technology, Chennai

| Name | Role |
|---|---|
| Arnav | Full-stack development + ML integration |
| Akash Gupta | Backend architecture + infrastructure |
| Aditya Pratap | Frontend + UI/UX |
| Anshdeep Sharma | ML pipelines + data |
| Senjuti Chhatait | Research + product strategy |

---

## 🛡️ Adversarial Defense & Anti-Spoofing Strategy

> **Threat scenario:** A coordinated syndicate of delivery workers organizes via Telegram, uses GPS-spoofing apps to fake their location inside a red-alert weather zone, and files mass simultaneous claims to drain the liquidity pool — while sitting safely at home.

Simple GPS verification is not enough. Sambal's defense operates across three layers.

---

### 1. Differentiation — Genuine Worker vs. GPS Spoofer

A real delivery worker caught in a disruption leaves a **coherent digital trail across multiple independent systems simultaneously.** A spoofer can fake GPS coordinates — but they cannot simultaneously fake all of the following:

| Signal | Genuine Stranded Worker | GPS Spoofer |
|---|---|---|
| **GPS coordinates** | Inside disruption zone | Spoofed to show inside zone |
| **Device sensor data** | Accelerometer flat (stationary), no motion | Often shows movement or unnatural stillness |
| **Network cell tower ID** | Tower physically located in disruption zone | Tower ID from actual home location — mismatches GPS |
| **Platform app heartbeat** | App reporting online from disruption zone | App may show a different last-known server-ping location |
| **Delivery history prior 2 hours** | Active deliveries stopping suddenly at disruption onset | No prior delivery activity — was never in the zone |
| **Battery / charging state** | Often on low battery, outdoor device behaviour | Device often on charge, stationary home pattern |
| **IP geolocation** | Mobile data IP resolving to disruption area cell node | Home WiFi IP resolving to a different neighbourhood |

**The core ML signal:** Sambal's fraud engine does not rely on GPS alone. It builds a **location coherence score** — a composite of how consistently the worker's GPS, cell tower, IP address, and platform heartbeat *all agree with each other*. A spoofer can align one signal. Aligning four independent signals simultaneously is practically impossible without physical presence.

> **Model:** An ensemble combining rule-based coherence checks with a trained anomaly detector (Isolation Forest) that has learned what a "real disruption signature" looks like across all signals together — not individually.

---

### 2. Data Points — Detecting a Coordinated Fraud Ring

A single spoofed claim is hard to catch. A **ring of 50–500 people spoofing simultaneously** creates unmistakable statistical patterns that Sambal monitors in real time:

**Account-level signals:**
- Account age < 3 weeks at time of claim
- Zero completed deliveries on the platform in the 48 hours before the claim
- Policy purchased within 72 hours of a major weather forecast (opportunistic enrollment)
- Multiple accounts registered from the same device fingerprint or same home WiFi IP

**Temporal & geographic clustering signals:**
- Sudden spike in claims from a single zone that is statistically disproportionate to the number of active workers historically registered in that zone
- Claims filed within a narrow time window (e.g., 80% of claims arrive within 11 minutes of each other — indicative of a coordinated Telegram trigger, not organic individual detection)
- Workers claiming from Zone X who have **never completed a single delivery in Zone X** in their platform history

**Network graph signals:**
- Graph analysis of device fingerprints, shared IPs, and phone numbers to surface connected clusters — if 40 claimants all share overlapping registration metadata, that is a ring, not a coincidence
- Unusual referral patterns: if 30 new accounts were all onboarded via the same referral link in the 5 days before a weather event, the ring likely recruited specifically for the event

**The baseline comparison test:**
For every major disruption event, Sambal compares the claim rate against the **historical delivery activity rate** for that zone. If Zone 4 typically has 200 active delivery workers during monsoon evenings, but 480 claims arrive for a single event, the excess 280 are automatically escalated for enhanced review — regardless of individual GPS signals.

---

### 3. UX Balance — Protecting Honest Workers from False Flags

This is the most important design constraint. An overly aggressive fraud system that delays or denies genuine claims is worse than a slightly leaky one — it destroys trust among the exact users we are trying to protect.

**The principle:** Default to trust, escalate only on multi-signal evidence.

**Tiered response system:**

| Risk Level | Trigger Condition | Worker Experience |
|---|---|---|
| ✅ **Low** | All coherence signals align, no ring patterns, clean history | Auto-approved. Payout in < 10 minutes. No friction. |
| 🟡 **Medium** | 1–2 weak anomaly signals (e.g., minor cell tower mismatch, first-time claim) | Auto-approved with a **soft flag** logged internally. Worker sees no difference. Reviewed in background. |
| 🟠 **Elevated** | Multiple weak signals OR account age < 2 weeks | Claim approved but payout held for **2 hours** while an automated secondary check runs. Worker is told: *"Your claim is being processed — you'll receive your payout within 2 hours."* No accusation, no form. |
| 🔴 **High** | Strong coherence mismatch (GPS vs cell tower conflict) OR part of a detected cluster ring | Claim paused. Worker receives: *"We need a moment to verify your claim. We'll update you within 4 hours."* A human reviewer is notified. |

**Why this works for honest workers in bad weather:**

Bad weather is precisely when network signals degrade. A genuine worker in a flood zone may have:
- Intermittent GPS signal (phone switching between satellite and network-assisted location)
- Cell tower handoff as they move to shelter
- Slow platform heartbeat due to poor connectivity

Sambal accounts for this explicitly. **Signal degradation during a verified weather event lowers — not raises — the suspicion threshold.** The system is calibrated to expect noisy signals in the exact conditions it covers. A GPS hiccup during a Red Alert rainstorm is normal. A GPS hiccup on a clear Tuesday afternoon is suspicious.

**The appeal path:**
Any worker whose claim is paused receives a simple one-tap appeal option in the app. They can submit one piece of corroborating evidence — a photo, a screenshot of the platform showing no assignments, or a voice note. This is processed within 4 hours. If approved on appeal, the worker receives their payout plus a ₹25 goodwill credit for the inconvenience.

> **Design philosophy:** Sambal treats every flagged worker as innocent until the ring pattern — not the individual — is proven. We penalise coordinated rings. We never penalise connectivity.

---

## 📊 Business Viability

| Metric | Value |
|---|---|
| Addressable market | 12M+ active gig delivery workers in India |
| Average weekly premium | ₹38 – ₹52 |
| Annualised revenue per worker | ₹1,976 – ₹2,704 |
| Target loss ratio | <60% (parametric industry benchmark: 55–65%) |
| Distribution cost | Near-zero via platform WhatsApp integration |
| Reinsurance path | Parametric product — compatible with Cat XL reinsurance treaties in India's non-life insurance market |

---

*Sambal — so that the people who keep the city moving don't fall through the cracks.*

**The Zenithers · SRMIST Chennai · Guidewire DEVTrails 2026**
